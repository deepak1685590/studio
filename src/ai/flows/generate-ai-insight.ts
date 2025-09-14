
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
    primaryBias: z.string().describe("The primary market bias (e.g., 'Bullish Continuation', 'Bearish Reversal')."),
    setupStrength: z.string().describe("The perceived strength of this trading setup (e.g., 'High-Conviction', 'Moderate')."),
    opportunityGrade: z.enum(['Institutional', 'Professional', 'Retail']).describe("A letter grade for the quality of the opportunity."),
    timeHorizon: z.string().describe("The recommended time horizon for this trade (e.g., 'Scalp', 'Intraday', 'Swing')."),
  }),
  tradeSetup: z.object({
    entryPrice: z.string().describe("The AI's optimized primary entry price."),
    secondaryEntryPrice: z.string().optional().describe("An optional secondary entry price based on multi-layer confirmation, if a suitable one exists."),
    stopLoss: z.string().describe("The AI's recommended stop-loss level."),
    takeProfit1: z.string().describe("The AI's primary take-profit target."),
    takeProfit2: z.string().describe("The AI's secondary take-profit target."),
    tradeRationale: z.string().describe("A brief rationale for the chosen entry and target levels."),
  }).describe("The AI-generated trade plan with precise levels."),
  predictiveAnalysis: z.object({
    primaryScenario: z.string().describe("A detailed description of the most likely price action scenario over the specified timeframe."),
    predictedTarget: z.object({
        shortTerm: z.string().describe("The AI's price target for a short-term timeframe (e.g., 5-15 minutes)."),
        intraday: z.string().describe("The AI's price target for an intraday timeframe (e.g., 1-4 hours)."),
        swing: z.string().describe("The AI's price target for a swing trade timeframe (e.g., Daily/Weekly)."),
    }).describe("The AI's primary price targets broken down by different timeframes."),
    timeframe: z.string().describe("The estimated time it will take to reach the predicted target, prefixed with 'Long:' or 'Short:' based on the overall trade bias (e.g., 'Long: 1-3 hours', 'Short: 4-8 hours')."),
    successProbability: z.string().describe("The AI's confidence in the primary scenario, as a percentage."),
    invalidationLevel: z.string().describe("The price level at which the primary scenario would be considered invalid."),
    keyCatalysts: z.string().describe("The key technical or fundamental catalysts that could trigger the predicted move."),
    alternativeScenario: z.string().describe("A brief description of a plausible alternative scenario if the primary prediction is invalidated.")
  }),
  technicalAnalysis: z.object({
    multiTimeframe: z.string().describe("A summary of the multi-timeframe analysis, noting alignment or divergence."),
    volumeProfile: z.string().describe("Analysis of volume profile, identifying key high-volume and low-volume nodes."),
    marketMicrostructure: z.string().describe("Insights into order flow, bid/ask spread, and potential liquidity pools."),
  }),
  riskManagement: z.object({
    positionSizing: z.string().describe("Recommendations for position sizing based on volatility and conviction (e.g., '0.5% of portfolio')."),
    dynamicLevels: z.string().describe("Strategy for adjusting stop-loss and take-profit levels as the trade develops."),
  }),
  sentimentAndFlow: z.object({
    onChainMetrics: z.string().describe("Analysis of on-chain data (e.g., transaction volume, active addresses) if applicable."),
    marketSentiment: z.string().describe("A summary of overall market sentiment, incorporating news and social media trends."),
  }),
  probabilityAssessment: z.object({
    successMatrix: z.string().describe("A qualitative assessment of factors supporting the trade's success."),
    alternativeScenarios: z.string().describe("Brief analysis of what could happen if the primary thesis is wrong."),
  }),
  advancedConfluence: z.object({
    indicators: z.string().describe("Confluence of key indicators (e.g., RSI, MACD, Bollinger Bands) supporting the setup."),
    patterns: z.string().describe("How the identified chart pattern fits into the broader market structure."),
  }),
  institutionalBehavior: z.object({
    smartMoney: z.string().describe("Signs of smart money activity, such as accumulation/distribution or order block mitigation."),
    correlation: z.string().describe("Correlation with major assets like BTC or SPX and its implications."),
  }),
  executionStrategy: z.object({
    entryTactics: z.string().describe("Specific tactics for entering the trade (e.g., 'Wait for a retest of the broken support')."),
    exitStrategy: z.string().describe("A clear plan for taking profits and cutting losses."),
  }),
  marketContext: z.object({
    macroFactors: z.string().describe("Relevant macroeconomic factors (e.g., interest rates, inflation) impacting the asset."),
    technicalCatalysts: z.string().describe("Upcoming technical events (e.g., halving, network upgrade) that could act as catalysts."),
  }),
  performanceTracking: z.object({
    tradeManagementKPIs: z.string().describe("Key Performance Indicators to watch during the trade (e.g., 'Volume increase on breakout')."),
    learningMetrics: z.string().describe("Key takeaways or learning opportunities from this specific trade setup."),
  }),
  alertSystem: z.object({
    preEntry: z.string().describe("Alert conditions to watch for before entering the trade."),
    inTrade: z.string().describe("Alert conditions to monitor while the trade is active."),
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

const fallbackGenerator = ai.definePrompt({
    name: 'fallbackGenerator',
    input: { schema: GenerateAiInsightInputSchema },
    output: { schema: z.object({ summary: z.string() }) },
    model: 'googleai/gemini-1.5-flash-latest',
    prompt: `You are a high-speed market analysis AI. The primary analysis model is unavailable.
    Provide a concise, single-paragraph executive summary based on the following data for {{{symbol}}}.
    - Trend: {{{isBullish}}} (True=Bullish)
    - Key Pattern: {{{chartPatternName}}}
    - Entry: {{{entry}}}, SL: {{{sl}}}, TP1: {{{tp1}}}
    - Confidence Factors: Trend Strength ({{{trendStrength}}}/100), Momentum ({{{momentum}}}/100)
    Synthesize this into a professional, high-level summary.`,
});


const generateAiInsightFlow = ai.defineFlow(
  {
    name: 'generateAiInsightFlow',
    inputSchema: GenerateAiInsightInputSchema,
    outputSchema: GenerateAiInsightOutputSchema,
  },
  async (input) => {
    const errorPayload: GenerateAiInsightOutput = {
        executiveSummary: { primaryBias: "Error", setupStrength: "N/A", opportunityGrade: "Retail", timeHorizon: "The AI model encountered an unrecoverable error." },
        tradeSetup: { entryPrice: "N/A", stopLoss: "N/A", takeProfit1: "N/A", takeProfit2: "N/A", tradeRationale: "N/A" },
        predictiveAnalysis: { primaryScenario: "N/A", predictedTarget: { shortTerm: "N/A", intraday: "N/A", swing: "N/A" }, timeframe: "N/A", successProbability: "N/A", invalidationLevel: "N/A", keyCatalysts: "N/A", alternativeScenario: "N/A" },
        technicalAnalysis: { multiTimeframe: "N/A", volumeProfile: "N/A", marketMicrostructure: "N/A" },
        riskManagement: { positionSizing: "N/A", dynamicLevels: "N/A" },
        sentimentAndFlow: { onChainMetrics: "N/A", marketSentiment: "N/A" },
        probabilityAssessment: { successMatrix: "N/A", alternativeScenarios: "N/A" },
        advancedConfluence: { indicators: "N/A", patterns: "N/A" },
        institutionalBehavior: { smartMoney: "N/A", correlation: "N/A" },
        executionStrategy: { entryTactics: "N/A", exitStrategy: "N/A" },
        marketContext: { macroFactors: "N/A", technicalCatalysts: "N/A" },
        performanceTracking: { tradeManagementKPIs: "N/A", learningMetrics: "N/A" },
        alertSystem: { preEntry: "N/A", inTrade: "N/A" }
    };

    try {
      // Primary model attempt
      const { output } = await ai.generate({
        model: 'googleai/gemini-1.5-flash-latest',
        tools: [getMarketNews],
        output: {
            format: 'json',
            schema: GenerateAiInsightOutputSchema,
        },
        prompt: `You are ELITE-AI, a world-class institutional trading strategist. Your task is to generate a comprehensive, multi-faceted trading analysis report for {{{symbol}}}.
        First, use the getMarketNews tool to fetch the latest headlines for {{{symbol}}}.
        Then, synthesize ALL the provided data into the structured JSON format below.
        
        **Crucially, based on your holistic analysis of all provided data, you must derive and populate the 'tradeSetup' section with your own optimized primary entry, stop-loss, and take-profit levels. Provide a brief rationale for your choices.**
        
        **If you identify a secondary, high-probability entry point based on multi-layer confirmation (like a confluence of Fibonacci levels, pivot points, or key moving averages from the provided data), populate the optional 'secondaryEntryPrice' field. Otherwise, omit it.**

        For the 'predictedTarget', provide distinct price targets for short-term (scalp/5-15m), intraday (1-4h), and swing (daily/weekly) timeframes based on the overall analysis.
        
        Fill out EVERY field in the JSON schema with detailed, insightful, and actionable analysis. Be thorough and professional.

        ## Analysis Parameters
        - Asset: {{{symbol}}}
        - Current Price: {{{price}}}
        - Analysis Timestamp: ${new Date().toISOString()}
        - Market Session: {{{marketSession}}}
        - Volatility Regime: {{{volatilityRegime}}}
        - Provided Data: ${JSON.stringify(input)}
        `,
        input: input,
      });

      if (!output) {
        throw new Error('Primary AI model failed to produce a valid output.');
      }
      return output;

    } catch (error) {
       console.error("Primary AI Generation Error, attempting fallback:", error);
       
       try {
         const { output: fallbackOutput } = await fallbackGenerator(input);

         if (!fallbackOutput) {
            throw new Error('Fallback AI model also failed.');
         }
         
         // Populate the error payload with the fallback summary
         const fallbackPayload = { ...errorPayload };
         fallbackPayload.executiveSummary = {
             primaryBias: "Summary (Fallback Model)",
             setupStrength: "N/A",
             opportunityGrade: "Retail",
             timeHorizon: fallbackOutput.summary
         };
         return fallbackPayload;

       } catch (fallbackError) {
         console.error("Fallback AI Generation Error:", fallbackError);
         
         // Check for specific quota error
         const errorMessage = fallbackError instanceof Error ? fallbackError.message : "An unknown internal error occurred.";
         if (errorMessage.includes("429") || errorMessage.includes("QuotaFailure")) {
            errorPayload.executiveSummary.timeHorizon = "The daily API quota has been exceeded. This feature will be available again tomorrow. Please check your billing details for more information.";
         } else {
            errorPayload.executiveSummary.timeHorizon = `Primary model failed and fallback also failed: ${errorMessage}`;
         }
         return errorPayload;
       }
    }
  }
);

    