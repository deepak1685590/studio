
"use client";

import React from 'react';
import { VolumeAnalysis, VolumeTimeframeData, LiveTradeData } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VolumeAnalysisTableProps {
  data: VolumeAnalysis;
  liveData: LiveTradeData | null;
}

const VolumeAnalysisTable: React.FC<VolumeAnalysisTableProps> = ({ data, liveData }) => {
  const timeframes: (keyof VolumeAnalysis)[] = ['5m', '15m', '1H', '4H', '1D'];

  const formatVolume = (volume: number, live = false) => {
    if (live) return volume.toFixed(4);
    if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(1)}M`;
    if (volume >= 1_000) return `${(volume / 1_000).toFixed(1)}k`;
    return volume.toFixed(0);
  };

  const QuantumFlowMeter: React.FC<{ buyPercent: number }> = ({ buyPercent }) => {
    const sellPercent = 100 - buyPercent;
    const isBuyDominant = buyPercent > 51;
    const isSellDominant = buyPercent < 49;
    const dominantPercent = isBuyDominant ? buyPercent : sellPercent;

    const needleRotation = (buyPercent - 50) * 1.8; // Map 0-100 to -90 to 90 degrees

    return (
      <div className="relative h-20 w-full">
        <svg width="100%" height="100%" viewBox="0 0 200 100">
          {/* Background Arc */}
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="hsl(var(--primary) / 0.1)" strokeWidth="12" />
          
          {/* Sell Side Fill */}
          <path d="M 20 100 A 80 80 0 0 1 100 20" fill="none" stroke="url(#sellGradient)" strokeWidth="12" />
          
          {/* Buy Side Fill */}
          <path d="M 100 20 A 80 80 0 0 1 180 100" fill="none" stroke="url(#buyGradient)" strokeWidth="12" />
          
           {/* Center Dominance Text */}
          <text x="100" y="70" textAnchor="middle" fill={isBuyDominant ? '#4ade80' : isSellDominant ? '#f87171' : 'hsl(var(--foreground))'} fontSize="20" fontWeight="bold" className="font-headline" style={{filter: `drop-shadow(0 0 5px currentColor)`}}>
            {dominantPercent.toFixed(0)}%
          </text>
          <text x="100" y="88" textAnchor="middle" fill="hsl(var(--foreground) / 0.8)" fontSize="12" className="font-code">
            {isBuyDominant ? 'BUY' : isSellDominant ? 'SELL' : 'NEUTRAL'}
          </text>

          {/* Needle */}
          <g transform={`rotate(${needleRotation}, 100, 100)`}>
              <line x1="100" y1="100" x2="100" y2="30" stroke="hsl(var(--primary))" strokeWidth="3" style={{filter: `drop-shadow(0 0 5px hsl(var(--primary)))`}} />
              <circle cx="100" cy="100" r="5" fill="hsl(var(--primary))" />
          </g>

          <defs>
            <linearGradient id="buyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={isBuyDominant ? 0.9 : 0.2} />
              <stop offset="100%" stopColor="#4ade80" stopOpacity={isBuyDominant ? 1 : 0.3} />
            </linearGradient>
            <linearGradient id="sellGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f87171" stopOpacity={isSellDominant ? 1 : 0.3} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={isSellDominant ? 0.9 : 0.2} />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  const VolumeRow: React.FC<{ timeframe: string; item: VolumeTimeframeData }> = ({ timeframe, item }) => {
    const buyPercentage = item.totalVolume > 0 ? (item.buyVolume / item.totalVolume) * 100 : 50;
    
    return (
      <div className="grid grid-cols-5 items-center gap-2 p-2 rounded-md bg-black/40 border border-primary/10">
        <div className="col-span-1 text-center">
            <div className="font-bold text-lg text-primary/90">{timeframe}</div>
            <div className="font-mono text-xs text-foreground/70">{formatVolume(item.totalVolume)}</div>
        </div>
        <div className="col-span-4">
          <QuantumFlowMeter buyPercent={buyPercentage} />
        </div>
      </div>
    );
  };

  const LiveRow: React.FC<{ liveData: LiveTradeData }> = ({ liveData }) => {
    const isBuy = liveData.side === 'Buy';
    const isSell = liveData.side === 'Sell';
    
    return (
      <div className={cn(
          "p-2 rounded-md bg-black/40 border-2 transition-all duration-200",
          isBuy && "border-green-400/50 animate-pulse",
          isSell && "border-red-400/50 animate-pulse",
          !isBuy && !isSell && "border-primary/30"
        )}>
        <div className="flex justify-between items-center">
            <Badge className="bg-primary/80 text-primary-foreground text-xs">LIVE FEED</Badge>
            <div className="text-right">
                <div className="text-xs text-foreground/70">Last Trade</div>
                <div className={cn(
                    "font-mono text-lg font-bold",
                    isBuy && "text-green-400",
                    isSell && "text-red-400"
                )}>
                    {formatVolume(liveData.volume, true)}
                </div>
            </div>
        </div>
        <div className="relative h-1 w-full bg-primary/20 rounded-full overflow-hidden mt-1">
            <div className="absolute top-0 left-0 h-full w-1/4 bg-gradient-to-r from-transparent to-primary animate-[progress-scan_2s_infinite_linear]"/>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black/30 rounded-lg border border-primary/20 p-4 space-y-3">
        <h3 className="font-headline text-lg text-primary flex items-center gap-2">
            <Sparkles size={18} /> Volume Intelligence
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <HelpCircle size={14} className="text-foreground/50"/>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Real-time and aggregated volume analysis across key timeframes.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </h3>
      
      {liveData && <LiveRow liveData={liveData} />}

      {timeframes.map((tf) => (
        <VolumeRow key={tf} timeframe={tf.toUpperCase()} item={data[tf]} />
      ))}
    </div>
  );
};

export default VolumeAnalysisTable;
