
"use client";

import React, { useMemo } from 'react';
import type { SignalData } from '@/types';
import EliteAiInsight from './EliteAiInsight';
import MultiTimeframeAnalysis from './MultiTimeframeAnalysis';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, CheckCircle2, XCircle, BarChart, BookOpen, Scaling, Magnet, Building, GitCommitHorizontal, Timer, Target, Zap, CandlestickChart, CircleDot, Move, Gauge, Activity, FileDown, GitCompareArrows, Waves } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import ConfidenceBreakdown from './ConfidenceBreakdown';
import WhaleAlert from './WhaleAlert';
import VolumeAnalysisTable from './VolumeAnalysisTable';
import TradingViewWidget from './TradingViewWidget';
import SidewaysMarketAlert from './SidewaysMarketAlert';
import OracleInsight from './OracleInsight';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

const SectionHeader = ({ children, icon }: { children: React.ReactNode, icon?: React.ReactNode }) => (
  <h4 className="font-headline text-lg text-primary mb-2 flex items-center gap-2">
    {icon}
    {children}
  </h4>
);

const SectionWrapper = ({ children, className, borderColor = 'primary' }: { children: React.ReactNode, className?: string, borderColor?: 'primary' | 'accent' }) => {
    const borderClasses = borderColor === 'primary' 
        ? 'border-primary/30 shadow-[0_0_15px_rgba(var(--border-raw),0.2)]' 
        : 'border-accent/30 shadow-[0_0_15px_rgba(var(--accent-raw),0.2)]';
    
    // We need to parse the HSL variable to use it in rgba
    const cssVars = `
        :root {
            --border-raw: var(--primary);
            --accent-raw: var(--accent);
        }
    `;

    return (
        <div className={cn('p-4 bg-black/30 rounded-lg border', borderClasses, className)}>
            <style>{cssVars.replace(/--primary/g, '180 100% 45.1%').replace(/--accent/g, '271 76% 53%')}</style>
            {children}
        </div>
    );
};

const ChecklistItem = ({ label, passed }: { label: string; passed: boolean }) => (
  <div className="flex items-center gap-2">
    {passed ? <CheckCircle2 className="text-green-400" /> : <XCircle className="text-red-400" />}
    <span className={cn("text-sm", passed ? "text-green-400/90" : "text-red-400/90")}>{label}</span>
  </div>
);

const QuantumConfidenceMeter = ({ score, label, isBullish }: { score: number, label: string, isBullish: boolean }) => {
    const circumference = 2 * Math.PI * 28; // 2 * pi * radius
    const offset = circumference - (score / 100) * circumference;

    const getColor = () => {
        if (isBullish) {
            if (score > 85) return 'stroke-green-400 text-green-400 shadow-[0_0_15px_theme(colors.green.400)]';
            if (score > 70) return 'stroke-teal-400 text-teal-400 shadow-[0_0_15px_theme(colors.teal.400)]';
            return 'stroke-yellow-500 text-yellow-500 shadow-[0_0_15px_theme(colors.yellow.500)]';
        } else { // Bearish
            if (score > 85) return 'stroke-red-500 text-red-500 shadow-[0_0_15px_theme(colors.red.500)]';
            if (score > 70) return 'stroke-orange-500 text-orange-500 shadow-[0_0_15px_theme(colors.orange.500)]';
            return 'stroke-yellow-500 text-yellow-500 shadow-[0_0_15px_theme(colors.yellow.500)]';
        }
    };
    
    const colorClasses = getColor();

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative h-20 w-20">
                <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 60 60">
                    {/* Background Circle */}
                    <circle
                        className="stroke-primary/10"
                        cx="30"
                        cy="30"
                        r="28"
                        strokeWidth="4"
                        fill="transparent"
                    />
                    {/* Meter Circle */}
                    <circle
                        className={cn("transition-all duration-700 ease-in-out", colorClasses.split(' ')[0])}
                        cx="30"
                        cy="30"
                        r="28"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        transform="rotate(-90 30 30)"
                    />
                </svg>
                <div className={cn("absolute inset-0 flex items-center justify-center font-headline text-3xl", colorClasses.split(' ')[1])}>
                    {score}<span className="text-sm">%</span>
                </div>
            </div>
            <div className="text-center">
                <div className="text-xs font-headline text-primary/80">CONFIDENCE</div>
                <div className={cn("text-xs font-bold", colorClasses.split(' ')[1])}>{label.toUpperCase()}</div>
            </div>
        </div>
    );
};

