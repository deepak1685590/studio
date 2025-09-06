
"use client";

import React, { useMemo, useState, useEffect } from 'react';
import type { SignalData } from '@/types';
import EliteAiInsight from './EliteAiInsight';
import MultiTimeframeAnalysis from './MultiTimeframeAnalysis';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle2, XCircle, BarChart, BookOpen, Scaling, Magnet, Building, GitCommitHorizontal, Timer, Target, Zap, Check, ShieldAlert } from 'lucide-react';
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

const NeonBullIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
        style={{ filter: 'drop-shadow(0 0 5px currentColor)' }}
    >
        <path d="M16 8a4 4 0 1 1-8 0"/>
        <path d="M4 12c0-2.66 4-4 8-4s8 1.34 8 4"/>
        <path d="M12 12v4"/>
        <path d="M18.5 16a2.5 2.5 0 1 0-5 0"/>
        <path d="M5.5 16a2.5 2.5 0 1 1 5 0"/>
    </svg>
);

const NeonBearIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
        style={{ filter: 'drop-shadow(0 0 5px currentColor)' }}
    >
        <path d="M16 12a4 4 0 1 0-8 0"/>
        <path d="M4 12c0 2.66 4 4 8 4s8-1.34 8-4"/>
        <path d="M12 12V8"/>
        <path d="M18.5 8a2.5 2.5 0 1 1-5 0"/>
        <path d="M5.5 8a2.5 2.5 0 1 0 5 0"/>
    </svg>
);


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

const EntryProximityAlert: React.FC<{ livePrice: number; entryPrice: number; isBullish: boolean; }> = ({ livePrice, entryPrice, isBullish }) => {
    const alertColor = isBullish ? 'border-green-400 text-green-300' : 'border-red-500 text-red-300';
    const alertShadow = isBullish ? 'shadow-[0_0_20px_theme(colors.green.500)]' : 'shadow-[0_0_20px_theme(colors.red.500)]';
    const entryLabel = isBullish ? 'Long Entry' : 'Short Entry';

    return (
        <div className={cn(
            "flex items-center gap-3 p-3 mb-4 rounded-lg border-2 animate-pulse",
            alertColor,
            alertShadow
        )}>
            <Zap className="h-6 w-6" />
            <div className="flex-1">
                <h5 className="font-headline text-lg">ENTRY ZONE IMMINENT</h5>
                <p className="text-sm font-mono">
                    Live: ${livePrice.toFixed(4)} → {entryLabel}: ${entryPrice.toFixed(4)}
                </p>
            </div>
        </div>
    );
};

