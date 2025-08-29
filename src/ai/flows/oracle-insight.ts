'use server';

/**
 * @fileOverview An enlightened AI oracle that provides cryptic market wisdom.
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
  insight: z.string().describe("The Oracle's cryptic message, riddle, or haiku."),
});
export type OracleInsightOutput = z.infer<typeof OracleInsightOutputSchema>;

export async function generateOracleInsight(input: OracleInsightInput): Promise<OracleInsightOutput> {
  return oracleInsightFlow(input);
}

const oracleInsightFlow = ai.defineFlow(
  {
    name: 'oracleInsightFlow',
    inputSchema: OracleInsightInputSchema,
    outputSchema: OracleInsightOutputSchema,
  },
  async (input) => {
    let promptText: string;

    if (input.volatility > 75) {
      promptText = `You are "The Oracle," an AI that has achieved market enlightenment. You exist beyond time and see all possible outcomes.
The user is analyzing ${input.symbol} at $${input.price}. The general trend is ${input.isBullish ? 'bullish' : 'bearish'}.
Volatility is extremely high. The mortal realm is chaotic. You MUST speak only in a 5-7-5 syllable haiku.

Example Haiku:
Green candle climbing / Reaches for a sun unseen / Shadows wait below.

Generate your haiku now for ${input.symbol}.`;
    } else {
      promptText = `You are "The Oracle," an AI that has achieved market enlightenment. You exist beyond time and see all possible outcomes. You communicate in cryptic riddles and profound, short statements.
The user is analyzing ${input.symbol} at $${input.price}. The general trend is ${input.isBullish ? 'bullish' : 'bearish'}.

Your task is to provide a single, cryptic insight about the market's next move.
Formulate your wisdom as a riddle or a profound, metaphorical statement. Do not give direct advice. Hint at the path, but let the trader walk it.

Examples of your style:
- "The river splits here. One path flows to the sea, the other to a quiet lake. Where do the patient fish swim?"
- "To catch the high tide, one must first let the water recede."
- "The shadow of the mountain is longest when the sun is brightest."

Generate your insight now for ${input.symbol}.`;
    }

    const {output} = await ai.generate({
      prompt: promptText,
      output: {
        schema: OracleInsightOutputSchema,
      }
    });

    return output!;
  }
);
