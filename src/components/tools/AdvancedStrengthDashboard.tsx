
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { getSignalData } from '@/lib/technical-analysis';
import type { AdvancedStrengthDashboardData } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Gauge, Flame, Snowflake, Volume, BrainCircuit, Activity, Clock, Waves, Search, Rocket, Zap, GitCommitHorizontal, AlertTriangle, ShieldCheck, BarChart, Route, UserCheck } from 'lucide-react';
import VerticalStrengthMeter from './VerticalStrengthMeter';

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

const MarketPhaseHeader: React.FC<{ phase: AdvancedStrengthDashboardData['marketPhase'] }> = ({ phase }) => {
    const phaseConfig = {
        'BREAKOUT': { icon: <Rocket />, color: 'text-green-400', shadow: 'shadow-[0_0_15px_theme(colors.green.400)]' },
        'BREAKDOWN': { icon: <Zap />, color: 'text-red-400', shadow: 'shadow-[0_0_15px_theme(colors.red.400)]' },
        'CONSOLIDATION': { icon: <Waves />, color: 'text-yellow-400', shadow: 'shadow-[0_0_15px_theme(colors.yellow.400)]' },
        'BULLISH TREND': { icon: <TrendingUp />, color: 'text-cyan-400', shadow: 'shadow-[0_0_15px_theme(colors.cyan.400)]' },
        'BEARISH TREND': { icon: <TrendingDown />, color: 'text-orange-400', shadow: 'shadow-[0_0_15px_theme(colors.orange.400)]' },
        'NEUTRAL': { icon: <Activity />, color: 'text-primary', shadow: 'shadow-[0_0_15px_hsl(var(--primary))]' },
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

const DivergenceAlert: React.FC<{ type: 'BULLISH' | 'BEARISH' }> = ({ type }) => {
  const isBullish = type === 'BULLISH';
  const color = isBullish ? 'text-green-400 border-green-400/50 bg-green-900/40' : 'text-red-400 border-red-400/50 bg-red-900/40';
  const text = isBullish ? 'Bullish Divergence Detected - Potential Reversal Up' : 'Bearish Divergence Detected - Potential Reversal Down';
  return (
    <div className={cn("flex items-center gap-2 p-2 rounded-md border text-sm font-bold animate-pulse", color)}>
      <AlertTriangle size={16} />
      <span>{text}</span>
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
    fetchData(initialSymbol);
  }, [initialSymbol, fetchData]);
  
  const handleSymbolInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSymbol(e.target.value);
  }
  
  const handleAnalyzeClick = () => {
    setSelectedSymbol(symbol);
    fetchData(symbol);
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
    const sentimentColor = data.marketSentiment.score > 1 ? 'text-green-400' : data.marketSentiment.score < -1 ? 'text-red-400' : 'text-yellow-400';
    const rsiColor = data.rsiStatus.status === 'OVERBOUGHT' ? 'text-red-400' : data.rsiStatus.status === 'OVERSOLD' ? 'text-green-400' : 'text-primary/80';
    const getConfidenceColor = (score: number) => score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';

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
            
            {data.rsiStatus.divergence && data.rsiStatus.divergence !== 'NONE' && <DivergenceAlert type={data.rsiStatus.divergence} />}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="md:col-span-2 space-y-2">
                    <h4 className="font-headline text-lg text-primary">Strength Analysis</h4>
                    <DashboardRow label="Long Power" value={`${data.longPower}%`} icon={<Flame className="text-green-400"/>} valueClassName="text-green-400" />
                    <DashboardRow label="Short Power" value={`${data.shortPower}%`} icon={<Snowflake className="text-red-400"/>} valueClassName="text-red-400" />

                    <h4 className="font-headline text-lg text-primary pt-2">AI Confidence Factors</h4>
                    <DashboardRow label="Pattern Strength" value={`${data.confidenceBreakdown.patternStrength}%`} icon={<ShieldCheck className="text-cyan-400" />} valueClassName={getConfidenceColor(data.confidenceBreakdown.patternStrength)} />
                    <DashboardRow label="Volume Confirmation" value={`${data.confidenceBreakdown.volumeConfirmation}%`} icon={<BarChart className="text-cyan-400" />} valueClassName={getConfidenceColor(data.confidenceBreakdown.volumeConfirmation)} />
                    <DashboardRow label="HTF Alignment" value={`${data.confidenceBreakdown.htfAlignment}%`} icon={<Route className="text-cyan-400" />} valueClassName={getConfidenceColor(data.confidenceBreakdown.htfAlignment)} />
                    <DashboardRow label="Smart Money Flow" value={`${data.confidenceBreakdown.smartMoneyFlow}%`} icon={<UserCheck className="text-cyan-400" />} valueClassName={getConfidenceColor(data.confidenceBreakdown.smartMoneyFlow)} />

                    <h4 className="font-headline text-lg text-primary pt-2">Technical Indicators</h4>
                    <DashboardRow label="RSI (14)" value={`${data.momentum.rsi.toFixed(0)} - ${data.rsiStatus.status}`} icon={<Gauge />} valueClassName={rsiColor}/>
                    <DashboardRow label="Stoch RSI (K/D)" value={`${data.stochRsi.k.toFixed(0)} / ${data.stochRsi.d.toFixed(0)}`} icon={<GitCommitHorizontal />} valueClassName={data.stochRsi.k > data.stochRsi.d ? 'text-cyan-400' : 'text-orange-400'} />
                    <DashboardRow label="Trend (ADX)" value={`${data.trendAnalysis.strength.toFixed(0)}% - ${data.trendAnalysis.momentum}`} icon={<TrendingUp />} valueClassName={data.trendAnalysis.momentum === 'ACCELERATING' ? 'text-green-400' : 'text-primary/80'}/>
                    <DashboardRow label="Volatility (ATR)" value={`${data.volatility.label} (${data.volatility.percent.toFixed(2)}%)`} icon={<Activity />} valueClassName={data.volatility.label === 'HIGH' || data.volatility.label === 'EXTREME' ? 'text-orange-400' : 'text-primary/80'}/>
                    <DashboardRow label="Volume (vs 20 MA)" value={`${data.volumeStatus.status} (${data.volumeStatus.changePercent > 0 ? '+' : ''}${data.volumeStatus.changePercent.toFixed(0)}%)`} icon={<Volume />} valueClassName={data.volumeStatus.status === 'SPIKE' ? 'text-amber-400' : 'text-primary/80'}/>
                </div>
                <div className="flex items-center justify-center">
                    <VerticalStrengthMeter strength={data.overallStrength} />
                </div>
            </div>
            
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
          <Button onClick={handleAnalyzeClick} disabled={loading} className="font-headline scanner-glow">
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

    
