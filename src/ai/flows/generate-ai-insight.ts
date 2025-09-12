
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

const primaryGenerator = ai.definePrompt({
  name: 'generateAiInsightGenerator',
  input: {schema: GenerateAiInsightInputSchema},
  output: {schema: GenerateAiInsightOutputSchema},
  tools: [getMarketNews],
  model: 'googleai/gemini-1.5-flash-latest',
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

## Predictive Analysis
- **primaryScenario**: Based on the technicals (pattern, EMAs) and news sentiment, describe the most likely scenario. Example: "Price is expected to consolidate near the entry zone before a volume-supported push towards TP1. News sentiment provides tailwinds, suggesting conviction."
- **predictedTarget**: Based on the pattern, volume, and momentum, predict the most likely next major price target. This should align with TP1 or TP2. Example: "$72,500".
- **timeframe**: Estimate the time to reach this target. Example: "8-12 hours".
- **successProbability**: Assign a probability percentage for this prediction succeeding. Example: "85%".
- **invalidationLevel**: State the price level that would invalidate this prediction. This should be beyond the SL. Example: "$67,800".
- **keyCatalysts**: List the primary triggers. Example: "A break and hold above the current micro-resistance at $X, combined with increasing buy-side volume."
- **alternativeScenario**: Describe what happens if the invalidationLevel is hit. Example: "If the invalidation level is breached, a deeper correction towards the major support at $Y is likely, as this would indicate a failure of the current bullish structure."

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

const fallbackGenerator = ai.definePrompt({
    name: 'fallbackAiInsightGenerator',
    input: { schema: GenerateAiInsightInputSchema },
    output: { schema: z.object({ executiveSummary: z.string() }) },
    model: 'googleai/gemini-1.5-flash-latest',
    prompt: `You are a backup financial analyst AI. The primary analysis model is unavailable.
    Your task is to provide a concise, single-paragraph executive summary based on the provided data for {{{symbol}}}.
    
    Data:
    - Bias: {{#if isBullish}}Bullish{{else}}Bearish{{/if}}
    - Key Levels: Entry=\${{{entry}}}, SL=\${{{sl}}}, TP1=\${{{tp1}}}
    - Pattern: {{{chartPatternName}}}
    - Confluences: {{{confluenceCount}}}
    - HTF Trend: The 4H trend is {{{multiTimeframeAnalysis.4H}}} and the Daily trend is {{{multiTimeframeAnalysis.Daily}}}.

    Synthesize this into a professional, clear paragraph. Start with the primary bias and setup strength, mention the key levels and pattern, and comment on the higher-timeframe alignment.
    `,
});

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 2, delay = 500): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

const generateAiInsightFlow = ai.defineFlow(
  {
    name: 'generateAiInsightFlow',
    inputSchema: GenerateAiInsightInputSchema,
    outputSchema: GenerateAiInsightOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await retryWithBackoff(() => primaryGenerator(input));
      if (!output) {
        throw new Error('Primary AI model failed to produce a valid output.');
      }
      return output;
    } catch (error) {
      console.error('Primary AI flow failed. Attempting fallback.', error);
      
      try {
        const fallbackResult = await fallbackGenerator(input);
        const fallbackSummary = fallbackResult.output?.executiveSummary || "Fallback summary could not be generated.";
        
        return {
            executiveSummary: {
                primaryBias: "Summary (Fallback Model)",
                setupStrength: "N/A",
                keyLevels: "N/A",
                opportunityGrade: "Retail",
                timeHorizon: fallbackSummary,
            },
            predictiveAnalysis: { 
                primaryScenario: "Unavailable",
                predictedTarget: "Unavailable", 
                timeframe: "Unavailable", 
                successProbability: "Unavailable", 
                invalidationLevel: "Unavailable",
                keyCatalysts: "Unavailable",
                alternativeScenario: "Unavailable"
            },
            technicalAnalysis: { multiTimeframe: "Unavailable due to high model demand.", volumeProfile: "Unavailable", marketMicrostructure: "Unavailable" },
            riskManagement: { positionSizing: "Unavailable", dynamicLevels: "Unavailable" },
            sentimentAndFlow: { onChainMetrics: "Unavailable", marketSentiment: "Unavailable" },
            probabilityAssessment: { successMatrix: "Unavailable", alternativeScenarios: "Unavailable" },
            advancedConfluence: { indicators: "Unavailable", patterns: "Unavailable" },
            institutionalBehavior: { smartMoney: "Unavailable", correlation: "Unavailable" },
            executionStrategy: { entryTactics: "Unavailable", exitStrategy: "Unavailable" },
            marketContext: { macroFactors: "Unavailable", technicalCatalysts: "Unavailable" },
            performanceTracking: { tradeManagementKPIs: "Unavailable", learningMetrics: "Unavailable" },
            alertSystem: { preEntry: "Unavailable", inTrade: "Unavailable" },
        };
      } catch (fallbackError) {
         console.error('Fallback AI flow also failed:', fallbackError);
         
         let errorMessage = "An unexpected error occurred in both primary and fallback AI models.";
         const errorString = String(fallbackError);
         if (errorString.includes("429") || errorString.toLowerCase().includes("quota")) {
            errorMessage = "The AI model is experiencing high demand and the daily usage quota has been exceeded. The service will be available again tomorrow. Please try again later."
         } else if (fallbackError instanceof Error) {
            errorMessage = `Primary model failed and fallback also failed. Error: ${fallbackError.message}`;
         }

         return {
            executiveSummary: {
              primaryBias: "Error",
              setupStrength: "N/A",
              keyLevels: "N/A",
              opportunityGrade: "Retail",
              timeHorizon: errorMessage,
            },
            predictiveAnalysis: { 
                primaryScenario: "Unavailable",
                predictedTarget: "Unavailable", 
                timeframe: "Unavailable", 
                successProbability: "Unavailable", 
                invalidationLevel: "Unavailable",
                keyCatalysts: "Unavailable",
                alternativeScenario: "Unavailable"
            },
            technicalAnalysis: { multiTimeframe: "Unavailable", volumeProfile: "Unavailable", marketMicrostructure: "Unavailable" },
            riskManagement: { positionSizing: "Unavailable", dynamicLevels: "Unavailable" },
            sentimentAndFlow: { onChainMetrics: "Unavailable", marketSentiment: "Unavailable" },
            probabilityAssessment: { successMatrix: "Unavailable", alternativeScenarios: "Unavailable" },
            advancedConfluence: { indicators: "Unavailable", patterns: "Unavailable" },
            institutionalBehavior: { smartMoney: "Unavailable", correlation: "Unavailable" },
            executionStrategy: { entryTactics: "Unavailable", exitStrategy: "Unavailable" },
            marketContext: { macroFactors: "Unavailable", technicalCatalysts: "Unavailable" },
            performanceTracking: { tradeManagementKPIs: "Unavailable", learningMetrics: "Unavailable" },
            alertSystem: { preEntry: "Unavailable", inTrade: "Unavailable" },
         };
      }
    }
  }
);
