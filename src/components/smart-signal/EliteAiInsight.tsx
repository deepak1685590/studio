
"use client";

import React, { useState, useEffect } from 'react';
import { generateAiInsight, GenerateAiInsightInput, GenerateAiInsightOutput } from '@/ai/flows/generate-ai-insight';
import { Button } from '@/components/ui/button';
import { Copy, BrainCircuit, Rocket, Target, AlertTriangle, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { Input } from '../ui/input';
import { getSignalData } from '@/lib/technical-analysis';
import type { SignalData } from '@/types';
import { cn } from '@/lib/utils';

interface EliteAiInsightProps {
  data: GenerateAiInsightInput | null;
}

const GradeBadge: React.FC<{ grade: string }> = ({ grade }) => {
  const gradeColors: { [key: string]: string } = {
    'A+': 'bg-green-500/80 text-white shadow-[0_0_15px_theme(colors.green.500)]',
    'A': 'bg-green-500/40 text-green-300',
    'B+': 'bg-cyan-500/40 text-cyan-300',
    'B': 'bg-yellow-500/40 text-yellow-300',
    'C': 'bg-orange-500/40 text-orange-300',
  };
  return (
    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center font-headline text-3xl border-2 border-current", gradeColors[grade] || 'bg-gray-500/40 text-gray-300')}>
      {grade}
    </div>
  );
};

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
        if ((result.executiveSummary as any).timeHorizon) { // Check for fallback/error field
            const isError = result.executiveSummary.primaryBias === "Error";
            toast({
                title: isError ? "AI Analysis Error" : "AI Model Busy",
                description: (result.executiveSummary as any).timeHorizon,
                variant: isError ? "destructive" : "default",
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
    setLoading(true);
    try {
      const signalData: SignalData = await getSignalData(symbol.toUpperCase(), '3', '15m', false); // Explicitly request live data
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
      toast({ title: "Error", description: `Could not fetch data for ${symbol.toUpperCase()}. Displaying last known data or mock data.`, variant: "destructive" });
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!insight) return;
    const { executiveSummary, tradeSetup, predictiveAnalysis } = insight;
    const fullText = `
## Executive Summary
- Primary Bias: ${executiveSummary.primaryBias}
- Setup Strength: ${executiveSummary.setupStrength}
- Opportunity Grade: ${executiveSummary.opportunityGrade}

## AI-Optimized Trade Setup
- Entry Price: ${tradeSetup.entryPrice}
- Stop-Loss: ${tradeSetup.stopLoss}
- Take-Profit 1: ${tradeSetup.takeProfit1}
- Take-Profit 2: ${tradeSetup.takeProfit2}
- Rationale: ${tradeSetup.tradeRationale}

## Predictive Analysis
- Primary Scenario: ${predictiveAnalysis.primaryScenario}
- Success Probability: ${predictiveAnalysis.successProbability}
- Alternative Scenario: ${predictiveAnalysis.alternativeScenario}
    `;
    navigator.clipboard.writeText(fullText.trim());
    toast({ title: 'Success', description: 'Elite AI Report copied to clipboard!' });
  };
  
  const LoadingState = () => (
     <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-28 w-full" />
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
      if ((insight.executiveSummary as any).timeHorizon) { // Check for fallback/error field
        const isError = insight.executiveSummary.primaryBias === "Error";
        return (
           <div className={cn("text-center p-4 rounded-md border", isError ? "text-destructive-foreground bg-destructive/30 border-destructive" : "text-foreground bg-accent/20 border-accent")}>
             <strong>{isError ? "AI Analysis Failed" : "AI Model Busy"}</strong>
             <p className="mt-2">{(insight.executiveSummary as any).timeHorizon}</p>
          </div>
        )
      }
      
      const { executiveSummary, tradeSetup, predictiveAnalysis } = insight;

      return (
        <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg border border-accent/50 shadow-[0_0_15px_hsl(var(--accent)_/_0.5)] flex items-center gap-4">
                <GradeBadge grade={executiveSummary.opportunityGrade} />
                <div className="flex-1">
                    <h4 className="font-headline text-lg text-accent">Executive Summary</h4>
                    <p><strong>Bias:</strong> {executiveSummary.primaryBias}</p>
                    <p><strong>Strength:</strong> {executiveSummary.setupStrength}</p>
                </div>
            </div>
            
            <div className="p-4 bg-black/30 rounded-lg border border-primary/20">
                 <h4 className="font-headline text-md text-primary mb-2">AI-Optimized Trade Setup</h4>
                 <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>Entry: <strong className="font-mono float-right">{tradeSetup.entryPrice}</strong></div>
                    <div>Stop-Loss: <strong className="font-mono float-right text-red-400">{tradeSetup.stopLoss}</strong></div>
                    <div>Take-Profit 1: <strong className="font-mono float-right text-green-400">{tradeSetup.takeProfit1}</strong></div>
                    <div>Take-Profit 2: <strong className="font-mono float-right text-green-400">{tradeSetup.takeProfit2}</strong></div>
                 </div>
                 <p className="text-xs italic text-foreground/70 mt-2"><strong>Rationale:</strong> {tradeSetup.tradeRationale}</p>
            </div>

            <div className="p-4 bg-black/30 rounded-lg border border-primary/20 space-y-2">
                 <h4 className="font-headline text-md text-primary flex items-center justify-between">
                    <span>Predictive Analysis</span>
                    <span className="font-mono text-lg text-green-400">{predictiveAnalysis.successProbability} Success</span>
                 </h4>
                 <p className="text-sm"><strong className="text-primary/80"><Lightbulb size={14} className="inline-block mr-1"/> Primary Scenario:</strong> {predictiveAnalysis.primaryScenario}</p>
                 <p className="text-sm"><strong className="text-yellow-400/80"><AlertTriangle size={14} className="inline-block mr-1"/> Alternative:</strong> {predictiveAnalysis.alternativeScenario}</p>
            </div>
        </div>
      );
    }
    
    return (
      <div className="text-center text-destructive-foreground bg-destructive/30 p-4 rounded-md border border-destructive">
          The AI failed to generate the report. This might be due to a network issue or an internal error. Please try again.
      </div>
    );
  };

  return (
    <div className="p-5 bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-2 border-primary rounded-xl shadow-[0_0_20px_var(--primary)] space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-headline text-lg text-primary flex items-center gap-2">
          <BrainCircuit /> Elite AI Analysis Report
        </h4>
        {insight && !(insight.executiveSummary as any).timeHorizon && (
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
