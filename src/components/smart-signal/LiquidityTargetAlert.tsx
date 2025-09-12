
"use client";

import React from 'react';
import { LiquidityPrediction } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BrainCircuit, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiquidityTargetAlertProps {
  prediction: LiquidityPrediction;
}

const LiquidityTargetAlert: React.FC<LiquidityTargetAlertProps> = ({ prediction }) => {
  const { targetPrice, confidence, reason } = prediction;
  
  const isBullishTarget = reason.toLowerCase().includes('bullish') || reason.toLowerCase().includes('up');
  const colorClass = isBullishTarget ? "text-green-400" : "text-red-400";
  
  return (
    <div className="p-3 rounded-lg border border-accent bg-accent/10 shadow-[0_0_15px_hsl(var(--accent)_/_0.5)]">
      <h5 className="font-headline text-accent flex items-center gap-2 mb-1">
        <BrainCircuit size={16} /> AI Liquidity Prediction
      </h5>
      <p className="text-xs text-foreground/80 italic mb-2">"{reason}"</p>
      <div className="flex items-center justify-between text-center">
        <div>
          <div className="text-xs text-foreground/70">Predicted Target</div>
          <div className={cn("font-mono text-xl font-bold", colorClass)}>{targetPrice.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs text-foreground/70">Confidence</div>
          <div className="font-mono text-lg font-bold text-primary/90">{confidence}</div>
        </div>
      </div>
    </div>
  );
};

export default LiquidityTargetAlert;
