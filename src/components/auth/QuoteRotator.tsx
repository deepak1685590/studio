"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const quotes = [
  "Money never sleeps.",
  "Greed is good.",
  "Buy when everyone else is selling and hold until everyone else is buying.",
  "The stock market is a device for transferring money from the impatient to the patient.",
  "Rule No. 1: Never lose money. Rule No. 2: Never forget rule No. 1.",
  "Bulls make money, bears make money, but pigs get slaughtered.",
  "Buy the rumor, sell the news.",
  "The trend is your friend until the end.",
  "Cut your losses short and let your profits run.",
  "Plan your trade and trade your plan.",
  "I made my money by selling too soon.",
  "The market can stay irrational longer than you can stay solvent.",
  "Be fearful when others are greedy, be greedy when others are fearful.",
  "Time in the market beats timing the market.",
  "Don't catch a falling knife.",
  "Fortune favors the bold.",
  "Scared money don't make money.",
  "You miss 100% of the shots you don't take.",
  "The biggest risk is not taking any risk.",
  "Losers average losers.",
  "A recession is when your neighbor loses his job. A depression is when you lose yours.",
  "October: This is one of the peculiarly dangerous months to speculate in stocks.",
  "The four most dangerous words in investing are: 'This time it's different.'",
  "Wall Street is the only place that people ride to in a Rolls Royce to get advice from those who take the subway.",
  "Money talks, wealth whispers.",
  "Rich people stay rich by living like they're broke. Broke people stay broke by living like they're rich.",
  "Your network is your net worth.",
  "Don't work for money, make money work for you.",
  "The best investment you can make is in yourself.",
  "In investing, what is comfortable is rarely profitable.",
  "The stock market is filled with individuals who know the price of everything, but the value of nothing.",
  "Risk comes from not knowing what you're doing.",
  "Markets are constantly in a state of uncertainty and flux, and money is made by discounting the obvious and betting on the unexpected.",
  "The way to make money is to buy when blood is running in the streets."
];

const QuoteRotator = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
        setIsFading(false);
      }, 1000); // Fade-out duration
    }, 5000); // Time each quote is displayed

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-16 inset-x-0 flex items-start justify-center pointer-events-none">
      <p 
        className={cn(
          "text-2xl md:text-3xl font-headline text-center text-primary/70 transition-opacity duration-1000 ease-in-out max-w-3xl px-4",
          isFading ? "opacity-0" : "opacity-100"
        )}
        style={{ textShadow: '0 0 8px hsl(var(--primary) / 0.5)' }}
      >
        "{quotes[currentQuoteIndex]}"
      </p>
    </div>
  );
};

export default QuoteRotator;