const SignalCard: React.FC<SignalCardProps> = ({ data, onDownloadPng, onDownloadPdf, realtimePrice, priceDirection, mode }) => {
  const displayPrice = realtimePrice !== null ? realtimePrice : data.price;

  const [hitTargets, setHitTargets] = useState({ entry: false, tp1: false, tp2: false });

  const entryPriceNum = useMemo(() => parseFloat(data.entry), [data.entry]);
  const tp1PriceNum = useMemo(() => parseFloat(data.tp1), [data.tp1]);
  const tp2PriceNum = useMemo(() => parseFloat(data.tp2), [data.tp2]);

  useEffect(() => {
    // Reset hit targets when the signal data changes (e.g., new symbol)
    setHitTargets({ entry: false, tp1: false, tp2: false });
  }, [data.symbol, data.entry, data.tp1, data.tp2]);

  useEffect(() => {
    if (realtimePrice === null) return;

    setHitTargets(prev => {
      let newHits = { ...prev };
      if (data.isBullish) {
        if (!prev.entry && realtimePrice >= entryPriceNum) newHits.entry = true;
        if (!prev.tp1 && realtimePrice >= tp1PriceNum) newHits.tp1 = true;
        if (!prev.tp2 && realtimePrice >= tp2PriceNum) newHits.tp2 = true;
      } else { // Bearish
        if (!prev.entry && realtimePrice <= entryPriceNum) newHits.entry = true;
        if (!prev.tp1 && realtimePrice <= tp1PriceNum) newHits.tp1 = true;
        if (!prev.tp2 && realtimePrice <= tp2PriceNum) newHits.tp2 = true;
      }
      return newHits;
    });

  }, [realtimePrice, data.isBullish, entryPriceNum, tp1PriceNum, tp2PriceNum]);

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
      '5m': data.multiTimeframeAnalysis['5m'] || 'Neutral',
      '15m': data.multiTimeframeAnalysis['15m'] || 'Neutral',
      '1H': data.multiTimeframeAnalysis['1H'] || 'Neutral',
      '4H': data.multiTimeframeAnalysis['4H'] || 'Neutral',
      'Daily': data.multiTimeframeAnalysis['Daily'] || 'Neutral',
    },
    chartPatternName: data.chartPattern.name,
    trendStrength: data.trendStrength.score,
    momentum: data.momentum.score,
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

  const isNearEntry = realtimePrice !== null && Math.abs(realtimePrice - entryPriceNum) / entryPriceNum < 0.001; // 0.1% proximity
  const trendColor = data.isBullish ? 'text-green-400' : 'text-red-400';
  const trendBorder = data.isBullish ? 'border-green-400/50' : 'border-red-400/50';
  const trendBg = data.isBullish ? 'bg-green-500/10' : 'bg-red-500/10';
  const trendShadow = data.isBullish ? 'shadow-[0_0_15px_theme(colors.green.400)]' : 'shadow-[0_0_15px_theme(colors.red.400)]';
  
  const achievedClass = data.isBullish
    ? "bg-green-500/20 text-green-300 shadow-[0_0_15px_theme(colors.green.400)]"
    : "bg-red-500/20 text-red-300 shadow-[0_0_15px_theme(colors.red.500)]";

  const LevelRow = ({ label, value, isHit }: { label: string; value: string; isHit: boolean }) => (
    <div className={cn("flex justify-between items-center text-lg my-2 p-2 rounded-md border transition-all duration-300", 
      isHit ? achievedClass : "border-transparent"
    )}>
      <span className="text-foreground/80 text-base flex items-center gap-2">
        {isHit && <Check size={16} />} {label}:
      </span>
      <span className={cn("font-mono font-bold text-xl", trendColor)}>${value}</span>
    </div>
  );

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
            <div className={cn("flex items-center justify-center w-12 h-12 rounded-full", data.isBullish ? 'bg-green-500/20' : 'bg-red-500/20')}>
              {data.isBullish ? <NeonBullIcon className="w-8 h-8 text-green-400" /> : <NeonBearIcon className="w-8 h-8 text-red-400" />}
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
      
      {isNearEntry && !hitTargets.entry && <EntryProximityAlert livePrice={displayPrice} entryPrice={entryPriceNum} isBullish={data.isBullish} />}

      <SectionWrapper>
        <div className="grid grid-cols-1">
            <div className="space-y-1">
                <div className="flex justify-between text-lg items-center py-1">
                    <span className="text-foreground/70 text-base">Live Price:</span>
                    <span className={cn("font-mono text-2xl font-bold flex items-center gap-2 transition-colors duration-300",
                        priceDirection === 'up' && 'text-green-400',
                        priceDirection === 'down' && 'text-red-400',
                    )} style={{
                        textShadow: priceDirection !== 'neutral' ? `0 0 8px currentColor` : 'none'
                    }}>
                         <span className={cn(
                            "w-4 h-4 rounded-full transition-all",
                            priceDirection === 'up' && 'bg-green-500 shadow-[0_0_8px_theme(colors.green.500)] animate-pulse',
                            priceDirection === 'down' && 'bg-red-500 shadow-[0_0_8px_theme(colors.red.500)] animate-pulse',
                            priceDirection === 'neutral' && 'bg-gray-500'
                         )}></span>
                        ${displayPrice.toFixed(4)}
                    </span>
                </div>

                <LevelRow label={data.isBullish ? 'Long Entry' : 'Short Entry'} value={data.entry} isHit={hitTargets.entry} />
                
                <div className="flex justify-between text-base"><span className="text-foreground/70">Stop-Loss:</span><span className="font-mono text-yellow-400">${data.sl}</span></div>

                <LevelRow label="Take-Profit 1" value={data.tp1} isHit={hitTargets.tp1} />
                <LevelRow label="Take-Profit 2" value={data.tp2} isHit={hitTargets.tp2} />
                
                <div className="flex justify-between text-base pt-1"><span className="text-foreground/70">Risk/Reward:</span><span className="font-mono">1 : {data.riskReward.toFixed(1)}</span></div>
            </div>
        </div>
      </SectionWrapper>

      {data.goldenPullbackZone && (
        <Alert className="border-amber-400 bg-gradient-to-br from-yellow-900/40 to-black text-amber-300 shadow-[0_0_15px_hsl(38_92%_50%_/_0.5)] transition-shadow duration-300 hover:shadow-[0_0_25px_hsl(38_92%_50%_/_0.8)]">
            <Target className="h-5 w-5 text-amber-300" />
            <AlertTitle className="font-headline text-lg text-amber-300">
                Golden Re-Entry Zone
            </AlertTitle>
            <AlertDescription className="font-mono text-xl mt-1 text-white/90">
                ${data.goldenPullbackZone.min} - ${data.goldenPullbackZone.max}
            </AlertDescription>
        </Alert>
      )}

      {data.goldenReverseZone && (
        <Alert className="border-purple-400 bg-gradient-to-br from-purple-900/40 to-black text-purple-300 shadow-[0_0_15px_hsl(271_76%_53%_/_0.5)] transition-shadow duration-300 hover:shadow-[0_0_25px_hsl(271_76%_53%_/_0.8)]">
            <ShieldAlert className="h-5 w-5 text-purple-300" />
            <AlertTitle className="font-headline text-lg text-purple-300">
                Golden Reverse Zone
            </AlertTitle>
            <AlertDescription className="font-mono text-xl mt-1 text-white/90">
                ${data.goldenReverseZone.min} - ${data.goldenReverseZone.max}
            </AlertDescription>
        </Alert>
      )}
      
      {data.whaleAlert && <WhaleAlert alert={data.whaleAlert} />}
      
      <ConfidenceBreakdown breakdown={data.confidenceBreakdown} isBullish={data.isBullish} />
        
      <div>
        <SectionHeader icon={<BarChart />} title="Multi-Timeframe Analysis" />
        <MultiTimeframeAnalysis data={data.multiTimeframeAnalysis} />
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
              <div className="space-y-1 font-mono">
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Aggressive (38.2%):</span><span>${data.fibonacciLevels.level_382}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Standard (50.0%):</span><span>${data.fibonacciLevels.level_500}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Conservative (61.8%):</span><span>${data.fibonacciLevels.level_618}</span></div>
              </div>
          </SectionWrapper>
        </div>
        <div>
          <SectionHeader icon={<Scaling />} title="Key Levels" />
          <SectionWrapper>
               <div className="space-y-1 font-mono">
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Swing High:</span><span>${data.swingHigh}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Swing Low:</span><span>${data.swingLow}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Daily Pivot:</span><span>${data.pivot}</span></div>
              </div>
           </SectionWrapper>
        </div>
      </div>
      
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SectionHeader icon={<Building />} title="Institutional Interest" />
           <SectionWrapper>
               <div className="space-y-1 font-mono">
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Demand Zone:</span><span>${data.demandZone[0]} - ${data.demandZone[1]}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Supply Zone:</span><span>${data.supplyZone[0]} - ${data.supplyZone[1]}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Fair Value Gap:</span><span>${data.fvg[0]} - ${data.fvg[1]}</span></div>
                <div className="flex justify-between text-sm"><span className="text-foreground/70">Volume Imbalance:</span><span className="font-sans">{data.volumeImbalance}</span></div>
              </div>
           </SectionWrapper>
        </div>
        <div>
          <SectionHeader icon={<Magnet />} title="Smart Money Concepts" />
           <SectionWrapper>
               <div className="space-y-1">
                <div className="flex justify-between text-sm font-mono"><span className="text-foreground/70 font-sans">{data.liquidity.type}:</span><span>${data.liquidity.level}</span></div>
                <p className="text-xs text-foreground/70 pt-1">{data.liquidity.description}</p>
                <div className="flex justify-between text-sm pt-1 font-mono"><span className="text-foreground/70 font-sans">Break of Structure:</span><span>${data.smartMoneyConcepts.bos}</span></div>
                <div className="flex justify-between text-sm font-mono"><span className="text-foreground/70 font-sans">Change of Character:</span><span>${data.smartMoneyConcepts.choch}</span></div>
              </div>
           </SectionWrapper>
        </div>
      </div>

      <div>
        <SectionHeader icon={<Zap />} title={`Signals Detected (${data.confluenceCount})`} />
        <SectionWrapper>
            <div className="flex flex-wrap gap-2">
                {data.confluenceFactors.map((factor, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary/90 shadow-sm">
                        {factor}
                    </Badge>
                ))}
            </div>
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
