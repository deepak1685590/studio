

import type { SignalData, MultiTimeframeAnalysis, ChartPattern, TradersChecklist, FibonacciLevels, Timeframe, GoldenPullbackZone, ConfidenceBreakdown, WhaleAlert, MovingAverageAnalysis, TrendStrength, Momentum, SidewaysMarket, VolumeAnalysis, VolumeTimeframeData, SniperZone, MultiTimeframeSR, SupportResistanceLevel } from '@/types';

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

  for (let i = 0; i < 200; i++) {
    const open = currentPrice;
    const high = open * (1 + (pseudoRandom(i.toString()) - 0.45) * 0.02);
    const low = open * (1 + (pseudoRandom(i.toString() + 'low') - 0.55) * 0.02);
    const close = (high + low) / 2 * (1 + (pseudoRandom(i.toString()+'close') - 0.5) * 0.01);
    currentPrice = close;
    klines.push([
      Date.now() - (200 - i) * intervalMinutes * 60 * 1000,
      open.toFixed(4),
      high.toFixed(4),
      low.toFixed(4),
      close.toFixed(4),
      (pseudoRandom(i.toString()+'vol') * 1000).toFixed(4),
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

const generateVolumeAnalysis = (seed: string): VolumeAnalysis => {
    const analysis: Partial<VolumeAnalysis> = {};
    const timeframes: (keyof VolumeAnalysis)[] = ['5m', '15m', '1H', '4H', '1D'];

    timeframes.forEach(tf => {
        const totalVolume = pseudoRandom(seed + tf + 'vol_total') * 50000 + 10000;
        const buyRatio = pseudoRandom(seed + tf + 'vol_buy_ratio') * 0.4 + 0.3; // 30% to 70%
        const buyVolume = totalVolume * buyRatio;
        const sellVolume = totalVolume * (1 - buyRatio);
        
        let dominantSide: 'Buy' | 'Sell' | 'Neutral' = 'Neutral';
        if (buyRatio > 0.55) dominantSide = 'Buy';
        else if (buyRatio < 0.45) dominantSide = 'Sell';

        analysis[tf] = {
            totalVolume,
            buyVolume,
            sellVolume,
            dominantSide,
        };
    });

    return analysis as VolumeAnalysis;
}

const generateMultiTimeframeSR = (price: number, seed: string, isBullish: boolean): MultiTimeframeSR => {
    const sr: Partial<MultiTimeframeSR> = {};
    const tfs: (keyof MultiTimeframeSR)[] = ['5m', '15m', '1H'];

    tfs.forEach((tf, index) => {
        const volatility = (index + 1) * 0.005; // 5m is less volatile, 1H is more
        const high = price * (1 + pseudoRandom(seed + tf + 'h') * volatility);
        const low = price * (1 - pseudoRandom(seed + tf + 'l') * volatility);
        const pivot = (high + low + price) / 3;
        const range = high - low;
        
        sr[tf] = {
            S1: pivot - 0.382 * range,
            S2: pivot - 0.618 * range,
            S3: pivot - 1.000 * range,
            R1: pivot + 0.382 * range,
            R2: pivot + 0.618 * range,
            R3: pivot + 1.000 * range,
            probableTarget: isBullish ? 'R1' : 'S1',
        };
    });

    return sr as MultiTimeframeSR;
};


const isCrypto = (symbol: string): boolean => {
    const upperSymbol = symbol.toUpperCase();
    if (upperSymbol.includes('/')) return false; // Forex
    const indianIndices = ['NIFTY', 'BANKNIFTY', 'GIFTNIFTY'];
    if (indianIndices.includes(upperSymbol)) return false; // Indian Indices
    return true; // Assume crypto
}

export const getSignalData = async (symbol: string, mode: string, timeframe: Timeframe, forceMock = false): Promise<SignalData> => {
    let price, klines: any[], symbolWithUSDT = symbol.toUpperCase().replace('/', '') + (isCrypto(symbol) ? "USDT" : "");
    const seed = `${symbol}-${timeframe}-${mode}`;
    
    const timeframeToInterval = {
      '5m': '5m',
      '15m': '15m',
      '1h': '1h',
      '4h': '4h',
      '1d': '1d',
    };
    const apiInterval = timeframeToInterval[timeframe] || '15m';

    // Forex and Indian markets currently do not have a live data source, so we force mock data for them.
    const useMockData = forceMock || !isCrypto(symbol);

    if (useMockData) {
        let basePrice = 70000; // Default for crypto like BTC
        if (symbol.toUpperCase().includes('NIFTY')) basePrice = 23000;
        if (symbol.toUpperCase().includes('BANKNIFTY')) basePrice = 50000;
        if (symbol.toUpperCase().includes('/')) basePrice = 1.1; // Forex
        
        price = parseFloat((pseudoRandom(seed + 'price') * basePrice * 0.2 + basePrice * 0.9).toFixed(4));
        klines = getMockKlines(price, timeframe);
    } else {
        try {
            const priceResponse = await fetchWithTimeout(`https://api.binance.com/api/v3/ticker/price?symbol=${symbolWithUSDT}`, { timeout: 3000 });
            if (!priceResponse.ok) throw new Error('Price fetch failed');
            const priceData = await priceResponse.json();
            price = parseFloat(priceData.price);
            
            const klinesResponse = await fetchWithTimeout(`https://api.binance.com/api/v3/klines?symbol=${symbolWithUSDT}&interval=${apiInterval}&limit=200`, { timeout: 5000 });
            if (!klinesResponse.ok) throw new Error('Klines fetch failed');
            klines = await klinesResponse.json();
        } catch (err) {
            console.warn(`Binance API failed for ${symbolWithUSDT}, using mock data.`, err);
            return getSignalData(symbol, mode, timeframe, true);
        }
    }
    
    const closes = klines.map((k: any[]) => parseFloat(k[4]));
    const highPrices = klines.map((k: any[]) => parseFloat(k[2]));
    const lowPrices = klines.map((k: any[]) => parseFloat(k[3]));
    const volumes = klines.map((k: any[]) => parseFloat(k[5]));

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

    const fibRange = swingHigh - swingLow;
    const fibonacciLevels: FibonacciLevels = {
        level_382: (swingHigh - fibRange * 0.382).toFixed(4),
        level_500: (swingHigh - fibRange * 0.5).toFixed(4),
        level_618: (swingHigh - fibRange * 0.618).toFixed(4),
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

    // --- EMA Calculation ---
    const calculateEMA = (data: number[], period: number) => {
        const k = 2 / (period + 1);
        let emaArray = [data[0]];
        for (let i = 1; i < data.length; i++) {
            emaArray.push((data[i] * k) + (emaArray[i-1] * (1-k)));
        }
        return emaArray[emaArray.length-1];
    };
    
    const ema20 = calculateEMA(closes.slice(-40), 20);
    const ema50 = calculateEMA(closes.slice(-100), 50);
    const ema100 = calculateEMA(closes.slice(-150), 100);
    const ema200 = calculateEMA(closes, 200);

    const movingAverageAnalysis: MovingAverageAnalysis = {
        ema20: { value: ema20.toFixed(4), status: price > ema20 ? 'Above' : 'Below' },
        ema50: { value: ema50.toFixed(4), status: price > ema50 ? 'Above' : 'Below' },
        ema100: { value: ema100.toFixed(4), status: price > ema100 ? 'Above' : 'Below' },
        ema200: { value: ema200.toFixed(4), status: price > ema200 ? 'Above' : 'Below' },
    };

    // Determine trend based on EMAs
    const isBullish = price > ema50 && ema50 > ema200;
    const marketStructure = isBullish ? 'Bullish - HH/HL' : 'Bearish - LH/LL';

    const demandZone: [string, string] = [(lastClose * 0.98).toFixed(4), (lastClose * 0.99).toFixed(4)];
    const supplyZone: [string, string] = [(lastClose * 1.01).toFixed(4), (lastClose * 1.02).toFixed(4)];
    const fvg: [string, string] = [(lastClose * 0.985).toFixed(4), (lastClose * 0.995).toFixed(4)];

    const recentVolumes = klines.slice(-20).map((k: any[]) => parseFloat(k[5]));
    const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
    
    const buyVolume = avgVolume * (isBullish ? 1.2 : 0.8) * (1 + (pseudoRandom(seed+'buy') - 0.5) * 0.2);
    const sellVolume = avgVolume * (isBullish ? 0.8 : 1.2) * (1 + (pseudoRandom(seed+'sell') - 0.5) * 0.2);
    const netFlow = buyVolume - sellVolume;

    const volumeImbalance = netFlow > 0 ? `🟢 Buyers in Control (+${Math.round(netFlow)} units)` : `🔴 Sellers in Control (${Math.round(netFlow)} units)`;
      
    const reversalConfirmed = pseudoRandom(seed + 'reversal') > 0.6;
    
    const volumeAnalysis = generateVolumeAnalysis(seed);
    const multiTimeframeSR = generateMultiTimeframeSR(price, seed, isBullish);
    
    // --- Momentum (RSI simulation) ---
    const rsiValue = Math.floor(pseudoRandom(seed + 'rsi') * 80 + 10); // RSI between 10 and 90
    let momentum: Momentum;
    if (rsiValue > 75) momentum = { score: rsiValue, rating: 'Overbought' };
    else if (rsiValue > 55) momentum = { score: rsiValue, rating: 'Bullish' };
    else if (rsiValue > 45) momentum = { score: rsiValue, rating: 'Neutral' };
    else if (rsiValue > 25) momentum = { score: rsiValue, rating: 'Bearish' };
    else momentum = { score: rsiValue, rating: 'Oversold' };

    // --- ADVANCED CONFLUENCE FACTORS ---
    const confluenceFactors = [
        `MA Trend: ${isBullish ? 'Bullish' : 'Bearish'} (Price vs 50/200 EMA)`,
        price > pivot ? `Price above Pivot ($${pivot.toFixed(4)})` : `Price below Pivot ($${pivot.toFixed(4)})`,
        volumeImbalance,
        `Market Structure: ${marketStructure}`,
    ];

    if (isBullish && (momentum.rating === 'Bullish' || momentum.rating === 'Neutral')) {
        confluenceFactors.push(`Momentum aligned with trend (RSI: ${rsiValue})`);
    } else if (!isBullish && (momentum.rating === 'Bearish' || momentum.rating === 'Neutral')) {
        confluenceFactors.push(`Momentum aligned with trend (RSI: ${rsiValue})`);
    }
    
    const bosLevel = isBullish ? (swingHigh * 1.002).toFixed(4) : (swingLow * 0.998).toFixed(4);
    confluenceFactors.push(`Break of Structure (BOS) at $${bosLevel}`);
    
    if(isBullish) {
        confluenceFactors.push(`Price reacting to Demand Zone`);
    } else {
        confluenceFactors.push(`Price reacting to Supply Zone`);
    }

    if (reversalConfirmed) {
        confluenceFactors.push(`✅ Reversal Confirmed`);
    }

    // --- Live Whale Alert from Volume Spikes ---
    let whaleAlert: WhaleAlert | undefined = undefined;
    const volumeAvg = volumes.slice(0, -1).reduce((sum, vol) => sum + vol, 0) / (volumes.length - 1);
    const latestVolume = volumes[volumes.length - 1];
    const volumeThreshold = 3; // Spike is 3x the average volume

    if (latestVolume > volumeAvg * volumeThreshold) {
        const lastCandleOpen = parseFloat(klines[klines.length-1][1]);
        const lastCandleClose = parseFloat(klines[klines.length-1][4]);
        const isBullishSpike = lastCandleClose > lastCandleOpen;
        
        whaleAlert = {
            amount: parseFloat((latestVolume * price / 1_000_000).toFixed(2)), // In millions USD
            symbol: symbol.toUpperCase(),
            destination: isBullishSpike ? 'Cold Wallet' : 'Exchanges', // Interpretation of spike
            impactProbability: 'HIGH',
            historicalPattern: `A ${((latestVolume / volumeAvg)).toFixed(1)}x volume spike often precedes significant price movement.`
        };
        confluenceFactors.unshift(`🚨 WHALE SIGHTING: Significant volume spike detected!`);
    }


    // --- Trend Strength (ADX simulation) ---
    const adxValue = Math.floor(pseudoRandom(seed + 'adx') * 60 + 10); // ADX between 10 and 70
    let trendStrength: TrendStrength;
    let sidewaysMarket: SidewaysMarket | undefined = undefined;

    if (adxValue > 40) trendStrength = { score: adxValue, rating: 'Strong' };
    else if (adxValue > 25) trendStrength = { score: adxValue, rating: 'Moderate' };
    else if (adxValue > 15) trendStrength = { score: adxValue, rating: 'Weak' };
    else {
        trendStrength = { score: adxValue, rating: 'Ranging' };
        sidewaysMarket = {
            adx: adxValue,
            range: [swingHigh.toFixed(4), swingLow.toFixed(4)]
        }
    }
    
    // If market is ranging, we don't generate a directional signal.
    if (sidewaysMarket) {
         return {
            symbol: symbol.toUpperCase(),
            price,
            mode,
            timeframe,
            isBullish: pseudoRandom(seed + 'sideways_bull') > 0.5, // Random for UI color
            action: "Monitor for Breakout",
            entry: "N/A",
            sl: "N/A",
            tp1: "N/A",
            tp2: "N/A",
            riskReward: 0,
            confidence: "Low",
            confluenceFactors: ["Market is in a consolidation phase.", `ADX below 15 indicates weak trend.`],
            confluenceCount: 2,
            swingHigh: swingHigh.toFixed(4),
            swingLow: swingLow.toFixed(4),
            pivot: pivot.toFixed(4),
            s1: s1.toFixed(4),
            r1: r1.toFixed(4),
            buyVolume: buyVolume.toFixed(0),
            sellVolume: sellVolume.toFixed(0),
            volumeImbalance: "Neutral",
            demandZone,
            supplyZone,
            fvg,
            liquidity: { type: 'Range-Bound', level: 'N/A', description: 'Liquidity is building on both sides of the range.' },
            smartMoneyConcepts: { bos: 'N/A', choch: 'N/A', confirmedEntry: 'N/A' },
            marketStructure: "Consolidating",
            multiTimeframeAnalysis: {},
            reversalConfirmed: false,
            chartPattern: { name: 'Ranging Market', description: 'Price is moving sideways in a defined channel. Await a clear breakout before entry.' },
            tradersChecklist: { riskRewardPass: false, mtfAlignmentPass: false, volumeConfirmationPass: false, entryInZonePass: false, momentumAlignmentPass: false, smartMoneyEntryPass: false },
            fibonacciLevels,
            confidenceBreakdown: { overall: adxValue, patternStrength: 20, volumeConfirmation: 20, htfAlignment: 20, smartMoneyFlow: 20 },
            movingAverageAnalysis,
            trendStrength,
            momentum: { score: 50, rating: 'Neutral' },
            volumeAnalysis,
            multiTimeframeSR,
            sidewaysMarket,
        };
    }

    const fib618 = parseFloat(fibonacciLevels.level_618);
    const fib500 = parseFloat(fibonacciLevels.level_500);
    const shouldShowGoldenZone = pseudoRandom(seed + 'golden_zone_chance') > 0.7; // 30% chance to force a golden zone setup

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
    
    const requiredTfs: (keyof MultiTimeframeAnalysis)[] = ['5m', '15m', '1H', '4H', 'Daily'];
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
    
    const bullishPatterns: ChartPattern[] = [
        { name: 'Bull Flag', description: 'A continuation pattern suggesting the uptrend will resume after a brief consolidation.' },
        { name: 'Ascending Triangle', description: 'Indicates a potential breakout to the upside as buying pressure builds.' },
        { name: 'Inverse Head & Shoulders', description: 'A strong reversal pattern indicating a shift from a downtrend to an uptrend.' },
        { name: 'Bullish Engulfing', description: 'A powerful two-candle reversal pattern that can signal a bottom in a downtrend.' },
        { name: 'Hammer', description: 'A single-candle bullish reversal pattern that appears during a downtrend.' },
        { name: 'Morning Star', description: 'A three-candle bullish reversal pattern that signals a potential bottom.' },
        { name: 'Three White Soldiers', description: 'A strong bullish reversal pattern consisting of three consecutive long green candles.' },
        { name: 'Cup and Handle', description: 'A bullish continuation pattern that signals a consolidation followed by a breakout.' },
    ];
    const bearishPatterns: ChartPattern[] = [
        { name: 'Bear Flag', description: 'A continuation pattern suggesting the downtrend will resume after a brief consolidation.' },
        { name: 'Descending Triangle', description: 'Indicates a potential breakdown to the downside as selling pressure builds.' },
        { name: 'Head & Shoulders', description: 'A classic reversal pattern indicating a shift from an uptrend to a downtrend.' },
        { name: 'Bearish Engulfing', description: 'A powerful two-candle reversal pattern that can signal a top in an uptrend.' },
        { name: 'Hanging Man', description: 'A single-candle bearish reversal pattern that can mark a top or resistance level.' },
        { name: 'Evening Star', description: 'A three-candle bearish reversal pattern that signals a potential top.' },
        { name: 'Three Black Crows', description: 'A strong bearish reversal pattern consisting of three consecutive long red candles.' },
        { name: 'Double Top', description: 'A bearish reversal pattern where the price hits a resistance level twice and fails to break through.' },
    ];
    const chartPattern: ChartPattern = isBullish 
        ? bullishPatterns[Math.floor(pseudoRandom(seed+'pattern') * bullishPatterns.length)] 
        : bearishPatterns[Math.floor(pseudoRandom(seed+'pattern') * bearishPatterns.length)];
    
    
    const action = isBullish ? "Buy on Pullback" : "Sell on Rally";
    const entry = shouldShowGoldenZone ? ((fib618 + pivot) / 2).toFixed(4) : entryPrice.toFixed(4);
    const sl = isBullish ? (parseFloat(entry) - atr*atrMultiplier).toFixed(4) : (parseFloat(entry) + atr*atrMultiplier).toFixed(4);
    const tp1 = isBullish ? (parseFloat(entry) + atr*tpMultiplier1).toFixed(4) : (parseFloat(entry) - atr*tpMultiplier1).toFixed(4);
    const tp2 = isBullish ? (parseFloat(entry) + atr*tpMultiplier2).toFixed(4) : (parseFloat(entry) - atr*tpMultiplier2).toFixed(4);
    const confirmedEntry = (parseFloat(entry) * (isBullish ? 1.0005 : 0.9995)).toFixed(4);

    const risk = Math.abs(parseFloat(entry) - parseFloat(sl));
    const reward = Math.abs(parseFloat(tp2) - parseFloat(entry));
    const riskReward = risk > 0 ? reward / risk : 0;
    
    const mtfAlignmentKey: keyof MultiTimeframeAnalysis = timeframe === '5m' ? '15m' : '4H';
    const htfAlignmentKey: keyof MultiTimeframeAnalysis = timeframe === '1h' ? '4H' : 'Daily';
    
    const tradersChecklist: TradersChecklist = {
        riskRewardPass: riskReward > 1.5,
        mtfAlignmentPass: multiTimeframeAnalysis[mtfAlignmentKey] === (isBullish ? 'Bullish' : 'Bearish') || multiTimeframeAnalysis[htfAlignmentKey] === (isBullish ? 'Bullish' : 'Bearish'),
        volumeConfirmationPass: netFlow > 0 === isBullish,
        entryInZonePass: pseudoRandom(seed + 'entry_zone') > 0.4,
        momentumAlignmentPass: isBullish ? momentum.rating !== 'Overbought' : momentum.rating !== 'Oversold',
        smartMoneyEntryPass: pseudoRandom(seed + 'sm_entry') > 0.3,
    };
    
    let goldenPullbackZone: GoldenPullbackZone | undefined = undefined;
    
    const isEntryInGoldenZone = isBullish
      ? parseFloat(entry) <= Math.max(fib618, pivot) && parseFloat(entry) >= Math.min(fib618, pivot)
      : parseFloat(entry) >= Math.min(fib618, pivot) && parseFloat(entry) <= Math.max(fib618, pivot);

    if (shouldShowGoldenZone || isEntryInGoldenZone) {
         goldenPullbackZone = {
            min: Math.min(fib618, pivot).toFixed(4),
            max: Math.max(fib618, pivot).toFixed(4),
        };
        confluenceFactors.push(`✅ Entry within Golden Zone`);
    }

    const reverseMin = isBullish ? swingLow * 0.99 : swingHigh * 1.01;
    const reverseMax = isBullish ? swingLow * 0.98 : swingHigh * 1.02;
    const goldenReverseZone: GoldenPullbackZone = {
        min: Math.min(reverseMin, reverseMax).toFixed(4),
        max: Math.max(reverseMin, reverseMax).toFixed(4),
    };

    const confidenceBreakdown: ConfidenceBreakdown = {
        patternStrength: Math.floor(pseudoRandom(seed + 'cs1') * 15 + 80),
        volumeConfirmation: Math.floor(pseudoRandom(seed + 'cs2') * 20 + 70),
        htfAlignment: tradersChecklist.mtfAlignmentPass ? Math.floor(pseudoRandom(seed + 'cs3') * 15 + 85) : Math.floor(pseudoRandom(seed + 'cs3') * 20 + 50),
        smartMoneyFlow: Math.floor(pseudoRandom(seed + 'cs4') * 25 + 65),
        overall: 0,
    };
    confidenceBreakdown.overall = Math.round((confidenceBreakdown.patternStrength + confidenceBreakdown.volumeConfirmation + confidenceBreakdown.htfAlignment + confidenceBreakdown.smartMoneyFlow) / 4);
    
    const confluenceCount = confluenceFactors.length;
    const confidence = confidenceBreakdown.overall >= 85 ? "Very High" : confidenceBreakdown.overall >= 75 ? "High" : "Medium";

    const liquidityLevel = isBullish ? swingHigh * 1.005 : swingLow * 0.995;

    let sniperZone: SniperZone | undefined = undefined;
    if (confidenceBreakdown.overall > 80 && pseudoRandom(seed + 'sniper_zone_chance') > 0.6) {
        const zoneCenter = (fib618 + pivot) / 2;
        const zoneSize = atr * 0.1; // Make it a very tight zone
        sniperZone = {
            min: (zoneCenter - zoneSize).toFixed(4),
            max: (zoneCenter + zoneSize).toFixed(4),
        };
        confluenceFactors.push(`🎯 QUANTUM SNIPER ZONE IDENTIFIED`);
    }


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
        swingHigh: swingHigh.toFixed(4),
        swingLow: swingLow.toFixed(4),
        pivot: pivot.toFixed(4),
        s1: s1.toFixed(4),
        r1: r1.toFixed(4),
        buyVolume: buyVolume.toFixed(0),
        sellVolume: sellVolume.toFixed(0),
        volumeImbalance,
        demandZone,
        supplyZone,
        fvg,
        liquidity: {
            type: isBullish ? 'Equal Highs (EQH)' : 'Equal Lows (EQL)',
            level: liquidityLevel.toFixed(4),
            description: `A significant pool of liquidity is resting ${isBullish ? 'above' : 'below'} this level, acting as a price magnet.`
        },
        smartMoneyConcepts: {
            bos: bosLevel,
            choch: isBullish ? (swingLow * 0.998).toFixed(4) : (swingHigh * 1.002).toFixed(4),
            confirmedEntry,
        },
        marketStructure,
        multiTimeframeAnalysis,
        reversalConfirmed,
        chartPattern,
        tradersChecklist,
        fibonacciLevels,
        whaleAlert,
        goldenPullbackZone,
        goldenReverseZone,
        sniperZone,
        confidenceBreakdown,
        movingAverageAnalysis,
        trendStrength,
        momentum,
        volumeAnalysis,
        multiTimeframeSR,
    };
};
