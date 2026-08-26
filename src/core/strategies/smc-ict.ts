import { Candle, StrategySignal } from '../types';

export class SmartMoneyStrategy {
  public static analyze(candles: Candle[]): StrategySignal | null {
    if (candles.length < 15) return null;

    const n = candles.length;
    for (let i = n - 2; i >= Math.max(2, n - 6); i--) {
      const c1 = candles[i - 2];
      const c2 = candles[i - 1]; // Barra impulsiva
      const c3 = candles[i];     // Barra que confirma o gap

      // Bullish FVG (Fair Value Gap de Alta)
      if (c3.low > c1.high && c2.close > c2.open) {
        const gapBottom = c1.high;
        const gapTop = c3.low;
        const lastCandle = candles[n - 1];

        // Se o preço recente recuou para testar a região do FVG
        if (lastCandle.low <= gapTop * 1.008 && lastCandle.close >= gapBottom * 0.995) {
          const entry = Number(lastCandle.close.toFixed(2));
          const stop = Number((gapBottom - 0.03).toFixed(2));
          const risk = Math.max(0.20, entry - stop);

          return {
            name: 'Smart Money Concepts - FVG (Fair Value Gap Mitigado)',
            category: 'SMC_ICT',
            direction: 'BUY',
            confidence: 93,
            description: `Desequilíbrio institucional (Imbalance/FVG) mitigado com sucesso entre R$ ${gapBottom.toFixed(2)} e R$ ${gapTop.toFixed(2)}. Reação compradora dos grandes bancos.`,
            entryPrice: entry,
            stopPrice: stop,
            targetPrice1: Number((entry + (risk * 2.5)).toFixed(2)),
            targetPrice2: Number((entry + (risk * 4.0)).toFixed(2))
          };
        }
      }

      // Bearish FVG (Fair Value Gap de Baixa)
      if (c3.high < c1.low && c2.close < c2.open) {
        const gapTop = c1.low;
        const gapBottom = c3.high;
        const lastCandle = candles[n - 1];

        if (lastCandle.high >= gapBottom * 0.992 && lastCandle.close <= gapTop * 1.005) {
          const entry = Number(lastCandle.close.toFixed(2));
          const stop = Number((gapTop + 0.03).toFixed(2));
          const risk = Math.max(0.20, stop - entry);

          return {
            name: 'Smart Money Concepts - Bearish FVG (Imbalance de Venda)',
            category: 'SMC_ICT',
            direction: 'SELL',
            confidence: 91,
            description: `FVG vendedor institucional testado entre R$ ${gapBottom.toFixed(2)} e R$ ${gapTop.toFixed(2)}. Absorção vendedora ativa.`,
            entryPrice: entry,
            stopPrice: stop,
            targetPrice1: Number((entry - (risk * 2.5)).toFixed(2)),
            targetPrice2: Number((entry - (risk * 4.0)).toFixed(2))
          };
        }
      }
    }

    return null;
  }
}
