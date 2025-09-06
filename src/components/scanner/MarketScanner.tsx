
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getSignalData } from '@/lib/technical-analysis';
import type { SignalData } from '@/types';
import { AreaChart, Search, Sparkles, TrendingDown, TrendingUp, Check, Activity, ChevronDown } from 'lucide-react';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import './MarketScanner.css';


interface MarketScannerProps {
  onSelectSymbol: (string) => void;
}

type Opportunity = Pick<SignalData, 'symbol' | 'isBullish' | 'entry' | 'tp1' | 'confidence' | 'confidenceBreakdown' | 'sidewaysMarket'>;

const assetsToScan = [
    // Crypto
    'BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX', 'DOT', 'MATIC', 'BNB',
    // Forex
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD',
];

const ConfidenceFactor: React.FC<{ label: string; score: number }> = ({ label, score }) => {
  let scoreColor = "text-yellow-400";
  if (score > 80) scoreColor = "text-green-400";
  if (score < 60) scoreColor = "text-red-400";
  
  return (
    <div className="text-xs">
      {label}: <span className={cn("font-mono font-bold", scoreColor)}>{score}%</span>
    </div>
  );
};

const MarketScanner: React.FC<MarketScannerProps> = ({ onSelectSymbol }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [progress, setProgress] = useState(0);
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
                // Always show a result for every scanned asset.
                foundOpportunities.push({
                    symbol: data.symbol,
                    isBullish: data.isBullish,
                    entry: data.entry,
                    tp1: data.tp1,
                    confidence: data.confidence,
                    confidenceBreakdown: data.confidenceBreakdown,
                    sidewaysMarket: data.sidewaysMarket,
                });
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
                description: `Found ${foundOpportunities.length} potential setups.`,
            });
            setIsScanning(false);
        }
    };

    const handleAnalyze = (symbol: string) => {
        onSelectSymbol(symbol);
        toast({ title: "Loading Asset", description: `Loading ${symbol} into the Quantum Analysis Engine.` });
    };

    const TrendBadge: React.FC<{ opportunity: Opportunity }> = ({ opportunity }) => {
        if (opportunity.sidewaysMarket) {
            return (
                 <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                    Sideways
                </Badge>
            )
        }
        return (
             <Badge variant="outline" className={cn(
                opportunity.isBullish ? "text-green-400 border-green-400/50" : "text-red-400 border-red-400/50"
            )}>
                {opportunity.isBullish ? <TrendingUp size={14} className="mr-1"/> : <TrendingDown size={14} className="mr-1"/>}
                {opportunity.isBullish ? 'Bullish' : 'Bearish'}
            </Badge>
        )
    }

    return (
        <div className="mt-4 p-4 border-2 border-primary/30 rounded-lg bg-black/30">
            <div className="text-center">
                 <Button onClick={handleScan} disabled={isScanning} className="font-headline text-lg scanner-glow">
                    <Search className="mr-2" />
                    {isScanning ? 'Scanning...' : 'Scan Markets for Opportunities'}
                </Button>
                <p className="text-xs text-foreground/60 mt-2">Scans top Crypto & Forex pairs for setups on the 15m timeframe.</p>
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
                    <div className="max-h-[60vh] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Asset</TableHead>
                                    <TableHead>Trend</TableHead>
                                    <TableHead>Entry</TableHead>
                                    <TableHead>Confidence</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {opportunities.map(op => (
                                    <Collapsible asChild key={op.symbol}>
                                        <>
                                            <TableRow>
                                                <TableCell className="font-bold">{op.symbol}</TableCell>
                                                <TableCell>
                                                    <TrendBadge opportunity={op} />
                                                </TableCell>
                                                <TableCell className="font-mono">{op.entry !== "N/A" ? `$${op.entry}` : "N/A"}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-primary">{op.confidenceBreakdown.overall}%</span>
                                                        <CollapsibleTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                                <ChevronDown className="h-4 w-4" />
                                                            </Button>
                                                        </CollapsibleTrigger>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button size="sm" onClick={() => handleAnalyze(op.symbol)} className="bg-accent/80 hover:bg-accent text-xs">
                                                        <Activity size={14} className="mr-1"/> Analyze
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                            <CollapsibleContent asChild>
                                                <TableRow>
                                                    <TableCell colSpan={5} className="p-0">
                                                        <div className="p-2 px-4 bg-black/40">
                                                            <h5 className="text-xs font-bold mb-1">Confidence Factors:</h5>
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                                                                <ConfidenceFactor label="Pattern" score={op.confidenceBreakdown.patternStrength} />
                                                                <ConfidenceFactor label="Volume" score={op.confidenceBreakdown.volumeConfirmation} />
                                                                <ConfidenceFactor label="HTF Align" score={op.confidenceBreakdown.htfAlignment} />
                                                                <ConfidenceFactor label="Smart Money" score={op.confidenceBreakdown.smartMoneyFlow} />
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            </CollapsibleContent>
                                        </>
                                    </Collapsible>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default MarketScanner;
