
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

const prompt = ai.definePrompt({
  name: 'generateAiInsightPrompt',
  input: {schema: GenerateAiInsightInputSchema},
  output: {schema: GenerateAiInsightOutputSchema},
  tools: [getMarketNews],
  prompt: `You are ELITE-AI, a world-class institutional trading strategist. Your task is to generate a comprehensive trading analysis report for {{{symbol}}}.
First, use the getMarketNews tool to fetch the latest headlines for {{{symbol}}}.
Then, synthesize ALL the provided data into the structured JSON format below. Be extremely detailed, professional, and analytical in every section.

## Analysis Parameters
- Asset: {{{symbol}}}
- Current Price: \${{{price}}}
- Analysis Timestamp: {current_datetime}
- Market Session: {{{marketSession}}}
- Volatility Regime: {{{volatilityRegime}}}

---
Fill out every field in the following JSON object with detailed, expert-level analysis.

## Executive Summary
- **primaryBias**: Current price is \${{{price}}}. The primary bias is {{#if isBullish}}bullish{{else}}bearish{{/if}}.
- **setupStrength**: Based on {{{confluenceCount}}} confluences, the setup strength is rated [calculate a rating out of 10 based on confluenceCount, trendStrength, and momentum].
- **keyLevels**: Entry: \${{{entry}}}, Stop-Loss: \${{{sl}}}, Targets: \${{{tp1}}} (TP1), \${{{tp2}}} (TP2).
- **opportunityGrade**: [Assign 'Institutional', 'Professional', or 'Retail' based on the overall quality of the setup].
- **timeHorizon**: Expected time horizon for trade completion is [e.g., 'Intraday (4-8 hours)', 'Swing (2-5 days)'].

## Technical Analysis Deep Dive
- **multiTimeframe**: Provide a detailed breakdown of Weekly, Daily, 4H, and 1H structures based on the provided multiTimeframeAnalysis data. Assess cross-timeframe confluence.
- **volumeProfile**: Analyze the volumeImbalance data. Infer potential POC, VAP levels, and accumulation/distribution zones.
- **marketMicrostructure**: Based on volume and momentum, infer the order flow dynamics, bid/ask pressure, and potential liquidity pools.

## Risk Management Matrix
- **positionSizing**: Recommend conservative (1-2%), moderate (2-3%), and aggressive (3-5%) position sizing based on the opportunity grade.
- **dynamicLevels**: Detail the initial stop-loss reasoning. Suggest a trailing stop strategy and break-even adjustment points.

## Sentiment & Flow Analysis
- **onChainMetrics**: For crypto, analyze the news headlines for sentiment. Infer potential exchange flows and whale activity.
- **marketSentiment**: Synthesize news sentiment with market momentum ({{momentum}}) and trend strength ({{trendStrength}}) to create a holistic sentiment score.

## Probability Assessment
- **successMatrix**: Estimate a win probability based on the setup strength. Calculate the risk-reward ratio to TP2.
- **alternativeScenarios**: Detail the bullish invalidation level (stop-loss). Describe what would happen in a sideways consolidation scenario.

## Advanced Confluence Factors
- **indicators**: Discuss how the trend (EMAs), momentum (RSI), and volume indicators are confluent.
- **patterns**: Elaborate on the identified '{{{chartPatternName}}}' and its implications in the current market structure.

## Institutional Behavior Analysis
- **smartMoney**: Analyze the demandZone and fvg (Fair Value Gap) as areas of institutional interest.
- **correlation**: Briefly mention how {{{symbol}}} might be correlated to the broader market (e.g., S&P 500, DXY).

## Execution Strategy
- **entryTactics**: Recommend optimal entry triggers (e.g., "Wait for a pullback to the demand zone"). Discuss market vs. limit orders.
- **exitStrategy**: Outline a clear exit strategy using the provided TP1 and TP2 levels for partial profit-taking.

## Market Context & Catalysts
- **macroFactors**: Mention any potential impact from major economic news based on the fetched headlines.
- **technicalCatalysts**: Identify key technical events that could trigger the trade, such as breaking a key level or pattern completion.

## Performance Tracking
- **tradeManagementKPIs**: Suggest key KPIs to track for this trade, such as hold time and risk-adjusted return.
- **learningMetrics**: Suggest what can be learned from this trade's outcome, regardless of win or loss.

## Alert System Configuration
- **preEntry**: Recommend alerts to set for price approaching the entry zone and for volume confirmation.
- **inTrade**: Recommend alerts for target approaches and stop-loss proximity.
---
`,
});

const generateAiInsightFlow = ai.defineFlow(
  {
    name: 'generateAiInsightFlow',
    inputSchema: GenerateAiInsightInputSchema,
    outputSchema: GenerateAiInsightOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) {
        throw new Error('AI failed to generate a valid output.');
      }
      return output;
    } catch (error) {
      console.error('Error in generateAiInsightFlow:', error);
      // Construct a user-friendly error message within the expected output schema.
      // This prevents the entire component from crashing.
      const errorMessage =
        error instanceof Error && (error.message.includes('429') || error.message.includes('Too Many Requests'))
          ? 'The AI model is currently experiencing high demand (rate limit exceeded). Please try again in a few moments.'
          : 'An unexpected error occurred while generating the AI analysis.';

      // Return a valid object that matches the output schema but contains error messages.
      // This is a "graceful failure" that the front-end can render.
      return {
        executiveSummary: {
          primaryBias: "Error",
          setupStrength: "N/A",
          keyLevels: "N/A",
          opportunityGrade: "Retail", // A valid enum value is required.
          timeHorizon: errorMessage,
        },
        technicalAnalysis: {
          multiTimeframe: "Unavailable due to error.",
          volumeProfile: "Unavailable due to error.",
          marketMicrostructure: "Unavailable due to error.",
        },
        riskManagement: {
          positionSizing: "Unavailable due to error.",
          dynamicLevels: "Unavailable due to error.",
        },
        sentimentAndFlow: {
          onChainMetrics: "Unavailable due to error.",
          marketSentiment: "Unavailable due to error.",
        },
        probabilityAssessment: {
          successMatrix: "Unavailable due to error.",
          alternativeScenarios: "Unavailable due to error.",
        },
        advancedConfluence: {
          indicators: "Unavailable due to error.",
          patterns: "Unavailable due to error.",
        },
        institutionalBehavior: {
          smartMoney: "Unavailable due to error.",
          correlation: "Unavailable due to error.",
        },
        executionStrategy: {
          entryTactics: "Unavailable due to error.",
          exitStrategy: "Unavailable due to error.",
        },
        marketContext: {
          macroFactors: "Unavailable due to error.",
          technicalCatalysts: "Unavailable due to error.",
        },
        performanceTracking: {
          tradeManagementKPIs: "Unavailable due to error.",
          learningMetrics: "Unavailable due to error.",
        },
        alertSystem: {
          preEntry: "Unavailable due to error.",
          inTrade: "Unavailable due to error.",
        },
      };
    }
  }
);
