"use client";

import React from 'react';
import { ConfidenceBreakdown as ConfidenceBreakdownType } from '@/types';
import { BrainCircuit, TrendingUp, BarChart4, Network, MessageSquareQuote } from 'lucide-react';

interface ConfidenceBreakdownProps {
  breakdown: ConfidenceBreakdownType;
}

const ScoreBar = ({ label, score, icon }: { label: string; score: number, icon: React.ReactNode }) => {
  const getScoreColor = (value: number) => {
    if (value >= 85) return 'bg-green-500';
    if (value >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-1/3 flex items-center gap-2 text-xs text-foreground/80">
        {icon}
        <span>{label}</span>
      </div>
      <div className="w-2/3">
        <div className="w-full bg-primary/20 h-2.5 rounded-full">
          <div 
            className={`h-full rounded-full ${getScoreColor(score)}`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>
      <div className="w-12 text-right text-xs font-mono">{score}%</div>
    </div>
  );
};

const ConfidenceBreakdown: React.FC<ConfidenceBreakdownProps> = ({ breakdown }) => {
  return (
    <div className="mt-4 p-4 bg-black/30 rounded-lg border border-primary/20">
      <h4 className="font-headline text-lg text-primary mb-3 flex items-center gap-2">
        <BrainCircuit /> AI Confidence Matrix
      </h4>
      <div className="flex flex-col gap-2">
        <ScoreBar label="Technical Patterns" score={breakdown.technical} icon={<TrendingUp size={16} />} />
        <ScoreBar label="Volume Analysis" score={breakdown.volume} icon={<BarChart4 size={16} />} />
        <ScoreBar label="Market Structure" score={breakdown.structure} icon={<Network size={16} />} />
        <ScoreBar label="Sentiment Data" score={breakdown.sentiment} icon={<MessageSquareQuote size={16} />} />
      </div>
       <div className="mt-4 pt-3 border-t border-primary/20 flex justify-between items-center">
        <span className="font-bold text-sm">Overall Confidence Score:</span>
        <span className="font-headline text-2xl text-primary">{breakdown.overall}%</span>
      </div>
    </div>
  );
};

export default ConfidenceBreakdown;
