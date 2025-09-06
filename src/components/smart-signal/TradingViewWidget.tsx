
"use client";

import React, { useEffect, useRef, memo } from 'react';
import { Timeframe } from '@/types';

interface TradingViewWidgetProps {
  symbol: string;
  timeframe: Timeframe;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol, timeframe }) => {
  const container = useRef<HTMLDivElement>(null);
  const isScriptReady = useRef(false);

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

  const createWidget = () => {
    if (!container.current || !(window as any).TradingView) {
      return;
    }

    container.current.innerHTML = '';
    const tvSymbol = getTradingViewSymbol(symbol);

    new (window as any).TradingView.widget({
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
        "chart_type": "heikin_ashi",
        "container_id": container.current.id
      });
  };
  
  useEffect(() => {
    if (isScriptReady.current) {
        createWidget();
    }
  }, [symbol, timeframe]);

  useEffect(() => {
    if (document.getElementById('tradingview-widget-script')) {
        isScriptReady.current = true;
        createWidget();
        return;
    }

    const script = document.createElement("script");
    script.id = 'tradingview-widget-script';
    script.src = "https://s3.tradingview.com/tv.js";
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => {
        isScriptReady.current = true;
        createWidget();
    };
    document.head.appendChild(script);

  }, []);

  return (
    <div 
      className="tradingview-widget-container h-full w-full" 
      ref={container} 
      id={`tradingview_widget_container_${Math.random()}`}
    >
    </div>
  );
}

export default memo(TradingViewWidget);
