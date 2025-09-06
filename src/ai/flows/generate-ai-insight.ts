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
    '5m': z.string(),
    '15m': z.string(),
    '1H': z.string(),
    '4H': z.string(),
    'Daily': z.string(),
  }).describe('The multi-timeframe analysis showing the trend on different timeframes.'),
  chartPatternName: z.string().describe('The name of the detected chart pattern.'),
  trendStrength: z.number().describe('A score from 0-100 indicating the strength of the current trend.'),
  momentum: z.number().describe('A score from 0-100 indicating the market momentum (e.g., from RSI).'),
});
export type GenerateAiInsightInput = z.infer<typeof GenerateAiInsightInputSchema>;

const GenerateAiInsightOutputSchema = z.object({
  executiveSummary: z.string().describe('A powerful, single-paragraph summary that sounds like a Bloomberg Pro Terminal alert. This is the primary, high-level insight.'),
  keyStrengths: z.array(z.string()).describe('A bulleted list of the key technical and fundamental strengths supporting this trading setup.'),
  potentialRisks: z.array(z.string()).describe('A bulleted list of potential risks, counter-arguments, or weaknesses in this setup.'),
  sentimentAndBias: z.object({
    newsSentiment: z.enum(['Bullish', 'Bearish', 'Neutral']).describe('The overall sentiment derived from the latest news headlines.'),
    volumeBias: z.enum(['Buying Pressure', 'Selling Pressure', 'Neutral']).describe('The dominant pressure indicated by volume analysis.'),
    momentum: z.string().describe('A rating of the current market momentum (e.g., "Strong Bullish", "Fading Bearish"). Based on the momentum score.'),
    trendStrength: z.string().describe('A rating of the current trend strength (e.g., "Strong Trend", "Weak Trend"). Based on the trend strength score.'),
  }).describe('A detailed breakdown of the current market sentiment and underlying biases.'),
  strategicRecommendation: z.string().describe('A final paragraph providing actionable advice on how to approach the trade, including entry timing and management.'),
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
  model: 'googleai/gemini-pro',
  prompt: `You are ELITE-AI, a world-class trading strategist with 20 years of institutional experience.
Your task is to analyze a trading setup for {{symbol}} and provide a detailed, multi-faceted analysis for a professional trader.

First, use the getMarketNews tool to fetch the latest headlines for {{symbol}}.
Then, synthesize ALL the technical data provided with the news sentiment to generate your analysis.

Your output must be structured into five distinct parts:

1.  **Executive Summary:**
    - A powerful, single-paragraph summary that sounds like a Bloomberg Pro Terminal alert.
    - Start with: "Strong [bullish/bearish] setup presents itself..."
    - Mention price, entry, SL, TP, and confluence count.
    - Integrate the chart pattern, smart money levels (demand zone, FVG), multi-timeframe alignment, and volume bias.
    - State whether news is providing "tailwinds" or "headwinds."
    - End with a sharp, confident conclusion.

2.  **Key Strengths:**
    - A bulleted list of all the factors SUPPORTING this trade.
    - Be specific. Examples: "Strong alignment across 4H and Daily timeframes provides macro support," or "Significant volume imbalance confirms buying pressure," or "Recent positive news headlines act as a tailwind."

3.  **Potential Risks:**
    - A bulleted list of all the factors that could INVALIDATE this trade.
    - Consider counter-arguments. Examples: "The Daily timeframe is showing a neutral trend, which could limit upside," or "The trade is against the prevailing news sentiment, suggesting a high-risk setup," or "Upcoming CPI data could introduce volatility."

4. **Sentiment & Bias:**
    - **newsSentiment**: Based on the headlines, classify the sentiment as 'Bullish', 'Bearish', or 'Neutral'.
    - **volumeBias**: Based on the 'volumeImbalance' data, determine if there is 'Buying Pressure', 'Selling Pressure', or if it's 'Neutral'.
    - **momentum**: Based on the momentum score ({{momentum}}), rate it (e.g., "Strong Bullish", "Overbought", "Neutral", "Bearish", "Oversold").
    - **trendStrength**: Based on the trend strength score ({{trendStrength}}), rate it (e.g., "Strong Trend", "Moderate Trend", "Weak Trend", "Ranging").

5.  **Strategic Recommendation:**
    - A final paragraph of actionable advice.
    - Recommend the best course of action. Example: "Given the confluence of factors, a patient entry is advised. Wait for a pullback to the demand zone between $... and $... before committing. If the price breaks below the stop-loss with high volume, the setup is invalidated."

Tone: Professional, balanced, elite, and deeply analytical. Use Markdown for lists.

---
**Technical Data for Analysis:**
- Asset: {{symbol}}
- Price: \${{price}}
- Trend: {{#if isBullish}}Bullish{{else}}Bearish{{/if}}
- Action: {{action}}
- Entry: \${{entry}}, SL: \${{sl}}, TP1: \${{tp1}}
- Confluence: {{confluenceCount}} factors
- Chart Pattern: {{chartPatternName}}
- Demand Zone: {{demandZone}}
- FVG: {{fvg}}
- Volume: {{volumeImbalance}}
- Trend Strength Score: {{trendStrength}}
- Momentum Score: {{momentum}}
- Multi-Timeframe Analysis:
  - 5m: {{multiTimeframeAnalysis.5m}}
  - 15m: {{multiTimeframeAnalysis.15m}}
  - 1H: {{multiTimeframeAnalysis.1H}}
  - 4H: {{multiTimeframeAnalysis.4H}}
  - Daily: {{multiTimeframeAnalysis.Daily}}
---`,
});

const generateAiInsightFlow = ai.defineFlow(
  {
    name: 'generateAiInsightFlow',
    inputSchema: GenerateAiInsightInputSchema,
    outputSchema: GenerateAiInsightOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
