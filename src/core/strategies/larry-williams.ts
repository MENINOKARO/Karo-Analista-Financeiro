import { Candle, StrategySignal } from '../types';
import { TechnicalIndicators } from '../indicators';

export class LarryWilliamsStrategy {
  public static analyze(candles: Candle[]): StrategySignal | null {
    if (candles.length < 15) return null;

    const n = candles.length;
    const closes = candles.map(c => c.close);
    const ema9 = TechnicalIndicators.calculateEMA(closes, 9);
    const lastPrice = closes[n - 1];

    for (let offset = 1; offset <= 3; offset++) {
      const idx = n - offset;
      if (idx < 3) continue;

      const curr = candles[idx];
      const prev = candles[idx - 1];
      const prev2 = candles[idx - 2];

      const currEma9 = ema9[idx];
      const prevEma9 = ema9[idx - 1];
      const prev2Ema9 = ema9[idx - 2];

      // Setup 9.1 de Compra: Média 9 vira para cima
      if (prev2Ema9 >= prevEma9 && currEma9 > prevEma9 && curr.close > currEma9) {
        const entry = Number(lastPrice.toFixed(2));
        const stop = Number((curr.low - 0.02).toFixed(2));
        const risk = Math.max(0.20, entry - stop);

        return {
          name: 'Larry Williams - Setup 9.1 (Virada da Média Móvel Exponencial de 9)',
          category: 'LARRY_WILLIAMS',
          direction: 'BUY',
          confidence: 89,
          description: `Setup 9.1 clássico de Larry Williams: A Média Móvel de 9 períodos apontou para cima e a máxima da barra de sinal foi confirmada com entrada de fluxo comprador.`,
          entryPrice: entry,
          stopPrice: stop,
          targetPrice1: Number((entry + (risk * 2.0)).toFixed(2)),
          targetPrice2: Number((entry + (risk * 3.5)).toFixed(2))
        };
      }

      // Setup 9.1 de Venda: Média 9 vira para baixo
      if (prev2Ema9 <= prevEma9 && currEma9 < prevEma9 && curr.close < currEma9) {
        const entry = Number(lastPrice.toFixed(2));
        const stop = Number((curr.high + 0.02).toFixed(2));
        const risk = Math.max(0.20, stop - entry);

        return {
          name: 'Larry Williams - Setup 9.1 de Venda',
          category: 'LARRY_WILLIAMS',
          direction: 'SELL',
          confidence: 88,
          description: `Setup 9.1 de venda: A Média Móvel de 9 períodos virou para baixo, indicando aceleração vendedora.`,
          entryPrice: entry,
          stopPrice: stop,
          targetPrice1: Number((entry - (risk * 2.0)).toFixed(2)),
          targetPrice2: Number((entry - (risk * 3.5)).toFixed(2))
        };
      }
    }

    return null;
  }
}
