"use client";

import React from 'react';
import { SidewaysMarket } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Minimize } from 'lucide-react';

interface SidewaysMarketAlertProps {
  alert: SidewaysMarket;
}

const SidewaysMarketAlert: React.FC<SidewaysMarketAlertProps> = ({ alert }) => {
  const borderColorClass = 'border-yellow-500/50';
  const bgColorClass = 'bg-yellow-900/30';
  const textColorClass = 'text-yellow-400';

  return (
    <Alert className={cn("mt-4", borderColorClass, bgColorClass)}>
      <Minimize className={cn("h-5 w-5", textColorClass)} />
      <AlertTitle className={cn("font-headline text-lg", textColorClass)}>
        Sideways Market Detected (ADX: {alert.adx})
      </AlertTitle>
      <AlertDescription className="text-foreground/90">
        <p>
          The market shows weak trend strength, indicating consolidation.
          Watch for a breakout from the current range.
        </p>
        <p className="font-mono text-lg mt-1">
          Range: <strong className={textColorClass}>${alert.range[1]} - ${alert.range[0]}</strong>
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default SidewaysMarketAlert;
