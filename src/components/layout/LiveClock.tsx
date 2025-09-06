
"use client";

import React, { useState, useEffect } from 'react';
import { Clock, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const LiveClock = () => {
  const [time, setTime] = useState('');
  const [session, setSession] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // IST is UTC+5:30
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istTime = new Date(now.getTime() + istOffset);
      
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'UTC' // We've already calculated the offset
      };
      setTime(istTime.toLocaleTimeString('en-US', options));

      // Determine current session based on UTC time
      const utcHour = now.getUTCHours();
      const utcDay = now.getUTCDay(); // Sunday = 0, Saturday = 6

      let currentSession = 'CRYPTO 24/7';
      let forexSession = 'MARKET CLOSED';

      // Forex is open from Sunday 22:00 UTC to Friday 22:00 UTC
      const isForexOpen = !(utcDay === 6 || (utcDay === 5 && utcHour >= 22) || (utcDay === 0 && utcHour < 22));

      if (isForexOpen) {
        // Overlaps are key
        if (utcHour >= 13 && utcHour < 17) {
            forexSession = 'LONDON / NEW YORK';
        } else if (utcHour >= 8 && utcHour < 9) {
            forexSession = 'LONDON / TOKYO';
        } else if (utcHour >= 0 && utcHour < 7) {
            forexSession = 'SYDNEY / TOKYO';
        }
        // Single sessions
        else if (utcHour >= 8 && utcHour < 13) {
            forexSession = 'LONDON';
        } else if (utcHour >= 17 && utcHour < 22) {
            forexSession = 'NEW YORK';
        } else if (utcHour >= 9 && utcHour < 12) {
             // Quiet period between Tokyo close and London open
            forexSession = 'QUIET PERIOD';
        }
        else { // Default to active sessions within the time ranges
            if (utcHour >= 22 || utcHour < 7) forexSession = 'SYDNEY';
            if (utcHour >= 0 && utcHour < 9) forexSession = 'TOKYO';
            if (utcHour >= 8 && utcHour < 17) forexSession = 'LONDON';
            if (utcHour >= 13 && utcHour < 22) forexSession = 'NEW YORK';
        }
      }
      
      currentSession = `${forexSession} | ${currentSession}`;
      setSession(currentSession);
    };

    updateClock();
    const timerId = setInterval(updateClock, 1000);

    return () => clearInterval(timerId);
  }, []);
  
  const isOverlap = session.includes('/');
  const isClosed = session.includes('CLOSED');
  
  const sessionColorClass = isClosed ? 'text-red-500' : isOverlap ? 'text-amber-400' : 'text-primary';
  const sessionShadowClass = isClosed ? 'shadow-red-500/50' : isOverlap ? 'shadow-amber-400/50' : 'shadow-primary/50';

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-black/50 border-2 border-primary/50 rounded-lg text-center shadow-[0_0_25px_rgba(0,230,230,0.5)]">
        <h3 className="font-headline text-xl text-primary mb-2 flex items-center gap-2">
            <Clock size={20} />
            Live IST Time
        </h3>
        <div 
            className="font-headline text-6xl text-primary animate-flicker"
            style={{ textShadow: '0 0 5px var(--primary), 0 0 15px var(--primary)' }}
        >
            {time.split(' ')[0]}
        </div>
        <div className="font-code text-2xl text-primary/80 mb-4">
            {time.split(' ')[1]} (GMT+5:30)
        </div>
        
        <div className="w-full pt-4 border-t-2 border-dashed border-primary/20">
             <h4 className="font-headline text-sm text-primary/80 flex items-center justify-center gap-2 mb-1">
                <Globe size={16} /> Live Sessions
            </h4>
            <div 
                className={cn(
                    "font-headline text-lg transition-all duration-500",
                    sessionColorClass
                )}
                style={{textShadow: `0 0 10px currentColor`}}
            >
                {session}
            </div>
        </div>
    </div>
  );
};

export default LiveClock;
