
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { getSignalData } from '@/lib/technical-analysis';
import type { SignalData, AdvancedStrengthDashboardData } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Gauge, Flame, Snowflake, Volume, BarChartBig, BrainCircuit, Activity, Clock, Waves, Search } from 'lucide-react';

interface AdvancedStrengthDashboardProps {
  initialSymbol?: string;
  setSelectedSymbol: (symbol: string) => void;
}

const DashboardRow: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode; tooltip?: string; }> = ({ label, value, icon, tooltip }) => (
  <div className="flex items-center justify-between p-2 bg-black/30 rounded-md border border-primary/10">
    <div className="flex items-center gap-2 text-sm text-foreground/80">
      {icon}
      <span>{label}</span>
    </div>
    <div className="font-mono text-base font-bold text-primary">{value}</div>
  </div>
);

const StrengthMeter: React.FC<{ value: number; segments?: number }> = ({ value, segments = 10 }) => {
    const activeSegments = Math.round((value / 100) * segments);
    const color = value > 50 ? 'bg-green-500' : value < 50 ? 'bg-red-500' : 'bg-yellow-500';
    
    return (
        <div className="flex gap-1 w-24">
            {Array.from({ length: segments }).map((_, i) => (
                <div key={i} className={cn("h-4 flex-1 rounded-sm", i < activeSegments ? color : 'bg-primary/10')} />
            ))}
        </div>
    );
};


const AdvancedStrengthDashboard: React.FC<AdvancedStrengthDashboardProps> = ({ initialSymbol = 'BTC', setSelectedSymbol }) => {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [data, setData] = useState<AdvancedStrengthDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async (currentSymbol: string) => {
    setLoading(true);
    setData(null);
    try {
      const signal = await getSignalData(currentSymbol.toUpperCase(), '3', '15m');
      if (signal.advancedStrengthDashboard) {
        setData(signal.advancedStrengthDashboard);
      } else {
        throw new Error("Advanced data not available.");
      }
    } catch (error) {
      console.error("Failed to fetch advanced strength data:", error);
      toast({
        title: "Data Error",
        description: `Could not fetch advanced analytics for ${currentSymbol}.`,
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
      return <div className="text-center p-8">Loading Advanced Data...</div>;
    }
    if (!data) {
      return <div className="text-center p-8">No data available for this asset.</div>;
    }

    const trendColor = data.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400';
    const trendIcon = data.priceChangePercent >= 0 ? <TrendingUp className={cn("inline-block", trendColor)} /> : <TrendingDown className={cn("inline-block", trendColor)} />;
    
    return (
        <div className="space-y-4">
            <DashboardRow label="Market Phase" value={<span className="text-amber-400">{data.marketPhase}</span>} icon={<Waves />} />
            <DashboardRow 
                label="Current Price" 
                value={
                    <div className={cn("flex items-center gap-2", trendColor)}>
                        {trendIcon} {data.price} ({data.priceChangePercent.toFixed(2)}%)
                    </div>
                }
                icon={<Activity />} 
            />
            <DashboardRow label="Market Sentiment" value={data.marketSentiment.label} icon={<BrainCircuit />} />
            
            <h4 className="font-headline text-lg text-primary pt-2">Strength Analysis</h4>
            <DashboardRow label="Momentum (RSI)" value={`${data.momentum.rsi.toFixed(0)} - ${data.momentum.trend}`} icon={<Gauge />} />
            <DashboardRow label="Long Power" value={<StrengthMeter value={data.longPower} />} icon={<Flame className="text-green-400"/>} />
            <DashboardRow label="Short Power" value={<StrengthMeter value={100 - data.shortPower} />} icon={<Snowflake className="text-red-400"/>} />
            <DashboardRow label="Overall Strength" value={`${data.overallStrength}%`} icon={<Gauge />} />

            <h4 className="font-headline text-lg text-primary pt-2">Technical Indicators</h4>
            <DashboardRow label="Trend Analysis" value={`${data.trendAnalysis.strength.toFixed(0)}% - ${data.trendAnalysis.momentum}`} icon={<TrendingUp />} />
            <DashboardRow label="Volatility (ATR)" value={`${data.volatility.label} (${data.volatility.percent.toFixed(2)}%)`} icon={<Activity />} />
            <DashboardRow label="Volume Status" value={`${data.volumeStatus.status} (${data.volumeStatus.changePercent > 0 ? '+' : ''}${data.volumeStatus.changePercent.toFixed(0)}%)`} icon={<Volume />} />
            <DashboardRow label="Volume Meter" value={<StrengthMeter value={Math.min(100, 50 + data.volumeStatus.changePercent / 2)} />} icon={<BarChartBig />} />
            <DashboardRow label="Volume" value={data.volumeValue.toLocaleString(undefined, { notation: 'compact' })} icon={<Volume />} />
            
            <h4 className="font-headline text-lg text-primary pt-2">RSI Analysis</h4>
            <DashboardRow label="RSI Status" value={data.rsiStatus} icon={<Gauge />} />
            <DashboardRow label="RSI Divergence" value={data.divergence} icon={<Activity />} />
            <DashboardRow label="Stoch RSI (K/D)" value={`${data.stochRsi.k.toFixed(0)} / ${data.stochRsi.d.toFixed(0)}`} icon={<Gauge />} />
            
            <DashboardRow label="Last Updated" value={new Date().toLocaleTimeString()} icon={<Clock />} />
        </div>
    );
  };

  return (
    <Card className="bg-black/50 border-2 border-primary/50 shadow-[0_0_25px_rgba(0,230,230,0.3)]">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-primary flex items-center gap-2">
          <Gauge /> Advanced Strength Dashboard
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
            {loading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default AdvancedStrengthDashboard;
