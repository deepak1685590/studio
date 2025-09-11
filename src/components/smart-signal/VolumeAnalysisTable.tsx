
"use client";

import React from 'react';
import { VolumeAnalysis, VolumeTimeframeData, LiveTradeData, VolumeSignal } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface VolumeAnalysisTableProps {
  data: VolumeAnalysis;
  liveData: LiveTradeData | null;
}

const VolumeAnalysisTable: React.FC<VolumeAnalysisTableProps> = ({ data, liveData }) => {
  const timeframes: (keyof Omit<VolumeAnalysis, 'summary'>)[] = ['5m', '15m', '1H', '4H', '1D'];

  const formatVolume = (volume: number) => {
    if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(1)}M`;
    if (volume >= 1_000) return `${(volume / 1_000).toFixed(1)}k`;
    return volume.toFixed(0);
  };

  const getSignalBadge = (signal: VolumeSignal) => {
    const styles = {
      'Strong Buy': 'bg-green-500/80 text-white',
      'Buy': 'bg-green-500/30 text-green-300',
      'Strong Sell': 'bg-red-500/80 text-white',
      'Sell': 'bg-red-500/30 text-red-300',
      'Neutral': 'bg-gray-500/30 text-gray-300',
    };
    return <Badge className={cn("font-bold", styles[signal])}>{signal}</Badge>;
  };

  const SummaryRow: React.FC<{ summary: VolumeAnalysis['summary']}> = ({ summary }) => (
     <TableRow className="bg-primary/10 border-t-2 border-primary">
        <TableCell className="font-bold text-primary">Overall</TableCell>
        <TableCell className="font-mono text-green-400">{formatVolume(summary.totalBuyVolume)}</TableCell>
        <TableCell className="font-mono text-red-400">{formatVolume(summary.totalSellVolume)}</TableCell>
        <TableCell>{getSignalBadge(summary.overallSignal)}</TableCell>
    </TableRow>
  );

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
                        <p>Multi-timeframe analysis of buying vs. selling pressure.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </h3>
      
      <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Timeframe</TableHead>
                <TableHead>Buy Volume</TableHead>
                <TableHead>Sell Volume</TableHead>
                <TableHead>Signal</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {timeframes.map((tf) => {
                const item = data[tf];
                return (
                    <TableRow key={tf}>
                        <TableCell className="font-bold">{tf.toUpperCase()}</TableCell>
                        <TableCell className="font-mono text-green-400">{formatVolume(item.buyVolume)}</TableCell>
                        <TableCell className="font-mono text-red-400">{formatVolume(item.sellVolume)}</TableCell>
                        <TableCell>{getSignalBadge(item.signal)}</TableCell>
                    </TableRow>
                )
            })}
            <SummaryRow summary={data.summary} />
        </TableBody>
      </Table>
    </div>
  );
};

export default VolumeAnalysisTable;
