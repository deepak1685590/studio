
"use client";

import React from 'react';
import { MultiTimeframeSR } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, ArrowRight, GitCommitHorizontal } from 'lucide-react';

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
                {['R3', 'R2', 'R1'].map(level => (
                    <TableRow key={level} className="text-red-400">
                        <TableHead className="font-bold flex items-center gap-1"><TrendingUp size={14}/> {level}</TableHead>
                        {timeframes.map(tf => <PriceCell key={tf} price={data[tf][level as keyof typeof data[tf]]} />)}
                    </TableRow>
                ))}
                
                <TableRow className="bg-primary/10 text-primary font-bold border-y-2 border-primary">
                    <TableHead className="font-bold flex items-center gap-1"><GitCommitHorizontal size={14}/> Probable Target</TableHead>
                    {timeframes.map(tf => (
                         <TableCell key={tf} className="text-center font-mono">
                            {data[tf].probableTarget}
                        </TableCell>
                    ))}
                </TableRow>

                {['S1', 'S2', 'S3'].map(level => (
                    <TableRow key={level} className="text-green-400">
                        <TableHead className="font-bold flex items-center gap-1"><TrendingDown size={14}/> {level}</TableHead>
                         {timeframes.map(tf => <PriceCell key={tf} price={data[tf][level as keyof typeof data[tf]]} />)}
                    </TableRow>
                ))}
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
