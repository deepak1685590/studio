
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSignalData } from '@/lib/technical-analysis';
import type { SignalData } from '@/types';
import SignalCard from './SignalCard';
import html2canvas from 'html2canvas';
import { Rocket, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Timeframe } from '@/types';
import jsPDF from 'jspdf';
import { cn } from '@/lib/utils';

interface SmartSignalWidgetProps {
  initialSymbol?: string;
}

const cryptoAssetsForWebsocket = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE'];

const SmartSignalWidget: React.FC<SmartSignalWidgetProps> = ({ initialSymbol = 'BTC' }) => {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [mode, setMode] = useState('3');
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [loading, setLoading] = useState(false);
  const [signalData, setSignalData] = useState<SignalData | null>(null);
  const [realtimePrice, setRealtimePrice] = useState<number | null>(null);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const { toast } = useToast();

  const ws = useRef<WebSocket | null>(null);
  const previousPriceRef = useRef<number | null>(null);

  const handleGenerateSignal = useCallback(async () => {
    if (!symbol) {
      toast({ title: "Input Error", description: "Please enter a symbol.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setSignalData(null);
    setRealtimePrice(null);
    previousPriceRef.current = null;

    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    try {
      const data = await getSignalData(symbol.toUpperCase(), mode, timeframe);
      setSignalData(data);
      setRealtimePrice(data.price);
      previousPriceRef.current = data.price;

      if (typeof window !== 'undefined') {
        const isCrypto = cryptoAssetsForWebsocket.includes(data.symbol.toUpperCase());
        const isForex = data.symbol.includes('/');
        
        if (isCrypto && !isForex) {
          const wsSymbol = data.symbol.toLowerCase() + 'usdt';
          const socket = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@trade`);
          ws.current = socket;

          socket.onopen = () => console.log(`WebSocket connected for ${wsSymbol}`);
          socket.onmessage = (event) => {
            const messageData = JSON.parse(event.data);
            const newPrice = parseFloat(messageData.p);
            
            setRealtimePrice(newPrice);
            
            if (previousPriceRef.current !== null) {
              if (newPrice > previousPriceRef.current) {
                setPriceDirection('up');
              } else if (newPrice < previousPriceRef.current) {
                setPriceDirection('down');
              }
            }
            previousPriceRef.current = newPrice;
          };
          socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
          };
          socket.onclose = () => {
            console.log(`WebSocket disconnected for ${wsSymbol}`);
          };
        }
      }

    } catch (error) {
      console.error("Error generating signal:", error);
      toast({ title: "API Error", description: "Failed to fetch market data. Using mock data.", variant: "destructive" });
      const mockData = await getSignalData(symbol.toUpperCase(), mode, timeframe, true);
      setSignalData(mockData);
      setRealtimePrice(mockData.price);
    } finally {
      setLoading(false);
    }
  }, [symbol, mode, timeframe, toast]);
  
  useEffect(() => {
    handleGenerateSignal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const handleDownloadPng = () => {
    const cardElement = document.getElementById('signal-card-content');
    if (cardElement) {
        html2canvas(cardElement, {
            backgroundColor: '#000000',
            scale: 2,
            useCORS: true,
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `SmartSignal_${symbol.toUpperCase()}_${new Date().toISOString()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast({ title: "Success", description: "PNG Signal card downloaded." });
        }).catch(err => {
            console.error("html2canvas error:", err);
            toast({ title: "Error", description: "Could not generate image.", variant: "destructive" });
        });
    }
  };

  const handleDownloadPdf = () => {
    const cardElement = document.getElementById('signal-card-content');
    if (cardElement) {
      html2canvas(cardElement, {
        backgroundColor: '#000000',
        scale: 2,
        useCORS: true,
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`SmartSignal_${symbol.toUpperCase()}_${new Date().toISOString()}.pdf`);
        toast({ title: "Success", description: "PDF Signal card downloaded." });
      }).catch(err => {
        console.error("PDF generation error:", err);
        toast({ title: "Error", description: "Could not generate PDF.", variant: "destructive" });
      });
    }
  };

  const isBullish = signalData?.isBullish;
  const borderColor = isBullish === true ? 'border-green-400/80 shadow-green-400/30' : isBullish === false ? 'border-red-500/80 shadow-red-500/30' : 'border-primary shadow-primary/30';
  const buttonColor = isBullish === true ? 'border-green-400/80 bg-green-500/20 hover:bg-green-400 hover:text-background' : isBullish === false ? 'border-red-500/80 bg-red-500/20 hover:bg-red-500 hover:text-white' : 'border-primary bg-primary/20 hover:bg-primary hover:text-background';
  const inputColor = isBullish === true ? 'border-green-400/50 focus:shadow-[0_0_15px_rgba(74,222,128,0.5)]' : isBullish === false ? 'border-red-500/50 focus:shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-primary/50 focus:shadow-[0_0_15px_rgba(0,255,255,0.5)]';


  return (
    <div className={cn(
      "smartsignal-widget w-full border-2 rounded-xl overflow-hidden shadow-[0_0_30px_var(--tw-shadow-color)] bg-black/70 backdrop-blur-sm transition-all duration-500",
      borderColor
    )}>
      <header className="widget-header p-4 text-center font-headline text-2xl bg-black/50">
        <span className="animate-neon-blue">🚀 SmartSignal Pro</span>
        <span className="text-primary mx-2">-</span>
        <span className="animate-neon-purple">Quantum Analysis Engine</span>
      </header>
      <div className="widget-body p-6 space-y-4">
        <div>
          <label htmlFor="symbolInput" className="text-sm font-bold text-primary/80">Enter asset (e.g., BTC, ETH, SOL)</label>
          <Input 
            id="symbolInput"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="e.g. BTC"
            className={cn("bg-input text-foreground", inputColor)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="modeSelect" className="text-sm font-bold text-primary/80">Select Mode</label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger id="modeSelect" className={cn("bg-input text-foreground", inputColor)}>
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
                <Select value={timeframe} onValueChange={(value) => setTimeframe(value as Timeframe)}>
                  <SelectTrigger id="timeframeSelect" className={cn("bg-input text-foreground", inputColor)}>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5m">5m - Scalping</SelectItem>
                    <SelectItem value="15m">15m - Intraday</SelectItem>
                    <SelectItem value="1h">1h - Day Trading</SelectItem>
                    <SelectItem value="4h">4h - Swing</SelectItem>
                    <SelectItem value="1d">1d - Positional</SelectItem>
                  </SelectContent>
                </Select>
            </div>
        </div>

        <Button onClick={() => handleGenerateSignal()} disabled={loading} className={cn("w-full font-headline uppercase border-2 transition-all duration-300", buttonColor)}>
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

        {signalData && <SignalCard data={signalData} onDownloadPng={handleDownloadPng} onDownloadPdf={handleDownloadPdf} realtimePrice={realtimePrice} priceDirection={priceDirection}/>}

      </div>
    </div>
  );
};

export default SmartSignalWidget;
