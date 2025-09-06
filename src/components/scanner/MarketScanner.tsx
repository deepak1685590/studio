
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getSignalData } from '@/lib/technical-analysis';
import type { SignalData } from '@/types';
import { AreaChart, Search, Sparkles, TrendingDown, TrendingUp, Check, Activity } from 'lucide-react';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface MarketScannerProps {
  onSelectSymbol: (symbol: string) => void;
}

type Opportunity = Pick<SignalData, 'symbol' | 'isBullish' | 'entry' | 'tp1' | 'confidence' | 'confidenceBreakdown'>;

const assetsToScan = [
    // Crypto
    'BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX', 'DOT', 'MATIC', 'BNB',
    // Forex
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD',
];

const MarketScanner: React.FC<MarketScannerProps> = ({ onSelectSymbol }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [progress, setProgress] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const isMounted = useIsMounted();
    const { toast } = useToast();

    const handleScan = async () => {
        if (isScanning) return;

        setIsScanning(true);
        setOpportunities([]);
        setProgress(0);
        
        toast({
            title: "Market Scan Initiated",
            description: "Scanning top assets for high-probability setups...",
        });

        const foundOpportunities: Opportunity[] = [];

        for (let i = 0; i < assetsToScan.length; i++) {
            if (!isMounted.current) return;

            const symbol = assetsToScan[i];
            try {
                const data = await getSignalData(symbol, '2', '15m'); // Use Pro Signal for scanning
                if (!data.sidewaysMarket && data.confidenceBreakdown.overall > 75) {
                    foundOpportunities.push({
                        symbol: data.symbol,
                        isBullish: data.isBullish,
                        entry: data.entry,
                        tp1: data.tp1,
                        confidence: data.confidence,
                        confidenceBreakdown: data.confidenceBreakdown
                    });
                }
            } catch (error) {
                console.warn(`Could not scan ${symbol}:`, error);
            }

            if (isMounted.current) {
                setProgress(((i + 1) / assetsToScan.length) * 100);
                setOpportunities([...foundOpportunities].sort((a,b) => b.confidenceBreakdown.overall - a.confidenceBreakdown.overall));
            }
        }
        
        if (isMounted.current) {
             toast({
                title: "Scan Complete",
                description: `Found ${foundOpportunities.length} high-probability setups.`,
            });
            setIsScanning(false);
        }
    };

    const handleAnalyze = (symbol: string) => {
        onSelectSymbol(symbol);
        toast({ title: "Loading Asset", description: `Loading ${symbol} into the Quantum Analysis Engine.` });
    };

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
            <div className="flex items-center justify-between bg-black/50 border-2 border-primary/50 rounded-lg p-3 px-4">
                <div className="flex items-center gap-2">
                    <AreaChart className="text-primary" />
                    <h3 className="font-headline text-xl text-primary">Market Scanner</h3>
                </div>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                        {isOpen ? "Hide Scanner" : "Show Scanner"}
                    </Button>
                </CollapsibleTrigger>
            </div>

            <CollapsibleContent>
                <div className="mt-4 p-4 border-2 border-primary/30 rounded-lg bg-black/30">
                    <div className="text-center">
                         <Button onClick={handleScan} disabled={isScanning} className="font-headline text-lg scanner-glow">
                            <Search className="mr-2" />
                            {isScanning ? 'Scanning...' : 'Scan Markets for Opportunities'}
                        </Button>
                        <p className="text-xs text-foreground/60 mt-2">Scans top Crypto & Forex pairs for high-confidence setups on the 15m timeframe.</p>
                    </div>

                    {isScanning && (
                        <div className="mt-4">
                            <div className="relative h-2 w-full bg-primary/20 rounded-full overflow-hidden">
                                <div 
                                    className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%`}}
                                ></div>
                            </div>
                           <div className="progress-bar mt-2"></div>
                        </div>
                    )}
                    
                    {opportunities.length > 0 && (
                         <div className="mt-6">
                            <h4 className="font-headline text-lg text-primary flex items-center gap-2 mb-2"><Sparkles size={18}/> Scan Results</h4>
                            <div className="max-h-96 overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Asset</TableHead>
                                            <TableHead>Trend</TableHead>
                                            <TableHead>Entry</TableHead>
                                            <TableHead>Target 1</TableHead>
                                            <TableHead>Confidence</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {opportunities.map(op => (
                                            <TableRow key={op.symbol}>
                                                <TableCell className="font-bold">{op.symbol}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={cn(
                                                        op.isBullish ? "text-green-400 border-green-400/50" : "text-red-400 border-red-400/50"
                                                    )}>
                                                        {op.isBullish ? <TrendingUp size={14} className="mr-1"/> : <TrendingDown size={14} className="mr-1"/>}
                                                        {op.isBullish ? 'Bullish' : 'Bearish'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-mono">${op.entry}</TableCell>
                                                <TableCell className="font-mono">${op.tp1}</TableCell>
                                                <TableCell className="font-mono font-bold text-primary">{op.confidenceBreakdown.overall}%</TableCell>
                                                <TableCell>
                                                    <Button size="sm" onClick={() => handleAnalyze(op.symbol)} className="bg-accent/80 hover:bg-accent text-xs">
                                                        <Activity size={14} className="mr-1"/> Analyze
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                         </div>
                    )}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
};

export default MarketScanner;
