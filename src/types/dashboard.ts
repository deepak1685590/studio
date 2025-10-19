

import { ConfidenceBreakdown } from ".";

export interface AdvancedStrengthDashboardData {
    marketPhase: 'BREAKOUT' | 'BREAKDOWN' | 'CONSOLIDATION' | 'BULLISH TREND' | 'BEARISH TREND' | 'NEUTRAL';
    price: string;
    priceChangePercent: number;
    marketSentiment: {
        score: number;
        label: string;
    };
    momentum: {
        rsi: number;
        trend: 'UP' | 'DOWN' | 'NEUTRAL';
    };
    longPower: number;
    shortPower: number;
    overallStrength: number;
    trendAnalysis: {
        strength: number;
        momentum: 'ACCELERATING' | 'DECELERATING' | 'STABLE';
    };
    volatility: {
        percent: number;
        label: 'EXTREME' | 'HIGH' | 'MEDIUM' | 'LOW';
    };
    volumeStatus: {
        status: 'SPIKE' | 'DRY' | 'HIGH' | 'NORMAL' | 'LOW';
        changePercent: number;
    };
    volumeValue: number;
    rsiStatus: {
        status: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL' | 'Strong' | 'Weak';
        divergence: 'BULLISH' | 'BEARISH' | 'NONE';
    };
    stochRsi: {
        k: number;
        d: number;
        crossover: 'BULL_CROSS' | 'BEAR_CROSS' | 'NONE';
    };
    confidenceBreakdown: ConfidenceBreakdown;
}
