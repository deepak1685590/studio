
'use server';

/**
 * @fileOverview An AI flow for analyzing code snippets or error logs and suggesting fixes.
 *
 * - analyzeCodeAndSuggestFixes - A function that takes code/error text and returns an analysis and suggested fix.
 * - AnalyzeCodeInput - The input type for the analyzeCodeAndSuggestFixes function.
 * - AnalyzeCodeOutput - The return type for the analyzeCodeAndSuggestFixes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCodeInputSchema = z.object({
  codeOrError: z.string().describe('The code snippet or error log to be analyzed.'),
});
export type AnalyzeCodeInput = z.infer<typeof AnalyzeCodeInputSchema>;

const AnalyzeCodeOutputSchema = z.object({
  explanation: z.string().describe("A clear, concise explanation of what the error is and why it's happening. This should be easy for a developer to understand."),
  suggestedFix: z.string().describe("The corrected code snippet. This should be a complete, ready-to-use block of code that resolves the identified issue."),
});
export type AnalyzeCodeOutput = z.infer<typeof AnalyzeCodeOutputSchema>;

export async function analyzeCodeAndSuggestFixes(input: AnalyzeCodeInput): Promise<AnalyzeCodeOutput> {
  return await analyzeCodeFlow(input);
}

const analyzeCodeFlow = ai.defineFlow(
  {
    name: 'analyzeCodeAndSuggestFixesFlow',
    inputSchema: AnalyzeCodeInputSchema,
    outputSchema: AnalyzeCodeOutputSchema,
  },
  async ({ codeOrError }) => {
    const { output } = await ai.generate({
      model: 'gemini-1.5-flash',
      output: {
        format: 'json',
        schema: AnalyzeCodeOutputSchema,
      },
      prompt: `You are an expert software developer and debugging assistant. Your task is to analyze the provided code snippet or error log, identify the problem, explain it clearly, and provide a corrected version of the code.

      **Input to Analyze:**
      \`\`\`
      {{{codeOrError}}}
      \`\`\`

      **Your Task:**
      1.  **Analyze the Input:** Carefully read the code or error message to understand the root cause of the issue.
      2.  **Formulate an Explanation:** Write a clear, step-by-step explanation of the problem. Describe what's wrong, why it's an issue, and the general approach to fixing it.
      3.  **Provide a Suggested Fix:** Write the corrected code. This should be the final, complete code snippet that the user can copy and paste to resolve the problem. Do not include comments like "// your other code here" unless it's essential for context. Provide the full, corrected block.

      Provide your complete analysis in the required JSON format.`,
      input: { codeOrError },
    });
    return output!;
  }
);
