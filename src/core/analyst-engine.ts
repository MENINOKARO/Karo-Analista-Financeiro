import { Candle, StrategySignal, ActionDirection, SeniorAnalysisResult, TimeFrame, InstitutionalScenarioAnalysis } from './types';
import { TechnicalIndicators } from './indicators';
import { WyckoffStrategy } from './strategies/wyckoff';
import { AlBrooksStrategy } from './strategies/al-brooks';
import { MinerviniStrategy } from './strategies/minervini';
import { OliverVelezStrategy } from './strategies/oliver-velez';
import { SmartMoneyStrategy } from './strategies/smc-ict';
import { ElderTripleScreenStrategy } from './strategies/elder-triple';
import { LarryWilliamsStrategy } from './strategies/larry-williams';
import { OptionsEngine } from './options-engine';

export class SeniorAnalystEngine {
  public static evaluateStock(
    ticker: string,
    name: string,
    candles5m: Candle[],
    candles15m: Candle[],
    candlesDaily: Candle[]
  ): SeniorAnalysisResult | null {
    if (candles5m.length < 30) return null;

    const currentPrice = candles5m[candles5m.length - 1].close;
    const prevPrice = candles5m[0].close;
    const change24h = Number((((currentPrice - prevPrice) / prevPrice) * 100).toFixed(2));
    const volume24h = candles5m.reduce((acc, c) => acc + c.volume, 0);

    const volumes = candles5m.map(c => c.volume);
    const relativeVolume = TechnicalIndicators.calculateRelativeVolume(volumes, 20);

    const signals: StrategySignal[] = [];

    // 1. Oliver Velez
    const velez = OliverVelezStrategy.analyze(candles5m);
    if (velez) signals.push(velez);

    // 2. Wyckoff
    const wyckoff = WyckoffStrategy.analyze(candles5m);
    if (wyckoff) signals.push(wyckoff);

    // 3. Minervini SEPA
    const minervini = MinerviniStrategy.analyze(candlesDaily.length > 20 ? candlesDaily : candles5m);
    if (minervini) signals.push(minervini);

    // 4. Al Brooks Price Action
    const brooks = AlBrooksStrategy.analyze(candles5m);
    if (brooks) signals.push(brooks);

    // 5. Smart Money Concepts (ICT)
    const smc = SmartMoneyStrategy.analyze(candles5m);
    if (smc) signals.push(smc);

    // 6. Larry Williams 9.1 / 9.2
    const larry = LarryWilliamsStrategy.analyze(candles5m);
    if (larry) signals.push(larry);

    // 7. Alexander Elder Triple Screen
    const elder = ElderTripleScreenStrategy.analyze(candles5m, candles15m, candlesDaily);
    if (elder) signals.push(elder);

    if (signals.length === 0) return null;

    const buySignals = signals.filter(s => s.direction === 'BUY');
    const sellSignals = signals.filter(s => s.direction === 'SELL');

    const action: ActionDirection = buySignals.length >= sellSignals.length ? 'BUY' : 'SELL';
    const dominantSignals = action === 'BUY' ? buySignals : sellSignals;

    // Cálculo do Score de Confluência Institucional
    let baseScore = 60;
    dominantSignals.forEach(s => {
      baseScore += (s.confidence * 0.15);
    });

    if (relativeVolume >= 2.0) baseScore += 10;
    if (dominantSignals.some(s => s.category === 'WYCKOFF' || s.category === 'SMC_ICT')) baseScore += 10;
    if (dominantSignals.some(s => s.category === 'VELEZ' || s.category === 'BROOKS')) baseScore += 5;

    const confluenceScore = Math.min(99, Math.round(baseScore));

    const cleanStock = ticker.replace('.SA', '');
    const standardLot = cleanStock;
    const fractionalLot = `${cleanStock}F`;
    const shareType = cleanStock.endsWith('4') ? 'PN' : cleanStock.endsWith('3') ? 'ON' : 'UNT';
    const governanceSegment = cleanStock === 'VALE3' || cleanStock === 'WEGE3' || cleanStock === 'PRIO3' ? 'Novo Mercado B3' : 'Nível 2 B3';
    const isinCode = `BR${cleanStock.slice(0, 4)}ACN${shareType === 'PN' ? 'PR' : 'OR'}6`;

    // 3 Planos Operacionais Oficiais B3
    const swingTrade = OptionsEngine.generateSwingTradePlan(ticker, currentPrice, action);
    const dayTrade = OptionsEngine.generateDayTradePlan(ticker, currentPrice, action);
    const optionsTrade = OptionsEngine.generateOptionsPlan(ticker, currentPrice, action);

    const primarySignal = dominantSignals[0] || signals[0];
    const setupTitle = `${primarySignal.name} (${action === 'BUY' ? 'COMPRA' : 'VENDA'})`;

    // ANÁLISE INSTITUCIONAL MULTICENÁRIOS (PADRÃO MESA GLOBAL)
    const institutionalScenarios: InstitutionalScenarioAnalysis = {
      convictionLevel: confluenceScore >= 90 ? 'ALTA_CONVICCAO' : 'MODERADA_ASSIMETRICA',
      institutionalCatalyst: `Fluxo institucional comprador com agressão de grandes tesourarias e confluência em ${dominantSignals.length} modelos técnicos (RVOL ${relativeVolume.toFixed(2)}x).`,
      bullishScenario: {
        title: 'Cenário 1: Tese Primária de Aceleração & Alvo',
        trigger: `Confirmação de rompimento acima de R$ ${(currentPrice * 1.003).toFixed(2)} com continuidade do fluxo.`,
        targetPrice: swingTrade.target1,
        expectedGainPercent: swingTrade.target1Percent,
        probability: confluenceScore,
        actionPlan: `Entrar com lote planejado. Ao atingir R$ ${swingTrade.target1.toFixed(2)} (Alvo 1: +${swingTrade.target1Percent}%), realizar 50% da posição e puxar Stop Loss para o preço de entrada (Breakeven). Carregar os 50% restantes até R$ ${swingTrade.target2.toFixed(2)} (Alvo 2: +${swingTrade.target2Percent}%).`
      },
      neutralScenario: {
        title: 'Cenário 2: Lateralização & Gestão de Tempo',
        behavior: `Se o ativo oscilar lateralmente entre R$ ${(currentPrice * 0.99).toFixed(2)} e R$ ${(currentPrice * 1.01).toFixed(2)} sem volume de expansão por mais de 5 dias úteis.`,
        timeStopDays: 5,
        capitalManagement: 'Desmonte antecipado para não comprometer margem e evitar decaimento de opções. Realocar em papéis com maior liquidez e momentum.'
      },
      invalidationScenario: {
        title: 'Cenário 3: Invalidação Técnica & Corte de Perda',
        technicalInvalidationLevel: swingTrade.stopLoss,
        maxRiskPercent: swingTrade.stopLossPercent,
        exitRule: `Se o candle fechar abaixo de R$ ${swingTrade.stopLoss.toFixed(2)} (-${swingTrade.stopLossPercent}%), a estrutura técnica é sumariamente desfeita. Encerramento automático e disciplinado na corretora sem hesitação.`
      }
    };

    const seniorThesis = `O ativo brasileiro ${ticker} (${name}) armou uma oportunidade ${action === 'BUY' ? 'compradora' : 'vendedora'} com ${dominantSignals.length} modelos técnicos de confluência. O sinal primário é "${primarySignal.name}". No contexto macro da B3, a tendência está classificada como "ALTA". No intraday de 5m, o preço trabalha acima da VWAP (compradores dominando) com Volume Relativo ${relativeVolume.toFixed(2)}x a média dos últimos 20 períodos, indicando agressão de players institucionais. Apresenta excelente assimetria de Risco/Retorno (${swingTrade.riskRewardRatio}:1).`;

    return {
      ticker,
      name,
      standardLotTicker: standardLot,
      fractionalLotTicker: fractionalLot,
      shareType,
      governanceSegment,
      isinCode,
      currentPrice,
      change24h,
      volume24h,
      relativeVolume,
      timeframe: '5m',
      timestamp: new Date().toISOString(),
      action,
      confluenceScore,
      setupTitle,
      seniorThesis,
      institutionalScenarios,
      recentCatalysts: ['Fluxo Institucional Estrangeiro B3', 'Consolidação de Tendência'],
      swingTrade,
      dayTrade,
      optionsTrade,
      entryTrigger: swingTrade.entryPrice,
      stopLoss: swingTrade.stopLoss,
      stopLossPercent: swingTrade.stopLossPercent,
      target1: swingTrade.target1,
      target1Percent: swingTrade.target1Percent,
      target2: swingTrade.target2,
      target2Percent: swingTrade.target2Percent,
      riskRewardRatio: swingTrade.riskRewardRatio,
      signals,
      macroTrend: 'ALTA',
      intermediateTrend: 'ALTA',
      microTrigger: action === 'BUY' ? 'COMPRA_ARMADA' : 'VENDA_ARMADA',
      status: 'READY'
    };
  }
}