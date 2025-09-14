
'use server';

/**
 * @fileOverview An AI flow for performing an advanced analysis of a trading chart image.
 *
 * - analyzeChart - A function that takes a chart image and returns a detailed, multi-faceted analysis.
 * - AnalyzeChartInput - The input type for the analyzeChart function.
 * - AnalyzeChartOutput - The return type for the analyzeChart function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const AnalyzeChartInputSchema = z.object({
  symbol: z.string().describe('The symbol of the asset being analyzed (e.g., BTC, ETH).'),
  chartImageUri: z.string().describe("A snapshot of the trading chart, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type AnalyzeChartInput = z.infer<typeof AnalyzeChartInputSchema>;

const AnalyzeChartOutputSchema = z.object({
  analysisSummary: z.string().describe("A concise, high-level summary of the chart's overall structure and potential direction."),
  marketStructure: z.string().describe("Description of the market structure (e.g., 'Clear uptrend with higher highs and higher lows')."),
  keyLevels: z.array(z.object({
    level: z.string().describe("The price level identified (e.g., '$68,500')."),
    type: z.string().describe("The type of level (e.g., 'Support', 'Resistance', 'Demand Zone', 'Supply Zone')."),
  })).describe("A list of key support, resistance, and other important price levels like demand and supply zones."),
  identifiedPatterns: z.array(z.object({
    pattern: z.string().describe("The name of the identified chart pattern (e.g., 'Bull Flag', 'Head and Shoulders')."),
    description: z.string().describe("A brief explanation of what the pattern suggests."),
  })).describe("A list of all technical chart patterns identified in the image."),
  indicatorAnalysis: z.string().describe("Analysis of any visible indicators like RSI, MACD, or Moving Averages."),
  volumeAnalysis: z.string().describe("A brief analysis of the volume trends visible on the chart."),
  actionableStrategy: z.string().describe("A concrete, actionable trading strategy based on all the visual evidence."),
});
export type AnalyzeChartOutput = z.infer<typeof AnalyzeChartOutputSchema>;

export async function analyzeChart(input: AnalyzeChartInput): Promise<AnalyzeChartOutput> {
  return await analyzeChartFlow(input);
}

const analyzeChartFlow = ai.defineFlow(
  {
    name: 'analyzeChartFlow',
    inputSchema: AnalyzeChartInputSchema,
    outputSchema: AnalyzeChartOutputSchema,
  },
  async ({ symbol, chartImageUri }) => {
    const { output } = await ai.generate({
      model: googleAI.model('gemini-pro-vision'),
      output: {
        format: 'json',
        schema: AnalyzeChartOutputSchema,
      },
      prompt: `You are a world-class technical chart analyst with 20 years of experience. Your task is to perform a comprehensive, institutional-grade analysis of the following trading chart image for {{{symbol}}}.

      Analyze the image provided as a real-time snapshot and derive a complete trading thesis. Your analysis must be based **exclusively** on the visual information in the chart.
      
      Chart Snapshot:
      {{media url=chartImageUri}}
      
      Your analysis must be structured into the following sections:
      1.  **analysisSummary**: A brief, high-level overview of the current market situation shown in the chart.
      2.  **marketStructure**: Describe the overall market structure. Is it an uptrend, downtrend, or consolidation? Are there clear higher-highs/higher-lows or lower-highs/lower-lows?
      3.  **keyLevels**: Identify all critical price levels visible. This must include Support, Resistance, and any clear Demand or Supply zones.
      4.  **identifiedPatterns**: Name any classic chart patterns you can see (e.g., Triangles, Flags, Head and Shoulders) and briefly describe their implications.
      5.  **indicatorAnalysis**: If there are indicators like RSI, MACD, or Moving Averages visible, interpret their readings. What do they suggest about momentum and trend?
      6.  **volumeAnalysis**: Comment on the volume bars. Is volume confirming the trend? Are there any significant volume spikes?
      7.  **actionableStrategy**: Based on all the above points, formulate a concrete, actionable trading strategy. For example: "The chart suggests a potential long entry on a pullback to the demand zone around $X, with a stop-loss below the key support at $Y and a target at the resistance level of $Z."
      
      Provide your complete analysis in the required JSON format.`,
      input: { chartImageUri, symbol },
    });
    return output!;
  }
);
