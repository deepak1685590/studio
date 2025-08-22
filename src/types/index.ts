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
}
