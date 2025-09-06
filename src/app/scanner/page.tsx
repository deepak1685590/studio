"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MarketScanner from '@/components/scanner/MarketScanner';
import ProfileBar from '@/components/layout/ProfileBar';
import Chatbot from '@/components/chatbot/Chatbot';
import LiveNewsWidget from '@/components/news/LiveNewsWidget';
import { useAuth } from '@/hooks/useAuth';
import LoginScreen from '@/components/auth/LoginScreen';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ScannerPage() {
  const router = useRouter();
  const { user, loading, status, revocationReason } = useAuth();

  const handleSelectSymbol = (symbol: string) => {
    // Redirect back to the main page with the selected symbol as a query parameter
    router.push(`/?symbol=${symbol}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-full max-w-md p-8 space-y-4">
          <Skeleton className="h-10 w-3/4 mx-auto" />
          <Skeleton className="h-8 w-1/2 mx-auto" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen initialStatus={status} revocationReason={revocationReason} />;
  }

  return (
    <div className="p-4 pb-16">
      <ProfileBar />
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between bg-black/50 border-2 border-primary/50 rounded-lg p-3 px-4 mb-4">
            <div className="flex items-center gap-2">
                <AreaChart className="text-primary" />
                <h3 className="font-headline text-xl text-primary">Market Scanner</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                <ArrowLeft size={16} className="mr-2"/>
                Back to Dashboard
            </Button>
        </div>
        <MarketScanner onSelectSymbol={handleSelectSymbol} />
      </div>
      <Chatbot />
      <LiveNewsWidget />
    </div>
  );
}
