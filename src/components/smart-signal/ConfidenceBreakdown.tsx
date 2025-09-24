
"use client";

import React from 'react';
import type { SignalData } from '@/types';
import { BrainCircuit, TrendingUp, TrendingDown, Gauge, Flame, Volume, Zap, Rocket, Waves, Activity, AlertTriangle, GitCommitHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import InfoPod from './InfoPod';
import HorizontalStrengthMeter from './HorizontalStrengthMeter';

const MarketPhaseHeader: React.FC<{ phase: SignalData['advancedStrengthDashboard']['marketPhase'] }> = ({ phase }) => {
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
        <div className={cn("p-3 mb-2 rounded-lg border text-center transition-all duration-500", config.shadow)}>
            <div className={cn("font-headline text-md flex items-center justify-center gap-2", config.color)}>
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

interface ConfidenceBreakdownProps {
  data: SignalData;
  livePrice: number | null;
}

const ConfidenceBreakdown: React.FC<ConfidenceBreakdownProps> = ({ data, livePrice }) => {
  const { advancedStrengthDashboard: adv } = data;
  const displayPrice = livePrice || parseFloat(adv.price);
  const priceChangePercent = livePrice ? ((livePrice - parseFloat(adv.price)) / parseFloat(adv.price)) * 100 : adv.priceChangePercent;
  const isCrypto = !data.symbol.includes('/');

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

  const priceColor = priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400';
  const rsiColor = adv.rsiStatus.status === 'OVERBOUGHT' ? 'text-red-400' : adv.rsiStatus.status === 'OVERSOLD' ? 'text-green-400' : 'text-primary/80';
  const stochColor = adv.stochRsi.k > adv.stochRsi.d ? 'text-cyan-400' : 'text-orange-400';
  const adxColor = adv.trendAnalysis.momentum === 'ACCELERATING' ? 'text-green-400' : 'text-primary/80';
  const volColor = adv.volatility.label === 'HIGH' || adv.volatility.label === 'EXTREME' ? 'text-orange-400' : 'text-primary/80';
  const volChangeColor = adv.volumeStatus.status === 'SPIKE' ? 'text-amber-400' : 'text-primary/80';


  return (
    <div className="mt-4 p-4 bg-black/30 rounded-lg border border-primary/20">
        <h4 className="font-headline text-lg text-primary mb-2 flex items-center gap-2">
            <BrainCircuit /> AI Confidence Matrix
        </h4>
        <MarketPhaseHeader phase={adv.marketPhase} />
        {adv.rsiStatus.divergence && adv.rsiStatus.divergence !== 'NONE' && <DivergenceAlert type={adv.rsiStatus.divergence} />}

        <div className="space-y-3 mt-3">
             <HorizontalStrengthMeter 
                long={adv.longPower} 
                short={adv.shortPower}
             />
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <InfoPod
                    title="Price"
                    icon={<Activity size={16}/>}
                    value={displayPrice.toFixed(isCrypto ? 2 : 4)}
                    valueClassName={priceColor}
                    isSmall
                />
                <InfoPod
                    title="RSI (14)"
                    icon={<Gauge size={16}/>}
                    value={adv.momentum.rsi.toFixed(0)}
                    valueClassName={rsiColor}
                    isSmall
                />
                <InfoPod
                    title="Trend (ADX)"
                    icon={<TrendingUp size={16}/>}
                    value={adv.trendAnalysis.strength.toFixed(0)}
                    valueClassName={adxColor}
                    isSmall
                />
                <InfoPod
                    title="Volatility (ATR)"
                    icon={<Flame size={16} />}
                    value={`${adv.volatility.percent.toFixed(2)}%`}
                    valueClassName={volColor}
                    isSmall
                />
             </div>
        </div>
    </div>
  );
};

export default ConfidenceBreakdown;
