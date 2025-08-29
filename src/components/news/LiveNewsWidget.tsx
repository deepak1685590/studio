"use client";

import React, { useState, useEffect } from 'react';
import { Rss, X, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { getGeneralMarketNews } from '@/services/general-market-news-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '../ui/badge';

interface NewsItem {
  headline: string;
  impact: 'High' | 'Medium' | 'Low';
}

const LiveNewsWidget = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const headlines = await getGeneralMarketNews();
      setNews(headlines);
    } catch (error) {
      console.error("Failed to fetch news:", error);
      setNews([{ headline: "Could not fetch latest news. Please try again later.", impact: 'Low' }]);
    } finally {
      setLoading(false);
    }
  };

  const getImpactBadge = (impact: 'High' | 'Medium' | 'Low') => {
    switch (impact) {
      case 'High':
        return <Badge variant="destructive" className="bg-red-500/80 text-white shrink-0">High Impact</Badge>;
      case 'Medium':
        return <Badge variant="secondary" className="bg-yellow-500/80 text-white shrink-0">Medium Impact</Badge>;
      case 'Low':
        return <Badge variant="outline" className="text-foreground/70 shrink-0">Low Impact</Badge>;
    }
  };

  return (
    <Sheet onOpenChange={(open) => open && fetchNews()}>
      <SheetTrigger asChild>
        <div className="fixed bottom-8 left-8 z-50">
          <Button 
            className="rounded-full w-16 h-16 bg-accent text-accent-foreground shadow-[0_0_15px_var(--accent),_0_0_30px_var(--accent)] hover:scale-110 transition-transform"
          >
            <Rss size={32} />
          </Button>
        </div>
      </SheetTrigger>
      <SheetContent side="left" className="bg-black/90 backdrop-blur-sm border-primary/50 text-foreground w-full max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            <Newspaper /> Live Market News
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto mt-4 pr-2 space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="p-3 bg-primary/10 rounded-lg space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
              </div>
            ))
          ) : (
            news.map((item, index) => (
              <div key={index} className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex flex-col gap-3">
                <p className="text-base text-foreground/90">{item.headline}</p>
                <div className="flex justify-end">
                    {getImpactBadge(item.impact)}
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LiveNewsWidget;
