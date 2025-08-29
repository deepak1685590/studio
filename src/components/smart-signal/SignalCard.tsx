
"use client";

import React from 'react';
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
import VolumeAnalysisTable from './VolumeAnalysisTable';
import TradingViewWidget from './TradingViewWidget';
import SidewaysMarketAlert from './SidewaysMarketAlert';
import OracleInsight from './OracleInsight';

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


const LevelItem = ({ label, value, valueClass }: { label: string; value: string | number; valueClass?: string }) => (
  <div className="flex justify-between text-sm">
    <span className="text-foreground/70">{label}:</span>
    <span className={cn("font-mono", valueClass)}>{typeof value === 'number' && !label.includes('%') ? `$${value.toFixed(2)}` : value}</span>
  </div>
);

const ChecklistItem = ({ label, passed }: { label: string; passed: boolean }) => (
  <div className="flex items-center gap-2">
    {passed ? <CheckCircle2 className="text-green-400" /> : <XCircle className="text-red-400" />}
    <span className={cn("text-sm", passed ? "text-green-400/90" : "text-red-400/90")}>{label}</span>
  </div>
);

const SignalStrengthIndicator = ({ level }: { level: number }) => {
    const totalBars = 10;
    const activeBars = Math.min(totalBars, Math.max(1, level));

    const getColor = (index: number) => {
        const ratio = (index + 1) / totalBars;
        if (ratio <= 0.4) return 'bg-blue-500 shadow-[0_0_4px_theme(colors.blue.500)]';
        if (ratio <= 0.8) return 'bg-green-500 shadow-[0_0_6px_theme(colors.green.500)]';
        return 'bg-purple-500 shadow-[0_0_8px_theme(colors.purple.500)] animate-pulse';
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs font-headline text-primary/80">STRENGTH</span>
            <div className="flex items-end gap-1">
                {Array.from({ length: totalBars }).map((_, i) => (
                    <div 
                        key={i} 
                        className={cn(
                            "w-1.5 rounded-full transition-all duration-300",
                            i < activeBars ? getColor(i) : 'bg-primary/20',
                            i < 4 ? 'h-2' : i < 8 ? 'h-3' : 'h-4'
                        )}
                    />
                ))}
            </div>
        </div>
    );
};


const QuantumConfidenceMeter = ({ score, label }: { score: number, label: string }) => {
    const circumference = 2 * Math.PI * 18; // 2 * pi * radius
    const offset = circumference - (score / 100) * circumference;

    const getColor = (s: number) => {
        if (s > 85) return 'stroke-green-400 text-green-400';
        if (s > 70) return 'stroke-yellow-400 text-yellow-400';
        return 'stroke-orange-400 text-orange-400';
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative h-16 w-16">
                <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 40 40">
                    <circle
                        className="stroke-primary/10"
                        cx="20"
                        cy="20"
                        r="18"
                        strokeWidth="3"
                        fill="transparent"
                    />
                    <circle
                        className={`transition-all duration-700 ease-in-out ${getColor(score)}`}
                        cx="20"
                        cy="20"
                        r="18"
                        strokeWidth="3"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        transform="rotate(-90 20 20)"
                    />
                </svg>
                <div className={`absolute inset-0 flex items-center justify-center font-headline text-xl ${getColor(score)}`}>
                    {score}<span className="text-xs">%</span>
                </div>
            </div>
            <div className="text-center">
                <div className="text-xs font-headline text-primary/80">CONFIDENCE</div>
                <div className={`text-xs font-bold ${getColor(score)}`}>{label.toUpperCase()}</div>
            </div>
        </div>
    );
};


interface SignalCardProps {
    data: SignalData;
    onDownload: () => void;
    realtimePrice: number | null;
    priceDirection: 'up' | 'down' | 'neutral';
}

