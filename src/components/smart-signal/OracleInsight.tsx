"use client";

import React, { useState, useEffect } from 'react';
import { generateOracleInsight, OracleInsightInput } from '@/ai/flows/oracle-insight';
import { Skeleton } from '../ui/skeleton';
import { Sparkles } from 'lucide-react';

interface OracleInsightProps {
  data: OracleInsightInput;
}

const OracleInsight: React.FC<OracleInsightProps> = ({ data }) => {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      setLoading(true);
      try {
        const result = await generateOracleInsight(data);
        setInsight(result.insight);
      } catch (error) {
        console.error('Oracle Insight Error:', error);
        setInsight("The stream is unclear... A powerful signal has blinded me. Trust your analysis.");
      }
      setLoading(false);
    };

    fetchInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.symbol, data.isBullish, data.volatility]); // Only re-run when fundamental signal data changes, not on price ticks.

  return (
    <div className="mt-5 p-5 bg-gradient-to-tr from-purple-900/40 via-black to-yellow-900/40 border-2 border-amber-400 rounded-xl shadow-[0_0_25px_hsl(45,100%,50%,0.6)] animate-pulse-glow">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-headline text-lg text-amber-400 flex items-center gap-2">
          <Sparkles className="text-amber-300" />
          The Oracle Speaks
        </h4>
      </div>
      
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-amber-400/20" />
          <Skeleton className="h-4 w-3/4 bg-amber-400/20" />
        </div>
      ) : (
        <p className="text-center text-lg italic text-amber-200/90 whitespace-pre-wrap font-serif">"{insight}"</p>
      )}
    </div>
  );
};

export default OracleInsight;
