
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, RadioTower, Zap, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Opportunity {
  symbol: string;
  market: 'Crypto' | 'Forex' | 'Commodity';
  type: 'Bullish Breakout' | 'Bearish Reversal' | 'Range Expansion' | 'Volume Spike';
  conviction: number; // Replaces confidence
  keyLevel: string; // e.g., "Breakout > $68,500"
  timeframe: string; // e.g., "4H"
}

const opportunities: Opportunity[] = [
  { symbol: 'BTC/USD', market: 'Crypto', type: 'Bullish Breakout', conviction: 88, keyLevel: 'Above $68,500', timeframe: '4H' },
  { symbol: 'EUR/USD', market: 'Forex', type: 'Bearish Reversal', conviction: 92, keyLevel: 'Below 1.0720', timeframe: '1D' },
  { symbol: 'SOL', market: 'Crypto', type: 'Volume Spike', conviction: 85, keyLevel: 'Volume > 1.5M', timeframe: '1H' },
  { symbol: 'GOLD', market: 'Commodity', type: 'Range Expansion', conviction: 78, keyLevel: 'Range: $2300-$2350', timeframe: '1D' },
  { symbol: 'ETH/BTC', market: 'Crypto', type: 'Bullish Breakout', conviction: 81, keyLevel: 'Ratio > 0.055', timeframe: '4H' },
  { symbol: 'GBP/JPY', market: 'Forex', type: 'Bearish Reversal', conviction: 95, keyLevel: 'Rejecting 198.50', timeframe: '1H' },
];

interface MarketOpportunitiesWidgetProps {
  onSelectOpportunity: (symbol: string) => void;
}

const OpportunityIcon = ({ type }: { type: Opportunity['type'] }) => {
  switch (type) {
    case 'Bullish Breakout': return <TrendingUp className="h-6 w-6 text-green-400" />;
    case 'Bearish Reversal': return <TrendingDown className="h-6 w-6 text-red-400" />;
    case 'Range Expansion': return <TrendingUp className="h-6 w-6 text-yellow-400" />;
    case 'Volume Spike': return <Zap className="h-6 w-6 text-blue-400" />;
    default: return null;
  }
};

const ConvictionMeter = ({ score }: { score: number }) => {
    const circumference = 2 * Math.PI * 18; // 2 * pi * radius
    const offset = circumference - (score / 100) * circumference;

    const getColor = (s: number) => {
        if (s > 90) return 'stroke-green-400';
        if (s > 80) return 'stroke-yellow-400';
        return 'stroke-orange-400';
    };

    return (
        <div className="relative h-12 w-12">
            <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 40 40">
                <circle
                    className="stroke-accent/20"
                    cx="20"
                    cy="20"
                    r="18"
                    strokeWidth="4"
                    fill="transparent"
                />
                <circle
                    className={`transition-all duration-500 ease-in-out ${getColor(score)}`}
                    cx="20"
                    cy="20"
                    r="18"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform="rotate(-90 20 20)"
                />
            </svg>
            <div className={`absolute inset-0 flex items-center justify-center font-bold text-sm ${getColor(score).replace('stroke-', 'text-')}`}>
                {score}
            </div>
        </div>
    );
};


const MarketOpportunitiesWidget: React.FC<MarketOpportunitiesWidgetProps> = ({ onSelectOpportunity }) => {
  
  const getMarketBadge = (market: Opportunity['market']) => {
      switch(market) {
          case 'Crypto': return <Badge variant="outline" className="border-blue-400 text-blue-400">Crypto</Badge>
          case 'Forex': return <Badge variant="outline" className="border-purple-400 text-purple-400">Forex</Badge>
          case 'Commodity': return <Badge variant="outline" className="border-amber-400 text-amber-400">Commodity</Badge>
      }
  }

  return (
    <Card className="border-2 border-accent/50 bg-black/70 backdrop-blur-sm shadow-[0_0_20px_var(--accent)]">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-accent flex items-center gap-2">
          <RadioTower /> Quantum Opportunities Radar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {opportunities.map((opp, index) => (
            <div key={index} className="p-3 bg-accent/10 border border-accent/30 rounded-lg flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <OpportunityIcon type={opp.type} />
                <div className="flex-1">
                  <div className="font-bold font-headline flex items-center gap-2">{opp.symbol} {getMarketBadge(opp.market)}</div>
                  <div className="text-xs text-foreground/80">{opp.type}</div>
                  <div className="text-xs font-mono text-accent mt-1">{opp.keyLevel}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <Badge variant="outline" className="flex items-center gap-1 text-xs border-primary/50 text-primary/80">
                    <Timer size={12} /> {opp.timeframe}
                 </Badge>
                 <ConvictionMeter score={opp.conviction} />
                 <Button 
                    size="sm" 
                    variant="outline"
                    className="border-accent/50 text-accent hover:bg-accent/20 hover:text-accent font-bold"
                    onClick={() => onSelectOpportunity(opp.symbol.split('/')[0])}
                >
                    Analyze
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketOpportunitiesWidget;
