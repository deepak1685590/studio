
"use client";

import React, { useState, useEffect } from 'react';
import { generateAiInsight, GenerateAiInsightInput, GenerateAiInsightOutput } from '@/ai/flows/generate-ai-insight';
import { Button } from '@/components/ui/button';
import { Copy, BrainCircuit, Rocket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import PredictiveAnalysis from './PredictiveAnalysis';
import { getSignalData } from '@/lib/technical-analysis';
import type { SignalData } from '@/types';

interface EliteAiInsightProps {
  data: GenerateAiInsightInput | null;
  setSignalData: (data: SignalData | null) => void;
}

const EliteAiInsight: React.FC<EliteAiInsightProps> = ({ data: initialData, setSignalData }) => {
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
    setLoading(true);
    try {
      const signalData: SignalData = await getSignalData(symbol.toUpperCase(), '3', '15m', false); // Explicitly request live data
      setSignalData(signalData); // Update parent component
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
    const summaryText = `## Executive Summary\n- Primary Bias: ${executiveSummary.primaryBias}\n- Setup Strength: ${executiveSummary.setupStrength}\n- Opportunity Grade: ${executiveSummary.opportunityGrade}\n- Time Horizon: ${executiveSummary.timeHorizon}`;
    const setupText = `## AI-Optimized Trade Setup\n- Entry Price: ${tradeSetup.entryPrice}\n- Stop-Loss: ${tradeSetup.stopLoss}\n- Take-Profit 1: ${tradeSetup.takeProfit1}\n- Take-Profit 2: ${tradeSetup.takeProfit2}\n- Rationale: ${tradeSetup.tradeRationale}`;
    const predictiveText = `## Predictive Analysis\n- Primary Scenario: ${predictiveAnalysis.primaryScenario}\n- Success Probability: ${predictiveAnalysis.successProbability}\n- Alternative Scenario: ${predictiveAnalysis.alternativeScenario}`;
    const fullText = [summaryText, setupText, predictiveText].join('\n\n');
    navigator.clipboard.writeText(fullText);
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
      
      const { executiveSummary, tradeSetup, predictiveAnalysis } = insight;

      return (
        <div className="space-y-4">
            <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/50">
                <CardHeader>
                    <CardTitle className="font-headline text-primary/90 text-md">Executive Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div><strong className="text-primary/70">Primary Bias:</strong> {executiveSummary.primaryBias}</div>
                    <div><strong className="text-primary/70">Setup Strength:</strong> {executiveSummary.setupStrength}</div>
                    <div><strong className="text-primary/70">Opportunity Grade:</strong> {executiveSummary.opportunityGrade}</div>
                    <div><strong className="text-primary/70">Time Horizon:</strong> {executiveSummary.timeHorizon}</div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-accent/10 to-transparent border-accent/50">
                <CardHeader>
                    <CardTitle className="font-headline text-accent/90 text-md">AI-Optimized Trade Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div><strong className="text-accent/70">Entry Price:</strong> <span className="font-mono">{tradeSetup.entryPrice}</span></div>
                        {tradeSetup.secondaryEntryPrice && <div><strong className="text-accent/70">Secondary Entry:</strong> <span className="font-mono">{tradeSetup.secondaryEntryPrice}</span></div>}
                        <div><strong className="text-accent/70">Stop-Loss:</strong> <span className="font-mono">{tradeSetup.stopLoss}</span></div>
                        <div><strong className="text-accent/70">Take-Profit 1:</strong> <span className="font-mono">{tradeSetup.takeProfit1}</span></div>
                        <div><strong className="text-accent/70">Take-Profit 2:</strong> <span className="font-mono">{tradeSetup.takeProfit2}</span></div>
                    </div>
                    <p><strong className="text-accent/70">Rationale:</strong> {tradeSetup.tradeRationale}</p>
                </CardContent>
            </Card>
            
            <PredictiveAnalysis analysis={predictiveAnalysis} />

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
