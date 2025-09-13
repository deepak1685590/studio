

"use client";

import React, { useMemo, useState, useEffect } from 'react';
import type { SignalData } from '@/types';
import EliteAiInsight from './EliteAiInsight';
import MultiTimeframeAnalysis from './MultiTimeframeAnalysis';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle2, XCircle, BarChart, BookOpen, Scaling, Magnet, Building, GitCommitHorizontal, Timer, Target, Zap, Check, ShieldAlert, BrainCircuit, Crosshair, ArrowRight, TrendingDown, TrendingUp, Layers, MoveVertical, GitBranch, GitPullRequest, Replace } from 'lucide-react';
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
import KeyLevels from './KeyLevels';
import QuantumEntryMatrix from './QuantumEntryMatrix';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import LiquidityTargetAlert from './LiquidityTargetAlert';
import QuantumSuperTrendMatrix from './QuantumSuperTrendMatrix';

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
    const isCrypto = !entryPrice.toString().includes('.'); // simple check if forex or crypto for formatting

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
                    Live: ${livePrice.toFixed(isCrypto ? 2 : 4)} → {entryLabel}: ${entryPrice.toFixed(isCrypto ? 2 : 4)}
                </p>
            </div>
        </div>
    );
};

const InstitutionalInterest: React.FC<{ data: SignalData; livePrice: number | null }> = ({ data, livePrice }) => {
    const { supplyZone, demandZone, fvg } = data;
    const isCrypto = !data.price.toString().includes('.');
    
    const supplyLow = parseFloat(supplyZone[1]);
    const supplyHigh = parseFloat(supplyZone[0]);
    const demandLow = parseFloat(demandZone[1]);
    const demandHigh = parseFloat(demandZone[0]);

    const isPriceInSupply = livePrice !== null && livePrice >= supplyLow && livePrice <= supplyHigh;
    const isPriceInDemand = livePrice !== null && livePrice >= demandLow && livePrice <= demandHigh;

    return (
        <div>
            <SectionHeader icon={<Building />} title="Institutional Interest" />
            <div className="relative p-4 bg-black/30 rounded-lg border border-primary/30 space-y-4">
                <div className={cn(
                    "p-3 rounded-lg border-2 text-center bg-red-500/20 border-red-500 shadow-[0_0_15px_theme(colors.red.500)] transition-all duration-300",
                    isPriceInSupply && "animate-pulse shadow-[0_0_25px_theme(colors.red.500)] border-white/80"
                )}>
                    <h5 className="font-headline text-lg text-white">SUPPLY ZONE</h5>
                    <p className="font-mono text-xl text-white/90">${supplyLow.toFixed(isCrypto ? 2 : 4)} - ${supplyHigh.toFixed(isCrypto ? 2 : 4)}</p>
                </div>

                <div className="relative h-40 flex items-center justify-center">
                    <div className="h-full w-full bg-purple-500/20 border-y-2 border-dashed border-purple-500/50 flex flex-col items-center justify-center p-2 gap-2">
                        <div className="text-center">
                            <h5 className="font-headline text-purple-300">FVG (Fair Value Gap)</h5>
                            <p className="font-mono text-sm text-purple-300/80">${parseFloat(fvg[1]).toFixed(isCrypto ? 2 : 4)} - ${parseFloat(fvg[0]).toFixed(isCrypto ? 2 : 4)}</p>
                        </div>
                         <Alert className="border-cyan-400 bg-cyan-900/40 text-cyan-300 p-2">
                            <Layers className="h-4 w-4 text-cyan-300" />
                            <AlertTitle className="font-headline text-sm text-cyan-300">
                                FVG Long Breakout
                            </AlertTitle>
                            <AlertDescription className="font-mono text-base text-white/90">
                                ${data.fvg[1]}
                            </AlertDescription>
                        </Alert>
                         <Alert className="border-orange-400 bg-orange-900/40 text-orange-300 p-2">
                            <Layers className="h-4 w-4 text-orange-300" />
                            <AlertTitle className="font-headline text-sm text-orange-300">
                                FVG Short Breakdown
                            </AlertTitle>
                            <AlertDescription className="font-mono text-base text-white/90">
                                ${data.fvg[0]}
                            </AlertDescription>
                        </Alert>
                    </div>
                    {livePrice !== null && (
                        <div 
                            className="absolute w-full h-0.5 bg-primary transition-all duration-200 ease-linear z-10"
                            style={{ 
                                top: `${( (supplyHigh - livePrice) / (supplyHigh - demandLow) ) * 100}%`,
                                boxShadow: '0 0 10px hsl(var(--primary))' 
                            }}
                        >
                            <div className="absolute right-0 -top-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded">
                                LIVE: ${livePrice.toFixed(isCrypto ? 2 : 4)}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className={cn(
                    "p-3 rounded-lg border-2 text-center bg-green-500/20 border-green-500 shadow-[0_0_15px_theme(colors.green.500)] transition-all duration-300",
                    isPriceInDemand && "animate-pulse shadow-[0_0_25px_theme(colors.green.500)] border-white/80"
                )}>
                    <h5 className="font-headline text-lg text-white">DEMAND ZONE</h5>
                    <p className="font-mono text-xl text-white/90">${demandLow.toFixed(isCrypto ? 2 : 4)} - ${demandHigh.toFixed(isCrypto ? 2 : 4)}</p>
                </div>

                <div className="text-center text-sm text-foreground/80 pt-2">
                    {data.volumeImbalance}
                </div>
            </div>
        </div>
    );
};

const SmartMoneyConcepts: React.FC<{ data: SignalData, trendColor: string }> = ({ data, trendColor }) => {
  const { liquidity, smartMoneyConcepts, isBullish } = data;
  const isCrypto = !data.price.toString().includes('.');

  const SMC_Item = ({ icon, title, level, description }: { icon: React.ReactNode, title: string, level: string, description: string }) => (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-black rounded-full border border-primary/50 mt-1">
        {icon}
      </div>
      <div>
        <h5 className="font-headline text-primary">{title} <span className="font-mono text-base">${parseFloat(level).toFixed(isCrypto ? 2 : 4)}</span></h5>
        <p className="text-xs text-foreground/70">{description}</p>
      </div>
    </div>
  );

  return (
    <div>
      <SectionHeader icon={<Magnet />} title="Smart Money Concepts" />
      <SectionWrapper>
        <div className="space-y-4">
            <SMC_Item 
                icon={<GitPullRequest size={20} />} 
                title="Liquidity Grab" 
                level={liquidity.level}
                description={liquidity.description}
            />
            <SMC_Item 
                icon={<GitBranch size={20} />} 
                title="Break of Structure (BOS)" 
                level={smartMoneyConcepts.bos}
                description={isBullish ? "Confirmation of upward trend continuation." : "Confirmation of downward trend continuation."}
            />
            <SMC_Item 
                icon={<Replace size={20} />} 
                title="Change of Character (CHOCH)" 
                level={smartMoneyConcepts.choch}
                description="Indicates a potential trend reversal has occurred."
            />
            <div className={cn(
                "mt-4 p-3 rounded-lg border-2 text-center animate-pulse",
                isBullish ? "border-green-400 bg-green-900/40 shadow-[0_0_15px_theme(colors.green.400)]" : "border-red-500 bg-red-900/40 shadow-[0_0_15px_theme(colors.red.500)]"
            )}>
                <h5 className="font-headline text-lg text-white">Confirmed {isBullish ? "Long" : "Short"} Entry</h5>
                <p className={cn("font-mono text-2xl font-bold", trendColor)} style={{ textShadow: `0 0 10px currentColor` }}>
                    ${smartMoneyConcepts.confirmedEntry}
                </p>
            </div>
        </div>
      </SectionWrapper>
    </div>
  );
}


const SignalCard: React.FC<SignalCardProps> = ({ data, onDownloadPng, onDownloadPdf, realtimePrice, priceDirection, mode }) => {
  const displayPrice = realtimePrice !== null ? realtimePrice : data.price;
  const isCrypto = !data.symbol.includes('/');

  const [hitTargets, setHitTargets] = useState({ entry: false, tp1: false, tp2: false });
  const [showEliteAI, setShowEliteAI] = useState(mode === '3' || mode === '4');

  const entryPriceNum = useMemo(() => parseFloat(data.entry), [data.entry]);
  const tp1PriceNum = useMemo(() => parseFloat(data.tp1), [data.tp1]);
  const tp2PriceNum = useMemo(() => parseFloat(data.tp2), [data.tp2]);

  useEffect(() => {
    setHitTargets({ entry: false, tp1: false, tp2: false });
    setShowEliteAI(mode === '3' || mode === '4');
  }, [data.symbol, data.entry, data.tp1, data.tp2, mode]);

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
      '5m': data.multiTimeframeAnalysis['5m']?.trend || 'Neutral',
      '15m': data.multiTimeframeAnalysis['15m']?.trend || 'Neutral',
      '1H': data.multiTimeframeAnalysis['1H']?.trend || 'Neutral',
      '4H': data.multiTimeframeAnalysis['4H']?.trend || 'Neutral',
      'Daily': data.multiTimeframeAnalysis['Daily']?.trend || 'Neutral',
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

      <QuantumEntryMatrix data={data} livePrice={realtimePrice} />

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
                        ${displayPrice.toFixed(isCrypto ? 2 : 4)}
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
      
      <QuantumSuperTrendMatrix analysis={data.superTrendAnalysis} />

      <KeyLevels data={data} />

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
      
      <SmartMoneyConcepts data={data} trendColor={trendColor} />

      <div>
        <SectionHeader icon={<Zap />} title={`Quantum Signals Detected (${data.confluenceCount})`} />
        <SectionWrapper>
            <div className="space-y-3">
                {data.confluenceFactors.map((factor, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-primary/90 p-2 bg-primary/5 rounded-md border border-primary/10">
                        <Zap size={14} className="text-amber-400" />
                        <span>{factor}</span>
                    </div>
                ))}
                {data.liquidityMatrix && <LiquidityTargetAlert prediction={data.liquidityMatrix.prediction} />}
            </div>
        </SectionWrapper>
      </div>

      {(mode === '3' || mode === '4') && (
        <div className="p-4 bg-black/30 rounded-lg border border-primary/30 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Switch id="elite-ai-toggle" checked={showEliteAI} onCheckedChange={setShowEliteAI} />
                    <Label htmlFor="elite-ai-toggle" className="flex items-center gap-2 font-headline text-lg text-primary">
                       <BrainCircuit /> Engage Elite AI
                    </Label>
                </div>
            </div>

            {showEliteAI && (
                <>
                    <EliteAiInsight data={eliteAiInsightData} />
                    {mode === '4' && <OracleInsight data={oracleInsightData} />}
                </>
            )}
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
