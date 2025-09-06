
"use client";

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const LiveClock = () => {
  const [time, setTime] = useState('');

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
    };

    updateClock();
    const timerId = setInterval(updateClock, 1000);

    return () => clearInterval(timerId);
  }, []);

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
        <div className="font-code text-2xl text-primary/80">
            {time.split(' ')[1]} (GMT+5:30)
        </div>
    </div>
  );
};

export default LiveClock;
