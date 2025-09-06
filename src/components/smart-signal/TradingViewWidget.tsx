
"use client";

import React, { useEffect, useRef, memo } from 'react';
import { Timeframe } from '@/types';

interface TradingViewWidgetProps {
  symbol: string;
  timeframe: Timeframe;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol, timeframe }) => {
  const container = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  const mapTimeframeToInterval = (tf: Timeframe): string => {
    switch (tf) {
      case '5m': return '5';
      case '15m': return '15';
      case '1h': return '60';
      case '4h': return '240';
      case '1d': return 'D';
      default: return '15';
    }
  };

  const getTradingViewSymbol = (rawSymbol: string): string => {
    const upperSymbol = rawSymbol.toUpperCase();
    
    // Forex
    if (upperSymbol.includes('/')) {
      return `OANDA:${upperSymbol.replace('/', '')}`;
    }
    
    // Indian Indices
    const indianIndices: { [key: string]: string } = {
      'NIFTY': 'NSE:NIFTY',
      'BANKNIFTY': 'NSE:BANKNIFTY',
      'GIFTNIFTY': 'SGX:IN1!', // Gift Nifty on SGX
    };
    if (indianIndices[upperSymbol]) {
      return indianIndices[upperSymbol];
    }
    
    // Default to Crypto
    return `BINANCE:${upperSymbol}USDT`;
  };

  useEffect(() => {
    const containerNode = container.current;
    if (!containerNode) return;

    // Clear the container on symbol or timeframe change
    containerNode.innerHTML = '';
    
    const tvSymbol = getTradingViewSymbol(symbol);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
        "autosize": true,
        "symbol": tvSymbol,
        "interval": mapTimeframeToInterval(timeframe),
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
          "PivotPointsHighLow@tv-basicstudies",
          "RelativeStrengthIndex@tv-basicstudies",
          "MACD@tv-basicstudies",
          "VolumeProfileVisibleRange@tv-basicstudies",
          "AutoFibRetracement@tv-basicstudies"
        ],
        "chart_type": "heikin_ashi"
      });
    
    containerNode.appendChild(script);
    scriptRef.current = script;

    // Cleanup function to remove the script when the component unmounts or props change
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
  }, [symbol, timeframe]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
    </div>
  );
}

export default memo(TradingViewWidget);
