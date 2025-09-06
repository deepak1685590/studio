
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Globe, Clock, BarChart2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

const MarketSessions = () => {
  return (
    <Card className="bg-black/50 border-2 border-primary/50 shadow-[0_0_25px_rgba(0,230,230,0.3)]">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-primary flex items-center gap-2">
          <Globe /> Global Market Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-headline text-lg">🌍 FOREX MARKET SESSIONS</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>The forex market can be broken up into four major trading sessions: Sydney, Tokyo, London, and New York.</p>
              <ul className="space-y-2 pl-4 list-disc list-inside">
                <li>🇦🇺 **SYDNEY (PACIFIC):** Least active. AUD/USD, NZD/USD pairs most active.</li>
                <li>🇯🇵 **TOKYO (ASIAN):** Overlaps with Sydney. USD/JPY, AUD/JPY pairs most active.</li>
                <li>🇬🇧 **LONDON (EUROPEAN):** Most active, high volatility. EUR/USD, GBP/USD pairs most active.</li>
                <li>🇺🇸 **NEW YORK (AMERICAN):** High volatility, especially during London overlap. All major USD pairs active.</li>
              </ul>
              <p>The Forex market operates continuously from Sunday at 5:00 PM EST to Friday at 5:00 PM EST.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="font-headline text-lg">💰 CRYPTOCURRENCY MARKET</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>Crypto has only one continuous, 24/7/365 global session and never closes.</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>FOREX</TableHead>
                    <TableHead>CRYPTO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>4 Distinct Sessions</TableCell>
                    <TableCell>1 Continuous Session</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Monday-Friday only</TableCell>
                    <TableCell>24/7/365</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Market closes on weekends</TableCell>
                    <TableCell>Never closes</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Session-based volatility</TableCell>
                    <TableCell>Time-zone influenced activity</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="font-headline text-lg"><BarChart2 /> Best Trading Times</AccordionTrigger>
            <AccordionContent>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-bold text-primary mb-2">FOREX</h4>
                        <ul className="space-y-1 text-sm list-disc list-inside">
                            <li><strong className="text-primary/80">London-New York Overlap</strong> (8 AM - 12 PM EST) - Highest volatility.</li>
                            <li><strong className="text-primary/80">Asian-European Overlap</strong> (3 AM - 4 AM EST) - Moderate activity.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-primary mb-2">CRYPTO</h4>
                         <ul className="space-y-1 text-sm list-disc list-inside">
                            <li><strong className="text-primary/80">US Trading Hours</strong> (9 AM - 4 PM EST) - Higher institutional activity.</li>
                            <li><strong className="text-primary/80">Asian Hours</strong> (8 PM - 4 AM EST) - High retail trading activity.</li>
                        </ul>
                    </div>
                 </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default MarketSessions;
