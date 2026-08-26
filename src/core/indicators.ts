import { Candle } from './types';

export class TechnicalIndicators {
  // Média Móvel Simples (SMA)
  public static calculateSMA(prices: number[], period: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
      } else {
        const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        result.push(sum / period);
      }
    }
    return result;
  }

  // Média Móvel Exponencial (EMA)
  public static calculateEMA(prices: number[], period: number): number[] {
    const result: number[] = [];
    const multiplier = 2 / (period + 1);

    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
      } else if (i === period - 1) {
        const sum = prices.slice(0, period).reduce((a, b) => a + b, 0);
        result.push(sum / period);
      } else {
        const currentEma = (prices[i] - result[i - 1]) * multiplier + result[i - 1];
        result.push(currentEma);
      }
    }
    return result;
  }

  // Índice de Força Relativa (RSI)
  public static calculateRSI(closes: number[], period: number = 14): number[] {
    const result: number[] = [];
    let gains = 0;
    let losses = 0;

    for (let i = 0; i < closes.length; i++) {
      if (i === 0) {
        result.push(NaN);
        continue;
      }

      const diff = closes[i] - closes[i - 1];
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? -diff : 0;

      if (i <= period) {
        gains += gain;
        losses += loss;
        if (i === period) {
          const avgGain = gains / period;
          const avgLoss = losses / period;
          const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
          result.push(100 - (100 / (1 + rs)));
        } else {
          result.push(NaN);
        }
      } else {
        const prevAvgGain = (gains / period);
        const prevAvgLoss = (losses / period);
        const currentAvgGain = (prevAvgGain * (period - 1) + gain) / period;
        const currentAvgLoss = (prevAvgLoss * (period - 1) + loss) / period;
        gains = currentAvgGain * period;
        losses = currentAvgLoss * period;

        const rs = currentAvgLoss === 0 ? 100 : currentAvgGain / currentAvgLoss;
        result.push(100 - (100 / (1 + rs)));
      }
    }
    return result;
  }

  // Average True Range (ATR)
  public static calculateATR(candles: Candle[], period: number = 14): number[] {
    const result: number[] = [];
    const tr: number[] = [];

    for (let i = 0; i < candles.length; i++) {
      if (i === 0) {
        tr.push(candles[i].high - candles[i].low);
      } else {
        const hl = candles[i].high - candles[i].low;
        const hc = Math.abs(candles[i].high - candles[i - 1].close);
        const lc = Math.abs(candles[i].low - candles[i - 1].close);
        tr.push(Math.max(hl, hc, lc));
      }
    }

    let sum = 0;
    for (let i = 0; i < candles.length; i++) {
      if (i < period - 1) {
        sum += tr[i];
        result.push(NaN);
      } else if (i === period - 1) {
        sum += tr[i];
        result.push(sum / period);
      } else {
        const currentAtr = (result[i - 1] * (period - 1) + tr[i]) / period;
        result.push(currentAtr);
      }
    }
    return result;
  }

  // MACD (Moving Average Convergence Divergence)
  public static calculateMACD(
    closes: number[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
  ) {
    const fastEMA = this.calculateEMA(closes, fastPeriod);
    const slowEMA = this.calculateEMA(closes, slowPeriod);
    const macdLine: number[] = [];

    for (let i = 0; i < closes.length; i++) {
      if (isNaN(fastEMA[i]) || isNaN(slowEMA[i])) {
        macdLine.push(NaN);
      } else {
        macdLine.push(fastEMA[i] - slowEMA[i]);
      }
    }

    const validMacdLine = macdLine.filter(v => !isNaN(v));
    const signalEMA = this.calculateEMA(validMacdLine, signalPeriod);
    const signalLine: number[] = [];
    const histogram: number[] = [];

    let sigIndex = 0;
    for (let i = 0; i < macdLine.length; i++) {
      if (isNaN(macdLine[i])) {
        signalLine.push(NaN);
        histogram.push(NaN);
      } else {
        const sigVal = signalEMA[sigIndex++];
        signalLine.push(sigVal);
        histogram.push(isNaN(sigVal) ? NaN : macdLine[i] - sigVal);
      }
    }

    return { macdLine, signalLine, histogram };
  }

  // Bandas de Bollinger
  public static calculateBollingerBands(closes: number[], period: number = 20, stdDev: number = 2) {
    const sma = this.calculateSMA(closes, period);
    const upper: number[] = [];
    const lower: number[] = [];
    const bandwidth: number[] = [];

    for (let i = 0; i < closes.length; i++) {
      if (isNaN(sma[i])) {
        upper.push(NaN);
        lower.push(NaN);
        bandwidth.push(NaN);
      } else {
        const slice = closes.slice(i - period + 1, i + 1);
        const mean = sma[i];
        const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
        const sd = Math.sqrt(variance);
        const up = mean + (stdDev * sd);
        const low = mean - (stdDev * sd);
        upper.push(up);
        lower.push(low);
        bandwidth.push(((up - low) / mean) * 100);
      }
    }
    return { middle: sma, upper, lower, bandwidth };
  }

  // VWAP (Volume Weighted Average Price) Intraday
  public static calculateVWAP(candles: Candle[]): number[] {
    const result: number[] = [];
    let cumulativeTPV = 0;
    let cumulativeVolume = 0;

    for (let i = 0; i < candles.length; i++) {
      const typicalPrice = (candles[i].high + candles[i].low + candles[i].close) / 3;
      const tpv = typicalPrice * candles[i].volume;
      cumulativeTPV += tpv;
      cumulativeVolume += candles[i].volume;

      if (cumulativeVolume === 0) {
        result.push(candles[i].close);
      } else {
        result.push(cumulativeTPV / cumulativeVolume);
      }
    }
    return result;
  }

  // Volume Relativo (RVol) vs Média Móvel de Volume
  public static calculateRelativeVolume(volumes: number[], period: number = 20): number {
    if (volumes.length < period) return 1.0;
    const currentVol = volumes[volumes.length - 1];
    const recentVols = volumes.slice(volumes.length - period - 1, volumes.length - 1);
    const avgVol = recentVols.reduce((a, b) => a + b, 0) / period;
    return avgVol > 0 ? Number((currentVol / avgVol).toFixed(2)) : 1.0;
  }
}
