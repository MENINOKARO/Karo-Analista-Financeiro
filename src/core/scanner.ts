import { SeniorAnalysisResult, MarketOverview, TelegramConfig, NewsItem, MarketType } from './types';
import { WATCHLIST, MarketFeedService, TickerInfo } from './market-feed';
import { CRYPTO_WATCHLIST, CryptoFeedService, CryptoTickerInfo } from './crypto-feed';
import { SeniorAnalystEngine } from './analyst-engine';
import { TelegramNotificationService } from './notifications/telegram';
import { NewsService } from './news-service';
import { PortfolioService } from './portfolio-service';

export class MarketScannerEngine {
  private static cachedOpportunities: SeniorAnalysisResult[] = [];
  private static cachedNews: NewsItem[] = [];
  private static lastScanTime: string = new Date().toISOString();
  private static isScanning: boolean = false;
  private static telegramConfig: TelegramConfig = {
    botToken: '',
    chatId: '',
    enabled: false,
    minScore: 75
  };

  public static setTelegramConfig(config: Partial<TelegramConfig>) {
    this.telegramConfig = { ...this.telegramConfig, ...config };
  }

  public static getTelegramConfig(): TelegramConfig {
    return this.telegramConfig;
  }

  public static async executeFullScan(): Promise<MarketOverview> {
    if (this.isScanning) {
      return this.getLatestOverview();
    }

    this.isScanning = true;
    console.log(`[Scanner Multi-Mercado] Iniciando varredura em B3 (${WATCHLIST.length}) e Cripto (${CRYPTO_WATCHLIST.length})...`);
    const startTime = Date.now();

    this.cachedNews = await NewsService.getLatestMarketNews();
    const opportunities: SeniorAnalysisResult[] = [];
    const livePriceMap = new Map<string, number>();

    // 1. SCANNER AÇÕES B3
    const b3Promises = WATCHLIST.map(async (tickerInfo: TickerInfo) => {
      try {
        const [candles5m, candles15m, candlesDaily] = await Promise.all([
          MarketFeedService.getCandles(tickerInfo.symbol, '5m', 60),
          MarketFeedService.getCandles(tickerInfo.symbol, '15m', 40),
          MarketFeedService.getCandles(tickerInfo.symbol, '1d', 30)
        ]);

        if (candles5m.length > 0) {
          livePriceMap.set(tickerInfo.symbol, candles5m[candles5m.length - 1].close);
        }

        const analysis = SeniorAnalystEngine.evaluateStock(
          tickerInfo.symbol,
          tickerInfo.name,
          candles5m,
          candles15m,
          candlesDaily
        );

        if (analysis && analysis.confluenceScore >= 70) {
          analysis.market = 'B3';
          opportunities.push(analysis);

          if (this.telegramConfig.enabled) {
            await TelegramNotificationService.sendSeniorSignalAlert(analysis, this.telegramConfig);
          }
        }
      } catch (err: any) {
        console.error(`[Scanner B3] Erro em ${tickerInfo.symbol}:`, err.message);
      }
    });

    // 2. SCANNER MERCADO CRIPTO 24/7
    const cryptoPromises = CRYPTO_WATCHLIST.map(async (cTicker: CryptoTickerInfo) => {
      try {
        const [candles5m, candles15m, candlesDaily] = await Promise.all([
          CryptoFeedService.getCandles(cTicker.symbol, '5m', 60),
          CryptoFeedService.getCandles(cTicker.symbol, '15m', 40),
          CryptoFeedService.getCandles(cTicker.symbol, '1d', 30)
        ]);

        if (candles5m.length > 0) {
          livePriceMap.set(cTicker.symbol, candles5m[candles5m.length - 1].close);
        }

        const analysis = SeniorAnalystEngine.evaluateStock(
          cTicker.symbol,
          cTicker.name,
          candles5m,
          candles15m,
          candlesDaily
        );

        if (analysis && analysis.confluenceScore >= 70) {
          analysis.market = 'CRYPTO';
          opportunities.push(analysis);

          if (this.telegramConfig.enabled) {
            await TelegramNotificationService.sendSeniorSignalAlert(analysis, this.telegramConfig);
          }
        }
      } catch (err: any) {
        console.error(`[Scanner Cripto] Erro em ${cTicker.symbol}:`, err.message);
      }
    });

    await Promise.all([...b3Promises, ...cryptoPromises]);

    // 3. ACOMPANHAMENTO ATIVO DA CARTEIRA DO USUÁRIO (GUARDIÃO DE TRADES)
    await PortfolioService.updatePositionsWithCurrentPrices(livePriceMap, this.telegramConfig);

    opportunities.sort((a, b) => b.confluenceScore - a.confluenceScore);

    this.cachedOpportunities = opportunities;
    this.lastScanTime = new Date().toISOString();
    this.isScanning = false;

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Scanner] Varredura concluída em ${elapsed}s. ${opportunities.length} oportunidades institucionais.`);

    return this.getLatestOverview();
  }

  public static getLatestOverview(): MarketOverview {
    const buyCount = this.cachedOpportunities.filter(o => o.action === 'BUY').length;
    const sellCount = this.cachedOpportunities.filter(o => o.action === 'SELL').length;

    let marketRegime: 'BULLISH' | 'BEARISH' | 'CONSOLIDATED' | 'HIGH_VOLATILITY' = 'BULLISH';
    if (buyCount > sellCount * 1.5) marketRegime = 'BULLISH';
    else if (sellCount > buyCount * 1.5) marketRegime = 'BEARISH';
    else marketRegime = 'CONSOLIDATED';

    return {
      ibovScore: 84,
      ibovTrend: 'Tendência de Alta B3 com Fluxo Institucional e Balanços Positivos',
      sp500Trend: 'Consolidação Altista Global',
      marketRegime,
      activeOpportunitiesCount: this.cachedOpportunities.length,
      topOpportunities: this.cachedOpportunities,
      latestNews: this.cachedNews.length > 0 ? this.cachedNews : NewsService.generateFallbackNews(),
      portfolioSummary: PortfolioService.getPortfolioSummary(),
      lastScanTime: this.lastScanTime
    };
  }

  public static getStockDetails(symbol: string): SeniorAnalysisResult | undefined {
    return this.cachedOpportunities.find(o => o.ticker.toLowerCase() === symbol.toLowerCase());
  }
}
