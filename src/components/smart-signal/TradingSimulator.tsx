
"use client";

import React, { useState, useEffect } from 'react';
import { SignalData, Position, Trade } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, TrendingDown, Wallet, History, BarChart2, Bot, RefreshCcw, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

interface TradingSimulatorProps {
  signalData: SignalData;
  livePrice: number | null;
}

const INITIAL_BALANCE = 1_000_000;

const TradingSimulator: React.FC<TradingSimulatorProps> = ({ signalData, livePrice }) => {
  const { toast } = useToast();
  const [balance, setBalance] = useLocalStorage('trading-sim-balance', INITIAL_BALANCE);
  const [position, setPosition] = useLocalStorage<Position | null>('trading-sim-position', null);
  const [tradeHistory, setTradeHistory] = useLocalStorage<Trade[]>('trading-sim-history', []);
  const [stats, setStats] = useLocalStorage('trading-sim-stats', { wins: 0, losses: 0 });
  const [pnl, setPnl] = useState(0);
  const [tradeSize, setTradeSize] = useState('10000');
  const [isAutoTrading, setIsAutoTrading] = useLocalStorage('trading-sim-autotrade', false);

  const openPosition = (type: 'long' | 'short', isAuto: boolean = false) => {
    if (position) {
      if (!isAuto) toast({ title: "Error", description: "You already have an open position.", variant: "destructive" });
      return;
    }
    const size = parseFloat(tradeSize);
    if (isNaN(size) || size <= 0) {
      if (!isAuto) toast({ title: "Error", description: "Please enter a valid trade size.", variant: "destructive" });
      return;
    }

    const entryPrice = parseFloat(signalData.entry);
    if (isNaN(entryPrice)) {
      if (!isAuto) toast({ title: "Error", description: "Signal has no valid entry price.", variant: "destructive" });
      return;
    }

    const quantity = size / entryPrice;

    setPosition({
      symbol: signalData.symbol,
      entryPrice: entryPrice,
      size: size,
      quantity: quantity,
      type,
    });
    
    const toastTitle = isAuto ? "Auto-Trade: Position Opened" : "Position Opened";
    toast({ title: toastTitle, description: `Opened ${type} ${signalData.symbol} position of $${size} at $${entryPrice.toFixed(4)}.` });
  };

  const closePosition = (isAuto: boolean = false) => {
    if (!position) return;
    
    const exitPrice = livePrice || (position.type === 'long' ? parseFloat(signalData.tp1) : parseFloat(signalData.sl));
    const calculatedPnl = position.type === 'long'
        ? (exitPrice - position.entryPrice) * position.quantity
        : (position.entryPrice - exitPrice) * position.quantity;

    const newBalance = balance + calculatedPnl;
    setBalance(newBalance);

    const newTrade: Trade = {
      id: new Date().toISOString(),
      symbol: position.symbol,
      type: position.type,
      entryPrice: position.entryPrice,
      exitPrice: exitPrice,
      size: position.size,
      pnl: calculatedPnl,
    };
    setTradeHistory(prev => [newTrade, ...prev].slice(0, 50));
    
    if (calculatedPnl > 0) {
      setStats(prev => ({ ...prev, wins: prev.wins + 1 }));
    } else if (calculatedPnl < 0) {
      setStats(prev => ({ ...prev, losses: prev.losses + 1 }));
    }
    
    const toastTitle = isAuto ? "Auto-Trade: Position Closed" : "Position Closed";
    toast({ 
        title: toastTitle, 
        description: `Closed ${position.symbol} position. P&L: $${calculatedPnl.toFixed(2)}.`,
        variant: calculatedPnl < 0 ? "destructive" : "default"
    });
    
    setPosition(null);
    setPnl(0);
  };

  useEffect(() => {
    if (isAutoTrading && signalData && !signalData.sidewaysMarket) {
        if (position && position.symbol !== signalData.symbol) {
            closePosition(true);
        }
        if (!position) {
            const newTradeType = signalData.isBullish ? 'long' : 'short';
            openPosition(newTradeType, true);
        }
    }
  }, [signalData, isAutoTrading, position]);


  useEffect(() => {
    if (position && livePrice) {
      const pnlValue = position.type === 'long'
        ? (livePrice - position.entryPrice) * position.quantity
        : (position.entryPrice - livePrice) * position.quantity;
      setPnl(pnlValue);
    } else {
      setPnl(0);
    }
  }, [position, livePrice]);
  
  const resetBalance = () => {
    setBalance(INITIAL_BALANCE);
    toast({ title: "Balance Reset", description: `Your balance has been reset to $${INITIAL_BALANCE.toLocaleString()}.` });
  };
  
  const equity = balance + pnl;
  const pnlColor = pnl > 0 ? 'text-green-400' : pnl < 0 ? 'text-red-400' : 'text-foreground';
  const totalTrades = stats.wins + stats.losses;
  const winRate = totalTrades > 0 ? (stats.wins / totalTrades) * 100 : 0;

  return (
    <div className="bg-black/30 rounded-lg border border-primary/20 p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-headline text-xl text-primary flex items-center gap-2"><Wallet /> Trading Simulator</h3>
        <div className="flex items-center space-x-2">
          <Switch id="autotrade-switch" checked={isAutoTrading} onCheckedChange={setIsAutoTrading}/>
          <Label htmlFor="autotrade-switch" className="flex items-center gap-1 font-bold text-primary/80">
            <Bot size={16} /> Auto-Trade
          </Label>
        </div>
      </div>
      
      {/* Account Summary */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
            <div className="text-xs text-foreground/70">Balance</div>
            <div className="font-mono text-lg">${balance.toFixed(2)}</div>
        </div>
        <div>
            <div className="text-xs text-foreground/70">Equity</div>
            <div className="font-mono text-lg">${equity.toFixed(2)}</div>
        </div>
        <div>
            <div className="text-xs text-foreground/70">Unrealized P&L</div>
            <div className={cn("font-mono text-lg", pnlColor)}>${pnl.toFixed(2)}</div>
        </div>
      </div>

      {!position ? (
        // Order Execution
        <div className="space-y-3 pt-2">
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
                <Input 
                    type="number"
                    value={tradeSize}
                    onChange={(e) => setTradeSize(e.target.value)}
                    placeholder="Trade Size (USD)"
                    className="pl-6 bg-input text-foreground border-primary/50 focus:shadow-[0_0_15px_rgba(0,255,255,0.5)]"
                    disabled={isAutoTrading}
                />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => openPosition('long')} className="w-full bg-green-500/20 hover:bg-green-500/40 text-green-300 border border-green-500 font-headline" disabled={isAutoTrading}>
                    <TrendingUp className="mr-2"/> Long/Buy
                </Button>
                <Button onClick={() => openPosition('short')} className="w-full bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500 font-headline" disabled={isAutoTrading}>
                    <TrendingDown className="mr-2"/> Short/Sell
                </Button>
            </div>
        </div>
      ) : (
        // Current Position
        <div className={cn(
            "p-3 rounded-lg space-y-3 border-2",
            position.type === 'long' ? "border-green-400 bg-green-900/30 shadow-[0_0_15px_theme(colors.green.400)]" : "border-red-500 bg-red-900/30 shadow-[0_0_15px_theme(colors.red.500)]"
        )}>
            <h4 className="font-headline text-center text-white text-lg">Active Position</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-white/90">
                <span>Symbol:</span><strong className="font-mono text-right">{position.symbol}</strong>
                <span>Type:</span><strong className={cn("font-mono text-right", position.type === 'long' ? 'text-green-300' : 'text-red-300')}>{position.type.toUpperCase()}</strong>
                <span>Size:</span><strong className="font-mono text-right">${position.size.toFixed(2)}</strong>
                <span>Entry Price:</span><strong className="font-mono text-right">${position.entryPrice.toFixed(4)}</strong>
                <span>Live Price:</span><strong className="font-mono text-right flex items-center justify-end gap-1"><Activity size={12} className="text-primary animate-pulse"/>${livePrice?.toFixed(4) || '...'}</strong>
            </div>
            <div className="text-center pt-2 space-y-1">
                <div className="text-xs text-foreground/70">Unrealized P&L</div>
                <div className={cn("text-3xl font-mono font-bold", pnlColor)} style={{textShadow: `0 0 10px currentColor`}}>
                    ${pnl.toFixed(2)}
                </div>
            </div>
            <Button onClick={() => closePosition()} className="w-full bg-accent/80 hover:bg-accent font-headline" disabled={isAutoTrading}>
                Close Position @ ${livePrice?.toFixed(4) || 'Market'}
            </Button>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="pt-2">
        <div className="flex justify-between items-center mb-2">
            <h4 className="font-headline text-lg text-primary/80 flex items-center gap-2"><BarChart2 size={18} /> Performance Metrics</h4>
            <Button variant="outline" size="sm" onClick={resetBalance} className="gap-1 text-xs border-primary/50">
                <RefreshCcw size={12}/> Reset Balance
            </Button>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm p-3 bg-black/40 rounded-md border border-primary/20">
            <div>Total Trades: <span className="font-mono font-bold float-right">{totalTrades}</span></div>
            <div>Win Rate: <span className="font-mono font-bold float-right text-primary">{winRate.toFixed(1)}%</span></div>
            <div className="text-green-400">Wins: <span className="font-mono font-bold float-right">{stats.wins}</span></div>
            <div className="text-red-400">Losses: <span className="font-mono font-bold float-right">{stats.losses}</span></div>
        </div>
      </div>

      {/* Trade History */}
      <div className="pt-2">
        <h4 className="font-headline text-lg text-primary/80 mb-2 flex items-center gap-2"><History size={18} /> Trade History</h4>
        <ScrollArea className="h-40 bg-black/40 rounded-md p-2 border border-primary/20">
            {tradeHistory.length === 0 ? (
                <p className="text-center text-sm text-foreground/50 italic py-4">No trades yet.</p>
            ) : (
                tradeHistory.map(trade => (
                    <div key={trade.id} className="text-xs p-2 mb-1 bg-secondary/30 rounded-sm">
                        <div className="flex justify-between font-bold">
                            <span>{trade.symbol} - {trade.type.toUpperCase()}</span>
                            <span className={trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                                {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between text-foreground/70">
                            <span>Entry: ${trade.entryPrice.toFixed(4)}</span>
                            <span>Exit: ${trade.exitPrice.toFixed(4)}</span>
                        </div>
                    </div>
                ))
            )}
        </ScrollArea>
      </div>

    </div>
  );
};

export default TradingSimulator;
