
"use client";

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from '@/components/admin/AdminDashboard';
import SmartSignalWidget from '@/components/smart-signal/SmartSignalWidget';
import Chatbot from '@/components/chatbot/Chatbot';
import ProfileBar from './ProfileBar';
import LiveNewsWidget from '../news/LiveNewsWidget';

const MainApp = () => {
  const { user } = useAuth();

  return (
    <div className="p-4 pb-16">
      <ProfileBar />
      {user?.isAdmin && <AdminDashboard />}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-3">
            <SmartSignalWidget initialSymbol="BTC" />
        </div>
      </div>
      <Chatbot />
      <LiveNewsWidget />
    </div>
  );
};

export default MainApp;
