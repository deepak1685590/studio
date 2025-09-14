
"use client";

import React from 'react';
import { OrderBlock } from '@/types';
import { cn } from '@/lib/utils';
import { Box, CheckCircle2, Target, Check, RefreshCw, XCircle, Clock, Database, FileText } from 'lucide-react';

interface QuantumOrderBlockMatrixProps {
  orderBlock: OrderBlock;
  entryPrice: number;
}

const InfoPill: React.FC<{ icon: React.ReactNode; label: string; value: string | number; className?: string }> = ({ icon, label, value, className }) => (
  <div className={cn("flex items-center gap-2 p-2 rounded-full bg-black/40 border border-primary/20", className)}>
    <div className="text-primary">{icon}</div>
    <div className="text-xs">
      <div className="text-foreground/70">{label}</div>
      <div className="font-bold text-foreground">{value}</div>
    </div>
  </div>
);

const QuantumOrderBlockMatrix: React.FC<QuantumOrderBlockMatrixProps> = ({ orderBlock, entryPrice }) => {
  const { type, status, top, bottom, meanThreshold, volume, age, context } = orderBlock;
  const isBullish = type === 'BULLISH';

  const topNum = parseFloat(top);
  const bottomNum = parseFloat(bottom);

  const isEntryInZone = entryPrice >= bottomNum && entryPrice <= topNum;
  
  const statusConfig = {
    'FRESH': {
      icon: <Check size={16} />,
      color: 'text-cyan-400 border-cyan-500 bg-cyan-900/40 shadow-cyan-500/30',
      label: 'Fresh & Unmitigated'
    },
    'MITIGATED': {
      icon: <RefreshCw size={16} />,
      color: 'text-amber-400 border-amber-500 bg-amber-900/40 shadow-amber-500/30',
      label: 'Partially Mitigated'
    },
    'BROKEN': {
      icon: <XCircle size={16} />,
      color: 'text-red-500 border-red-600 bg-red-900/40 shadow-red-600/30',
      label: 'Broken / Invalidated'
    },
  };

  const currentStatus = statusConfig[status];
  const containerClass = isBullish
    ? "border-green-400/50 bg-gradient-to-br from-green-900/40 via-black to-green-900/20 shadow-[0_0_25px_theme(colors.green.400)_/_0.4)]"
    : "border-red-500/50 bg-gradient-to-br from-red-900/40 via-black to-red-900/20 shadow-[0_0_25px_theme(colors.red.500)_/_0.4)]";
  
  const headerClass = isBullish ? "text-green-300" : "text-red-300";

  return (
    <div className={cn("p-4 rounded-xl border-2 space-y-4", containerClass)}>
        <div className="flex justify-between items-start">
            <h4 className={cn("font-headline text-lg flex items-center gap-2", headerClass)}>
                <Box /> Advanced Order Block
            </h4>
            <div className={cn("flex items-center gap-1 text-xs font-bold p-1 px-2 rounded-full border", currentStatus.color)}>
               {currentStatus.icon} {currentStatus.label}
            </div>
        </div>
        
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
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
            <InfoPill icon={<Database size={16} />} label="Volume" value={`$${volume}M`} />
            <InfoPill icon={<Clock size={16} />} label="Age" value={age} />
            <InfoPill icon={<FileText size={16} />} label="Context" value={context} className="sm:col-span-3" />
        </div>
        
        {isEntryInZone && status !== 'BROKEN' && (
            <div className="flex items-center justify-center gap-2 p-2 rounded-md bg-primary/20 border border-primary/50 text-primary font-bold animate-pulse">
                <CheckCircle2 size={18} />
                <span>Entry Confirmed Inside Order Block</span>
                <Target size={18} />
            </div>
        )}
    </div>
  );
};

export default QuantumOrderBlockMatrix;
