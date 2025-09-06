"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { analyzeChart, AnalyzeChartOutput } from '@/ai/flows/analyze-chart-flow';
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';
import { Bot, LineChart, Target, Layers3, BarChart4, Volume, Compass } from 'lucide-react';

interface ChartAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartImage: string;
  symbol: string;
}

const ChartAnalysisModal: React.FC<ChartAnalysisModalProps> = ({ isOpen, onClose, chartImage, symbol }) => {
  const [analysis, setAnalysis] = useState<AnalyzeChartOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const getAnalysis = async () => {
      setLoading(true);
      setAnalysis(null);
      try {
        const result = await analyzeChart({ symbol, chartImageUri: chartImage });
        setAnalysis(result);
      } catch (error) {
        console.error("Chart analysis error:", error);
        setAnalysis({
          analysisSummary: "An error occurred while the AI was analyzing the chart image. The visual analysis module is temporarily unavailable. Please refer to the primary signal data.",
          marketStructure: "Unavailable",
          identifiedPatterns: [],
          keyLevels: [],
          indicatorAnalysis: "Unavailable",
          volumeAnalysis: "Unavailable",
          actionableStrategy: "Unavailable",
        });
      } finally {
        setLoading(false);
      }
    };

    getAnalysis();
  }, [isOpen, chartImage, symbol]);

  const AnalysisSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; hidden?: boolean }> = ({ title, icon, children, hidden = false }) => {
    if (hidden) return null;
    return (
        <div className="mt-4">
        <h3 className="font-headline text-lg text-primary flex items-center gap-2 mb-2">
            {icon}
            {title}
        </h3>
        <div className="pl-4 border-l-2 border-primary/30 text-foreground/90 text-sm space-y-2">
            {children}
        </div>
        </div>
    )
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-6 p-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-6 w-1/4 mt-4" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }

    if (!analysis) return null;

    return (
      <div>
        <AnalysisSection title="AI Summary" icon={<Bot />}>
          <p className="italic">"{analysis.analysisSummary}"</p>
        </AnalysisSection>

        <AnalysisSection title="Market Structure" icon={<Layers3 />}>
            <p>{analysis.marketStructure}</p>
        </AnalysisSection>

        <AnalysisSection title="Key Levels" icon={<Target />} hidden={analysis.keyLevels.length === 0}>
            <ul className="space-y-2">
            {analysis.keyLevels.map((l, i) => (
                <li key={i}>
                <strong className="text-primary/90">{l.type}:</strong> {l.level}
                </li>
            ))}
            </ul>
        </AnalysisSection>
        
        <AnalysisSection title="Identified Patterns" icon={<LineChart />} hidden={analysis.identifiedPatterns.length === 0}>
            <ul className="space-y-2">
            {analysis.identifiedPatterns.map((p, i) => (
                <li key={i}>
                <strong className="text-primary/90">{p.pattern}:</strong> {p.description}
                </li>
            ))}
            </ul>
        </AnalysisSection>

        <AnalysisSection title="Indicator Analysis" icon={<BarChart4 />}>
            <p>{analysis.indicatorAnalysis}</p>
        </AnalysisSection>

        <AnalysisSection title="Volume Analysis" icon={<Volume />}>
            <p>{analysis.volumeAnalysis}</p>
        </AnalysisSection>

        <AnalysisSection title="Actionable Strategy" icon={<Compass />}>
            <p className="font-bold text-primary/90">{analysis.actionableStrategy}</p>
        </AnalysisSection>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-black/80 backdrop-blur-md border-2 border-primary shadow-[0_0_25px_var(--primary)] text-foreground">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary">AI Chart Vision Analysis: {symbol}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[80vh]">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-primary/50 self-start">
            <Image src={chartImage} alt={`Chart of ${symbol}`} layout="fill" objectFit="contain" />
          </div>
          <div className="overflow-y-auto pr-4">
            {renderContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChartAnalysisModal;
