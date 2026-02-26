import { create } from 'zustand';
import { Interview, Question, Answer } from '../types';

interface InterviewState {
  currentInterview: Interview | null;
  questions: Question[];
  answers: Answer[];
  currentQuestionIndex: number;
  setInterview: (interview: Interview, questions: Question[]) => void;
  addAnswer: (answer: Answer) => void;
  nextQuestion: () => void;
  reset: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  currentInterview: null,
  questions: [],
  answers: [],
  currentQuestionIndex: 0,
  setInterview: (interview, questions) => 
    set({ currentInterview: interview, questions, answers: [], currentQuestionIndex: 0 }),
  addAnswer: (answer) => 
    set((state) => ({ answers: [...state.answers, answer] })),
  nextQuestion: () => 
    set((state) => ({ currentQuestionIndex: state.currentQuestionIndex + 1 })),
  reset: () => 
    set({ currentInterview: null, questions: [], answers: [], currentQuestionIndex: 0 }),
}));
