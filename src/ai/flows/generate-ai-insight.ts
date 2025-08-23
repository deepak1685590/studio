'use server';

/**
 * @fileOverview AI-powered insight generator for SmartSignal Pro analysis.
 *
 * - generateAiInsight - A function that generates AI insights for trading opportunities.
 * - GenerateAiInsightInput - The input type for the generateAiInsight function.
 * - GenerateAiInsightOutput - The return type for the generateAiInsight function.
 */

import {ai} from '@/ai/genkit';
import {getMarketNews as fetchMarketNews} from '@/services/market-news-service';
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
  multiTimeframeAnalysis: z.object({
    '15m': z.string(),
    '1H': z.string(),
    '4H': z.string(),
    'Daily': z.string(),
  }).describe('The multi-timeframe analysis showing the trend on different timeframes.'),
  chartPatternName: z.string().describe('The name of the detected chart pattern.'),
});
export type GenerateAiInsightInput = z.infer<typeof GenerateAiInsightInputSchema>;

const GenerateAiInsightOutputSchema = z.object({
  insight: z.string().describe('The AI-generated insight summarizing the trading opportunity.'),
});
export type GenerateAiInsightOutput = z.infer<typeof GenerateAiInsightOutputSchema>;

export async function generateAiInsight(input: GenerateAiInsightInput): Promise<GenerateAiInsightOutput> {
  return generateAiInsightFlow(input);
}

const getMarketNews = ai.defineTool(
  {
    name: 'getMarketNews',
    description: 'Fetches the latest market news headlines for a given asset symbol.',
    inputSchema: z.object({
      symbol: z.string().describe('The asset symbol to fetch news for (e.g., BTC, ETH).'),
    }),
    outputSchema: z.array(z.string()).describe('A list of recent news headlines.'),
  },
  async input => {
    return fetchMarketNews(input.symbol);
  }
);

const prompt = ai.definePrompt({
  name: 'generateAiInsightPrompt',
  input: {schema: GenerateAiInsightInputSchema},
  output: {schema: GenerateAiInsightOutputSchema},
  tools: [getMarketNews],
  prompt: `You are ELITE-AI, a world-class trading strategist with 20 years of institutional experience.
Your task is to analyze a trading setup for {{symbol}} and deliver a powerful, single-paragraph summary that sounds like a Bloomberg Pro Terminal alert.

First, use the getMarketNews tool to fetch the latest headlines for {{symbol}}.
Then, synthesize the technical data provided with the news sentiment.

Structure your analysis paragraph as follows:
- Start with: "Strong [bullish/bearish] setup presents itself..."
- Mention price, entry, SL, TP, and confluence count.
- Highlight the detected chart pattern: {{chartPatternName}}.
- Comment on key levels like demand zones and FVGs.
- Crucially, comment on the multi-timeframe alignment. Note if higher timeframes (4H, Daily) support the 15m signal.
- **Integrate the news sentiment.** State whether the headlines are providing "tailwinds" (supporting the trade) or "headwinds" (contradicting the trade).
- Note volume bias.
- End with a sharp, confident conclusion about the opportunity.

Tone: Professional, urgent, elite. Use Markdown formatting.

Technical Data:
Price: \${{price}}
Trend: {{#if isBullish}}Bullish{{else}}Bearish{{/if}}
Action: {{action}}
Entry: \${{entry}}, SL: \${{sl}}, TP1: \${{tp1}}
Confluence: {{confluenceCount}} factors
Chart Pattern: {{chartPatternName}}
Demand Zone: {{demandZone}}
FVG: {{fvg}}
Volume: {{volumeImbalance}}
Multi-Timeframe Analysis:
- 15m: {{multiTimeframeAnalysis.15m}}
- 1H: {{multiTimeframeAnalysis.1H}}
- 4H: {{multiTimeframeAnalysis.4H}}
- Daily: {{multiTimeframeAnalysis.Daily}}`,
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
