
"use client";

import React from 'react';
import type { GenerateAiInsightOutput } from '@/types';
import { Target, Lightbulb, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { cn } from '@/lib/utils';

interface PredictiveAnalysisProps {
  analysis: GenerateAiInsightOutput['predictiveAnalysis'];
  isBullish: boolean;
}

const PredictiveAnalysis: React.FC<PredictiveAnalysisProps> = ({ analysis, isBullish }) => {
  return (
    <div className="p-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg border border-accent/50 shadow-[0_0_15px_hsl(var(--accent)_/_0.5)]">
      <h4 className="font-headline text-lg text-accent flex items-center gap-2 mb-2">
        <Target /> Predictive Analysis
      </h4>
      <div className="space-y-3">
        <div className="text-sm">
          <strong className="text-accent/80 block">Primary Scenario:</strong>
          <p className="text-foreground/90 italic">"{analysis.primaryScenario}"</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-accent/80">Timeframe</TableHead>
              <TableHead className={cn("text-right", isBullish ? "text-green-400" : "text-red-400")}>
                Predicted Target
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Short-Term (5-15m)</TableCell>
              <TableCell className="text-right font-mono font-bold text-lg">{analysis.predictedTarget.shortTerm}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Intraday (1-4h)</TableCell>
              <TableCell className="text-right font-mono font-bold text-lg">{analysis.predictedTarget.intraday}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Swing (Daily+)</TableCell>
              <TableCell className="text-right font-mono font-bold text-lg">{analysis.predictedTarget.swing}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs pt-2">
          <div className="flex flex-col">
            <span className="text-foreground/70">Overall Timeframe:</span>
            <span className="font-mono text-foreground/90">{analysis.timeframe}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-foreground/70">Success Probability:</span>
            <span className="font-mono font-bold text-lg text-green-400">{analysis.successProbability}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-foreground/70">Invalidation Level:</span>
            <span className="font-mono text-yellow-400">{analysis.invalidationLevel}</span>
          </div>
        </div>

        <div className="text-sm pt-2">
          <strong className="text-accent/80 flex items-center gap-1"><Lightbulb size={14}/> Key Catalysts:</strong>
          <p className="text-foreground/90">{analysis.keyCatalysts}</p>
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
