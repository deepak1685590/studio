
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

  const VolumeRow: React.FC<{ timeframe: string; item: VolumeTimeframeData }> = ({ timeframe, item }) => {
    const buyPercentage = item.totalVolume > 0 ? (item.buyVolume / item.totalVolume) * 100 : 50;
    const sellPercentage = 100 - buyPercentage;
    const isBuyDominant = buyPercentage > 51;
    const isSellDominant = sellPercentage > 51;
    
    const glowClass = isBuyDominant 
      ? 'shadow-[0_0_15px_rgba(74,222,128,0.3)]' 
      : isSellDominant 
      ? 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
      : '';

    return (
      <div className={cn("grid grid-cols-5 items-center gap-2 p-2 rounded-md bg-black/40 border border-primary/10 transition-shadow duration-300", glowClass)}>
        <div className="col-span-1 font-bold text-sm text-primary/90">{timeframe}</div>
        <div className="col-span-4">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-green-400 font-bold">BUY: {buyPercentage.toFixed(1)}%</span>
            <span className="text-red-400 font-bold">SELL: {sellPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-red-500/30 flex overflow-hidden">
            <div 
                className="h-full bg-green-500/70 transition-all duration-500"
                style={{ width: `${buyPercentage}%` }}
            />
          </div>
           <div className="text-right text-xs text-foreground/70 mt-1 font-mono">
            Total Vol: {formatVolume(item.totalVolume)}
           </div>
        </div>
      </div>
    );
  };

  const LiveRow: React.FC<{ liveData: LiveTradeData }> = ({ liveData }) => {
    const isBuy = liveData.side === 'Buy';
    const isSell = liveData.side === 'Sell';
    
    return (
      <div className={cn(
          "p-2 rounded-md bg-black/40 border-2",
          isBuy && "border-green-400/50",
          isSell && "border-red-400/50",
          !isBuy && !isSell && "border-primary/30"
        )}>
        <div className="flex justify-between items-center">
            <Badge className="bg-primary/80 text-primary-foreground animate-pulse text-xs">LIVE FEED</Badge>
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
