
"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { VolumeAnalysis, LiveTradeData, VolumeSignal, BookTicker } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface VolumeAnalysisTableProps {
  data: VolumeAnalysis;
  liveData: LiveTradeData | null;
  bookTicker: BookTicker | null;
}

const calculateSignal = (ratio: number): VolumeSignal => {
    if (ratio > 1.5) return 'Strong Buy';
    if (ratio > 1.1) return 'Buy';
    if (1 / ratio > 1.5) return 'Strong Sell';
    if (1 / ratio > 1.1) return 'Sell';
    return 'Neutral';
};

const VolumeAnalysisTable: React.FC<VolumeAnalysisTableProps> = ({ data, liveData, bookTicker }) => {
  const [lastTrade, setLastTrade] = useState<'buy' | 'sell' | null>(null);

  useEffect(() => {
    if (liveData) {
      const side = liveData.side === 'Buy' ? 'buy' : liveData.side === 'Sell' ? 'sell' : null;
      if (side) {
        setLastTrade(side);
        const timer = setTimeout(() => setLastTrade(null), 300); // Effect lasts for 300ms
        return () => clearTimeout(timer);
      }
    }
  }, [liveData]);

  const volumeState = useMemo(() => {
    if (!liveData) {
      return data;
    }

    // Create a deep copy to avoid mutating the original prop data
    const newState = JSON.parse(JSON.stringify(data));

    const fiveMinData = newState['5m'];
    if (liveData.side === 'Buy') {
      fiveMinData.buyVolume += liveData.volume;
    } else if (liveData.side === 'Sell') {
      fiveMinData.sellVolume += liveData.volume;
    }
    fiveMinData.totalVolume = fiveMinData.buyVolume + fiveMinData.sellVolume;
    fiveMinData.buySellRatio = fiveMinData.sellVolume > 0 ? fiveMinData.buyVolume / fiveMinData.sellVolume : fiveMinData.buyVolume > 0 ? 100 : 1;
    fiveMinData.signal = calculateSignal(fiveMinData.buySellRatio);
    
    // Recalculate summary based on the updated 5m data
    let totalBuy = 0;
    let totalSell = 0;
    const timeframes: (keyof Omit<VolumeAnalysis, 'summary'>)[] = ['5m', '15m', '1H', '4H', '1D'];
    timeframes.forEach(tf => {
        totalBuy += newState[tf].buyVolume;
        totalSell += newState[tf].sellVolume;
    });

    newState.summary.totalBuyVolume = totalBuy;
    newState.summary.totalSellVolume = totalSell;
    const overallRatio = totalSell > 0 ? totalBuy / totalSell : totalBuy > 0 ? 100 : 1;
    newState.summary.overallSignal = calculateSignal(overallRatio);

    return newState;

  }, [data, liveData]);


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
        <TableCell></TableCell>
    </TableRow>
  );

  return (
    <div className="bg-black/30 rounded-lg border border-primary/20 p-4 space-y-3">
        <div className="flex justify-between items-center">
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
            {bookTicker && (
                <div className="flex gap-4 text-xs font-mono">
                    <div>
                        <span className="text-foreground/70">Top Bid: </span>
                        <span className="text-green-400">{bookTicker.bidPrice.toFixed(4)}</span>
                    </div>
                    <div>
                        <span className="text-foreground/70">Top Ask: </span>
                        <span className="text-red-400">{bookTicker.askPrice.toFixed(4)}</span>
                    </div>
                </div>
            )}
        </div>
      
      <Table>
        <TableHeader>
            <TableRow>
                <TableHead>Timeframe</TableHead>
                <TableHead>Buy Volume</TableHead>
                <TableHead>Sell Volume</TableHead>
                <TableHead>Signal</TableHead>
                <TableHead>Live Flow</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {timeframes.map((tf) => {
                const item = volumeState[tf];
                const isLiveTf = tf === '5m';
                return (
                    <TableRow key={tf}>
                        <TableCell className="font-bold">{tf.toUpperCase()}</TableCell>
                        <TableCell className={cn("font-mono text-green-400 transition-all duration-150", isLiveTf && lastTrade === 'buy' && 'bg-green-500/30 shadow-[0_0_15px_rgba(74,222,128,0.6)] rounded-md')}>{formatVolume(item.buyVolume)}</TableCell>
                        <TableCell className={cn("font-mono text-red-400 transition-all duration-150", isLiveTf && lastTrade === 'sell' && 'bg-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.6)] rounded-md')}>{formatVolume(item.sellVolume)}</TableCell>
                        <TableCell>{getSignalBadge(item.signal)}</TableCell>
                        <TableCell className="text-center">
                          {isLiveTf && <Zap size={16} className="text-primary/70 animate-pulse" title="Live Data Feed" />}
                        </TableCell>
                    </TableRow>
                )
            })}
            <SummaryRow summary={volumeState.summary} />
        </TableBody>
      </Table>
    </div>
  );
};

export default VolumeAnalysisTable;
