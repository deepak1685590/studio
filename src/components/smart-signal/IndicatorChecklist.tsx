
"use client";

import React from 'react';
import type { IndicatorChecklist as ChecklistData, IndicatorSignal } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CheckCircle, XCircle, MinusCircle, ChevronDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IndicatorChecklistProps {
  data: ChecklistData;
}

const IndicatorChecklist: React.FC<IndicatorChecklistProps> = ({ data }) => {
  const { summary, indicators } = data;

  const getSignalStyle = (signal: IndicatorSignal) => {
    switch (signal) {
      case 'Buy':
        return 'text-green-400';
      case 'Sell':
        return 'text-red-400';
      case 'Overbought':
        return 'text-orange-400';
      case 'Oversold':
        return 'text-cyan-400';
      default:
        return 'text-yellow-400';
    }
  };

  return (
    <Card className="bg-black/30 rounded-lg border border-accent/50 shadow-[0_0_15px_hsl(var(--accent)_/_0.3)]">
      <Collapsible defaultOpen={false}>
        <CardHeader className="p-4">
          <CollapsibleTrigger className="flex justify-between items-center w-full group">
            <CardTitle className="font-headline text-xl text-primary flex items-center gap-2">
              <Activity /> Advanced Indicator Matrix
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 font-bold text-green-400"><CheckCircle /> {summary.buy}</div>
              <div className="flex items-center gap-1 font-bold text-red-400"><XCircle /> {summary.sell}</div>
              <div className="flex items-center gap-1 font-bold text-yellow-400"><MinusCircle /> {summary.neutral}</div>
              <ChevronDown className="h-5 w-5 transition-transform duration-300 group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Indicator</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Signal</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {indicators.map((indicator, index) => (
                    <TableRow key={index} className="text-xs">
                      <TableCell className="font-bold">{indicator.name}</TableCell>
                      <TableCell className="font-mono">{indicator.value}</TableCell>
                      <TableCell className={cn("font-bold", getSignalStyle(indicator.signal))}>
                        {indicator.signal}
                      </TableCell>
                      <TableCell className="text-foreground/70">{indicator.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default IndicatorChecklist;
