/**
 * @fileOverview A mock service to simulate fetching market news.
 */

// A list of bullish headline templates.
const bullishHeadlines = [
  '{SYMBOL} breaks key resistance level; analysts predict further upside.',
  'Positive regulatory news boosts investor confidence in {SYMBOL}.',
  'Institutional adoption of {SYMBOL} surges, signaling strong market trust.',
  'Major partnership announced for {SYMBOL}, expected to drive significant growth.',
  'Whale activity shows massive accumulation of {SYMBOL} at current prices.',
];

// A list of bearish headline templates.
const bearishHeadlines = [
  '{SYMBOL} faces selling pressure as macroeconomic fears loom.',
  'Technical indicators suggest a potential downturn for {SYMBOL} in the short term.',
  'Security concerns raised after a minor vulnerability was reported for {SYMBOL} network.',
  '{SYMBOL} struggles to maintain support as trading volume declines.',
  'Analysts downgrade {SYMBOL} citing increased competition and market saturation.',
];

/**
 * A mock function to get market news for a given symbol.
 * In a real application, this would fetch data from a news API.
 *
 * @param {string} symbol The asset symbol (e.g., BTC, ETH).
 * @returns {Promise<string[]>} A promise that resolves to an array of news headlines.
 */
export const getMarketNews = async (symbol: string): Promise<string[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const headlines: string[] = [];
  const headlineCount = Math.floor(Math.random() * 3) + 2; // 2 to 4 headlines

  // 70% chance of news matching the general market trend, 30% chance of being mixed.
  const isCoherent = Math.random() < 0.7;
  const useBullish = Math.random() < 0.5;

  for (let i = 0; i < headlineCount; i++) {
    let headline: string;
    if (isCoherent) {
      headline = useBullish ? bullishHeadlines[i % bullishHeadlines.length] : bearishHeadlines[i % bearishHeadlines.length];
    } else {
      // Mix of bullish and bearish news
      headline = Math.random() < 0.5 ? bullishHeadlines[i % bullishHeadlines.length] : bearishHeadlines[i % bearishHeadlines.length];
    }
    headlines.push(headline.replace(/{SYMBOL}/g, symbol.toUpperCase()));
  }

  return headlines;
};
