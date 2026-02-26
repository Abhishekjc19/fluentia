import fs from 'fs';
import path from 'path';
import * as pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

interface ResumeParseResult {
  success: boolean;
  full_text?: string;
  line_count?: number;
  char_count?: number;
  preview?: string;
  error?: string;
}

/**
 * Parse PDF resume using pdf-parse
 * @param filePath - Absolute path to the PDF file
 * @returns Parsed text content
 */
async function parsePDF(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  // @ts-ignore - pdf-parse type definition issue
  const data = await pdfParse(dataBuffer);
  return data.text;
}

/**
 * Parse DOCX resume using mammoth
 * @param filePath - Absolute path to the DOCX file
 * @returns Parsed text content
 */
async function parseDOCX(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

/**
 * Parse TXT resume
 * @param filePath - Absolute path to the TXT file
 * @returns Parsed text content
 */
async function parseTXT(filePath: string): Promise<string> {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * Parse resume file using Node.js (no Python required)
 * @param filePath - Absolute path to the resume file
 * @returns Parsed resume content
 */
export async function parseResume(filePath: string): Promise<ResumeParseResult> {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: `File not found: ${filePath}` };
    }

    const ext = path.extname(filePath).toLowerCase();
    let text = '';

    switch (ext) {
      case '.pdf':
        text = await parsePDF(filePath);
        break;
      case '.docx':
      case '.doc':
        text = await parseDOCX(filePath);
        break;
      case '.txt':
        text = await parseTXT(filePath);
        break;
      default:
        return { success: false, error: `Unsupported file format: ${ext}` };
    }

    if (!text || text.trim().length === 0) {
      return { success: false, error: 'No text content found in file' };
    }

    const lines = text.split('\n').filter((line) => line.trim());

    return {
      success: true,
      full_text: text,
      line_count: lines.length,
      char_count: text.length,
      preview: text.substring(0, 500),
    };
  } catch (error: any) {
    console.error('Resume parsing error:', error);
    return {
      success: false,
      error: error.message || 'Failed to parse resume',
    };
  }
}

/**
 * Generate interview questions based on resume content
 * @param resumeText - Extracted text from resume
 * @param interviewType - Type of interview (tech/hr)
 * @returns Prompt for AI model
 */
export function generateResumeBasedPrompt(
  resumeText: string,
  interviewType: 'tech' | 'hr',
  questionCount: number
): string {
  const resumePreview = resumeText.substring(0, 2000); // Limit to avoid token limits

  if (interviewType === 'tech') {
    return `Based on the following candidate's resume, generate ${questionCount} technical interview questions that are relevant to their experience, skills, and background. Focus on their technical skills, projects, and technologies mentioned.

Resume Content:
${resumePreview}

Generate ${questionCount} personalized technical questions that:
1. Test their knowledge of technologies they claim to know
2. Ask about specific projects they've worked on
3. Evaluate their problem-solving abilities based on their experience level
4. Are appropriate for their background and seniority

Return only the questions, one per line, numbered.`;
  } else {
    return `Based on the following candidate's resume, generate ${questionCount} HR interview questions that are relevant to their career history, experiences, and professional background.

Resume Content:
${resumePreview}

Generate ${questionCount} personalized HR questions that:
1. Explore their career transitions and choices
2. Ask about specific roles and responsibilities they've mentioned
3. Evaluate their achievements and leadership experiences
4. Assess cultural fit based on their background

Return only the questions, one per line, numbered.`;
  }
}
