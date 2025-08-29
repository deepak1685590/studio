/**
 * @fileOverview A service to fetch general, high-impact financial market news from a live API.
 */

import { NEWS_API_KEY } from '@/config';

interface NewsAPIArticle {
  title: string;
  description: string;
  source: {
    name: string;
  };
}

interface NewsItem {
  headline: string;
  impact: 'High' | 'Medium' | 'Low';
}

// A simple keyword-based impact assessment.
const assessImpact = (headline: string): 'High' | 'Medium' | 'Low' => {
  const highImpactKeywords = ['fed', 'rate hike', 'inflation', 'cpi', 'unemployment', 'war', 'crisis', 'recession'];
  const mediumImpactKeywords = ['supply chain', 'earnings', 'outlook', 'opec', 'regulations', 'etf'];

  const lowerHeadline = headline.toLowerCase();

  if (highImpactKeywords.some(keyword => lowerHeadline.includes(keyword))) {
    return 'High';
  }
  if (mediumImpactKeywords.some(keyword => lowerHeadline.includes(keyword))) {
    return 'Medium';
  }
  return 'Low';
};

/**
 * Fetches general market news from the NewsAPI.org service.
 *
 * @returns {Promise<NewsItem[]>} A promise that resolves to an array of live news items.
 */
export const getGeneralMarketNews = async (): Promise<NewsItem[]> => {
  const apiKey = NEWS_API_KEY;
  
  if (!apiKey || apiKey === 'YOUR_NEWS_API_KEY_HERE') {
    console.warn("NewsAPI key is not configured. Returning placeholder news. Please add your key to src/config.ts.");
    return [
      { headline: "Your NewsAPI key is missing. Add it to the src/config.ts file to see live news.", impact: 'High' },
      { headline: "You can get a free key from newsapi.org.", impact: 'Low' },
    ];
  }
  
  const url = `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`NewsAPI error: ${errorData.message}`);
    }

    const data = await response.json();

    if (!data.articles || data.articles.length === 0) {
      return [{ headline: "No recent financial news found.", impact: 'Low' }];
    }

    return data.articles.slice(0, 10).map((article: NewsAPIArticle) => ({
      headline: article.title,
      impact: assessImpact(article.title),
    }));

  } catch (error) {
    console.error("Failed to fetch live news:", error);
    return [{ headline: "Could not fetch the latest news due to an API error. Please check your key or try again later.", impact: 'High' }];
  }
};
