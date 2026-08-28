import { NextRequest, NextResponse } from 'next/server';
import { MarketScannerEngine } from '@/core/scanner';
import { TelegramNotificationService } from '@/core/notifications/telegram';

export const dynamic = 'force-dynamic';

const OFFICIAL_BOT_TOKEN = '8870401097:AAGStWSy-NzsnMZKVL_VTaCUErqV116DTvM';

export async function GET() {
  const config = MarketScannerEngine.getTelegramConfig();
  if (!config.botToken) config.botToken = OFFICIAL_BOT_TOKEN;
  return NextResponse.json({ success: true, data: config, config });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, config } = body;

    const finalConfig = {
      botToken: OFFICIAL_BOT_TOKEN,
      ...config
    };

    if (action === 'SAVE_CONFIG') {
      MarketScannerEngine.setTelegramConfig(finalConfig);
      return NextResponse.json({ success: true, message: 'Configurações do Telegram salvas com sucesso!' });
    }

    if (action === 'TEST_NOTIFICATION' || action === 'SEND_TEST_MESSAGE') {
      const result = await TelegramNotificationService.sendTestNotification(finalConfig);
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: 'Ação desconhecida.', message: 'Ação desconhecida.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, message: err.message }, { status: 500 });
  }
}
