
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
  const [isMockData, setIsMockData] = useState(false);
  const { toast } = useToast();

  const ws = useRef<WebSocket | null>(null);
  const currentSymbolRef = useRef(initialSymbol);

  const handleGenerateSignal = useCallback(async (isInitialLoad = false) => {
    const targetSymbol = isInitialLoad ? initialSymbol : symbol.toUpperCase();
    if (!targetSymbol) {
      if (!isInitialLoad) {
        toast({ title: "Input Error", description: "Please enter a symbol.", variant: "destructive" });
      }
      return;
    }
    setLoading(true);
    setSignalData(null);
    setRealtimePrice(null);
    setIsMockData(false);
    currentSymbolRef.current = targetSymbol;

    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    try {
      const data = await getSignalData(targetSymbol, mode, timeframe);
      
      if (currentSymbolRef.current !== targetSymbol) {
        return; 
      }

      setSignalData(data);
      setRealtimePrice(data.price);

      if (typeof window !== 'undefined') {
        const isCrypto = cryptoAssetsForWebsocket.includes(data.symbol.toUpperCase());
        const isForex = data.symbol.includes('/');
        
        if (isCrypto && !isForex) {
          setPriceDirection('neutral');
          const wsSymbol = data.symbol.toLowerCase() + 'usdt';
          const socket = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@trade`);
          ws.current = socket;

          socket.onopen = () => console.log(`WebSocket connected for ${wsSymbol}`);
          socket.onmessage = (event) => {
            const messageData = JSON.parse(event.data);
            const newPrice = parseFloat(messageData.p);
            setRealtimePrice(prevPrice => {
              if (prevPrice !== null) {
                if (newPrice > prevPrice) setPriceDirection('up');
                else if (newPrice < prevPrice) setPriceDirection('down');
              }
              return newPrice;
            });
          };
          socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
            toast({ title: "WebSocket Error", description: "Could not connect to live price feed.", variant: "destructive" });
          };
          socket.onclose = () => {
            console.log(`WebSocket disconnected for ${wsSymbol}`);
            if (ws.current === socket) ws.current = null;
          };
        }
      }

    } catch (error) {
      console.error("Error generating signal:", error);
      toast({ title: "API Error", description: "Failed to fetch market data. Using mock data.", variant: "destructive" });
      setIsMockData(true);
      const mockData = await getSignalData(targetSymbol, mode, timeframe, true);
      setSignalData(mockData);
      setRealtimePrice(mockData.price);
    } finally {
      setLoading(false);
    }
  }, [symbol, mode, timeframe, toast, initialSymbol]);
  
  useEffect(() => {
    handleGenerateSignal(true);
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

  return (
    <div className="smartsignal-widget w-full border-2 border-primary rounded-xl overflow-hidden shadow-[0_0_30px_var(--primary)] bg-black/70 backdrop-blur-sm">
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
                <Select value={timeframe} onValueChange={(value) => setTimeframe(value as Timeframe)}>
                  <SelectTrigger id="timeframeSelect" className="bg-input text-foreground border-primary/50 focus:shadow-[0_0_15px_rgba(0,255,255,0.5)]">
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

        <Button onClick={() => handleGenerateSignal(false)} disabled={loading} className="w-full font-headline uppercase bg-primary/20 border-2 border-primary hover:bg-primary hover:text-background transition-all duration-300">
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
