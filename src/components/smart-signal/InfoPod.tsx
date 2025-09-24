
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface InfoPodProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  valueClassName?: string;
  className?: string;
}

const InfoPod: React.FC<InfoPodProps> = ({ title, value, icon, valueClassName, className }) => {
  return (
    <div className={cn(
      "relative p-3 bg-black/40 rounded-lg border border-primary/20 overflow-hidden",
      "transition-all duration-300 hover:bg-primary/10 hover:shadow-[0_0_15px_hsl(var(--primary)_/_0.5)]",
      className
    )}>
      <div className="flex items-center gap-2">
        <div className="text-primary/80">{icon}</div>
        <h5 className="text-sm font-headline text-primary/80">{title}</h5>
      </div>
      <p className={cn("text-3xl font-mono font-bold text-right mt-1 text-white/90", valueClassName)}>
        {value}
      </p>
       <div className={cn("absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-10", valueClassName, valueClassName?.replace('text-', 'bg-'))}></div>
    </div>
  );
};

export default InfoPod;
