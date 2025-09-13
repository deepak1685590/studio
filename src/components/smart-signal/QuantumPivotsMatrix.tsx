
"use client";

import React from 'react';
import { MultiTimeframeSR } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Target, Minus, GitCommitHorizontal } from 'lucide-react';

interface QuantumPivotsMatrixProps {
  data: MultiTimeframeSR;
  livePrice: number | null;
}

const QuantumPivotsMatrix: React.FC<QuantumPivotsMatrixProps> = ({ data, livePrice }) => {
  const timeframes = Object.keys(data) as (keyof MultiTimeframeSR)[];

  const PriceCell: React.FC<{ price: number }> = ({ price }) => {
    const proximity = livePrice ? Math.abs(livePrice - price) / price : 1;
    let cellClass = "";
    if (proximity < 0.001) { // within 0.1%
        cellClass = "bg-primary/30 text-white animate-pulse shadow-[0_0_15px_hsl(var(--primary))]";
    } else if (proximity < 0.003) { // within 0.3%
        cellClass = "bg-primary/10";
    }

    return (
        <TableCell className={cn("text-center font-mono", cellClass)}>
            {price.toFixed(4)}
        </TableCell>
    )
  };
  
  const LevelRow: React.FC<{ levels: number[], type: 'R' | 'S' }> = ({ levels, type }) => {
      const isResistance = type === 'R';
      const color = isResistance ? 'text-red-400' : 'text-green-400';
      
      return (
        <>
        {levels.map((level, index) => (
             <TableRow key={`${type}-${index}`} className={color}>
                <TableHead className="font-bold flex items-center gap-1">
                    <div className={cn("w-3 h-3 rounded-full border-2", isResistance ? 'border-red-500 bg-red-500/30' : 'border-green-500 bg-green-500/30')}></div>
                    {type}{index + 1}
                </TableHead>
                {timeframes.map(tf => <PriceCell key={tf} price={data[tf][type][index] || 0} />)}
            </TableRow>
        ))}
        </>
      )
  }

  return (
    <div className="bg-black/30 rounded-lg border border-primary/20 p-4 space-y-3">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="text-primary font-headline">Level</TableHead>
                    {timeframes.map(tf => (
                        <TableHead key={tf} className="text-center font-headline text-primary/80">{tf.toUpperCase()}</TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                <LevelRow levels={data[timeframes[0]].R} type='R' />
                
                <TableRow className="bg-primary/10 text-primary font-bold border-y-2 border-primary scanner-glow">
                    <TableHead className="font-bold flex items-center gap-1"><Target size={14}/> Confirmed Target</TableHead>
                    {timeframes.map(tf => {
                        const targetPrice = data[tf].probableTarget;
                        const isResistance = data[tf].R.includes(targetPrice);
                        return (
                            <TableCell key={tf} className={cn("text-center font-mono text-lg", isResistance ? 'text-red-300' : 'text-green-300')}>
                                ${targetPrice.toFixed(4)}
                            </TableCell>
                        )
                    })}
                </TableRow>

                <LevelRow levels={data[timeframes[0]].S} type='S' />
            </TableBody>
        </Table>
        {livePrice && (
            <div className="text-center text-lg pt-2 font-mono">
                Live Price: <span className="text-primary font-bold animate-pulse">${livePrice.toFixed(4)}</span>
            </div>
        )}
    </div>
  );
};

export default QuantumPivotsMatrix;
