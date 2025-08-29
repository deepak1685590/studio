
"use client";

import React, { useMemo } from 'react';
import type { SignalData } from '@/types';
import EliteAiInsight from './EliteAiInsight';
import MultiTimeframeAnalysis from './MultiTimeframeAnalysis';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, CheckCircle2, XCircle, BarChart, BookOpen, Scaling, Magnet, Building, GitCommitHorizontal, Timer, Target, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import ConfidenceBreakdown from './ConfidenceBreakdown';
import WhaleAlert from './WhaleAlert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import type { GenerateAiInsightInput } from '@/ai/flows/generate-ai-insight';
import SidewaysMarketAlert from './SidewaysMarketAlert';
import OracleInsight from './OracleInsight';
import type { OracleInsightInput } from '@/ai/flows/oracle-insight';

const SectionHeader = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
  <h4 className="font-headline text-lg text-primary mb-2 flex items-center gap-2">{icon}{title}</h4>
);

const SectionWrapper = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn('p-4 bg-black/30 rounded-lg border border-primary/30', className)}>
    {children}
  </div>
);

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


interface SignalCardProps {
    data: SignalData;
    onDownloadPng: () => void;
    onDownloadPdf: () => void;
    realtimePrice: number | null;
    priceDirection: 'up' | 'down' | 'neutral';
    mode: string;
}

