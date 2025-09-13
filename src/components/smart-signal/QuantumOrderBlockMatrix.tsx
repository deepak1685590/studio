
"use client";

import React from 'react';
import { OrderBlock } from '@/types';
import { cn } from '@/lib/utils';
import { Box, CheckCircle2, Target } from 'lucide-react';

interface QuantumOrderBlockMatrixProps {
  orderBlock: OrderBlock;
  entryPrice: number;
}

const QuantumOrderBlockMatrix: React.FC<QuantumOrderBlockMatrixProps> = ({ orderBlock, entryPrice }) => {
  const { type, top, bottom, meanThreshold, significance } = orderBlock;
  const isBullish = type === 'BULLISH';

  const topNum = parseFloat(top);
  const bottomNum = parseFloat(bottom);
  const meanNum = parseFloat(meanThreshold);

  const isEntryInZone = entryPrice >= bottomNum && entryPrice <= topNum;

  const containerClass = isBullish
    ? "border-green-400/50 bg-gradient-to-br from-green-900/40 via-black to-green-900/20 shadow-[0_0_25px_theme(colors.green.400)_/_0.4)]"
    : "border-red-500/50 bg-gradient-to-br from-red-900/40 via-black to-red-900/20 shadow-[0_0_25px_theme(colors.red.500)_/_0.4)]";
  
  const headerClass = isBullish ? "text-green-300" : "text-red-300";

  return (
    <div className={cn("p-4 rounded-xl border-2 space-y-3", containerClass)}>
        <h4 className={cn("font-headline text-lg flex items-center gap-2", headerClass)}>
            <Box /> Quantum Order Block
        </h4>
        <p className="text-xs text-foreground/70 italic">"{significance}"</p>
        
        <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div>
                <div className="text-xs text-foreground/60">Bottom</div>
                <div className="text-lg font-bold text-white/90">${bottom}</div>
            </div>
            <div className={cn(
                "p-2 rounded-lg border-2 bg-black/40",
                isBullish ? "border-green-400/80" : "border-red-500/80"
            )}>
                <div className="text-xs text-foreground/60">Mean Threshold</div>
                <div className="text-xl font-bold text-primary">${meanThreshold}</div>
            </div>
             <div>
                <div className="text-xs text-foreground/60">Top</div>
                <div className="text-lg font-bold text-white/90">${top}</div>
            </div>
        </div>
        
        {isEntryInZone && (
            <div className="flex items-center justify-center gap-2 p-2 rounded-md bg-primary/20 border border-primary/50 text-primary font-bold animate-pulse">
                <CheckCircle2 size={18} />
                <span>{isBullish ? 'Long' : 'Short'} Entry Confirmed Inside Order Block</span>
                <Target size={18} />
            </div>
        )}
    </div>
  );
};

export default QuantumOrderBlockMatrix;
