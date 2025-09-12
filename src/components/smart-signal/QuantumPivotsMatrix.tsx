
"use client";

import React from 'react';
import { MultiTimeframeSR } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface QuantumPivotsMatrixProps {
  data: MultiTimeframeSR;
  livePrice: number | null;
}

const QuantumPivotsMatrix: React.FC<QuantumPivotsMatrixProps> = ({ data, livePrice }) => {
    const timeframes: (keyof MultiTimeframeSR)[] = ['5m', '15m', '1H'];

    const formatPrice = (price: number) => {
        return price < 10 ? price.toFixed(4) : price.toFixed(2);
    }
  
    const LevelCell: React.FC<{ value: number; type: 'support' | 'resistance'; livePrice: number | null }> = ({ value, type, livePrice }) => {
        const isNear = livePrice !== null && Math.abs(livePrice - value) / value < 0.0005; // 0.05% proximity
        const glowClass = type === 'support' 
            ? 'shadow-[0_0_15px_rgba(74,222,128,0.7)] bg-green-500/10'
            : 'shadow-[0_0_15px_rgba(239,68,68,0.7)] bg-red-500/10';

        return (
            <div className={cn(
                "font-mono font-bold text-center transition-all duration-300 p-1 rounded-md",
                type === 'support' ? "text-green-400" : "text-red-400",
                isNear && glowClass
            )}>
                ${formatPrice(value)}
            </div>
        );
    };

    const LivePriceIndicator: React.FC<{ level: number, rangeMin: number, rangeMax: number }> = ({ level, rangeMin, rangeMax }) => {
        if (livePrice === null) return null;
        
        const isPriceHere = livePrice >= rangeMin && livePrice < rangeMax;
        if (!isPriceHere) return <div className="h-8"></div>;

        const priceIsRising = livePrice > level;

        return (
            <div className={cn(
                "h-8 flex items-center justify-center font-bold font-mono text-lg animate-pulse",
                priceIsRising ? 'text-green-300' : 'text-red-300'
            )}>
                 <div className="flex items-center gap-1" style={{ textShadow: '0 0 8px currentColor' }}>
                    {priceIsRising ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    <span>${formatPrice(livePrice)}</span>
                 </div>
            </div>
        )
    }

    const levelOrder: (keyof MultiTimeframeSR['5m'])[] = ['R3', 'R2', 'R1', 'S1', 'S2', 'S3'];

  return (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="w-1/4 text-primary">Level</TableHead>
                {timeframes.map(tf => (
                    <TableHead key={tf} className="text-center text-primary">{tf.toUpperCase()}</TableHead>
                ))}
                <TableHead className="w-1/4 text-center text-primary">Live Price</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {levelOrder.map(levelKey => {
                const type = levelKey.startsWith('R') ? 'resistance' : 'support';
                const levelData = timeframes.map(tf => data[tf][levelKey]);

                // Define the price range for the live indicator for this row
                let rangeMin: number, rangeMax: number;
                const currentLevelIndex = levelOrder.indexOf(levelKey);
                
                if (type === 'resistance') {
                    rangeMin = levelData[0]; // The price of the current R level
                    rangeMax = currentLevelIndex > 0 ? data['5m'][levelOrder[currentLevelIndex - 1]] : Infinity;
                } else { // Support
                    rangeMax = levelData[0]; // The price of the current S level
                    rangeMin = currentLevelIndex < levelOrder.length - 1 ? data['5m'][levelOrder[currentLevelIndex + 1]] : -Infinity;
                }

                return (
                    <TableRow key={levelKey}>
                        <TableCell className={cn("font-bold", type === 'support' ? "text-green-400/80" : "text-red-400/80")}>
                            {levelKey}
                        </TableCell>
                        {levelData.map((levelValue, index) => (
                            <TableCell key={timeframes[index]} className="text-center">
                                <LevelCell value={levelValue} type={type} livePrice={livePrice} />
                            </TableCell>
                        ))}
                        <TableCell className="text-center relative">
                            <LivePriceIndicator level={levelData[0]} rangeMin={rangeMin} rangeMax={rangeMax} />
                        </TableCell>
                    </TableRow>
                );
            })}
        </TableBody>
    </Table>
  );
};

export default QuantumPivotsMatrix;
