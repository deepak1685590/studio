
"use client";

import React from 'react';
import type { GenerateAiInsightOutput } from '@/types';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { BrainCircuit } from 'lucide-react';

interface QuantumSummaryProps {
  insight: GenerateAiInsightOutput;
  isLoading: boolean;
}

const QuantumSummary: React.FC<QuantumSummaryProps> = ({ insight, isLoading }) => {

  if (isLoading) {
    return (
      <div className="p-3 bg-black/30 rounded-lg border border-primary/20 space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!insight || insight.executiveSummary.primaryBias === "Error") {
    return (
      <div className="p-3 rounded-lg border border-destructive bg-destructive/20 text-destructive-foreground">
        <h5 className="font-headline text-destructive flex items-center gap-2">
          <BrainCircuit size={16} /> AI Summary Unavailable
        </h5>
        <p className="text-xs mt-1">{insight?.executiveSummary.timeHorizon || "The AI model failed to generate a summary."}</p>
      </div>
    );
  }
  
  const { primaryBias, setupStrength, opportunityGrade, timeHorizon } = insight.executiveSummary;
  
  const isBullish = primaryBias.toLowerCase().includes('bullish');
  const summaryColorClass = isBullish ? "text-green-400" : "text-red-400";
  
  return (
    <div className="p-3 rounded-lg border border-primary/30 bg-black/30">
       <h5 className="font-headline text-primary flex items-center gap-2 mb-2">
          <BrainCircuit size={16} /> Quantum AI Summary
        </h5>
        <p className="text-base">
            The AI identifies a <strong className={summaryColorClass}>{primaryBias}</strong> bias, rating this as a <strong className="text-primary/90">{setupStrength}</strong> setup. This is considered a <strong className="text-primary/90">{opportunityGrade}</strong>-grade opportunity with a <strong className="text-primary/90">{timeHorizon}</strong> time horizon.
        </p>
    </div>
  );
};

export default QuantumSummary;
