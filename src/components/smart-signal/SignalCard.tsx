

"use client";

import React, { useMemo, useState, useEffect } from 'react';
import type { SignalData } from '@/types';
import EliteAiInsight from './EliteAiInsight';
import MultiTimeframeAnalysis from './MultiTimeframeAnalysis';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle2, XCircle, BarChart, BookOpen, Scaling, Magnet, Building, GitCommitHorizontal, Timer, Target, Zap, Check, ShieldAlert, BrainCircuit, Crosshair, ArrowRight, TrendingDown, TrendingUp, Layers } from 'lucide-react';
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
import QuantumPivotsMatrix from './QuantumPivotsMatrix';

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

const InstitutionalInterest: React.FC<{ data: SignalData; livePrice: number | null }> = ({ data, livePrice }) => {
  const { supplyZone, demandZone, fvg, isBullish, entry } = data;
  const supplyMin = parseFloat(supplyZone[0]);
  const supplyMax = parseFloat(supplyZone[1]);
  const demandMin = parseFloat(demandZone[0]);
  const demandMax = parseFloat(demandZone[1]);
  const fvgMin = parseFloat(fvg[0]);
  const fvgMax = parseFloat(fvg[1]);
  
  const strongZone = isBullish ? 'DEMAND' : 'SUPPLY';

  const ZoneBox = ({ range, title, color, isStrong, className }: { range: [number, number], title: string, color: string, isStrong: boolean, className?: string }) => (
    <div className={cn(
        "p-3 rounded-lg border-2 text-center transition-all duration-500",
        isStrong ? `${color} shadow-[0_0_25px]` : `border-primary/20 bg-black/30`,
        isStrong ? color.replace('border-', 'shadow-') : '',
        className
    )}>
      <h5 className={cn("font-headline text-lg", isStrong ? 'text-white' : 'text-primary/80')}>{isStrong ? `STRONG ${title}` : title}</h5>
      <p className="font-mono text-xl text-white">${range[1].toFixed(4)} - ${range[0].toFixed(4)}</p>
    </div>
  );

  return (
    <div>
        <SectionHeader icon={<Building />} title="Institutional Interest" />
        <div className="relative p-4 bg-black/30 rounded-lg border border-primary/30 space-y-4">
            <ZoneBox range={[supplyMin, supplyMax]} title="SUPPLY ZONE" color="border-red-500 bg-red-500/20" isStrong={strongZone === 'SUPPLY'} />
            
            <div className="relative h-20 flex items-center justify-center">
                {/* FVG Zone */}
                <div className="h-full w-full bg-purple-500/20 border-y-2 border-purple-500/50 flex items-center justify-center">
                     <div className="text-center">
                        <h5 className="font-headline text-purple-300">FVG</h5>
                        <p className="font-mono text-xs text-purple-300/80">${fvgMax.toFixed(4)} - ${fvgMin.toFixed(4)}</p>
                    </div>
                </div>
                {/* Live Price Line */}
                {livePrice !== null && (
                    <div 
                        className="absolute w-full h-0.5 bg-primary transition-all duration-200 ease-linear z-10"
                        style={{ 
                            top: `${( (supplyMin - livePrice) / (supplyMin - demandMax) ) * 100}%`,
                            boxShadow: '0 0 10px hsl(var(--primary))' 
                        }}
                    >
                        <div className="absolute right-0 -top-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded">
                            LIVE: ${livePrice.toFixed(4)}
                        </div>
                    </div>
                )}
            </div>

            <ZoneBox range={[demandMin, demandMax]} title="DEMAND ZONE" color="border-green-500 bg-green-500/20" isStrong={strongZone === 'DEMAND'} />

             <div className="text-center text-sm text-foreground/80 pt-2">
                {data.volumeImbalance}
            </div>
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
      } else { 
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
    tp2: parseFloat(data.tp2),
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
    marketSession: "New York", 
    volatilityRegime: "Medium", 
  }), [data]); 

  const oracleInsightData: OracleInsightInput = useMemo(() => ({
    symbol: data.symbol,
    price: data.price,
    isBullish: data.isBullish,
    volatility: data.trendStrength.score,
  }), [data.symbol, data.price, data.isBullish, data.trendStrength.score]);


  if (data.sidewaysMarket) {
    return (
        <div id="signal-card-content" className="mt-5 p-5 bg-black/70 border-2 rounded-xl text-sm leading-relaxed shadow-lg space-y-4 border-yellow-500 shadow-yellow-500/20">
            <SidewaysMarketAlert alert={data.sidewaysMarket} livePrice={displayPrice} />
        </div>
    )
  }

  const isNearEntry = realtimePrice !== null && Math.abs(realtimePrice - entryPriceNum) / entryPriceNum < 0.001; 
  const trendColor = data.isBullish ? 'text-green-400' : 'text-red-400';
  
  const achievedClass = data.isBullish
    ? "bg-green-500/20 text-green-300 shadow-[0_0_15px_theme(colors.green.400)]"
    : "bg-red-500/20 text-red-300 shadow-[0_0_15px_theme(colors.red.500)]";

  const LevelRow = ({ label, value, isHit, isConfluence }: { label: string; value: string; isHit: boolean; isConfluence?: boolean; }) => (
    <div className={cn("flex justify-between items-center text-lg my-2 p-2 rounded-md border transition-all duration-300", 
      isHit ? achievedClass : "border-transparent"
    )}>
      <span className="text-foreground/80 text-base flex items-center gap-2">
        {isHit && <Check size={16} />} 
        {isConfluence && <CheckCircle2 size={14} className="text-primary/70" title="Confluence Price" />}
        {label}:
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
              {data.isBullish ? <TrendingUp className="w-8 h-8 text-green-400" /> : <TrendingDown className="w-8 h-8 text-red-400" />}
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

                <LevelRow label={data.isBullish ? 'Long Entry' : 'Short Entry'} value={data.entry} isHit={hitTargets.entry} isConfluence={mode === '4'} />
                
                <div className="flex justify-between text-base"><span className="text-foreground/70">Stop-Loss:</span><span className="font-mono text-yellow-400">${data.sl}</span></div>

                <LevelRow label="Take-Profit 1" value={data.tp1} isHit={hitTargets.tp1} isConfluence={mode === '4'} />
                <LevelRow label="Take-Profit 2" value={data.tp2} isHit={hitTargets.tp2} isConfluence={mode === '4'} />
                
                <div className="flex justify-between text-base pt-1"><span className="text-foreground/70">Risk/Reward:</span><span className="font-mono">1 : {data.riskReward.toFixed(1)}</span></div>
            </div>
        </div>
      </SectionWrapper>
      
      <div>
        <SectionHeader icon={<Layers />} title="Quantum Pivots Matrix" />
        <SectionWrapper>
            <QuantumPivotsMatrix data={data.multiTimeframeSR} livePrice={realtimePrice} />
        </SectionWrapper>
      </div>

      {mode === '4' && data.sniperZone && (
        <Alert className="border-primary bg-gradient-to-br from-primary/20 via-black to-accent/20 text-primary shadow-[0_0_25px_hsl(var(--primary)_/_0.6)] scanner-glow">
            <Crosshair className="h-5 w-5 text-primary" />
            <AlertTitle className="font-headline text-lg text-primary">
                Quantum Sniper Zone ({data.isBullish ? "Long" : "Short"})
            </AlertTitle>
            <AlertDescription className="font-mono text-xl mt-1 text-white/90">
                ${data.sniperZone.min} - ${data.sniperZone.max}
            </AlertDescription>
        </Alert>
      )}

      {data.goldenPullbackZone && (
        <Alert className="border-amber-400 bg-gradient-to-br from-yellow-900/40 to-black text-amber-300 shadow-[0_0_15px_hsl(38_92%_50%_/_0.5)] transition-shadow duration-300 hover:shadow-[0_0_25px_hsl(38_92%_50%_/_0.8)]">
            <Target className="h-5 w-5 text-amber-300" />
            <AlertTitle className="font-headline text-lg text-amber-300">
                Golden {data.isBullish ? "Long" : "Short"} Re-Entry Zone
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
                Golden {data.isBullish ? "Short" : "Long"} Reverse Zone
            </AlertTitle>
            <AlertDescription className="font-mono text-xl mt-1 text-white/90">
                ${data.goldenReverseZone.min} - ${data.goldenReverseZone.max}
            </AlertDescription>
        </Alert>
      )}
      
      {data.whaleAlert && <WhaleAlert alert={data.whaleAlert} />}
      
      <InstitutionalInterest data={data} livePrice={displayPrice} />

      <ConfidenceBreakdown 
        breakdown={data.confidenceBreakdown} 
        confidence={data.confidence}
        isBullish={data.isBullish} 
      />
        
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
                <ChecklistItem label="Momentum Alignment" passed={data.tradersChecklist.momentumAlignmentPass} />
                <ChecklistItem label="Smart Money Entry" passed={data.tradersChecklist.smartMoneyEntryPass} />
              </div>
          </SectionWrapper>
        </div>
      </div>
      
       <div className="grid grid-cols-1">
        <div>
          <SectionHeader icon={<Magnet />} title="Smart Money Concepts" />
           <SectionWrapper>
               <div className="space-y-1">
                <div className="flex justify-between text-sm font-mono"><span className="text-foreground/70 font-sans">{data.liquidity.type}:</span><span>${data.liquidity.level}</span></div>
                <p className="text-xs text-foreground/70 pt-1">{data.liquidity.description}</p>
                <div className="flex justify-between text-sm pt-1 font-mono"><span className="text-foreground/70 font-sans">Break of Structure:</span><span>${data.smartMoneyConcepts.bos}</span></div>
                <div className="flex justify-between text-sm font-mono"><span className="text-foreground/70 font-sans">Change of Character:</span><span>${data.smartMoneyConcepts.choch}</span></div>
                <div className="flex justify-between text-sm font-mono"><span className="text-foreground/70 font-sans">Entry Zone:</span><span>${data.smartMoneyConcepts.entry}</span></div>
                <div className="flex justify-between text-sm font-mono"><span className="text-foreground/70 font-sans">Confirmed {data.isBullish ? 'Long' : 'Short'} Entry:</span><span className={cn('font-bold', trendColor)}>${data.smartMoneyConcepts.confirmedEntry}</span></div>
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

      {(mode === '3' || mode === '4') && (
        <div>
            <div className="p-4 bg-black/30 rounded-lg border border-primary/30 space-y-4">
                <EliteAiInsight data={eliteAiInsightData} />
                {mode === '4' && <OracleInsight data={oracleInsightData} />}
            </div>
        </div>
      )}

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

