
"use client";

import React, { useState, useEffect } from 'react';
import { generateAiInsight, GenerateAiInsightInput, GenerateAiInsightOutput } from '@/ai/flows/generate-ai-insight';
import { Button } from '@/components/ui/button';
import { Copy, BrainCircuit, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

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
        if (result.executiveSummary.primaryBias === "Error") {
            toast({
                title: "AI Analysis Error",
                description: result.executiveSummary.timeHorizon,
                variant: "destructive",
                duration: 8000
            });
        } else if (result.executiveSummary.primaryBias === "Summary (Fallback Model)") {
             toast({
                title: "AI Model Busy",
                description: "Primary model is busy. Displaying a condensed summary from a high-speed model.",
                variant: "default",
                duration: 8000
            });
        }
        setInsight(result);
      } catch (error) {
        console.error('AI Insight Error:', error);
        setInsight(null);
        toast({ title: "AI Error", description: "The Elite AI failed to generate the report. This might be a network issue or an API quota limit.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
  }, [data, toast]);


  const copyToClipboard = () => {
    if (!insight) return;
    const fullText = Object.entries(insight)
      .map(([section, content]) => {
        const title = section.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
        const sectionContent = Object.entries(content)
          .map(([key, value]) => `${key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}: ${value}`)
          .join('\n');
        return `## ${title}\n${sectionContent}`;
      })
      .join('\n\n');
    navigator.clipboard.writeText(fullText.trim());
    toast({ title: 'Success', description: 'Elite AI Report copied to clipboard!' });
  };

  const renderSection = (title: string, content: Record<string, string>) => (
    <AccordionItem value={title}>
      <AccordionTrigger className="font-headline text-primary/90 text-md">{title}</AccordionTrigger>
      <AccordionContent className="space-y-2 text-sm text-foreground/80 pl-2">
        {Object.entries(content).map(([key, value]) => (
          <div key={key}>
            <strong className="text-primary/70 block">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:</strong>
            <p className="whitespace-pre-wrap">{value}</p>
          </div>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
  
  const LoadingState = () => (
     <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )

  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (insight) {
      if (insight.executiveSummary.primaryBias === "Error") {
        return (
           <div className="text-center text-destructive-foreground bg-destructive/30 p-4 rounded-md border border-destructive">
             <strong>AI Analysis Failed:</strong>
             <p className="mt-2">{insight.executiveSummary.timeHorizon}</p>
          </div>
        )
      }

      if (insight.executiveSummary.primaryBias === "Summary (Fallback Model)") {
        return (
             <div className="p-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg border border-accent/50 shadow-[0_0_15px_hsl(var(--accent)_/_0.5)]">
              <h4 className="font-headline text-lg text-accent flex items-center gap-2 mb-2">
                  Executive Summary (Fallback Model)
              </h4>
              <p className="text-sm text-foreground/90">{insight.executiveSummary.timeHorizon}</p>
              <p className="text-xs text-foreground/60 mt-3">Full analysis is unavailable due to high model demand. This is a condensed report from a high-speed model.</p>
            </div>
        )
      }

      return (
        <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg border border-accent/50 shadow-[0_0_15px_hsl(var(--accent)_/_0.5)]">
              <h4 className="font-headline text-lg text-accent flex items-center gap-2 mb-2">
                  <Target /> Predictive Analysis
              </h4>
              <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                      <span className="text-foreground/80">Predicted Target:</span>
                      <span className="font-mono font-bold text-lg text-accent">{insight.predictiveAnalysis.predictedTarget}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-foreground/80">Timeframe:</span>
                      <span className="font-mono text-foreground/90">{insight.predictiveAnalysis.timeframe}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-foreground/80">Success Probability:</span>
                      <span className="font-mono font-bold text-lg text-green-400">{insight.predictiveAnalysis.successProbability}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-foreground/80">Invalidation Level:</span>
                      <span className="font-mono text-yellow-400">{insight.predictiveAnalysis.invalidationLevel}</span>
                  </div>
              </div>
            </div>

            <Accordion type="single" collapsible defaultValue="Executive Summary">
              {renderSection("Executive Summary", insight.executiveSummary)}
              {renderSection("Technical Analysis", insight.technicalAnalysis)}
              {renderSection("Risk Management", insight.riskManagement)}
              {renderSection("Sentiment & Flow", insight.sentimentAndFlow)}
              {renderSection("Probability Assessment", insight.probabilityAssessment)}
              {renderSection("Advanced Confluence", insight.advancedConfluence)}
              {renderSection("Institutional Behavior", insight.institutionalBehavior)}
              {renderSection("Execution Strategy", insight.executionStrategy)}
              {renderSection("Market Context", insight.marketContext)}
              {renderSection("Performance Tracking", insight.performanceTracking)}
              {renderSection("Alert System", insight.alertSystem)}
            </Accordion>
        </div>
      );
    }
    
    return (
      <div className="text-center text-destructive-foreground bg-destructive/30 p-4 rounded-md border border-destructive">
          The AI failed to generate the report. This might be due to a network issue or an internal error. Please try again by refreshing the signal.
      </div>
    );
  };

  return (
    <div className="p-5 bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-2 border-primary rounded-xl shadow-[0_0_20px_var(--primary)]">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-headline text-lg text-primary flex items-center gap-2">
          <BrainCircuit /> Elite AI Analysis Report
        </h4>
        {insight && insight.executiveSummary.primaryBias !== "Error" && insight.executiveSummary.primaryBias !== "Summary (Fallback Model)" && (
            <Button onClick={copyToClipboard} variant="outline" size="sm" className="gap-2 border-primary/50 hover:bg-primary/20" disabled={!insight}>
            <Copy size={14} /> Copy Report
            </Button>
        )}
      </div>
      {renderContent()}
    </div>
  );
};

export default EliteAiInsight;
