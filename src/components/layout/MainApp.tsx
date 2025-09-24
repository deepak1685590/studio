

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from '@/components/admin/AdminDashboard';
import SmartSignalWidget from '@/components/smart-signal/SmartSignalWidget';
import Chatbot from '@/components/chatbot/Chatbot';
import ProfileBar from './ProfileBar';
import LiveNewsWidget from '../news/LiveNewsWidget';
import { Button } from '../ui/button';
import { AreaChart, BrainCircuit, Gauge, Droplets, Sparkles, Wallet } from 'lucide-react';
import LiveClock from './LiveClock';
import MarketSessions from '../info/MarketSessions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdvancedStrengthDashboard from '../tools/AdvancedStrengthDashboard';
import SubspaceLiquidityMatrix from '../tools/SubspaceLiquidityMatrix';
import type { SignalData } from '@/types';
import EliteAiInsight from '../smart-signal/EliteAiInsight';
import OracleInsight from '../smart-signal/OracleInsight';
import type { GenerateAiInsightInput, OracleInsightInput } from '@/types';
import TradingSimulator from '../smart-signal/TradingSimulator';

interface MainAppProps {
  initialSymbol?: string;
}

const MainApp: React.FC<MainAppProps> = ({ initialSymbol = "BTC" }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const [signalData, setSignalData] = useState<SignalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [livePrice, setLivePrice] = useState<number | null>(null);


  useEffect(() => {
    // If the initialSymbol from props changes, update the state
    if (initialSymbol) {
      setSelectedSymbol(initialSymbol);
    }
  }, [initialSymbol]);

  const eliteAiInsightData: GenerateAiInsightInput | null = !isLoading && signalData ? {
    symbol: signalData.symbol,
    price: signalData.price,
    isBullish: signalData.isBullish,
    action: signalData.action,
    entry: parseFloat(signalData.entry),
    sl: parseFloat(signalData.sl),
    tp1: parseFloat(signalData.tp1),
    tp2: parseFloat(signalData.tp2),
    confluenceCount: signalData.confluenceCount,
    demandZone: `$${signalData.demandZone[0]} - ${signalData.demandZone[1]}`,
    fvg: `$${signalData.fvg[0]} - ${signalData.fvg[1]}`,
    volumeImbalance: signalData.volumeImbalance,
    multiTimeframeAnalysis: {
      '5m': signalData.multiTimeframeAnalysis['5m']?.trend || 'Neutral',
      '15m': signalData.multiTimeframeAnalysis['15m']?.trend || 'Neutral',
      '1H': signalData.multiTimeframeAnalysis['1H']?.trend || 'Neutral',
      '4H': signalData.multiTimeframeAnalysis['4H']?.trend || 'Neutral',
      'Daily': signalData.multiTimeframeAnalysis['Daily']?.trend || 'Neutral',
    },
    chartPatternName: signalData.chartPattern.name,
    trendStrength: signalData.trendStrength.score,
    momentum: signalData.momentum.score,
    marketSession: "New York", 
    volatilityRegime: "Medium", 
  } : null;

  const oracleInsightData: OracleInsightInput | null = !isLoading && signalData ? {
    symbol: signalData.symbol,
    price: signalData.price,
    isBullish: signalData.isBullish,
    volatility: signalData.trendStrength.score,
  } : null;


  return (
    <div className="p-4 pb-16">
      <ProfileBar />
      {user?.isAdmin && <AdminDashboard />}
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="quantum-engine" className="w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/50 border-2 border-primary/50 rounded-lg p-3 px-4 mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="quantum-engine" className="font-headline"><BrainCircuit size={16} className="mr-2"/><span className="hidden sm:inline">Quantum Engine</span><span className="sm:hidden">Quantum</span></TabsTrigger>
              <TabsTrigger value="strength-dashboard" className="font-headline"><Gauge size={16} className="mr-2"/><span className="hidden sm:inline">Strength Dashboard</span><span className="sm:hidden">Strength</span></TabsTrigger>
              <TabsTrigger value="trading-simulator" className="font-headline"><Wallet size={16} className="mr-2"/><span className="hidden sm:inline">Trading Simulator</span><span className="sm:hidden">Simulator</span></TabsTrigger>
              <TabsTrigger value="elite-ai" className="font-headline"><Sparkles size={16} className="mr-2"/><span className="hidden sm:inline">Elite AI</span><span className="sm:hidden">AI</span></TabsTrigger>
            </TabsList>
            <Button variant="ghost" size="sm" onClick={() => router.push('/scanner')} className="flex-shrink-0 w-full sm:w-auto">
                <AreaChart size={16} className="mr-2"/>
                <span className="hidden md:inline">Open Market Scanner</span>
                <span className="md:hidden">Scanner</span>
            </Button>
          </div>
          
          <TabsContent value="quantum-engine">
            <SmartSignalWidget 
              key={selectedSymbol} // Use key to force re-mount when symbol changes
              initialSymbol={selectedSymbol} 
              setSelectedSymbol={setSelectedSymbol} 
              onSignalDataChange={setSignalData}
              onLoadingChange={setIsLoading}
              signalData={signalData}
              onLivePriceChange={setLivePrice}
            />
          </TabsContent>
          
          <TabsContent value="strength-dashboard">
            <AdvancedStrengthDashboard 
               key={`adv-${selectedSymbol}`}
               initialSymbol={selectedSymbol}
               setSelectedSymbol={setSelectedSymbol}
            />
          </TabsContent>
          
          <TabsContent value="trading-simulator">
            {signalData && (
                <TradingSimulator
                    signalData={signalData}
                    livePrice={livePrice}
                />
            )}
            {!signalData && !isLoading && (
                 <div className="text-center p-8 bg-black/30 rounded-lg border border-primary/20">
                    <p className="font-headline text-primary">Please generate a signal in the Quantum Engine first to use the simulator.</p>
                </div>
            )}
             {isLoading && (
                 <div className="text-center p-8 bg-black/30 rounded-lg border border-primary/20">
                    <p className="font-headline text-primary animate-pulse">Loading Simulator...</p>
                </div>
            )}
          </TabsContent>

          <TabsContent value="elite-ai">
            <div className="p-4 bg-black/30 rounded-lg border border-primary/30 space-y-4 max-w-4xl mx-auto">
                {isLoading && <p className="text-center">Generating signal before AI analysis can be engaged...</p>}
                {!isLoading && !signalData && <p className="text-center text-destructive">Could not load signal data. AI analysis is unavailable.</p>}
                {!isLoading && signalData && eliteAiInsightData && (
                    <EliteAiInsight data={eliteAiInsightData} setSignalData={setSignalData} />
                )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <LiveClock />
            </div>
            <div className="lg:col-span-2">
                <MarketSessions />
            </div>
        </div>
      </div>
      <Chatbot />
      <LiveNewsWidget />
    </div>
  );
};

export default MainApp;