const SignalCard: React.FC<SignalCardProps> = ({ data, onDownload, realtimePrice, priceDirection }) => {
  const displayPrice = realtimePrice !== null ? realtimePrice : data.price;

  return (
    <div id="signal-card-content" className="mt-5 p-5 bg-black/70 border-2 border-primary rounded-xl text-sm leading-relaxed shadow-lg space-y-4">
      <header className="pb-4 border-b border-primary/20 bg-gradient-to-b from-primary/10 to-transparent -m-5 mb-0 p-5 rounded-t-xl">
        <div className="flex justify-between items-center">
          <div className='flex items-center gap-3'>
            <div className={cn("flex items-center justify-center w-10 h-10 rounded-full", data.isBullish ? 'bg-green-500/20' : 'bg-red-500/20')}>
              {data.isBullish ? <TrendingUp className="w-6 h-6 text-green-400" /> : <TrendingDown className="w-6 h-6 text-red-400" />}
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
             <SignalStrengthIndicator level={data.confluenceCount} />
          </div>
        </div>
      </header>
      
      <SectionWrapper borderColor="primary">
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
                <LevelItem label="Entry (Single)" value={`≈ ${data.entry}`} />
                <LevelItem label="Stop-Loss" value={`${data.sl}`} />
                <LevelItem label="Take-Profit 1" value={`${data.tp1}`} />
                <LevelItem label="Take-Profit 2" value={`${data.tp2}`} />
                <LevelItem label="Risk/Reward" value={`1 : ${data.riskReward.toFixed(1)}`} />
            </div>
            <div className="flex justify-center items-center md:col-span-1 pt-4 md:pt-0">
                <QuantumConfidenceMeter score={data.confidenceBreakdown.overall} label={data.confidence} />
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
      {data.sidewaysMarket && <SidewaysMarketAlert alert={data.sidewaysMarket} />}

      <ConfidenceBreakdown breakdown={data.confidenceBreakdown} />
        
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
        <SectionHeader icon={<Zap />}>Signals Detected ({data.confluenceCount})</SectionHeader>
        <SectionWrapper borderColor="primary">
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
                    <LevelItem label="Aggressive Entry (38.2%)" value={data.fibonacciLevels.level_382} />
                    <LevelItem label="Standard Entry (50.0%)" value={data.fibonacciLevels.level_500} />
                    <LevelItem label="Conservative Entry (61.8%)" value={data.fibonacciLevels.level_618} />
                </div>
            </SectionWrapper>
          </div>
          <div>
            <SectionHeader icon={<GitCommitHorizontal />}>Key Levels</SectionHeader>
            <SectionWrapper borderColor="primary">
                <div className="space-y-1">
                    <LevelItem label="Daily Pivot" value={data.pivot} />
                    <LevelItem label="Support 1" value={data.s1} />
                    <LevelItem label="Resistance 1" value={data.r1} />
                </div>
            </SectionWrapper>
        </div>
      </div>
      
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SectionHeader icon={<GitCommitHorizontal />}>Liquidity & Structure</SectionHeader>
           <SectionWrapper borderColor="accent">
               <div className="space-y-1">
                <LevelItem label="Liquidity Pool" value={data.liquidityPool} />
                <LevelItem label="Market Structure" value={data.marketStructure} />
                <LevelItem label="Swing High" value={data.swingHigh} />
                <LevelItem label="Swing Low" value={data.swingLow} />
              </div>
           </SectionWrapper>
        </div>
        <div>
          <SectionHeader icon={<Magnet />}>Volume Analysis (Compact)</SectionHeader>
           <SectionWrapper borderColor="primary">
               <div className="space-y-1">
                <LevelItem label="Buyer Volume" value={`${data.buyVolume} units`} />
                <LevelItem label="Seller Volume" value={`${data.sellVolume} units`} />
                <LevelItem label="Net Flow" value={data.volumeImbalance} />
                <LevelItem label="Demand Zone" value={`$${data.demandZone[0]} - $${data.demandZone[1]}`} />
                <LevelItem label="Supply Zone" value={`$${data.supplyZone[0]} - $${data.supplyZone[1]}`} />
                <LevelItem label="Fair Value Gap" value={`$${data.fvg[0]} - $${data.fvg[1]}`} />
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
                price: displayPrice,
                isBullish: data.isBullish,
                action: data.action,
                entry: parseFloat(data.entry),
                sl: parseFloat(data.sl),
                tp1: parseFloat(data.tp1),
                confluenceCount: data.confluenceCount,
                demandZone: `$${data.demandZone[0]} - $${data.demandZone[1]}`,
                fvg: `$${data.fvg[0]} - $${data.fvg[1]}`,
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
                price: displayPrice,
                isBullish: data.isBullish,
                volatility: data.volatility,
            }} />
        </>
      )}

      <div className="flex justify-between items-center mt-6">
        <small className="text-foreground/50">Generated: {new Date().toLocaleString()}</small>
        <Button onClick={onDownload} className="font-headline uppercase gap-2 bg-gradient-to-r from-accent to-blue-500 text-white hover:opacity-90">
          <Download size={16} /> Download Signal Card
        </Button>
      </div>
    </div>
  );
};

export default SignalCard;
