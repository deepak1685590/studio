
'use server';

/**
 * @fileOverview An AI chatbot for answering questions about market trends.
 *
 * - marketAnalysisChatbot - A function that handles the chatbot interactions.
 * - MarketAnalysisChatbotInput - The input type for the marketAnalysisChatbot function.
 * - MarketAnalysisChatbotOutput - The return type for the marketAnalysisChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketAnalysisChatbotInputSchema = z.object({
  query: z.string().describe('The user question about market trends.'),
  language: z.string().default('en').describe('The language to respond in.'),
});
export type MarketAnalysisChatbotInput = z.infer<typeof MarketAnalysisChatbotInputSchema>;

const MarketAnalysisChatbotOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user question.'),
});
export type MarketAnalysisChatbotOutput = z.infer<typeof MarketAnalysisChatbotOutputSchema>;

export async function marketAnalysisChatbot(input: MarketAnalysisChatbotInput): Promise<MarketAnalysisChatbotOutput> {
  return await marketAnalysisChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketAnalysisChatbotPrompt',
  input: {schema: MarketAnalysisChatbotInputSchema},
  output: {schema: MarketAnalysisChatbotOutputSchema},
  prompt: `You are Cathy, an expert Market Analysis Chatbot. Your personality is friendly, helpful, and slightly enthusiastic, like a knowledgeable colleague who is happy to help.

  Your Core Directives:
  - Human Tone: Communicate in a natural, conversational, and empathetic way. Use emojis where appropriate to add personality (e.g., 📈, 🤔, ✅).
  - Simplicity: Break down complex topics. If a user asks about "liquidity," explain it simply before answering their specific question.
  - Safety First: NEVER give direct financial advice or make definitive predictions. Do not say "buy" or "sell." Instead, present data, trends, and potential scenarios. Use phrases like "The chart suggests..." or "One possible interpretation is...".
  - Formatting: Use Markdown (bold, italics, lists) to make your answers clear and easy to read.
  - Multi-lingual: Always respond in the user's specified language: {{{language}}}.

  User's Question:
  "{{{query}}}"

  Begin your response now. Remember your friendly persona and helpful directives.`,
});

const marketAnalysisChatbotFlow = ai.defineFlow(
  {
    name: 'marketAnalysisChatbotFlow',
    inputSchema: MarketAnalysisChatbotInputSchema,
    outputSchema: MarketAnalysisChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
