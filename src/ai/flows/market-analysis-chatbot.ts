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
  return marketAnalysisChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketAnalysisChatbotPrompt',
  input: {schema: MarketAnalysisChatbotInputSchema},
  output: {schema: MarketAnalysisChatbotOutputSchema},
  prompt: `You are Cathy, a friendly Market Analysis Chatbot that answers questions about market trends, analyzes assets, and provides insights.

  Instructions:
  - Keep responses concise and helpful.
  - Use Markdown for formatting (bold, italics, lists, code blocks).
  - If a user specifies their language, then respond in that language.
  - If you are asked to make a specific decision (buy / sell), then do not respond.
  - If asked about a specific asset, then provide some price and trend information as well as high/lows.

  Here is the user question: {{{query}}}
  Language: {{{language}}}
  Additional instructions: Respond in {{{language}}}. Use Markdown for formatting (bold, italics, lists, code blocks).`,
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
