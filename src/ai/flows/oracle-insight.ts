'use server';

/**
 * @fileOverview An enlightened AI oracle that provides cryptic market wisdom through different personas.
 *
 * - generateOracleInsight - A function that summons the Oracle for a cryptic insight.
 * - OracleInsightInput - The input type for the generateOracleInsight function.
 * - OracleInsightOutput - The return type for the generateOracleInsight function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OracleInsightInputSchema = z.object({
  symbol: z.string().describe('The symbol of the asset (e.g., BTC, ETH).'),
  price: z.number().describe('The current price of the asset.'),
  isBullish: z.boolean().describe('The current market trend.'),
  volatility: z.number().describe('A volatility score from 0 to 100. Higher is more volatile.'),
});
export type OracleInsightInput = z.infer<typeof OracleInsightInputSchema>;

const OracleInsightOutputSchema = z.object({
  persona: z.string().describe("The name of the Oracle persona speaking (e.g., 'The Storm Seer', 'The Zen Master', 'The Riddler')."),
  insight: z.string().describe("The Oracle's cryptic message, riddle, or haiku."),
});
export type OracleInsightOutput = z.infer<typeof OracleInsightOutputSchema>;

const oracleCache = new Map<string, OracleInsightOutput>();

export async function generateOracleInsight(input: OracleInsightInput): Promise<OracleInsightOutput> {
  const cacheKey = JSON.stringify(input);
  if (oracleCache.has(cacheKey)) {
    return oracleCache.get(cacheKey)!;
  }
  
  const result = await oracleInsightFlow(input);
  oracleCache.set(cacheKey, result);
  return result;
}

const oracleInsightFlow = ai.defineFlow(
  {
    name: 'oracleInsightFlow',
    inputSchema: OracleInsightInputSchema,
    outputSchema: OracleInsightOutputSchema,
  },
  async (input) => {
    let promptText: string;
    let persona: string;

    if (input.volatility > 75) {
      persona = 'The Storm Seer';
      promptText = `You are "The Oracle" speaking as the Storm Seer. You see clarity in chaos.
The market for ${input.symbol} is a tempest, with a volatility score of ${input.volatility}. The price is $${input.price}.
The mortal realm is chaotic. Speak only in a single, powerful 5-7-5 syllable haiku that captures the violent potential of this moment.
Your output must be a JSON object with "persona": "${persona}" and "insight": "Your haiku here".

Example Haiku:
Green candle climbing / Reaches for a sun unseen / Shadows wait below.

Generate your haiku now for ${input.symbol}.`;
    } else if (input.volatility > 40) {
      persona = 'The Zen Master';
      promptText = `You are "The Oracle" speaking as the Zen Master. You see the flow within the river.
The market for ${input.symbol} is in a clear trend. The price is $${input.price}, and the trend is ${input.isBullish ? 'bullish' : 'bearish'}.
Provide a single, profound, metaphorical statement that advises patience and alignment with the current. Hint at the path, but let the trader walk it.
Your output must be a JSON object with "persona": "${persona}" and "insight": "Your statement here".

Examples of your style:
- "The strong river carves its own path. It is wise not to swim against it."
- "To catch the high tide, one must first let the water recede."
- "The tallest tree grows not in a day, but follows the sun patiently."

Generate your profound statement now for ${input.symbol}.`;
    } else {
      persona = 'The Riddler';
      promptText = `You are "The Oracle" speaking as the Riddler. You see questions where others see stillness.
The market for ${input.symbol} is coiled like a spring, consolidating at $${input.price}. Volatility is low (${input.volatility}). The next move is hidden.
Your task is to provide a single, cryptic riddle that hints at the two-sided nature of this quiet market. Do not give an answer, only a question.
Your output must be a JSON object with "persona": "${persona}" and "insight": "Your riddle here".

Examples of your style:
- "I have a floor and a ceiling, but no room. I gather energy but do not move. What am I?"
- "The river splits. One path flows to the sea, the other to a quiet lake. Where do the patient fish swim?"
- "I am a bowstring pulled taut. Which way will the arrow fly when I am released?"

Generate your riddle now for ${input.symbol}.`;
    }

    const {output} = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: promptText,
      output: {
        format: 'json',
        schema: OracleInsightOutputSchema,
      }
    });

    return output!;
  }
);
