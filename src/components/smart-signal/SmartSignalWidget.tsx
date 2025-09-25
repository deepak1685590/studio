
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSignalData } from '@/lib/technical-analysis';
import type { SignalData, BookTicker } from '@/types';
import SignalCard from './SignalCard';
import html2canvas from 'html2canvas';
import { Rocket, BrainCircuit, Upload, Eye, EyeOff, Wallet, Droplets } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Timeframe, LiveTradeData } from '@/types';
import jsPDF from 'jspdf';
import { cn } from '@/lib/utils';
import TradingViewWidget from './TradingViewWidget';
import VolumeAnalysisTable from './VolumeAnalysisTable';
import { Skeleton } from '../ui/skeleton';
import ChartAnalysisModal from './ChartAnalysisModal';
import TrendRibbon from './TrendRibbon';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import SubspaceLiquidityMatrix from '../tools/SubspaceLiquidityMatrix';
import { getKlines as fetchKlinesFromServer } from '@/app/actions/getKlines';


interface SmartSignalWidgetProps {
  initialSymbol?: string;
  setSelectedSymbol: (symbol: string) => void;
  onSignalDataChange: (data: SignalData | null) => void;
  onLoadingChange: (loading: boolean) => void;
  signalData: SignalData | null;
  realtimePrice: number | null;
  setRealtimePrice: (price: number | null) => void;
}

