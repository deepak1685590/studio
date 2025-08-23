"use client";

import React from 'react';
import type { SignalData } from '@/types';
import EliteAiInsight from './EliteAiInsight';
import QuantumChart from './QuantumChart';
import MultiTimeframeAnalysis from './MultiTimeframeAnalysis';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, CheckCircle2, XCircle, BarChart, BookOpen, Scaling, Waves, Droplets, Magnet, Building, GitCommitHorizontal, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SignalCardProps {
  data: SignalData;
  onDownload: () => void;
}

const SectionHeader = ({ children, icon }: { children: React.ReactNode, icon?: React.ReactNode }) => (
  <h4 className="font-headline text-lg text-primary mt-4 mb-2 border-b border-primary/20 pb-1 flex items-center gap-2">
    {icon}
    {children}
  </h4>
);

const LevelItem = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between text-sm">
    <span className="text-foreground/70">{label}:</span>
    <span className="font-mono">{typeof value === 'number' ? `$${value.toFixed(2)}` : value}</span>
  </div>
);

const ChecklistItem = ({ label, passed }: { label: string; passed: boolean }) => (
  <div className="flex items-center gap-2">
    {passed ? <CheckCircle2 className="text-green-400" /> : <XCircle className="text-red-400" />}
    <span className={passed ? "text-green-400" : "text-red-400"}>{label}</span>
  </div>
);

