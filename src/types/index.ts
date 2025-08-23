export interface User {
  username: string;
  password?: string;
  isAdmin: boolean;
  status: 'pending' | 'approved' | 'revoked';
  joined: string;
  revocationReason?: string;
  revokedAt?: string;
}

export interface ChartDataPoint {
  name: string;
  price: number;
  momentum: number;
  volatility: number;
}

export interface MultiTimeframeAnalysis {
  '15m': 'Bullish' | 'Bearish' | 'Neutral';
  '1H': 'Bullish' | 'Bearish' | 'Neutral';
  '4H': 'Bullish' | 'Bearish' | 'Neutral';
  'Daily': 'Bullish' | 'Bearish' | 'Neutral';
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
    structureAligmentPass: boolean;
    liquiditySweepPass: boolean;
}

export interface SignalData {
  symbol: string;
  price: number;
  mode: string;
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
  chartData: ChartDataPoint[];
  multiTimeframeAnalysis: MultiTimeframeAnalysis;
  reversalConfirmed: boolean;
  chartPattern: ChartPattern;
  tradersChecklist: TradersChecklist;
}
