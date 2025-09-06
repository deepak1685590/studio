
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getSignalData } from '@/lib/technical-analysis';
import type { SignalData } from '@/types';
import { AreaChart, Search, Sparkles, TrendingDown, TrendingUp, Check, Activity, ChevronDown, Award, Gem, Fish } from 'lucide-react';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import './MarketScanner.css';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

interface MarketScannerProps {
  onSelectSymbol: (string) => void;
}

type Opportunity = Pick<SignalData, 'symbol' | 'isBullish' | 'entry' | 'tp1' | 'confidence' | 'confidenceBreakdown' | 'sidewaysMarket' | 'chartPattern' | 'goldenPullbackZone' | 'whaleAlert'>;

const assetLists = {
    'Top 10 Crypto': ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX', 'DOT', 'MATIC', 'BNB'],
    'Major Forex Pairs': ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD'],
    'All Assets': ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX', 'DOT', 'MATIC', 'BNB', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD'],
};

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
    const [filterHighConfidence, setFilterHighConfidence] = useState(true);
    const [filterGoldenZone, setFilterGoldenZone] = useState(false);
    const [filterWhaleAlerts, setFilterWhaleAlerts] = useState(false);
    
    const isMounted = useIsMounted();
    const { toast } = useToast();

    const handleScan = async (assetList: string[]) => {
        if (isScanning) return;

        setIsScanning(true);
        setOpportunities([]);
        setProgress(0);
        
        toast({
            title: "Market Scan Initiated",
            description: `Scanning ${assetList.length} assets for high-probability setups...`,
        });

        const allResults: Opportunity[] = [];

        const promises = assetList.map(async (symbol) => {
            try {
                const data = await getSignalData(symbol, '2', '15m');
                const opportunityData = {
                    symbol: data.symbol,
                    isBullish: data.isBullish,
                    entry: data.entry,
                    tp1: data.tp1,
                    confidence: data.confidence,
                    confidenceBreakdown: data.confidenceBreakdown,
                    sidewaysMarket: data.sidewaysMarket,
                    chartPattern: data.chartPattern,
                    goldenPullbackZone: data.goldenPullbackZone,
                    whaleAlert: data.whaleAlert,
                };
                allResults.push(opportunityData);
            } catch (error) {
                console.warn(`Could not scan ${symbol}:`, error);
            } finally {
                if (isMounted.current) {
                    setProgress(prev => prev + (100 / assetList.length));
                }
            }
        });
        
        await Promise.all(promises);

        if (isMounted.current) {
            let finalOpportunities = [...allResults].sort((a,b) => b.confidenceBreakdown.overall - a.confidenceBreakdown.overall);

            if (filterHighConfidence) {
                finalOpportunities = finalOpportunities.filter(op => op.confidenceBreakdown.overall >= 75);
            }
            if (filterGoldenZone) {
                finalOpportunities = finalOpportunities.filter(op => !!op.goldenPullbackZone);
            }
            if (filterWhaleAlerts) {
                finalOpportunities = finalOpportunities.filter(op => !!op.whaleAlert);
            }
            
            setOpportunities(finalOpportunities);

            toast({
                title: "Scan Complete",
                description: `Found ${finalOpportunities.length} setups matching your criteria.`,
            });
            setIsScanning(false);
            setProgress(100);
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

    const AlertIcons: React.FC<{ op: Opportunity }> = ({ op }) => (
        <div className="flex items-center gap-2">
            {op.confidenceBreakdown.overall >= 85 && (
                <Award size={16} className="text-amber-400" title="Very High Confidence"/>
            )}
            {op.goldenPullbackZone && (
                <Gem size={16} className="text-cyan-400" title="Golden Zone Setup"/>
            )}
            {op.whaleAlert && (
                <Fish size={16} className="text-blue-400" title="Whale Activity Detected"/>
            )}
        </div>
    );

    return (
        <div className="mt-4 p-4 border-2 border-primary/30 rounded-lg bg-black/30 space-y-6">
            <div>
                <h4 className="font-headline text-lg text-primary mb-3 text-center">Scan Presets</h4>
                <div className="flex flex-wrap justify-center gap-3">
                    {Object.entries(assetLists).map(([name, list]) => (
                        <Button key={name} onClick={() => handleScan(list)} disabled={isScanning} className="font-headline scanner-glow">
                            <Search className="mr-2" />
                            {isScanning ? 'Scanning...' : `Scan ${name}`}
                        </Button>
                    ))}
                </div>
            </div>

            <div>
                 <h4 className="font-headline text-lg text-primary mb-3 text-center">Advanced Filters</h4>
                 <div className="flex flex-wrap justify-center items-center gap-4 p-3 bg-black/40 rounded-md">
                    <div className="flex items-center space-x-2">
                        <Switch id="high-confidence" checked={filterHighConfidence} onCheckedChange={setFilterHighConfidence} />
                        <Label htmlFor="high-confidence" className="flex items-center gap-1"><Award size={14}/> High Confidence (&gt;75%)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="golden-zone" checked={filterGoldenZone} onCheckedChange={setFilterGoldenZone} />
                        <Label htmlFor="golden-zone" className="flex items-center gap-1"><Gem size={14} /> Golden Zone</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="whale-alerts" checked={filterWhaleAlerts} onCheckedChange={setFilterWhaleAlerts} />
                        <Label htmlFor="whale-alerts" className="flex items-center gap-1"><Fish size={14} /> Whale Alerts</Label>
                    </div>
                 </div>
            </div>

            {isScanning && (
                <div className="mt-4">
                    <div className="progress-bar" />
                    <p className="text-center text-xs text-primary/80 mt-1">{Math.round(progress)}% Complete</p>
                </div>
            )}
            
            {opportunities.length > 0 && (
                 <div className="mt-6">
                    <h4 className="font-headline text-lg text-primary flex items-center gap-2 mb-2"><Sparkles size={18}/> Scan Results ({opportunities.length})</h4>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Asset</TableHead>
                                    <TableHead>Trend</TableHead>
                                    <TableHead>Confidence</TableHead>
                                    <TableHead>Alerts</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {opportunities.map(op => (
                                    <Collapsible asChild key={op.symbol}>
                                        <>
                                            <TableRow className="align-middle" data-state={op.confidenceBreakdown.overall >= 85 ? 'selected' : ''}>
                                                <TableCell className="font-bold">{op.symbol}</TableCell>
                                                <TableCell>
                                                    <TrendBadge opportunity={op} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-primary">{op.confidenceBreakdown.overall}%</span>
                                                        <CollapsibleTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 data-[state=open]:rotate-180 transition-transform">
                                                                <ChevronDown className="h-4 w-4" />
                                                            </Button>
                                                        </CollapsibleTrigger>
                                                    </div>
                                                </TableCell>
                                                <TableCell><AlertIcons op={op} /></TableCell>
                                                <TableCell>
                                                    <Button size="sm" onClick={() => handleAnalyze(op.symbol)} className="bg-accent/80 hover:bg-accent text-xs">
                                                        <Activity size={14} className="mr-1"/> Analyze
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                            <CollapsibleContent asChild>
                                                <tr>
                                                    <TableCell colSpan={5} className="p-0">
                                                        <div className="p-2 px-4 bg-black/40 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                                            <div>
                                                                <h5 className="text-xs font-bold mb-1">Pattern: <span className="text-primary/80">{op.chartPattern.name}</span></h5>
                                                                <p className="text-xs text-foreground/70">{op.chartPattern.description}</p>
                                                            </div>
                                                            <div>
                                                                <h5 className="text-xs font-bold mb-1">Confidence Factors:</h5>
                                                                <div className="grid grid-cols-2 gap-1">
                                                                    <ConfidenceFactor label="Pattern" score={op.confidenceBreakdown.patternStrength} />
                                                                    <ConfidenceFactor label="Volume" score={op.confidenceBreakdown.volumeConfirmation} />
                                                                    <ConfidenceFactor label="HTF Align" score={op.confidenceBreakdown.htfAlignment} />
                                                                    <ConfidenceFactor label="Smart Money" score={op.confidenceBreakdown.smartMoneyFlow} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </tr>
                                            </CollapsibleContent>
                                        </>
                                    </Collapsible>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                 </div>
            )}
             {!isScanning && opportunities.length === 0 && progress === 100 && (
                <div className="text-center p-6 bg-black/20 rounded-lg">
                    <p className="font-headline text-primary">No setups found matching your criteria.</p>
                    <p className="text-sm text-foreground/70 mt-1">Try adjusting the filters or scanning a different asset list.</p>
                </div>
            )}
        </div>
    );
};

export default MarketScanner;
