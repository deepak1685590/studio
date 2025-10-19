
"use client";

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const SignalCardSkeleton = () => {
  return (
    <div className="mt-5 p-5 bg-black/70 border-2 border-primary/50 rounded-xl shadow-[0_0_20px_hsl(var(--primary)_/_0.3)] space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-primary/30">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div>
              <Skeleton className="h-7 w-24 mb-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="p-4 bg-black/30 rounded-lg border border-accent/50 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="p-4 bg-black/30 rounded-lg border border-accent/50">
             <Skeleton className="h-6 w-1/2 mb-3" />
             <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
             </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
           <div className="p-4 bg-black/30 rounded-lg border border-accent/50">
                <Skeleton className="h-6 w-3/4 mb-3" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            </div>
             <div className="p-4 bg-black/30 rounded-lg border border-accent/50">
                <Skeleton className="h-16 w-full" />
            </div>
        </div>
      </div>

       {/* Full-width blocks */}
      <div className="p-4 bg-black/30 rounded-lg border border-accent/50">
        <Skeleton className="h-6 w-1/3 mb-3" />
        <Skeleton className="h-24 w-full" />
      </div>

       <div className="p-4 bg-black/30 rounded-lg border border-accent/50">
        <Skeleton className="h-6 w-1/3 mb-3" />
        <Skeleton className="h-32 w-full" />
      </div>

    </div>
  );
};

export default SignalCardSkeleton;