const SignalCard: React.FC<SignalCardProps> = ({ data, onDownload }) => {
  const entryZone = data.isBullish ? data.demandZone : data.supplyZone;

  return (
    <div id="signal-card-content" className="mt-5 p-5 bg-black/70 border-2 border-primary rounded-xl text-sm leading-relaxed shadow-lg">
      <div className="flex justify-between items-start">
        <h3 className={`font-headline text-xl mb-3 flex items-center gap-2 ${data.isBullish ? 'text-green-400' : 'text-red-400'}`}>
          {data.isBullish ? <TrendingUp /> : <TrendingDown />}
          Elite Signal: {data.symbol} ({data.isBullish ? 'Bullish' : 'Bearish'})
        </h3>
        <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className={`font-bold ${data.isBullish ? 'border-green-500/50 text-green-400' : 'border-red-500/50 text-red-400'}`}>
              {data.action}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
                <Timer size={14} /> {data.timeframe.toUpperCase()}
            </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 font-mono">
        <LevelItem label="Price" value={`$${data.price}`} />
        <LevelItem label="Entry (Single)" value={`≈ $${data.entry}`} />
        <LevelItem label="Stop-Loss" value={`$${data.sl}`} />
        <LevelItem label="Take-Profit 1" value={`$${data.tp1}`} />
        <LevelItem label="Take-Profit 2" value={`$${data.tp2}`} />
        <LevelItem label="Risk/Reward" value={`1 : ${data.riskReward.toFixed(1)}`} />
        <LevelItem label="Confidence" value={data.confidence} />
      </div>

      <SectionHeader icon={<Scaling />}>Quantum Data Stream</SectionHeader>
      <QuantumChart data={data.chartData} />

      <SectionHeader icon={<BarChart />}>Multi-Timeframe Analysis</SectionHeader>
      <MultiTimeframeAnalysis data={data.multiTimeframeAnalysis} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <div>
          <SectionHeader icon={<BookOpen />}>Pattern Recognition</SectionHeader>
          <div className="p-4 bg-black/30 rounded-lg border border-primary/20">
            <h5 className="font-bold text-primary">{data.chartPattern.name}</h5>
            <p className="text-xs text-foreground/80 mt-1">{data.chartPattern.description}</p>
          </div>
        </div>
        <div>
          <SectionHeader icon={<CheckCircle2 />}>Trader's Checklist</SectionHeader>
          <div className="p-4 bg-black/30 rounded-lg border border-primary/20 space-y-2">
              <ChecklistItem label={`R/R > 1.5 (${data.riskReward.toFixed(1)})`} passed={data.tradersChecklist.riskRewardPass} />
              <ChecklistItem label="HTF Alignment" passed={data.tradersChecklist.mtfAlignmentPass} />
              <ChecklistItem label="Volume Confirmation" passed={data.tradersChecklist.volumeConfirmationPass} />
              <ChecklistItem label="Entry in Zone" passed={data.tradersChecklist.entryInZonePass} />
              <ChecklistItem label="Market Structure OK" passed={data.tradersChecklist.structureAligmentPass} />
              <ChecklistItem label="Liquidity Sweep" passed={data.tradersChecklist.liquiditySweepPass} />
          </div>
        </div>
      </div>

      <SectionHeader>Signals Detected</SectionHeader>
      <ul className="list-disc list-inside space-y-1">
        {data.confluenceFactors.map((factor, i) => <li key={i}>{factor}</li>)}
      </ul>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div>
            <SectionHeader icon={<Waves />}>Fibonacci Levels</SectionHeader>
            <div className="space-y-1">
                <LevelItem label="Retracement (38.2%)" value={data.fibonacciLevels.level_382} />
                <LevelItem label="Equilibrium (50.0%)" value={data.fibonacciLevels.level_500} />
                <LevelItem label="Golden Pocket (61.8%)" value={data.fibonacciLevels.level_618} />
            </div>
          </div>
          <div>
            <SectionHeader icon={<GitCommitHorizontal />}>Key Levels</SectionHeader>
            <div className="space-y-1">
                <LevelItem label="Optimal Entry Zone" value={`$${entryZone[0]} - $${entryZone[1]}`} />
                <LevelItem label="Daily Pivot" value={data.pivot} />
                <LevelItem label="Support 1" value={data.s1} />
                <LevelItem label="Resistance 1" value={data.r1} />
            </div>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <div>
          <SectionHeader icon={<Magnet />}>Volume Analysis</SectionHeader>
           <div className="space-y-1">
            <LevelItem label="Buyer Volume" value={`${data.buyVolume} units`} />
            <LevelItem label="Seller Volume" value={`${data.sellVolume} units`} />
            <LevelItem label="Net Flow" value={data.volumeImbalance} />
          </div>
        </div>
        <div>
            <SectionHeader icon={<Building />}>Supply & Demand</SectionHeader>
            <div className="space-y-1">
                <LevelItem label="Demand Zone" value={`$${data.demandZone[0]} - $${data.demandZone[1]}`} />
                <LevelItem label="Supply Zone" value={`$${data.supplyZone[0]} - $${data.supplyZone[1]}`} />
                <LevelItem label="Fair Value Gap" value={`$${data.fvg[0]} - $${data.fvg[1]}`} />
            </div>
        </div>
      </div>
      
       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <div>
          <SectionHeader icon={<Droplets />}>Liquidity & Structure</SectionHeader>
           <div className="space-y-1">
            <LevelItem label="Liquidity Pool" value={data.liquidityPool} />
            <LevelItem label="Market Structure" value={data.marketStructure} />
            <LevelItem label="Swing High" value={data.swingHigh} />
            <LevelItem label="Swing Low" value={data.swingLow} />
          </div>
        </div>
      </div>


      {data.mode === '3' && (
        <EliteAiInsight data={{
          symbol: data.symbol,
          price: data.price,
          isBullish: data.isBullish,
          action: data.action,
          entry: parseFloat(data.entry),
          sl: parseFloat(data.sl),
          tp1: parseFloat(data.tp1),
          confluenceCount: data.confluenceCount,
          demandZone: `$${data.demandZone[0]} - $${data.demandZone[1]}`,
          fvg: `$${data.fvg[0]} - $${data.fvg[1]}`,
          volumeImbalance: data.volumeImbalance,
          multiTimeframeAnalysis: data.multiTimeframeAnalysis as any, // Cast for AI flow
          chartPatternName: data.chartPattern.name,
        }} />
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
