"use client";

import React from 'react';
import { VolumeAnalysis, VolumeTimeframeData } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface VolumeAnalysisTableProps {
  data: VolumeAnalysis;
}

const VolumeAnalysisTable: React.FC<VolumeAnalysisTableProps> = ({ data }) => {
  const timeframes: (keyof VolumeAnalysis)[] = ['5m', '15m', '1H', '4H', '1D'];

  const getDominantSideBadge = (side: VolumeTimeframeData['dominantSide']) => {
    switch (side) {
      case 'Buy':
        return <Badge className="bg-green-500/80 text-white text-xs">Buy</Badge>;
      case 'Sell':
        return <Badge variant="destructive" className="bg-red-500/80 text-white text-xs">Sell</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Neutral</Badge>;
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(1)}M`;
    if (volume >= 1_000) return `${(volume / 1_000).toFixed(1)}k`;
    return volume.toFixed(0);
  };

  const VolumeBar = ({ item }: { item: VolumeTimeframeData }) => {
    const buyPercentage = (item.buyVolume / item.totalVolume) * 100;
    return (
        <div className="w-full h-2.5 rounded-full bg-red-500/30 flex">
            <div 
                className="h-full rounded-l-full bg-green-500/70"
                style={{ width: `${buyPercentage}%` }}
            />
        </div>
    );
  };

  return (
    <div className="bg-black/30 rounded-lg border border-primary/20 p-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/5">Time</TableHead>
            <TableHead className="w-1/5">Dom.</TableHead>
            <TableHead className="w-2/5 text-center">Volume Flow</TableHead>
            <TableHead className="w-1/5 text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeframes.map((tf) => {
            const item = data[tf];
            return (
                <TableRow key={tf} className="text-xs">
                <TableCell className="font-medium p-2">{tf}</TableCell>
                <TableCell className="p-2">{getDominantSideBadge(item.dominantSide)}</TableCell>
                <TableCell className="p-2 align-middle">
                    <VolumeBar item={item} />
                </TableCell>
                <TableCell className="text-right font-mono p-2">{formatVolume(item.totalVolume)}</TableCell>
                </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default VolumeAnalysisTable;
