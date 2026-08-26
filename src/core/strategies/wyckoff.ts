import { Candle, StrategySignal } from '../types';
import { TechnicalIndicators } from '../indicators';

export class WyckoffStrategy {
  public static analyze(candles: Candle[]): StrategySignal | null {
    if (candles.length < 25) return null;

    const n = candles.length;
    const closes = candles.map(c => c.close);
    const volumes = candles.map(c => c.volume);
    const ema20 = TechnicalIndicators.calculateEMA(closes, 20);
    const rvol = TechnicalIndicators.calculateRelativeVolume(volumes, 20);

    const lowestLow = Math.min(...candles.slice(Math.max(0, n - 20), n - 3).map(c => c.low));
    const highestHigh = Math.max(...candles.slice(Math.max(0, n - 20), n - 3).map(c => c.high));
    const lastPrice = candles[n - 1].close;

    for (let offset = 1; offset <= 4; offset++) {
      const idx = n - offset;
      const c = candles[idx];

      // 1. SPRING (Fase C de Acumulação Wyckoff)
      // O preço fura a mínima do suporte e fecha acima com absorção
      if (c.low < lowestLow && c.close > lowestLow && c.close >= c.open) {
        const entry = Number(lastPrice.toFixed(2));
        const stop = Number((c.low - 0.02).toFixed(2));
        const risk = Math.max(0.20, entry - stop);

        return {
          name: 'Wyckoff - Spring Fase C (Absorção Institucional de Fundo)',
          category: 'WYCKOFF',
          direction: 'BUY',
          confidence: 94,
          description: `Spring de Wyckoff clássico: Falso rompimento do suporte prévio em R$ ${lowestLow.toFixed(2)} seguido de fechamento forte com absorção de liquidez dos grandes bancos.`,
          entryPrice: entry,
          stopPrice: stop,
          targetPrice1: Number((entry + (risk * 2.5)).toFixed(2)),
          targetPrice2: Number((entry + (risk * 4.0)).toFixed(2))
        };
      }

      // 2. UTAD / Upthrust (Fase C de Distribuição)
      if (c.high > highestHigh && c.close < highestHigh && c.close <= c.open) {
        const entry = Number(lastPrice.toFixed(2));
        const stop = Number((c.high + 0.02).toFixed(2));
        const risk = Math.max(0.20, stop - entry);

        return {
          name: 'Wyckoff - Upthrust After Distribution (UTAD)',
          category: 'WYCKOFF',
          direction: 'SELL',
          confidence: 92,
          description: `UTAD de Wyckoff: Armadilha de compra no topo com rejeição de máximas e absorção vendedora.`,
          entryPrice: entry,
          stopPrice: stop,
          targetPrice1: Number((entry - (risk * 2.5)).toFixed(2)),
          targetPrice2: Number((entry - (risk * 4.0)).toFixed(2))
        };
      }
    }

    // 3. Jump Across the Creek (JAC - Rompimento de Acumulação com Volume)
    if (lastPrice > highestHigh && rvol >= 1.3) {
      const entry = Number(lastPrice.toFixed(2));
      const stop = Number((highestHigh * 0.985).toFixed(2));
      const risk = Math.max(0.20, entry - stop);

      return {
        name: 'Wyckoff - Jump Across the Creek (JAC / Rompimento)',
        category: 'WYCKOFF',
        direction: 'BUY',
        confidence: 91,
        description: `Salto sobre o riacho (JAC): Rompimento legítimo de resistência com Volume Relativo ${rvol.toFixed(2)}x indicando entrada definitiva de demanda institucional.`,
        entryPrice: entry,
        stopPrice: stop,
        targetPrice1: Number((entry + (risk * 2.0)).toFixed(2)),
        targetPrice2: Number((entry + (risk * 3.5)).toFixed(2))
      };
    }

    return null;
  }
}
