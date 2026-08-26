import axios from 'axios';
import { Candle } from './types';

export interface TickerInfo {
  symbol: string;
  name: string;
  market: 'B3';
  sector: string;
}

// WATCHLIST 100% EXCLUSIVA PARA AÇÕES DA B3 (BRASIL)
export const WATCHLIST: TickerInfo[] = [
  { symbol: 'PETR4.SA', name: 'Petrobras PN', market: 'B3', sector: 'Petróleo, Gás & Biocombustíveis' },
  { symbol: 'VALE3.SA', name: 'Vale ON', market: 'B3', sector: 'Mineração & Siderurgia' },
  { symbol: 'ITUB4.SA', name: 'Itaú Unibanco PN', market: 'B3', sector: 'Intermediários Financeiros' },
  { symbol: 'BBDC4.SA', name: 'Bradesco PN', market: 'B3', sector: 'Intermediários Financeiros' },
  { symbol: 'BBAS3.SA', name: 'Banco do Brasil ON', market: 'B3', sector: 'Intermediários Financeiros' },
  { symbol: 'WEGE3.SA', name: 'WEG ON', market: 'B3', sector: 'Máquinas & Equipamentos' },
  { symbol: 'PRIO3.SA', name: 'PRIO ON', market: 'B3', sector: 'Petróleo & Gás Independente' },
  { symbol: 'RENT3.SA', name: 'Localiza ON', market: 'B3', sector: 'Locação de Veículos' },
  { symbol: 'MGLU3.SA', name: 'Magazine Luiza ON', market: 'B3', sector: 'Comércio Varejista' },
  { symbol: 'ABEV3.SA', name: 'Ambev ON', market: 'B3', sector: 'Bebidas' },
  { symbol: 'SUZB3.SA', name: 'Suzano ON', market: 'B3', sector: 'Papel & Celulose' },
  { symbol: 'GGBR4.SA', name: 'Gerdau PN', market: 'B3', sector: 'Siderurgia' },
  { symbol: 'CSNA3.SA', name: 'Siderúrgica Nacional ON', market: 'B3', sector: 'Siderurgia & Mineração' },
  { symbol: 'RADL3.SA', name: 'RaiaDrogasil ON', market: 'B3', sector: 'Farmácias & Saúde' },
  { symbol: 'LREN3.SA', name: 'Lojas Renner ON', market: 'B3', sector: 'Vestuário & Varejo' },
  { symbol: 'B3SA3.SA', name: 'B3 ON', market: 'B3', sector: 'Serviços Financeiros Diversos' },
  { symbol: 'HAPV3.SA', name: 'Hapvida ON', market: 'B3', sector: 'Saúde Suplementar' },
  { symbol: 'SBSP3.SA', name: 'Sabesp ON', market: 'B3', sector: 'Saneamento Básico' },
  { symbol: 'RAIZ4.SA', name: 'Raízen PN', market: 'B3', sector: 'Biocombustíveis & Açúcar' }
];

export class MarketFeedService {
  public static async getCandles(
    symbol: string,
    interval: '5m' | '15m' | '60m' | '1d' = '5m',
    count: number = 60
  ): Promise<Candle[]> {
    try {
      const range = interval === '5m' ? '5d' : interval === '15m' ? '1mo' : interval === '60m' ? '3mo' : '1y';
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
              volume: volumes[i] || 100000
            });
          }
        }

        if (candles.length >= 5) {
          return candles.slice(-count);
        }
      }
    } catch (err: any) {
      console.warn(`[MarketFeed] Falha ao obter dados reais de ${symbol}: ${err.message}.`);
    }

    return this.generateSyntheticCandles(symbol, interval, count);
  }

  public static generateSyntheticCandles(
    symbol: string,
    interval: string,
    count: number = 60
  ): Candle[] {
    let basePrice = 44.30;
    
    if (symbol.includes('PETR4')) basePrice = 44.30;
    else if (symbol.includes('VALE3')) basePrice = 75.03;
    else if (symbol.includes('ITUB4')) basePrice = 38.60;
    else if (symbol.includes('WEGE3')) basePrice = 49.27;
    else if (symbol.includes('PRIO3')) basePrice = 62.85;
    else if (symbol.includes('RENT3')) basePrice = 33.92;
    else if (symbol.includes('BBAS3')) basePrice = 18.43;
    else if (symbol.includes('BBDC4')) basePrice = 16.24;
    else if (symbol.includes('MGLU3')) basePrice = 4.16;

    const candles: Candle[] = [];
    let currentPrice = basePrice;
    const now = Date.now();
    const intervalMinutes = interval === '5m' ? 5 : interval === '15m' ? 15 : interval === '60m' ? 60 : 1440;
    const intervalMs = intervalMinutes * 60 * 1000;

    let seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    for (let i = count; i >= 0; i--) {
      const time = new Date(now - (i * intervalMs)).toISOString();
      const randomFactor = (Math.sin(seed + i * 0.5) + Math.cos(seed * 0.7 + i * 0.3)) / 2;
      const volatility = basePrice * 0.0035;

      const delta = (randomFactor * volatility) + (Math.random() - 0.48) * volatility;
      const open = currentPrice;
      const close = open + delta;
      const high = Math.max(open, close) + Math.random() * (volatility * 0.8);
      const low = Math.min(open, close) - Math.random() * (volatility * 0.8);
      const volume = Math.floor(500000 + Math.random() * 1500000 * (1 + Math.abs(randomFactor)));

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
