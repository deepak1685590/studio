
"use client";

import React from 'react';
import { SignalData } from '@/types';
import { cn } from '@/lib/utils';
import { Target, TrendingUp, TrendingDown, Crosshair, ArrowRight } from 'lucide-react';

interface QuantumEntryMatrixProps {
  data: SignalData;
  livePrice: number | null;
}

const LevelRow: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
  <div className={cn("flex items-center justify-between text-sm py-1 px-2 rounded-md", className)}>
    <span className="font-bold">{label}</span>
    <span className="font-mono">{value}</span>
  </div>
);

const isCrypto = (symbol: string): boolean => {
    const upperSymbol = symbol.toUpperCase();
    if (upperSymbol.includes('/')) return false; // Forex
    const indianIndices = ['NIFTY', 'BANKNIFTY', 'GIFTNIFTY'];
    if (indianIndices.includes(upperSymbol)) return false; // Indian Indices
    return true; // Assume crypto
}


const QuantumEntryMatrix: React.FC<QuantumEntryMatrixProps> = ({ data, livePrice }) => {
  const { isBullish, poc, vah, val, entry } = data;
  
  const vahNum = parseFloat(vah);
  const valNum = parseFloat(val);
  const pocNum = parseFloat(poc);
  const entryNum = parseFloat(entry);
  const totalRange = vahNum - valNum;

  const getPricePosition = (price: number) => {
    if (totalRange <= 0) return '50%';
    const position = ((vahNum - price) / totalRange) * 100;
    return `${Math.max(0, Math.min(100, position))}%`;
  };

  const entryZoneTop = isBullish ? pocNum : vahNum;
  const entryZoneBottom = isBullish ? valNum : pocNum;
  const entryZoneTopPercent = getPricePosition(entryZoneTop);
  const entryZoneBottomPercent = getPricePosition(entryZoneBottom);
  const entryZoneHeight = Math.abs(parseFloat(entryZoneTopPercent) - parseFloat(entryZoneBottomPercent));

  const entryZoneStyle = {
    top: entryZoneTopPercent,
    height: `${entryZoneHeight}%`
  };
  
  const icon = isBullish ? <TrendingUp size={20} className="text-green-400" /> : <TrendingDown size={20} className="text-red-400" />;
  const title = isBullish ? "Long Entry Zone" : "Short Entry Zone";
  const entryZoneColor = isBullish ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50';
  const entryPriceColor = isBullish ? 'text-green-300' : 'text-red-300';

  return (
    <div className="p-4 bg-black/30 rounded-lg border border-primary/30">
      <h4 className="font-headline text-lg text-primary mb-3 flex items-center gap-2">
        <Target /> Quantum VAP Entry Matrix
      </h4>
      <div className="flex gap-4 h-56">
        <div className="relative flex-shrink-0 w-16 bg-black rounded-lg border-2 border-primary/20 overflow-hidden">
          {/* VAH/VAL Lines */}
          <div className="absolute w-full h-px bg-red-500/50" style={{ top: getPricePosition(vahNum) }} />
          <div className="absolute w-full h-px bg-green-500/50" style={{ top: getPricePosition(valNum) }} />
          
          {/* POC Line */}
          <div className="absolute w-full h-1 bg-amber-400 shadow-[0_0_10px_theme(colors.amber.400)]" style={{ top: `calc(${getPricePosition(pocNum)} - 2px)` }} />
          
          {/* Entry Zone */}
          <div className={cn("absolute w-full", entryZoneColor)} style={entryZoneStyle} />
          
          {/* Exact Entry Price Line */}
          <div className="absolute w-full h-0.5 bg-accent/80" style={{ top: getPricePosition(entryNum), boxShadow: '0 0 8px hsl(var(--accent))' }} />
          
          {/* Target Direction Line */}
            <div className="absolute w-full" style={{ top: getPricePosition(entryNum), height: `calc(100% - ${getPricePosition(entryNum)})` }}>
                <div 
                    className={cn(
                        "absolute left-1/2 -translate-x-1/2 w-0.5 border-dashed border-l-2",
                        isBullish ? "border-green-400 bottom-0 h-full" : "border-red-400 top-0 h-full"
                    )}
                    style={isBullish ? { top: 'auto', bottom: '2px', height: `calc(${getPricePosition(entryNum)} - ${getPricePosition(vahNum)})` } : { top: '2px', bottom: 'auto', height: `calc(${getPricePosition(valNum)} - ${getPricePosition(entryNum)})` }}
                />
                <ArrowRight className={cn("absolute left-1/2 -translate-x-1/2 w-4 h-4", isBullish ? "text-green-400 -top-5 rotate-270" : "text-red-400 -bottom-5 rotate-90")} />
            </div>

          {/* Live Price Indicator */}
          {livePrice !== null && (
            <div 
              className="absolute w-full h-0.5 bg-primary transition-all duration-200 ease-linear z-10"
              style={{ top: getPricePosition(livePrice), boxShadow: '0 0 10px hsl(var(--primary))' }}
            >
              <div className={cn(
                "absolute h-2 w-2 rounded-full -translate-y-1/2",
                 isBullish ? 'bg-green-400 left-1' : 'bg-red-400 right-1'
              )} />
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <LevelRow label="VAH" value={`$${vah}`} className="text-red-400" />
          <div className="space-y-2">
            <div className={cn("p-2 text-center rounded-lg border", entryZoneColor)}>
                <div className="flex items-center justify-center gap-1 font-headline text-sm text-white/80">
                    {icon} {title}
                </div>
                <div className="font-mono text-base text-white/70">
                    ${entryZoneBottom.toFixed(isCrypto(data.symbol) ? 2 : 4)} - ${entryZoneTop.toFixed(isCrypto(data.symbol) ? 2 : 4)}
                </div>
            </div>
            <div className="p-2 text-center rounded-lg border-2 border-accent bg-accent/20 shadow-[0_0_15px_hsl(var(--accent)_/_0.5)]">
                <div className="flex items-center justify-center gap-1 font-headline text-base text-accent">
                    <Crosshair /> Exact Entry Price
                </div>
                <div className={cn("font-mono text-2xl font-bold", entryPriceColor)} style={{textShadow: '0 0 8px currentColor'}}>
                    ${entry}
                </div>
            </div>
          </div>
          <LevelRow label="POC" value={`$${poc}`} className="text-amber-400" />
          <LevelRow label="VAL" value={`$${val}`} className="text-green-400" />
        </div>
      </div>
    </div>
  );
};

export default QuantumEntryMatrix;
