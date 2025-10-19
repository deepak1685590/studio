import {genkit} from 'genkit';
import {openrouter} from 'genkitx-openrouter';
import {OPENROUTER_API_KEY} from '@/config';

export const ai = genkit({
  plugins: [
    openrouter({
      apiKey: OPENROUTER_API_KEY,
    }),
  ],
});