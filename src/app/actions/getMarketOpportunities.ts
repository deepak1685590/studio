'use server';

/**
 * @fileOverview A server action to simulate fetching live market trading opportunities.
 */

export interface Opportunity {
  symbol: string;
  market: 'Crypto' | 'Forex' | 'Commodity';
  type: 'Bullish Breakout' | 'Bearish Reversal' | 'Range Expansion' | 'Volume Spike';
  conviction: number;
  keyLevel: string;
  timeframe: '5m' | '15m' | '1H' | '4H' | '1D';
}

const cryptoAssets = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD', 'DOGE/USD', 'ADA/USD', 'AVAX/USD', 'LINK/USD'];
const forexAssets = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'GBP/JPY'];
const opportunityTypes: Opportunity['type'][] = ['Bullish Breakout', 'Bearish Reversal', 'Range Expansion', 'Volume Spike'];
const timeframes: Opportunity['timeframe'][] = ['5m', '15m', '1H', '4H'];

// Simple pseudo-random generator to make the mock data deterministic for a short period.
const pseudoRandom = (seed: number) => {
  let t = seed + 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

/**
 * Simulates a live market scanner to generate a list of trading opportunities.
 * @returns {Promise<Opportunity[]>} A promise that resolves to an array of opportunities.
 */
export const getMarketOpportunities = async (): Promise<Opportunity[]> => {
  const opportunities: Opportunity[] = [];
  const assetPool = [...cryptoAssets, ...forexAssets];
  
  // Use a time-based seed that changes every minute to simulate live updates
  const seed = Math.floor(Date.now() / (1000 * 60));

  const numOpportunities = 6;
  const usedIndices = new Set<number>();

  for (let i = 0; i < numOpportunities; i++) {
    let assetIndex;
    // Ensure we don't pick the same asset twice
    do {
      assetIndex = Math.floor(pseudoRandom(seed + i * 10) * assetPool.length);
    } while (usedIndices.has(assetIndex));
    usedIndices.add(assetIndex);

    const symbol = assetPool[assetIndex];
    const market = cryptoAssets.includes(symbol) ? 'Crypto' : 'Forex';
    const type = opportunityTypes[Math.floor(pseudoRandom(seed + i) * opportunityTypes.length)];
    const timeframe = timeframes[Math.floor(pseudoRandom(seed + i * 2) * timeframes.length)];
    const conviction = Math.floor(pseudoRandom(seed + i * 3) * 25) + 75; // 75-99
    
    let keyLevel = '';
    const pricePoint = market === 'Forex' 
      ? (pseudoRandom(seed + i * 4) * 1.5 + 0.8).toFixed(4) 
      : (pseudoRandom(seed + i * 5) * 60000 + 100).toFixed(2);
      
    switch (type) {
      case 'Bullish Breakout': keyLevel = `> ${pricePoint}`; break;
      case 'Bearish Reversal': keyLevel = `< ${pricePoint}`; break;
      case 'Range Expansion': 
        const lower = (parseFloat(pricePoint) * 0.98).toFixed(market === 'Forex' ? 4 : 2);
        keyLevel = `${lower}-${pricePoint}`; 
        break;
      case 'Volume Spike': keyLevel = `Vol > ${(pseudoRandom(seed + i * 6) * 1000 + 500).toFixed(0)}k`; break;
    }

    opportunities.push({
      symbol,
      market,
      type,
      conviction,
      keyLevel,
      timeframe,
    });
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 750));

  return opportunities.sort((a, b) => b.conviction - a.conviction);
};
