"use client";

import React from 'react';
import { VolumeAnalysis, VolumeTimeframeData } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VolumeAnalysisTableProps {
  data: VolumeAnalysis;
}

const VolumeAnalysisTable: React.FC<VolumeAnalysisTableProps> = ({ data }) => {
  const timeframes: (keyof VolumeAnalysis)[] = ['5m', '15m', '1H', '4H', '1D'];

  const getDominantSideBadge = (side: VolumeTimeframeData['dominantSide']) => {
    switch (side) {
      case 'Buy':
        return <Badge className="bg-green-500/80 text-white">Buy</Badge>;
      case 'Sell':
        return <Badge variant="destructive" className="bg-red-500/80 text-white">Sell</Badge>;
      default:
        return <Badge variant="secondary">Neutral</Badge>;
    }
  };

  const formatVolume = (volume: number) => {
    return (volume / 1000).toFixed(1) + 'k';
  };

  return (
    <div className="bg-black/30 rounded-lg border border-primary/20 p-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Timeframe</TableHead>
            <TableHead>Dominance</TableHead>
            <TableHead className="text-right text-green-400">Buy Vol</TableHead>
            <TableHead className="text-right text-red-400">Sell Vol</TableHead>
            <TableHead className="text-right">Total Vol</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeframes.map((tf) => (
            <TableRow key={tf}>
              <TableCell className="font-medium">{tf}</TableCell>
              <TableCell>{getDominantSideBadge(data[tf].dominantSide)}</TableCell>
              <TableCell className="text-right font-mono text-green-400/80">{formatVolume(data[tf].buyVolume)}</TableCell>
              <TableCell className="text-right font-mono text-red-400/80">{formatVolume(data[tf].sellVolume)}</TableCell>
              <TableCell className="text-right font-mono">{formatVolume(data[tf].totalVolume)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VolumeAnalysisTable;
