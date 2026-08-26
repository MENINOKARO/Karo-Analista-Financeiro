import { NextResponse } from 'next/server';
import { MarketScannerEngine } from '@/core/scanner';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const overview = MarketScannerEngine.getLatestOverview();
    if (overview.topOpportunities.length === 0) {
      const freshOverview = await MarketScannerEngine.executeFullScan();
      return NextResponse.json({ success: true, data: freshOverview });
    }
    return NextResponse.json({ success: true, data: overview });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const freshOverview = await MarketScannerEngine.executeFullScan();
    return NextResponse.json({ success: true, data: freshOverview });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
