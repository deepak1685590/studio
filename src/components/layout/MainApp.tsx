
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
import { AreaChart } from 'lucide-react';
import LiveClock from './LiveClock';
import MarketSessions from '../info/MarketSessions';

interface MainAppProps {
  initialSymbol?: string;
}

const MainApp: React.FC<MainAppProps> = ({ initialSymbol = "BTC" }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);

  useEffect(() => {
    // If the initialSymbol from props changes, update the state
    setSelectedSymbol(initialSymbol);
  }, [initialSymbol]);

  return (
    <div className="p-4 pb-16">
      <ProfileBar />
      {user?.isAdmin && <AdminDashboard />}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between bg-black/50 border-2 border-primary/50 rounded-lg p-3 px-4 mb-6">
            <div className="flex items-center gap-2">
                <h3 className="font-headline text-xl text-primary">Quantum Analysis Engine</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/scanner')}>
                <AreaChart size={16} className="mr-2"/>
                Open Market Scanner
            </Button>
        </div>
        <SmartSignalWidget 
          key={selectedSymbol} // Use key to force re-mount when symbol changes
          initialSymbol={selectedSymbol} 
          setSelectedSymbol={setSelectedSymbol} 
        />
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
