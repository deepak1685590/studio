import {genkit} from 'genkit';
import {openrouter} from '@genkit-ai/openrouter';
import {OPENROUTER_API_KEY} from '@/config';

export const ai = genkit({
  plugins: [
    openrouter({
      apiKey: OPENROUTER_API_KEY,
    }),
  ],
  model: 'google/gemini-flash-1.5',
});
