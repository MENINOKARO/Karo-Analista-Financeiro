import { NextRequest, NextResponse } from 'next/server';
import { PortfolioService } from '@/core/portfolio-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const summary = PortfolioService.getPortfolioSummary();
    return NextResponse.json({ success: true, data: summary });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (action === 'FOLLOW_SIGNAL') {
      const { signal, quantity, customEntry } = payload;
      const newPos = PortfolioService.addPositionFromSignal(signal, quantity, customEntry);
      return NextResponse.json({ 
        success: true, 
        message: `Operação em ${signal.ticker} iniciada! O robô agora está acompanhando a posição.`,
        data: newPos 
      });
    }

    if (action === 'ADD_MANUAL') {
      const { ticker, name, market, entryPrice, quantity, stopLoss, target1 } = payload;
      const newPos = PortfolioService.addManualPosition(ticker, name, market, entryPrice, quantity, stopLoss, target1);
      return NextResponse.json({ 
        success: true, 
        message: `Posição em ${ticker} adicionada à sua carteira!`,
        data: newPos 
      });
    }

    if (action === 'REMOVE_POSITION') {
      const { id } = payload;
      PortfolioService.removePosition(id);
      return NextResponse.json({ success: true, message: 'Posição encerrada/removida com sucesso.' });
    }

    return NextResponse.json({ success: false, message: 'Ação desconhecida.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
