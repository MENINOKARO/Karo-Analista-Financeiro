import { Candle, StrategySignal } from '../types';
import { TechnicalIndicators } from '../indicators';

export class OliverVelezStrategy {
  public static analyze(candles: Candle[]): StrategySignal | null {
    if (candles.length < 25) return null;

    const n = candles.length;
    const closes = candles.map(c => c.close);
    const ema20 = TechnicalIndicators.calculateEMA(closes, 20);
    const ema200 = TechnicalIndicators.calculateEMA(closes, Math.min(200, closes.length));

    // Analisa as últimas 4 barras para detectar ignição recente
    for (let offset = 1; offset <= 4; offset++) {
      const idx = n - offset;
      if (idx < 10) continue;

      const current = candles[idx];
      const currentEma20 = ema20[idx];
      const currentEma200 = ema200[idx];

      const currentRange = current.high - current.low;
      const currentBody = Math.abs(current.close - current.open);
      
      const recentRanges = candles.slice(Math.max(0, idx - 8), idx).map(c => c.high - c.low);
      const avgRange = recentRanges.length > 0 ? (recentRanges.reduce((a, b) => a + b, 0) / recentRanges.length) : currentRange;

      // 1. IGNITING BAR / SUBIDA FORTE DE FUNDO (Padrão de Rompimento Explosivo com Volume)
      const prior3High = Math.max(...candles.slice(Math.max(0, idx - 4), idx).map(c => c.high));
      const pctGain = (current.close - current.open) / (current.open || 1);
      const closeNearHigh = (current.close - current.low) / (currentRange || 1) >= 0.75;
      
      const isIgnitingBreakout = (
        current.close > current.open &&
        (pctGain >= 0.030 || currentRange >= avgRange * 1.4) &&
        closeNearHigh &&
        current.close >= prior3High * 0.998
      );

      if (isIgnitingBreakout) {
        const lastPrice = candles[n - 1].close;
        const entry = Number(lastPrice.toFixed(2));
        const stop = Number((current.low - 0.02).toFixed(2));
        const risk = Math.max(0.20, entry - stop);
        const target1 = Number((entry + (risk * 2.2)).toFixed(2));
        const target2 = Number((entry + (risk * 4.0)).toFixed(2));

        return {
          name: 'Oliver Velez - Barra de Ignição / Explosão de Momentum de Fundo',
          category: 'VELEZ',
          direction: 'BUY',
          confidence: 94,
          description: `🚀 Subida Forte com Barra de Ignição (+${(pctGain * 100).toFixed(1)}%): Compradores institucionais assumiram o controle total partindo de uma base de acumulação, rompendo topos anteriores com fechamento na máxima.`,
          entryPrice: entry,
          stopPrice: stop,
          targetPrice1: target1,
          targetPrice2: target2
        };
      }

      // 2. GREEN ELEPHANT BAR (Barra Elefante Padrão)
      const isElephantBull = (
        current.close > current.open &&
        currentRange >= avgRange * 1.25 &&
        (currentBody / (currentRange || 1)) >= 0.60 &&
        current.close >= currentEma20 * 0.998
      );

      if (isElephantBull) {
        const lastPrice = candles[n - 1].close;
        const entry = Number(lastPrice.toFixed(2));
        const stop = Number((current.low - 0.02).toFixed(2));
        const risk = Math.max(0.20, entry - stop);
        const target1 = Number((entry + (risk * 2.0)).toFixed(2));
        const target2 = Number((entry + (risk * 3.5)).toFixed(2));

        return {
          name: 'Oliver Velez - Barra Elefante de Ignição (Elephant Bar)',
          category: 'VELEZ',
          direction: 'BUY',
          confidence: 90,
          description: `Barra Elefante compradora institucional detectada nos últimos minutos, superando a volatilidade média e partindo da EMA20 com fluxo dominante de compradores.`,
          entryPrice: entry,
          stopPrice: stop,
          targetPrice1: target1,
          targetPrice2: target2
        };
      }

      // 2. BOTTOMING TAIL
      const lowerTail = Math.min(current.open, current.close) - current.low;
      const isBottomingTail = lowerTail >= currentRange * 0.45 && current.close >= current.open;
      const touchesEma20 = current.low <= currentEma20 * 1.003 && current.close >= currentEma20 * 0.995;

      if (isBottomingTail && touchesEma20) {
        const lastPrice = candles[n - 1].close;
        const entry = Number(lastPrice.toFixed(2));
        const stop = Number((current.low - 0.02).toFixed(2));
        const risk = Math.max(0.20, entry - stop);

        return {
          name: 'Oliver Velez - Bottoming Tail na MMA20 (Rejeição Institucional)',
          category: 'VELEZ',
          direction: 'BUY',
          confidence: 86,
          description: `Bottoming Tail de livro testando a média móvel de 20 períodos e sendo absorvida pelos compradores. Alta probabilidade estatística.`,
          entryPrice: entry,
          stopPrice: stop,
          targetPrice1: Number((entry + (risk * 2.0)).toFixed(2)),
          targetPrice2: Number((entry + (risk * 3.5)).toFixed(2))
        };
      }

      // 3. RED ELEPHANT BAR (Venda)
      const isElephantBear = (
        current.close < current.open &&
        currentRange >= avgRange * 1.3 &&
        (currentBody / (currentRange || 1)) >= 0.60 &&
        current.close <= currentEma20 * 1.002
      );

      if (isElephantBear) {
        const lastPrice = candles[n - 1].close;
        const entry = Number(lastPrice.toFixed(2));
        const stop = Number((current.high + 0.02).toFixed(2));
        const risk = Math.max(0.20, stop - entry);

        return {
          name: 'Oliver Velez - Red Elephant Bar (Ignição Vendedora)',
          category: 'VELEZ',
          direction: 'SELL',
          confidence: 88,
          description: `Barra Elefante vendedora rompendo suporte e acelerando abaixo da MMA20 com grande fluxo vendedor.`,
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
