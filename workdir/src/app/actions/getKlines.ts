
'use server';

/**
 * @fileOverview A server action to fetch kline (candlestick) data from the Binance API.
 * This runs on the server to avoid client-side CORS issues.
 */

import type { Timeframe } from '@/types';

const timeframeToInterval = {
  '5m': '5m',
  '15m': '15m',
  '1h': '1h',
  '4h': '4h',
  '1d': '1d',
};

export const getKlines = async (symbol: string, timeframe: Timeframe): Promise<any[]> => {
  const apiInterval = timeframeToInterval[timeframe] || '15m';
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${apiInterval}&limit=200`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 } // Cache for 1 minute
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Binance API error for ${symbol}:`, errorData);
      throw new Error(`Failed to fetch klines for ${symbol}. Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching klines for ${symbol}:`, error);
    // Re-throw the error so the calling function knows the request failed
    // and can fall back to mock data if needed.
    throw error;
  }
};
