
"use client";

import React from 'react';
import { SuperTrendAnalysis } from '@/types';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Hourglass, PauseCircle, Zap } from 'lucide-react';
import { Progress } from '../ui/progress';

interface QuantumSuperTrendMatrixProps {
  analysis: SuperTrendAnalysis;
}

const QuantumSuperTrendMatrix: React.FC<QuantumSuperTrendMatrixProps> = ({ analysis }) => {
  const { status, superTrendLine, momentumDecay } = analysis;

  const config = {
    'Uptrend Developing': { icon: <TrendingUp />, color: 'text-cyan-400', bg: 'bg-cyan-900/30', border: 'border-cyan-500/50', shadow: 'shadow-cyan-500/30' },
    'Uptrend Mature': { icon: <TrendingUp />, color: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-500/50', shadow: 'shadow-green-500/30' },
    'Downtrend Developing': { icon: <TrendingDown />, color: 'text-orange-400', bg: 'bg-orange-900/30', border: 'border-orange-500/50', shadow: 'shadow-orange-500/30' },
    'Downtrend Mature': { icon: <TrendingDown />, color: 'text-red-400', bg: 'bg-red-900/30', border: 'border-red-500/50', shadow: 'shadow-red-500/30' },
    'Trend Exhaustion': { icon: <Hourglass />, color: 'text-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-500/50', shadow: 'shadow-yellow-500/30' },
    'Consolidation': { icon: <PauseCircle />, color: 'text-gray-400', bg: 'bg-gray-800/30', border: 'border-gray-600/50', shadow: 'shadow-gray-600/30' },
  }[status];
  
  const isUp = status.includes('Uptrend');
  const isDown = status.includes('Downtrend');

  return (
    <div className={cn("p-4 rounded-lg border-2 grid grid-cols-1 md:grid-cols-3 gap-4 items-center", config.bg, config.border, `shadow-[0_0_20px_var(--tw-shadow-color)]`)}>
      <div className="md:col-span-1 flex flex-col items-center text-center">
        <div className={cn("flex items-center gap-2 font-headline text-lg", config.color)}>
          {config.icon}
          {status}
        </div>
      </div>
      <div className="md:col-span-1 text-center">
        <div className="text-sm text-foreground/70">SuperTrend Line</div>
        <div className={cn("font-mono text-2xl font-bold", isUp ? 'text-green-300' : isDown ? 'text-red-300' : 'text-primary')}>
            ${superTrendLine.toFixed(2)}
        </div>
      </div>
       <div className="md:col-span-1 text-center">
        <div className="text-sm text-foreground/70 flex items-center justify-center gap-1">
            <Zap size={14} /> Momentum Decay
        </div>
        <div className="flex items-center gap-2">
            <Progress value={momentumDecay} className={cn("h-3", "[&>div]:bg-current", config.color)} />
            <span className={cn("font-mono font-bold text-lg", config.color)}>{momentumDecay}%</span>
        </div>
      </div>
    </div>
  );
};

export default QuantumSuperTrendMatrix;
