export interface Candle {
  time: number | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TimeFrame = '5m' | '15m' | '60m' | '1d';
export type ActionDirection = 'BUY' | 'SELL' | 'NEUTRAL';
export type MarketType = 'B3' | 'CRYPTO';

export type SetupStatus = 
  | 'FORMING'
  | 'READY'
  | 'TRIGGERED'
  | 'TARGET_1'
  | 'TARGET_2'
  | 'STOPPED'
  | 'EXPIRED';

export interface StrategySignal {
  name: string;
  category: 'WYCKOFF' | 'BROOKS' | 'MINERVINI' | 'VELEZ' | 'SMC_ICT' | 'ELDER' | 'LARRY_WILLIAMS';
  direction: ActionDirection;
  confidence: number;
  description: string;
  entryPrice?: number;
  stopPrice?: number;
  targetPrice1?: number;
  targetPrice2?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: 'InfoMoney' | 'Valor Econômico' | 'Investing.com Brasil' | 'G1 Economia' | 'Reuters Brasil' | 'Broadcast B3' | 'CoinDesk Brasil';
  url: string;
  publishedAt: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  impactLevel: 'ALTO' | 'MEDIO' | 'BAIXO';
  relatedTickers: string[];
  summary: string;
  catalystTopic: string;
}

export type BrokerType = 
  | 'XP' 
  | 'CLEAR' 
  | 'BTG' 
  | 'RICO' 
  | 'GENIAL' 
  | 'TORO' 
  | 'NUINVEST' 
  | 'INTER' 
  | 'AGORA'
  | 'BINANCE'
  | 'MERCADO_BITCOIN';

export interface BrokerLesson {
  teacher: string;
  role: string;
  coreConcept: string;
  practicalRule: string;
  videoOrCourseTopic: string;
}

export interface BrokerProfile {
  id: BrokerType;
  name: string;
  popularFor: string;
  brokerageFee: string;
  platforms: string[];
  orderStepsGuide: {
    swingTrade: string[];
    dayTrade: string[];
    options: string[];
  };
  lessons: BrokerLesson[];
}

export type GoalPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type GoalUnit = 'FIXED_BRL' | 'PERCENT';

export interface UserFinancialGoal {
  targetAmount: number;
  unit: GoalUnit;
  period: GoalPeriod;
  accountCapital: number;
  selectedBroker: BrokerType;
}

export interface CustomizedStrategyOption {
  optionNumber: 1 | 2 | 3;
  category: 'CONSERVADORA_ACOES' | 'MODERADA_OPCOES' | 'AGRESSIVA_DAYTRADE';
  title: string;
  tickerOrStructure: string;
  capitalRequired: number;
  sharesOrContractsQuantity: number;
  entryPrice: number;
  stopLossPrice: number;
  targetPrice: number;
  estimatedReturnBRL: number;
  estimatedLossBRL: number;
  riskRewardDisplay: string;
  timeframeDisplay: string;
  howToExecuteInBroker: string;
  explanationForBeginners: string;
  whyThisOptionFitsGoal: string;
}

export interface SwingTradePlan {
  entryPrice: number;
  stopLoss: number;
  stopLossPercent: number;
  target1: number;
  target1Percent: number;
  target2: number;
  target2Percent: number;
  riskRewardRatio: number;
  timeHorizon: string;
  riskProfile: 'MODERADO' | 'BAIXO';
  riskAnalysis: string;
  executionSteps: string;
  standardLotTicker: string;
  fractionalLotTicker: string;
  shareType: 'ON' | 'PN' | 'UNT';
  governanceSegment: string;
}

export interface DayTradePlan {
  entryTrigger: number;
  stopLoss: number;
  stopLossPercent: number;
  target1: number;
  target1Percent: number;
  target2: number;
  target2Percent: number;
  riskRewardRatio: number;
  timeHorizon: string;
  riskProfile: 'ALTO_RETORNO' | 'AGRESSIVO';
  riskAnalysis: string;
  executionSteps: string;
  standardLotTicker: string;
  fractionalLotTicker: string;
}

// CONTRATO DE OPÇÃO OFICIAL B3
export interface B3OptionContract {
  ticker: string;
  underlyingStock: string;
  strike: number;
  optionType: 'CALL' | 'PUT';
  style: 'AMERICANA' | 'EUROPEIA';
  moneyness: 'ITM' | 'ATM' | 'OTM';
  expirationDate: string;
  estimatedPremium: number;
  delta?: number;
  volume24h?: number;
}

export type TimeRiskLevel = 
  | 'RISCO_BAIXO_JANELA_IDEAL' 
  | 'RISCO_MODERADO' 
  | 'SERIE_SEGUINTE_PROTEGIDA';

export type OptionStrategyType =
  | 'TRAVA_ALTA_CALL'
  | 'COMPRA_CALL_SECO'
  | 'VENDA_COBERTA_CALL'
  | 'TRAVA_BAIXA_PUT'
  | 'COMPRA_PUT_SECO';

export interface OptionStrategyDetail {
  id: OptionStrategyType;
  title: string;
  badge: string;
  description: string;
  costOrIncomePerUnit: number;
  isCredit: boolean;
  maxRiskDescription: string;
  maxProfitDescription: string;
  breakevenPrice: number;
  executionGuide: string;
  leg1: B3OptionContract;
  leg2?: B3OptionContract;
}

export interface OptionsTradePlan {
  structureType: OptionStrategyType;
  structureName: string;
  suggestedTicker: string;
  strike1: number;
  strike2?: number;
  expirationMonth: string;
  expirationDateExact: string;
  daysToExpiration: number;
  timeRiskLevel: TimeRiskLevel;
  timeRiskDescription: string;
  timeStopRule: string;
  estimatedCostPerUnit: number;
  maxRiskDescription: string;
  maxProfitDescription: string;
  breakevenPrice: number;
  riskAnalysis: string;
  executionSteps: string;
  leg1: B3OptionContract;
  leg2?: B3OptionContract;
  availableStrikesChain?: B3OptionContract[];
  availableStrategies?: OptionStrategyDetail[];
  longTermPlan?: OptionsTradePlan;
}

// ANÁLISE INSTITUCIONAL MULTICENÁRIOS (TOP TIER DESK)
export interface InstitutionalScenarioAnalysis {
  convictionLevel: 'ALTA_CONVICCAO' | 'MODERADA_ASSIMETRICA';
  institutionalCatalyst: string;
  bullishScenario: {
    title: string;
    trigger: string;
    targetPrice: number;
    expectedGainPercent: number;
    probability: number;
    actionPlan: string;
  };
  neutralScenario: {
    title: string;
    behavior: string;
    timeStopDays: number;
    capitalManagement: string;
  };
  invalidationScenario: {
    title: string;
    technicalInvalidationLevel: number;
    maxRiskPercent: number;
    exitRule: string;
  };
}

export interface ActivePosition {
  id: string;
  ticker: string;
  name: string;
  market: MarketType;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  totalInvested: number;
  currentValue: number;
  pnlAmount: number;
  pnlPercent: number;
  stopLoss: number;
  target1: number;
  target2: number;
  openedAt: string;
  status: 'ABERTA' | 'ALVO_1_ATINGIDO' | 'STOP_BREAKEVEN' | 'ENCERRADA_LUCRO' | 'ENCERRADA_STOP';
  robotAdvice: string;
  originSetup?: string;
  modality?: 'OPTIONS' | 'SWING' | 'DAYTRADE';
  optionTicker?: string;
  optionStrike?: number;
}

export interface PortfolioSummary {
  totalCapitalInvested: number;
  totalCurrentValue: number;
  totalPnlAmount: number;
  totalPnlPercent: number;
  openPositionsCount: number;
  winningPositionsCount: number;
  losingPositionsCount: number;
  positions: ActivePosition[];
}

export interface PositionSizeResult {
  accountCapital: number;
  riskPercentage: number;
  riskAmount: number;
  entryPrice: number;
  stopLoss: number;
  riskPerShare: number;
  recommendedShares: number;
  totalPositionValue: number;
  potentialProfitT1: number;
  potentialProfitT2: number;
  potentialLoss: number;
}

export interface SeniorAnalysisResult {
  ticker: string;
  name: string;
  market?: MarketType;
  standardLotTicker: string;
  fractionalLotTicker: string;
  shareType: 'ON' | 'PN' | 'UNT';
  governanceSegment: string;
  isinCode: string;
  
