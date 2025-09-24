
"use client";

import React from 'react';
import type { SignalData } from '@/types';
import { BrainCircuit, TrendingUp, TrendingDown, Gauge, Flame, Volume, Zap } from 'lucide-react';
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

const ConfidenceBreakdown: React.FC<ConfidenceBreakdownProps> = ({ data, livePrice }) => {
  const { advancedStrengthDashboard: adv, momentum, trendStrength, isBullish, confidenceBreakdown } = data;

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

  const volChangeColor = adv.volumeStatus.changePercent >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className={cn("mt-4 p-4 bg-black/30 rounded-lg border border-primary/20 transition-shadow duration-500", glowColor)}>
      <h4 className="font-headline text-lg text-primary mb-4 flex items-center gap-2">
        <BrainCircuit /> AI Confidence Matrix
      </h4>
      <div className="space-y-2">
        <DashboardRow 
            label="Price" 
            value={(livePrice || parseFloat(adv.price)).toFixed(2)} 
            icon={<Zap size={16}/>}
            valueClassName="text-primary"
        />
        <DashboardRow 
            label="Momentum" 
            value={momentum.score.toFixed(2)} 
            icon={<Gauge size={16}/>}
            valueClassName={momentum.score > 55 ? 'text-green-400' : momentum.score < 45 ? 'text-red-400' : 'text-yellow-400'}
        />
        <DashboardRow 
            label="Long" 
            value={`${adv.longPower}%`} 
            icon={<TrendingUp size={16} className="text-green-400"/>}
            barPercent={adv.longPower}
            barColor="bg-green-500"
            valueClassName="text-green-400"
        />
         <DashboardRow 
            label="Short" 
            value={`${adv.shortPower}%`} 
            icon={<TrendingDown size={16} className="text-red-400"/>}
            barPercent={adv.shortPower}
            barColor="bg-red-500"
            valueClassName="text-red-400"
        />
         <DashboardRow 
            label="Trend Strength" 
            value={`${trendStrength.score.toFixed(1)}%`} 
            icon={<Gauge size={16}/>}
            valueClassName={trendStrength.score > 25 ? 'text-cyan-400' : 'text-gray-400'}
        />
         <DashboardRow 
            label="Volatility" 
            value={`${adv.volatility.percent.toFixed(2)} pts`} 
            icon={<Flame size={16} className="text-orange-400"/>}
            valueClassName="text-orange-400"
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
