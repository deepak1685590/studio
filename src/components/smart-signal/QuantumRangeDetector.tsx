
"use client";

import React from 'react';
import { RangeDetectorData } from '@/types';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Waves, CheckCircle2 } from 'lucide-react';

interface QuantumRangeDetectorProps {
  data: RangeDetectorData;
  livePrice: number;
}

const QuantumRangeDetector: React.FC<QuantumRangeDetectorProps> = ({ data, livePrice }) => {
  const { status, rangeTop, rangeBottom, centerLine, isConfirmed } = data;

  const config = {
    BULLISH: {
      icon: <TrendingUp />,
      label: 'Bullish Breakout',
      color: '#00ff41',
      className: 'text-[#00ff41] border-[#00ff41]/50 bg-[#00ff41]/10',
      shadow: 'shadow-[0_0_20px_#00ff41]',
    },
    BEARISH: {
      icon: <TrendingDown />,
      label: 'Bearish Breakout',
      color: '#ff0066',
      className: 'text-[#ff0066] border-[#ff0066]/50 bg-[#ff0066]/10',
      shadow: 'shadow-[0_0_20px_#ff0066]',
    },
    NEUTRAL: {
      icon: <Waves />,
      label: 'Consolidation',
      color: '#00ccff',
      className: 'text-[#00ccff] border-[#00ccff]/50 bg-[#00ccff]/10',
      shadow: 'shadow-[0_0_20px_#00ccff]',
    },
  };

  const currentConfig = config[status];
  
  const isCrypto = !livePrice.toString().includes('.');
  const formatPrice = (price: number) => price.toFixed(isCrypto ? 2 : 4);

  return (
    <div className={cn(
      "p-4 rounded-lg border-2 space-y-3 transition-all duration-300",
      currentConfig.className,
      currentConfig.shadow
    )}>
      <h4 
        className="font-headline text-lg text-center flex items-center justify-center gap-2"
        style={{ color: currentConfig.color, textShadow: `0 0 10px ${currentConfig.color}`}}
      >
        {currentConfig.icon}
        Quantum Range Detector
      </h4>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-xs uppercase" style={{ color: currentConfig.color }}>Breakout ↑</div>
          <div className="font-mono text-xl font-bold">{formatPrice(rangeTop)}</div>
        </div>
        <div className="flex flex-col justify-center">
             <div 
                className="font-mono text-3xl font-bold"
                style={{ color: currentConfig.color, textShadow: `0 0 15px ${currentConfig.color}`}}
             >
                {livePrice.toFixed(isCrypto ? 2: 4)}
             </div>
             <div className="text-xs uppercase text-foreground/70">Live Price</div>
        </div>
        <div>
          <div className="text-xs uppercase" style={{ color: currentConfig.color }}>Breakdown ↓</div>
          <div className="font-mono text-xl font-bold">{formatPrice(rangeBottom)}</div>
        </div>
      </div>
      
       <div className="text-center">
          {isConfirmed && status !== 'NEUTRAL' ? (
             <div className="font-bold text-sm flex items-center justify-center gap-1 animate-pulse" style={{ color: currentConfig.color }}>
                <CheckCircle2 size={16}/> {currentConfig.label} Confirmed
            </div>
          ) : (
             <div className="font-bold text-sm flex items-center justify-center gap-1" style={{ color: currentConfig.color }}>
                {isConfirmed ? <CheckCircle2 size={16}/> : null} {currentConfig.label} {isConfirmed ? 'Range Confirmed' : 'Range Developing'}
            </div>
          )}
      </div>

    </div>
  );
};

export default QuantumRangeDetector;
