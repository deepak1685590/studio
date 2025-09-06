
"use client";

import React, { useState, useEffect } from 'react';
import { generateOracleInsight, OracleInsightInput, OracleInsightOutput } from '@/ai/flows/oracle-insight';
import { Sparkles } from 'lucide-react';

interface OracleInsightProps {
  data: OracleInsightInput;
}

const OracleInsight: React.FC<OracleInsightProps> = ({ data }) => {
  const [insight, setInsight] = useState<OracleInsightOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      setLoading(true);
      setInsight(null);
      try {
        const result = await generateOracleInsight(data);
        setInsight(result);
      } catch (error) {
        console.error('Oracle Insight Error:', error);
        setInsight({
            persona: "The Oracle",
            insight: "The stream is unclear... A powerful signal has blinded me. Trust your analysis."
        });
      }
      setLoading(false);
    };

    fetchInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.symbol]); // Only re-run when the symbol changes to conserve API calls.

  return (
    <div className="mt-5 p-5 bg-gradient-to-tr from-yellow-900/40 via-black to-purple-900/40 border-2 border-amber-400 rounded-xl shadow-[0_0_25px_hsl(38_92%_50%_/_0.6)] animate-pulse-glow">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-headline text-lg text-amber-400 flex items-center gap-2">
          <Sparkles className="text-amber-300" />
          The Oracle Speaks
        </h4>
      </div>
      
      {loading ? (
        <div className="text-center italic text-amber-200/70 p-4">
          Consulting the digital ether...
        </div>
      ) : insight ? (
        <div className="text-center pt-2">
            <p className="text-lg italic text-amber-200/90 whitespace-pre-wrap font-serif">"{insight.insight}"</p>
        </div>
      ) : null}
    </div>
  );
};

export default OracleInsight;
