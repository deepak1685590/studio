
"use client";

import React from 'react';
import { SuperTrendAnalysis } from '@/types';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Hourglass, PauseCircle, Zap, Power, LogIn, LogOut, ShieldAlert } from 'lucide-react';
import { Progress } from '../ui/progress';

interface QuantumSuperTrendMatrixProps {
  analysis: SuperTrendAnalysis;
}

const InfoBox: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="text-center">
        <div className={cn("flex items-center justify-center gap-1 text-sm", color)}>
            {icon} {title}
        </div>
        <div className={cn("font-mono text-xl font-bold", color)} style={{ textShadow: `0 0 8px currentColor`}}>
            ${value}
        </div>
    </div>
);

const QuantumSuperTrendMatrix: React.FC<QuantumSuperTrendMatrixProps> = ({ analysis }) => {
  const { status, superTrendLine, trendStrength, entrySignal, exitSignal, momentumDecay } = analysis;

  const config = {
    'Uptrend Developing': { icon: <TrendingUp />, color: 'text-cyan-400', bg: 'bg-cyan-900/30', border: 'border-cyan-500/50', shadow: 'shadow-cyan-500/30' },
    'Uptrend Mature': { icon: <TrendingUp />, color: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-500/50', shadow: 'shadow-green-500/30' },
    'Downtrend Developing': { icon: <TrendingDown />, color: 'text-orange-400', bg: 'bg-orange-900/30', border: 'border-orange-500/50', shadow: 'shadow-orange-500/30' },
    'Downtrend Mature': { icon: <TrendingDown />, color: 'text-red-400', bg: 'bg-red-900/30', border: 'border-red-500/50', shadow: 'shadow-red-500/30' },
    'Trend Exhaustion': { icon: <Hourglass />, color: 'text-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-500/50', shadow: 'shadow-yellow-500/30' },
    'Consolidation': { icon: <PauseCircle />, color: 'text-gray-400', bg: 'bg-gray-800/30', border: 'border-gray-600/50', shadow: 'shadow-gray-600/30' },
  }[status];
  
  const isUp = status.includes('Uptrend');

  return (
    <div className={cn("p-4 rounded-lg border-2 space-y-4", config.bg, config.border, `shadow-[0_0_20px_var(--tw-shadow-color)]`)}>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center text-center">
            <div className={cn("flex items-center gap-2 font-headline text-lg", config.color)}>
            {config.icon}
            {status}
            </div>
        </div>
        <div className="w-full md:w-auto flex items-center gap-2">
            <div className="text-sm text-foreground/70 flex items-center justify-center gap-1">
                <Power size={14} /> Trend Strength
            </div>
            <Progress value={trendStrength} className={cn("h-3 w-24", "[&>div]:bg-current", config.color)} />
            <span className={cn("font-mono font-bold text-lg", config.color)}>{trendStrength}%</span>
        </div>
        <div className="w-full md:w-auto flex items-center gap-2">
            <div className="text-sm text-foreground/70 flex items-center justify-center gap-1">
                <ShieldAlert size={14} /> Trend Exhaustion
            </div>
            <Progress value={momentumDecay} className="h-3 w-24 [&>div]:bg-yellow-400" />
            <span className="font-mono font-bold text-lg text-yellow-400">{momentumDecay}%</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-primary/20">
         <InfoBox 
            title={isUp ? "Long Entry Signal" : "Short Entry Signal"}
            value={entrySignal.toFixed(2)}
            icon={<LogIn size={16}/>}
            color={isUp ? "text-green-400" : "text-red-400"}
         />
          <InfoBox 
            title="SuperTrend Line"
            value={superTrendLine.toFixed(2)}
            icon={<Zap size={16}/>}
            color="text-primary"
         />
         <InfoBox 
            title={isUp ? "Long Exit Signal" : "Short Exit Signal"}
            value={exitSignal.toFixed(2)}
            icon={<LogOut size={16}/>}
            color="text-yellow-400"
         />
      </div>
    </div>
  );
};

export default QuantumSuperTrendMatrix;
