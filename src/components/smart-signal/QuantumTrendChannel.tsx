
"use client";

import React from 'react';
import { LinearRegressionChannel } from '@/types';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Maximize, Minimize, MoveVertical } from 'lucide-react';

interface QuantumTrendChannelProps {
  channel: LinearRegressionChannel;
  isBullish: boolean;
}

const QuantumTrendChannel: React.FC<QuantumTrendChannelProps> = ({ channel, isBullish }) => {
  const { upper, middle, lower } = channel;

  const isCrypto = !upper.toString().includes('.'); // Simple check for formatting

  const channelColor = isBullish ? 'border-green-400/50' : 'border-red-500/50';
  const shadowColor = isBullish ? 'shadow-[0_0_25px_theme(colors.green.400)_/_0.4)]' : 'shadow-[0_0_25px_theme(colors.red.500)_/_0.4)]';
  const textColor = isBullish ? 'text-green-300' : 'text-red-300';
  const icon = isBullish ? <TrendingUp /> : <TrendingDown />;

  return (
    <div className={cn(
      "p-4 rounded-xl border-2 space-y-4 bg-black/50",
      channelColor,
      shadowColor
    )}>
      <h4 className={cn("font-headline text-lg flex items-center justify-center gap-2", textColor)}>
        {icon}
        Quantum Trend Channel
      </h4>
      
      <div className="relative flex justify-between items-center font-mono text-center h-24">
        {/* Upper Bound */}
        <div className="z-10">
          <div className="text-xs text-red-400/80 flex items-center justify-center gap-1"><Maximize size={12} /> Upper</div>
          <div className="text-xl font-bold text-red-400">${upper.toFixed(isCrypto ? 2 : 4)}</div>
        </div>

        {/* Middle Line */}
        <div className="z-10">
          <div className="text-xs text-primary/80 flex items-center justify-center gap-1"><MoveVertical size={12} /> Middle</div>
          <div className="text-2xl font-bold text-primary">${middle.toFixed(isCrypto ? 2 : 4)}</div>
        </div>

        {/* Lower Bound */}
        <div className="z-10">
          <div className="text-xs text-green-400/80 flex items-center justify-center gap-1"><Minimize size={12} /> Lower</div>
          <div className="text-xl font-bold text-green-400">${lower.toFixed(isCrypto ? 2 : 4)}</div>
        </div>

        {/* Background Gradient */}
        <div className={cn(
            "absolute inset-0 rounded-lg opacity-20",
            isBullish ? "bg-gradient-to-t from-green-500/50 via-transparent to-red-500/20" : "bg-gradient-to-t from-green-500/20 via-transparent to-red-500/50"
        )}></div>
        
        {/* Animated Scan Line */}
        <div className="absolute left-0 right-0 h-0.5 bg-primary/50 price-scanner" style={{ animationDuration: '3s' }}></div>
      </div>
    </div>
  );
};

export default QuantumTrendChannel;
