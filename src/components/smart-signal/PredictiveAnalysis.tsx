
"use client";

import React from 'react';
import type { GenerateAiInsightOutput } from '@/types';
import { Target, Lightbulb, AlertTriangle } from 'lucide-react';

interface PredictiveAnalysisProps {
  analysis: GenerateAiInsightOutput['predictiveAnalysis'];
}

const PredictiveAnalysis: React.FC<PredictiveAnalysisProps> = ({ analysis }) => {
  return (
    <div className="p-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg border border-accent/50 shadow-[0_0_15px_hsl(var(--accent)_/_0.5)]">
      <h4 className="font-headline text-lg text-accent flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
            <Target /> Predictive Analysis
        </div>
        <span className="font-mono text-lg text-green-400">{analysis.successProbability} Success</span>
      </h4>
      <div className="space-y-3">
        <div className="text-sm">
          <strong className="text-accent/80 flex items-center gap-1"><Lightbulb size={14}/> Primary Scenario:</strong>
          <p className="text-foreground/90 italic">"{analysis.primaryScenario}"</p>
        </div>

        <div className="text-sm">
          <strong className="text-yellow-400 flex items-center gap-1"><AlertTriangle size={14}/> Alternative Scenario:</strong>
          <p className="text-foreground/90">{analysis.alternativeScenario}</p>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalysis;

    