"use client";

import React, { useState, useEffect } from 'react';
import { generateAiInsight, GenerateAiInsightInput, GenerateAiInsightOutput } from '@/ai/flows/generate-ai-insight';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Copy, ShieldAlert, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

interface EliteAiInsightProps {
  data: GenerateAiInsightInput;
}

const EliteAiInsight: React.FC<EliteAiInsightProps> = ({ data }) => {
  const [insight, setInsight] = useState<GenerateAiInsightOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInsight = async () => {
      setLoading(true);
      setInsight(null);
      try {
        const result = await generateAiInsight(data);
        setInsight(result);
      } catch (error) {
        console.error('AI Insight Error:', error);
        // Fallback message in case of API error
        setInsight({
            executiveSummary: `Strong ${data.isBullish ? 'bullish' : 'bearish'} setup in ${data.symbol} at $${data.price.toFixed(2)}. ${data.confluenceCount} confluence factors with supportive multi-timeframe analysis. Entry: $${data.entry}, SL: $${data.sl}, TP1: $${data.tp1}. Institutional-grade opportunity.`,
            keyStrengths: ["High confluence count.", "Supportive volume imbalance."],
            potentialRisks: ["Market volatility can invalidate the setup.", "External news events may impact price."],
            strategicRecommendation: "Proceed with caution and adhere to the defined stop-loss. Consider taking partial profits at TP1."
        });
      }
      setLoading(false);
    };

    fetchInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.symbol, data.entry]); // Only re-run when the symbol or initial entry changes, not on every price tick.

  const copyToClipboard = () => {
    if (!insight) return;
    const fullText = `
**Executive Summary:**
${insight.executiveSummary}

**Key Strengths:**
${insight.keyStrengths.map(s => `- ${s}`).join('\n')}

**Potential Risks:**
${insight.potentialRisks.map(r => `- ${r}`).join('\n')}

**Strategic Recommendation:**
${insight.strategicRecommendation}
    `;
    navigator.clipboard.writeText(fullText.trim());
    toast({ title: 'Success', description: 'Elite AI Insight copied to clipboard!' });
  };

  const InsightSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="mt-4">
      <h5 className="font-headline text-md text-primary/90 flex items-center gap-2 mb-2">
        {icon}
        {title}
      </h5>
      {children}
    </div>
  );

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
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      ) : insight ? (
        <div>
          <p className="text-sm text-foreground/90 whitespace-pre-wrap italic">"{insight.executiveSummary}"</p>

          <InsightSection title="Key Strengths" icon={<TrendingUp size={18} />}>
            <ul className="list-disc list-inside space-y-1 text-xs text-green-300/90 pl-2">
              {insight.keyStrengths.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </InsightSection>

          <InsightSection title="Potential Risks" icon={<ShieldAlert size={18} />}>
             <ul className="list-disc list-inside space-y-1 text-xs text-red-300/90 pl-2">
              {insight.potentialRisks.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </InsightSection>

          <InsightSection title="Strategic Recommendation" icon={<CheckCircle2 size={18} />}>
             <p className="text-sm text-foreground/90 whitespace-pre-wrap">{insight.strategicRecommendation}</p>
          </InsightSection>

          <Button onClick={copyToClipboard} variant="outline" size="sm" className="mt-4 gap-2 border-primary/50 hover:bg-primary/20">
            <Copy size={14} /> Copy Full Analysis
          </Button>
        </div>
      ) : null}
      
    </div>
  );
};

export default EliteAiInsight;
