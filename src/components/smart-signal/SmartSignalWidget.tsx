

"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSignalData } from '@/lib/technical-analysis';
import type { SignalData, BookTicker, LiquidityMatrixData } from '@/types';
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

interface SmartSignalWidgetProps {
  initialSymbol?: string;
  setSelectedSymbol: (symbol: string) => void;
  onSignalDataChange: (data: SignalData | null) => void;
  onLoadingChange: (loading: boolean) => void;
  signalData: SignalData | null;
  onLivePriceChange: (price: number | null) => void;
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
    onLivePriceChange
 }) => {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [mode, setMode] = useState('3');
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [loading, setLoading] = useState(true);
  const [realtimePrice, setRealtimePrice] = useState<number | null>(null);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [liveTradeData, setLiveTradeData] = useState<LiveTradeData | null>(null);
  const [bookTicker, setBookTicker] = useState<BookTicker | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartImage, setChartImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showChart, setShowChart] = useState(true);
  const [showLiquidityMatrix, setShowLiquidityMatrix] = useState(true);

  const { toast } = useToast();

  const ws = useRef<WebSocket | null>(null);
  const previousPriceRef = useRef<number | null>(null);
  const currentSymbolRef = useRef(symbol);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    currentSymbolRef.current = symbol;
  }, [symbol]);

  useEffect(() => {
    // Sync internal state if the initialSymbol prop changes (e.g., from scanner)
    setSymbol(initialSymbol);
  }, [initialSymbol]);
  
  const re_calculateSignal = useCallback(async (newPrice: number) => {
    if (!signalData) return;
     // Throttle re-calculations to avoid performance issues
    if (throttleTimeoutRef.current) return;

    throttleTimeoutRef.current = setTimeout(async () => {
      try {
        const updatedData = await getSignalData(signalData.symbol, signalData.mode, signalData.timeframe, false, newPrice);
        onSignalDataChange(updatedData);
      } catch (e) {
        console.warn("Live re-calculation failed:", e);
      }
      throttleTimeoutRef.current = null;
    }, 2000); // Re-calculate every 2 seconds

  }, [signalData, onSignalDataChange]);

  const updatePrice = useCallback((newPrice: number) => {
    setRealtimePrice(newPrice);
    onLivePriceChange(newPrice);
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
    re_calculateSignal(newPrice);
  }, [re_calculateSignal, onLivePriceChange]);

  const handleGenerateSignal = useCallback(async (currentSymbol: string) => {
    onSignalDataChange(null);
    setRealtimePrice(null);
    onLivePriceChange(null);
    setLiveTradeData(null);
    setBookTicker(null);
    setPriceDirection('neutral');
    previousPriceRef.current = null;
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
    }

    setLoading(true);
    onLoadingChange(true);

    if (!currentSymbol) {
      toast({ title: "Input Error", description: "Please enter a symbol.", variant: "destructive" });
      setLoading(false);
      onLoadingChange(false);
      return;
    }
    
    const isSupportedCrypto = cryptoAssetsForWebsocket.includes(currentSymbol.toUpperCase());

    if (isSupportedCrypto && typeof window !== 'undefined') {
      try {
        const wsSymbol = currentSymbol.toLowerCase() + 'usdt';
        const streams = `${wsSymbol}@trade/${wsSymbol}@bookTicker`;
        const socket = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
        ws.current = socket;

        socket.onopen = () => console.log(`WebSocket connected for ${streams}`);
        socket.onmessage = (event) => {
          const message = JSON.parse(event.data);
          const stream = message.stream;
          const messageData = message.data;
          
          if (stream.endsWith('@trade')) {
              if ((currentSymbolRef.current.toLowerCase() + 'usdt') !== messageData.s.toLowerCase()) {
                  return; 
              }
              const newPrice = parseFloat(messageData.p);
              updatePrice(newPrice);
              
              setLiveTradeData({
                  volume: parseFloat(messageData.q),
                  side: priceDirection === 'up' ? 'Buy' : priceDirection === 'down' ? 'Sell' : 'Neutral'
              });
          } else if (stream.endsWith('@bookTicker')) {
              setBookTicker({
                  bidPrice: parseFloat(messageData.b),
                  askPrice: parseFloat(messageData.a)
              });
          }
        };
        socket.onerror = (errorEvent) => {
          console.warn('WebSocket connection failed silently for', currentSymbol, errorEvent);
          if (ws.current) {
            ws.current.close();
            ws.current = null;
          }
        };
        socket.onclose = () => {
          console.log(`WebSocket disconnected for ${streams}`);
          if (ws.current === socket) {
            ws.current = null;
          }
        };
      } catch (e) {
        console.warn("WebSocket initialization failed:", e);
        if (ws.current) {
          ws.current.close();
          ws.current = null;
        }
      }
    }

    try {
      const data = await getSignalData(currentSymbol.toUpperCase(), mode, timeframe);
      onSignalDataChange(data);
       if (!isSupportedCrypto) {
         updatePrice(data.price);
       }
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
  }, [mode, timeframe, toast, onSignalDataChange, onLoadingChange, updatePrice, priceDirection]);

  // Polling for non-websocket assets
  useEffect(() => {
    const isSupportedCrypto = cryptoAssetsForWebsocket.includes(symbol.toUpperCase());
    const needsPolling = assetsForPolling.includes(symbol.toUpperCase());
    
    if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
    }

    if (!loading && !isSupportedCrypto && needsPolling) {
        pollingIntervalRef.current = setInterval(async () => {
            try {
                // Fetch fresh data to get the latest close price for non-websocket assets
                const data = await getSignalData(symbol.toUpperCase(), mode, timeframe, false);
                if(data?.price){
                  updatePrice(data.price);
                }
            } catch (error) {
                console.warn(`Polling for ${symbol} failed:`, error);
            }
        }, 1000); // Poll every 1 second
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [symbol, loading, mode, timeframe, updatePrice]);

  
  // This useEffect will be triggered by the `MainApp` component when the symbol changes there
  useEffect(() => {
    handleGenerateSignal(symbol);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if(throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);
  
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
    setSymbol(e.target.value);
  }
  
  const handleEngageAnalysis = () => {
    setSelectedSymbol(symbol);
    // The parent MainApp component will detect the symbol change and trigger the re-render and data fetch.
  }

  const isBullish = signalData?.isBullish;
  const borderColor = isBullish === true ? 'border-green-400/80 shadow-green-400/30' : isBullish === false ? 'border-red-500/80 shadow-red-500/30' : 'border-primary shadow-primary/30';
  const buttonColor = isBullish === true ? 'border-green-400/80 bg-green-500/20 hover:bg-green-400 hover:text-background' : isBullish === false ? 'border-red-500/80 bg-red-500/20 hover:bg-red-500 hover:text-white' : 'border-primary bg-primary/20 hover:bg-primary hover:text-background';
  const inputColor = isBullish === true ? 'border-green-400/50 focus:shadow-[0_0_15px_rgba(74,222,128,0.5)]' : isBullish === false ? 'border-red-500/50 focus:shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-primary/50 focus:shadow-[0_0_15px_rgba(0,255,255,0.5)]';

  const LoadingSkeleton = () => (
    <div className="p-6 space-y-4">
      <div className="h-[400px] bg-black/30 rounded-lg border border-primary/20 p-2 flex flex-col items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
       <div className="bg-black/30 rounded-lg border border-primary/20 p-2">
        <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
        </div>
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
        {loading ? <LoadingSkeleton /> : (
          <div className="space-y-6">
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
          </div>
        )}
        
        <div className="lg:mt-0">
          {loading && (
             <div className="text-center text-primary/80 italic p-4">
                <p className="mb-4">Initializing Quantum Matrix...</p>
                <Skeleton className="h-64 w-full" />
             </div>
          )}
          
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
