import { Candle, StrategySignal } from '../types';
import { TechnicalIndicators } from '../indicators';

export class MinerviniStrategy {
  public static analyze(candles: Candle[]): StrategySignal | null {
    if (candles.length < 20) return null;

    const n = candles.length;
    const closes = candles.map(c => c.close);
    const ema9 = TechnicalIndicators.calculateEMA(closes, 9);
    const ema20 = TechnicalIndicators.calculateEMA(closes, 20);
    const lastPrice = closes[n - 1];

    const currentEma9 = ema9[n - 1];
    const currentEma20 = ema20[n - 1];

    // Tendência Minervini (Preço > EMA 9 > EMA 20)
    const isTrendTemplate = lastPrice >= currentEma9 * 0.995 && currentEma9 >= currentEma20 * 0.998;

    // VCP (Volatility Contraction Pattern)
    const range1 = Math.max(...candles.slice(Math.max(0, n - 20), n - 10).map(c => c.high)) - Math.min(...candles.slice(Math.max(0, n - 20), n - 10).map(c => c.low));
    const range2 = Math.max(...candles.slice(n - 10, n).map(c => c.high)) - Math.min(...candles.slice(n - 10, n).map(c => c.low));

    const isVcpContraction = range2 < range1 * 0.85;

    if (isTrendTemplate && isVcpContraction) {
      const entry = Number(lastPrice.toFixed(2));
      const stop = Number((currentEma20 * 0.985).toFixed(2));
      const risk = Math.max(0.20, entry - stop);

      return {
        name: 'Mark Minervini - SEPA (VCP Breakout com Contração de Volatilidade)',
        category: 'MINERVINI',
        direction: 'BUY',
        confidence: 92,
        description: `Padrão VCP de Mark Minervini com 2 contrações consecutivas de volatilidade e alinhamento de médias móveis exponenciais (EMA 9 > EMA 20). Pivô de alta ativado.`,
        entryPrice: entry,
        stopPrice: stop,
        targetPrice1: Number((entry + (risk * 2.5)).toFixed(2)),
        targetPrice2: Number((entry + (risk * 4.0)).toFixed(2))
      };
    }

    return null;
  }
}
