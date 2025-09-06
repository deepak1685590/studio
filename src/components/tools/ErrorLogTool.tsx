"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { analyzeCodeAndSuggestFixes, AnalyzeCodeOutput } from '@/ai/flows/analyze-code-and-suggest-fixes';
import { Bug, Wand2, Lightbulb, Code } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { marked } from 'marked';

const ErrorLogTool = () => {
  const [input, setInput] = useState('');
  const [analysis, setAnalysis] = useState<AnalyzeCodeOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setAnalysis(null);
    setError(null);

    try {
      const result = await analyzeCodeAndSuggestFixes({ codeOrError: input });
      setAnalysis(result);
    } catch (err) {
      console.error("AI analysis error:", err);
      setError("The AI failed to analyze the log. This might be due to a network issue or an internal error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const createMarkup = (text: string) => {
    const rawMarkup = marked(text, { sanitize: true });
    return { __html: rawMarkup as string };
  };

  return (
    <Card className="bg-black/50 border-2 border-primary/50 shadow-[0_0_25px_rgba(0,230,230,0.3)]">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-primary flex items-center gap-2">
          <Bug /> AI Error Log Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-foreground/80 mb-2">Paste your error log or code snippet below for an AI-powered analysis and fix suggestion.</p>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your code or error message here..."
            className="min-h-[200px] bg-input border-primary/50 focus:shadow-[0_0_15px_rgba(0,255,255,0.5)]"
          />
        </div>
        <Button onClick={handleAnalyze} disabled={loading} className="font-headline text-lg bg-primary/20 border-2 border-primary hover:bg-primary hover:text-background transition-all duration-300">
          <Wand2 className="mr-2" />
          {loading ? 'Analyzing...' : 'Analyze & Suggest Fix'}
        </Button>

        {loading && (
          <div className="space-y-4 pt-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-6 w-1/3 mt-4" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {error && (
          <div className="pt-4 text-destructive-foreground bg-destructive/30 p-4 rounded-md border border-destructive">
            <strong>Error:</strong> {error}
          </div>
        )}

        {analysis && (
          <div className="pt-4 space-y-6">
            <div>
              <h3 className="font-headline text-lg text-primary flex items-center gap-2 mb-2">
                <Lightbulb /> Explanation
              </h3>
              <div className="prose prose-sm prose-invert max-w-none p-4 bg-black/30 rounded-md border border-primary/20" dangerouslySetInnerHTML={createMarkup(analysis.explanation)} />
            </div>
            <div>
              <h3 className="font-headline text-lg text-primary flex items-center gap-2 mb-2">
                <Code /> Suggested Fix
              </h3>
              <div className="prose prose-sm prose-invert max-w-none p-4 bg-black/30 rounded-md border border-primary/20">
                <pre><code>{analysis.suggestedFix}</code></pre>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ErrorLogTool;
