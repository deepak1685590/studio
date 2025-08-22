"use client";

import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from '@/components/admin/AdminDashboard';
import SmartSignalWidget from '@/components/smart-signal/SmartSignalWidget';
import Chatbot from '@/components/chatbot/Chatbot';
import ProfileBar from './ProfileBar';

const MainApp = () => {
  const { user } = useAuth();

  return (
    <div className="p-4">
      <ProfileBar />
      {user?.isAdmin && <AdminDashboard />}
      <SmartSignalWidget />
      <Chatbot />
    </div>
  );
};

export default MainApp;
