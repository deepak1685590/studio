"use client";

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, LineStyle, IChartApi, ISeriesApi } from 'lightweight-charts';
import { useTheme } from '@/contexts/ThemeContext';
import type { Timeframe } from '@/types';

interface TradingViewWidgetProps {
  symbol: string;
  timeframe: Timeframe;
}

const heikinAshi = (data: any[]) => {
  const heikinAshiData = [];
  if (data.length === 0) return [];

  let prevHaOpen = (data[0].open + data[0].close) / 2;
  let prevHaClose = (data[0].open + data[0].high + data[0].low + data[0].close) / 4;

  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const haClose = (d.open + d.high + d.low + d.close) / 4;
    const haOpen = i === 0 ? prevHaOpen : (prevHaOpen + prevHaClose) / 2;
    const haHigh = Math.max(d.high, haOpen, haClose);
    const haLow = Math.min(d.low, haOpen, haClose);
    
    const haCandle = {
      time: d.time,
      open: haOpen,
      high: haHigh,
      low: haLow,
      close: haClose
    };
    
    heikinAshiData.push(haCandle);
    prevHaOpen = haOpen;
    prevHaClose = haClose;
  }
  return heikinAshiData;
};


const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol, timeframe }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const { theme } = useTheme();

  const getThemeColors = () => {
    if (typeof window === 'undefined') {
      return {
        background: '#000000',
        textColor: '#FFFFFF',
        gridColor: 'rgba(255, 255, 255, 0.1)',
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderUpColor: '#26a69a',
        borderDownColor: '#ef5350',
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      };
    }
    const computedStyle = getComputedStyle(document.documentElement);
    
    // Helper function to format HSL values correctly for the library
    const formatHsl = (value: string) => `hsl(${value.trim().replace(/ /g, ', ')})`;
    
    const primaryHsl = computedStyle.getPropertyValue('--primary').trim();

    return {
      background: formatHsl(computedStyle.getPropertyValue('--background')),
      textColor: formatHsl(computedStyle.getPropertyValue('--foreground')),
      gridColor: `hsla(${primaryHsl.replace(/ /g, ', ')}, 0.2)`,
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderUpColor: '#26a69a',
      borderDownColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    };
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const colors = getThemeColors();
    
    const chartOptions = {
      layout: {
        background: { type: ColorType.Solid, color: colors.background },
        textColor: colors.textColor,
      },
      grid: {
        vertLines: { color: colors.gridColor, style: LineStyle.Dotted },
        horzLines: { color: colors.gridColor, style: LineStyle.Dotted },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    };

    if (!chartRef.current) {
        chartRef.current = createChart(chartContainerRef.current, chartOptions);
        seriesRef.current = chartRef.current.addCandlestickSeries({
            upColor: colors.upColor,
            downColor: colors.downColor,
            borderUpColor: colors.borderUpColor,
            borderDownColor: colors.borderDownColor,
            wickUpColor: colors.wickUpColor,
            wickDownColor: colors.wickDownColor,
        });
    } else {
        chartRef.current.applyOptions(chartOptions);
        seriesRef.current?.applyOptions({
            upColor: colors.upColor,
            downColor: colors.downColor,
            borderUpColor: colors.borderUpColor,
            borderDownColor: colors.borderDownColor,
            wickUpColor: colors.wickUpColor,
            wickDownColor: colors.wickDownColor,
        });
    }

    const timeframeMap: Record<Timeframe, string> = {
      '5m': '5m',
      '15m': '15m',
      '1H': '1h',
      '4H': '4h',
      '1d': '1d',
    };
    const interval = timeframeMap[timeframe as keyof typeof timeframeMap] || '15m';
    const fetchUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}USDT&interval=${interval}&limit=200`;

    fetch(fetchUrl)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const parsedData = data.map(d => ({
          time: d[0] / 1000,
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
        }));
        const haData = heikinAshi(parsedData);
        seriesRef.current?.setData(haData);
      })
      .catch(err => console.error(err));
      
    const handleResize = () => {
      chartRef.current?.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
    };

  }, [symbol, timeframe, theme]);


  return <div ref={chartContainerRef} className="h-96 w-full" />;
};

export default TradingViewWidget;
