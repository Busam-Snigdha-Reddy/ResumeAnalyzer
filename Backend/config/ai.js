import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey || apiKey === 'your_gemini_api_key_here') {
  console.warn('WARNING: GEMINI_API_KEY is not configured in .env. AI features will fallback to mock results.');
}

export const aiClient = apiKey && apiKey !== 'your_gemini_api_key_here'
  ? new GoogleGenAI({ apiKey })
  : null;
