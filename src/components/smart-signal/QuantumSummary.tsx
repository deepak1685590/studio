
"use client";

import React from 'react';
import type { GenerateAiInsightOutput } from '@/types';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuantumSummaryProps {
  insight: GenerateAiInsightOutput | null;
}

const QuantumSummary: React.FC<QuantumSummaryProps> = ({ insight }) => {
  if (!insight) {
    return (
      <div className="p-4 flex items-center justify-center gap-2 text-primary/70 bg-black/30 rounded-lg">
        <Loader2 className="animate-spin" />
        <span className="font-headline">Awaiting Quantum AI Summary...</span>
      </div>
    );
  }

  const { executiveSummary } = insight;

  if (executiveSummary.primaryBias === "Error") {
    return (
      <div className="text-center text-destructive-foreground bg-destructive/30 p-3 rounded-lg border border-destructive">
        <strong className="font-headline">AI Summary Failed:</strong>
        <p className="text-sm mt-1">{executiveSummary.timeHorizon}</p>
      </div>
    );
  }
  
  if (executiveSummary.primaryBias === "Summary (Fallback Model)") {
    return (
         <div className="p-3 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg border border-accent/50 shadow-[0_0_10px_hsl(var(--accent)_/_0.4)]">
          <h4 className="font-headline text-md text-accent flex items-center gap-2 mb-1">
              Executive Summary (Fallback)
          </h4>
          <p className="text-xs text-foreground/80">{executiveSummary.timeHorizon}</p>
        </div>
    )
  }

  const gradeColor = {
    'Institutional': 'text-cyan-400 border-cyan-400',
    'Professional': 'text-primary border-primary',
    'Retail': 'text-yellow-400 border-yellow-400',
  }[executiveSummary.opportunityGrade];

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-black/10 to-accent/10 border-primary/30">
        <CardHeader className="p-3">
            <CardTitle className="font-headline text-primary/90 text-md flex items-center justify-between">
                <div className="flex items-center gap-2"><BrainCircuit size={16} /> Quantum AI Summary</div>
                <div className={cn("text-xs font-bold border rounded-full px-2 py-0.5", gradeColor)}>
                    {executiveSummary.opportunityGrade} Grade
                </div>
            </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs p-3 pt-0">
            <div><strong className="text-primary/70">Primary Bias:</strong> {executiveSummary.primaryBias}</div>
            <div><strong className="text-primary/70">Setup Strength:</strong> {executiveSummary.setupStrength}</div>
            <div className="col-span-2"><strong className="text-primary/70">Time Horizon:</strong> {executiveSummary.timeHorizon}</div>
        </CardContent>
    </Card>
  );
};

export default QuantumSummary;
