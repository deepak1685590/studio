
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
import { ArrowLeft, AreaChart, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ErrorLogTool from '@/components/tools/ErrorLogTool';

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
        <div className="flex items-center justify-end bg-black/50 border-2 border-primary/50 rounded-lg p-3 px-4 mb-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
                <ArrowLeft size={16} className="mr-2"/>
                Back to Dashboard
            </Button>
        </div>
        
        <Tabs defaultValue="market-scanner" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="market-scanner" className="font-headline"><AreaChart size={16} className="mr-2"/>Market Scanner</TabsTrigger>
                <TabsTrigger value="ai-tools" className="font-headline"><Bug size={16} className="mr-2"/>AI Tools</TabsTrigger>
            </TabsList>
            <TabsContent value="market-scanner">
                <MarketScanner onSelectSymbol={handleSelectSymbol} />
            </TabsContent>
            <TabsContent value="ai-tools">
                <ErrorLogTool />
            </TabsContent>
        </Tabs>
        
      </div>
      <Chatbot />
      <LiveNewsWidget />
    </div>
  );
}
