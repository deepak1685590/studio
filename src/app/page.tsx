
"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from 'next/navigation';

// Dynamically import components to split the code and improve initial load time.
// The main app bundle won't be loaded until the user is logged in.
const MainApp = dynamic(() => import('@/components/layout/MainApp'), {
  loading: () => <AppSkeleton />,
});

const LoginScreen = dynamic(() => import('@/components/auth/LoginScreen'), {
  loading: () => <LoginSkeleton />,
});

const LoginSkeleton = () => (
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

const AppSkeleton = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="w-full max-w-7xl p-4 space-y-6">
       <Skeleton className="h-16 w-full max-w-5xl mx-auto" />
       <Skeleton className="h-64 w-full" />
       <Skeleton className="h-48 w-full" />
    </div>
  </div>
);


function HomePageContent() {
  const { user, loading, status, revocationReason } = useAuth();
  const searchParams = useSearchParams();
  const symbolFromScanner = searchParams.get('symbol');

  if (loading) {
    return <AppSkeleton />;
  }

  if (!user) {
    return <LoginScreen initialStatus={status} revocationReason={revocationReason} />;
  }

  return <MainApp initialSymbol={symbolFromScanner || undefined} />;
}

export default function Home() {
  return (
    // Suspense boundary for useSearchParams and dynamic components
    <React.Suspense fallback={<AppSkeleton />}>
      <HomePageContent />
    </React.Suspense>
  );
}
