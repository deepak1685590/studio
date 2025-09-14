
"use client";

import React, { useState, useEffect } from 'react';
import { generateAiInsight, GenerateAiInsightInput, GenerateAiInsightOutput } from '@/ai/flows/generate-ai-insight';
import { Button } from '@/components/ui/button';
import { Copy, BrainCircuit, Rocket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import PredictiveAnalysis from './PredictiveAnalysis';
import { Input } from '../ui/input';
import { getSignalData } from '@/lib/technical-analysis';
import type { SignalData } from '@/types';

interface EliteAiInsightProps {
  data: GenerateAiInsightInput | null;
}

const EliteAiInsight: React.FC<EliteAiInsightProps> = ({ data: initialData }) => {
  const [insight, setInsight] = useState<GenerateAiInsightOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [symbol, setSymbol] = useState(initialData?.symbol || 'BTC');
  const [currentData, setCurrentData] = useState(initialData);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentData(initialData);
    if (initialData?.symbol) {
      setSymbol(initialData.symbol);
    }
  }, [initialData]);

  useEffect(() => {
    if (currentData) {
      fetchInsight(currentData);
    }
  }, [currentData]);

  const fetchInsight = async (data: GenerateAiInsightInput) => {
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
    
  const handleGenerate = async () => {
    toast({ title: "Generating New Report", description: `Fetching signal data for ${symbol.toUpperCase()}...` });
    try {
      const signalData: SignalData = await getSignalData(symbol.toUpperCase(), '3', '15m');
      const insightInput: GenerateAiInsightInput = {
        symbol: signalData.symbol,
        price: signalData.price,
        isBullish: signalData.isBullish,
        action: signalData.action,
        entry: parseFloat(signalData.entry),
        sl: parseFloat(signalData.sl),
        tp1: parseFloat(signalData.tp1),
        tp2: parseFloat(signalData.tp2),
        confluenceCount: signalData.confluenceCount,
        demandZone: `$${signalData.demandZone[0]} - ${signalData.demandZone[1]}`,
        fvg: `$${signalData.fvg[0]} - ${signalData.fvg[1]}`,
        volumeImbalance: signalData.volumeImbalance,
        multiTimeframeAnalysis: {
          '5m': signalData.multiTimeframeAnalysis['5m']?.trend || 'Neutral',
          '15m': signalData.multiTimeframeAnalysis['15m']?.trend || 'Neutral',
          '1H': signalData.multiTimeframeAnalysis['1H']?.trend || 'Neutral',
          '4H': signalData.multiTimeframeAnalysis['4H']?.trend || 'Neutral',
          'Daily': signalData.multiTimeframeAnalysis['Daily']?.trend || 'Neutral',
        },
        chartPatternName: signalData.chartPattern.name,
        trendStrength: signalData.trendStrength.score,
        momentum: signalData.momentum.score,
        marketSession: "New York", 
        volatilityRegime: "Medium", 
      };
      setCurrentData(insightInput);
    } catch (error) {
      console.error('Error generating signal for AI insight:', error);
      toast({ title: "Error", description: `Could not fetch data for ${symbol.toUpperCase()}.`, variant: "destructive" });
      setLoading(false);
    }
  };


  const copyToClipboard = () => {
    if (!insight) return;
    const fullText = Object.entries(insight)
      .map(([section, content]) => {
        const title = section.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
        const sectionContent = Object.entries(content)
          .map(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
                const subContent = Object.entries(value).map(([subKey, subValue]) => `  - ${subKey}: ${subValue}`).join('\n');
                return `${key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:\n${subContent}`;
            }
            return `${key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}: ${value}`
          })
          .join('\n');
        return `## ${title}\n${sectionContent}`;
      })
      .join('\n\n');
    navigator.clipboard.writeText(fullText.trim());
    toast({ title: 'Success', description: 'Elite AI Report copied to clipboard!' });
  };

  const renderSection = (title: string, content: Record<string, string | object | undefined>) => (
    <AccordionItem value={title}>
      <AccordionTrigger className="font-headline text-primary/90 text-md">{title}</AccordionTrigger>
      <AccordionContent className="space-y-2 text-sm text-foreground/80 pl-2">
        {Object.entries(content).map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            return (
              <div key={key}>
                <strong className="text-primary/70 block">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:</strong>
                <div className="pl-4">
                  {Object.entries(value).map(([subKey, subValue]) => (
                    <div key={subKey}>
                      <strong className="text-primary/60">{subKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:</strong>
                      <p className="whitespace-pre-wrap">{subValue}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return (
             value && (
              <div key={key}>
                <strong className="text-primary/70 block">{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}:</strong>
                <p className="whitespace-pre-wrap">{value as string}</p>
              </div>
            )
          )
        })}
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
    if (!currentData) {
        return <div className="text-center text-foreground/70">Enter a symbol and click "Generate Analysis" to begin.</div>;
    }
    
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
            <PredictiveAnalysis analysis={insight.predictiveAnalysis} isBullish={currentData.isBullish} />

            <Accordion type="single" collapsible defaultValue="Executive Summary">
              {renderSection("Executive Summary", insight.executiveSummary)}
              {insight.tradeSetup && renderSection("AI-Optimized Trade Setup", insight.tradeSetup)}
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
    <div className="p-5 bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-2 border-primary rounded-xl shadow-[0_0_20px_var(--primary)] space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-headline text-lg text-primary flex items-center gap-2">
          <BrainCircuit /> Elite AI Analysis Report
        </h4>
        {insight && insight.executiveSummary.primaryBias !== "Error" && insight.executiveSummary.primaryBias !== "Summary (Fallback Model)" && (
            <Button onClick={copyToClipboard} variant="outline" size="sm" className="gap-2 border-primary/50 hover:bg-primary/20" disabled={!insight}>
            <Copy size={14} /> Copy Report
            </Button>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Input 
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Enter asset (e.g., BTC, EUR/USD)"
            className="bg-input text-foreground border-primary/50"
        />
        <Button onClick={handleGenerate} disabled={loading} className="font-headline scanner-glow">
          <Rocket className="mr-2" />
          {loading ? 'Analyzing...' : 'Generate Analysis'}
        </Button>
      </div>

      <div className="pt-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default EliteAiInsight;
