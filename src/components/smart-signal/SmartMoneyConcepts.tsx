
"use client";

import React from 'react';
import type { SignalData } from '@/types';
import { cn } from '@/lib/utils';
import { Magnet, GitPullRequest, GitBranch, Replace, CheckCircle2, Target } from 'lucide-react';

const SectionHeader = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
  <h4 className="font-headline text-lg text-primary mb-2 flex items-center gap-2">{icon}{title}</h4>
);

const SMC_Item = ({ icon, title, level, description, isCrypto }: { icon: React.ReactNode, title: string, level: string, description: string, isCrypto: boolean }) => (
    <div className="flex items-start gap-3 p-3 bg-black/30 rounded-md border border-primary/10">
      <div className="p-2 bg-black rounded-full border border-primary/50 mt-1">
        {icon}
      </div>
      <div>
        <h5 className="font-headline text-primary">{title} <span className="font-mono text-base text-white/90">${parseFloat(level).toFixed(isCrypto ? 2 : 4)}</span></h5>
        <p className="text-xs text-foreground/70">{description}</p>
      </div>
    </div>
);

interface SmartMoneyConceptsProps {
    data: SignalData;
}

const SmartMoneyConcepts: React.FC<SmartMoneyConceptsProps> = ({ data }) => {
  const { liquidity, smartMoneyConcepts, isBullish, tradersChecklist } = data;
  const isCrypto = !data.price.toString().includes('.');

  const checklistItems = [
    { label: `R/R > 1.5 (${data.riskReward.toFixed(1)})`, passed: tradersChecklist.riskRewardPass },
    { label: "HTF Alignment", passed: tradersChecklist.mtfAlignmentPass },
    { label: "Volume Confirmation", passed: tradersChecklist.volumeConfirmationPass },
    { label: "Momentum Alignment", passed: tradersChecklist.momentumAlignmentPass },
    { label: "Smart Money Entry", passed: tradersChecklist.smartMoneyEntryPass },
  ];

  return (
    <div className="space-y-4">
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
            description={isBullish ? "Confirmation of upward trend continuation." : "Confirmation of downward trend continuation."}
            isCrypto={isCrypto}
        />
        <SMC_Item 
            icon={<Replace size={20} />} 
            title="Change of Character (CHOCH)" 
            level={smartMoneyConcepts.choch}
            description="Indicates a potential trend reversal has occurred."
            isCrypto={isCrypto}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {checklistItems.map((item, index) => (
                 <div key={index} className="flex items-center gap-2 text-xs p-1.5 bg-black/30 rounded-md">
                    {item.passed ? <CheckCircle2 className="text-green-400 size-4" /> : <CheckCircle2 className="text-foreground/30 size-4" />}
                    <span className={cn(item.passed ? "text-green-400/90" : "text-foreground/50")}>{item.label}</span>
                </div>
            ))}
        </div>
        
        <div className={cn(
            "mt-4 p-3 rounded-lg border-2 text-center animate-pulse",
            isBullish ? "border-green-400 bg-green-900/40 shadow-[0_0_15px_theme(colors.green.400)]" : "border-red-500 bg-red-900/40 shadow-[0_0_15px_theme(colors.red.500)]"
        )}>
            <h5 className="font-headline text-lg text-white flex items-center justify-center gap-2"><Target /> Confirmed {isBullish ? "Long" : "Short"} Entry</h5>
            <p className={cn("font-mono text-2xl font-bold", isBullish ? 'text-green-300' : 'text-red-300')} style={{ textShadow: `0 0 10px currentColor` }}>
                ${smartMoneyConcepts.confirmedEntry}
            </p>
        </div>
    </div>
  );
}

export default SmartMoneyConcepts;
