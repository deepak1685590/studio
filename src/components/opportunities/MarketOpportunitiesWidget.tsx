
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, RadioTower, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Opportunity {
  symbol: string;
  market: 'Crypto' | 'Forex' | 'Commodity';
  type: 'Bullish Breakout' | 'Bearish Reversal' | 'Range Expansion' | 'Volume Spike';
  confidence: number;
}

const opportunities: Opportunity[] = [
  { symbol: 'BTC/USD', market: 'Crypto', type: 'Bullish Breakout', confidence: 88 },
  { symbol: 'EUR/USD', market: 'Forex', type: 'Bearish Reversal', confidence: 92 },
  { symbol: 'SOL', market: 'Crypto', type: 'Volume Spike', confidence: 85 },
  { symbol: 'GOLD', market: 'Commodity', type: 'Range Expansion', confidence: 78 },
  { symbol: 'ETH/BTC', market: 'Crypto', type: 'Bullish Breakout', confidence: 81 },
  { symbol: 'GBP/JPY', market: 'Forex', type: 'Bearish Reversal', confidence: 95 },
];

interface MarketOpportunitiesWidgetProps {
  onSelectOpportunity: (symbol: string) => void;
}

const OpportunityIcon = ({ type }: { type: Opportunity['type'] }) => {
  switch (type) {
    case 'Bullish Breakout': return <TrendingUp className="h-5 w-5 text-green-400" />;
    case 'Bearish Reversal': return <TrendingDown className="h-5 w-5 text-red-400" />;
    case 'Range Expansion': return <TrendingUp className="h-5 w-5 text-yellow-400" />;
    case 'Volume Spike': return <Zap className="h-5 w-5 text-blue-400" />;
    default: return null;
  }
};

const MarketOpportunitiesWidget: React.FC<MarketOpportunitiesWidgetProps> = ({ onSelectOpportunity }) => {
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence > 90) return 'text-green-400';
    if (confidence > 80) return 'text-yellow-400';
    return 'text-orange-400';
  }
  
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
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {opportunities.map((opp, index) => (
            <div key={index} className="p-4 bg-accent/10 border border-accent/30 rounded-lg flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <OpportunityIcon type={opp.type} />
                <div>
                  <div className="font-bold font-headline flex items-center gap-2">{opp.symbol} {getMarketBadge(opp.market)}</div>
                  <div className="text-xs text-foreground/80">{opp.type}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold text-lg ${getConfidenceColor(opp.confidence)}`}>{opp.confidence}%</div>
                <Button 
                    size="sm" 
                    variant="outline"
                    className="mt-1 border-accent/50 text-accent hover:bg-accent/20 hover:text-accent"
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
