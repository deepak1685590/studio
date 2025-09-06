
"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface TrendRibbonProps {
  isBullish: boolean;
  symbol: string;
}

const TrendRibbon: React.FC<TrendRibbonProps> = ({ isBullish, symbol }) => {
  const trendText = isBullish ? "▲ BULLISH MOMENTUM" : "▼ BEARISH MOMENTUM";
  const fullText = `${symbol} ${trendText} `.repeat(10);

  return (
    <div
      className={cn(
        "w-full overflow-hidden h-10 flex items-center text-lg font-headline border-y-2",
        isBullish
          ? "bg-green-500/10 border-green-400 text-green-300"
          : "bg-red-500/10 border-red-500 text-red-300"
      )}
    >
      <div className="whitespace-nowrap animate-marquee">
        {fullText}
      </div>
    </div>
  );
};

export default TrendRibbon;
