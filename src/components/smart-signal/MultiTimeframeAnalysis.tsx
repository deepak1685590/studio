
"use client";

import React from 'react';
import { MultiTimeframeAnalysis as MultiTimeframeAnalysisType, Trend } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MultiTimeframeAnalysisProps {
  data: MultiTimeframeAnalysisType;
}

const TimeframeBadge: React.FC<{ timeframe: string; trend: Trend }> = ({ timeframe, trend }) => {
  const trendClasses = {
    Bullish: 'bg-green-500/20 text-green-400 border-green-500/50',
    Bearish: 'bg-red-500/20 text-red-400 border-red-500/50',
    Neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
  };

  return (
    <div className="text-center">
      <div className="text-xs text-foreground/70 mb-1">{timeframe}</div>
      <Badge variant="outline" className={cn("font-bold", trendClasses[trend])}>
        {trend}
      </Badge>
    </div>
  );
};

const MultiTimeframeAnalysis: React.FC<MultiTimeframeAnalysisProps> = ({ data }) => {
  const timeframes: (keyof MultiTimeframeAnalysisType)[] = ['5m', '15m', '1H', '4H', 'Daily'];
  const availableTimeframes = timeframes.filter(tf => data[tf]);

  return (
    <div className="grid grid-cols-5 gap-4 p-4 bg-black/30 rounded-lg border border-primary/20">
      {availableTimeframes.map(tf => (
        <TimeframeBadge key={tf} timeframe={tf} trend={data[tf]!} />
      ))}
    </div>
  );
};

export default MultiTimeframeAnalysis;
