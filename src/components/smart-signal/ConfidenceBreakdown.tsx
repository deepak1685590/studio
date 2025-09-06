
"use client";

import React, { useState, useEffect } from 'react';
import { ConfidenceBreakdown as ConfidenceBreakdownType } from '@/types';
import { BrainCircuit, TrendingUp, BarChart4, Layers, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfidenceBreakdownProps {
  breakdown: ConfidenceBreakdownType;
  isBullish: boolean;
}

const ScoreBar = ({ label, score, icon, isBullish }: { label: string; score: number, icon: React.ReactNode, isBullish: boolean }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedScore(score);
    }, 100); // Small delay to trigger transition
    return () => clearTimeout(timeout);
  }, [score]);

  const getScoreColor = (value: number) => {
    if (isBullish) {
      if (value >= 85) return 'bg-green-400';
      if (value >= 70) return 'bg-teal-400';
      return 'bg-yellow-500';
    }
    // Bearish
    if (value >= 85) return 'bg-red-500';
    if (value >= 70) return 'bg-rose-500';
    return 'bg-orange-500';
  };
  
  const scoreColor = getScoreColor(score);

  return (
    <div className="flex items-center gap-3">
      <div className="w-1/3 flex items-center gap-2 text-xs text-foreground/80">
        {icon}
        <span>{label}</span>
      </div>
      <div className="w-2/3">
        <div className="w-full bg-primary/10 h-3 rounded-full overflow-hidden">
          <div 
            className={cn('h-full rounded-full transition-all duration-1000 ease-out', scoreColor)}
            style={{ width: `${animatedScore}%`, boxShadow: `0 0 8px var(--tw-shadow-color)` }}
          ></div>
        </div>
      </div>
      <div className="w-12 text-right text-xs font-mono">{score}%</div>
    </div>
  );
};

const ConfidenceBreakdown: React.FC<ConfidenceBreakdownProps> = ({ breakdown, isBullish }) => {
  const overallColor = isBullish 
    ? (breakdown.overall > 75 ? 'text-green-400' : 'text-yellow-400')
    : (breakdown.overall > 75 ? 'text-red-400' : 'text-orange-400');
    
  const glowColor = isBullish 
    ? (breakdown.overall > 75 ? 'shadow-green-400/50' : 'shadow-yellow-400/50')
    : (breakdown.overall > 75 ? 'shadow-red-400/50' : 'shadow-orange-400/50');

  return (
    <div className={cn("mt-4 p-4 bg-black/30 rounded-lg border border-primary/20 transition-shadow duration-500 animate-pulse-glow", glowColor)}>
      <h4 className="font-headline text-lg text-primary mb-3 flex items-center gap-2">
        <BrainCircuit /> AI Confidence Matrix
      </h4>
      <div className="flex flex-col gap-3">
        <ScoreBar label="Pattern Strength" score={breakdown.patternStrength} icon={<TrendingUp size={16} />} isBullish={isBullish} />
        <ScoreBar label="Volume Confirmation" score={breakdown.volumeConfirmation} icon={<BarChart4 size={16} />} isBullish={isBullish} />
        <ScoreBar label="HTF Alignment" score={breakdown.htfAlignment} icon={<Layers size={16} />} isBullish={isBullish} />
        <ScoreBar label="Smart Money Flow" score={breakdown.smartMoneyFlow} icon={<DollarSign size={16} />} isBullish={isBullish} />
      </div>
       <div className="mt-4 pt-3 border-t border-primary/20 flex justify-between items-center">
        <span className="font-bold text-sm">Overall Confidence Score:</span>
        <span className={cn("font-headline text-3xl", overallColor)} style={{textShadow: '0 0 15px currentColor'}}>{breakdown.overall}%</span>
      </div>
    </div>
  );
};

export default ConfidenceBreakdown;
