import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { supabaseAdmin } from '../config/supabase';
import { getModel } from '../config/gemini';
import { uploadToS3, getPresignedUrl } from '../config/aws';
import { parseResume, generateResumeBasedPrompt } from '../utils/resumeParser';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../../uploads/resumes');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, DOC, and TXT files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Mock questions for fallback when Gemini API is unavailable
const getMockQuestions = (interviewType: string, count: number): string[] => {
  const techQuestions = [
    'Explain the difference between var, let, and const in JavaScript.',
    'What is the purpose of closures in JavaScript? Provide an example.',
    'Describe the concept of RESTful API design and its key principles.',
    'What are the differences between SQL and NoSQL databases? When would you use each?',
    'Explain the concept of asynchronous programming and how Promises work in JavaScript.',
    'What is the difference between authentication and authorization?',
    'Describe the SOLID principles in object-oriented programming.',
    'How does Git branching work? Explain merge vs rebase.',
  ];

  const hrQuestions = [
    'Tell me about yourself and your professional background.',
    'What motivates you in your career and what are your long-term goals?',
    'Describe a challenging situation you faced at work and how you resolved it.',
    'How do you handle conflicts or disagreements with team members?',
    'What is your approach to learning new technologies or skills?',
    'Why are you interested in this position and our company?',
    'Describe a time when you had to work under pressure to meet a deadline.',
    'What are your greatest strengths and areas for improvement?',
  ];

  const questions = interviewType === 'tech' ? techQuestions : hrQuestions;
  return questions.slice(0, count);
};

/**
 * Start a new interview with optional resume upload
 * POST /api/interviews/start
 * Supports multipart/form-data with resume file
 */
