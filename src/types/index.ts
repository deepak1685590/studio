

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

export interface MultiTimeframeAnalysis {
  '1m'?: Trend;
  '5m'?: Trend;
  '15m'?: Trend;
  '1H'?: Trend;
  '4H'?: Trend;
  'Daily'?: Trend;
  'Weekly'?: Trend;
  [key: string]: Trend | undefined;
}

export interface ChartPattern {
    name: string;
    description: string;
}

export interface CandlestickPattern {
    name: string;
    description: string;
}

export interface TradersChecklist {
    riskRewardPass: boolean;
    mtfAlignmentPass: boolean;
    volumeConfirmationPass: boolean;
    entryInZonePass: boolean;
    structureAligmentPass: boolean;
    liquiditySweepPass: boolean;
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

export interface VolumeTimeframeData {
  buyVolume: number;
  sellVolume: number;
  totalVolume: number;
  dominantSide: 'Buy' | 'Sell' | 'Neutral';
}

export interface VolumeAnalysis {
  '5m': VolumeTimeframeData;
  '15m': VolumeTimeframeData;
  '1H': VolumeTimeframeData;
  '4H': VolumeTimeframeData;
  '1D': VolumeTimeframeData;
}

export interface SidewaysMarket {
  adx: number;
  range: [string, string];
}

export interface MovingAverages {
  ema20: { value: string; status: 'Above' | 'Below' };
  ema50: { value: string; status: 'Above' | 'Below' };
  ema100: { value: string; status: 'Above' | 'Below' };
  ema200: { value: string; status: 'Above' | 'Below' };
}

export interface MarketInternals {
    trendStrength: { value: number; rating: 'Strong' | 'Moderate' | 'Weak' | 'Ranging' };
    momentum: { value: number; rating: 'Overbought' | 'Bullish' | 'Bearish' | 'Oversold' | 'Neutral' };
}

export interface SmartMoneyConcepts {
  breakOfStructure: { level: string; direction: 'up' | 'down' };
  changeOfCharacter: { level: string; direction: 'up' | 'down' };
  liquidity: { 
    type: 'Equal Highs' | 'Equal Lows' | 'Liquidity Void';
    level: string;
    description: string;
  };
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
  s1: string;
  r1: string;
  buyVolume: string;
  sellVolume: string;
  volumeImbalance: string;
  demandZone: [string, string];
  supplyZone: [string, string];
  fvg: [string, string];
  liquidityPool: string;
  marketStructure: string;
  multiTimeframeAnalysis: MultiTimeframeAnalysis;
  reversalConfirmed: boolean;
  chartPattern: ChartPattern;
  tradersChecklist: TradersChecklist;
  fibonacciLevels: FibonacciLevels;
  whaleAlert?: WhaleAlert;
  goldenPullbackZone?: GoldenPullbackZone;
  confidenceBreakdown: ConfidenceBreakdown;
  volumeAnalysis: VolumeAnalysis;
  sidewaysMarket?: SidewaysMarket;
  volatility: number;
  candlestickPattern?: CandlestickPattern;
  movingAverages: MovingAverages;
  marketInternals: MarketInternals;
  smartMoney: SmartMoneyConcepts;
}
