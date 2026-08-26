import { ActivePosition, PortfolioSummary, SeniorAnalysisResult, MarketType, TelegramConfig } from './types';
import { TelegramNotificationService } from './notifications/telegram';

export class PortfolioService {
  private static positions: ActivePosition[] = [
    {
      id: 'pos-1',
      ticker: 'PETR4.SA',
      name: 'Petrobras PN',
      market: 'B3',
      direction: 'BUY',
      entryPrice: 38.20,
      currentPrice: 38.80,
      quantity: 300,
      totalInvested: 11460.00,
      currentValue: 11640.00,
      pnlAmount: 180.00,
      pnlPercent: 1.57,
      stopLoss: 37.25,
      target1: 40.10,
      target2: 42.00,
      openedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'ABERTA',
      robotAdvice: 'Posição no lucro (+1.57%). Mantenha o Stop de proteção em R$ 37,25 e aguarde o teste do Alvo 1 em R$ 40,10.',
      originSetup: 'Barra Elefante Oliver Velez'
    },
    {
      id: 'pos-2',
      ticker: 'WEGE3.SA',
      name: 'WEG ON',
      market: 'B3',
      direction: 'BUY',
      entryPrice: 51.50,
      currentPrice: 52.80,
      quantity: 200,
      totalInvested: 10300.00,
      currentValue: 10560.00,
      pnlAmount: 260.00,
      pnlPercent: 2.52,
      stopLoss: 51.50, // Já movido para o breakeven
      target1: 54.00,
      target2: 56.50,
      openedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'STOP_BREAKEVEN',
      robotAdvice: '🛡️ Risco Zero Garantido! Stop Loss ajustado para o Preço de Entrada (R$ 51,50). Deixe o lucro correr até o Alvo 1 em R$ 54,00.',
      originSetup: 'Mark Minervini VCP Breakout'
    }
  ];

  public static getPortfolioSummary(): PortfolioSummary {
    const totalInvested = this.positions.reduce((acc, p) => acc + p.totalInvested, 0);
    const totalCurrent = this.positions.reduce((acc, p) => acc + p.currentValue, 0);
    const totalPnl = totalCurrent - totalInvested;
    const totalPnlPct = totalInvested > 0 ? Number(((totalPnl / totalInvested) * 100).toFixed(2)) : 0;

    const winning = this.positions.filter(p => p.pnlAmount > 0).length;
    const losing = this.positions.filter(p => p.pnlAmount < 0).length;

    return {
      totalCapitalInvested: Number(totalInvested.toFixed(2)),
      totalCurrentValue: Number(totalCurrent.toFixed(2)),
      totalPnlAmount: Number(totalPnl.toFixed(2)),
      totalPnlPercent: totalPnlPct,
      openPositionsCount: this.positions.length,
      winningPositionsCount: winning,
      losingPositionsCount: losing,
      positions: [...this.positions]
    };
  }

  // 1-Clique: Usuário seguiu recomendação do robô
  public static addPositionFromSignal(
    signal: SeniorAnalysisResult,
    quantity: number = 100,
    customEntry?: number
  ): ActivePosition {
    const entryPrice = customEntry || signal.currentPrice;
    const totalInvested = Number((quantity * entryPrice).toFixed(2));
    const market = signal.market || (signal.ticker.endsWith('.SA') ? 'B3' : 'CRYPTO');

    const newPos: ActivePosition = {
      id: `pos-${Date.now()}`,
      ticker: signal.ticker,
      name: signal.name,
      market,
      direction: signal.action === 'BUY' ? 'BUY' : 'SELL',
      entryPrice,
      currentPrice: signal.currentPrice,
      quantity,
      totalInvested,
      currentValue: totalInvested,
      pnlAmount: 0.00,
      pnlPercent: 0.00,
      stopLoss: signal.stopLoss,
      target1: signal.target1,
      target2: signal.target2,
      openedAt: new Date().toISOString(),
      status: 'ABERTA',
      robotAdvice: `🚀 Operação iniciada com sucesso! O robô está monitorando a cada 5m. Stop inicial em R$ ${signal.stopLoss.toFixed(2)}.`,
      originSetup: signal.setupTitle
    };

    this.positions.unshift(newPos);
    console.log(`[Portfolio] Nova posição cadastrada pelo usuário: ${newPos.ticker} (${quantity} cotas a R$ ${entryPrice})`);
    return newPos;
  }

