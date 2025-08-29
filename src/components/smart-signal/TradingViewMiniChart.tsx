"use client";

import React, { useEffect, useRef, memo } from 'react';

interface TradingViewMiniChartProps {
  symbol: string;
}

const TradingViewMiniChart: React.FC<TradingViewMiniChartProps> = ({ symbol }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear the container on symbol change
    container.current.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    
    const widgetConfig = {
      "symbol": `BINANCE:${symbol.toUpperCase()}USDT`,
      "width": "100%",
      "height": "100%",
      "locale": "en",
      "dateRange": "12M",
      "colorTheme": "dark",
      "isTransparent": true,
      "autosize": true,
      "largeChartUrl": ""
    };

    script.innerHTML = JSON.stringify(widgetConfig);
    
    container.current.appendChild(script);

  }, [symbol]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
    </div>
  );
}

export default memo(TradingViewMiniChart);
