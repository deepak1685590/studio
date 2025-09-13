

export interface User {
  username: string;
  password?: string;
  isAdmin: boolean;
  status: 'pending' | 'approved' | 'revoked';
  joined: string;
  revocationReason?: string;
  revokedAt?: string;
}

export type Trend = 'Bullish' | 'Bearish' | 'Neutral';
export type Timeframe = '5m' | '15m' | '1h' | '4h' | '1d';

export interface LiveTradeData {
  volume: number;
  side: 'Buy' | 'Sell' | 'Neutral';
}

export interface BookTicker {
  bidPrice: number;
  askPrice: number;
}

export interface Position {
  symbol: string;
  entryPrice: number;
  size: number;
  quantity: number;
  type: 'long' | 'short';
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  size: number;
  pnl: number;
}

export interface TimeframeData {
  trend: Trend;
  strength: number; // 0-100 strength of the trend
}

export interface MultiTimeframeAnalysis {
  '5m'?: TimeframeData;
  '15m'?: TimeframeData;
  '1H'?: TimeframeData;
  '4H'?: TimeframeData;
  'Daily'?: TimeframeData;
  'Weekly'?: TimeframeData;
  [key: string]: TimeframeData | undefined;
}

export interface ChartPattern {
    name: string;
    description: string;
}

export interface TradersChecklist {
    riskRewardPass: boolean;
    mtfAlignmentPass: boolean;
    volumeConfirmationPass: boolean;
    entryInZonePass: boolean;
    momentumAlignmentPass: boolean;
    smartMoneyEntryPass: boolean;
}

export interface FibonacciLevels {
    level_382: string;
    level_500: string;
    level_618: string;
}

export interface GoldenPullbackZone {
    min: string;
    max: string;
}

export interface SniperZone {
    min: string;
    max: string;
}

export interface ConfidenceBreakdown {
  overall: number;
  patternStrength: number;
  volumeConfirmation: number;
  htfAlignment: number;
  smartMoneyFlow: number;
}

export interface WhaleAlert {
  amount: number;
  symbol: string;
  destination: 'Exchanges' | 'Cold Wallet';
  impactProbability: 'HIGH' | 'MEDIUM' | 'LOW';
  historicalPattern: string;
}

export interface MovingAverageAnalysis {
    ema20: { value: string; status: 'Above' | 'Below' };
    ema50: { value: string; status: 'Above' | 'Below' };
    ema100: { value: string; status: 'Above' | 'Below' };
    ema200: { value: string; status: 'Above' | 'Below' };
}

export interface TrendStrength {
    score: number;
    rating: 'Strong' | 'Moderate' | 'Weak' | 'Ranging';
}

export interface Momentum {
    score: number;
    rating: 'Overbought' | 'Bullish' | 'Neutral' | 'Bearish' | 'Oversold';
}

export interface LiquidityInfo {
    type: string;
    level: string;
    description: string;
}

export interface SmartMoneyConcepts {
    entry: string;
    bos: string;
    choch: string;
    confirmedEntry: string;
}

export interface SidewaysMarket {
    adx: number;
    range: [string, string];
}

export type VolumeSignal = 'Strong Buy' | 'Buy' | 'Strong Sell' | 'Sell' | 'Neutral';

export interface VolumeTimeframeData {
    totalVolume: number;
    buyVolume: number;
    sellVolume: number;
    dominantSide: 'Buy' | 'Sell' | 'Neutral';
    buySellRatio: number;
    signal: VolumeSignal;
}

export interface VolumeAnalysis {
    '5m': VolumeTimeframeData;
    '15m': VolumeTimeframeData;
    '1H': VolumeTimeframeData;
    '4H': VolumeTimeframeData;
    '1D': VolumeTimeframeData;
    summary: {
      totalBuyVolume: number;
      totalSellVolume: number;
      overallSignal: VolumeSignal;
    };
}

export interface SupportResistanceLevel {
    S1: number;
    S2: number;
    S3: number;
    R1: number;
    R2: number;
    R3: number;
    probableTarget: 'S1' | 'S2' | 'S3' | 'R1' | 'R2' | 'R3';
}

export interface MultiTimeframeSR {
    '5m': SupportResistanceLevel;
    '15m': SupportResistanceLevel;
    '1H': SupportResistanceLevel;
}

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
    rsiStatus: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL';
    divergence: 'BULLISH' | 'BEARISH' | 'NONE';
    stochRsi: {
        k: number;
        d: number;
        signal: 'BULL_CROSS' | 'BEAR_CROSS' | 'NONE';
    };
}

export interface LiquidityLevel {
    price: number;
    volume: number;
    type: 'POOL' | 'STOP_HUNT';
}

export interface LiquidityPrediction {
    targetPrice: number;
    confidence: 'High' | 'Medium' | 'Low';
    timeframe: string;
    reason: string;
}

export interface LiquidityMatrixData {
    buySide: LiquidityLevel[];
    sellSide: LiquidityLevel[];
    prediction: LiquidityPrediction;
    currentPrice: number;
}


export interface SignalData {
  symbol: string;
  price: number;
  mode: string;
  timeframe: Timeframe;
  isBullish: boolean;
  action: string;
  entry: string;
  sl: string;
  tp1: string;
  tp2: string;
  riskReward: number;
  confidence: string;
  confluenceFactors: string[];
  confluenceCount: number;
  swingHigh: string;
  swingLow: string;
  pivot: string;
  poc: string;
  vah: string;
  val: string;
  s1: string;
  r1: string;
  buyVolume: string;
  sellVolume: string;
  volumeImbalance: string;
  demandZone: [string, string];
  supplyZone: [string, string];
  fvg: [string, string];
  liquidity: LiquidityInfo;
  smartMoneyConcepts: SmartMoneyConcepts;
  marketStructure: string;
  multiTimeframeAnalysis: MultiTimeframeAnalysis;
  reversalConfirmed: boolean;
  chartPattern: ChartPattern;
  tradersChecklist: TradersChecklist;
  fibonacciLevels: FibonacciLevels;
  whaleAlert?: WhaleAlert;
  goldenPullbackZone?: GoldenPullbackZone;
  goldenReverseZone?: GoldenPullbackZone;
  sniperZone?: SniperZone;
  confidenceBreakdown: ConfidenceBreakdown;
  movingAverageAnalysis: MovingAverageAnalysis;
  trendStrength: TrendStrength;
  momentum: Momentum;
  sidewaysMarket?: SidewaysMarket;
  volumeAnalysis: VolumeAnalysis;
  multiTimeframeSR: MultiTimeframeSR;
  liquidityMatrix?: LiquidityMatrixData;
  advancedStrengthDashboard?: AdvancedStrengthDashboardData;
}
