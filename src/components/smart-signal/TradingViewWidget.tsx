
"use client";

import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol }) => {
  const container = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    const containerNode = container.current;
    if (!containerNode) return;

    // Clear the container on symbol change
    containerNode.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
        "autosize": true,
        "symbol": `BINANCE:${symbol.toUpperCase()}USDT`,
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "calendar": false,
        "support_host": "https://www.tradingview.com",
        "studies": [
          "TrendLines@tv-basicstudies",
          "PivotPointsHighLow@tv-basicstudies"
        ]
      });
    
    containerNode.appendChild(script);
    scriptRef.current = script;

    // Cleanup function to remove the script when the component unmounts or symbol changes
    return () => {
      if (scriptRef.current && containerNode) {
        try {
            containerNode.removeChild(scriptRef.current);
            scriptRef.current = null;
        } catch (error) {
            // This might fail if the container is already gone, which is fine.
        }
      }
    };
  }, [symbol]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
    </div>
  );
}

export default memo(TradingViewWidget);
