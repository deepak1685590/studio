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
import {openAI} from '@genkit-ai/openai';

export const ai = genkit({
  plugins: [openAI({
    apiKey: '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',
    baseURL: 'https://api.x.ai/v1'
  })],
  model: 'openai/grok-beta',
});
