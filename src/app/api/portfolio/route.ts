import { NextRequest, NextResponse } from 'next/server';
import { KaroDatabase, StoredTradePosition } from '@/core/database/db';
import { MarketFeedService } from '@/core/market-feed';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'usr_demo';

    const positions = KaroDatabase.getUserPositions(userId);

    // Atualiza cotações ao vivo para cada ativo na carteira
    if (positions.length > 0) {
      const quotesMap: Record<string, number> = {};
      await Promise.all(
        positions.map(async (pos) => {
          try {
            // Se for opção ou ação brasileira
            const cleanTicker = pos.ticker.replace(/\.SA$/, '');
            const isOption = pos.modality === 'OPTIONS' || /^[A-Z]{4}[A-X]\d+/.test(cleanTicker);
            
            if (isOption) {
              // Para opções, busca a cotação da ação subjacente para recalcular valor estimado
              const underlying = cleanTicker.slice(0, 4) + '4.SA';
              const candles = await MarketFeedService.getCandles(underlying, '15m', 5);
              if (candles && candles.length > 0) {
                const stockPrice = candles[candles.length - 1].close;
                // Variação percentual estimada da opção baseada no delta da ação
                const baseStockRef = pos.optionStrike || stockPrice;
                const priceDiff = (stockPrice - baseStockRef) / baseStockRef;
                const estimatedOptionPrice = Math.max(0.01, Number((pos.entryPrice * (1 + priceDiff * 3)).toFixed(2)));
                quotesMap[pos.ticker] = estimatedOptionPrice;
              }
            } else {
              const symbol = pos.ticker.includes('.') ? pos.ticker : `${pos.ticker}.SA`;
              const candles = await MarketFeedService.getCandles(symbol, '15m', 5);
              if (candles && candles.length > 0) {
                const lastClose = candles[candles.length - 1].close;
                quotesMap[pos.ticker] = lastClose;
                quotesMap[symbol] = lastClose;
                quotesMap[cleanTicker] = lastClose;
              }
            }
          } catch (e) {
            // Silencioso para fallback
          }
        })
      );

      if (Object.keys(quotesMap).length > 0) {
        KaroDatabase.updateUserPositionsLiveQuotes(userId, quotesMap);
      }
    }

    const summary = KaroDatabase.getPortfolioSummary(userId);
    return NextResponse.json({ success: true, data: summary });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload, userId = 'usr_demo' } = body;

    // 1. SEGUIR RECOMENDAÇÃO DO RADAR
    if (action === 'FOLLOW_SIGNAL') {
      const { 
        signal, 
        quantity = 100, 
        customEntry,
        modality = 'SWING',
        optionTicker,
        optionStrike,
        optionType,
        strategyTitle,
        stopLoss,
        target1,
        target2
      } = payload;

      const isOption = modality === 'OPTIONS';
      const finalTicker = isOption ? (optionTicker || signal.ticker) : (signal.standardLotTicker || signal.ticker);
      const finalName = isOption ? `${signal.name} (${strategyTitle || 'Opção B3'})` : signal.name;
      const entryPrice = customEntry || signal.currentPrice;
      const totalInvested = Number((quantity * entryPrice).toFixed(2));
      const market = signal.market || (signal.ticker.endsWith('.SA') ? 'B3' : 'CRYPTO');

      const newPos: StoredTradePosition = {
        id: `pos-${Date.now()}`,
        userId,
        ticker: finalTicker,
        name: finalName,
        market,
        direction: signal.action === 'BUY' ? 'BUY' : 'SELL',
        entryPrice,
        currentPrice: entryPrice,
        quantity,
        totalInvested,
        currentValue: totalInvested,
        pnlAmount: 0.00,
        pnlPercent: 0.00,
        stopLoss: isOption ? 0.00 : (stopLoss || signal.stopLoss),
        target1: target1 || signal.target1,
        target2: target2 || signal.target2,
        openedAt: new Date().toISOString(),
        status: 'ABERTA',
        robotAdvice: isOption
          ? `💎 Contrato de Opção ${finalTicker} registrado a R$ ${entryPrice.toFixed(2)} (${quantity} un = R$ ${totalInvested.toFixed(2)}). O robô monitora a aceleração até o Alvo 1.`
          : `🚀 Operação em ${finalTicker} iniciada a R$ ${entryPrice.toFixed(2)}! Stop inicial em R$ ${(stopLoss || signal.stopLoss).toFixed(2)}.`,
        originSetup: strategyTitle || signal.setupTitle,
        modality,
        optionTicker,
        optionStrike,
        optionType
      };

      KaroDatabase.addPosition(userId, newPos);

      return NextResponse.json({ 
        success: true, 
        message: `Operação em ${finalTicker} registrada com sucesso na sua carteira!`,
        data: newPos 
      });
    }

    // 2. ADICIONAR POSIÇÃO MANUALMENTE
    if (action === 'ADD_MANUAL') {
      const { ticker, name, market, entryPrice, quantity, stopLoss, target1, target2 } = payload;
      const totalInvested = Number((quantity * entryPrice).toFixed(2));

      const newPos: StoredTradePosition = {
        id: `pos-man-${Date.now()}`,
        userId,
        ticker,
        name: name || ticker,
        market: market || 'B3',
        direction: 'BUY',
        entryPrice,
        currentPrice: entryPrice,
        quantity,
        totalInvested,
        currentValue: totalInvested,
        pnlAmount: 0.00,
        pnlPercent: 0.00,
        stopLoss: stopLoss || 0,
        target1: target1 || Number((entryPrice * 1.05).toFixed(2)),
        target2: target2 || Number((entryPrice * 1.10).toFixed(2)),
        openedAt: new Date().toISOString(),
        status: 'ABERTA',
        robotAdvice: `Posição manual em ${ticker} adicionada à sua carteira.`,
        originSetup: 'Entrada Manual',
        modality: 'SWING'
      };

      KaroDatabase.addPosition(userId, newPos);

      return NextResponse.json({ 
        success: true, 
        message: `Posição em ${ticker} adicionada à sua carteira!`,
        data: newPos 
      });
    }

    // 3. EDITAR POSIÇÃO EXISTENTE
    if (action === 'UPDATE_POSITION') {
      const { id, entryPrice, quantity, stopLoss, target1, target2, status, name } = payload;
      const updated = KaroDatabase.updatePosition(userId, id, {
        entryPrice,
        quantity,
        stopLoss,
        target1,
        target2,
        status,
        name
      });

      if (!updated) {
        return NextResponse.json({ success: false, message: 'Posição não encontrada para edição.' }, { status: 404 });
      }

      const summary = KaroDatabase.getPortfolioSummary(userId);
      return NextResponse.json({ 
        success: true, 
        message: 'Posição atualizada com sucesso!',
        data: updated,
        summary
      });
    }

    // 4. ENCERRAR POSIÇÃO (LUCRO / PREJUÍZO REALIZADO)
    if (action === 'CLOSE_POSITION') {
      const { id, exitPrice } = payload;
      const closed = KaroDatabase.closePosition(userId, id, exitPrice);
      const summary = KaroDatabase.getPortfolioSummary(userId);
      return NextResponse.json({ 
        success: true, 
        message: 'Posição encerrada com sucesso!',
        data: closed,
        summary
      });
    }

    // 5. EXCLUIR / REMOVER REGISTRO
    if (action === 'REMOVE_POSITION') {
      const { id } = payload;
      KaroDatabase.removePosition(userId, id);
      const summary = KaroDatabase.getPortfolioSummary(userId);
      return NextResponse.json({ 
        success: true, 
        message: 'Posição excluída com sucesso.',
        summary
      });
    }

    return NextResponse.json({ success: false, message: 'Ação desconhecida.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}