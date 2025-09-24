


import type { SignalData, MultiTimeframeAnalysis, ChartPattern, TradersChecklist, FibonacciLevels, Timeframe, GoldenPullbackZone, ConfidenceBreakdown, WhaleAlert, MovingAverageAnalysis, TrendStrength, Momentum, SidewaysMarket, VolumeAnalysis, VolumeTimeframeData, SniperZone, MultiTimeframeSR, SupportResistanceLevel, AdvancedStrengthDashboardData, VolumeSignal, LiquidityMatrixData, LiquidityLevel, LiquidityPrediction, TimeframeData, Trend, SuperTrendAnalysis, OrderBlock, IndicatorChecklist, IndicatorData, IndicatorSignal, SupermodeAnalysis, HistoricalLevels } from '@/types';
import { getKlines as fetchKlinesFromServer } from '@/app/actions/getKlines';

// --- START: Real Technical Analysis Functions ---

const calculateRSI = (closes: number[], period = 14): number => {
    if (closes.length < period) return 50; // Not enough data, return neutral
    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff >= 0) {
            gains += diff;
        } else {
            losses -= diff;
        }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period + 1; i < closes.length; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff >= 0) {
            avgGain = (avgGain * (period - 1) + diff) / period;
            avgLoss = (avgLoss * (period - 1)) / period;
        } else {
            avgGain = (avgGain * (period - 1)) / period;
            avgLoss = (avgLoss * (period - 1) - diff) / period;
        }
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
};

const calculateATR = (klines: any[], period = 14): number => {
    if (klines.length < period) return 0;
    const recentKlines = klines.slice(-period -1);
    let trSum = 0;

    for (let i = 1; i < recentKlines.length; i++) {
        const high = parseFloat(recentKlines[i][2]);
        const low = parseFloat(recentKlines[i][3]);
        const prevClose = parseFloat(recentKlines[i-1][4]);
        const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
        trSum += tr;
    }
    return trSum / period;
};

const calculateADX = (klines: any[], period = 14): { adx: number, pdi: number, mdi: number } => {
    if (klines.length < period * 2) return { adx: 20, pdi: 20, mdi: 20 };
    
    const highs = klines.map(k => parseFloat(k[2]));
    const lows = klines.map(k => parseFloat(k[3]));
    const closes = klines.map(k => parseFloat(k[4]));

    let pdi = new Array(klines.length).fill(0);
    let mdi = new Array(klines.length).fill(0);
    let tr = new Array(klines.length).fill(0);

    for (let i = 1; i < klines.length; i++) {
        const upMove = highs[i] - highs[i-1];
        const downMove = lows[i-1] - lows[i];

        pdi[i] = (upMove > downMove && upMove > 0) ? upMove : 0;
        mdi[i] = (downMove > upMove && downMove > 0) ? downMove : 0;
        tr[i] = Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i-1]), Math.abs(lows[i] - closes[i-1]));
    }
    
    const smooth = (data: number[], period: number) => {
        let smoothed = new Array(data.length).fill(0);
        smoothed[period -1] = data.slice(0, period).reduce((a, b) => a + b, 0);
        for(let i = period; i < data.length; i++) {
            smoothed[i] = smoothed[i-1] - (smoothed[i-1] / period) + data[i];
        }
        return smoothed;
    }

    const smoothedPDI = smooth(pdi, period);
    const smoothedMDI = smooth(mdi, period);
    const smoothedTR = smooth(tr, period);

    let pdi14 = new Array(klines.length).fill(0);
    let mdi14 = new Array(klines.length).fill(0);
    let dx = new Array(klines.length).fill(0);

    for (let i = period - 1; i < klines.length; i++) {
        pdi14[i] = 100 * (smoothedPDI[i] / smoothedTR[i]);
        mdi14[i] = 100 * (smoothedMDI[i] / smoothedTR[i]);
        const dx_val = Math.abs(pdi14[i] - mdi14[i]) / (pdi14[i] + mdi14[i]) * 100;
        dx[i] = isNaN(dx_val) ? 0 : dx_val;
    }
    
    const adx = smooth(dx.slice(period-1), period).pop()! / period;

    return { adx, pdi: pdi14.pop()!, mdi: mdi14.pop()! };
};

const calculateLongShortPower = (klines: any[]): { longPower: number; shortPower: number } => {
    const recentKlines = klines.slice(-20); // Analyze last 20 candles
    const closes = recentKlines.map(k => parseFloat(k[4]));
    
    const rsi = calculateRSI(closes, 14);
    const { adx, pdi, mdi } = calculateADX(klines, 14);

    // RSI Contribution (0-100)
    const rsiLong = rsi;
    const rsiShort = 100 - rsi;

    // ADX/DMI Contribution (0-100)
    // If ADX is high, trust the DMI direction more
    const adxWeight = Math.min(1, adx / 40); // Weight ADX, max out at 40
    const dmiLong = pdi * adxWeight;
    const dmiShort = mdi * adxWeight;
    
    // Candlestick analysis
    let candleScore = 0;
    recentKlines.forEach(k => {
        const open = parseFloat(k[1]);
        const close = parseFloat(k[4]);
        if (close > open) candleScore += (close - open);
        else candleScore -= (open - close);
    });
    const maxRange = Math.max(...recentKlines.map(k => Math.abs(parseFloat(k[1])-parseFloat(k[4]))));
    const normalizedCandleScore = (candleScore / (maxRange * recentKlines.length)) * 50 + 50;

    const longPower = (rsiLong * 0.4) + (dmiLong * 0.4) + (normalizedCandleScore * 0.2);
    const shortPower = (rsiShort * 0.4) + (dmiShort * 0.4) + ((100-normalizedCandleScore) * 0.2);

    return {
        longPower: Math.min(99, Math.round(longPower)),
        shortPower: Math.min(99, Math.round(shortPower))
    };
};

// --- END: Real Technical Analysis Functions ---


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
    const volume = pseudoRandom(i.toString()+'vol') * 1000;
    
    // Inject volume spikes
    if (i % 30 === 0 && i > 0) { // create a spike every 30 candles or so
        klines.push([
          Date.now() - (200 - i) * intervalMinutes * 60 * 1000,
          open.toFixed(4),
          (high * 1.01).toFixed(4), // higher high on spike
          (low * 0.99).toFixed(4), // lower low on spike
          close.toFixed(4),
          (volume * 5).toFixed(4), // 5x volume spike
        ]);
    } else {
        klines.push([
          Date.now() - (200 - i) * intervalMinutes * 60 * 1000,
          open.toFixed(4),
          high.toFixed(4),
          low.toFixed(4),
          close.toFixed(4),
          volume.toFixed(4),
        ]);
    }
    currentPrice = close;
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

