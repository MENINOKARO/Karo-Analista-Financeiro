import { Candle, StrategySignal } from '../types';
import { TechnicalIndicators } from '../indicators';

export class AlBrooksStrategy {
  public static analyze(candles: Candle[]): StrategySignal | null {
    if (candles.length < 20) return null;

    const n = candles.length;
    const closes = candles.map(c => c.close);
    const ema20 = TechnicalIndicators.calculateEMA(closes, 20);

    for (let offset = 1; offset <= 4; offset++) {
      const idx = n - offset;
      if (idx < 10) continue;

      const current = candles[idx];
      const prev = candles[idx - 1];
      const currentEma20 = ema20[idx];

      const isBullTrendBar = current.close > current.open && (current.close - current.open) / (current.high - current.low || 1) >= 0.55;
      const isBearTrendBar = current.close < current.open && (current.open - current.close) / (current.high - current.low || 1) >= 0.55;

      // High 2 (H2) Pullback de Compra na EMA20
      if (isBullTrendBar && current.close >= currentEma20 && prev.low <= currentEma20 * 1.005) {
        const lastPrice = candles[n - 1].close;
        const entry = Number(lastPrice.toFixed(2));
        const stop = Number((prev.low - 0.02).toFixed(2));
        const risk = Math.max(0.20, entry - stop);

        return {
          name: 'Al Brooks - High 2 (H2 Pullback na EMA 20)',
          category: 'BROOKS',
          direction: 'BUY',
          confidence: 88,
          description: `Setup H2 clássico de Al Brooks: Segundo recuo até a média de 20 períodos em tendência de alta, seguido por barra de sinal compradora.`,
          entryPrice: entry,
          stopPrice: stop,
          targetPrice1: Number((entry + (risk * 2.0)).toFixed(2)),
          targetPrice2: Number((entry + (risk * 3.5)).toFixed(2))
        };
      }

      // Low 2 (L2) Pullback de Venda na EMA20
      if (isBearTrendBar && current.close <= currentEma20 && prev.high >= currentEma20 * 0.995) {
        const lastPrice = candles[n - 1].close;
        const entry = Number(lastPrice.toFixed(2));
        const stop = Number((prev.high + 0.02).toFixed(2));
        const risk = Math.max(0.20, stop - entry);

        return {
          name: 'Al Brooks - Low 2 (L2 Pullback de Venda)',
          category: 'BROOKS',
          direction: 'SELL',
          confidence: 87,
          description: `Setup L2 de Al Brooks: Rejeição na média de 20 períodos após correção, acionando venda na perda da mínima da barra de sinal.`,
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
