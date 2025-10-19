
'use server';

/**
 * @fileOverview A server action to fetch general and crypto market news from a live API.
 */

import { NEWS_API_KEY } from '@/config';

interface NewsAPIArticle {
  title: string;
  description: string;
  source: {
    name: string;
  };
  publishedAt: string;
}

export interface NewsItem {
  headline: string;
  impact: 'High' | 'Medium' | 'Low';
  category: 'Business' | 'Crypto';
}

// A simple keyword-based impact assessment.
const assessImpact = (headline: string): 'High' | 'Medium' | 'Low' => {
  const highImpactKeywords = ['fed', 'rate hike', 'inflation', 'cpi', 'unemployment', 'war', 'crisis', 'recession', 'sec', 'regulation', 'ban', 'approval'];
  const mediumImpactKeywords = ['supply chain', 'earnings', 'outlook', 'opec', 'etf', 'halving', 'upgrade', 'protocol'];

  const lowerHeadline = headline.toLowerCase();

  if (highImpactKeywords.some(keyword => lowerHeadline.includes(keyword))) {
    return 'High';
  }
  if (mediumImpactKeywords.some(keyword => lowerHeadline.includes(keyword))) {
    return 'Medium';
  }
  return 'Low';
};

const mapArticleToNewsItem = (article: NewsAPIArticle, category: 'Business' | 'Crypto'): NewsItem => ({
    headline: article.title,
    impact: assessImpact(article.title),
    category,
});


/**
 * Fetches general and crypto market news from the NewsAPI.org service.
 * This is a server action and will only run on the server.
 *
 * @returns {Promise<NewsItem[]>} A promise that resolves to an array of live news items.
 */
export const getNews = async (): Promise<NewsItem[]> => {
  const apiKey = NEWS_API_KEY;
  
  if (!apiKey || apiKey === 'YOUR_NEWS_API_KEY_HERE') {
    console.warn("NewsAPI key is not configured. Returning placeholder news. Please add your key to src/config.ts.");
    return [
      { headline: "Your NewsAPI key is missing. Add it to the src/config.ts file to see live news.", impact: 'High', category: 'Business' },
      { headline: "You can get a free key from newsapi.org.", impact: 'Low', category: 'Business' },
    ];
  }
  
  const businessUrl = `https://newsapi.org/v2/top-headlines?country=us&category=business&pageSize=10&apiKey=${apiKey}`;
  const cryptoUrl = `https://newsapi.org/v2/everything?q=crypto%20OR%20bitcoin%20OR%20ethereum&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;

  try {
    const [businessResponse, cryptoResponse] = await Promise.all([
        fetch(businessUrl, { next: { revalidate: 3600 } }), // Cache for 1 hour
        fetch(cryptoUrl, { next: { revalidate: 3600 } })    // Cache for 1 hour
    ]);

    if (!businessResponse.ok || !cryptoResponse.ok) {
        // Handle potential errors for individual requests
        if (!businessResponse.ok) console.error("NewsAPI (Business) error:", await businessResponse.json());
        if (!cryptoResponse.ok) console.error("NewsAPI (Crypto) error:", await cryptoResponse.json());
        throw new Error('Failed to fetch news from one or more sources.');
    }

    const businessData = await businessResponse.json();
    const cryptoData = await cryptoResponse.json();
    
    const businessNews = businessData.articles?.map((a: NewsAPIArticle) => mapArticleToNewsItem(a, 'Business')) || [];
    const cryptoNews = cryptoData.articles?.map((a: NewsAPIArticle) => mapArticleToNewsItem(a, 'Crypto')) || [];
    
    // Combine and remove duplicates based on headline
    const allNews = [...businessNews, ...cryptoNews];
    const uniqueNews = Array.from(new Map(allNews.map(item => [item.headline, item])).values());
    
    // Simple sort to prioritize high impact news
    uniqueNews.sort((a, b) => {
        const impactOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return impactOrder[b.impact] - impactOrder[a.impact];
    });

    if (uniqueNews.length === 0) {
      return [{ headline: "No recent financial or crypto news found.", impact: 'Low', category: 'Business' }];
    }

    return uniqueNews.slice(0, 20);

  } catch (error) {
    console.error("Failed to fetch live news:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return [{ headline: `Could not fetch news. Error: ${errorMessage}`, impact: 'High', category: 'Business' }];
  }
};