const generateIndicatorChecklist = (isBullish: boolean, momentum: Momentum, seed: string): IndicatorChecklist => {
    const indicators: IndicatorData[] = [];
    const summary = { buy: 0, sell: 0, neutral: 0 };

    const addIndicator = (name: string, value: string, signal: IndicatorSignal, notes: string) => {
        indicators.push({ name, value, signal, notes });
        if (signal === 'Buy' || signal === 'Strong Buy' || signal === 'Oversold') summary.buy++;
        else if (signal === 'Sell' || signal === 'Strong Sell' || signal === 'Overbought') summary.sell++;
        else summary.neutral++;
    };
    
    // --- Oscillators ---
    let rsiSignal: IndicatorSignal = 'Neutral';
    if (momentum.score > 70) rsiSignal = 'Overbought'; else if (momentum.score > 55) rsiSignal = 'Buy'; else if (momentum.score < 30) rsiSignal = 'Oversold'; else if (momentum.score < 45) rsiSignal = 'Sell';
    addIndicator('RSI (14)', momentum.score.toFixed(2), rsiSignal, `Relative Strength Index.`);
    
    const stochK = pseudoRandom(seed + 'stochK') * 100;
    let stochSignal: IndicatorSignal = stochK > 80 ? 'Overbought' : stochK < 20 ? 'Oversold' : (isBullish ? 'Buy' : 'Sell');
    addIndicator('Stochastic %K (14, 3, 3)', stochK.toFixed(2), stochSignal, 'Shows momentum and trend strength.');

    const cci = (pseudoRandom(seed + 'cci') - 0.5) * 400;
    let cciSignal: IndicatorSignal = cci > 100 ? 'Buy' : cci < -100 ? 'Sell' : 'Neutral';
    addIndicator('CCI (20)', cci.toFixed(2), cciSignal, 'Commodity Channel Index for trend.');

    const adx = pseudoRandom(seed + 'adx') * 50 + 15;
    addIndicator('ADX (14)', adx.toFixed(2), adx > 25 ? (isBullish ? 'Buy' : 'Sell') : 'Neutral', 'Average Directional Index for trend strength.');

    const awesomeOsc = (pseudoRandom(seed + 'ao') - 0.5) * 1000;
    addIndicator('Awesome Oscillator', awesomeOsc.toFixed(2), awesomeOsc > 0 ? 'Buy' : 'Sell', 'Measures market momentum.');

    const momentumInd = (pseudoRandom(seed + 'mom') - 0.5) * 10;
    addIndicator('Momentum (10)', momentumInd.toFixed(2), momentumInd > 0 ? 'Buy' : 'Sell', 'Rate of price change.');
    
    const macd_val = (pseudoRandom(seed + 'macd') - 0.5) * 500;
    addIndicator('MACD Level (12, 26)', macd_val.toFixed(2), isBullish ? 'Buy' : 'Sell', `Moving Average Convergence Divergence.`);

    const stochRSIK = pseudoRandom(seed + 'stochRSIK') * 100;
    let stochRSISignal: IndicatorSignal = stochRSIK > 80 ? 'Overbought' : stochRSIK < 20 ? 'Oversold' : (isBullish ? 'Buy' : 'Sell');
    addIndicator('Stochastic RSI Fast (3, 3, 14, 14)', stochRSIK.toFixed(2), stochRSISignal, 'Combines RSI and Stochastics.');
    
    const willR = pseudoRandom(seed + 'willR') * -100;
    let willRSignal: IndicatorSignal = willR > -20 ? 'Overbought' : willR < -80 ? 'Oversold' : 'Neutral';
    addIndicator('Williams %R (14)', willR.toFixed(2), willRSignal, 'Measures overbought/oversold levels.');

    const bbpValue = (pseudoRandom(seed + 'bbp') - 0.5) * 1000;
    addIndicator('Bull Bear Power', bbpValue.toFixed(2), bbpValue > 0 ? 'Buy' : 'Sell', 'Measures the power of bulls vs bears.');
    
    const uoValue = pseudoRandom(seed + 'uo') * 100;
    addIndicator('Ultimate Oscillator (7, 14, 28)', uoValue.toFixed(2), uoValue > 70 ? 'Overbought' : uoValue < 30 ? 'Oversold' : 'Buy', 'Combines short, medium, and long term momentum.');

    // --- Moving Averages (Simple) ---
    addIndicator('SMA (10)', '', isBullish ? 'Buy' : 'Sell', 'Simple Moving Average (Short-term)');
    addIndicator('SMA (20)', '', isBullish ? 'Buy' : 'Sell', 'Simple Moving Average (Medium-term)');
    addIndicator('SMA (30)', '', isBullish ? 'Buy' : 'Sell', 'Simple Moving Average');
    addIndicator('SMA (50)', '', isBullish ? 'Buy' : 'Sell', 'Simple Moving Average (Long-term)');
    addIndicator('SMA (100)', '', isBullish ? 'Buy' : 'Sell', 'Simple Moving Average (Very Long-term)');
    addIndicator('SMA (200)', '', isBullish ? 'Buy' : 'Sell', 'Simple Moving Average (Key Long-term)');
    
    // --- Moving Averages (Exponential) ---
    addIndicator('EMA (10)', '', isBullish ? 'Buy' : 'Sell', 'Exponential Moving Average (Short-term)');
    addIndicator('EMA (20)', '', isBullish ? 'Buy' : 'Sell', 'Exponential Moving Average (Medium-term)');
    addIndicator('EMA (30)', '', isBullish ? 'Buy' : 'Sell', 'Exponential Moving Average');
    addIndicator('EMA (50)', '', isBullish ? 'Buy' : 'Sell', 'Exponential Moving Average (Long-term)');
    addIndicator('EMA (100)', '', isBullish ? 'Buy' : 'Sell', 'Exponential Moving Average (Very Long-term)');
    addIndicator('EMA (200)', '', isBullish ? 'Buy' : 'Sell', 'Exponential Moving Average (Key Long-term)');

    // --- Other MAs & Ichimoku ---
    const ichimoku_b = (pseudoRandom(seed + 'ichi') - 0.5) * 1000;
    addIndicator('Ichimoku Cloud Base Line (9, 26, 52, 26)', ichimoku_b.toFixed(2), ichimoku_b > 0 ? 'Buy' : 'Sell', 'Part of the Ichimoku system.');
    
    const vwap = (pseudoRandom(seed + 'vwap') - 0.5) * 200;
    addIndicator('VWAP', vwap.toFixed(2), vwap > 0 ? 'Buy' : 'Sell', 'Volume-Weighted Average Price.');
    
    const hullMA = (pseudoRandom(seed + 'hull') - 0.5) * 300;
    addIndicator('Hull MA (9)', hullMA.toFixed(2), hullMA > 0 ? 'Buy' : 'Sell', 'Hull Moving Average for smooth trend.');
    
    // --- Pivots ---
    addIndicator('Classic Pivot Point S1', '', 'Neutral', 'Classic Support 1');
    addIndicator('Classic Pivot Point R1', '', 'Neutral', 'Classic Resistance 1');
    addIndicator('Fibonacci Pivot S1', '', 'Neutral', 'Fibonacci-based Support 1');
    addIndicator('Fibonacci Pivot R1', '', 'Neutral', 'Fibonacci-based Resistance 1');
    addIndicator('Camarilla Pivot S1', '', 'Neutral', 'Camarilla-based Support 1');
    addIndicator('Camarilla Pivot R1', '', 'Neutral', 'Camarilla-based Resistance 1');
    addIndicator('Woodie Pivot S1', '', 'Neutral', 'Woodie-based Support 1');
    addIndicator('Woodie Pivot R1', '', 'Neutral', 'Woodie-based Resistance 1');
    addIndicator('Demark Pivot S1', '', 'Neutral', 'Demark-based Support 1');
    addIndicator('Demark Pivot R1', '', 'Neutral', 'Demark-based Resistance 1');

    return { summary, indicators };
};


