/**
 * @fileOverview A mock service to simulate fetching general, high-impact financial market news.
 */

interface NewsItem {
  headline: string;
  impact: 'High' | 'Medium' | 'Low';
}

const newsTemplates: NewsItem[] = [
  { headline: "Federal Reserve unexpectedly announces a 25 basis point rate hike, citing persistent inflation concerns.", impact: 'High' },
  { headline: "Global supply chain disruptions ease as shipping costs fall to a 2-year low, boosting manufacturing stocks.", impact: 'Medium' },
  { headline: "Major tech CEO issues cautious outlook for the next quarter, causing a ripple effect across the NASDAQ.", impact: 'High' },
  { headline: "New unemployment data shows a surprising drop, suggesting a stronger labor market than analysts predicted.", impact: 'Medium' },
  { headline: "Geopolitical tensions in Eastern Europe escalate, leading to a spike in oil and gas prices.", impact: 'High' },
  { headline: "Cryptocurrency market sees a massive sell-off following rumors of stricter regulations in the US.", impact: 'High' },
  { headline: "Consumer Price Index (CPI) data comes in hotter than expected, fueling fears of further Fed tightening.", impact: 'High' },
  { headline: "Breakthrough in AI chip technology announced by NVIDIA, stock surges in after-hours trading.", impact: 'Medium' },
  { headline: "China's central bank cuts lending rates to stimulate its slowing real estate market.", impact: 'Medium' },
  { headline: "SEC approves the first-ever spot Bitcoin ETF, sending BTC prices soaring.", impact: 'High' },
  { headline: "OPEC+ agrees to deeper production cuts, crude oil prices jump 5%.", impact: 'Medium' },
  { headline: "Retail sales figures for the last month show a decline, hinting at weakening consumer demand.", impact: 'Low' },
];

/**
 * A mock function to get general market news.
 * In a real application, this would fetch data from a news API.
 *
 * @returns {Promise<NewsItem[]>} A promise that resolves to an array of news items.
 */
export const getGeneralMarketNews = async (): Promise<NewsItem[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Shuffle the templates and pick a few to return
  const shuffled = [...newsTemplates].sort(() => 0.5 - Math.random());
  const newsCount = Math.floor(Math.random() * 3) + 5; // 5 to 7 headlines
  
  return shuffled.slice(0, newsCount);
};
