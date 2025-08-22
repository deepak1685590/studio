"use client";

import { useAuth } from "@/hooks/useAuth";
import LoginScreen from "@/components/auth/LoginScreen";
import MainApp from "@/components/layout/MainApp";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { user, loading, status, revocationReason } = useAuth();

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

  return <MainApp />;
}
