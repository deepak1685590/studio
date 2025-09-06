
"use client";

import { cn } from "@/lib/utils";
import React from "react";

export const NeonBullIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 200 120"
        className={cn("animate-neon-glow", props.className)}
        style={{ filter: 'drop-shadow(0 0 10px currentColor) drop-shadow(0 0 25px currentColor)' }}
        {...props}
    >
        <path d="M66.3,92.8c-10.3,0-20.9-1.9-28.9-8.7c-4.3-3.6-9.1-8.9-12.7-16.5c-4-8.2-5.4-16.1-5.4-16.1s4.5,7.1,10.6,13.2
        c5.7,5.8,11.8,9.4,20.4,9.4c10.3,0,16-5.4,16-5.4s-3.7,8.2-11,11.9C51.5,91.8,47.8,92.8,44.9,92.8h-3.5
        c-10.4,0-19.1-3.6-26.6-10.4C2.5,73.1,1.1,58,1.1,58s2.8,11.3,13.7,18.5c7.9,5.1,16.5,7.7,26.5,7.7h2.8
        c11.3,0,21.1-3.6,28.6-10.1c6.5-5.6,11.5-13.4,15-22.9c3.1-8.5,4.6-16.8,4.6-16.8s-3.1,20.6-17.3,31.7
        C85.4,89.5,76.1,92.8,66.3,92.8z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M129.5,30.3c0,11.3-9.1,20.4-20.4,20.4s-20.4-9.1-20.4-20.4S98.2,9.9,109.1,9.9S129.5,19.1,129.5,30.3z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M109.1,50.7c-22.1,0-43.2-4.1-59-12c-4.9-2.5-12.3-7.2-17.6-14.3c-1-1.3-1.9-2.7-2.8-4.2C21.3,7.3,27.1,1,27.1,1
        s18.2,14,39.6,23.3c15.7,6.8,32.3,10.1,49.9,10.1c11,0,21.5-1.5,30.9-4.2c16.3-4.6,29.9-12.7,29.9-12.7s-1,25-24.3,39.6
        c-9.1,5.7-20.1,8.9-32.3,8.9C115.8,66.1,112.5,65.8,109.1,65.3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
