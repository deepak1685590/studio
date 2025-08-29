"use client";

import React from 'react';
import { WhaleAlert as WhaleAlertType } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// Replaced lucide-react Whale icon with an inline SVG
const WhaleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M12 12a5 5 0 0 0-5-5c-1.33 0-4 2.67-4 8 0 3.33 1.67 6 5 6s5-2.67 5-6" />
        <path d="M12 12c0-5.52 4.48-10 10-10" />
        <path d="M18 6c0 2.76-2.24 5-5 5" />
        <path d="M21 6c0 2.76-2.24 5-5 5" />
    </svg>
);


interface WhaleAlertProps {
  alert: WhaleAlertType;
}

const WhaleAlert: React.FC<WhaleAlertProps> = ({ alert }) => {
  const isBullish = alert.destination === 'Cold Wallet';
  const borderColorClass = isBullish ? 'border-green-500/50' : 'border-red-500/50';
  const bgColorClass = isBullish ? 'bg-green-900/30' : 'bg-red-900/30';
  const textColorClass = isBullish ? 'text-green-400' : 'text-red-400';

  return (
    <Alert className={cn("mt-4", borderColorClass, bgColorClass)}>
      <WhaleIcon className={cn("h-5 w-5", textColorClass)} />
      <AlertTitle className={cn("font-headline text-lg", textColorClass)}>
        Whale Alert: {alert.amount.toLocaleString()} {alert.symbol} Moved
      </AlertTitle>
      <AlertDescription className="text-foreground/90">
        <p>
          A large volume of <strong className={textColorClass}>{alert.amount.toLocaleString()} {alert.symbol}</strong> was moved to <strong className={textColorClass}>{alert.destination}</strong>.
        </p>
        <p className="text-xs text-foreground/70 mt-1">
          <strong className="text-foreground/90">Historical Pattern:</strong> {alert.historicalPattern}. 
          Impact Probability: <strong className={textColorClass}>{alert.impactProbability}</strong>.
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default WhaleAlert;
