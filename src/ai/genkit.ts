import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {GEMINI_API_KEY} from '@/config';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: GEMINI_API_KEY,
    }),
  ],
});
