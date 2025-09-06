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
    script.src = "https://s3.tradingview.com/tv.js";
    script.type = "text/javascript";
    script.async = true;
    
    script.onload = () => {
      if (container.current && 'TradingView' in window && typeof window.TradingView.widget === 'function') {
        new (window as any).TradingView.widget({
          "autosize": true,
          "symbol": `BINANCE:${symbol.toUpperCase()}USDT`,
          "interval": "15",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#f1f3f6",
          "enable_publishing": false,
          "hide_side_toolbar": false,
          "allow_symbol_change": true,
          "details": true,
          "hotlist": true,
          "calendar": true,
          "studies": [
            "TrendLines@tv-basicstudies",
            "PivotPointsHighLow@tv-basicstudies",
            "RelativeStrengthIndex@tv-basicstudies",
            "MACD@tv-basicstudies",
            "VolumeProfileVisibleRange@tv-basicstudies",
            "AutoFibRetracement@tv-basicstudies"
          ],
          "chart_type": "heikin_ashi",
          "container_id": `tradingview_widget_container_${container.current.id}`
        });
      }
    };
    
    // Give the container a unique ID for the widget to target
    container.current.id = `tradingview_container_${Math.random().toString(36).substr(2, 9)}`;

    const widgetContainer = document.createElement('div');
    widgetContainer.id = `tradingview_widget_container_${container.current.id}`;
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";
    container.current.appendChild(widgetContainer);
    
    container.current.appendChild(script);

  }, [symbol]);

  return (
    <div 
      className="tradingview-widget-container" 
      ref={container} 
      style={{ height: "100%", width: "100%" }}
    >
    </div>
  );
}

export default memo(TradingViewMiniChart);