  currentPrice: number;
  change24h: number;
  volume24h: number;
  relativeVolume: number;
  timeframe: TimeFrame;
  timestamp: string;
  
  action: ActionDirection;
  confluenceScore: number;
  setupTitle: string;
  seniorThesis: string;
  institutionalScenarios?: InstitutionalScenarioAnalysis; // Análise Multicenários Institucional
  newsSentiment?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  recentCatalysts?: string[];
  
  swingTrade: SwingTradePlan;
  dayTrade: DayTradePlan;
  optionsTrade: OptionsTradePlan;
  
  entryTrigger: number;
  stopLoss: number;
  stopLossPercent: number;
  target1: number;
  target1Percent: number;
  target2: number;
  target2Percent: number;
  riskRewardRatio: number;
  
  signals: StrategySignal[];
  macroTrend: 'ALTA_FORTE' | 'ALTA' | 'LATERAL' | 'BAIXA' | 'BAIXA_FORTE';
  intermediateTrend: 'ALTA' | 'CORRECAO_COMPRA' | 'LATERAL' | 'CORRECAO_VENDA' | 'BAIXA';
  microTrigger: 'COMPRA_ARMADA' | 'VENDA_ARMADA' | 'AGUARDANDO';
  status: SetupStatus;
}

export interface MarketOverview {
  ibovScore: number;
  ibovTrend: string;
  sp500Trend: string;
  marketRegime: 'BULLISH' | 'BEARISH' | 'CONSOLIDATED' | 'HIGH_VOLATILITY';
  activeOpportunitiesCount: number;
  topOpportunities: SeniorAnalysisResult[];
  latestNews: NewsItem[];
  portfolioSummary?: PortfolioSummary;
  lastScanTime: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  minScore: number;
}