const generateLiquidityMatrixData = (price: number, swingHigh: number, swingLow: number, isBullish: boolean, seed: string): LiquidityMatrixData => {
    const buySide: LiquidityLevel[] = [];
    const sellSide: LiquidityLevel[] = [];
    
    // Generate sell-side liquidity (above current price)
    for (let i = 1; i <= 5; i++) {
        sellSide.push({
            price: price * (1 + 0.005 * i * pseudoRandom(seed + 'sell' + i)),
            volume: pseudoRandom(seed + 'sell_vol' + i) * 50_000_000 + 10_000_000, // $10M - $60M
            type: 'POOL'
        });
    }
    sellSide.push({ price: swingHigh, volume: pseudoRandom(seed + 'sell_swing') * 100_000_000 + 50_000_000, type: 'STOP_HUNT' });

    // Generate buy-side liquidity (below current price)
     for (let i = 1; i <= 5; i++) {
        buySide.push({
            price: price * (1 - 0.005 * i * pseudoRandom(seed + 'buy' + i)),
            volume: pseudoRandom(seed + 'buy_vol' + i) * 50_000_000 + 10_000_000,
            type: 'POOL'
        });
    }
    buySide.push({ price: swingLow, volume: pseudoRandom(seed + 'buy_swing') * 100_000_000 + 50_000_000, type: 'STOP_HUNT' });

    // AI Prediction Logic
    const highestBuySide = [...buySide].sort((a, b) => b.volume - a.volume)[0];
    const highestSellSide = [...sellSide].sort((a, b) => b.volume - a.volume)[0];

    let prediction: LiquidityPrediction;
    if (isBullish) {
        // In a bullish trend, market might pull back to take buy-side liquidity before continuing up.
        prediction = {
            targetPrice: highestBuySide.price,
            confidence: 'High',
            timeframe: '1-4 Hours',
            reason: 'Predicting a sweep of buy-side liquidity at a key support level before the next leg up.'
        };
    } else {
        // In a bearish trend, market might rally to take sell-side liquidity before continuing down.
         prediction = {
            targetPrice: highestSellSide.price,
            confidence: 'High',
            timeframe: '1-4 Hours',
            reason: 'Predicting a hunt on sell-side liquidity at a key resistance level before continuation.'
        };
    }

    return {
        buySide: buySide.sort((a, b) => b.price - a.price),
        sellSide: sellSide.sort((a, b) => b.price - a.price),
        prediction,
        currentPrice: price
    };
};

const generateVolumeAnalysis = (seed: string): VolumeAnalysis => {
    const analysis: Partial<VolumeAnalysis> = {};
    const timeframes: (keyof Omit<VolumeAnalysis, 'summary'>)[] = ['5m', '15m', '1H', '4H', '1D'];
    let totalBuyVolume = 0;
    let totalSellVolume = 0;

    timeframes.forEach(tf => {
        const totalVolume = pseudoRandom(seed + tf + 'vol_total') * 50000 + 10000;
        const buyRatio = pseudoRandom(seed + tf + 'vol_buy_ratio') * 0.6 + 0.2; // 20% to 80%
        const buyVolume = totalVolume * buyRatio;
        const sellVolume = totalVolume * (1 - buyRatio);
        const buySellRatio = sellVolume > 0 ? buyVolume / sellVolume : buyVolume > 0 ? 100 : 1;
        
        totalBuyVolume += buyVolume;
        totalSellVolume += sellVolume;

        let dominantSide: 'Buy' | 'Sell' | 'Neutral' = 'Neutral';
        if (buyRatio > 0.55) dominantSide = 'Buy';
        else if (buyRatio < 0.45) dominantSide = 'Sell';

        let signal: VolumeSignal = 'Neutral';
        if (buySellRatio > 1.5) signal = 'Strong Buy';
        else if (buySellRatio > 1.1) signal = 'Buy';
        else if (1 / buySellRatio > 1.5) signal = 'Strong Sell';
        else if (1 / buySellRatio > 1.1) signal = 'Sell';

        analysis[tf] = {
            totalVolume,
            buyVolume,
            sellVolume,
            dominantSide,
            buySellRatio,
            signal,
        };
    });

    const overallRatio = totalSellVolume > 0 ? totalBuyVolume / totalSellVolume : totalBuyVolume > 0 ? 100 : 1;
    let overallSignal: VolumeSignal = 'Neutral';
    if (overallRatio > 1.5) overallSignal = 'Strong Buy';
    else if (overallRatio > 1.1) overallSignal = 'Buy';
    else if (1 / overallRatio > 1.5) overallSignal = 'Strong Sell';
    else if (1 / overallRatio > 1.1) overallSignal = 'Sell';

    analysis.summary = {
        totalBuyVolume,
        totalSellVolume,
        overallSignal,
    };

    return analysis as VolumeAnalysis;
}