// Define the list of symbols that are supported by the WebSocket connection.
const cryptoAssetsForWebsocket = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'DOT', 'MATIC'];
const assetsForPolling = ['NIFTY', 'BANKNIFTY', 'GIFTNIFTY', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD'];


const SmartSignalWidget: React.FC<SmartSignalWidgetProps> = ({ 
    initialSymbol = 'BTC', 
    setSelectedSymbol,
    onSignalDataChange,
    onLoadingChange,
    signalData,
    realtimePrice,
    setRealtimePrice
 }) => {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [mode, setMode] = useState('3');
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [loading, setLoading] = useState(true);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [liveTradeData, setLiveTradeData] = useState<LiveTradeData | null>(null);
  const [bookTicker, setBookTicker] = useState<BookTicker | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartImage, setChartImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showChart, setShowChart] = useState(true);
  const [showLiquidityMatrix, setShowLiquidityMatrix] = useState(false);

  const { toast } = useToast();

  const previousPriceRef = useRef<number | null>(null);
  
  useEffect(() => {
    setSymbol(initialSymbol);
  }, [initialSymbol]);
  
  const updatePrice = useCallback((newPrice: number) => {
    if (newPrice !== previousPriceRef.current) {
        setRealtimePrice(newPrice);
        let direction: 'up' | 'down' | 'neutral' = 'neutral';
        if (previousPriceRef.current !== null) {
        if (newPrice > previousPriceRef.current) {
            direction = 'up';
        } else if (newPrice < previousPriceRef.current) {
            direction = 'down';
        }
        }
        setPriceDirection(direction);
        previousPriceRef.current = newPrice;
    }
  }, [setRealtimePrice]);

  const handleGenerateSignal = useCallback(async (currentSymbol: string) => {
    onSignalDataChange(null);
    setRealtimePrice(null);
    setLiveTradeData(null);
    setBookTicker(null);
    setPriceDirection('neutral');
    previousPriceRef.current = null;
    
    setLoading(true);
    onLoadingChange(true);

    if (!currentSymbol) {
      toast({ title: "Input Error", description: "Please enter a symbol.", variant: "destructive" });
      setLoading(false);
      onLoadingChange(false);
      return;
    }

    try {
      const data = await getSignalData(currentSymbol.toUpperCase(), mode, timeframe);
      onSignalDataChange(data);
      updatePrice(data.price);
    } catch (error) {
      console.error("Error generating signal:", error);
      const mockData = await getSignalData(currentSymbol.toUpperCase(), mode, timeframe, true);
      onSignalDataChange(mockData);
      updatePrice(mockData.price);
      toast({ title: "API Error", description: "Failed to fetch market data. Displaying simulated data.", variant: "destructive" });
    } finally {
      setLoading(false);
      onLoadingChange(false);
    }
  }, [mode, timeframe, toast, onSignalDataChange, onLoadingChange, updatePrice, setRealtimePrice]);

  useEffect(() => {
    if (loading || !symbol) {
      return;
    }

    let ws: WebSocket | null = null;
    let pollingInterval: NodeJS.Timeout | null = null;
    const currentSymbol = symbol.toUpperCase();
    const isSupportedCrypto = cryptoAssetsForWebsocket.includes(currentSymbol);
    const needsPolling = assetsForPolling.includes(currentSymbol);

    if (isSupportedCrypto) {
      const wsSymbol = currentSymbol.toLowerCase() + 'usdt';
      const streams = `${wsSymbol}@trade/${wsSymbol}@bookTicker`;
      ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

      ws.onopen = () => console.log(`WebSocket connected for ${streams}`);
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const messageData = message.data;
        
        if (message.stream.endsWith('@trade')) {
            const newPrice = parseFloat(messageData.p);
            updatePrice(newPrice);
            setLiveTradeData({
                volume: parseFloat(messageData.q),
                side: newPrice > (previousPriceRef.current || newPrice) ? 'Buy' : 'Sell'
            });
        } else if (message.stream.endsWith('@bookTicker')) {
            setBookTicker({
                bidPrice: parseFloat(messageData.b),
                askPrice: parseFloat(messageData.a)
            });
        }
      };
      ws.onerror = (errorEvent) => {
        console.warn('WebSocket connection failed silently for', currentSymbol, errorEvent);
      };

    } else if (needsPolling) {
      const fetchLatestPrice = async () => {
        try {
          const symbolWithUSDT = currentSymbol.replace('/', '') + (isCrypto(currentSymbol) ? "USDT" : "");
          const klines = await fetchKlinesFromServer(symbolWithUSDT, '5m');
          if (klines && klines.length > 0) {
            const latestPrice = parseFloat(klines[klines.length - 1][4]);
            updatePrice(latestPrice);
          }
        } catch (error) {
          console.warn(`Polling for ${currentSymbol} failed:`, error);
        }
      };
      pollingInterval = setInterval(fetchLatestPrice, 2000);
    }

    // Cleanup function
    return () => {
      if (ws) {
        ws.close();
        console.log(`WebSocket disconnected for ${currentSymbol}`);
      }
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };

  }, [symbol, loading, updatePrice]);

  useEffect(() => {
    handleGenerateSignal(symbol);
  }, [symbol, mode, timeframe]); // Re-fetch signal when mode or timeframe changes

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleAnalyzeChart = () => {
    if (!uploadedFile) {
      toast({
        title: "No File Selected",
        description: "Please choose a chart image to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    toast({ title: "Chart Vision", description: "Processing uploaded chart for AI analysis..." });

    const reader = new FileReader();
    reader.readAsDataURL(uploadedFile);
    reader.onload = () => {
      const base64Image = reader.result as string;
      setChartImage(base64Image);
      setIsModalOpen(true);
      setIsAnalyzing(false);
    };
    reader.onerror = (error) => {
      console.error("File reading error:", error);
      toast({
        title: "File Error",
        description: "Could not read the selected image file.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    };
  };

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

  const handleSymbolInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSymbol(e.target.value);
  }
  
  const handleEngageAnalysis = () => {
    handleGenerateSignal(symbol);
  }

  const isBullish = signalData?.isBullish;
  const borderColor = isBullish === true ? 'border-green-400/80 shadow-green-400/30' : isBullish === false ? 'border-red-500/80 shadow-red-500/30' : 'border-primary shadow-primary/30';
  const buttonColor = isBullish === true ? 'border-green-400/80 bg-green-500/20 hover:bg-green-400 hover:text-background' : isBullish === false ? 'border-red-500/80 bg-red-500/20 hover:bg-red-500 hover:text-white' : 'border-primary bg-primary/20 hover:bg-primary hover:text-background';
  const inputColor = isBullish === true ? 'border-green-400/50 focus:shadow-[0_0_15px_rgba(74,222,128,0.5)]' : isBullish === false ? 'border-red-500/50 focus:shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-primary/50 focus:shadow-[0_0_15px_rgba(0,255,255,0.5)]';

  const SignalCardSkeleton = () => (
    <div className="p-5 bg-black/70 border-2 rounded-xl border-primary/50 shadow-lg space-y-4">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-10 w-3/4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
  
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="h-[300px] md:h-[400px] bg-black/30 rounded-lg border border-primary/20 p-2">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="bg-black/30 rounded-lg border border-primary/20 p-4 space-y-3">
        <Skeleton className="h-8 w-1/2 mx-auto" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );

  return (
    <div className={cn(
      "smartsignal-widget w-full border-2 rounded-xl overflow-hidden shadow-[0_0_30px_var(--tw-shadow-color)] bg-black/70 backdrop-blur-sm transition-all duration-500",
      borderColor
    )}>
      <header className="widget-header p-4 text-center font-headline text-xl md:text-2xl bg-black/50">
         <h3 className="animate-flicker text-primary" style={{ textShadow: '0 0 5px var(--primary), 0 0 15px var(--primary)' }}>
            SmartSignal Pro - Quantum Analysis Engine
        </h3>
        <div className="text-sm font-code mt-1">
            CREATOR: <span className="animate-neon-purple">DG143</span> <span className="animate-neon-red">🌹❤️</span>
        </div>
      </header>
      <div className="widget-controls p-4 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className='flex-grow'>
                <label htmlFor="symbolInput" className="text-sm font-bold text-primary/80">Enter asset (e.g., BTC, EUR/USD, NIFTY)</label>
                <Input 
                    id="symbolInput"
                    value={symbol}
                    onChange={handleSymbolInputChange}
                    placeholder="e.g. BTC, EUR/USD, NIFTY"
                    className={cn("bg-input text-foreground", inputColor)}
                />
            </div>
            <div className="flex items-center space-x-4 shrink-0">
                <div className="flex items-center space-x-2">
                    <Switch id="show-chart" checked={showChart} onCheckedChange={setShowChart} />
                    <Label htmlFor="show-chart" className="flex items-center gap-1 font-bold text-primary/80">
                        {showChart ? <Eye size={16} /> : <EyeOff size={16} />}
                        Chart
                    </Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Switch id="show-liquidity-matrix" checked={showLiquidityMatrix} onCheckedChange={setShowLiquidityMatrix} />
                    <Label htmlFor="show-liquidity-matrix" className="flex items-center gap-1 font-bold text-primary/80">
                        <Droplets size={16} />
                        Liquidity
                    </Label>
                </div>
            </div>
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
                    <SelectItem value="4">4 - Multi-Layer Confirmation</SelectItem>
                    <SelectItem value="5">5 - Supermode (MTF Dashboard)</SelectItem>
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

        <Button onClick={handleEngageAnalysis} disabled={loading} className={cn("w-full font-headline uppercase border-2 transition-all duration-300 text-base py-6 scanner-glow", buttonColor)}>
          {loading ? (
            <>
              <BrainCircuit className="mr-2 h-5 w-5 animate-spin" />
              Analyzing Market Vectors...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-5 w-5" />
              Engage Quantum Analysis
            </>
          )}
        </Button>
      </div>

      {signalData && !loading && <TrendRibbon isBullish={signalData.isBullish} symbol={signalData.symbol} />}

      <div className="widget-body p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          {loading ? <LoadingSkeleton /> : (
            <>
              {showChart && (
                  <div className="h-[300px] md:h-[400px] bg-black/30 rounded-lg border border-primary/20 p-2">
                      <TradingViewWidget symbol={signalData?.symbol || initialSymbol} timeframe={timeframe} />
                  </div>
              )}
              
              <div className="bg-black/30 rounded-lg border border-accent/50 p-4 space-y-3">
                   <h4 className="font-headline text-lg text-accent text-center">AI Chart Vision</h4>
                   <p className="text-xs text-center text-foreground/70">Upload a chart screenshot for an instant AI-powered technical analysis.</p>
                  <Input
                      type="file"
                      accept="image/png, image/jpeg, image/gif"
                      onChange={handleFileChange}
                      className="bg-input text-foreground border-accent/50 file:text-accent file:font-bold"
                  />
                  <Button onClick={handleAnalyzeChart} disabled={isAnalyzing || !uploadedFile} className="w-full bg-accent/20 border-accent border hover:bg-accent hover:text-accent-foreground font-headline scanner-glow">
                      <Upload className="mr-2" />
                      {isAnalyzing ? 'Analyzing...' : 'Analyze Chart Image'}
                  </Button>
              </div>
              
               {showLiquidityMatrix && signalData && (
                   <SubspaceLiquidityMatrix
                      key={`liq-${signalData.symbol}`}
                      initialSymbol={signalData.symbol}
                      setSelectedSymbol={setSelectedSymbol}
                  />
              )}
              {signalData && signalData.volumeAnalysis && <VolumeAnalysisTable data={signalData.volumeAnalysis} liveData={liveTradeData} bookTicker={bookTicker} />}
            </>
          )}
        </div>
        
        <div className="lg:mt-0">
          {loading && <SignalCardSkeleton />}
          
          {signalData && (
              <SignalCard 
                  data={signalData} 
                  onDownloadPng={handleDownloadPng} 
                  onDownloadPdf={handleDownloadPdf} 
                  realtimePrice={realtimePrice} 
                  priceDirection={priceDirection} 
                  mode={mode} 
              />
          )}
        </div>
      </div>
      {isModalOpen && chartImage && signalData && (
        <ChartAnalysisModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          chartImage={chartImage}
          symbol={signalData.symbol}
        />
      )}
    </div>
  );
};

export default SmartSignalWidget;

    