  // Adição Manual pelo Usuário
  public static addManualPosition(
    ticker: string,
    name: string,
    market: MarketType,
    entryPrice: number,
    quantity: number,
    stopLoss?: number,
    target1?: number
  ): ActivePosition {
    const totalInvested = Number((quantity * entryPrice).toFixed(2));
    const stop = stopLoss || Number((entryPrice * 0.975).toFixed(2));
    const t1 = target1 || Number((entryPrice * 1.05).toFixed(2));

    const newPos: ActivePosition = {
      id: `pos-${Date.now()}`,
      ticker,
      name,
      market,
      direction: 'BUY',
      entryPrice,
      currentPrice: entryPrice,
      quantity,
      totalInvested,
      currentValue: totalInvested,
      pnlAmount: 0.00,
      pnlPercent: 0.00,
      stopLoss: stop,
      target1: t1,
      target2: Number((entryPrice * 1.10).toFixed(2)),
      openedAt: new Date().toISOString(),
      status: 'ABERTA',
      robotAdvice: `Posição cadastrada manualmente. Stop de proteção em R$ ${stop.toFixed(2)} e Alvo 1 em R$ ${t1.toFixed(2)}.`,
      originSetup: 'Entrada Manual da Carteira'
    };

    this.positions.unshift(newPos);
    return newPos;
  }

  // Atualização em Tempo Real e Guardião de Trades
  public static async updatePositionsWithCurrentPrices(
    priceMap: Map<string, number>,
    telegramConfig?: TelegramConfig
  ) {
    for (const pos of this.positions) {
      const livePrice = priceMap.get(pos.ticker);
      if (!livePrice) continue;

      pos.currentPrice = livePrice;
      pos.currentValue = Number((pos.quantity * livePrice).toFixed(2));
      pos.pnlAmount = Number((pos.currentValue - pos.totalInvested).toFixed(2));
      pos.pnlPercent = Number(((pos.pnlAmount / pos.totalInvested) * 100).toFixed(2));

      // LÓGICA DO GUARDIÃO INTELIGENTE DE TRADES
      if (pos.direction === 'BUY') {
        // 1. Atingiu Alvo 2 (Final)
        if (livePrice >= pos.target2 && pos.status !== 'ENCERRADA_LUCRO') {
          pos.status = 'ENCERRADA_LUCRO';
          pos.robotAdvice = `🎉 ALVO FINAL ATINGIDO (+${pos.pnlPercent}%)! Parabéns, encerre a operação e coloque todo o lucro no bolso!`;
          if (telegramConfig?.enabled) {
            await TelegramNotificationService.sendFollowUpAlert(pos, 'ALVO_FINAL', telegramConfig);
          }
        }
        // 2. Atingiu Alvo 1 (Realização Parcial 50%)
        else if (livePrice >= pos.target1 && pos.status === 'ABERTA') {
          pos.status = 'ALVO_1_ATINGIDO';
          pos.stopLoss = pos.entryPrice; // Sobe o stop pro zero a zero
          pos.robotAdvice = `🎯 ALVO 1 ATINGIDO (+${pos.pnlPercent}%)! Venda 50% das ações agora para garantir lucro e suba o Stop Loss das ações restantes para R$ ${pos.entryPrice.toFixed(2)} (Risco Zero)!`;
          if (telegramConfig?.enabled) {
            await TelegramNotificationService.sendFollowUpAlert(pos, 'ALVO_1', telegramConfig);
          }
        }
        // 3. Lucro de +2.0% sem bater alvo ainda -> Alerta de Breakeven
        else if (pos.pnlPercent >= 2.0 && pos.status === 'ABERTA' && pos.stopLoss < pos.entryPrice) {
          pos.status = 'STOP_BREAKEVEN';
          pos.stopLoss = pos.entryPrice;
          pos.robotAdvice = `🛡️ PROTEÇÃO ATIVADA (+${pos.pnlPercent}%)! O ativo subiu bem. Mova seu Stop Loss para o preço de compra (R$ ${pos.entryPrice.toFixed(2)}) para operar sem risco de perda!`;
          if (telegramConfig?.enabled) {
            await TelegramNotificationService.sendFollowUpAlert(pos, 'BREAKEVEN', telegramConfig);
          }
        }
        // 4. Bateu no Stop Loss
        else if (livePrice <= pos.stopLoss && pos.status !== 'ENCERRADA_STOP') {
          pos.status = 'ENCERRADA_STOP';
          pos.robotAdvice = `🛑 STOP LOSS ATIVADO (${pos.pnlPercent}%). Posição encerrada para preservar o capital. Disciplina é a chave da consistência!`;
          if (telegramConfig?.enabled) {
            await TelegramNotificationService.sendFollowUpAlert(pos, 'STOP_LOSS', telegramConfig);
          }
        }
      }
    }
  }

  public static removePosition(id: string) {
    this.positions = this.positions.filter(p => p.id !== id);
  }
}
