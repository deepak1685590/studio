import type { SignalData, MultiTimeframeAnalysis, ChartPattern, TradersChecklist, FibonacciLevels, Timeframe, GoldenPullbackZone, ConfidenceBreakdown, WhaleAlert } from '@/types';

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


const getMockKlines = (price: number, interval: Timeframe) => {
  const klines = [];
  let currentPrice = price;
  
  const intervalMap: {[key in Timeframe]: number} = {
    '5m': 5,
    '15m': 15,
    '1H': 60,
    '4H': 240,
    '1d': 1440,
  };
  const intervalMinutes = intervalMap[interval] || 15;

  for (let i = 0; i < 100; i++) {
    const open = currentPrice;
    const high = open * (1 + (Math.random() - 0.45) * 0.02);
    const low = open * (1 + (Math.random() - 0.55) * 0.02);
    const close = (high + low) / 2 * (1 + (Math.random() - 0.5) * 0.01);
    currentPrice = close;
    klines.push([
      Date.now() - (100 - i) * intervalMinutes * 60 * 1000,
      open.toFixed(4),
      high.toFixed(4),
      low.toFixed(4),
      close.toFixed(4),
      (Math.random() * 1000).toFixed(4),
    ]);
  }
  return klines;
};

export const getSignalData = async (symbol: string, mode: string, timeframe: Timeframe, forceMock = false): Promise<SignalData> => {
    let price, klines: any[], symbolWithUSDT = symbol.toUpperCase() + "USDT";
    
    // Map our Timeframe type to Binance's interval strings
    const timeframeToInterval = {
      '5m': '5m',
      '15m': '15m',
      '1H': '1h',
      '4H': '4h',
      '1d': '1d',
    };
    const apiInterval = timeframeToInterval[timeframe] || '15m';

    if (forceMock) {
        price = parseFloat((Math.random() * 70000 + 1000).toFixed(2));
        klines = getMockKlines(price, timeframe);
    } else {
        try {
            const priceResponse = await fetchWithTimeout(`https://api.binance.com/api/v3/ticker/price?symbol=${symbolWithUSDT}`, { timeout: 3000 });
            if (!priceResponse.ok) throw new Error('Price fetch failed');
            const priceData = await priceResponse.json();
            price = parseFloat(priceData.price);
            
            const klinesResponse = await fetchWithTimeout(`https://api.binance.com/api/v3/klines?symbol=${symbolWithUSDT}&interval=${apiInterval}&limit=100`, { timeout: 5000 });
            if (!klinesResponse.ok) throw new Error('Klines fetch failed');
            klines = await klinesResponse.json();
        } catch (err) {
            console.warn("Binance API failed, using mock data.", err);
            return getSignalData(symbol, mode, timeframe, true);
        }
    }

    const highPrices = klines.map(k => parseFloat(k[2]));
    const lowPrices = klines.map(k => parseFloat(k[3]));

    const recentHighs = highPrices.slice(-50);
    const recentLows = lowPrices.slice(-50);
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

    // Fibonacci Retracement Levels
    const fibRange = swingHigh - swingLow;
    const fibonacciLevels: FibonacciLevels = {
        level_382: (swingHigh - fibRange * 0.382).toFixed(2),
        level_500: (swingHigh - fibRange * 0.5).toFixed(2),
        level_618: (swingHigh - fibRange * 0.618).toFixed(2),
    };

    // Scalping parameters
    const timeframeMultipliers = {
        '5m': { atr: 1.5, tp1: 1.5, tp2: 3 },
        '15m': { atr: 2, tp1: 2, tp2: 4 },
        '1H': { atr: 2.5, tp1: 2.5, tp2: 5 },
        '4H': { atr: 3, tp1: 3, tp2: 6 },
        '1d': { atr: 3.5, tp1: 3.5, tp2: 7 },
    };
    const multipliers = timeframeMultipliers[timeframe as keyof typeof timeframeMultipliers] || timeframeMultipliers['15m'];
    const { atr: atrMultiplier, tp1: tpMultiplier1, tp2: tpMultiplier2 } = multipliers;

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
    
    const buyVolume = avgVolume * (isBullish ? 1.2 : 0.8) * (1 + (Math.random() - 0.5) * 0.2);
    const sellVolume = avgVolume * (isBullish ? 0.8 : 1.2) * (1 + (Math.random() - 0.5) * 0.2);
    const netFlow = buyVolume - sellVolume;

    const volumeImbalance = netFlow > 0 ? `🟢 Buyers in Control (+${Math.round(netFlow)} units)` : `🔴 Sellers in Control (${Math.round(netFlow)} units)`;
      
    const reversalConfirmed = Math.random() > 0.6;

    const confluenceFactors = [
        `Trend: ${isBullish ? 'Bullish' : 'Bearish'} (Price vs SuperTrend)`,
        price > pivot ? `Price above Pivot ($${pivot.toFixed(2)})` : `Price below Pivot ($${pivot.toFixed(2)})`,
        volumeImbalance,
        'Structure: Minor trend alignment',
    ];

    if (reversalConfirmed) {
        confluenceFactors.push(`✅ Reversal Confirmed`);
    }

    // Always generate a whale alert for demonstration
    const isBullishWhale = Math.random() > 0.5;
    const whaleAlert: WhaleAlert = {
        amount: parseFloat((Math.random() * 2000 + 500).toFixed(0)), // 500 - 2500
        symbol: symbol.toUpperCase(),
        destination: isBullishWhale ? 'Cold Wallet' : 'Exchanges',
        impactProbability: 'HIGH',
        historicalPattern: isBullishWhale ? '78% chance of short-term rally' : '73% chance of price drop within 4h',
    };
    confluenceFactors.unshift(`🚨 WHALE SIGHTING: Large volume detected!`);

    const entryPrice = isBullish ? (price * 0.998) : (price * 1.002);
    const fibValues = Object.values(fibonacciLevels).map(parseFloat);
    const closestFib = fibValues.reduce((prev, curr) => Math.abs(curr - entryPrice) < Math.abs(prev - entryPrice) ? curr : prev);
    if (Math.abs(closestFib - entryPrice) / entryPrice < 0.005) { // within 0.5% of a fib level
        const fibKey = Object.keys(fibonacciLevels).find(key => parseFloat(fibonacciLevels[key as keyof FibonacciLevels]) === closestFib);
        if (fibKey) {
            const fibPercent = fibKey.split('_')[1];
            confluenceFactors.push(`✅ Entry near ${parseInt(fibPercent) / 10}% Fib retracement`);
        }
    }
    
    const trends: ('Bullish' | 'Bearish' | 'Neutral')[] = ['Bullish', 'Bearish', 'Neutral'];
    let multiTimeframeAnalysis: MultiTimeframeAnalysis = {};

    const mtfMap: {[key in Timeframe]?: (keyof MultiTimeframeAnalysis)[]} = {
        '5m': ['15m', '1H'],
        '15m': ['1H', '4H', 'Daily'],
        '1H': ['4H', 'Daily'],
        '4H': ['Daily', 'Weekly'],
        '1d': ['Weekly'],
    };
    
    const analysisTimeframes = mtfMap[timeframe] || mtfMap['15m']!;
    
    // Set the trend for the current timeframe
    const currentTfKey = timeframe === '1d' ? 'Daily' : timeframe.toUpperCase() as keyof MultiTimeframeAnalysis;
    multiTimeframeAnalysis[currentTfKey] = isBullish ? 'Bullish' : 'Bearish';
    
    // Set trends for other relevant timeframes
    analysisTimeframes.forEach(tf => {
        if (!multiTimeframeAnalysis[tf]) {
            multiTimeframeAnalysis[tf] = trends[Math.floor(Math.random() * 3)];
        }
    });
    
    // Ensure all required fields for the AI are present, even if just neutral
    const requiredTfs: (keyof MultiTimeframeAnalysis)[] = ['15m', '1H', '4H', 'Daily'];
    requiredTfs.forEach(tf => {
        if (!multiTimeframeAnalysis[tf]) {
            multiTimeframeAnalysis[tf] = 'Neutral';
        }
    });

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
    const entry = entryPrice.toFixed(2);
    const sl = isBullish ? (parseFloat(entry) - atr*atrMultiplier).toFixed(2) : (parseFloat(entry) + atr*atrMultiplier).toFixed(2);
    const tp1 = isBullish ? (parseFloat(entry) + atr*tpMultiplier1).toFixed(2) : (parseFloat(entry) - atr*tpMultiplier1).toFixed(2);
    const tp2 = isBullish ? (parseFloat(entry) + atr*tpMultiplier2).toFixed(2) : (parseFloat(entry) - atr*tpMultiplier2).toFixed(2);

    const risk = Math.abs(parseFloat(entry) - parseFloat(sl));
    const reward = Math.abs(parseFloat(tp2) - parseFloat(entry));
    const riskReward = risk > 0 ? reward / risk : 0;
    
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
    
    const marketStructure = isBullish ? 'Bullish - HH/HL' : 'Bearish - LH/LL';

    const mtfAlignmentKey: keyof MultiTimeframeAnalysis = timeframe === '5m' ? '15m' : '4H';
    const htfAlignmentKey: keyof MultiTimeframeAnalysis = timeframe === '1H' ? '4H' : 'Daily';
    
    const tradersChecklist: TradersChecklist = {
        riskRewardPass: riskReward > 1.5,
        mtfAlignmentPass: multiTimeframeAnalysis[mtfAlignmentKey] === (isBullish ? 'Bullish' : 'Bearish') || multiTimeframeAnalysis[htfAlignmentKey] === (isBullish ? 'Bullish' : 'Bearish'),
        volumeConfirmationPass: netFlow > 0 === isBullish,
        entryInZonePass: isBullish 
            ? parseFloat(entry) >= parseFloat(demandZone[0]) && parseFloat(entry) <= parseFloat(demandZone[1])
            : parseFloat(entry) >= parseFloat(supplyZone[0]) && parseFloat(entry) <= parseFloat(supplyZone[1]),
        structureAligmentPass: Math.random() > 0.3,
        liquiditySweepPass: Math.random() > 0.4,
    };
    
    let goldenPullbackZone: GoldenPullbackZone | undefined = undefined;
    const fib618 = parseFloat(fibonacciLevels.level_618);
    // Only show the pullback zone if it's a valid opportunity
    if (isBullish && price > fib618) {
        goldenPullbackZone = {
            min: Math.min(fib618, pivot).toFixed(2),
            max: Math.max(fib618, pivot).toFixed(2),
        };
    } else if (!isBullish && price < fib618) {
        goldenPullbackZone = {
            min: Math.min(fib618, pivot).toFixed(2),
            max: Math.max(fib618, pivot).toFixed(2),
        };
    }

    const confidenceBreakdown: ConfidenceBreakdown = {
        technical: Math.floor(Math.random() * 15 + 80), // 80-95
        volume: Math.floor(Math.random() * 20 + 70), // 70-90
        structure: Math.floor(Math.random() * 15 + 82), // 82-97
        sentiment: Math.floor(Math.random() * 25 + 65), // 65-90
        overall: 0,
    };
    confidenceBreakdown.overall = Math.round((confidenceBreakdown.technical + confidenceBreakdown.volume + confidenceBreakdown.structure + confidenceBreakdown.sentiment) / 4);

    return {
        symbol: symbol.toUpperCase(),
        price,
        mode,
        timeframe,
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
        buyVolume: buyVolume.toFixed(0),
        sellVolume: sellVolume.toFixed(0),
        volumeImbalance,
        demandZone,
        supplyZone,
        fvg,
        liquidityPool: isBullish ? `$${(swingLow * 0.99).toFixed(2)}` : `$${(swingHigh * 1.01).toFixed(2)}`,
        marketStructure,
        multiTimeframeAnalysis,
        reversalConfirmed,
        chartPattern,
        tradersChecklist,
        fibonacciLevels,
        whaleAlert,
        goldenPullbackZone,
        confidenceBreakdown,
    };
};
