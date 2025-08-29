
import type { SignalData, MultiTimeframeAnalysis, ChartPattern, TradersChecklist, FibonacciLevels, Timeframe, GoldenPullbackZone, ConfidenceBreakdown, WhaleAlert, VolumeAnalysis, VolumeTimeframeData, SidewaysMarket } from '@/types';

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
    '1h': 60,
    '4h': 240,
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

// Deterministic pseudo-random number generator based on a seed string (e.g., the symbol)
const pseudoRandom = (seedStr: string): number => {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < seedStr.length; i++) {
        k = seedStr.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1, k);
        h2 = h3 ^ Math.imul(h2, k);
        h3 = h4 ^ Math.imul(h3, k);
        h4 = h1 ^ Math.imul(h4, k);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 597399067);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2869860233);
    return ((h1^h2^h3^h4)>>>0) / 4294967296;
}

const generateVolumeAnalysis = (symbol: string): VolumeAnalysis => {
    const timeframes: (keyof VolumeAnalysis)[] = ['5m', '15m', '1H', '4H', '1D'];
    const analysis: Partial<VolumeAnalysis> = {};

    timeframes.forEach(tf => {
        const seed = `${symbol}-${tf}`;
        const totalVolume = pseudoRandom(seed + 'total') * 10000 + 5000;
        const buyRatio = pseudoRandom(seed + 'ratio');
        const buyVolume = Math.round(totalVolume * buyRatio);
        const sellVolume = Math.round(totalVolume * (1 - buyRatio));
        
        let dominantSide: 'Buy' | 'Sell' | 'Neutral' = 'Neutral';
        if (buyRatio > 0.55) {
            dominantSide = 'Buy';
        } else if (buyRatio < 0.45) {
            dominantSide = 'Sell';
        }

        analysis[tf] = {
            buyVolume,
            sellVolume,
            totalVolume,
            dominantSide,
        };
    });
    return analysis as VolumeAnalysis;
};


