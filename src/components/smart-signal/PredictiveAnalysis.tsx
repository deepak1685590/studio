
"use client";

import React from 'react';
import type { GenerateAiInsightOutput } from '@/types';
import { Target, Lightbulb, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';

interface PredictiveAnalysisProps {
  analysis: GenerateAiInsightOutput['predictiveAnalysis'];
}

const PredictiveAnalysis: React.FC<PredictiveAnalysisProps> = ({ analysis }) => {
  const { successProbability, confidenceScore, primaryScenario, alternativeScenario, keyDrivers, invalidationPoint } = analysis;

  const confidenceColor = confidenceScore > 75 ? 'text-green-400' : confidenceScore > 50 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="p-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg border border-accent/50 shadow-[0_0_15px_hsl(var(--accent)_/_0.5)]">
      <h4 className="font-headline text-lg text-accent flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
            <Target /> Predictive Analysis
        </div>
      </h4>

      <div className="space-y-4">
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-foreground/80">AI Confidence</span>
                <span className={cn("font-mono text-lg font-bold", confidenceColor)}>{successProbability}</span>
            </div>
            <Progress value={confidenceScore} className={cn("h-3 [&>div]:bg-current", confidenceColor)} />
        </div>

        <div className="text-sm">
          <strong className="text-accent/80 flex items-center gap-1"><Lightbulb size={14}/> Primary Scenario:</strong>
          <p className="text-foreground/90 italic">"{primaryScenario}"</p>
        </div>

        <div className="text-sm">
            <strong className="text-primary/80 flex items-center gap-1"><Zap size={14}/> Key Drivers:</strong>
            <ul className="list-disc list-inside pl-4 text-foreground/90">
                {keyDrivers.map((driver, index) => <li key={index}>{driver}</li>)}
            </ul>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-sm p-3 bg-black/30 rounded-md border border-yellow-500/50">
              <strong className="text-yellow-400 flex items-center gap-1"><AlertTriangle size={14}/> Alternative Scenario:</strong>
              <p className="text-foreground/90 mt-1">{alternativeScenario}</p>
            </div>
             <div className="text-sm p-3 bg-black/30 rounded-md border border-red-500/50">
              <strong className="text-red-400 flex items-center gap-1"><ShieldCheck size={14}/> Invalidation Point:</strong>
              <p className="text-foreground/90 mt-1">{invalidationPoint}</p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default PredictiveAnalysis;
