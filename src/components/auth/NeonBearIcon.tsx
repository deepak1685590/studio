
"use client";

import { cn } from "@/lib/utils";
import React from "react";

export const NeonBearIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 200 120"
        className={cn("animate-neon-glow", props.className)}
        style={{ filter: 'drop-shadow(0 0 10px currentColor) drop-shadow(0 0 25px currentColor)' }}
        {...props}
    >
        <path d="M136.6,88.7c-2.4,1.8-13.8,6.1-20.6,6.1c-14.4,0-23-10.4-23-10.4s8.1,7.8,17.4,11.3c8.9,3.3,18.4,2.9,18.4,2.9
        s-14.7-1.1-25.1-10c-8.9-7.8-12.6-17.4-12.6-17.4s6.9,8.5,21.3,13.6c11.9,4.2,22.3,1.5,22.3,1.5s-13-5.2-19.1-13.9
        c-5.5-7.8-5.5-15.6-5.5-15.6s10.3,5.1,19.5,5.1c7.2,0,15.6-2.6,15.6-2.6s-3.7,5.5-11,9.3c-5.1,2.7-10.7,4.4-16.7,4.4
        c-10.3,0-18.7-3.3-18.7-3.3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M180.8,55.9c-2.8,4.7-11.2,12.3-21,15.3c-11.3,3.5-22.9,2.8-32.7,0.3c-13.3-3.4-25.1-10.7-32.4-18.7
        c-6.8-7.4-10.6-15.6-12-21.6c-0.6-2.5-0.9-4.8-0.9-6.4c0-11.8,7.5-22.6,7.5-22.6s11.5,1.5,18.1,7.2c5.2,4.5,9.2,9.8,12.3,15.3
        c3.5,6.1,5.6,12,7.2,16.7c3.1,9.4,7.8,13,7.8,13s1.9-10.9-3.2-19.8c-3.1-5.5-7.7-9.7-12.3-12.3c-7.2-4-13.8-4.8-13.8-4.8
        s2.8,15,16,23.3c7.5,4.7,15.6,7.2,23.6,7.2c12,0,22.2-4.1,29.1-11.3c4.7-5,7.5-11,8.1-14.1c1.2-6.1-1.3-12.9-1.3-12.9
        s14.4,14.7,15.7,24.8C183.1,49.1,182.7,52.8,180.8,55.9z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M136.9,26.6c0,5-4.1,9.1-9.1,9.1s-9.1-4.1-9.1-9.1s4.1-9.1,9.1-9.1S136.9,21.6,136.9,26.6z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
