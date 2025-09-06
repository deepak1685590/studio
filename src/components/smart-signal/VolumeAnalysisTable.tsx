
"use client";

import React from 'react';
import { VolumeAnalysis, VolumeTimeframeData, LiveTradeData } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VolumeAnalysisTableProps {
  data: VolumeAnalysis;
  liveData: LiveTradeData | null;
}

const VolumeAnalysisTable: React.FC<VolumeAnalysisTableProps> = ({ data, liveData }) => {
  const timeframes: (keyof VolumeAnalysis)[] = ['5m', '15m', '1H', '4H', '1D'];

  const getDominantSideBadge = (side: VolumeTimeframeData['dominantSide'] | 'Buy' | 'Sell' | 'Neutral') => {
    switch (side) {
      case 'Buy':
        return <Badge className="bg-green-500/80 text-white text-xs">Buy</Badge>;
      case 'Sell':
        return <Badge variant="destructive" className="bg-red-500/80 text-white text-xs">Sell</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Neutral</Badge>;
    }
  };

  const formatVolume = (volume: number, live = false) => {
    if (live) return volume.toFixed(4);
    if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(1)}M`;
    if (volume >= 1_000) return `${(volume / 1_000).toFixed(1)}k`;
    return volume.toFixed(0);
  };

  const VolumeBar = ({ item }: { item: VolumeTimeframeData }) => {
    const buyPercentage = (item.buyVolume / item.totalVolume) * 100;
    return (
        <div className="w-full h-2.5 rounded-full bg-red-500/30 flex">
            <div 
                className="h-full rounded-l-full bg-green-500/70"
                style={{ width: `${buyPercentage}%` }}
            />
        </div>
    );
  };
  
  const LiveVolumeBar = () => (
      <div className="w-full h-2.5 rounded-full bg-primary/20 animate-pulse flex items-center justify-center text-[8px] text-primary">
          LIVE
      </div>
  )

  return (
    <div className="bg-black/30 rounded-lg border border-primary/20 p-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/5">Time</TableHead>
            <TableHead className="w-1/5">Dom.</TableHead>
            <TableHead className="w-2/5 text-center flex items-center gap-1">
                Volume Flow
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <HelpCircle size={12} className="text-foreground/50"/>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Green shows buying pressure.<br/>Red shows selling pressure.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </TableHead>
            <TableHead className="w-1/5 text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            {liveData && (
                 <TableRow className={cn(
                     "text-xs transition-colors duration-300",
                     liveData.side === 'Buy' ? 'bg-green-500/10' : liveData.side === 'Sell' ? 'bg-red-500/10' : ''
                 )}>
                    <TableCell className="font-bold p-2 text-primary animate-pulse">LIVE</TableCell>
                    <TableCell className="p-2">{getDominantSideBadge(liveData.side)}</TableCell>
                    <TableCell className="p-2 align-middle"><LiveVolumeBar /></TableCell>
                    <TableCell className="text-right font-mono p-2">{formatVolume(liveData.volume, true)}</TableCell>
                </TableRow>
            )}
            {timeframes.map((tf) => {
                const item = data[tf];
                return (
                    <TableRow key={tf} className="text-xs">
                    <TableCell className="font-medium p-2">{tf}</TableCell>
                    <TableCell className="p-2">{getDominantSideBadge(item.dominantSide)}</TableCell>
                    <TableCell className="p-2 align-middle">
                        <VolumeBar item={item} />
                    </TableCell>
                    <TableCell className="text-right font-mono p-2">{formatVolume(item.totalVolume)}</TableCell>
                    </TableRow>
                )
            })}
        </TableBody>
      </Table>
    </div>
  );
};

export default VolumeAnalysisTable;

    