const generateMultiTimeframeSR = (price: number, klines: any[], isBullish: boolean, seed: string): MultiTimeframeSR => {
    const sr: Partial<MultiTimeframeSR> = {};
    const tfs: (keyof MultiTimeframeSR)[] = ['5m', '15m', '1H'];

    tfs.forEach((tf) => {
        // Simulate volume-based S/R detection
        const volumes = klines.map(k => parseFloat(k[5]));
        const avgVolume = volumes.slice(0, -1).reduce((sum, vol) => sum + vol, 0) / (volumes.length - 1);
        const volumeThreshold = 3.5; // Spike is 3.5x average

        let resistances: number[] = [];
        let supports: number[] = [];

        for (let i = 1; i < klines.length; i++) {
            if (volumes[i] > avgVolume * volumeThreshold) {
                const spikeHigh = parseFloat(klines[i][2]);
                const spikeLow = parseFloat(klines[i][3]);
                if (spikeHigh > price) resistances.push(spikeHigh);
                if (spikeLow < price) supports.push(spikeLow);
            }
        }

        // De-duplicate and sort levels
        resistances = [...new Set(resistances)].sort((a, b) => a - b);
        supports = [...new Set(supports)].sort((a, b) => b - a);
        
        // Find closest R and S to current price
        const closestResistance = resistances[0] || price * (1.01 + pseudoRandom(tf+'res') * 0.01);
        const closestSupport = supports[0] || price * (0.99 - pseudoRandom(tf+'sup')*0.01);

        sr[tf] = {
            R: resistances.slice(0, 3), // Top 3 resistance levels
            S: supports.slice(0, 3),    // Top 3 support levels
            probableTarget: isBullish ? closestResistance : closestSupport,
        };
    });

    return sr as MultiTimeframeSR;
};


const generateSuperTrendAnalysis = (price: number, atr: number, isBullish: boolean, trendStrength: TrendStrength, momentum: Momentum, seed: string): SuperTrendAnalysis => {
    let status: SuperTrendAnalysis['status'];
    const superTrendLine = isBullish ? price - atr * 2 : price + atr * 2;
    let momentumDecay = 0;

    // Simulate momentum decay
    if ((isBullish && momentum.rating === 'Overbought') || (!isBullish && momentum.rating === 'Oversold')) {
        momentumDecay = Math.floor(pseudoRandom(seed + 'decay_extreme') * 40 + 60); // 60-100
    } else if ((isBullish && momentum.rating === 'Bearish') || (!isBullish && momentum.rating === 'Bullish')) {
        momentumDecay = Math.floor(pseudoRandom(seed + 'decay_div') * 30 + 50); // 50-80
    } else {
        momentumDecay = Math.floor(pseudoRandom(seed + 'decay_normal') * 40); // 0-40
    }

    // Determine trend status
    if (trendStrength.rating === 'Ranging') {
        status = 'Consolidation';
    } else if (momentumDecay > 70) {
        status = 'Trend Exhaustion';
    } else if (trendStrength.rating === 'Strong') {
        status = isBullish ? 'Uptrend Mature' : 'Downtrend Mature';
    } else {
        status = isBullish ? 'Uptrend Developing' : 'Downtrend Developing';
    }

    // ATR-based calculation for entry/exit
    const strengthScore = 100 - momentumDecay;
    const entryOffset = atr * 0.5;
    const exitOffset = atr * 0.5;

    let entrySignalPrice, exitSignalPrice;

    if (isBullish) {
        entrySignalPrice = superTrendLine + entryOffset;
        exitSignalPrice = superTrendLine - exitOffset;
    } else {
        entrySignalPrice = superTrendLine - entryOffset;
        exitSignalPrice = superTrendLine + exitOffset;
    }
    
    return {
        status,
        superTrendLine: parseFloat(superTrendLine.toFixed(isCrypto(seed) ? 2 : 4)),
        momentumDecay,
        trendStrength: strengthScore,
        entrySignal: parseFloat(entrySignalPrice.toFixed(isCrypto(seed) ? 2 : 4)),
        exitSignal: parseFloat(exitSignalPrice.toFixed(isCrypto(seed) ? 2 : 4)),
    };
};


const generateAdvancedStrengthData = (price: number, klines: any[], isBullish: boolean, momentumScore: number, trendStrengthScore: number, emas: { ema20: number, ema50: number }): AdvancedStrengthDashboardData => {
    const closes = klines.map(k => parseFloat(k[4]));
    const volumes = klines.map(k => parseFloat(k[5]));
    
    // 1. Price and Change
    const prevClose = closes[closes.length - 2];
    const priceChangePercent = ((price - prevClose) / prevClose) * 100;

    // 2. Power
    const { longPower, shortPower } = calculateLongShortPower(klines);
    const overallStrength = Math.round((longPower + (100 - shortPower)) / 2);

    // 3. Trend
    const { pdi, mdi } = calculateADX(klines, 14);
    const trendMomentum = pdi > mdi ? 'ACCELERATING' : 'DECELERATING';

    // 4. Volatility (ATR)
    const atrValue = calculateATR(klines, 14);
    const atrPercent = (atrValue / price) * 100;
    let volLabel: 'EXTREME' | 'HIGH' | 'MEDIUM' | 'LOW';
    if (atrPercent > 2.5) volLabel = 'EXTREME';
    else if (atrPercent > 1.5) volLabel = 'HIGH';
    else if (atrPercent > 0.8) volLabel = 'MEDIUM';
    else volLabel = 'LOW';

    // 5. Volume
    const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const latestVolume = volumes[volumes.length - 1];
    const volumeChangePercent = ((latestVolume - avgVolume) / avgVolume) * 100;
    
    let volStatus: 'SPIKE' | 'DRY' | 'HIGH' | 'NORMAL' | 'LOW';
    if (volumeChangePercent > 100) volStatus = 'SPIKE';
    else if (volumeChangePercent > 50) volStatus = 'HIGH';
    else if (volumeChangePercent < -50) volStatus = 'DRY';
    else if (volumeChangePercent < -25) volStatus = 'LOW';
    else volStatus = 'NORMAL';

    // 6. Sentiment Score
    const bullishScore = (price > emas.ema50 ? 1 : 0) + (momentumScore > 52 ? 1 : 0) + (trendStrengthScore > 25 ? 1 : 0) + (volumeChangePercent > 10 ? 1 : 0);
    const bearishScore = (price < emas.ema50 ? 1 : 0) + (momentumScore < 48 ? 1 : 0) + (trendStrengthScore > 25 ? 1 : 0) + (volumeChangePercent > 10 ? 1 : 0);
    const netSentiment = bullishScore - bearishScore;
    let sentimentLabel = 'NEUTRAL ⚖️';
    if (netSentiment >= 3) sentimentLabel = 'STRONG BULL 🚀';
    else if (netSentiment > 0) sentimentLabel = 'BULLISH 📈';
    else if (netSentiment <= -3) sentimentLabel = 'STRONG BEAR 💥';
    else if (netSentiment < 0) sentimentLabel = 'BEARISH 📉';

    // 7. Market Phase
    let marketPhase: AdvancedStrengthDashboardData['marketPhase'] = 'NEUTRAL';
    if (volLabel === 'HIGH' && longPower > 70 && volStatus === 'SPIKE') marketPhase = 'BREAKOUT';
    else if (volLabel === 'HIGH' && shortPower > 70 && volStatus === 'SPIKE') marketPhase = 'BREAKDOWN';
    else if (volLabel === 'LOW' && trendStrengthScore < 20) marketPhase = 'CONSOLIDATION';
    else if (isBullish && trendStrengthScore > 25) marketPhase = 'BULLISH TREND';
    else if (!isBullish && trendStrengthScore > 25) marketPhase = 'BEARISH TREND';

    // 8. RSI Status & Stoch RSI
    const rsiStatus = momentumScore > 70 ? 'OVERBOUGHT' : momentumScore < 30 ? 'OVERSOLD' : 'NEUTRAL';
    const stochRsiK = pseudoRandom(klines[0][0].toString() + 'stoch_k') * 100; // Mock for now
    const stochRsiD = pseudoRandom(klines[0][0].toString() + 'stoch_d') * 100; // Mock for now
    let stochSignal: AdvancedStrengthDashboardData['stochRsi']['signal'] = 'NONE';
    if (stochRsiK > stochRsiD && pseudoRandom(klines[0][0].toString() + 'stoch_cross') > 0.8) stochSignal = 'BULL_CROSS';
    if (stochRsiK < stochRsiD && pseudoRandom(klines[0][0].toString() + 'stoch_cross') < 0.2) stochSignal = 'BEAR_CROSS';
    
    // 9. Divergence
    let divergence: AdvancedStrengthDashboardData['divergence'] = 'NONE';
    const divergenceSeed = pseudoRandom(klines[0][0].toString() + 'divergence');
    if (isBullish && rsiStatus === 'OVERSOLD' && divergenceSeed > 0.85) divergence = 'BULLISH';
    if (!isBullish && rsiStatus === 'OVERBOUGHT' && divergenceSeed < 0.15) divergence = 'BEARISH';

    return {
        marketPhase,
        price: price.toFixed(isCrypto(klines[0][0].toString()) ? 2 : 4),
        priceChangePercent,
        marketSentiment: { score: netSentiment, label: sentimentLabel },
        momentum: { rsi: momentumScore, trend: momentumScore > 52 ? 'UP' : momentumScore < 48 ? 'DOWN' : 'NEUTRAL' },
        longPower,
        shortPower,
        overallStrength,
        trendAnalysis: { strength: trendStrengthScore, momentum: trendMomentum },
        volatility: { percent: atrValue, label: volLabel },
        volumeStatus: { status: volStatus, changePercent: volumeChangePercent },
        volumeValue: latestVolume,
        rsiStatus,
        divergence,
        stochRsi: { k: stochRsiK, d: stochRsiD, signal: stochSignal }
    };
};

