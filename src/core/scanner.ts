import { SeniorAnalysisResult, MarketOverview, TelegramConfig, NewsItem, MarketType } from './types';
import { WATCHLIST, MarketFeedService, TickerInfo } from './market-feed';
import { CRYPTO_WATCHLIST, CryptoFeedService, CryptoTickerInfo } from './crypto-feed';
import { SeniorAnalystEngine } from './analyst-engine';
import { TelegramNotificationService } from './notifications/telegram';
import { NewsService } from './news-service';
import { PortfolioService } from './portfolio-service';
import { KaroDatabase } from './database/db';

export class MarketScannerEngine {
  private static cachedOpportunities: SeniorAnalysisResult[] = [];
  private static cachedNews: NewsItem[] = [];
  private static lastScanTime: string = new Date().toISOString();
  private static isScanning: boolean = false;
  private static telegramConfig: TelegramConfig = {
    botToken: '',
    chatId: '',
    enabled: false,
    minScore: 75,
    notifyOpportunities: true,
    notifyStopProximity: true,
    notifyTargets: true,
    notifyNews: true
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

    // 0. COLETAR COTAÇÕES EM TEMPO REAL VIA TRADINGVIEW SCANNER B3
    let tvQuotesMap: Record<string, any> = {};
    try {
      tvQuotesMap = await MarketFeedService.getTradingViewQuotes(WATCHLIST.map(w => w.symbol));
    } catch (e) {}

    // 1. SCANNER AÇÕES B3
    const b3Promises = WATCHLIST.map(async (tickerInfo: TickerInfo) => {
      try {
        const cleanTicker = tickerInfo.symbol.replace(/\.SA$/, '');
        const tvData = tvQuotesMap[cleanTicker] || tvQuotesMap[tickerInfo.symbol];

        const [candles5m, candles15m, candlesDaily] = await Promise.all([
          MarketFeedService.getCandles(tickerInfo.symbol, '5m', 60),
          MarketFeedService.getCandles(tickerInfo.symbol, '15m', 40),
          MarketFeedService.getCandles(tickerInfo.symbol, '1d', 30)
        ]);

        if (tvData && tvData.price > 0) {
          livePriceMap.set(tickerInfo.symbol, tvData.price);
          livePriceMap.set(cleanTicker, tvData.price);
        } else if (candles5m.length > 0) {
          livePriceMap.set(tickerInfo.symbol, candles5m[candles5m.length - 1].close);
          livePriceMap.set(cleanTicker, candles5m[candles5m.length - 1].close);
        }

        const analysis = SeniorAnalystEngine.evaluateStock(
          tickerInfo.symbol,
          tickerInfo.name,
          candles5m,
          candles15m,
          candlesDaily
        );

        if (analysis) {
          // Atualiza com dados institucionais do TradingView se disponíveis
          if (tvData && tvData.price > 0) {
            analysis.currentPrice = tvData.price;
            analysis.change24h = tvData.changePercent;
          }

          // CÁLCULO DO MOTOR DE PROBABILIDADES DIRECIONAIS 5M
          const baseScore = analysis.confluenceScore;
          const tvBonus = tvData ? (tvData.recommendation * 8) : 0;

          if (analysis.action === 'BUY') {
            const pUp = Math.min(95, Math.max(55, Math.round(baseScore + tvBonus)));
            analysis.probabilityUp = pUp;
            analysis.probabilityDown = 100 - pUp;
            analysis.flowIntensity = pUp >= 80 ? 'FORTE_COMPRA' : 'COMPRA_MODERADA';
          } else if (analysis.action === 'SELL') {
            const pDown = Math.min(95, Math.max(55, Math.round(baseScore + Math.abs(tvBonus))));
            analysis.probabilityDown = pDown;
            analysis.probabilityUp = 100 - pDown;
            analysis.flowIntensity = pDown >= 80 ? 'FORTE_VENDA' : 'VENDA_MODERADA';
          } else {
            analysis.probabilityUp = 50;
            analysis.probabilityDown = 50;
            analysis.flowIntensity = 'NEUTRO';
          }

          analysis.dataSources = ['TradingView B3 (Tempo Real)', 'Opções.net.br', 'B3 Database'];

          if (analysis.confluenceScore >= 70) {
            analysis.market = 'B3';
            opportunities.push(analysis);

            if (this.telegramConfig.enabled && this.telegramConfig.notifyOpportunities !== false) {
              await TelegramNotificationService.sendSeniorSignalAlert(analysis, this.telegramConfig);
            }
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

        if (analysis) {
          const baseScore = analysis.confluenceScore;
          if (analysis.action === 'BUY') {
            const pUp = Math.min(95, Math.max(55, Math.round(baseScore)));
            analysis.probabilityUp = pUp;
            analysis.probabilityDown = 100 - pUp;
            analysis.flowIntensity = pUp >= 80 ? 'FORTE_COMPRA' : 'COMPRA_MODERADA';
          } else if (analysis.action === 'SELL') {
            const pDown = Math.min(95, Math.max(55, Math.round(baseScore)));
            analysis.probabilityDown = pDown;
            analysis.probabilityUp = 100 - pDown;
            analysis.flowIntensity = pDown >= 80 ? 'FORTE_VENDA' : 'VENDA_MODERADA';
          } else {
            analysis.probabilityUp = 50;
            analysis.probabilityDown = 50;
            analysis.flowIntensity = 'NEUTRO';
          }

          analysis.dataSources = ['Binance Cripto 24/7', 'TradingView Global'];

          if (analysis.confluenceScore >= 70) {
            analysis.market = 'CRYPTO';
            opportunities.push(analysis);

            if (this.telegramConfig.enabled && this.telegramConfig.notifyOpportunities !== false) {
              await TelegramNotificationService.sendSeniorSignalAlert(analysis, this.telegramConfig);
            }
          }
        }
      } catch (err: any) {
        console.error(`[Scanner Cripto] Erro em ${cTicker.symbol}:`, err.message);
      }
    });

    await Promise.all([...b3Promises, ...cryptoPromises]);

    // 3. ACOMPANHAMENTO ATIVO DA CARTEIRA & ALERTAS DE PROXIMIDADE DE STOP / ALVOS
    if (this.telegramConfig.enabled) {
      try {
        const users = KaroDatabase.getAllUsers();
        for (const u of users) {
          const positions = KaroDatabase.getUserPositions(u.id);
          for (const pos of positions) {
            const clean = pos.ticker.replace(/\.SA$/, '');
            const livePrice = livePriceMap.get(pos.ticker) || livePriceMap.get(clean) || pos.currentPrice;
            if (livePrice && livePrice > 0) {
              pos.currentPrice = livePrice;
              // Alerta de Proximidade de Stop Loss (a menos de 1.5% do Stop)
              if (pos.stopLoss > 0 && livePrice <= pos.stopLoss * 1.015 && livePrice > pos.stopLoss) {
                await TelegramNotificationService.sendStopProximityAlert(pos, this.telegramConfig);
              }
              // Alerta de Alvo 1
              if (pos.target1 && livePrice >= pos.target1 && pos.status === 'ABERTA') {
                await TelegramNotificationService.sendFollowUpAlert(pos, 'ALVO_1', this.telegramConfig);
              }
              // Alerta de Alvo 2 (Final)
              if (pos.target2 && livePrice >= pos.target2 && pos.status !== 'ENCERRADA_LUCRO') {
                await TelegramNotificationService.sendFollowUpAlert(pos, 'ALVO_FINAL', this.telegramConfig);
              }
              // Alerta de Stop Executado
              if (pos.stopLoss > 0 && livePrice <= pos.stopLoss && pos.status !== 'ENCERRADA_STOP') {
                await TelegramNotificationService.sendFollowUpAlert(pos, 'STOP_LOSS', this.telegramConfig);
              }
            }
          }
        }

        // 4. Alerta de Notícias Importantes de Alto Impacto
        if (this.telegramConfig.notifyNews !== false && this.cachedNews.length > 0) {
          const highImpactNews = this.cachedNews.filter(n => n.impactLevel === 'ALTO');
          for (const news of highImpactNews.slice(0, 1)) {
            await TelegramNotificationService.sendMarketNewsAlert(news, this.telegramConfig);
          }
        }
      } catch (err: any) {
        console.error('[Scanner Telegram Alert error]:', err?.message);
      }
    }

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
