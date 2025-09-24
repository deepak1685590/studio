

"use client";

import React, { useMemo, useState, useEffect } from 'react';
import type { SignalData, HistoricalLevels, GenerateAiInsightOutput } from '@/types';
import MultiTimeframeAnalysis from './MultiTimeframeAnalysis';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle2, BarChart, BookOpen, Scaling, Magnet, Building, Timer, Target, Zap, Shield, LogIn, TrendingUp, TrendingDown, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import ConfidenceBreakdown from './ConfidenceBreakdown';
import WhaleAlert from './WhaleAlert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import SidewaysMarketAlert from './SidewaysMarketAlert';
import KeyLevels from './KeyLevels';
import SupermodeDashboard from './SupermodeDashboard';
import IndicatorChecklist from './IndicatorChecklist';
import SmartMoneyConcepts from './SmartMoneyConcepts';
import QuantumSuperTrendMatrix from './QuantumSuperTrendMatrix';


const SectionHeader = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
  <h4 className="font-headline text-lg text-primary mb-2 flex items-center gap-2">{icon}{title}</h4>
);

const MarketStructureLevels: React.FC<{ levels: HistoricalLevels; livePrice: number; isCrypto: boolean }> = ({ levels, livePrice, isCrypto }) => {
    const format = (price: number) => price.toFixed(isCrypto ? 2 : 5);
    
    const levelData = [
        { label: 'PWH', value: levels.pwh, isHigh: true },
        { label: 'PDH', value: levels.pdh, isHigh: true },
        { label: 'TDH', value: levels.tdh, isHigh: true },
        { label: 'TDL', value: levels.tdl, isHigh: false },
        { label: 'PDL', value: levels.pdl, isHigh: false },
        { label: 'PWL', value: levels.pwl, isHigh: false },
    ];

    return (
        <div className="p-4 bg-black/30 rounded-lg border border-primary/30">
            <SectionHeader icon={<Building />} title="Market Structure" />
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center">
                {levelData.map(({ label, value, isHigh }) => {
                    const isBroken = isHigh ? livePrice > value : livePrice < value;
                    return (
                        <div key={label} className={cn(
                            "p-2 rounded-md border transition-all duration-300",
                            isBroken && isHigh && "bg-green-500/20 border-green-400/50 shadow-[0_0_10px_theme(colors.green.400)]",
                            isBroken && !isHigh && "bg-red-500/20 border-red-400/50 shadow-[0_0_10px_theme(colors.red.400)]",
                            !isBroken && "bg-black/20 border-primary/20"
                        )}>
                            <div className="font-headline text-sm text-primary/80">{label}</div>
                            <div className={cn("font-mono font-bold", isBroken ? "text-white" : "text-foreground/70")}>{format(value)}</div>
                        </div>
                    );
                })}
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

const LevelRow: React.FC<{
  label: string;
  value: string;
  isHit?: boolean;
  type: 'entry' | 'sl' | 'tp';
  icon: React.ReactNode;
}> = ({ label, value, isHit, type, icon }) => {
  
  const typeClasses = {
    entry: 'border-accent text-accent shadow-accent/40',
    sl: 'border-red-500/80 text-red-400 shadow-red-500/40',
    tp: 'border-green-500/80 text-green-400 shadow-green-500/40',
  };

  const achievedClasses = {
    entry: 'bg-accent/20',
    sl: 'bg-red-500/20',
    tp: 'bg-green-500/20',
  }
  
  return (
    <div className={cn(
      "flex justify-between items-center p-2 rounded-lg border-2 transition-all duration-300", 
      typeClasses[type],
      isHit && `shadow-[0_0_20px_var(--tw-shadow-color)] ${achievedClasses[type]}`
    )}>
      <div className="flex items-center gap-2 font-headline text-base">
        {isHit ? <CheckCircle2 size={18} className="text-current" /> : icon}
        {label}
      </div>
      <span className="font-mono font-bold text-xl text-white/90">${value}</span>
    </div>
  );
};

const SignalCard: React.FC<SignalCardProps> = ({ data, onDownloadPng, onDownloadPdf, realtimePrice, priceDirection, mode }) => {
  
  const displayPrice = realtimePrice !== null ? realtimePrice : data.price;
  const isCrypto = !data.symbol.includes('/');
  const [hitTargets, setHitTargets] = useState({ entry: false, tp1: false, tp2: false });
  
  const entryPriceNum = useMemo(() => parseFloat(data.entry), [data.entry]);
  const tp1PriceNum = useMemo(() => parseFloat(data.tp1), [data.tp1]);
  const tp2PriceNum = useMemo(() => parseFloat(data.tp2), [data.tp2]);


  useEffect(() => {
    setHitTargets({ entry: false, tp1: false, tp2: false });
  }, [data]);
  
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

  if (data.sidewaysMarket) {
    return (
        <div id="signal-card-content" className="mt-5 p-5 bg-black/70 border-2 rounded-xl text-sm leading-relaxed shadow-lg space-y-4 border-yellow-500 shadow-yellow-500/20">
            <SidewaysMarketAlert alert={data.sidewaysMarket} livePrice={displayPrice} />
        </div>
    )
  }

  const isNearEntry = realtimePrice !== null && Math.abs(realtimePrice - entryPriceNum) / entryPriceNum < 0.001; 
  const trendColor = data.isBullish ? 'text-green-400' : 'text-red-400';

  const renderModeSpecificContent = () => {
    if (mode === '5' && data.supermodeAnalysis) {
      return <SupermodeDashboard analysis={data.supermodeAnalysis} />;
    }
    return null;
  }

  return (
    <div id="signal-card-content" className={cn(
        "mt-5 p-5 bg-black/70 border-2 rounded-xl text-sm leading-relaxed shadow-lg space-y-6",
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
             <Badge variant="secondary" className="font-bold bg-accent/80 text-accent-foreground text-base px-3 py-1.5">
              {data.action.includes('Pullback') || data.action.includes('Rally') 
                ? `${data.action} @ $${data.entry}`
                : data.action
              }
            </Badge>
             <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <Timer size={12} /> {data.timeframe.toUpperCase()}
             </Badge>
          </div>
        </div>
      </header>

      {data.whaleAlert && <WhaleAlert alert={data.whaleAlert} />}
      
      {isNearEntry && !hitTargets.entry && <EntryProximityAlert livePrice={displayPrice} entryPrice={entryPriceNum} isBullish={data.isBullish} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div className="space-y-4">
            <div className="p-4 bg-black/30 rounded-lg border border-primary/30">
                <div className="grid grid-cols-1 gap-2">
                    <div className="flex justify-between items-center p-2">
                        <span className="font-headline text-lg text-primary/80">Live Price:</span>
                        <span className={cn("font-mono text-3xl font-bold flex items-center gap-2 transition-colors duration-300",
                            priceDirection === 'up' && 'text-green-400',
                            priceDirection === 'down' && 'text-red-400',
                        )}>
                              <span className={cn(
                                "w-4 h-4 rounded-full transition-all",
                                priceDirection === 'up' && 'bg-green-500 shadow-[0_0_8px_theme(colors.green.500)] animate-pulse',
                                priceDirection === 'down' && 'bg-red-500 shadow-[0_0_8px_theme(colors.red.500)] animate-pulse',
                                priceDirection === 'neutral' && 'bg-gray-500'
                             )}></span>
                            ${displayPrice.toFixed(isCrypto ? 2 : 4)}
                        </span>
                    </div>

                    <LevelRow label={data.isBullish ? 'Long Entry' : 'Short Entry'} value={data.entry} isHit={hitTargets.entry} type="entry" icon={<LogIn size={18} />} />
                    <LevelRow label="Stop-Loss" value={data.sl} type="sl" icon={<Shield size={18} />} />
                    <LevelRow label="Take-Profit 1" value={data.tp1} isHit={hitTargets.tp1} type="tp" icon={<Target size={18} />} />
                    <LevelRow label="Take-Profit 2" value={data.tp2} isHit={hitTargets.tp2} type="tp" icon={<Target size={18} />} />
                    
                    <div className="flex justify-between text-base pt-2 px-2"><span className="text-foreground/70">Risk/Reward:</span><span className="font-mono font-bold">1 : {data.riskReward.toFixed(1)}</span></div>
                </div>
            </div>
        </div>
        <div className="space-y-4">
             <div className="p-4 bg-black/30 rounded-lg border border-primary/30">
                <SectionHeader icon={<BookOpen />} title="Signal Thesis" />
                <Alert className="bg-transparent border-primary/30">
                  <p><strong className={cn("font-bold", trendColor)}>{data.chartPattern.name}:</strong> {data.chartPattern.description}</p>
                </Alert>
                <ConfidenceBreakdown 
                  breakdown={data.confidenceBreakdown} 
                  confidence={data.confidence}
                  isBullish={data.isBullish} 
                />
            </div>
        </div>
      </div>
      
      {renderModeSpecificContent()}
      
      {data.superTrendAnalysis && <QuantumSuperTrendMatrix analysis={data.superTrendAnalysis} />}

      <div>
        <SectionHeader icon={<Magnet />} title="Smart Money Concepts" />
        <SmartMoneyConcepts data={data} livePrice={realtimePrice}/>
      </div>

      <IndicatorChecklist data={data.indicatorChecklist} />

      <div>
        <SectionHeader icon={<BarChart />} title="Multi-Timeframe Analysis" />
        <MultiTimeframeAnalysis data={data.multiTimeframeAnalysis} />
      </div>

      <KeyLevels data={data} />
      
      {data.historicalLevels && <MarketStructureLevels levels={data.historicalLevels} livePrice={displayPrice} isCrypto={isCrypto} />}

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
