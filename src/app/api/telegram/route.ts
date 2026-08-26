import { NextRequest, NextResponse } from 'next/server';
import { MarketScannerEngine } from '@/core/scanner';
import { TelegramNotificationService } from '@/core/notifications/telegram';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = MarketScannerEngine.getTelegramConfig();
  return NextResponse.json({ success: true, config });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, config } = body;

    if (action === 'SAVE_CONFIG') {
      MarketScannerEngine.setTelegramConfig(config);
      return NextResponse.json({ success: true, message: 'Configurações do Telegram salvas!' });
    }

    if (action === 'TEST_NOTIFICATION') {
      const result = await TelegramNotificationService.sendTestNotification(config);
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, message: 'Ação desconhecida.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
