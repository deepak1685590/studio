
"use client";

import React, { useState } from 'react';
import { generateOracleInsight, OracleInsightInput, OracleInsightOutput } from '@/ai/flows/oracle-insight';
import { Sparkles, Wand2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

interface OracleInsightProps {
  data: OracleInsightInput;
}

const OracleInsight: React.FC<OracleInsightProps> = ({ data }) => {
  const [insight, setInsight] = useState<OracleInsightOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisEngaged, setAnalysisEngaged] = useState(false);
  const { toast } = useToast();

  const fetchInsight = async () => {
    setLoading(true);
    setAnalysisEngaged(true);
    setInsight(null);
    try {
      const result = await generateOracleInsight(data);
      setInsight(result);
    } catch (error) {
      console.error('Oracle Insight Error:', error);
      toast({ title: "Oracle Error", description: "The Oracle is unavailable. This might be a network issue or an API quota limit.", variant: "destructive" });
      setInsight({
          persona: "The Oracle",
          insight: "The stream is unclear... A powerful signal has blinded me. Trust your analysis."
      });
    }
    setLoading(false);
  };

  return (
    <div className="p-5 bg-gradient-to-tr from-yellow-900/40 via-black to-purple-900/40 border-2 border-amber-400 rounded-xl shadow-[0_0_25px_hsl(38_92%_50%_/_0.6)]">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-headline text-lg text-amber-400 flex items-center gap-2">
          <Sparkles className="text-amber-300" />
          The Oracle Speaks
        </h4>
      </div>
      
      {!analysisEngaged ? (
        <div className="text-center p-4">
            <p className="text-sm text-foreground/80 mb-4">Consult the Oracle for cryptic wisdom on the current market state.</p>
            <Button onClick={fetchInsight} disabled={loading} className="font-headline bg-amber-500/20 border-2 border-amber-500 hover:bg-amber-500 hover:text-background text-amber-300 transition-all duration-300">
                <Wand2 className="mr-2" />
                Consult the Oracle
            </Button>
        </div>
      ) : loading ? (
        <div className="space-y-2 p-4">
          <Skeleton className="h-4 w-1/3 mx-auto" />
          <Skeleton className="h-8 w-full" />
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
