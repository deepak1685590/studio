'use server';

/**
 * @fileOverview An AI flow for analyzing a trading chart image.
 *
 * - analyzeChart - A function that takes a chart image and returns a detailed analysis.
 * - AnalyzeChartInput - The input type for the analyzeChart function.
 * - AnalyzeChartOutput - The return type for the analyzeChart function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeChartInputSchema = z.object({
  symbol: z.string().describe('The symbol of the asset being analyzed (e.g., BTC, ETH).'),
  chartImageUri: z.string().describe("A snapshot of the trading chart, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type AnalyzeChartInput = z.infer<typeof AnalyzeChartInputSchema>;

const AnalyzeChartOutputSchema = z.object({
  analysisSummary: z.string().describe("A concise, high-level summary of the chart's overall structure and potential direction."),
  identifiedPatterns: z.array(z.object({
    pattern: z.string().describe("The name of the identified chart pattern (e.g., 'Bull Flag', 'Head and Shoulders')."),
    description: z.string().describe("A brief explanation of what the pattern suggests."),
  })).describe("A list of all technical chart patterns identified in the image."),
  keyLevels: z.array(z.object({
    level: z.string().describe("The price level identified (e.g., '$68,500')."),
    type: z.string().describe("The type of level (e.g., 'Support', 'Resistance', 'Demand Zone')."),
  })).describe("A list of key support, resistance, and other important price levels."),
});
export type AnalyzeChartOutput = z.infer<typeof AnalyzeChartOutputSchema>;

export async function analyzeChart(input: AnalyzeChartInput): Promise<AnalyzeChartOutput> {
  return analyzeChartFlow(input);
}

const analyzeChartFlow = ai.defineFlow(
  {
    name: 'analyzeChartFlow',
    inputSchema: AnalyzeChartInputSchema,
    outputSchema: AnalyzeChartOutputSchema,
  },
  async ({ symbol, chartImageUri }) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      output: {
        format: 'json',
        schema: AnalyzeChartOutputSchema,
      },
      prompt: `You are a master technical chart analyst. Analyze the following chart image for ${symbol}.
      
      Your task is to visually identify all relevant chart patterns, key support and resistance levels, and provide a summary of your findings.
      
      Here is the chart:
      {{media url=chartImageUri}}
      
      Based ONLY on the visual information in the chart, provide your analysis.`,
      context: { chartImageUri },
    });
    return output!;
  }
);
