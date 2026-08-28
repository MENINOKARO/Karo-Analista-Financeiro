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
            const clean = pos.ticker.replace(/\.SA$/, '');
            const isOpt = pos.modality === 'OPTIONS' || /^[A-Z]{4}[A-X]\d+$/.test(clean);
            
            // Para opções B3, preserva a cotação exata informada pelo usuário no Home Broker da corretora
            if (isOpt && pos.currentPrice > 0) {
              return;
            }

            const quote = await MarketFeedService.getLiveQuote(pos.ticker);
            if (quote && quote.price > 0) {
              quotesMap[pos.ticker] = quote.price;
              quotesMap[clean] = quote.price;
            } else {
              // Fallback com candles para ações diretas
              const symbol = pos.ticker.includes('.') ? pos.ticker : `${pos.ticker}.SA`;
              const candles = await MarketFeedService.getCandles(symbol, '15m', 5);
              if (candles && candles.length > 0) {
                const lastClose = candles[candles.length - 1].close;
                quotesMap[pos.ticker] = lastClose;
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
        entryPrice = signal?.swingTrade?.entryPrice || signal?.currentPrice,
        modality = 'SWING',
        optionTicker,
        optionStrike
      } = payload;

      if (!signal) {
        return NextResponse.json({ success: false, message: 'Dados do sinal inválidos.' }, { status: 400 });
      }

      const totalInvested = Number((quantity * entryPrice).toFixed(2));
      const stop = signal.swingTrade?.stopLoss || Number((entryPrice * 0.97).toFixed(2));
      const t1 = signal.swingTrade?.target1 || Number((entryPrice * 1.05).toFixed(2));
      const t2 = signal.swingTrade?.target2 || Number((entryPrice * 1.10).toFixed(2));

      const newPos: StoredTradePosition = {
        id: `pos-${Date.now()}`,
        userId,
        ticker: optionTicker || signal.ticker,
        name: optionTicker ? `${signal.name} (Opção ${optionTicker})` : signal.name,
        market: signal.market || 'B3',
        direction: signal.action || 'BUY',
        entryPrice,
        currentPrice: entryPrice,
        quantity,
        totalInvested,
        currentValue: totalInvested,
        pnlAmount: 0.00,
        pnlPercent: 0.00,
        stopLoss: stop,
        target1: t1,
        target2: t2,
        openedAt: new Date().toISOString(),
        status: 'ABERTA',
        robotAdvice: `🚀 Posição aberta em ${optionTicker || signal.ticker}. Stop Loss de proteção em R$ ${stop.toFixed(2)} e Alvo 1 em R$ ${t1.toFixed(2)}.`,
        originSetup: signal.setupTitle,
        modality: modality || (optionTicker ? 'OPTIONS' : 'SWING'),
        optionTicker,
        optionStrike
      };

      KaroDatabase.addPosition(userId, newPos);

      return NextResponse.json({ 
        success: true, 
        message: `Posição em ${newPos.ticker} adicionada à sua carteira!`,
        data: newPos 
      });
    }

    // 2. CADASTRO MANUAL DE ATIVO / OPÇÃO
    if (action === 'ADD_MANUAL') {
      const { ticker, name, market, entryPrice, currentPrice, quantity, stopLoss, target1, target2 } = payload;
      const cleanTicker = ticker.trim().toUpperCase();
      const isOption = /^[A-Z]{4}[A-X]\d+$/.test(cleanTicker);
      const effectiveEntry = Number(entryPrice);
      const effectiveCurrent = currentPrice !== undefined && Number(currentPrice) > 0 ? Number(currentPrice) : effectiveEntry;
      const effectiveQty = Number(quantity);
      const totalInvested = Number((effectiveQty * effectiveEntry).toFixed(2));
      const currentValue = Number((effectiveQty * effectiveCurrent).toFixed(2));
      const pnlAmount = Number((currentValue - totalInvested).toFixed(2));
      const pnlPercent = totalInvested > 0 ? Number(((pnlAmount / totalInvested) * 100).toFixed(2)) : 0;

      const newPos: StoredTradePosition = {
        id: `pos-${Date.now()}`,
        userId,
        ticker: cleanTicker,
        name: name || cleanTicker,
        market: market || 'B3',
        direction: 'BUY',
        entryPrice: effectiveEntry,
        currentPrice: effectiveCurrent,
        quantity: effectiveQty,
        totalInvested,
        currentValue,
        pnlAmount,
        pnlPercent,
        stopLoss: Number(stopLoss) || 0,
        target1: Number(target1) || Number((effectiveEntry * 1.05).toFixed(2)),
        target2: Number(target2) || Number((effectiveEntry * 1.10).toFixed(2)),
        openedAt: new Date().toISOString(),
        status: 'ABERTA',
        robotAdvice: isOption 
          ? `Opção ${cleanTicker} registrada com cotação de R$ ${effectiveCurrent.toFixed(2)}. Monitorando alvos e zonas de stop.`
          : `Posição manual em ${cleanTicker} adicionada à sua carteira.`,
        originSetup: isOption ? 'Opção Manual' : 'Entrada Manual',
        modality: isOption ? 'OPTIONS' : 'SWING'
      };

      KaroDatabase.addPosition(userId, newPos);

      return NextResponse.json({ 
        success: true, 
        message: `Posição em ${cleanTicker} adicionada à sua carteira!`,
        data: newPos 
      });
    }

    // 3. EDITAR POSIÇÃO EXISTENTE
    if (action === 'UPDATE_POSITION') {
      const { id, entryPrice, currentPrice, quantity, stopLoss, target1, target2, status, name } = payload;
      const updated = KaroDatabase.updatePosition(userId, id, {
        entryPrice,
        currentPrice,
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

    // 6. SINCRONIZAR POSIÇÕES DO NAVEGADOR COM O SERVIDOR
    if (action === 'SYNC_POSITIONS') {
      const { positions } = payload;
      if (Array.isArray(positions) && positions.length > 0) {
        KaroDatabase.syncUserPositions(userId, positions);
      }
      const summary = KaroDatabase.getPortfolioSummary(userId);
      return NextResponse.json({ 
        success: true, 
        message: 'Posições sincronizadas com sucesso.',
        data: summary
      });
    }

    return NextResponse.json({ success: false, message: 'Ação desconhecida.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}