
"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronsUp, ChevronsDown, Minus } from 'lucide-react';

interface VerticalStrengthMeterProps {
  strength: number; // A value from -100 to 100
}

const VerticalStrengthMeter: React.FC<VerticalStrengthMeterProps> = ({ strength }) => {
  const isBullish = strength > 0;
  const absStrength = Math.abs(strength);
  
  const getMeterStyle = () => {
    if (strength > 20) return { icon: <ChevronsUp />, color: 'text-green-400', shadow: 'shadow-green-400/50', gradient: 'from-green-900/50 to-green-500/50' };
    if (strength < -20) return { icon: <ChevronsDown />, color: 'text-red-400', shadow: 'shadow-red-400/50', gradient: 'from-red-900/50 to-red-500/50' };
    return { icon: <Minus />, color: 'text-yellow-400', shadow: 'shadow-yellow-400/50', gradient: 'from-yellow-900/50 to-yellow-500/50' };
  };

  const { icon, color, shadow, gradient } = getMeterStyle();

  return (
    <div className="flex flex-col items-center justify-between gap-2 p-3 h-full w-full max-w-[150px] mx-auto bg-black/40 rounded-xl border-2 border-primary/20">
      <h4 className="font-headline text-sm text-primary/80">OVERALL STRENGTH</h4>
      
      <div className="relative w-10 flex-1 bg-black/50 rounded-full overflow-hidden border border-primary/30">
        {/* Center Line */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-primary/30"></div>

        {/* Strength Bar */}
        <div 
          className={cn(
            "absolute left-0 w-full rounded-full transition-all duration-500 ease-out",
            gradient
          )}
          style={{ 
            height: `${absStrength / 2}%`,
            ...(isBullish ? { bottom: '50%' } : { top: '50%' }),
            boxShadow: `0 0 15px currentColor`
          }}
        />
        
        {/* Glow effect */}
        <div className={cn("absolute inset-x-0 h-1/2 blur-2xl opacity-50", isBullish ? "bottom-0 bg-green-500" : "top-0 bg-red-500")}></div>

      </div>

      <div className="text-center">
        <div 
            className={cn("font-headline text-5xl transition-colors duration-500", color, shadow)} 
            style={{ textShadow: `0 0 10px currentColor` }}
        >
          {absStrength.toFixed(0)}
        </div>
        <div className={cn("text-xs font-bold", color)}>{isBullish ? 'BULLISH' : strength === 0 ? 'NEUTRAL' : 'BEARISH'}</div>
      </div>
    </div>
  );
};

export default VerticalStrengthMeter;
