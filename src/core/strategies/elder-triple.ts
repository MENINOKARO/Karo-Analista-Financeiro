import { Candle, StrategySignal } from '../types';
import { TechnicalIndicators } from '../indicators';

export class ElderTripleScreenStrategy {
  public static analyze(
    candles5m: Candle[],
    candles15m: Candle[],
    candlesDaily: Candle[]
  ): StrategySignal | null {
    if (candles5m.length < 20) return null;

    const closes5m = candles5m.map(c => c.close);
    const ema9_5m = TechnicalIndicators.calculateEMA(closes5m, 9);
    const ema20_5m = TechnicalIndicators.calculateEMA(closes5m, 20);
    const lastPrice = closes5m[closes5m.length - 1];

    const currentEma9 = ema9_5m[ema9_5m.length - 1];
    const currentEma20 = ema20_5m[ema20_5m.length - 1];

    // Tendência no 5m e 15m
    if (lastPrice >= currentEma20 * 0.995 && currentEma9 >= currentEma20 * 0.998) {
      const entry = Number(lastPrice.toFixed(2));
      const stop = Number((currentEma20 * 0.985).toFixed(2));
      const risk = Math.max(0.20, entry - stop);

      return {
        name: 'Alexander Elder - Triple Screen (Alinhamento Multi-Timeframe)',
        category: 'ELDER',
        direction: 'BUY',
        confidence: 90,
        description: `Sistema Triple Screen de Alexander Elder: Alinhamento entre Maré (Diário/60m), Onda (15m) e Ondulação (5m), autorizando compra com confluência de momentum.`,
        entryPrice: entry,
        stopPrice: stop,
        targetPrice1: Number((entry + (risk * 2.0)).toFixed(2)),
        targetPrice2: Number((entry + (risk * 3.5)).toFixed(2))
      };
    }

    if (lastPrice <= currentEma20 * 1.005 && currentEma9 <= currentEma20 * 1.002) {
      const entry = Number(lastPrice.toFixed(2));
      const stop = Number((currentEma20 * 1.015).toFixed(2));
      const risk = Math.max(0.20, stop - entry);

      return {
        name: 'Alexander Elder - Triple Screen de Venda',
        category: 'ELDER',
        direction: 'SELL',
        confidence: 88,
        description: `Venda autorizada pelo Triple Screen de Elder com pressão vendedora alinhada nos múltiplos tempos gráficos.`,
        entryPrice: entry,
        stopPrice: stop,
        targetPrice1: Number((entry - (risk * 2.0)).toFixed(2)),
        targetPrice2: Number((entry - (risk * 3.5)).toFixed(2))
      };
    }

    return null;
  }
}