router.post(
  '/start',
  authenticateToken,
  upload.single('resume'),
  [body('interview_type').isIn(['tech', 'hr'])],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { interview_type } = (req as any).body;
      const userId = req.user?.id;
      const resumeFile = req.file;

      // Parse resume if provided
      let resumeText = '';
      let resumeParsed = false;
      if (resumeFile) {
        console.log('Resume uploaded:', resumeFile.filename);
        try {
          const parseResult = await parseResume(resumeFile.path);
          if (parseResult.success && parseResult.full_text) {
            resumeText = parseResult.full_text;
            resumeParsed = true;
            console.log('Resume parsed successfully, length:', resumeText.length);
          } else {
            console.warn('Resume parsing failed:', parseResult.error);
          }
          // Clean up uploaded file after parsing
          fs.unlinkSync(resumeFile.path);
        } catch (parseError: any) {
          console.error('Resume parse error:', parseError);
          // Continue without resume if parsing fails
        }
      }

      // Create interview record
      const { data: interview, error } = await supabaseAdmin
        .from('interviews')
        .insert([
          {
            user_id: userId,
            interview_type,
            status: 'in_progress',
            started_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Generate questions using Gemini AI with fallback to mock questions
      const questionCount = interview_type === 'tech' ? 5 : 5;
      let questionLines: string[] = [];

      try {
        const model = getModel();

        // Use resume-based prompt if resume was parsed successfully
        const prompt =
          resumeParsed && resumeText
            ? generateResumeBasedPrompt(resumeText, interview_type, questionCount)
            : interview_type === 'tech'
              ? `Generate ${questionCount} technical interview questions for a software developer position. 
             Include questions about programming concepts, data structures, algorithms, and problem-solving.
             Return only the questions, one per line, numbered.`
              : `Generate ${questionCount} HR interview questions for evaluating a candidate's soft skills, 
             cultural fit, and professional background. Include questions about experience, teamwork, 
             conflict resolution, and career goals. Return only the questions, one per line, numbered.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const questionsText = response.text();

        // Parse questions from AI response
        questionLines = questionsText
          .split('\n')
          .filter((line) => line.trim())
          .map((line) => line.replace(/^\d+[\.\)]\s*/, '').trim())
          .filter((line) => line.length > 0)
          .slice(0, questionCount);
      } catch (aiError: any) {
        // Fallback to mock questions if AI fails (e.g., quota exceeded)
        console.log('Using mock questions due to AI service error:', aiError.message);
        questionLines = getMockQuestions(interview_type, questionCount);
      }

      // Ensure we have questions to insert
      if (questionLines.length === 0) {
        questionLines = getMockQuestions(interview_type, questionCount);
      }

      // Parse questions and save to database
      const questionsToInsert = questionLines.map((text, index) => ({
        interview_id: interview.id,
        question_text: text,
        question_order: index + 1,
      }));

      const { data: questions, error: questionsError } = await supabaseAdmin
        .from('questions')
        .insert(questionsToInsert)
        .select();

      if (questionsError) {
        throw questionsError;
      }

      res.json({
        message: 'Interview started successfully',
        interview,
        questions,
        resumeBasedQuestions: resumeParsed,
      });
    } catch (error) {
      console.error('Start interview error:', error);
      // Clean up uploaded file if error occurs
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('Failed to cleanup file:', cleanupError);
        }
      }
      res.status(500).json({ error: 'Failed to start interview' });
    }
  }
);

/**
 * Submit answer to a question
 * POST /api/interviews/answer
 */
router.post(
  '/answer',
  authenticateToken,
  upload.single('audio'),
  [body('question_id').isUUID(), body('answer_text').notEmpty()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { question_id, answer_text } = (req as any).body;
      const audioFile = req.file;

      let audioUrl: string | undefined;

      // Upload audio to S3 if provided
      if (audioFile) {
        const key = `answers/${uuidv4()}.webm`;
        audioUrl = await uploadToS3(audioFile.buffer, key, audioFile.mimetype);
      }

      // Get question text for evaluation
      const { data: question } = await supabaseAdmin
        .from('questions')
        .select('question_text')
        .eq('id', question_id)
        .single();

      // Evaluate answer using Gemini AI with fallback
      let score = 7; // Default score if AI evaluation fails
      let feedback =
        'Your answer has been recorded. AI evaluation is temporarily unavailable due to API quota limits. Your response will be reviewed.';

      try {
        const model = getModel();
        const evaluationPrompt = `
        Interview Question: ${question?.question_text}
        Candidate's Answer: ${answer_text}
        
        Evaluate this answer on a scale of 0-10 and provide constructive feedback.
        Format your response as:
        Score: [0-10]
        Feedback: [Your detailed feedback]
      `;

        const result = await model.generateContent(evaluationPrompt);
        const response = await result.response;
        const evaluation = response.text();

        // Parse score and feedback
        const scoreMatch = evaluation.match(/Score:\s*(\d+)/i);
        const feedbackMatch = evaluation.match(/Feedback:\s*(.+)/is);

        score = scoreMatch ? parseInt(scoreMatch[1]) : 7;
        feedback = feedbackMatch ? feedbackMatch[1].trim() : evaluation;
      } catch (aiError: any) {
        // Log AI error but continue with default values
        console.log('AI evaluation unavailable, using default values:', aiError.message);
      }

      // Save answer to database
      const { data: answer, error } = await supabaseAdmin
        .from('answers')
        .insert([
          {
            question_id,
            answer_text,
            answer_audio_url: audioUrl,
            score,
            feedback,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.json({
        message: 'Answer submitted successfully',
        answer: {
          ...answer,
          score,
          feedback,
        },
      });
    } catch (error) {
      console.error('Submit answer error:', error);
      res.status(500).json({ error: 'Failed to submit answer' });
    }
  }
);

/**
 * Complete interview and get final results
 * POST /api/interviews/:interviewId/complete
 */
router.post(
  '/:interviewId/complete',
  authenticateToken,
  upload.single('video'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { interviewId } = (req as any).params;
      const videoFile = req.file;

      let videoUrl: string | undefined;

      // Upload video recording to S3
      if (videoFile) {
        const key = `recordings/${interviewId}/${uuidv4()}.webm`;
        videoUrl = await uploadToS3(videoFile.buffer, key, videoFile.mimetype);
      }

      // Get all answers for this interview
      const { data: questions } = await supabaseAdmin
        .from('questions')
        .select('id')
        .eq('interview_id', interviewId);

      if (!questions) {
        res.status(404).json({ error: 'Interview not found' });
        return;
      }

      const questionIds = questions.map((q) => q.id);

      const { data: answers } = await supabaseAdmin
        .from('answers')
        .select('score, feedback')
        .in('question_id', questionIds);

      // Calculate average score
      const avgScore =
        answers && answers.length > 0
          ? answers.reduce((sum, a) => sum + (a.score || 0), 0) / answers.length
          : 0;

      // Generate overall feedback using Gemini with fallback
      let overallFeedback = `Interview completed with an average score of ${Math.round(avgScore * 10) / 10}/10. Your responses have been recorded. Detailed AI-generated feedback is temporarily unavailable due to API quota limits. Please check back later for comprehensive analysis.`;

      try {
        const model = getModel();
        const overallPrompt = `
          Based on the following interview answers and scores, provide an overall performance summary:
          ${answers?.map((a) => `Score: ${a.score}/10, Feedback: ${a.feedback}`).join('\n')}
          
          Provide a comprehensive summary of strengths, areas for improvement, and recommendations.
        `;

        const result = await model.generateContent(overallPrompt);
        const response = await result.response;
        overallFeedback = response.text();
      } catch (aiError: any) {
        console.log('AI overall feedback unavailable, using default summary:', aiError.message);
      }

      // Update interview record
      const { data: interview, error } = await supabaseAdmin
        .from('interviews')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          score: Math.round(avgScore * 10) / 10,
          feedback: overallFeedback,
          video_url: videoUrl,
        })
        .eq('id', interviewId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.json({
        message: 'Interview completed successfully',
        interview,
        results: {
          score: interview.score,
          feedback: interview.feedback,
          videoUrl: videoUrl ? getPresignedUrl(videoUrl.split('.com/')[1]) : undefined,
        },
      });
    } catch (error) {
      console.error('Complete interview error:', error);
      res.status(500).json({ error: 'Failed to complete interview' });
    }
  }
);

/**
 * Get interview details
 * GET /api/interviews/:interviewId
 */
router.get('/:interviewId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { interviewId } = (req as any).params;

    const { data: interview, error } = await supabaseAdmin
      .from('interviews')
      .select(
        `
          *,
          questions (
            *,
            answers (*)
          )
        `
      )
      .eq('id', interviewId)
      .single();

    if (error || !interview) {
      res.status(404).json({ error: 'Interview not found' });
      return;
    }

    // Generate presigned URL for video if exists
    if (interview.video_url) {
      interview.video_url = getPresignedUrl(interview.video_url.split('.com/')[1]);
    }

    res.json({ interview });
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({ error: 'Failed to get interview' });
  }
});

/**
 * Get user's interview history
 * GET /api/interviews
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const { data: interviews, error } = await supabaseAdmin
      .from('interviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({ interviews });
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({ error: 'Failed to get interviews' });
  }
});

export default router;
