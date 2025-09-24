
"use client";

import React from 'react';
import type { SignalData } from '@/types';
import { BrainCircuit, TrendingUp, TrendingDown, Gauge, Flame, Volume, Zap, Rocket, Waves, Activity, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfidenceBreakdownProps {
  data: SignalData;
  livePrice: number | null;
}

const DashboardRow: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactNode; valueClassName?: string; barPercent?: number; barColor?: string; }> = 
({ label, value, icon, valueClassName, barPercent, barColor }) => {
    
    const renderBar = () => {
        if (barPercent === undefined) return null;
        const blocks = Array.from({ length: 10 });
        const activeBlocks = Math.round(barPercent / 10);
        
        return (
            <div className="flex items-center gap-1">
                {blocks.map((_, i) => (
                    <div 
                        key={i} 
                        className={cn(
                            "w-4 h-4 rounded-sm",
                            i < activeBlocks ? barColor : "bg-black/40"
                        )}
                    />
                ))}
            </div>
        )
    }

    return (
      <div className="flex items-center justify-between p-2 bg-black/30 rounded-md border border-primary/10">
        <div className="flex items-center gap-2 text-sm text-foreground/80">
          {icon}
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-3">
            {renderBar()}
            <div className={cn("font-mono text-base font-bold text-primary w-24 text-right", valueClassName)}>{value}</div>
        </div>
      </div>
    );
};

const MarketPhaseHeader: React.FC<{ phase: SignalData['advancedStrengthDashboard']['marketPhase'] }> = ({ phase }) => {
    const phaseConfig = {
        'BREAKOUT': { icon: <Rocket />, color: 'text-green-400', shadow: 'shadow-[0_0_15px_theme(colors.green.400)]' },
        'BREAKDOWN': { icon: <Zap />, color: 'text-red-400', shadow: 'shadow-[0_0_15px_theme(colors.red.400)]' },
        'CONSOLIDATION': { icon: <Waves />, color: 'text-yellow-400', shadow: 'shadow-[0_0_15px_theme(colors.yellow.400)]' },
        'BULLISH TREND': { icon: <TrendingUp />, color: 'text-cyan-400', shadow: 'shadow-[0_0_15px_theme(colors.cyan.400)]' },
        'BEARISH TREND': { icon: <TrendingDown />, color: 'text-red-500', shadow: 'shadow-[0_0_15px_theme(colors.red.500)]' },
        'NEUTRAL': { icon: <Activity />, color: 'text-primary', shadow: 'shadow-[0_0_15px_hsl(var(--primary))]' },
    };
    const config = phaseConfig[phase] || phaseConfig['NEUTRAL'];
    
    return (
        <div className={cn("p-3 mb-2 rounded-lg border text-center transition-all duration-500", config.shadow)}>
            <div className={cn("font-headline text-md flex items-center justify-center gap-2", config.color)}>
                {config.icon}
                MARKET PHASE: {phase}
            </div>
        </div>
    )
}


const ConfidenceBreakdown: React.FC<ConfidenceBreakdownProps> = ({ data, livePrice }) => {
  const { advancedStrengthDashboard: adv, isBullish, confidenceBreakdown } = data;

  if (!adv) {
    return (
      <div className="mt-4 p-4 bg-black/30 rounded-lg border border-primary/20">
        <h4 className="font-headline text-lg text-primary mb-4 flex items-center gap-2">
          <BrainCircuit /> AI Confidence Matrix
        </h4>
        <p className="text-center text-foreground/70">Advanced data not available for this signal.</p>
      </div>
    )
  }
  
  const glowColor = isBullish 
    ? (confidenceBreakdown.overall > 75 ? 'shadow-green-400/50' : 'shadow-yellow-400/50')
    : (confidenceBreakdown.overall > 75 ? 'shadow-red-400/50' : 'shadow-orange-400/50');
  
  const priceColor = adv.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400';
  const momentumColor = adv.momentum.rsi > 50 ? 'text-green-400' : 'text-red-400';
  const trendColor = adv.trendAnalysis.direction > 0 ? 'text-green-400' : 'text-red-400';
  const volColor = adv.volatility.rank > 60 ? 'text-red-400' : adv.volatility.rank > 40 ? 'text-yellow-400' : 'text-green-400';
  const volChangeColor = adv.volumeStatus.changePercent >= 0 ? 'text-green-400' : 'text-red-400';
  const sentimentColor = adv.marketSentiment.score > 0 ? 'text-green-400' : adv.marketSentiment.score < 0 ? 'text-red-400' : 'text-yellow-400';

  return (
    <div className={cn("mt-4 p-4 bg-black/30 rounded-lg border border-primary/20 transition-shadow duration-500", glowColor)}>
      <h4 className="font-headline text-lg text-primary mb-2 flex items-center gap-2">
        <BrainCircuit /> AI Confidence Matrix
      </h4>
      <MarketPhaseHeader phase={adv.marketPhase} />
      <div className="space-y-2">
        <DashboardRow 
            label="Price" 
            value={(livePrice || parseFloat(adv.price)).toFixed(2)} 
            icon={<Zap size={16}/>}
            valueClassName={priceColor}
        />
        <DashboardRow 
            label="Sentiment" 
            value={`${adv.marketSentiment.emoji} ${adv.marketSentiment.score}/4`}
            icon={<BrainCircuit size={16}/>}
            valueClassName={sentimentColor}
        />
        <DashboardRow 
            label="Momentum (RSI)" 
            value={`${adv.momentum.rsi.toFixed(1)} ${adv.momentum.trend}`} 
            icon={<Gauge size={16}/>}
            valueClassName={momentumColor}
        />
        <DashboardRow 
            label="Long Power" 
            value={`${adv.longPower.toFixed(0)}%`} 
            icon={<TrendingUp size={16} className="text-green-400"/>}
            barPercent={adv.longPower}
            barColor="bg-green-500"
            valueClassName="text-green-400"
        />
         <DashboardRow 
            label="Short Power" 
            value={`${adv.shortPower.toFixed(0)}%`} 
            icon={<TrendingDown size={16} className="text-red-400"/>}
            barPercent={adv.shortPower}
            barColor="bg-red-500"
            valueClassName="text-red-400"
        />
         <DashboardRow 
            label="Trend Strength" 
            value={`${adv.trendAnalysis.strength.toFixed(2)}%`} 
            icon={<Gauge size={16}/>}
            valueClassName={trendColor}
        />
         <DashboardRow 
            label="Volatility" 
            value={`${adv.volatility.label}`} 
            icon={<Flame size={16} className="text-orange-400"/>}
            valueClassName={volColor}
        />
         <DashboardRow 
            label="Volume" 
            value={adv.volumeValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            icon={<Volume size={16}/>}
        />
        <DashboardRow 
            label="Volume Change" 
            value={`${adv.volumeStatus.changePercent.toFixed(2)}%`} 
            icon={<Volume size={16}/>}
            valueClassName={volChangeColor}
        />
      </div>
    </div>
  );
};

export default ConfidenceBreakdown;
