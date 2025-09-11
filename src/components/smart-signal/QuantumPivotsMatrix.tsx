
"use client";

import React from 'react';
import { MultiTimeframeSR } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface QuantumPivotsMatrixProps {
  data: MultiTimeframeSR;
}

const QuantumPivotsMatrix: React.FC<QuantumPivotsMatrixProps> = ({ data }) => {
    const timeframes: (keyof MultiTimeframeSR)[] = ['5m', '15m', '1H'];

    const formatPrice = (price: number) => {
        return price < 10 ? price.toFixed(4) : price.toFixed(2);
    }
  
    const LevelCell: React.FC<{ label: string; value: number; type: 'support' | 'resistance' }> = ({ label, value, type }) => (
        <div className="text-center">
            <div className={cn(
                "font-mono font-bold text-lg",
                type === 'support' ? "text-green-400" : "text-red-400"
            )}>
                ${formatPrice(value)}
            </div>
            <div className="text-xs text-foreground/60">{label}</div>
        </div>
    );

  return (
    <div className="space-y-4">
      {timeframes.map(tf => (
        <div key={tf} className="bg-black/40 p-3 rounded-lg border border-primary/20">
          <h4 className="font-headline text-lg text-primary text-center mb-2">{tf.toUpperCase()} Levels</h4>
          <div className="grid grid-cols-3 gap-2">
            <LevelCell label="Support 1" value={data[tf].S1} type="support" />
            <LevelCell label="Support 2" value={data[tf].S2} type="support" />
            <LevelCell label="Support 3" value={data[tf].S3} type="support" />
          </div>
          <hr className="my-2 border-primary/20 border-dashed" />
          <div className="grid grid-cols-3 gap-2">
            <LevelCell label="Resistance 1" value={data[tf].R1} type="resistance" />
            <LevelCell label="Resistance 2" value={data[tf].R2} type="resistance" />
            <LevelCell label="Resistance 3" value={data[tf].R3} type="resistance" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuantumPivotsMatrix;
