
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from '@/components/admin/AdminDashboard';
import SmartSignalWidget from '@/components/smart-signal/SmartSignalWidget';
import Chatbot from '@/components/chatbot/Chatbot';
import ProfileBar from './ProfileBar';
import LiveNewsWidget from '../news/LiveNewsWidget';
import MarketScanner from '../scanner/MarketScanner';
import { Button } from '../ui/button';
import { AreaChart } from 'lucide-react';

const MainApp = () => {
  const { user } = useAuth();
  const [selectedSymbol, setSelectedSymbol] = useState("BTC");

  return (
    <div className="p-4 pb-16">
      <ProfileBar />
      {user?.isAdmin && <AdminDashboard />}
      <div className="max-w-7xl mx-auto">
        <MarketScanner onSelectSymbol={setSelectedSymbol} />
        <SmartSignalWidget 
          key={selectedSymbol} // Use key to force re-mount when symbol changes
          initialSymbol={selectedSymbol} 
          setSelectedSymbol={setSelectedSymbol} 
        />
      </div>
      <Chatbot />
      <LiveNewsWidget />
    </div>
  );
};

export default MainApp;
