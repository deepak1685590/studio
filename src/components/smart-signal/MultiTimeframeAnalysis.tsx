
"use client";

import React from 'react';
import { MultiTimeframeAnalysis as MultiTimeframeAnalysisType, TimeframeData } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';
import { Layers } from 'lucide-react';

interface MultiTimeframeAnalysisProps {
  data: MultiTimeframeAnalysisType;
}

const SectionHeader = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
  <h4 className="font-headline text-lg text-primary mb-2 flex items-center gap-2">{icon}{title}</h4>
);


const TimeframeCell: React.FC<{ timeframe: string; data: TimeframeData }> = ({ timeframe, data }) => {
  const { trend, strength } = data;
  
  const trendClasses = {
    Bullish: 'text-green-400 border-green-400/50 bg-green-900/40',
    Bearish: 'text-red-400 border-red-400/50 bg-red-900/40',
    Neutral: 'text-yellow-400 border-yellow-400/50 bg-yellow-900/40',
  };
  
  const progressColor = trend === 'Bullish' ? 'bg-green-500' : trend === 'Bearish' ? 'bg-red-500' : 'bg-yellow-500';

  return (
    <div className={cn("p-3 rounded-lg border text-center space-y-2", trendClasses[trend])}>
      <div className="font-headline text-lg">{timeframe}</div>
      <Badge variant="outline" className={cn("font-bold text-base", trendClasses[trend])}>
        {trend}
      </Badge>
       <div>
        <Progress value={strength} className="h-2 [&>div]:bg-current" />
        <div className="text-xs mt-1 font-mono">{strength}% Strength</div>
       </div>
    </div>
  );
};

const MultiTimeframeAnalysis: React.FC<MultiTimeframeAnalysisProps> = ({ data }) => {
  const timeframes: (keyof MultiTimeframeAnalysisType)[] = ['5m', '15m', '1H', '4H', 'Daily'];
  const availableTimeframes = timeframes.filter(tf => data[tf]);

  return (
    <div className="p-4 bg-black/30 rounded-lg border border-accent/50 shadow-[0_0_15px_hsl(var(--accent)_/_0.3)]">
      <SectionHeader icon={<Layers />} title="Multi-Timeframe Analysis" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
        {availableTimeframes.map(tf => (
          <TimeframeCell key={tf} timeframe={tf.toUpperCase()} data={data[tf]!} />
        ))}
      </div>
    </div>
  );
};

export default MultiTimeframeAnalysis;
