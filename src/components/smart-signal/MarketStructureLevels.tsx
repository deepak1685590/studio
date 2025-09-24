
"use client";

import React from 'react';
import type { HistoricalLevels } from '@/types';
import { Landmark, ArrowUp, ArrowDown, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketStructureLevelsProps {
  levels: HistoricalLevels;
  livePrice: number;
  isCrypto: boolean;
}

const LevelRow: React.FC<{ label: string; value: number; livePrice: number; isCrypto: boolean }> = ({ label, value, livePrice, isCrypto }) => {
  const isBreached = livePrice > value;
  const isNear = Math.abs(livePrice - value) / value < 0.001; // within 0.1%

  let statusIcon: React.ReactNode;
  let statusColor = 'text-foreground/70';
  let statusText = 'Untested';

  if (isNear) {
    statusIcon = <ArrowLeftRight size={16} className="text-amber-400 animate-pulse" />;
    statusColor = 'text-amber-400';
    statusText = 'Testing Level';
  } else if (livePrice > value) {
    statusIcon = <ArrowUp size={16} className="text-green-400" />;
    statusColor = 'text-green-400';
    statusText = 'Above Level';
  } else {
    statusIcon = <ArrowDown size={16} className="text-red-400" />;
    statusColor = 'text-red-400';
    statusText = 'Below Level';
  }

  return (
    <div className={cn(
        "flex flex-col sm:flex-row items-center justify-between p-3 bg-black/30 rounded-md border border-primary/10 transition-all duration-300",
        isNear && "bg-amber-900/40 border-amber-500/50"
    )}>
      <div className="font-bold text-sm text-foreground/80">{label}</div>
      <div className="flex items-center gap-4">
        <span className="font-mono text-lg font-bold text-primary">${value.toFixed(isCrypto ? 2 : 4)}</span>
        <div className={cn("flex items-center gap-1 text-xs font-bold", statusColor)}>
          {statusIcon}
          {statusText}
        </div>
      </div>
    </div>
  );
};

const MarketStructureLevels: React.FC<MarketStructureLevelsProps> = ({ levels, livePrice, isCrypto }) => {
  if (!levels) return null;

  return (
    <div className="p-4 bg-black/30 rounded-lg border border-accent/50 shadow-[0_0_15px_hsl(var(--accent)_/_0.3)]">
      <h4 className="font-headline text-lg text-primary mb-2 flex items-center gap-2">
        <Landmark /> Historical Market Structure
      </h4>
      <div className="space-y-2">
        <LevelRow label="Previous Week High (PWH)" value={levels.pwh} livePrice={livePrice} isCrypto={isCrypto} />
        <LevelRow label="Previous Day High (PDH)" value={levels.pdh} livePrice={livePrice} isCrypto={isCrypto} />
        <LevelRow label="Today's Day High (TDH)" value={levels.tdh} livePrice={livePrice} isCrypto={isCrypto} />
        <LevelRow label="Today's Day Low (TDL)" value={levels.tdl} livePrice={livePrice} isCrypto={isCrypto} />
        <LevelRow label="Previous Day Low (PDL)" value={levels.pdl} livePrice={livePrice} isCrypto={isCrypto} />
        <LevelRow label="Previous Week Low (PWL)" value={levels.pwl} livePrice={livePrice} isCrypto={isCrypto} />
      </div>
    </div>
  );
};

export default MarketStructureLevels;
