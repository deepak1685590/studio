
"use client";

import React from 'react';
import { SidewaysMarket } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Minimize } from 'lucide-react';

interface SidewaysMarketAlertProps {
  alert: SidewaysMarket;
  livePrice: number;
}

const SidewaysMarketAlert: React.FC<SidewaysMarketAlertProps> = ({ alert, livePrice }) => {
  const rangeLow = parseFloat(alert.range[1]);
  const rangeHigh = parseFloat(alert.range[0]);
  const rangeSpan = rangeHigh - rangeLow;

  const pricePositionPercent = Math.max(0, Math.min(100, ((livePrice - rangeLow) / rangeSpan) * 100));
  
  const isOutsideRange = livePrice > rangeHigh || livePrice < rangeLow;
  let indicatorColor = 'bg-yellow-400';
  if (isOutsideRange) {
      indicatorColor = livePrice > rangeHigh ? 'bg-green-400' : 'bg-red-400';
  }

  return (
    <Alert className="border-yellow-500/50 bg-yellow-900/30 text-yellow-400">
      <Minimize className="h-5 w-5 text-yellow-400" />
      <AlertTitle className="font-headline text-lg text-yellow-400">
        Sideways Market Detected (ADX: {alert.adx})
      </AlertTitle>
      <AlertDescription className="text-foreground/90 mt-2">
        <p>
          Weak trend strength detected, indicating consolidation. Watch for a breakout from the current range.
        </p>
        <div className="mt-4">
            <div className="flex justify-between text-xs font-mono text-foreground/80 mb-1">
                <span>Breakdown: ${rangeLow.toFixed(2)}</span>
                <span>Breakout: ${rangeHigh.toFixed(2)}</span>
            </div>
            <div className="relative w-full h-2 bg-black/50 rounded-full">
                 <div 
                    className={cn(
                        "absolute top-0 h-2 rounded-full",
                        indicatorColor
                    )}
                    style={{ left: `0%`, width: `${pricePositionPercent}%` }}
                  ></div>
                <div 
                    className={cn(
                        "absolute -top-1 w-4 h-4 rounded-full border-2 transition-all duration-300",
                         indicatorColor,
                         isOutsideRange ? 'border-white animate-pulse' : 'border-black'
                    )}
                    style={{ left: `calc(${pricePositionPercent}% - 8px)` }}
                />
            </div>
            <div className="text-center font-mono text-lg mt-2">
                Live Price: <strong className={cn("transition-colors", isOutsideRange ? indicatorColor.replace('bg-', 'text-') : 'text-yellow-300')}>${livePrice.toFixed(2)}</strong>
            </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default SidewaysMarketAlert;
