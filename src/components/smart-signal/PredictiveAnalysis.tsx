
"use client";

import React from 'react';
import type { GenerateAiInsightOutput } from '@/types';
import { Target, Lightbulb, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface PredictiveAnalysisProps {
  analysis: GenerateAiInsightOutput['predictiveAnalysis'];
}

const PredictiveAnalysis: React.FC<PredictiveAnalysisProps> = ({ analysis }) => {
  const { successProbability, primaryScenario, alternativeScenario } = analysis;

  const probabilityValue = parseInt(successProbability, 10) || 0;
  const probabilityColor = probabilityValue > 70 ? 'text-green-400' : probabilityValue > 50 ? 'text-yellow-400' : 'text-red-400';

  return (
     <Card className="bg-black/20 border-primary/30">
         <CardHeader>
            <CardTitle className="font-headline text-primary/90 text-md flex items-center justify-between">
                <div className="flex items-center gap-2"><Target /> Predictive Analysis</div>
                <span className={cn("font-mono text-lg", probabilityColor)}>{successProbability} Success</span>
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-foreground/80">Success Probability</span>
                    <span className={cn("font-mono text-lg font-bold", probabilityColor)}>{probabilityValue}%</span>
                </div>
                <Progress value={probabilityValue} className={cn("h-3 [&>div]:bg-current", probabilityColor)} />
            </div>

            <div className="text-sm">
              <strong className="text-primary/80 flex items-center gap-1"><Lightbulb size={14}/> Primary Scenario:</strong>
              <p className="text-foreground/90 italic">"{primaryScenario}"</p>
            </div>
            
            <div className="text-sm p-3 bg-black/30 rounded-md border border-yellow-500/50">
              <strong className="text-yellow-400 flex items-center gap-1"><AlertTriangle size={14}/> Alternative Scenario:</strong>
              <p className="text-foreground/90 mt-1">{alternativeScenario}</p>
            </div>
        </CardContent>
    </Card>
  );
};

export default PredictiveAnalysis;
