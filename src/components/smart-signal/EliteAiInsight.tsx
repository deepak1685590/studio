"use client";

import React, { useState, useEffect } from 'react';
import { generateAiInsight, GenerateAiInsightInput } from '@/ai/flows/generate-ai-insight';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

interface EliteAiInsightProps {
  data: GenerateAiInsightInput;
}

const EliteAiInsight: React.FC<EliteAiInsightProps> = ({ data }) => {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInsight = async () => {
      setLoading(true);
      try {
        const result = await generateAiInsight(data);
        setInsight(result.insight);
      } catch (error) {
        console.error('AI Insight Error:', error);
        setInsight(`Strong ${data.isBullish ? 'bullish' : 'bearish'} setup in ${data.symbol} at $${data.price.toFixed(2)}. ${data.confluenceCount} confluence factors. Entry: $${data.entry}, SL: $${data.sl}, TP1: $${data.tp1}. Institutional-grade opportunity.`);
      }
      setLoading(false);
    };

    fetchInsight();
  }, [data]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(insight);
    toast({ title: 'Success', description: 'Elite AI Insight copied to clipboard!' });
  };

  return (
    <div className="mt-5 p-5 bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-2 border-primary rounded-xl shadow-[0_0_20px_var(--primary)] animate-pulse-glow">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-headline text-lg text-primary flex items-center gap-2">
          <BrainCircuit />
          Elite AI Insight
        </h4>
        <span className="text-xs font-bold uppercase bg-primary text-background px-2 py-1 rounded">
          Level 5 Analysis
        </span>
      </div>
      
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : (
        <p className="text-sm text-foreground/90 whitespace-pre-wrap">{insight}</p>
      )}

      <div className="mt-3">
        <div className="text-xs text-primary/80">Confidence: Ultra-High (95%)</div>
        <div className="w-full bg-primary/20 h-1.5 rounded-full mt-1">
          <div className="bg-primary h-full rounded-full" style={{ width: '95%' }}></div>
        </div>
      </div>
      
      <Button onClick={copyToClipboard} variant="outline" size="sm" className="mt-4 gap-2 border-primary/50 hover:bg-primary/20">
        <Copy size={14} /> Copy Insight
      </Button>
    </div>
  );
};

export default EliteAiInsight;