const SignalCard: React.FC<SignalCardProps> = ({ data, onDownloadPng, onDownloadPdf, realtimePrice, priceDirection, mode }) => {
  const displayPrice = realtimePrice !== null ? realtimePrice : data.price;

  const eliteAiInsightData: GenerateAiInsightInput = useMemo(() => ({
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [data.symbol, data.entry, data.sl, data.tp1]); // Only re-run when the core signal parameters change.

  const oracleInsightData: OracleInsightInput = useMemo(() => ({
    symbol: data.symbol,
    price: data.price,
    isBullish: data.isBullish,
    volatility: data.trendStrength.score,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [data.symbol, data.isBullish, data.trendStrength.score]);


  if (data.sidewaysMarket) {
    return (
        <div id="signal-card-content" className="mt-5 p-5 bg-black/70 border-2 rounded-xl text-sm leading-relaxed shadow-lg space-y-4 border-yellow-500 shadow-yellow-500/20">
            <SidewaysMarketAlert alert={data.sidewaysMarket} livePrice={displayPrice} />
        </div>
    )
  }

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
      
      <SectionWrapper>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 font-mono">
            <div className="md:col-span-2 space-y-1">
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

                <div className="flex justify-between items-center text-lg my-2 p-2 rounded-md border border-primary/50 bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)_/_0.3)]">
                    <span className="text-foreground/80 text-sm">Entry:</span>
                    <span className="font-mono font-bold text-primary">${data.entry}</span>
                </div>

                <div className="flex justify-between text-sm"><span className="text-foreground/70">Stop-Loss:</span><span className="font-mono text-red-400">${data.sl}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Take-Profit 1:</span><span className="font-mono text-green-400">${data.tp1}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Take-Profit 2:</span><span className="font-mono text-green-400">${data.tp2}</span></div>
                <div className="flex justify-between text-sm pt-1"><span className="text-foreground/70">Risk/Reward:</span><span className="font-mono">1 : {data.riskReward.toFixed(1)}</span></div>
            </div>
            <div className="flex justify-center items-center md:col-span-1 pt-4 md:pt-0">
                 <QuantumConfidenceMeter score={data.confidenceBreakdown.overall} label={data.confidence} isBullish={data.isBullish} />
            </div>
        </div>
      </SectionWrapper>

      {data.goldenPullbackZone && (
        <Alert className="border-primary/50 bg-primary/10 text-primary">
          <Target className="h-5 w-5 text-primary" />
          <AlertTitle className="font-headline text-lg text-primary">
            High-Probability Pullback Zone Detected
          </AlertTitle>
          <AlertDescription className="font-mono text-xl mt-1">
            ${data.goldenPullbackZone.min} - ${data.goldenPullbackZone.max}
          </AlertDescription>
        </Alert>
      )}
      
      {data.whaleAlert && <WhaleAlert alert={data.whaleAlert} />}
      
      <ConfidenceBreakdown breakdown={data.confidenceBreakdown} isBullish={data.isBullish} />
        
      <div>
        <SectionHeader icon={<BarChart />} title="Multi-Timeframe Analysis" />
        <SectionWrapper>
            <MultiTimeframeAnalysis data={data.multiTimeframeAnalysis} />
        </SectionWrapper>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SectionHeader icon={<BookOpen />} title="Pattern Recognition" />
          <SectionWrapper>
            <h5 className="font-bold text-primary">{data.chartPattern.name}</h5>
            <p className="text-xs text-foreground/80 mt-1">{data.chartPattern.description}</p>
          </SectionWrapper>
        </div>
        <div>
          <SectionHeader icon={<CheckCircle2 />} title="Trader's Checklist" />
          <SectionWrapper>
              <div className="space-y-2">
                <ChecklistItem label={`R/R > 1.5 (${data.riskReward.toFixed(1)})`} passed={data.tradersChecklist.riskRewardPass} />
                <ChecklistItem label="HTF Alignment" passed={data.tradersChecklist.mtfAlignmentPass} />
                <ChecklistItem label="Volume Confirmation" passed={data.tradersChecklist.volumeConfirmationPass} />
                <ChecklistItem label="Entry in Zone" passed={data.tradersChecklist.entryInZonePass} />
              </div>
          </SectionWrapper>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SectionHeader icon={<GitCommitHorizontal />} title="Fibonacci Levels" />
          <SectionWrapper>
              <div className="space-y-1">
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Aggressive (38.2%):</span><span className="font-mono">${data.fibonacciLevels.level_382}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Standard (50.0%):</span><span className="font-mono">${data.fibonacciLevels.level_500}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Conservative (61.8%):</span><span className="font-mono">${data.fibonacciLevels.level_618}</span></div>
              </div>
          </SectionWrapper>
        </div>
        <div>
          <SectionHeader icon={<Scaling />} title="Key Levels" />
          <SectionWrapper>
               <div className="space-y-1">
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Swing High:</span><span className="font-mono">${data.swingHigh}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Swing Low:</span><span className="font-mono">${data.swingLow}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Daily Pivot:</span><span className="font-mono">${data.pivot}</span></div>
              </div>
           </SectionWrapper>
        </div>
      </div>
      
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SectionHeader icon={<Building />} title="Institutional Interest" />
           <SectionWrapper>
               <div className="space-y-1">
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Demand Zone:</span><span className="font-mono">${data.demandZone[0]} - ${data.demandZone[1]}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Fair Value Gap:</span><span className="font-mono">${data.fvg[0]} - ${data.fvg[1]}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Volume Imbalance:</span><span className="font-mono">{data.volumeImbalance}</span></div>
              </div>
           </SectionWrapper>
        </div>
        <div>
          <SectionHeader icon={<Magnet />} title="Smart Money Concepts" />
           <SectionWrapper>
               <div className="space-y-1">
                <div className="flex justify-between text-sm"><span className="text-foreground/70">{data.liquidity.type}:</span><span className="font-mono">${data.liquidity.level}</span></div>
                <p className="text-xs text-foreground/70 pt-1">{data.liquidity.description}</p>
                <div className="flex justify-between text-sm pt-1"><span className="text-foreground/70">Break of Structure:</span><span className="font-mono">${data.smartMoneyConcepts.bos}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Change of Character:</span><span className="font-mono">${data.smartMoneyConcepts.choch}</span></div>
              </div>
           </SectionWrapper>
        </div>
      </div>

      <div>
        <SectionHeader icon={<Zap />} title={`Signals Detected (${data.confluenceCount})`} />
        <SectionWrapper>
            <ul className="list-disc list-inside space-y-1 text-xs pl-2 columns-2">
                {data.confluenceFactors.map((factor, i) => <li key={i}>{factor}</li>)}
            </ul>
        </SectionWrapper>
      </div>

      {mode === '3' && <OracleInsight data={oracleInsightData} />}
      {mode === '3' && <EliteAiInsight data={eliteAiInsightData} />}

      <div className="flex justify-between items-center mt-6">
        <small className="text-foreground/50">Generated: {new Date().toLocaleString()}</small>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="font-headline uppercase gap-2">
              <Download size={16} /> Download
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
