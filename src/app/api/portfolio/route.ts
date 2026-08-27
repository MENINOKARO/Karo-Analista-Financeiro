import { NextRequest, NextResponse } from 'next/server';
import { KaroDatabase, StoredTradePosition } from '@/core/database/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'usr_demo';
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

    if (action === 'ADD_MANUAL') {
      const { ticker, name, market, entryPrice, quantity, stopLoss, target1 } = payload;
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
        target1: target1 || (entryPrice * 1.05),
        target2: payload.target2 || (entryPrice * 1.10),
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

    if (action === 'REMOVE_POSITION') {
      const { id } = payload;
      KaroDatabase.removePosition(userId, id);
      return NextResponse.json({ success: true, message: 'Posição encerrada/removida com sucesso.' });
    }

    return NextResponse.json({ success: false, message: 'Ação desconhecida.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}