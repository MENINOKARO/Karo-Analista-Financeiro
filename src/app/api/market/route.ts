import { NextRequest, NextResponse } from 'next/server';
import { MarketFeedService, WATCHLIST } from '@/core/market-feed';
import { SeniorAnalystEngine } from '@/core/analyst-engine';
import { TechnicalIndicators } from '@/core/indicators';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol') || 'PETR4.SA';
  const interval = (searchParams.get('interval') || '5m') as any;

  try {
    const candles = await MarketFeedService.getCandles(symbol, interval, 50);
    const closes = candles.map(c => c.close);
    const ema9 = TechnicalIndicators.calculateEMA(closes, 9);
    const ema20 = TechnicalIndicators.calculateEMA(closes, 20);
    const vwap = TechnicalIndicators.calculateVWAP(candles);

    const chartData = candles.map((c, i) => ({
      time: typeof c.time === 'string' ? c.time.split('T')[1]?.slice(0, 5) || c.time : c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume,
      ema9: isNaN(ema9[i]) ? null : Number(ema9[i].toFixed(2)),
      ema20: isNaN(ema20[i]) ? null : Number(ema20[i].toFixed(2)),
      vwap: isNaN(vwap[i]) ? null : Number(vwap[i].toFixed(2))
    }));

    return NextResponse.json({
      success: true,
      symbol,
      watchlist: WATCHLIST,
      data: chartData
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
