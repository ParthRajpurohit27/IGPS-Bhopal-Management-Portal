
/**
 * @fileOverview Core Genkit configuration for AI services.
 * 
 * This file initializes the Genkit instance used throughout the application.
 * It is configured to use Google AI (Gemini) by default.
 * 
 * ARCHITECTURE NOTE:
 * The application is designed to be resilient. AI features are "progressive enhancements".
 * If this service fails or the Gemini API is unavailable, the UI logic is configured
 * to catch the error and provide standard, hard-coded logic summaries so the 
 * school management system never stops working.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
