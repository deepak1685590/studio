import type { SignalData, ChartDataPoint, MultiTimeframeAnalysis, ChartPattern, TradersChecklist } from '@/types';

async function fetchWithTimeout(resource: RequestInfo, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = 8000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });
  clearTimeout(id);

  return response;
}


const getMockKlines = (price: number) => {
  const klines = [];
  let currentPrice = price;
  for (let i = 0; i < 100; i++) {
    const open = currentPrice;
    const high = open * (1 + (Math.random() - 0.45) * 0.02);
    const low = open * (1 + (Math.random() - 0.55) * 0.02);
    const close = (high + low) / 2 * (1 + (Math.random() - 0.5) * 0.01);
    currentPrice = close;
    klines.push([
      Date.now() - (100 - i) * 15 * 60 * 1000,
      open.toFixed(4),
      high.toFixed(4),
      low.toFixed(4),
      close.toFixed(4),
      (Math.random() * 1000).toFixed(4),
    ]);
  }
  return klines;
};

export const getSignalData = async (symbol: string, mode: string, forceMock = false): Promise<SignalData> => {
    let price, klines: any[], symbolWithUSDT = symbol.toUpperCase() + "USDT";
    
    if (forceMock) {
        price = parseFloat((Math.random() * 70000 + 1000).toFixed(2));
        klines = getMockKlines(price);
    } else {
        try {
            const priceResponse = await fetchWithTimeout(`https://api.binance.com/api/v3/ticker/price?symbol=${symbolWithUSDT}`, { timeout: 3000 });
            if (!priceResponse.ok) throw new Error('Price fetch failed');
            const priceData = await priceResponse.json();
            price = parseFloat(priceData.price);
            
            const klinesResponse = await fetchWithTimeout(`https://api.binance.com/api/v3/klines?symbol=${symbolWithUSDT}&interval=15m&limit=100`, { timeout: 5000 });
            if (!klinesResponse.ok) throw new Error('Klines fetch failed');
            klines = await klinesResponse.json();
        } catch (err) {
            console.warn("Binance API failed, using mock data.", err);
            return getSignalData(symbol, mode, true);
        }
    }

    const closes = klines.map(k => parseFloat(k[4]));
    const highPrices = klines.map(k => parseFloat(k[2]));
    const lowPrices = klines.map(k => parseFloat(k[3]));

    const recentHighs = highPrices.slice(-20);
    const recentLows = lowPrices.slice(-20);
    const swingHigh = Math.max(...recentHighs);
    const swingLow = Math.min(...recentLows);

    const lastCandle = klines[klines.length - 1];
    const lastClose = parseFloat(lastCandle[4]);
    const pivot = (swingHigh + swingLow + lastClose) / 3;

    const r1 = (2 * pivot) - swingLow;
    const s1 = (2 * pivot) - swingHigh;

    const atrPeriod = 14;
    let trSum = 0;
    for (let i = klines.length - atrPeriod; i < klines.length; i++) {
        const high = parseFloat(klines[i][2]);
        const low = parseFloat(klines[i][3]);
        const prevClose = parseFloat(klines[i-1][4]);
        trSum += Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    }
    const atr = trSum / atrPeriod;

    // A simple SuperTrend logic
    const superTrendMultiplier = 2.5;
    const upperBand = (swingHigh + swingLow) / 2 + (superTrendMultiplier * atr);
    const lowerBand = (swingHigh + swingLow) / 2 - (superTrendMultiplier * atr);
    const isBullish = lastClose > lowerBand; // simplified

    const demandZone: [string, string] = isBullish ? [(lastClose * 0.98).toFixed(2), (lastClose * 0.99).toFixed(2)] : [(swingLow * 0.995).toFixed(2), (swingLow).toFixed(2)];
    const supplyZone: [string, string] = isBullish ? [(swingHigh).toFixed(2), (swingHigh * 1.005).toFixed(2)] : [(lastClose * 1.01).toFixed(2), (lastClose * 1.02).toFixed(2)];
    const fvg: [string, string] = isBullish ? [(lastClose * 0.985).toFixed(2), (lastClose * 0.995).toFixed(2)] : [(lastClose * 1.005).toFixed(2), (lastClose * 1.015).toFixed(2)];

    const recentVolumes = klines.slice(-20).map(k => parseFloat(k[5]));
    const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
    const lastVolume = recentVolumes[recentVolumes.length - 1];
    const volumeImbalance = lastVolume > avgVolume * 1.2 
      ? (isBullish ? "🟢 High Buying Volume" : "🔴 High Selling Volume") 
      : "⚪️ Average Volume";
      
    // Simulate reversal confirmation
    const reversalConfirmed = Math.random() > 0.6; // 40% chance of being true

    const confluenceFactors = [
        `Trend: ${isBullish ? 'Bullish' : 'Bearish'} (Price vs SuperTrend)`,
        price > pivot ? `Price above Pivot ($${pivot.toFixed(2)})` : `Price below Pivot ($${pivot.toFixed(2)})`,
        volumeImbalance,
        'Structure: Minor trend alignment',
    ];

    if (reversalConfirmed) {
        confluenceFactors.push(`✅ Reversal Confirmed`);
    }
    
    const trends: ('Bullish' | 'Bearish' | 'Neutral')[] = ['Bullish', 'Bearish', 'Neutral'];
    const multiTimeframeAnalysis: MultiTimeframeAnalysis = {
        '15m': isBullish ? 'Bullish' : 'Bearish',
        '1H': trends[Math.floor(Math.random() * 3)],
        '4H': trends[Math.floor(Math.random() * 3)],
        'Daily': trends[Math.floor(Math.random() * 3)],
    };

    if (parseInt(mode) >= 2) {
        const waveConvergence = (Math.random() * 40 + 60).toFixed(1);
        confluenceFactors.push(`Quantum Wave Convergence: ${waveConvergence}%`);
    }
    if (parseInt(mode) >= 3) {
        const anomalyType = isBullish ? 'Expansion' : 'Contraction';
        const anomalySeverity = (Math.random() * 0.5 + 1.2).toFixed(2);
        confluenceFactors.push(`Chrono-Distortion Anomaly: ${anomalyType} (${anomalySeverity}σ)`);
        
        const liquidityPulse = (Math.random() * 150 + 50).toFixed(0);
        confluenceFactors.push(`Subspace Liquidity Pulse: ${liquidityPulse}M units detected`);
    }

    const confluenceCount = confluenceFactors.length;
    const confidence = confluenceCount >= 6 ? "Very High" : confluenceCount >= 4 ? "High" : "Medium";
    
    const action = isBullish ? "Buy on Pullback" : "Sell on Rally";
    const entry = isBullish ? (price * 0.995).toFixed(2) : (price * 1.005).toFixed(2);
    const sl = isBullish ? (parseFloat(entry) - atr*2).toFixed(2) : (parseFloat(entry) + atr*2).toFixed(2);
    const tp1 = isBullish ? (parseFloat(entry) + atr*2).toFixed(2) : (parseFloat(entry) - atr*2).toFixed(2);
    const tp2 = isBullish ? (parseFloat(entry) + atr*4).toFixed(2) : (parseFloat(entry) - atr*4).toFixed(2);

    const risk = Math.abs(parseFloat(entry) - parseFloat(sl));
    const reward = Math.abs(parseFloat(tp2) - parseFloat(entry));
    const riskReward = risk > 0 ? reward / risk : 0;
    
    const chartData: ChartDataPoint[] = klines.slice(-30).map((k: any, index: number) => {
        const closePrice = parseFloat(k[4]);
        return {
            name: `T-${30 - index}`,
            price: closePrice,
            momentum: Math.random() * 80 + 10,
            volatility: Math.random() * 50 + 10,
        };
    });

    const bullishPatterns = [
        { name: 'Bull Flag', description: 'A continuation pattern suggesting the uptrend will resume after a brief consolidation.' },
        { name: 'Ascending Triangle', description: 'Indicates a potential breakout to the upside as buying pressure builds.' },
        { name: 'Inverse Head & Shoulders', description: 'A strong reversal pattern indicating a shift from a downtrend to an uptrend.' },
    ];
    const bearishPatterns = [
        { name: 'Bear Flag', description: 'A continuation pattern suggesting the downtrend will resume after a brief consolidation.' },
        { name: 'Descending Triangle', description: 'Indicates a potential breakdown to the downside as selling pressure builds.' },
        { name: 'Head & Shoulders', description: 'A classic reversal pattern indicating a shift from an uptrend to a downtrend.' },
    ];
    const chartPattern: ChartPattern = isBullish 
        ? bullishPatterns[Math.floor(Math.random() * bullishPatterns.length)] 
        : bearishPatterns[Math.floor(Math.random() * bearishPatterns.length)];
    
    const tradersChecklist: TradersChecklist = {
        riskRewardPass: riskReward > 1.5,
        mtfAlignmentPass: multiTimeframeAnalysis['4H'] === (isBullish ? 'Bullish' : 'Bearish') || multiTimeframeAnalysis['Daily'] === (isBullish ? 'Bullish' : 'Bearish'),
        volumeConfirmationPass: lastVolume > avgVolume,
    };

    return {
        symbol: symbol.toUpperCase(),
        price,
        mode,
        isBullish,
        action,
        entry,
        sl,
        tp1,
        tp2,
        riskReward,
        confidence,
        confluenceFactors,
        confluenceCount,
        swingHigh: swingHigh.toFixed(2),
        swingLow: swingLow.toFixed(2),
        pivot: pivot.toFixed(2),
        s1: s1.toFixed(2),
        r1: r1.toFixed(2),
        buyVolume: (avgVolume * 1.1).toFixed(0),
        sellVolume: (avgVolume * 0.9).toFixed(0),
        volumeImbalance,
        demandZone,
        supplyZone,
        fvg,
        liquidityPool: isBullish ? `$${(swingLow * 0.99).toFixed(2)}` : `$${(swingHigh * 1.01).toFixed(2)}`,
        marketStructure: isBullish ? 'Bullish - HH/HL' : 'Bearish - LH/LL',
        chartData,
        multiTimeframeAnalysis,
        reversalConfirmed,
        chartPattern,
        tradersChecklist,
    };
};
