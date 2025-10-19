
"use client";

import React from 'react';
import { SupermodeAnalysis } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target, Shield, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';

interface TimeframeColumnProps {
    tf: keyof SupermodeAnalysis['setups'];
    data: SupermodeAnalysis['setups'][keyof SupermodeAnalysis['setups']];
    isBullish: boolean;
}

const TimeframeColumn: React.FC<TimeframeColumnProps> = ({ tf, data, isBullish }) => {
    const { entry, sl, tp1, supplyZone, demandZone, confidence } = data;
    const trendColor = isBullish ? 'text-green-400' : 'text-red-400';
    
    return (
        <Card className="bg-black/40 border-primary/30 flex flex-col">
            <CardHeader className="p-3 text-center">
                <CardTitle className="font-headline text-xl text-primary">{tf.toUpperCase()}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                    <div className="p-2 text-center rounded-lg border-2 border-accent bg-accent/20 mb-3">
                        <div className="font-bold text-accent text-sm">ENTRY</div>
                        <div className="font-mono text-lg font-bold text-white/90">{entry}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="p-1 rounded bg-red-900/40 border border-red-500/50">
                            <div className="font-bold">SL</div>
                            <div className="font-mono">{sl}</div>
                        </div>
                        <div className="p-1 rounded bg-green-900/40 border border-green-500/50">
                            <div className="font-bold">TP</div>
                            <div className="font-mono">{tp1}</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 text-center text-xs">
                     <div className="p-2 rounded bg-red-900/40 border border-red-500/50">
                        <div className="font-bold">SUPPLY ZONE</div>
                        <div className="font-mono">{supplyZone[1]} - {supplyZone[0]}</div>
                    </div>
                     <div className="p-2 rounded bg-green-900/40 border border-green-500/50">
                        <div className="font-bold">DEMAND ZONE</div>
                        <div className="font-mono">{demandZone[1]} - {demandZone[0]}</div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center text-xs text-foreground/80 mb-1 px-1">
                        <span className="font-bold flex items-center gap-1"><BrainCircuit size={14} /> Confidence</span>
                        <span className={cn("font-mono font-bold", trendColor)}>{confidence}%</span>
                    </div>
                    <Progress value={confidence} className={cn("h-2 [&>div]:bg-current", trendColor)} />
                </div>
            </CardContent>
        </Card>
    )
}

interface SupermodeDashboardProps {
  analysis: SupermodeAnalysis;
}

const SupermodeDashboard: React.FC<SupermodeDashboardProps> = ({ analysis }) => {
  const { isBullish, setups } = analysis;
  const timeframes = Object.keys(setups) as Array<keyof typeof setups>;
  
  return (
    <div className="space-y-3">
      <h3 className="font-headline text-xl text-primary text-center">Supermode Multi-Timeframe Analysis</h3>
      <div className={cn(
        "p-3 rounded-lg text-center font-bold text-lg flex items-center justify-center gap-2",
        isBullish ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
      )}>
        {isBullish ? <TrendingUp /> : <TrendingDown />}
        Primary Bias: {isBullish ? 'BULLISH' : 'BEARISH'}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {timeframes.map(tf => (
            <TimeframeColumn key={tf} tf={tf} data={setups[tf]} isBullish={isBullish} />
        ))}
      </div>
    </div>
  );
};

export default SupermodeDashboard;
