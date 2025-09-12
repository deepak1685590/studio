
"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronsUp, ChevronsDown, Minus } from 'lucide-react';

interface VerticalStrengthMeterProps {
  strength: number; // A value from 0 to 100
}

const VerticalStrengthMeter: React.FC<VerticalStrengthMeterProps> = ({ strength }) => {
  const arrowPosition = `${100 - strength}%`;

  const getArrowStyle = () => {
    if (strength > 60) return { icon: <ChevronsUp />, color: 'text-green-400', shadow: 'shadow-[0_0_15px_theme(colors.green.400)]' };
    if (strength < 40) return { icon: <ChevronsDown />, color: 'text-red-400', shadow: 'shadow-[0_0_15px_theme(colors.red.400)]' };
    return { icon: <Minus />, color: 'text-yellow-400', shadow: 'shadow-[0_0_15px_theme(colors.yellow.400)]' };
  };

  const { icon, color, shadow } = getArrowStyle();
  const glowColor = `hsl(${strength * 1.2}, 100%, 50%)`; // Interpolate from red (0) to green (120)

  return (
    <div className="flex flex-col items-center gap-4 p-4 h-full w-full max-w-[150px] mx-auto bg-black/30 rounded-lg border border-primary/20">
      <h4 className="font-headline text-lg text-primary/80">Overall Strength</h4>
      <div className="relative w-8 h-64 bg-gradient-to-t from-red-500/50 via-yellow-500/50 to-green-500/50 rounded-full overflow-hidden border-2 border-primary/30">
        <div 
          className="absolute left-0 bottom-0 w-full rounded-full transition-all duration-500 ease-out" 
          style={{ 
            height: `${strength}%`,
            background: `linear-gradient(to top, hsl(0, 80%, 30%), ${glowColor})`,
            boxShadow: `0 0 15px ${glowColor}`
          }}
        />

        {/* Animated Arrow */}
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 w-12 h-8 flex items-center justify-center transition-all duration-500 ease-out",
            color
          )}
          style={{ top: `calc(${arrowPosition} - 16px)` }}
        >
          <div className={cn("absolute w-full h-full rounded-full blur-lg opacity-70", color.replace('text-', 'bg-'))}></div>
          <div className="z-10">{icon}</div>
        </div>
      </div>
      <div className="text-center">
        <div 
            className={cn("font-headline text-5xl transition-colors duration-500", color)} 
            style={{ textShadow: `0 0 10px ${glowColor}` }}
        >
          {strength}
        </div>
        <div className="text-xs text-foreground/70">STRENGTH INDEX</div>
      </div>
    </div>
  );
};

export default VerticalStrengthMeter;
