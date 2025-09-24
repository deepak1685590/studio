
"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface HorizontalStrengthMeterProps {
  long: number;
  short: number;
}

const HorizontalStrengthMeter: React.FC<HorizontalStrengthMeterProps> = ({ long, short }) => {
  const total = long + short;
  const longPercent = total > 0 ? (long / total) * 100 : 50;
  
  const overallStrength = Math.round((long + (100 - short)) / 2);
  const isBullish = overallStrength > 50;
  const strengthText = isBullish ? `${overallStrength}% Bullish` : `${100-overallStrength}% Bearish`;

  return (
    <div className="w-full p-3 bg-black/40 rounded-lg border border-primary/20">
      <div className="flex justify-between items-center text-xs font-bold mb-1">
        <div className="text-green-400 flex items-center gap-1"><TrendingUp size={14}/> LONG POWER: {long.toFixed(0)}%</div>
        <div className="text-red-400 flex items-center gap-1">SHORT POWER: {short.toFixed(0)}% <TrendingDown size={14}/></div>
      </div>
      <div className="relative w-full h-4 bg-red-500/30 rounded-full overflow-hidden border border-primary/30 shadow-inner">
        <div 
          className="absolute top-0 left-0 h-full bg-green-500/50 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${longPercent}%` }}
        />
        <div 
            className="absolute inset-0 flex items-center justify-center font-headline text-xs text-white/90"
            style={{ textShadow: '0 0 5px black' }}
        >
            {strengthText}
        </div>
      </div>
    </div>
  );
};

export default HorizontalStrengthMeter;
