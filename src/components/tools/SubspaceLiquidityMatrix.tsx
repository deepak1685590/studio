
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { getSignalData } from '@/lib/technical-analysis';
import type { LiquidityMatrixData } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Droplets, Search, Target, TrendingUp, TrendingDown, BrainCircuit } from 'lucide-react';

interface SubspaceLiquidityMatrixProps {
  initialSymbol?: string;
  setSelectedSymbol: (symbol: string) => void;
}

const LiquidityLevelBar: React.FC<{ level: number; volume: number; maxVolume: number; type: 'buy' | 'sell' }> = ({ level, volume, maxVolume, type }) => {
  const widthPercent = (volume / maxVolume) * 100;
  const isBuy = type === 'buy';
  
  return (
    <div className={cn("flex items-center gap-2", isBuy ? "flex-row-reverse" : "flex-row")}>
      <div className="w-24 text-center font-mono text-sm">{level.toFixed(2)}</div>
      <div className={cn("flex-1 h-6 rounded-sm relative overflow-hidden", isBuy ? "bg-green-500/10" : "bg-red-500/10")}>
        <div 
          className={cn("absolute top-0 h-full", isBuy ? "right-0 bg-green-500/50" : "left-0 bg-red-500/50")}
          style={{ width: `${widthPercent}%` }}
        ></div>
         <span className="absolute inset-0 flex items-center px-2 text-xs font-bold text-white/80">
          {isBuy ? '' : `${(volume / 1_000_000).toFixed(1)}M`}
        </span>
      </div>
    </div>
  );
};


const SubspaceLiquidityMatrix: React.FC<SubspaceLiquidityMatrixProps> = ({ initialSymbol = 'BTC', setSelectedSymbol }) => {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [data, setData] = useState<LiquidityMatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async (currentSymbol: string) => {
    setLoading(true);
    setData(null);
    try {
      // We can reuse getSignalData as it's our main data source
      const signal = await getSignalData(currentSymbol.toUpperCase(), '3', '15m');
      if (signal.liquidityMatrix) {
        setData(signal.liquidityMatrix);
      } else {
        throw new Error("Liquidity data not available.");
      }
    } catch (error) {
      console.error("Failed to fetch liquidity data:", error);
      toast({
        title: "Data Error",
        description: `Could not fetch liquidity analytics for ${currentSymbol}.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData(symbol);
  }, [symbol, fetchData]);
  
  const handleSymbolInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSymbol(e.target.value);
  }

  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-8 font-headline text-primary animate-pulse">Scanning Subspace for Liquidity Pools...</div>;
    }
    if (!data) {
      return <div className="text-center p-8">No liquidity data available for this asset.</div>;
    }

    const { buySide, sellSide, prediction, currentPrice } = data;
    const allLevels = [...buySide, ...sellSide];
    const maxVolume = Math.max(...allLevels.map(l => l.volume));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sell-Side Liquidity */}
        <div className="space-y-2">
            <h4 className="font-headline text-lg text-red-400 flex items-center gap-2"><TrendingDown /> Sell-Side Liquidity</h4>
            {sellSide.map(level => (
                <LiquidityLevelBar key={level.price} level={level.price} volume={level.volume} maxVolume={maxVolume} type="sell" />
            ))}
        </div>

        {/* Center Console */}
        <div className="flex flex-col items-center justify-center space-y-4 p-4 rounded-lg border-2 border-primary/50 bg-black/50 shadow-[0_0_25px_rgba(0,230,230,0.5)]">
            <div className="text-center">
                <div className="font-headline text-2xl text-primary animate-flicker">{symbol.toUpperCase()}</div>
                <div className="font-mono text-3xl font-bold">{currentPrice.toFixed(2)}</div>
                <div className="text-xs text-foreground/70">Live Price</div>
            </div>
            
            <div className="w-full text-center p-3 rounded-lg border border-accent bg-accent/10 shadow-[0_0_15px_hsl(var(--accent)_/_0.5)]">
                <h5 className="font-headline text-accent flex items-center justify-center gap-2"><BrainCircuit size={16}/> AI Prediction</h5>
                <p className="text-sm text-foreground/80 mt-1">{prediction.reason}</p>
                <div className="mt-2 font-mono text-2xl text-white font-bold">{prediction.targetPrice.toFixed(2)}</div>
                <div className="text-xs text-accent/80">Predicted Liquidity Target ({prediction.confidence} Confidence)</div>
            </div>
        </div>

        {/* Buy-Side Liquidity */}
        <div className="space-y-2">
            <h4 className="font-headline text-lg text-green-400 flex items-center justify-end gap-2"><TrendingUp /> Buy-Side Liquidity</h4>
            {buySide.map(level => (
                <LiquidityLevelBar key={level.price} level={level.price} volume={level.volume} maxVolume={maxVolume} type="buy" />
            ))}
        </div>
      </div>
    )
  }

  return (
    <Card className="bg-black/50 border-2 border-primary/50 shadow-[0_0_25px_rgba(0,230,230,0.3)]">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-primary flex items-center gap-2">
          <Droplets /> Subspace Liquidity Matrix
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input 
              value={symbol}
              onChange={handleSymbolInputChange}
              placeholder="e.g. BTC, EUR/USD"
              className="bg-input text-foreground border-primary/50"
          />
          <Button onClick={() => fetchData(symbol)} disabled={loading} className="font-headline scanner-glow">
            <Search className="mr-2" />
            {loading ? 'Scanning...' : 'Scan'}
          </Button>
        </div>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default SubspaceLiquidityMatrix;
