
"use client";

import React, { useState, useEffect } from 'react';
import { generateAiInsight, GenerateAiInsightInput, GenerateAiInsightOutput } from '@/ai/flows/generate-ai-insight';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
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
        setInsight(result);
      } catch (error) {
        console.error('AI Insight Error:', error);
        setInsight(null); // Clear any partial data
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
      return (
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
        <h4 className="font-headline text-lg text-primary">
          Elite AI Analysis Report
        </h4>
        {insight && (
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
