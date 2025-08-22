'use server';

/**
 * @fileOverview AI-powered insight generator for SmartSignal Pro analysis.
 *
 * - generateAiInsight - A function that generates AI insights for trading opportunities.
 * - GenerateAiInsightInput - The input type for the generateAiInsight function.
 * - GenerateAiInsightOutput - The return type for the generateAiInsight function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAiInsightInputSchema = z.object({
  symbol: z.string().describe('The symbol of the asset (e.g., BTC, ETH).'),
  price: z.number().describe('The current price of the asset.'),
  isBullish: z.boolean().describe('Whether the trend is bullish or bearish.'),
  action: z.string().describe('The recommended action (e.g., Buy on Pullback, Sell on Rally).'),
  entry: z.number().describe('The entry price for the trade.'),
  sl: z.number().describe('The stop-loss price for the trade.'),
  tp1: z.number().describe('The take-profit 1 price for the trade.'),
  confluenceCount: z.number().describe('The number of confluence factors supporting the trade.'),
  demandZone: z.string().describe('The demand zone for the asset.'),
  fvg: z.string().describe('The fair value gap for the asset.'),
  volumeImbalance: z.string().describe('The volume imbalance in the market.'),
});
export type GenerateAiInsightInput = z.infer<typeof GenerateAiInsightInputSchema>;

const GenerateAiInsightOutputSchema = z.object({
  insight: z.string().describe('The AI-generated insight summarizing the trading opportunity.'),
});
export type GenerateAiInsightOutput = z.infer<typeof GenerateAiInsightOutputSchema>;

export async function generateAiInsight(input: GenerateAiInsightInput): Promise<GenerateAiInsightOutput> {
  return generateAiInsightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAiInsightPrompt',
  input: {schema: GenerateAiInsightInputSchema},
  output: {schema: GenerateAiInsightOutputSchema},
  prompt: `You are ELITE-AI, a world-class trading strategist with 20 years of institutional experience.
Analyze this {{symbol}} setup and deliver a single, powerful paragraph that sounds like a Bloomberg Pro Terminal alert.
Structure:
- Start with: \"Strong [bullish/bearish] setup presents itself...\"
- Mention price, entry, SL, TP, confluence count
- Highlight demand/supply zones and FVG
- Note volume bias
- End with a sharp, confident conclusion
Tone: Professional, urgent, elite. Use Markdown formatting.

Data:
Price: \${{price}}
Trend: {{#if isBullish}}Bullish{{else}}Bearish{{/if}}
Action: {{action}}
Entry: \${{entry}}, SL: \${{sl}}, TP1: \${{tp1}}
Confluence: {{confluenceCount}} factors
Demand Zone: {{demandZone}}
FVG: {{fvg}}
Volume: {{volumeImbalance}}`,
});

const generateAiInsightFlow = ai.defineFlow(
  {
    name: 'generateAiInsightFlow',
    inputSchema: GenerateAiInsightInputSchema,
    outputSchema: GenerateAiInsightOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      insight: output!.insight,
    };
  }
);