const LevelItem: React.FC<{
  label: string;
  value: number;
  status: 'near' | 'hit' | 'none';
}> = ({ label, value, status }) => {
  const isEntry = label.toLowerCase().includes('entry');
  const isStop = label.toLowerCase().includes('stop');
  const isTakeProfit = label.toLowerCase().includes('take-profit');

  const getStatusBadge = () => {
    if (status === 'hit' && isTakeProfit) {
      return <Badge className="bg-green-500/80 text-white text-xs py-0.5 px-1.5 h-auto">✅ Target Hit</Badge>;
    }
    if (status === 'near' && isEntry) {
      return <Badge variant="outline" className="text-yellow-400 border-yellow-400/50 text-xs py-0.5 px-1.5 h-auto">🎯 Entry Zone</Badge>;
    }
    return null;
  };

  const getLabelColor = () => {
    if (isStop) return 'text-red-400';
    if (isTakeProfit) return 'text-green-400';
    if (isEntry) return 'text-yellow-400';
    return 'text-foreground/70';
  };

  return (
    <div className={cn(
        "flex justify-between items-center text-sm transition-all duration-300 p-1 -m-1 rounded-md",
        status === 'near' && isEntry && 'bg-primary/20 animate-pulse'
      )}>
      <div className="flex items-center gap-2">
        <span className={getLabelColor()}>{label}:</span>
        {getStatusBadge()}
      </div>
      <span className={cn("font-mono", getLabelColor())}>
        ${value.toFixed(2)}
      </span>
    </div>
  );
};


interface SignalCardProps {
    data: SignalData;
    onDownloadPng: () => void;
    onDownloadPdf: () => void;
    realtimePrice: number | null;
    priceDirection: 'up' | 'down' | 'neutral';
}

