
"use client";

import React from 'react';
import { ConfidenceBreakdown as ConfidenceBreakdownType } from '@/types';
import { BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfidenceBreakdownProps {
  breakdown: ConfidenceBreakdownType;
  confidence: string;
  isBullish: boolean;
}

const QuantumConfidenceMeter = ({ score, label, isBullish }: { score: number, label: string, isBullish: boolean }) => {
    const circumference = 2 * Math.PI * 48; // 2 * pi * radius
    const offset = circumference - (score / 100) * circumference;

    const getColor = () => {
        if (isBullish) {
            if (score > 85) return 'stroke-green-400 text-green-400 shadow-[0_0_25px_theme(colors.green.400)]';
            if (score > 70) return 'stroke-teal-400 text-teal-400 shadow-[0_0_25px_theme(colors.teal.400)]';
            return 'stroke-yellow-500 text-yellow-500 shadow-[0_0_25px_theme(colors.yellow.500)]';
        } else { // Bearish
            if (score > 85) return 'stroke-red-500 text-red-500 shadow-[0_0_25px_theme(colors.red.500)]';
            if (score > 70) return 'stroke-orange-500 text-orange-500 shadow-[0_0_25px_theme(colors.orange.500)]';
            return 'stroke-yellow-500 text-yellow-500 shadow-[0_0_25px_theme(colors.yellow.500)]';
        }
    };
    
    const colorClasses = getColor();

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative h-28 w-28">
                <svg className="absolute top-0 left-0 w-full h-full animate-pulse-glow" viewBox="0 0 100 100">
                    {/* Background Circle */}
                    <circle
                        className="stroke-primary/10"
                        cx="50"
                        cy="50"
                        r="48"
                        strokeWidth="4"
                        fill="transparent"
                    />
                    {/* Meter Circle */}
                    <circle
                        className={cn("transition-all duration-1000 ease-in-out", colorClasses.split(' ')[0])}
                        cx="50"
                        cy="50"
                        r="48"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                    />
                </svg>
                <div className={cn("absolute inset-0 flex items-center justify-center font-headline text-5xl", colorClasses.split(' ')[1])}>
                    {score}<span className="text-xl">%</span>
                </div>
            </div>
            <div className="text-center">
                <div className="text-sm font-headline text-primary/80">CONFIDENCE</div>
                <div className={cn("font-bold", colorClasses.split(' ')[1])}>{label.toUpperCase()}</div>
            </div>
        </div>
    );
};


const ConfidenceFactor: React.FC<{ label: string; score: number }> = ({ label, score }) => {
  let scoreColor = "text-yellow-400";
  if (score > 80) scoreColor = "text-green-400";
  else if (score < 60) scoreColor = "text-red-400";
  
  return (
    <div className="flex justify-between items-center bg-black/30 p-2 rounded-md border border-primary/10">
      <span className="text-sm text-foreground/80">{label}</span>
      <span className={cn("font-mono font-bold text-lg", scoreColor)}>{score}%</span>
    </div>
  );
};


const ConfidenceBreakdown: React.FC<ConfidenceBreakdownProps> = ({ breakdown, confidence, isBullish }) => {
  const glowColor = isBullish 
    ? (breakdown.overall > 75 ? 'shadow-green-400/50' : 'shadow-yellow-400/50')
    : (breakdown.overall > 75 ? 'shadow-red-400/50' : 'shadow-orange-400/50');

  return (
    <div className={cn("mt-4 p-4 bg-black/30 rounded-lg border border-primary/20 transition-shadow duration-500", glowColor)}>
      <h4 className="font-headline text-lg text-primary mb-4 flex items-center gap-2">
        <BrainCircuit /> AI Confidence Matrix
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="flex justify-center">
             <QuantumConfidenceMeter score={breakdown.overall} label={confidence} isBullish={isBullish} />
        </div>
        <div className="space-y-3">
            <ConfidenceFactor label="Pattern Strength" score={breakdown.patternStrength} />
            <ConfidenceFactor label="Volume Confirmation" score={breakdown.volumeConfirmation} />
            <ConfidenceFactor label="HTF Alignment" score={breakdown.htfAlignment} />
            <ConfidenceFactor label="Smart Money Flow" score={breakdown.smartMoneyFlow} />
        </div>
      </div>
    </div>
  );
};

export default ConfidenceBreakdown;
