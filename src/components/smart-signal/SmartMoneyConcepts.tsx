
"use client";

import React from 'react';
import type { SignalData } from '@/types';
import { cn } from '@/lib/utils';
import { Magnet, GitPullRequest, GitBranch, Replace, CheckCircle2, Target, Gem, Shield } from 'lucide-react';
import QuantumOrderBlockMatrix from './QuantumOrderBlockMatrix';
import QuantumEntryMatrix from './QuantumEntryMatrix';

const SMC_Item = ({ icon, title, level, description, isCrypto, className }: { icon: React.ReactNode, title: string, level?: string, description: string, isCrypto: boolean, className?: string }) => (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="p-2 bg-black rounded-full border border-primary/50 mt-1">
        {icon}
      </div>
      <div>
        <h5 className="font-headline text-primary">{title} {level && <span className="font-mono text-base text-white/90">${parseFloat(level).toFixed(isCrypto ? 2 : 4)}</span>}</h5>
        <p className="text-xs text-foreground/70">{description}</p>
      </div>
    </div>
);

const GoldenZoneDisplay: React.FC<{ zone: SignalData['goldenPullbackZone'], title: string, icon: React.ReactNode, className?: string }> = ({ zone, title, icon, className }) => {
    if (!zone) return null;
    return (
        <div className={cn("p-2 rounded-lg border text-center", className)}>
            <div className="font-bold flex items-center justify-center gap-1 text-sm">{icon} {title}</div>
            <div className="font-mono text-base">${zone.min} - ${zone.max}</div>
        </div>
    )
}

interface SmartMoneyConceptsProps {
    data: SignalData;
    livePrice: number | null;
}

const SmartMoneyConcepts: React.FC<SmartMoneyConceptsProps> = ({ data, livePrice }) => {
  const { liquidity, smartMoneyConcepts, isBullish, goldenPullbackZone, goldenReverseZone, orderBlock } = data;
  const isCrypto = !data.symbol.includes('/');

  return (
    <div className="p-4 bg-black/30 rounded-lg border border-primary/30 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
                 <QuantumEntryMatrix data={data} livePrice={livePrice} />
            </div>
            <div className="space-y-4">
                 {orderBlock && <QuantumOrderBlockMatrix orderBlock={orderBlock} entryPrice={parseFloat(data.entry)} />}
                 <div className="space-y-2">
                    <GoldenZoneDisplay zone={goldenPullbackZone} title="Golden Re-Entry" icon={<Gem size={14} />} className="bg-amber-900/40 border-amber-500/50 text-amber-300" />
                    <GoldenZoneDisplay zone={goldenReverseZone} title="Golden Reversal" icon={<Shield size={14} />} className="bg-purple-900/40 border-purple-500/50 text-purple-300" />
                </div>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-primary/20">
             <SMC_Item 
                icon={<GitPullRequest size={20} />} 
                title="Liquidity Grab" 
                level={liquidity.level}
                description={liquidity.description}
                isCrypto={isCrypto}
            />
            <SMC_Item 
                icon={<GitBranch size={20} />} 
                title="Break of Structure (BOS)" 
                level={smartMoneyConcepts.bos}
                description={isBullish ? "Confirms upward trend continuation." : "Confirms downward trend continuation."}
                isCrypto={isCrypto}
            />
            <SMC_Item 
                icon={<Replace size={20} />} 
                title="Change of Character (CHOCH)" 
                level={smartMoneyConcepts.choch}
                description="Indicates a potential trend reversal."
                isCrypto={isCrypto}
            />
        </div>
        
    </div>
  );
}

export default SmartMoneyConcepts;