const SignalCard: React.FC<SignalCardProps> = ({ data, onDownloadPng, onDownloadPdf, realtimePrice, priceDirection }) => {
  const displayPrice = realtimePrice !== null ? realtimePrice : data.price;

  const levelStatus = useMemo(() => {
    if (realtimePrice === null) {
      return { entry: 'none', sl: 'none', tp1: 'none', tp2: 'none' };
    }
  
    const entry = parseFloat(data.entry);
    const tp1 = parseFloat(data.tp1);
    const tp2 = parseFloat(data.tp2);
    
    const proximityThreshold = realtimePrice * 0.005;

    const checkStatus = (level: number, isEntry = false) => {
       if (data.isBullish) {
        if (realtimePrice >= level) return 'hit';
      } else {
        if (realtimePrice <= level) return 'hit';
      }
      if (isEntry && Math.abs(realtimePrice - level) <= proximityThreshold) {
          return 'near';
      }
      return 'none';
    };
    
    return {
      entry: checkStatus(entry, true),
      sl: 'none',
      tp1: checkStatus(tp1),
      tp2: checkStatus(tp2),
    };
  
  }, [realtimePrice, data.entry, data.tp1, data.tp2, data.isBullish]);


  return (
    <div id="signal-card-content" className={cn(
        "mt-5 p-5 bg-black/70 border-2 rounded-xl text-sm leading-relaxed shadow-lg space-y-4",
        data.isBullish ? "border-green-400 shadow-green-400/20" : "border-red-500 shadow-red-500/20"
    )}>
      <header className={cn(
          "pb-4 border-b -m-5 mb-0 p-5 rounded-t-xl transition-colors",
          data.isBullish ? "border-green-400/30 bg-gradient-to-b from-green-900/40 to-transparent" : "border-red-500/30 bg-gradient-to-b from-red-900/40 to-transparent"
      )}>
        <div className="flex justify-between items-center">
          <div className='flex items-center gap-3'>
            <div className={cn("flex items-center justify-center w-10 h-10 rounded-full", data.isBullish ? 'bg-green-500/20' : 'bg-red-500/20')}>
              {data.isBullish ? <TrendingUp className="w-6 h-6 text-green-400" /> : <TrendingDown className="w-6 h-6 text-red-500" />}
            </div>
            <div>
              <h3 className="font-headline text-2xl text-foreground">{data.symbol}</h3>
              <Badge variant="outline" className={cn("text-xs", data.isBullish ? "text-green-400 border-green-500/50" : "text-red-400 border-red-500/50")}>
                {data.isBullish ? 'Bullish Setup' : 'Bearish Setup'}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
             <Badge variant="secondary" className="font-bold bg-accent/80 text-accent-foreground">
              {data.action}
            </Badge>
             <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <Timer size={12} /> {data.timeframe.toUpperCase()}
             </Badge>
          </div>
        </div>
      </header>
      
      <SectionWrapper borderColor="primary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 font-mono">
            <div className="md:col-span-2 space-y-2">
                <div className="flex justify-between text-lg items-center py-1">
                    <span className="text-foreground/70 text-sm">Live Price:</span>
                    <span className={cn("font-mono flex items-center gap-2 transition-colors duration-300",
                        priceDirection === 'up' && 'text-green-400',
                        priceDirection === 'down' && 'text-red-400',
                    )}>
                         <span className={cn(
                            "w-3 h-3 rounded-full transition-all",
                            priceDirection === 'up' && 'bg-green-500 shadow-[0_0_8px_theme(colors.green.500)] animate-pulse',
                            priceDirection === 'down' && 'bg-red-500 shadow-[0_0_8px_theme(colors.red.500)] animate-pulse',
                            priceDirection === 'neutral' && 'bg-gray-500'
                         )}></span>
                        ${displayPrice.toFixed(4)}
                    </span>
                </div>
                <LevelItem label="Entry" value={parseFloat(data.entry)} status={levelStatus.entry} />
                <LevelItem label="Stop-Loss" value={parseFloat(data.sl)} status={levelStatus.sl} />
                <LevelItem label="Take-Profit 1" value={parseFloat(data.tp1)} status={levelStatus.tp1} />
                <LevelItem label="Take-Profit 2" value={parseFloat(data.tp2)} status={levelStatus.tp2} />
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-foreground/70">Risk/Reward:</span>
                  <span className="font-mono">1 : {data.riskReward.toFixed(1)}</span>
                </div>
            </div>
            <div className="flex justify-center items-center md:col-span-1 pt-4 md:pt-0">
                 <QuantumConfidenceMeter score={data.confidenceBreakdown.overall} label={data.confidence} isBullish={data.isBullish} />
            </div>
        </div>
      </SectionWrapper>

      {data.goldenPullbackZone && (
        <Alert className="border-primary/50 bg-primary/10 text-primary">
          <Target className="h-4 w-4 text-primary" />
          <AlertTitle className="font-headline text-primary">
            {data.isBullish ? 'High-Probability Buy Zone' : 'High-Probability Sell Zone'}
          </AlertTitle>
          <AlertDescription className="font-mono text-lg">
            ${data.goldenPullbackZone.min} - ${data.goldenPullbackZone.max}
          </AlertDescription>
        </Alert>
      )}

      {data.whaleAlert && <WhaleAlert alert={data.whaleAlert} />}
      {data.sidewaysMarket && <SidewaysMarketAlert alert={data.sidewaysMarket} livePrice={displayPrice} />}
      {data.candlestickPattern && (
        <Alert className={cn("mt-4", data.isBullish ? "border-green-500/50 bg-green-900/30" : "border-red-500/50 bg-red-900/30")}>
          <CandlestickChart className={cn("h-5 w-5", data.isBullish ? "text-green-400" : "text-red-400")} />
          <AlertTitle className={cn("font-headline text-lg", data.isBullish ? "text-green-400" : "text-red-400")}>
            {data.candlestickPattern.name} Detected
          </AlertTitle>
          <AlertDescription className="text-foreground/90">
            {data.candlestickPattern.description}
          </AlertDescription>
        </Alert>
      )}

      <ConfidenceBreakdown breakdown={data.confidenceBreakdown} isBullish={data.isBullish} />
        
      <div>
        <SectionHeader icon={<Scaling />}>Quantum Data Stream</SectionHeader>
        <div className="h-[400px] w-full rounded-lg overflow-hidden border-2 border-primary/20 p-1 bg-black/30">
          <TradingViewWidget symbol={data.symbol} />
        </div>
      </div>

      <div>
        <SectionHeader icon={<BarChart />}>Multi-Timeframe Analysis</SectionHeader>
        <SectionWrapper borderColor="accent">
            <MultiTimeframeAnalysis data={data.multiTimeframeAnalysis} />
        </SectionWrapper>
      </div>

      <div>
        <SectionHeader icon={<Magnet />}>Smart Money Concepts</SectionHeader>
        <SectionWrapper borderColor="primary">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className={cn("h-5 w-5", data.smartMoney.breakOfStructure.direction === 'up' ? 'text-green-400' : 'text-red-400')} />
                        <span className="text-foreground/80">Break of Structure (BOS):</span>
                    </div>
                    <span className="font-mono text-base">{data.smartMoney.breakOfStructure.level}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <GitCompareArrows className={cn("h-5 w-5", data.smartMoney.changeOfCharacter.direction === 'up' ? 'text-green-400' : 'text-red-400')} />
                        <span className="text-foreground/80">Change of Character (CHOCH):</span>
                    </div>
                    <span className="font-mono text-base">{data.smartMoney.changeOfCharacter.level}</span>
                </div>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <Waves className="h-5 w-5 text-accent" />
                        <span className="text-foreground/80">Liquidity Analysis:</span>
                    </div>
                    <div className="text-right">
                        <div className="font-mono text-base text-accent">{data.smartMoney.liquidity.type}: {data.smartMoney.liquidity.level}</div>
                        <p className="text-xs text-foreground/70">{data.smartMoney.liquidity.description}</p>
                    </div>
                </div>
            </div>
        </SectionWrapper>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SectionHeader icon={<BookOpen />}>Pattern Recognition</SectionHeader>
          <SectionWrapper borderColor="primary">
            <h5 className="font-bold text-primary">{data.chartPattern.name}</h5>
            <p className="text-xs text-foreground/80 mt-1">{data.chartPattern.description}</p>
          </SectionWrapper>
        </div>
        <div>
          <SectionHeader icon={<CheckCircle2 />}>Trader's Checklist</SectionHeader>
          <SectionWrapper borderColor="accent">
              <div className="space-y-2">
                <ChecklistItem label={`R/R > 1.5 (${data.riskReward.toFixed(1)})`} passed={data.tradersChecklist.riskRewardPass} />
                <ChecklistItem label="HTF Alignment" passed={data.tradersChecklist.mtfAlignmentPass} />
                <ChecklistItem label="Volume Confirmation" passed={data.tradersChecklist.volumeConfirmationPass} />
                <ChecklistItem label="Entry in Zone" passed={data.tradersChecklist.entryInZonePass} />
                <ChecklistItem label="Market Structure OK" passed={data.tradersChecklist.structureAligmentPass} />
                <ChecklistItem label="Liquidity Sweep" passed={data.tradersChecklist.liquiditySweepPass} />
              </div>
          </SectionWrapper>
        </div>
      </div>

      <div>
        <SectionHeader icon={<Activity />}>Market Internals</SectionHeader>
        <SectionWrapper borderColor="primary">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {/* Trend Strength */}
            <div className='flex flex-col items-center gap-1'>
                <Gauge size={20} className='text-primary/80'/>
                <span className='text-sm font-headline'>Trend Strength</span>
                <Badge variant={data.marketInternals.trendStrength.rating === 'Strong' ? 'default' : 'secondary'}>{data.marketInternals.trendStrength.rating}</Badge>
                <span className='text-xs text-foreground/60'>(ADX: {data.marketInternals.trendStrength.value})</span>
            </div>
            {/* Momentum */}
             <div className='flex flex-col items-center gap-1'>
                <Zap size={20} className='text-primary/80'/>
                <span className='text-sm font-headline'>Momentum</span>
                <Badge variant={data.marketInternals.momentum.rating === 'Bullish' || data.marketInternals.momentum.rating === 'Bearish' ? 'default' : 'secondary'}>{data.marketInternals.momentum.rating}</Badge>
                <span className='text-xs text-foreground/60'>(RSI: {data.marketInternals.momentum.value})</span>
            </div>
            {/* Moving Averages */}
             <div className='flex flex-col items-center gap-1'>
                <Move size={20} className='text-primary/80'/>
                <span className='text-sm font-headline'>MA Alignment</span>
                <Badge variant={data.movingAverages.ema50.status === (data.isBullish ? 'Above' : 'Below') ? 'default' : 'secondary'}>{data.isBullish ? 'Bullish' : 'Bearish'}</Badge>
                <span className='text-xs text-foreground/60'>(Price vs EMAs)</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-primary/20 space-y-1 text-xs">
            {Object.entries(data.movingAverages).map(([key, ma]) => (
                <div key={key} className="flex justify-between items-center">
                    <span className="text-foreground/70">{key.toUpperCase()}:</span>
                    <span className={cn("font-mono", ma.status === 'Above' ? 'text-green-400' : 'text-red-400')}>
                        ${ma.value} ({ma.status})
                    </span>
                </div>
            ))}
          </div>
        </SectionWrapper>
      </div>

      <div>
        <SectionHeader icon={<Zap />}>Signals Detected ({data.confluenceCount})</SectionHeader>
        <SectionWrapper borderColor="accent">
            <ul className="list-disc list-inside space-y-1 text-xs pl-2 columns-2">
                {data.confluenceFactors.map((factor, i) => <li key={i}>{factor}</li>)}
            </ul>
        </SectionWrapper>
      </div>
      
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SectionHeader icon={<GitCommitHorizontal />}>Fibonacci Re-Entry Levels</SectionHeader>
          <SectionWrapper borderColor="accent">
              <div className="space-y-1">
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Aggressive (38.2%):</span><span className="font-mono">${data.fibonacciLevels.level_382}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Standard (50.0%):</span><span className="font-mono">${data.fibonacciLevels.level_500}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Conservative (61.8%):</span><span className="font-mono">${data.fibonacciLevels.level_618}</span></div>
              </div>
          </SectionWrapper>
        </div>
        <div>
          <SectionHeader icon={<GitCommitHorizontal />}>Key Pivot Levels</SectionHeader>
          <SectionWrapper borderColor="primary">
              <div className="space-y-1">
                  <div className="flex justify-between text-sm"><span className="text-foreground/70">Daily Pivot:</span><span className="font-mono">${data.pivot}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-foreground/70">Support 1:</span><span className="font-mono">${data.s1}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-foreground/70">Resistance 1:</span><span className="font-mono">${data.r1}</span></div>
              </div>
          </SectionWrapper>
      </div>
      </div>
      
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SectionHeader icon={<GitCommitHorizontal />}>Liquidity & Structure</SectionHeader>
           <SectionWrapper borderColor="accent">
               <div className="space-y-1">
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Liquidity Pool:</span><span className="font-mono">{data.liquidityPool}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Market Structure:</span><span className="font-mono">{data.marketStructure}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Swing High:</span><span className="font-mono">${data.swingHigh}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Swing Low:</span><span className="font-mono">${data.swingLow}</span></div>
              </div>
           </SectionWrapper>
        </div>
        <div>
          <SectionHeader icon={<Magnet />}>Volume Analysis (Compact)</SectionHeader>
           <SectionWrapper borderColor="primary">
               <div className="space-y-1">
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Buyer Volume:</span><span className="font-mono">{data.buyVolume} units</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Seller Volume:</span><span className="font-mono">{data.sellVolume} units</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Net Flow:</span><span className="font-mono">{data.volumeImbalance}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Demand Zone:</span><span className="font-mono">${data.demandZone[0]} - ${data.demandZone[1]}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Supply Zone:</span><span className="font-mono">${data.supplyZone[0]} - ${data.supplyZone[1]}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Fair Value Gap:</span><span className="font-mono">${data.fvg[0]} - ${data.fvg[1]}</span></div>
              </div>
           </SectionWrapper>
        </div>
      </div>

      <div>
        <SectionHeader icon={<Magnet />}>Institutional Volume Flow</SectionHeader>
        <SectionWrapper borderColor="accent">
            <VolumeAnalysisTable data={data.volumeAnalysis} />
        </SectionWrapper>
      </div>

      {data.mode === '3' && (
        <>
            <EliteAiInsight data={{
                symbol: data.symbol,
                price: data.price,
                isBullish: data.isBullish,
                action: data.action,
                entry: parseFloat(data.entry),
                sl: parseFloat(data.sl),
                tp1: parseFloat(data.tp1),
                confluenceCount: data.confluenceCount,
                demandZone: `$${data.demandZone[0]} - ${data.demandZone[1]}`,
                fvg: `$${data.fvg[0]} - ${data.fvg[1]}`,
                volumeImbalance: data.volumeImbalance,
                multiTimeframeAnalysis: {
                '15m': data.multiTimeframeAnalysis['15m'] || 'Neutral',
                '1H': data.multiTimeframeAnalysis['1H'] || 'Neutral',
                '4H': data.multiTimeframeAnalysis['4H'] || 'Neutral',
                'Daily': data.multiTimeframeAnalysis['Daily'] || 'Neutral',
                },
                chartPatternName: data.chartPattern.name,
            }} />
             <OracleInsight data={{
                symbol: data.symbol,
                price: data.price,
                isBullish: data.isBullish,
                volatility: data.volatility,
            }} />
        </>
      )}

      <div className="flex justify-between items-center mt-6">
        <small className="text-foreground/50">Generated: {new Date().toLocaleString()}</small>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="font-headline uppercase gap-2 bg-gradient-to-r from-accent to-blue-500 text-white hover:opacity-90">
              <FileDown size={16} /> Download
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onDownloadPng}>Download as PNG</DropdownMenuItem>
            <DropdownMenuItem onClick={onDownloadPdf}>Download as PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default SignalCard;
