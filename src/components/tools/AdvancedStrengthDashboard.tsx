
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { getSignalData } from '@/lib/technical-analysis';
import type { SignalData, AdvancedStrengthDashboardData } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Gauge, Flame, Snowflake, Volume, BarChartBig, BrainCircuit, Activity, Clock, Waves, Search, Rocket, Zap } from 'lucide-react';

interface AdvancedStrengthDashboardProps {
  initialSymbol?: string;
  setSelectedSymbol: (symbol: string) => void;
}

const DashboardRow: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode; tooltip?: string; valueClassName?: string; }> = ({ label, value, icon, valueClassName }) => (
  <div className="flex items-center justify-between p-2 bg-black/30 rounded-md border border-primary/10">
    <div className="flex items-center gap-2 text-sm text-foreground/80">
      {icon}
      <span>{label}</span>
    </div>
    <div className={cn("font-mono text-base font-bold text-primary", valueClassName)}>{value}</div>
  </div>
);

const StrengthMeter: React.FC<{ value: number; colorClass: string; segments?: number }> = ({ value, colorClass, segments = 10 }) => {
    const activeSegments = Math.round((value / 100) * segments);
    
    return (
        <div className="flex gap-1 w-24">
            {Array.from({ length: segments }).map((_, i) => (
                <div key={i} className={cn("h-4 flex-1 rounded-sm", i < activeSegments ? colorClass : 'bg-primary/10')} />
            ))}
        </div>
    );
};

const MarketPhaseHeader: React.FC<{ phase: AdvancedStrengthDashboardData['marketPhase'] }> = ({ phase }) => {
    const phaseConfig = {
        'BREAKOUT': { icon: <Rocket />, color: 'text-green-400', shadow: 'shadow-[0_0_15px_theme(colors.green.400)]' },
        'BREAKDOWN': { icon: <Zap />, color: 'text-red-400', shadow: 'shadow-[0_0_15px_theme(colors.red.400)]' },
        'CONSOLIDATION': { icon: <Waves />, color: 'text-yellow-400', shadow: 'shadow-[0_0_15px_theme(colors.yellow.400)]' },
        'BULLISH TREND': { icon: <TrendingUp />, color: 'text-cyan-400', shadow: 'shadow-[0_0_15px_theme(colors.cyan.400)]' },
        'BEARISH TREND': { icon: <TrendingDown />, color: 'text-orange-400', shadow: 'shadow-[0_0_15px_theme(colors.orange.400)]' },
        'NEUTRAL': { icon: <Activity />, color: 'text-primary', shadow: 'shadow-[0_0_15px_theme(colors.primary)]' },
    };
    const config = phaseConfig[phase] || phaseConfig['NEUTRAL'];
    
    return (
        <div className={cn("p-3 mb-4 rounded-lg border text-center transition-all duration-500", config.shadow)}>
            <div className={cn("font-headline text-lg flex items-center justify-center gap-2", config.color)}>
                {config.icon}
                MARKET PHASE: {phase}
            </div>
        </div>
    )
}


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
      return <div className="text-center p-8 font-headline text-primary animate-pulse">Loading Advanced Data...</div>;
    }
    if (!data) {
      return <div className="text-center p-8">No data available for this asset.</div>;
    }

    const trendColor = data.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400';
    const trendIcon = data.priceChangePercent >= 0 ? <TrendingUp className="inline-block" /> : <TrendingDown className="inline-block" />;
    const sentimentColor = data.marketSentiment.score > 0 ? 'text-green-400' : data.marketSentiment.score < 0 ? 'text-red-400' : 'text-yellow-400';
    
    return (
        <div className="space-y-4">
            <MarketPhaseHeader phase={data.marketPhase} />
            <DashboardRow 
                label="Current Price" 
                value={<>{trendIcon} {data.price} ({data.priceChangePercent.toFixed(2)}%)</>}
                icon={<Activity />}
                valueClassName={trendColor}
            />
            <DashboardRow label="Market Sentiment" value={data.marketSentiment.label} icon={<BrainCircuit />} valueClassName={sentimentColor} />
            
            <h4 className="font-headline text-lg text-primary pt-2">Strength Analysis</h4>
            <DashboardRow label="Momentum (RSI)" value={`${data.momentum.rsi.toFixed(0)} - ${data.momentum.trend}`} icon={<Gauge />} valueClassName={data.momentum.rsi > 52 ? 'text-green-400' : data.momentum.rsi < 48 ? 'text-red-400' : 'text-yellow-400'}/>
            <DashboardRow label="Long Power" value={<StrengthMeter value={data.longPower} colorClass="bg-green-500" />} icon={<Flame className="text-green-400"/>} />
            <DashboardRow label="Short Power" value={<StrengthMeter value={data.shortPower} colorClass="bg-red-500"/>} icon={<Snowflake className="text-red-400"/>} />
            <DashboardRow label="Overall Strength" value={`${data.overallStrength}%`} icon={<Gauge />} valueClassName={data.overallStrength > 50 ? 'text-green-400' : 'text-red-400'}/>

            <h4 className="font-headline text-lg text-primary pt-2">Technical Indicators</h4>
            <DashboardRow label="Trend Analysis" value={`${data.trendAnalysis.strength.toFixed(0)}% - ${data.trendAnalysis.momentum}`} icon={<TrendingUp />} valueClassName={data.trendAnalysis.momentum === 'ACCELERATING' ? 'text-green-400' : 'text-primary/80'} />
            <DashboardRow label="Volatility (ATR)" value={`${data.volatility.label} (${data.volatility.percent.toFixed(2)}%)`} icon={<Activity />} valueClassName={data.volatility.label === 'HIGH' || data.volatility.label === 'EXTREME' ? 'text-orange-400' : 'text-primary/80'}/>
            <DashboardRow label="Volume Status" value={`${data.volumeStatus.status} (${data.volumeStatus.changePercent > 0 ? '+' : ''}${data.volumeStatus.changePercent.toFixed(0)}%)`} icon={<Volume />} valueClassName={data.volumeStatus.status === 'SPIKE' ? 'text-amber-400' : 'text-primary/80'}/>
            
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
