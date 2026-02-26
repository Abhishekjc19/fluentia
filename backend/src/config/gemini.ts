import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

export const genAI = new GoogleGenerativeAI(apiKey);

// Get the generative model - using Gemini 2.5 Flash (has better quota availability)
export const getModel = (modelName: string = 'gemini-2.5-flash') => {
  return genAI.getGenerativeModel({ model: modelName });
};
