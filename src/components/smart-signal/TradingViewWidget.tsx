
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
    if (!containerNode || typeof window === 'undefined' || !(window as any).TradingView) {
        // If the script hasn't loaded yet, do nothing.
        // It will be re-triggered once the script is available.
        return;
    }
    
    // Clear the container on symbol or timeframe change
    containerNode.innerHTML = '';
    
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
        "container_id": containerNode.id
      });
    
  }, [symbol, timeframe]);

  useEffect(() => {
    const containerNode = container.current;
    if (!containerNode) return;
    containerNode.id = `tradingview_widget_container_${Math.random()}`;

    if (document.getElementById('tradingview-widget-script')) {
        if((window as any).TradingView) {
            // If script and widget object exist, force a re-render of the chart
            setTimeout(() => {
                const tvSymbol = getTradingViewSymbol(symbol);
                containerNode.innerHTML = ''; // Clear previous widget
                new (window as any).TradingView.widget({
                    "autosize": true, "symbol": tvSymbol, "interval": mapTimeframeToInterval(timeframe), "timezone": "Etc/UTC", "theme": "dark", "style": "1", "locale": "en", "enable_publishing": false, "hide_side_toolbar": false, "allow_symbol_change": true, "calendar": false, "support_host": "https://www.tradingview.com", "studies": ["TrendLines@tv-basicstudies", "PivotPointsHighLow@tv-basicstudies", "RelativeStrengthIndex@tv-basicstudies", "MACD@tv-basicstudies", "VolumeProfileVisibleRange@tv-basicstudies", "AutoFibRetracement@tv-basicstudies"], "chart_type": "heikin_ashi", "container_id": containerNode.id
                });
            }, 100);
        }
        return;
    }

    const script = document.createElement("script");
    script.id = 'tradingview-widget-script';
    script.src = "https://s3.tradingview.com/tv.js";
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => {
        if (containerNode) {
             const tvSymbol = getTradingViewSymbol(symbol);
             new (window as any).TradingView.widget({
                "autosize": true, "symbol": tvSymbol, "interval": mapTimeframeToInterval(timeframe), "timezone": "Etc/UTC", "theme": "dark", "style": "1", "locale": "en", "enable_publishing": false, "hide_side_toolbar": false, "allow_symbol_change": true, "calendar": false, "support_host": "https://www.tradingview.com", "studies": ["TrendLines@tv-basicstudies", "PivotPointsHighLow@tv-basicstudies", "RelativeStrengthIndex@tv-basicstudies", "MACD@tv-basicstudies", "VolumeProfileVisibleRange@tv-basicstudies", "AutoFibRetracement@tv-basicstudies"], "chart_type": "heikin_ashi", "container_id": containerNode.id
            });
        }
    };
    document.head.appendChild(script);

    scriptRef.current = script;

  }, []); // Run only once to load the script

  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
    </div>
  );
}

export default memo(TradingViewWidget);