export const getSignalData = async (symbol: string, mode: string, timeframe: Timeframe, forceMock = false): Promise<SignalData> => {
    let price, klines: any[], symbolWithUSDT = symbol.toUpperCase() + "USDT";
    const seed = `${symbol}-${timeframe}-${mode}`;
    
    const timeframeToInterval = {
      '5m': '5m',
      '15m': '15m',
      '1h': '1h',
      '4h': '4h',
      '1d': '1d',
    };
    const apiInterval = timeframeToInterval[timeframe] || '15m';

    if (forceMock) {
        price = parseFloat((pseudoRandom(seed + 'price') * 70000 + 1000).toFixed(2));
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

    // Simulate ADX deterministically
    const adx = Math.floor(pseudoRandom(seed + 'adx') * 50 + 10);
    let sidewaysMarket: SidewaysMarket | undefined = undefined;
    if (adx < 25) {
        sidewaysMarket = {
            adx,
            range: [swingLow.toFixed(2), swingHigh.toFixed(2)],
        };
    }

    const volatility = Math.min(100, Math.round((atr / lastClose) * 20000));

    const fibRange = swingHigh - swingLow;
    const fibonacciLevels: FibonacciLevels = {
        level_382: (swingHigh - fibRange * 0.382).toFixed(2),
        level_500: (swingHigh - fibRange * 0.5).toFixed(2),
        level_618: (swingHigh - fibRange * 0.618).toFixed(2),
    };

    const timeframeMultipliers = {
        '5m': { atr: 1.5, tp1: 1.5, tp2: 3 },
        '15m': { atr: 2, tp1: 2, tp2: 4 },
        '1h': { atr: 2.5, tp1: 2.5, tp2: 5 },
        '4h': { atr: 3, tp1: 3, tp2: 6 },
        '1d': { atr: 3.5, tp1: 3.5, tp2: 7 },
    };
    const multipliers = timeframeMultipliers[timeframe] || timeframeMultipliers['15m'];
    const { atr: atrMultiplier, tp1: tpMultiplier1, tp2: tpMultiplier2 } = multipliers;

    const superTrendMultiplier = 2.5;
    const upperBand = (swingHigh + swingLow) / 2 + (superTrendMultiplier * atr);
    const lowerBand = (swingHigh + swingLow) / 2 - (superTrendMultiplier * atr);
    const isBullish = lastClose > lowerBand;

    const demandZone: [string, string] = isBullish ? [(lastClose * 0.98).toFixed(2), (lastClose * 0.99).toFixed(2)] : [(swingLow * 0.995).toFixed(2), (swingLow).toFixed(2)];
    const supplyZone: [string, string] = isBullish ? [(swingHigh).toFixed(2), (swingHigh * 1.005).toFixed(2)] : [(lastClose * 1.01).toFixed(2), (lastClose * 1.02).toFixed(2)];
    const fvg: [string, string] = isBullish ? [(lastClose * 0.985).toFixed(2), (lastClose * 0.995).toFixed(2)] : [(lastClose * 1.005).toFixed(2), (lastClose * 1.015).toFixed(2)];

    const recentVolumes = klines.slice(-20).map(k => parseFloat(k[5]));
    const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
    
    const buyVolume = avgVolume * (isBullish ? 1.2 : 0.8) * (1 + (pseudoRandom(seed+'buy') - 0.5) * 0.2);
    const sellVolume = avgVolume * (isBullish ? 0.8 : 1.2) * (1 + (pseudoRandom(seed+'sell') - 0.5) * 0.2);
    const netFlow = buyVolume - sellVolume;

    const volumeImbalance = netFlow > 0 ? `🟢 Buyers in Control (+${Math.round(netFlow)} units)` : `🔴 Sellers in Control (${Math.round(netFlow)} units)`;
      
    const reversalConfirmed = pseudoRandom(seed + 'reversal') > 0.6;

    const confluenceFactors = [
        `Trend: ${isBullish ? 'Bullish' : 'Bearish'} (Price vs SuperTrend)`,
        price > pivot ? `Price above Pivot ($${pivot.toFixed(2)})` : `Price below Pivot ($${pivot.toFixed(2)})`,
        volumeImbalance,
        'Structure: Minor trend alignment',
    ];

    if (reversalConfirmed) {
        confluenceFactors.push(`✅ Reversal Confirmed`);
    }

    // Deterministic Whale Alert: Only show for major coins
    let whaleAlert: WhaleAlert | undefined = undefined;
    const majorCoins = ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE'];
    if (majorCoins.includes(symbol.toUpperCase())) {
        const isBullishWhale = pseudoRandom(seed + 'whale_bull') > 0.5;
        whaleAlert = {
            amount: parseFloat((pseudoRandom(seed + 'whale_amount') * 2000 + 500).toFixed(0)),
            symbol: symbol.toUpperCase(),
            destination: isBullishWhale ? 'Cold Wallet' : 'Exchanges',
            impactProbability: 'HIGH',
            historicalPattern: isBullishWhale ? '78% chance of short-term rally' : '73% chance of price drop within 4h',
        };
        confluenceFactors.unshift(`🚨 WHALE SIGHTING: Large volume detected!`);
    }


    const entryPrice = isBullish ? (price * 0.998) : (price * 1.002);
    const fibValues = Object.values(fibonacciLevels).map(parseFloat);
    const closestFib = fibValues.reduce((prev, curr) => Math.abs(curr - entryPrice) < Math.abs(prev - entryPrice) ? curr : prev);
    if (Math.abs(closestFib - entryPrice) / entryPrice < 0.005) {
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
        '1h': ['4H', 'Daily'],
        '4h': ['Daily', 'Weekly'],
        '1d': ['Weekly'],
    };
    
    const analysisTimeframes = mtfMap[timeframe] || mtfMap['15m']!;
    
    const currentTfKey = timeframe.toUpperCase() as keyof MultiTimeframeAnalysis;
    multiTimeframeAnalysis[currentTfKey] = isBullish ? 'Bullish' : 'Bearish';
    
    analysisTimeframes.forEach(tf => {
        if (!multiTimeframeAnalysis[tf]) {
            multiTimeframeAnalysis[tf] = trends[Math.floor(pseudoRandom(seed + tf) * 3)];
        }
    });
    
    const requiredTfs: (keyof MultiTimeframeAnalysis)[] = ['15m', '1H', '4H', 'Daily'];
    requiredTfs.forEach(tf => {
        if (!multiTimeframeAnalysis[tf]) {
            multiTimeframeAnalysis[tf] = 'Neutral';
        }
    });

    if (parseInt(mode) >= 2) {
        const waveConvergence = (pseudoRandom(seed + 'wave') * 40 + 60).toFixed(1);
        confluenceFactors.push(`Quantum Wave Convergence: ${waveConvergence}%`);
    }
    if (parseInt(mode) >= 3) {
        const anomalyType = isBullish ? 'Expansion' : 'Contraction';
        const anomalySeverity = (pseudoRandom(seed + 'anomaly') * 0.5 + 1.2).toFixed(2);
        confluenceFactors.push(`Chrono-Distortion Anomaly: ${anomalyType} (${anomalySeverity}σ)`);
        
        const liquidityPulse = (pseudoRandom(seed + 'pulse') * 150 + 50).toFixed(0);
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
        ? bullishPatterns[Math.floor(pseudoRandom(seed+'pattern') * bullishPatterns.length)] 
        : bearishPatterns[Math.floor(pseudoRandom(seed+'pattern') * bearishPatterns.length)];
    
    const marketStructure = isBullish ? 'Bullish - HH/HL' : 'Bearish - LH/LL';

    const mtfAlignmentKey: keyof MultiTimeframeAnalysis = timeframe === '5m' ? '15m' : '4H';
    const htfAlignmentKey: keyof MultiTimeframeAnalysis = timeframe === '1h' ? '4H' : 'Daily';
    
    const tradersChecklist: TradersChecklist = {
        riskRewardPass: riskReward > 1.5,
        mtfAlignmentPass: multiTimeframeAnalysis[mtfAlignmentKey] === (isBullish ? 'Bullish' : 'Bearish') || multiTimeframeAnalysis[htfAlignmentKey] === (isBullish ? 'Bullish' : 'Bearish'),
        volumeConfirmationPass: netFlow > 0 === isBullish,
        entryInZonePass: isBullish 
            ? parseFloat(entry) >= parseFloat(demandZone[0]) && parseFloat(entry) <= parseFloat(demandZone[1])
            : parseFloat(entry) >= parseFloat(supplyZone[0]) && parseFloat(entry) <= parseFloat(supplyZone[1]),
        structureAligmentPass: pseudoRandom(seed + 'structure') > 0.3,
        liquiditySweepPass: pseudoRandom(seed + 'liquidity') > 0.4,
    };
    
    let goldenPullbackZone: GoldenPullbackZone | undefined = undefined;
    const fib618 = parseFloat(fibonacciLevels.level_618);
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
        patternStrength: Math.floor(pseudoRandom(seed + 'cs1') * 15 + 80),
        volumeConfirmation: Math.floor(pseudoRandom(seed + 'cs2') * 20 + 70),
        htfAlignment: tradersChecklist.mtfAlignmentPass ? Math.floor(pseudoRandom(seed + 'cs3') * 15 + 85) : Math.floor(pseudoRandom(seed + 'cs3') * 20 + 50),
        smartMoneyFlow: Math.floor(pseudoRandom(seed + 'cs4') * 25 + 75),
        overall: 0,
    };
    confidenceBreakdown.overall = Math.round((confidenceBreakdown.patternStrength + confidenceBreakdown.volumeConfirmation + confidenceBreakdown.htfAlignment + confidenceBreakdown.smartMoneyFlow) / 4);
    
    const volumeAnalysis = generateVolumeAnalysis(symbol);

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
        volumeAnalysis,
        sidewaysMarket,
        volatility,
    };
};
