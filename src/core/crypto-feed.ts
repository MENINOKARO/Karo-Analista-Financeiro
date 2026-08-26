import axios from 'axios';
import { Candle } from './types';

export interface CryptoTickerInfo {
  symbol: string;
  name: string;
  category: 'Layer 1' | 'DeFi' | 'Payments' | 'Smart Contracts';
}

export const CRYPTO_WATCHLIST: CryptoTickerInfo[] = [
  { symbol: 'BTC-USD', name: 'Bitcoin (BTC)', category: 'Layer 1' },
  { symbol: 'ETH-USD', name: 'Ethereum (ETH)', category: 'Smart Contracts' },
  { symbol: 'SOL-USD', name: 'Solana (SOL)', category: 'Layer 1' },
  { symbol: 'BNB-USD', name: 'Binance Coin (BNB)', category: 'Layer 1' },
  { symbol: 'XRP-USD', name: 'Ripple (XRP)', category: 'Payments' },
  { symbol: 'ADA-USD', name: 'Cardano (ADA)', category: 'Layer 1' },
  { symbol: 'AVAX-USD', name: 'Avalanche (AVAX)', category: 'Smart Contracts' }
];

export class CryptoFeedService {
  public static async getCandles(
    symbol: string,
    interval: '5m' | '15m' | '60m' | '1d' = '5m',
    count: number = 60
  ): Promise<Candle[]> {
    try {
      const range = interval === '5m' ? '2d' : interval === '15m' ? '7d' : interval === '60m' ? '1mo' : '1y';
      const yfInterval = interval === '60m' ? '60m' : interval;
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${yfInterval}&range=${range}`;

      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        },
        timeout: 6000
      });

      const chartResult = res.data?.chart?.result?.[0];
      const timestamps: number[] = chartResult?.timestamp || [];
      const quoteData = chartResult?.indicators?.quote?.[0];

      if (timestamps.length > 0 && quoteData) {
        const opens = quoteData.open || [];
        const highs = quoteData.high || [];
        const lows = quoteData.low || [];
        const closes = quoteData.close || [];
        const volumes = quoteData.volume || [];

        const candles: Candle[] = [];
        for (let i = 0; i < timestamps.length; i++) {
          if (closes[i] !== null && opens[i] !== null && highs[i] !== null && lows[i] !== null) {
            candles.push({
              time: new Date(timestamps[i] * 1000).toISOString(),
              open: Number(opens[i].toFixed(2)),
              high: Number(highs[i].toFixed(2)),
              low: Number(lows[i].toFixed(2)),
              close: Number(closes[i].toFixed(2)),
              volume: volumes[i] || 1000000
            });
          }
        }

        if (candles.length >= 5) {
          return candles.slice(-count);
        }
      }
    } catch (err: any) {
      console.warn(`[CryptoFeed] Falha ao obter dados reais de ${symbol}: ${err.message}.`);
    }

    return this.generateSyntheticCandles(symbol, interval, count);
  }

  public static generateSyntheticCandles(
    symbol: string,
    interval: string,
    count: number = 60
  ): Candle[] {
    let basePrice = 77200.0;
    if (symbol.includes('ETH')) basePrice = 2420.0;
    else if (symbol.includes('SOL')) basePrice = 96.0;
    else if (symbol.includes('BNB')) basePrice = 698.0;
    else if (symbol.includes('XRP')) basePrice = 1.50;
    else if (symbol.includes('ADA')) basePrice = 0.23;
    else if (symbol.includes('AVAX')) basePrice = 7.54;

    const candles: Candle[] = [];
    let currentPrice = basePrice;
    const now = Date.now();
    const intervalMinutes = interval === '5m' ? 5 : interval === '15m' ? 15 : interval === '60m' ? 60 : 1440;
    const intervalMs = intervalMinutes * 60 * 1000;

    let seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    for (let i = count; i >= 0; i--) {
      const time = new Date(now - (i * intervalMs)).toISOString();
      const randomFactor = (Math.sin(seed + i * 0.4) + Math.cos(seed * 0.8 + i * 0.2)) / 2;
      const volatility = basePrice * 0.005;

      const delta = (randomFactor * volatility) + (Math.random() - 0.47) * volatility;
      const open = currentPrice;
      const close = open + delta;
      const high = Math.max(open, close) + Math.random() * (volatility * 0.8);
      const low = Math.min(open, close) - Math.random() * (volatility * 0.8);
      const volume = Math.floor(10000000 + Math.random() * 50000000);

      candles.push({
        time,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume
      });

      currentPrice = close;
    }

    return candles;
  }
}
