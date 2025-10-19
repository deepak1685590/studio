
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
