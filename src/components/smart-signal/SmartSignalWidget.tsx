"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSignalData } from '@/lib/technical-analysis';
import type { SignalData } from '@/types';
import SignalCard from './SignalCard';
import html2canvas from 'html2canvas';
import { Rocket, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SmartSignalWidget = () => {
  const [symbol, setSymbol] = useState('BTC');
  const [mode, setMode] = useState('3');
  const [timeframe, setTimeframe] = useState('15m');
  const [loading, setLoading] = useState(false);
  const [signalData, setSignalData] = useState<SignalData | null>(null);
  const { toast } = useToast();

  const handleGenerateSignal = async () => {
    if (!symbol) {
      toast({ title: "Input Error", description: "Please enter a symbol.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setSignalData(null);
    try {
      const data = await getSignalData(symbol, mode, timeframe as '5m' | '15m');
      setSignalData(data);
    } catch (error) {
      console.error("Error generating signal:", error);
      toast({ title: "API Error", description: "Failed to fetch market data. Using mock data.", variant: "destructive" });
      // Fallback to mock data on error
      const mockData = await getSignalData(symbol, mode, timeframe as '5m' | '15m', true);
      setSignalData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const cardElement = document.getElementById('signal-card-content');
    if (cardElement) {
        html2canvas(cardElement, {
            backgroundColor: '#000000',
            scale: 2,
            useCORS: true,
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `SmartSignal_${symbol.toUpperCase()}_${new Date().toISOString()}.png`;
            link.href = canvas.toDataURL();
            link.click();
            toast({ title: "Success", description: "Signal card downloaded." });
        }).catch(err => {
            console.error("html2canvas error:", err);
            toast({ title: "Error", description: "Could not generate image.", variant: "destructive" });
        });
    }
  };

  return (
    <div className="smartsignal-widget max-w-3xl mx-auto border-2 border-primary rounded-xl overflow-hidden shadow-[0_0_30px_var(--primary)] bg-black/70 backdrop-blur-sm">
      <header className="widget-header p-4 text-center font-headline text-2xl bg-gradient-to-r from-accent to-primary text-background">
        🚀 SmartSignal Pro - Quantum Analysis Engine
      </header>
      <div className="widget-body p-6 space-y-4">
        <div>
          <label htmlFor="symbolInput" className="text-sm font-bold text-primary/80">Enter asset (e.g., BTC, ETH, SOL)</label>
          <Input 
            id="symbolInput"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="e.g. BTC"
            className="bg-input text-foreground border-primary/50 focus:shadow-[0_0_15px_rgba(0,255,255,0.5)]"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="modeSelect" className="text-sm font-bold text-primary/80">Select Mode</label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger id="modeSelect" className="bg-input text-foreground border-primary/50 focus:shadow-[0_0_15px_rgba(0,255,255,0.5)]">
                    <SelectValue placeholder="Select analysis mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Quick Pulse</SelectItem>
                    <SelectItem value="2">2 - Pro Signal</SelectItem>
                    <SelectItem value="3">3 - Elite Mode (AI-Powered)</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div>
                <label htmlFor="timeframeSelect" className="text-sm font-bold text-primary/80">Select Timeframe</label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger id="timeframeSelect" className="bg-input text-foreground border-primary/50 focus:shadow-[0_0_15px_rgba(0,255,255,0.5)]">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15m">15m - Standard</SelectItem>
                    <SelectItem value="5m">5m - Scalping</SelectItem>
                  </SelectContent>
                </Select>
            </div>
        </div>

        <Button onClick={handleGenerateSignal} disabled={loading} className="w-full font-headline uppercase bg-primary/20 border-2 border-primary hover:bg-primary hover:text-background transition-all duration-300">
          {loading ? (
            <>
              <BrainCircuit className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Market Vectors...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              Engage Quantum Analysis
            </>
          )}
        </Button>
        
        {loading && (
             <div className="text-center text-primary/80 italic p-4">
                Initializing Quantum Matrix... This may take a moment.
             </div>
        )}

        {signalData && <SignalCard data={signalData} onDownload={handleDownload} />}

      </div>
    </div>
  );
};

export default SmartSignalWidget;
