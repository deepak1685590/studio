
"use client";

import React from 'react';
import { SignalData } from '@/types';
import { TrendingUp, TrendingDown, MoveVertical, GitCommitHorizontal, GitCommit } from 'lucide-react';
import { cn } from '@/lib/utils';

const SectionHeader = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
  <h4 className="font-headline text-lg text-primary mb-2 flex items-center gap-2">{icon}{title}</h4>
);

const LevelRow: React.FC<{ label: string; value: string; icon: React.ReactNode; className?: string; }> = ({ label, value, icon, className }) => (
  <div className={cn("flex items-center justify-between p-3 bg-black/30 rounded-md border border-primary/10", className)}>
    <div className="flex items-center gap-2 text-sm text-foreground/80">
      {icon}
      <span>{label}</span>
    </div>
    <span className="font-mono font-bold text-lg">{value}</span>
  </div>
);

const KeyLevels: React.FC<{ data: SignalData }> = ({ data }) => {
  const { swingHigh, swingLow, poc, pivot, s1, r1, isBullish } = data;

  return (
    <div>
      <SectionHeader icon={<GitCommitHorizontal />} title="Key Technical Levels" />
      <div className="space-y-2">
        <LevelRow 
            label="Swing High" 
            value={`$${swingHigh}`} 
            icon={<TrendingUp size={16} />} 
            className="text-red-400 border-red-500/20" 
        />
        <LevelRow 
            label="Resistance 1 (R1)" 
            value={`$${r1}`} 
            icon={<GitCommit size={16} className="rotate-90"/>} 
            className="text-red-400/80 border-red-500/10"
        />
        <LevelRow 
            label="Point of Control (POC)" 
            value={`$${poc}`} 
            icon={<MoveVertical size={16} />} 
            className="text-amber-400 border-amber-500/20" 
        />
         <LevelRow 
            label="Pivot Point" 
            value={`$${pivot}`} 
            icon={<GitCommit size={16} className="rotate-90"/>} 
            className="text-primary/80 border-primary/20"
        />
        <LevelRow 
            label="Support 1 (S1)" 
            value={`$${s1}`} 
            icon={<GitCommit size={16} className="rotate-90"/>} 
            className="text-green-400/80 border-green-500/10"
        />
        <LevelRow 
            label="Swing Low" 
            value={`$${swingLow}`} 
            icon={<TrendingDown size={16} />} 
            className="text-green-400 border-green-500/20" 
        />
      </div>
    </div>
  );
};

export default KeyLevels;
