
"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

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
      <div className="flex justify-between items-center text-xs font-bold mb-2">
        <div className="text-green-400 flex items-center gap-1 animate-neon-glow-green">
            <TrendingUp size={14}/> LONG POWER: {long.toFixed(0)}%
        </div>
        <div className="text-red-400 flex items-center gap-1 animate-neon-glow-red">
            SHORT POWER: {short.toFixed(0)}% <TrendingDown size={14}/>
        </div>
      </div>
      <div className="relative w-full h-6 bg-black rounded-full overflow-hidden border-2 border-primary/30 shadow-inner">
        {/* Background Glows */}
        <div className="absolute top-0 left-0 h-full w-1/2 bg-green-500/20 blur-md"></div>
        <div className="absolute top-0 right-0 h-full w-1/2 bg-red-500/20 blur-md"></div>
        
        {/* Main Bars */}
        <div className="absolute top-0 left-0 h-full bg-red-500/40 rounded-r-full" style={{ width: `calc(100% - ${longPercent}%)` }} />
        <div className="absolute top-0 left-0 h-full bg-green-500/40 rounded-l-full" style={{ width: `${longPercent}%` }} />
        
        {/* Animated Fill/Glow */}
        <div 
          className="absolute top-0 left-0 h-full bg-green-400 rounded-l-full transition-all duration-500 ease-out animate-bar-pulse-green"
          style={{ width: `${longPercent}%`, boxShadow: `0 0 10px theme('colors.green.400'), 0 0 20px theme('colors.green.500')` }}
        />

        {/* Center Divider */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-1 bg-primary/50 flex items-center justify-center">
            <Zap size={14} className="text-amber-300 animate-flicker" />
        </div>
        
        {/* Text Overlay */}
        <div 
            className="absolute inset-0 flex items-center justify-center font-headline text-sm text-white/90"
            style={{ textShadow: '0 0 8px black, 0 0 5px black' }}
        >
            {strengthText}
        </div>
      </div>
    </div>
  );
};

export default HorizontalStrengthMeter;
