'use client';

import React, { useState } from 'react';
import { Target, DollarSign, Calendar, Building2, CheckCircle2, ShieldAlert, Sparkles, ChevronRight, HelpCircle } from 'lucide-react';
import { UserFinancialGoal, BrokerType, SeniorAnalysisResult, CustomizedStrategyOption } from '@/core/types';
import { BROKERS_DATABASE } from '@/core/brokers-knowledge';
import { GoalEngine } from '@/core/goal-engine';

interface GoalsPlannerTabProps {
  topOpportunity: SeniorAnalysisResult | null;
  onOpenChart: (symbol: string) => void;
}

export function GoalsPlannerTab({ topOpportunity, onOpenChart }: GoalsPlannerTabProps) {
  const [goalType, setGoalType] = useState<'FIXED_BRL' | 'PERCENT'>('FIXED_BRL');
  const [targetAmount, setTargetAmount] = useState<number>(300);
  const [period, setPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [accountCapital, setAccountCapital] = useState<number>(20000);
  const [selectedBroker, setSelectedBroker] = useState<BrokerType>('CLEAR');
  const [selectedOption, setSelectedOption] = useState<1 | 2 | 3>(1);

  const broker = BROKERS_DATABASE[selectedBroker] || BROKERS_DATABASE['CLEAR'];

  const defaultOp: SeniorAnalysisResult = topOpportunity || {
    ticker: 'PETR4.SA',
    name: 'Petrobras PN',
    standardLotTicker: 'PETR4',
    fractionalLotTicker: 'PETR4F',
    shareType: 'PN',
    governanceSegment: 'Nível 2 B3',
    isinCode: 'BRPETRACNPR6',
    currentPrice: 44.30,
    change24h: 5.25,
    volume24h: 15000000,
    relativeVolume: 2.2,
    timeframe: '5m',
    timestamp: new Date().toISOString(),
    action: 'BUY',
    confluenceScore: 95,
    setupTitle: 'Barra Elefante Oliver Velez + Spring Wyckoff',
    seniorThesis: 'Ativo com forte absorção institucional e fluxo comprador de grandes bancos.',
    swingTrade: {
      entryPrice: 44.30,
      stopLoss: 43.19,
      stopLossPercent: 2.5,
      target1: 46.52,
      target1Percent: 5.0,
      target2: 48.73,
      target2Percent: 10.0,
      riskRewardRatio: 3.5,
      timeHorizon: '3 a 15 dias',
      riskProfile: 'MODERADO',
      riskAnalysis: 'Risco baixo com stop no diário.',
      executionSteps: '',
      standardLotTicker: 'PETR4',
      fractionalLotTicker: 'PETR4F',
      shareType: 'PN',
      governanceSegment: 'Nível 2 B3'
    },
    dayTrade: {
      entryTrigger: 44.30,
      stopLoss: 43.90,
      stopLossPercent: 0.9,
      target1: 45.02,
      target1Percent: 1.62,
      target2: 45.50,
      target2Percent: 2.7,
      riskRewardRatio: 2.5,
      timeHorizon: 'Intraday 5m',
      riskProfile: 'ALTO_RETORNO',
      riskAnalysis: 'Risco curto de 0.9%.',
      executionSteps: '',
      standardLotTicker: 'PETR4',
      fractionalLotTicker: 'PETR4F'
    },
    optionsTrade: {
      structureType: 'TRAVA_ALTA_CALL',
      structureName: 'Trava de Alta com Call (PETRH440 / PETRH460)',
      suggestedTicker: 'PETRH440 + PETRH460',
      strike1: 44.00,
      strike2: 46.00,
      expirationMonth: 'Série H (21/08/2026)',
      expirationDateExact: '21/08/2026',
      daysToExpiration: 18,
      timeRiskLevel: 'RISCO_BAIXO_JANELA_IDEAL',
      timeRiskDescription: 'Janela ideal com tempo suficiente para valorização.',
      timeStopRule: 'Desmonte a trava até 4 dias antes do vencimento.',
      estimatedCostPerUnit: 0.70,
      maxRiskDescription: 'Limitado a 100% do prêmio pago.',
      maxProfitDescription: '+185% de lucro sobre o valor investido.',
      breakevenPrice: 44.70,
      riskAnalysis: 'Risco 100% travado.',
      executionSteps: '',
      leg1: {
        ticker: 'PETRH440',
        underlyingStock: 'PETR4',
        strike: 44.00,
        optionType: 'CALL',
        style: 'AMERICANA',
        moneyness: 'ATM',
        expirationDate: '21/08/2026',
        estimatedPremium: 0.95
      },
      leg2: {
        ticker: 'PETRH460',
        underlyingStock: 'PETR4',
        strike: 46.00,
        optionType: 'CALL',
        style: 'AMERICANA',
        moneyness: 'OTM',
        expirationDate: '21/08/2026',
        estimatedPremium: 0.25
      }
    },
    entryTrigger: 44.30,
    stopLoss: 43.19,
    stopLossPercent: 2.5,
    target1: 46.52,
    target1Percent: 5.0,
    target2: 48.73,
    target2Percent: 10.0,
    riskRewardRatio: 3.5,
    signals: [],
    macroTrend: 'ALTA',
    intermediateTrend: 'ALTA',
    microTrigger: 'COMPRA_ARMADA',
    status: 'READY'
  };

  const userGoal: UserFinancialGoal = {
    targetAmount,
    unit: goalType,
    period,
    accountCapital,
    selectedBroker
  };

  const strategies: CustomizedStrategyOption[] = GoalEngine.generateGoalStrategies(userGoal, defaultOp);

  return (
    <div className="space-y-6">
      {/* HEADER DO PLANEJADOR */}
      <div className="bg-[#0d1322] border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Planejador de Metas Financeiras & Estratégias sob Medida</h2>
            <p className="text-xs text-slate-400">
              Diga quanto quer ganhar (por dia, semana ou mês) e sua corretora. O robô monta o plano exato com 3 opções de escolha.
            </p>
          </div>
        </div>

        {/* FORMULÁRIO DE CONFIGURAÇÃO DE META */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* 1. Tipo de Meta e Valor */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">1. Sua Meta de Ganho:</label>
            <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-700 text-xs mb-2">
              <button
                onClick={() => setGoalType('FIXED_BRL')}
                className={`flex-1 py-1 rounded transition ${goalType === 'FIXED_BRL' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'}`}
              >
                Em Reais (R$)
              </button>
              <button
                onClick={() => setGoalType('PERCENT')}
                className={`flex-1 py-1 rounded transition ${goalType === 'PERCENT' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'}`}
              >
                Em Porcentagem (%)
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:border-emerald-500 focus:outline-none"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">
                {goalType === 'FIXED_BRL' ? 'R$' : '%'}
              </span>
            </div>
          </div>

          {/* 2. Período da Meta */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">2. Período Desejado:</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 border border-slate-700 rounded-xl text-xs">
              <button
                onClick={() => { setPeriod('DAILY'); if (targetAmount > 1000) setTargetAmount(300); }}
                className={`py-2 rounded-lg transition font-medium text-center ${period === 'DAILY' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Diário
              </button>
              <button
                onClick={() => { setPeriod('WEEKLY'); if (targetAmount < 500) setTargetAmount(1500); }}
                className={`py-2 rounded-lg transition font-medium text-center ${period === 'WEEKLY' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Semanal
              </button>
              <button
                onClick={() => { setPeriod('MONTHLY'); if (targetAmount < 1000) setTargetAmount(4000); }}
                className={`py-2 rounded-lg transition font-medium text-center ${period === 'MONTHLY' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Mensal
              </button>
            </div>
            <span className="text-[10px] text-slate-500 block">
              {period === 'DAILY' ? 'Foco em Day Trade e Volatilidade rápida' : period === 'WEEKLY' ? 'Foco em Swing Trade de 3 a 7 dias' : 'Foco em Swing Trade e Travas Mensais'}
            </span>
          </div>

          {/* 3. Capital Disponível na Corretora */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">3. Capital na Conta:</label>
            <div className="relative">
              <input
                type="number"
                value={accountCapital}
                onChange={(e) => setAccountCapital(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:border-emerald-500 focus:outline-none"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">R$</span>
            </div>
            <span className="text-[10px] text-slate-500 block">Usado para calcular a segurança de lote</span>
          </div>

          {/* 4. Escolha da Corretora */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">4. Sua Corretora Atual:</label>
            <select
              value={selectedBroker}
              onChange={(e) => setSelectedBroker(e.target.value as BrokerType)}
              className="w-full bg-slate-900 border border-slate-700 text-white font-bold text-sm px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none"
            >
              <option value="CLEAR">Clear Corretora (Taxa Zero)</option>
              <option value="XP">XP Investimentos</option>
              <option value="BTG">BTG Pactual</option>
              <option value="RICO">Rico Investimentos</option>
              <option value="GENIAL">Genial Investimentos</option>
              <option value="TORO">Toro Investimentos</option>
              <option value="NUINVEST">NuInvest / Nubank</option>
              <option value="INTER">Inter Invest</option>
              <option value="AGORA">Ágora Investimentos (Bradesco)</option>
            </select>
            <span className="text-[10px] text-emerald-400 font-medium block">
              ✓ {broker.brokerageFee}
            </span>
          </div>
        </div>

        {/* RESUMO DA META DO USUÁRIO */}
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-slate-300">Sua meta configurada:</span>
              <span className="font-bold text-white text-sm ml-1.5 font-mono">
                {goalType === 'FIXED_BRL' ? `R$ ${targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : `${targetAmount}%`} por {period === 'DAILY' ? 'Dia' : period === 'WEEKLY' ? 'Semana' : 'Mês'}
              </span>
              <span className="text-slate-400 ml-2">na corretora <strong>{broker.name}</strong></span>
            </div>
          </div>
          <span className="text-[11px] text-emerald-300 font-semibold bg-emerald-500/20 px-3 py-1 rounded-full">
            3 Opções de Estratégias Calculadas Abaixo
          </span>
        </div>
      </div>

      {/* APRESENTAÇÃO DAS 3 ESTRATÉGIAS PARA ESCOLHA DO USUÁRIO */}
      <div className="space-y-4">
        <h3 className="text-sm uppercase font-bold text-slate-300 tracking-wider flex items-center gap-2">
          <span>Escolha a Estratégia que Mais Combina com seu Perfil:</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {strategies.map((st) => {
            const isSelected = selectedOption === st.optionNumber;
            const isOption1 = st.optionNumber === 1;
            const isOption2 = st.optionNumber === 2;

            return (
              <div
                key={st.optionNumber}
                onClick={() => setSelectedOption(st.optionNumber)}
                className={`cursor-pointer rounded-2xl p-5 border transition flex flex-col justify-between shadow-xl ${
                  isSelected
                    ? isOption1
                      ? 'bg-[#0d1c1a] border-emerald-500 ring-2 ring-emerald-500/30'
                      : isOption2
                        ? 'bg-[#18102a] border-purple-500 ring-2 ring-purple-500/30'
                        : 'bg-[#0e172c] border-cyan-500 ring-2 ring-cyan-500/30'
                    : 'bg-[#0d1322] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Badge da Opção */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                      isOption1 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : isOption2
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    }`}>
                      {st.title}
                    </span>

                    {isSelected && (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selecionada
                      </span>
                    )}
                  </div>

                  {/* Ticker / Estrutura */}
                  <h4 className="text-base font-bold text-white mb-2">
                    {st.tickerOrStructure}
                  </h4>

                  {/* Valores Chave */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-900/90 border border-slate-800 p-3 rounded-xl mb-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Capital Necessário:</span>
                      <span className="font-bold text-white font-mono">R$ {st.capitalRequired.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-400 block">Lucro se bater a Meta:</span>
                      <span className="font-bold text-emerald-400 font-mono">+ R$ {st.estimatedReturnBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-800">
                      <span className="text-[10px] text-rose-400 block">Perda Máxima (Stop):</span>
                      <span className="font-bold text-rose-400 font-mono">- R$ {st.estimatedLossBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Prazo / Estilo:</span>
                      <span className="font-semibold text-cyan-300 text-[11px]">{st.timeframeDisplay}</span>
                    </div>
                  </div>

                  {/* Explicação para Leigos */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 mb-3 text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-slate-200 block mb-1">💡 Como funciona para iniciantes:</span>
                    {st.explanationForBeginners}
                  </div>
                </div>

                {/* Passo a Passo de Execução na Corretora Selecionada */}
                <div className="pt-3 border-t border-slate-800/80">
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300 space-y-1.5 mb-3">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> Como executar na {broker.name}:
                    </span>
                    <p className="text-[11px] text-slate-300/90 leading-snug">
                      {st.howToExecuteInBroker}
                    </p>
                  </div>

                  <button
                    onClick={() => onOpenChart(defaultOp.ticker)}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition flex items-center justify-center gap-1.5"
                  >
                    Ver Gráfico & Níveis de Entrada <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
