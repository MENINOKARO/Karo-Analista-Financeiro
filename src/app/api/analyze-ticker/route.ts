import { NextRequest, NextResponse } from 'next/server';
import { MarketFeedService, WATCHLIST } from '@/core/market-feed';
import { SeniorAnalystEngine } from '@/core/analyst-engine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawTicker = (searchParams.get('ticker') || '').trim().toUpperCase();

    if (!rawTicker) {
      return NextResponse.json(
        { success: false, error: 'Código de ativo não informado.' },
        { status: 400 }
      );
    }

    const symbol = rawTicker.endsWith('.SA') ? rawTicker : `${rawTicker}.SA`;
    const cleanTicker = rawTicker.replace('.SA', '');

    // Busca o nome do ativo se constar na watchlist, senão monta nome padrão
    const knownInfo = WATCHLIST.find(w => w.symbol.replace('.SA', '') === cleanTicker);
    const name = knownInfo ? knownInfo.name : `${cleanTicker} - Ação B3`;

    // 1. Coleta candles 5m, 15m e Diário em tempo real da B3
    const [candles5m, candles15m, candlesDaily] = await Promise.all([
      MarketFeedService.getCandles(symbol, '5m', 60),
      MarketFeedService.getCandles(symbol, '15m', 40),
      MarketFeedService.getCandles(symbol, '1d', 30)
    ]);

    if (!candles5m || candles5m.length === 0) {
      return NextResponse.json(
        { success: false, error: `Não foi possível carregar as cotações em tempo real de ${cleanTicker} na B3.` },
        { status: 404 }
      );
    }

    // 2. Executa a análise quantitativa das 7 escolas clássicas
    const analysis = SeniorAnalystEngine.evaluateStock(
      symbol,
      name,
      candles5m,
      candles15m,
      candlesDaily
    );

    if (!analysis) {
      return NextResponse.json(
        { success: false, error: `Não foram encontrados dados suficientes para calibrar o diagnóstico de ${cleanTicker}.` },
        { status: 422 }
      );
    }

    analysis.market = 'B3';

    return NextResponse.json({
      success: true,
      analysis,
      ticker: cleanTicker,
      currentPrice: analysis.currentPrice,
      candlesCount: candles5m.length
    });
  } catch (err: any) {
    console.error('[API Analyze-Ticker] Erro:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao processar análise em tempo real.' },
      { status: 500 }
    );
  }
}
