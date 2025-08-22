"use client";

import React from 'react';
import type { SignalData } from '@/types';
import EliteAiInsight from './EliteAiInsight';
import QuantumChart from './QuantumChart';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';

interface SignalCardProps {
  data: SignalData;
  onDownload: () => void;
}

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h4 className="font-headline text-lg text-primary mt-4 mb-2 border-b border-primary/20 pb-1">{children}</h4>
);

const LevelItem = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex justify-between text-sm">
    <span className="text-foreground/70">{label}:</span>
    <span className="font-mono">{typeof value === 'number' ? `$${value.toFixed(2)}` : value}</span>
  </div>
);

const SignalCard: React.FC<SignalCardProps> = ({ data, onDownload }) => {
  return (
    <div id="signal-card-content" className="mt-5 p-5 bg-black/70 border-2 border-primary rounded-xl text-sm leading-relaxed shadow-lg">
      <h3 className={`font-headline text-xl mb-3 flex items-center gap-2 ${data.isBullish ? 'text-green-400' : 'text-red-400'}`}>
        {data.isBullish ? <TrendingUp /> : <TrendingDown />}
        Elite Signal: {data.symbol} ({data.isBullish ? 'Bullish' : 'Bearish'})
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 font-mono">
        <LevelItem label="Price" value={`$${data.price}`} />
        <LevelItem label="Action" value={data.action} />
        <LevelItem label="Entry" value={`$${data.entry}`} />
        <LevelItem label="Stop-Loss" value={`$${data.sl}`} />
        <LevelItem label="Take-Profit 1" value={`$${data.tp1}`} />
        <LevelItem label="Take-Profit 2" value={`$${data.tp2}`} />
        <LevelItem label="Risk/Reward" value={`1 : ${data.riskReward.toFixed(1)}`} />
        <LevelItem label="Confidence" value={data.confidence} />
      </div>

      <SectionHeader>Quantum Data Stream</SectionHeader>
      <QuantumChart data={data.chartData} />

      <SectionHeader>Signals Detected</SectionHeader>
      <ul className="list-disc list-inside space-y-1">
        {data.confluenceFactors.map((factor, i) => <li key={i}>{factor}</li>)}
      </ul>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <div>
          <SectionHeader>Key Levels</SectionHeader>
          <div className="space-y-1">
            <LevelItem label="Swing High" value={data.swingHigh} />
            <LevelItem label="Swing Low" value={data.swingLow} />
            <LevelItem label="Daily Pivot" value={data.pivot} />
            <LevelItem label="Support 1" value={data.s1} />
            <LevelItem label="Resistance 1" value={data.r1} />
          </div>
        </div>
        <div>
          <SectionHeader>Volume Analysis</SectionHeader>
           <div className="space-y-1">
            <LevelItem label="Buyer Volume" value={`${data.buyVolume} units`} />
            <LevelItem label="Seller Volume" value={`${data.sellVolume} units`} />
            <LevelItem label="Net Flow" value={data.volumeImbalance} />
          </div>
        </div>
      </div>
      
       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
         <div>
          <SectionHeader>Supply & Demand</SectionHeader>
          <div className="space-y-1">
            <LevelItem label="Demand Zone" value={`$${data.demandZone[0]} - $${data.demandZone[1]}`} />
            <LevelItem label="Supply Zone" value={`$${data.supplyZone[0]} - $${data.supplyZone[1]}`} />
            <LevelItem label="Fair Value Gap" value={`$${data.fvg[0]} - $${data.fvg[1]}`} />
          </div>
        </div>
        <div>
          <SectionHeader>Liquidity & Structure</SectionHeader>
           <div className="space-y-1">
            <LevelItem label="Liquidity Pool" value={data.liquidityPool} />
            <LevelItem label="Market Structure" value={data.marketStructure} />
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