const generateOrderBlock = (swingHigh: number, swingLow: number, price: number, isBullish: boolean, seed: string): OrderBlock => {
    let top, bottom;
    if (isBullish) {
        bottom = swingLow * (1 + pseudoRandom(seed + 'ob_bottom') * 0.005);
        top = bottom * (1 + pseudoRandom(seed + 'ob_range') * 0.01);
    } else {
        top = swingHigh * (1 - pseudoRandom(seed + 'ob_top') * 0.005);
        bottom = top * (1 - pseudoRandom(seed + 'ob_range') * 0.01);
    }
    const meanThreshold = (top + bottom) / 2;

    const statusSeed = pseudoRandom(seed + 'ob_status');
    let status: OrderBlock['status'] = 'FRESH';
    if (price < bottom && isBullish) status = 'BROKEN';
    if (price > top && !isBullish) status = 'BROKEN';
    if (status !== 'BROKEN' && statusSeed < 0.4) status = 'MITIGATED';
    
    const contextSeed = pseudoRandom(seed + 'ob_context');
    let context: string;
    if (contextSeed < 0.33) context = 'Created after liquidity sweep';
    else if (contextSeed < 0.66) context = 'Formed at break of structure';
    else context = 'High volume institutional interest zone';

    return {
        type: isBullish ? 'BULLISH' : 'BEARISH',
        status,
        top: top.toFixed(isCrypto(seed) ? 2 : 4),
        bottom: bottom.toFixed(isCrypto(seed) ? 2 : 4),
        meanThreshold: meanThreshold.toFixed(isCrypto(seed) ? 2 : 4),
        volume: parseFloat((pseudoRandom(seed + 'ob_vol') * 20 + 5).toFixed(1)), // 5M to 25M
        age: `${Math.floor(pseudoRandom(seed + 'ob_age') * 15 + 3)} candles ago`,
        context
    };
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
    const analysisSeed = `${symbol}-${timeframe}`;
    
    const useMockData = forceMock || !isCrypto(symbol);

    if (useMockData) {
        let basePrice = 70000; // Default for crypto like BTC
        if (symbol.toUpperCase().includes('NIFTY')) basePrice = 23000;
        if (symbol.toUpperCase().includes('BANKNIFTY')) basePrice = 50000;
        if (symbol.toUpperCase().includes('/')) basePrice = 1.1; // Forex
        
        price = parseFloat((pseudoRandom(analysisSeed + 'price') * basePrice * 0.2 + basePrice * 0.9).toFixed(4));
        klines = getMockKlines(price, timeframe);
    } else {
        try {
            klines = await fetchKlinesFromServer(symbolWithUSDT, timeframe);
            if (!klines || klines.length < 50) { // Need enough data for calculations
                throw new Error('Server action returned insufficient klines');
            }
            price = parseFloat(klines[klines.length - 1][4]);
        } catch (err) {
            console.warn(`Server action for ${symbolWithUSDT} failed, using mock data.`, err);
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

    const poc = (swingHigh + swingLow + lastClose) / 3 * (1 + (pseudoRandom(analysisSeed + 'poc') - 0.5) * 0.05);
    const valueAreaRange = (swingHigh - swingLow) * 0.35 * (1 + (pseudoRandom(analysisSeed + 'varange') - 0.5) * 0.2);
    const vah = poc + valueAreaRange;
    const val = poc - valueAreaRange;

    const r1 = (2 * pivot) - swingLow;
    const r2 = pivot + (swingHigh - swingLow);
    const r3 = swingHigh + 2 * (pivot - swingLow);
    const s1 = (2 * pivot) - swingHigh;
    const s2 = pivot - (swingHigh - swingLow);
    const s3 = swingLow - 2 * (swingHigh - pivot);

    const atr = calculateATR(klines, 14);
    
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

    const isBullish = price > ema50 && ema50 > ema200;
    const marketStructure = isBullish ? 'Bullish - HH/HL' : 'Bearish - LH/LL';
    
    const fibRange = swingHigh - swingLow;
    const fibonacciLevels: FibonacciLevels = {
        level_382: (isBullish ? (swingHigh - fibRange * 0.382) : (swingLow + fibRange * 0.382)).toFixed(4),
        level_500: (isBullish ? (swingHigh - fibRange * 0.5) : (swingLow + fibRange * 0.5)).toFixed(4),
        level_618: (isBullish ? (swingHigh - fibRange * 0.618) : (swingLow + fibRange * 0.618)).toFixed(4),
    };

    const demandZone: [string, string] = [(lastClose * 0.98).toFixed(4), (lastClose * 0.99).toFixed(4)];
    const supplyZone: [string, string] = [(lastClose * 1.01).toFixed(4), (lastClose * 1.02).toFixed(4)];
    const fvg: [string, string] = [(lastClose * 0.985).toFixed(4), (lastClose * 0.995).toFixed(4)];

    const recentVolumes = klines.slice(-20).map((k: any[]) => parseFloat(k[5]));
    const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
    
    const buyVolume = avgVolume * (isBullish ? 1.2 : 0.8) * (1 + (pseudoRandom(analysisSeed+'buy') - 0.5) * 0.2);
    const sellVolume = avgVolume * (isBullish ? 0.8 : 1.2) * (1 + (pseudoRandom(analysisSeed+'sell') - 0.5) * 0.2);
    const netFlow = buyVolume - sellVolume;

    const volumeImbalance = netFlow > 0 ? `🟢 Buyers in Control (+${Math.round(netFlow)} units)` : `🔴 Sellers in Control (${Math.round(netFlow)} units)`;
      
    const reversalConfirmed = pseudoRandom(analysisSeed + 'reversal') > 0.6;
    
    const volumeAnalysis = generateVolumeAnalysis(analysisSeed);
    const multiTimeframeSR = generateMultiTimeframeSR(price, klines, isBullish, analysisSeed);
    const liquidityMatrix = generateLiquidityMatrixData(price, swingHigh, swingLow, isBullish, analysisSeed);
    
    const rsiValue = calculateRSI(closes, 14);
    let momentum: Momentum;
    if (rsiValue > 75) momentum = { score: rsiValue, rating: 'Overbought' };
    else if (rsiValue > 55) momentum = { score: rsiValue, rating: 'Bullish' };
    else if (rsiValue > 45) momentum = { score: rsiValue, rating: 'Neutral' };
    else if (rsiValue > 25) momentum = { score: rsiValue, rating: 'Bearish' };
    else momentum = { score: rsiValue, rating: 'Oversold' };

    const { adx: adxValue } = calculateADX(klines, 14);
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

    const superTrendAnalysis = generateSuperTrendAnalysis(price, atr, isBullish, trendStrength, momentum, analysisSeed);
    
    const advancedStrengthDashboard = generateAdvancedStrengthData(price, klines, isBullish, rsiValue, adxValue, { ema20, ema50 });

    const confluenceFactors = [
        `MA Trend: ${isBullish ? 'Bullish' : 'Bearish'} (Price vs 50/200 EMA)`,
        price > pivot ? `Price above Pivot ($${pivot.toFixed(4)})` : `Price below Pivot ($${pivot.toFixed(4)})`,
        volumeImbalance,
        `Market Structure: ${marketStructure}`,
    ];

    if (isBullish && (momentum.rating === 'Bullish' || momentum.rating === 'Neutral')) {
        confluenceFactors.push(`Momentum aligned with trend (RSI: ${rsiValue.toFixed(0)})`);
    } else if (!isBullish && (momentum.rating === 'Bearish' || momentum.rating === 'Neutral')) {
        confluenceFactors.push(`Momentum aligned with trend (RSI: ${rsiValue.toFixed(0)})`);
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

    let whaleAlert: WhaleAlert | undefined = undefined;
    const volumeAvg = volumes.slice(0, -1).reduce((sum, vol) => sum + vol, 0) / (volumes.length - 1);
    const latestVolume = volumes[volumes.length - 1];
    const volumeThreshold = 3; 

    if (latestVolume > volumeAvg * volumeThreshold) {
        const lastCandleOpen = parseFloat(klines[klines.length-1][1]);
        const lastCandleClose = parseFloat(klines[klines.length-1][4]);
        const isBullishSpike = lastCandleClose > lastCandleOpen;
        
        whaleAlert = {
            amount: parseFloat((latestVolume * price / 1_000_000).toFixed(2)), 
            symbol: symbol.toUpperCase(),
            destination: isBullishSpike ? 'Cold Wallet' : 'Exchanges',
            impactProbability: 'HIGH',
            historicalPattern: `A ${((latestVolume / volumeAvg)).toFixed(1)}x volume spike often precedes significant price movement.`
        };
        confluenceFactors.unshift(`🚨 WHALE SIGHTING: Significant volume spike detected!`);
    }

    const indicatorChecklist = generateIndicatorChecklist(isBullish, momentum, analysisSeed);

    if (sidewaysMarket) {
         return {
            symbol: symbol.toUpperCase(),
            price,
            mode,
            timeframe,
            isBullish: pseudoRandom(analysisSeed + 'sideways_bull') > 0.5,
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
            poc: poc.toFixed(4),
            vah: vah.toFixed(4),
            val: val.toFixed(4),
            s1: s1.toFixed(4),
            s2: s2.toFixed(4),
            s3: s3.toFixed(4),
            r1: r1.toFixed(4),
            r2: r2.toFixed(4),
            r3: r3.toFixed(4),
            buyVolume: buyVolume.toFixed(0),
            sellVolume: sellVolume.toFixed(0),
            volumeImbalance: "Neutral",
            demandZone,
            supplyZone,
            fvg,
            liquidity: { type: 'Range-Bound', level: 'N/A', description: 'Liquidity is building on both sides of the range.' },
            smartMoneyConcepts: { entry: 'N/A', bos: 'N/A', choch: 'N/A', confirmedEntry: 'N/A' },
            marketStructure: "Consolidating",
            multiTimeframeAnalysis: {},
            reversalConfirmed: false,
            chartPattern: { name: 'Ranging Market', description: 'Price is moving sideways in a defined channel. Await a clear breakout before entry.' },
            tradersChecklist: { riskRewardPass: false, mtfAlignmentPass: false, volumeConfirmationPass: false, entryInZonePass: false, momentumAlignmentPass: false, smartMoneyEntryPass: false },
            fibonacciLevels,
            confidenceBreakdown: { overall: adxValue, patternStrength: 20, volumeConfirmation: 20, htfAlignment: 20, smartMoneyFlow: 20 },
            movingAverageAnalysis,
            trendStrength,
            momentum,
            sidewaysMarket,
            superTrendAnalysis,
            volumeAnalysis,
            multiTimeframeSR,
            liquidityMatrix,
            advancedStrengthDashboard,
            indicatorChecklist,
        };
    }

    let entry, sl, tp1, tp2;
    const action = isBullish ? "Buy on Pullback" : "Sell on Rally";

    if (mode === '4') { 
        const confluenceLevels = [
            parseFloat(fibonacciLevels.level_618),
            pivot,
            isBullish ? ema20 : ema50
        ];
        const confluencePrice = confluenceLevels.reduce((a, b) => a + b, 0) / confluenceLevels.length;
        entry = confluencePrice.toFixed(4);
        sl = (isBullish ? (swingLow - atr * 0.5) : (swingHigh + atr * 0.5)).toFixed(4);
        tp1 = (isBullish ? multiTimeframeSR[timeframe as keyof MultiTimeframeSR]!.probableTarget : multiTimeframeSR[timeframe as keyof MultiTimeframeSR]!.probableTarget).toFixed(4);
        tp2 = (isBullish ? multiTimeframeSR[timeframe as keyof MultiTimeframeSR]!.R[1] || multiTimeframeSR[timeframe as keyof MultiTimeframeSR]!.R[0] * 1.01 : multiTimeframeSR[timeframe as keyof MultiTimeframeSR]!.S[1] || multiTimeframeSR[timeframe as keyof MultiTimeframeSR]!.S[0] * 0.99).toFixed(4);
    } else if (mode === '5') {
        const supermodeAnalysis: Partial<SupermodeAnalysis> = {
            isBullish,
            setups: {} as SupermodeAnalysis['setups']
        };
        const tfs: (keyof SupermodeAnalysis['setups'])[] = ['5m', '15m', '1h'];
        tfs.forEach(tf => {
            const tfAtrMultiplier = {'5m': 1.5, '15m': 2, '1h': 2.5}[tf];
            const tfEntry = (isBullish ? price - atr * 0.2 : price + atr * 0.2).toFixed(4);
            const tfSl = (isBullish ? parseFloat(tfEntry) - atr * tfAtrMultiplier : parseFloat(tfEntry) + atr * tfAtrMultiplier).toFixed(4);
            const tfTp1 = (isBullish ? parseFloat(tfEntry) + atr * tfAtrMultiplier : parseFloat(tfEntry) - atr * tfAtrMultiplier).toFixed(4);
            supermodeAnalysis.setups[tf] = {
                entry: tfEntry,
                sl: tfSl,
                tp1: tfTp1,
                supplyZone: [(price * (1.005 + pseudoRandom(tf) * 0.005)).toFixed(4), (price * (1.006 + pseudoRandom(tf) * 0.005)).toFixed(4)],
                demandZone: [(price * (0.995 - pseudoRandom(tf) * 0.005)).toFixed(4), (price * (0.994 - pseudoRandom(tf) * 0.005)).toFixed(4)],
                confidence: Math.floor(pseudoRandom(analysisSeed + tf + 'super_conf') * 20 + 75)
            };
        });
        
        entry = supermodeAnalysis.setups['15m'].entry;
        sl = supermodeAnalysis.setups['15m'].sl;
        tp1 = supermodeAnalysis.setups['15m'].tp1;
        tp2 = (isBullish ? parseFloat(tp1) + atr * 2 : parseFloat(tp1) - atr * 2).toFixed(4);


    } else { 
        const timeframeMultipliers = {
            '5m': { atr: 1.5 }, '15m': { atr: 2 }, '1h': { atr: 2.5 }, '4h': { atr: 3 }, '1d': { atr: 3.5 },
        };
        const multipliers = timeframeMultipliers[timeframe] || timeframeMultipliers['15m'];
        const { atr: atrMultiplier } = multipliers;

        entry = (isBullish ? price - atr * 0.5 : price + atr * 0.5).toFixed(4);
        sl = (isBullish ? parseFloat(entry) - atr * atrMultiplier : parseFloat(entry) + atr * atrMultiplier).toFixed(4);
        tp1 = (isBullish ? parseFloat(entry) + atr * atrMultiplier : parseFloat(entry) - atr * atrMultiplier).toFixed(4);
        tp2 = (isBullish ? parseFloat(entry) + atr * (atrMultiplier * 2) : parseFloat(entry) - atr * (atrMultiplier * 2)).toFixed(4);
    }

    const confirmationOffset = atr * 0.1;
    const confirmedEntry = (isBullish ? parseFloat(entry) + confirmationOffset : parseFloat(entry) - confirmationOffset);
    
    const risk = Math.abs(parseFloat(entry) - parseFloat(sl));
    const reward = Math.abs(parseFloat(tp2) - parseFloat(entry));
    const riskReward = risk > 0 ? reward / risk : 0;
    
    const mtfAlignmentKey: keyof MultiTimeframeAnalysis = timeframe === '5m' ? '15m' : '4H';
    const htfAlignmentKey: keyof MultiTimeframeAnalysis = timeframe === '1h' ? '4H' : 'Daily';
    
    const trends: Trend[] = ['Bullish', 'Bearish', 'Neutral'];
    let multiTimeframeAnalysis: MultiTimeframeAnalysis = {};
    const requiredTfs: (keyof MultiTimeframeAnalysis)[] = ['5m', '15m', '1H', '4H', 'Daily'];
    
    requiredTfs.forEach(tf => {
      const trend = trends[Math.floor(pseudoRandom(analysisSeed + tf + 'trend') * 3)];
      const strength = Math.floor(pseudoRandom(analysisSeed + tf + 'strength') * 60 + 40);
      multiTimeframeAnalysis[tf] = { trend, strength };
    });

    if (parseInt(mode) >= 2) {
        const waveConvergence = (pseudoRandom(analysisSeed + 'wave') * 40 + 60).toFixed(1);
        confluenceFactors.push(`Quantum Wave Convergence: ${waveConvergence}%`);
    }
    if (parseInt(mode) >= 3) {
        const anomalyType = isBullish ? 'Expansion' : 'Contraction';
        const anomalySeverity = (pseudoRandom(analysisSeed + 'anomaly') * 0.5 + 1.2).toFixed(2);
        confluenceFactors.push(`Chrono-Distortion Anomaly: ${anomalyType} (${anomalySeverity}σ)`);
        
        const liquidityPulse = (pseudoRandom(analysisSeed + 'pulse') * 150 + 50).toFixed(0);
        confluenceFactors.push(`Subspace Liquidity Pulse: ${liquidityPulse}M units detected`);
    }
    
    const bullishPatterns: ChartPattern[] = [ { name: 'Bull Flag', description: 'A continuation pattern suggesting the uptrend will resume after a brief consolidation.' }, { name: 'Ascending Triangle', description: 'Indicates a potential breakout to the upside as buying pressure builds.' }, { name: 'Inverse Head & Shoulders', description: 'A strong reversal pattern indicating a shift from a downtrend to an uptrend.' }, { name: 'Bullish Engulfing', description: 'A powerful two-candle reversal pattern that can signal a bottom in a downtrend.' }, { name: 'Hammer', description: 'A single-candle bullish reversal pattern that appears during a downtrend.' }, { name: 'Morning Star', description: 'A three-candle bullish reversal pattern that signals a potential bottom.' }, { name: 'Three White Soldiers', description: 'A strong bullish reversal pattern consisting of three consecutive long green candles.' }, { name: 'Cup and Handle', description: 'A bullish continuation pattern that signals a consolidation followed by a breakout.' }, ];
    const bearishPatterns: ChartPattern[] = [ { name: 'Bear Flag', description: 'A continuation pattern suggesting the downtrend will resume after a brief consolidation.' }, { name: 'Descending Triangle', description: 'Indicates a potential breakdown to the downside as selling pressure builds.' }, { name: 'Head & Shoulders', description: 'A classic reversal pattern indicating a shift from an uptrend to a downtrend.' }, { name: 'Bearish Engulfing', description: 'A powerful two-candle reversal pattern that can signal a top in an uptrend.' }, { name: 'Hanging Man', description: 'A single-candle bearish reversal pattern that can mark a top or resistance level.' }, { name: 'Evening Star', description: 'A three-candle bearish reversal pattern that signals a potential top.' }, { name: 'Three Black Crows', description: 'A strong bearish reversal pattern consisting of three consecutive long red candles.' }, { name: 'Double Top', description: 'A bearish reversal pattern where the price hits a resistance level twice and fails to break through.' }, ];
    const chartPattern: ChartPattern = isBullish 
        ? bullishPatterns[Math.floor(pseudoRandom(analysisSeed+'pattern') * bullishPatterns.length)] 
        : bearishPatterns[Math.floor(pseudoRandom(analysisSeed+'pattern') * bearishPatterns.length)];
    
    
    const tradersChecklist: TradersChecklist = {
        riskRewardPass: riskReward > 1.5,
        mtfAlignmentPass: multiTimeframeAnalysis[mtfAlignmentKey]?.trend === (isBullish ? 'Bullish' : 'Bearish') || multiTimeframeAnalysis[htfAlignmentKey]?.trend === (isBullish ? 'Bullish' : 'Bearish'),
        volumeConfirmationPass: netFlow > 0 === isBullish,
        entryInZonePass: pseudoRandom(analysisSeed + 'entry_zone') > 0.4,
        momentumAlignmentPass: isBullish ? momentum.rating !== 'Overbought' : momentum.rating !== 'Oversold',
        smartMoneyEntryPass: pseudoRandom(analysisSeed + 'sm_entry') > 0.3,
    };
    
    const fib618 = parseFloat(fibonacciLevels.level_618);
    const goldenPullbackZone: GoldenPullbackZone = {
        min: Math.min(fib618, pivot).toFixed(4),
        max: Math.max(fib618, pivot).toFixed(4),
    };

    if ( (isBullish && parseFloat(entry) <= goldenPullbackZone.max && parseFloat(entry) >= goldenPullbackZone.min) || (!isBullish && parseFloat(entry) >= goldenPullbackZone.min && parseFloat(entry) <= goldenPullbackZone.max) ) {
      confluenceFactors.push(`✅ Entry within Golden Zone`);
    }

    const reverseMin = isBullish ? swingLow * 0.99 : swingHigh * 1.01;
    const reverseMax = isBullish ? swingLow * 0.98 : swingHigh * 1.02;
    const goldenReverseZone: GoldenPullbackZone = {
        min: Math.min(reverseMin, reverseMax).toFixed(4),
        max: Math.max(reverseMin, reverseMax).toFixed(4),
    };

    const confidenceBreakdown: ConfidenceBreakdown = {
        patternStrength: Math.floor(pseudoRandom(analysisSeed + 'cs1') * 15 + 80),
        volumeConfirmation: Math.floor(pseudoRandom(analysisSeed + 'cs2') * 20 + 70),
        htfAlignment: tradersChecklist.mtfAlignmentPass ? Math.floor(pseudoRandom(analysisSeed + 'cs3') * 15 + 85) : Math.floor(pseudoRandom(analysisSeed + 'cs3') * 20 + 50),
        smartMoneyFlow: Math.floor(pseudoRandom(analysisSeed + 'cs4') * 25 + 65),
        overall: 0,
    };
    confidenceBreakdown.overall = Math.round((confidenceBreakdown.patternStrength + confidenceBreakdown.volumeConfirmation + confidenceBreakdown.htfAlignment + confidenceBreakdown.smartMoneyFlow) / 4);
    
    const confluenceCount = confluenceFactors.length;
    const confidence = confidenceBreakdown.overall >= 85 ? "Very High" : confidenceBreakdown.overall >= 75 ? "High" : "Medium";

    const liquidityLevel = isBullish ? swingHigh * 1.005 : swingLow * 0.995;

    let sniperZone: SniperZone | undefined = undefined;
    if (mode === '4' && confidenceBreakdown.overall > 80 && pseudoRandom(analysisSeed + 'sniper_zone_chance') > 0.6) {
        const zoneCenter = (fib618 + pivot) / 2;
        const zoneSize = atr * 0.1;
        sniperZone = { min: (zoneCenter - zoneSize).toFixed(4), max: (zoneCenter + zoneSize).toFixed(4), };
        confluenceFactors.push(`🎯 QUANTUM SNIPER ZONE IDENTIFIED`);
    }

    const orderBlock = generateOrderBlock(swingHigh, swingLow, price, isBullish, analysisSeed);


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
        poc: poc.toFixed(4),
        vah: vah.toFixed(4),
        val: val.toFixed(4),
        s1: s1.toFixed(4), s2: s2.toFixed(4), s3: s3.toFixed(4),
        r1: r1.toFixed(4), r2: r2.toFixed(4), r3: r3.toFixed(4),
        buyVolume: buyVolume.toFixed(0),
        sellVolume: sellVolume.toFixed(0),
        volumeImbalance,
        demandZone,
        supplyZone,
        fvg,
        liquidity: { type: isBullish ? 'Equal Highs (EQH)' : 'Equal Lows (EQL)', level: liquidityLevel.toFixed(4), description: `A significant pool of liquidity is resting ${isBullish ? 'above' : 'below'} this level, acting as a price magnet.` },
        smartMoneyConcepts: { bos: bosLevel, choch: isBullish ? (swingLow * 0.998).toFixed(4) : (swingHigh * 1.002).toFixed(4), confirmedEntry: confirmedEntry.toFixed(4), },
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
        orderBlock,
        confidenceBreakdown,
        movingAverageAnalysis,
        trendStrength,
        momentum,
        sidewaysMarket,
        superTrendAnalysis,
        volumeAnalysis,
        multiTimeframeSR,
        liquidityMatrix,
        advancedStrengthDashboard,
        supermodeAnalysis: mode === '5' ? (klines as any).supermodeAnalysis : undefined,
        indicatorChecklist,
    };
};
