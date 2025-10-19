import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {GEMINI_API_KEY} from '@/config';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: GEMINI_API_KEY,
      models: [
        'gemini-1.5-pro-latest',
        'gemini-1.5-flash-latest',
        'gemini-pro-vision',
      ],
    }),
  ],
});
