
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
  tp2: z.number().describe('The take-profit 2 price for the trade.'),
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
  marketSession: z.string().describe('The current market session (e.g., London, New York).'),
  volatilityRegime: z.enum(['High', 'Medium', 'Low']).describe('The current market volatility regime.'),
});
export type GenerateAiInsightInput = z.infer<typeof GenerateAiInsightInputSchema>;

const GenerateAiInsightOutputSchema = z.object({
  executiveSummary: z.object({
    primaryBias: z.string(),
    setupStrength: z.string(),
    keyLevels: z.string(),
    opportunityGrade: z.enum(['Institutional', 'Professional', 'Retail']),
    timeHorizon: z.string(),
  }),
  predictiveAnalysis: z.object({
    primaryScenario: z.string().describe("A detailed description of the most likely price action scenario over the specified timeframe."),
    predictedTarget: z.string().describe("The AI's primary price target based on the primary scenario."),
    timeframe: z.string().describe("The estimated time it will take to reach the predicted target."),
    successProbability: z.string().describe("The AI's confidence in the primary scenario, as a percentage."),
    invalidationLevel: z.string().describe("The price level at which the primary scenario would be considered invalid."),
    keyCatalysts: z.string().describe("The key technical or fundamental catalysts that could trigger the predicted move."),
    alternativeScenario: z.string().describe("A brief description of a plausible alternative scenario if the primary prediction is invalidated.")
  }),
  technicalAnalysis: z.object({
    multiTimeframe: z.string(),
    volumeProfile: z.string(),
    marketMicrostructure: z.string(),
  }),
  riskManagement: z.object({
    positionSizing: z.string(),
    dynamicLevels: z.string(),
  }),
  sentimentAndFlow: z.object({
    onChainMetrics: z.string(),
    marketSentiment: z.string(),
  }),
  probabilityAssessment: z.object({
    successMatrix: z.string(),
    alternativeScenarios: z.string(),
  }),
  advancedConfluence: z.object({
    indicators: z.string(),
    patterns: z.string(),
  }),
  institutionalBehavior: z.object({
    smartMoney: z.string(),
    correlation: z.string(),
  }),
  executionStrategy: z.object({
    entryTactics: z.string(),
    exitStrategy: z.string(),
  }),
  marketContext: z.object({
    macroFactors: z.string(),
    technicalCatalysts: z.string(),
  }),
  performanceTracking: z.object({
    tradeManagementKPIs: z.string(),
    learningMetrics: z.string(),
  }),
  alertSystem: z.object({
    preEntry: z.string(),
    inTrade: z.string(),
  }),
});
export type GenerateAiInsightOutput = z.infer<typeof GenerateAiInsightOutputSchema>;

export async function generateAiInsight(input: GenerateAiInsightInput): Promise<GenerateAiInsightOutput> {
  return await generateAiInsightFlow(input);
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

const generateAiInsightFlow = ai.defineFlow(
  {
    name: 'generateAiInsightFlow',
    inputSchema: GenerateAiInsightInputSchema,
    outputSchema: GenerateAiInsightOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await ai.generate({
        model: 'googleai/gemini-1.5-flash-latest',
        tools: [getMarketNews],
        output: {
            format: 'json',
            schema: GenerateAiInsightOutputSchema,
        },
        prompt: `You are ELITE-AI, a world-class institutional trading strategist. Your task is to generate a comprehensive trading analysis report for {{{symbol}}}.
        First, use the getMarketNews tool to fetch the latest headlines for {{{symbol}}}.
        Then, synthesize ALL the provided data into the structured JSON format below. Be extremely detailed, professional, and analytical in every section.

        ## Analysis Parameters
        - Asset: {{{symbol}}}
        - Current Price: $${input.price}
        - Analysis Timestamp: ${new Date().toISOString()}
        - Market Session: {{{marketSession}}}
        - Volatility Regime: {{{volatilityRegime}}}
        `,
        input,
      });

      if (!output) {
        throw new Error('AI model failed to produce a valid output. The response was empty.');
      }
      return output;
    } catch (error) {
       console.error("AI Generation Error in Flow:", error);
       // Create a specific error object that the frontend can interpret
       const errorMessage = error instanceof Error ? error.message : "An unknown internal error occurred.";
       return {
         executiveSummary: {
           primaryBias: "Error",
           setupStrength: "N/A",
           keyLevels: "N/A",
           opportunityGrade: "Retail",
           timeHorizon: `The AI model encountered an error: ${errorMessage}`
         },
         predictiveAnalysis: {} as any, technicalAnalysis: {} as any, riskManagement: {} as any,
         sentimentAndFlow: {} as any, probabilityAssessment: {} as any, advancedConfluence: {} as any,
         institutionalBehavior: {} as any, executionStrategy: {} as any, marketContext: {} as any,
         performanceTracking: {} as any, alertSystem: {} as any
       };
    }
  }
);
