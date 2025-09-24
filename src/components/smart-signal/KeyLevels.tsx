
"use client";

import React from 'react';
import { SignalData } from '@/types';
import { TrendingUp, TrendingDown, MoveVertical, GitCommitHorizontal, GitCommit, Layers, Target, BoxSelect } from 'lucide-react';
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

const LevelGroup: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div>
        <h5 className={cn("font-bold mb-2 text-center", className)}>{title}</h5>
        <div className="space-y-2">{children}</div>
    </div>
);


const KeyLevels: React.FC<{ data: SignalData, livePrice: number | null }> = ({ data, livePrice }) => {
  const { swingHigh, swingLow, poc, pivot, s1, r1, vah, val, isBullish, supplyZone, demandZone } = data;
  const isCrypto = !data.symbol.includes('/');

  return (
    <div>
      <SectionHeader icon={<Layers />} title="Key Technical Levels" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <LevelGroup title="Resistance Levels" className="text-red-400">
            <LevelRow 
                label="Swing High" 
                value={`$${swingHigh}`} 
                icon={<TrendingUp size={16} />} 
                className="text-red-400 border-red-500/20" 
            />
            <LevelRow 
                label="Supply Zone" 
                value={`$${parseFloat(supplyZone[1]).toFixed(isCrypto ? 2 : 4)} - ${parseFloat(supplyZone[0]).toFixed(isCrypto ? 2 : 4)}`}
                icon={<BoxSelect size={16} />} 
                className="text-red-400/95 border-red-500/18" 
            />
             <LevelRow 
                label="Value Area High" 
                value={`$${vah}`} 
                icon={<GitCommitHorizontal size={16} />} 
                className="text-red-400/90 border-red-500/15" 
            />
            <LevelRow 
                label="Resistance 1 (R1)" 
                value={`$${r1}`} 
                icon={<GitCommit size={16} className="rotate-90"/>} 
                className="text-red-400/80 border-red-500/10"
            />
        </LevelGroup>

        <LevelGroup title="Core Levels" className="text-amber-400">
            <LevelRow 
                label="Point of Control" 
                value={`$${poc}`} 
                icon={<Target size={16} />} 
                className="text-amber-400 border-amber-500/20" 
            />
            <LevelRow 
                label="Pivot Point" 
                value={`$${pivot}`} 
                icon={<MoveVertical size={16} />} 
                className="text-primary/80 border-primary/20"
            />
        </LevelGroup>
        
        <LevelGroup title="Support Levels" className="text-green-400">
             <LevelRow 
                label="Value Area Low" 
                value={`$${val}`} 
                icon={<GitCommitHorizontal size={16} />} 
                className="text-green-400/90 border-green-500/15" 
            />
             <LevelRow 
                label="Demand Zone" 
                value={`$${parseFloat(demandZone[1]).toFixed(isCrypto ? 2 : 4)} - ${parseFloat(demandZone[0]).toFixed(isCrypto ? 2 : 4)}`}
                icon={<BoxSelect size={16} />} 
                className="text-green-400/95 border-green-500/18" 
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
        </LevelGroup>
        
      </div>
    </div>
  );
};

export default KeyLevels;
