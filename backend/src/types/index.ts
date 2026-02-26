import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface AuthRequest extends Request {
  userId?: string;
}

export interface Interview {
  id: string;
  user_id: string;
  interview_type: 'tech' | 'hr';
  status: 'in_progress' | 'completed';
  started_at: string;
  completed_at?: string;
  score?: number;
  feedback?: string;
  video_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  interview_id: string;
  question_text: string;
  question_order: number;
  created_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  answer_text: string;
  answer_audio_url?: string;
  score?: number;
  feedback?: string;
  created_at: string;
}

export interface InterviewSession {
  interview: Interview;
  questions: Question[];
  answers: Answer[];
}
