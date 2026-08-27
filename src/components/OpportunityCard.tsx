'use client';

import React, { useState } from 'react';
import { Award, LineChart, DollarSign, Zap, CheckCircle2, Shield, Sparkles, Copy, Layers, ChevronDown, Clock, ShieldAlert, Calculator, TrendingUp, TrendingDown, HelpCircle, Compass, Target, ShieldX } from 'lucide-react';
import { SeniorAnalysisResult, OptionStrategyType } from '@/core/types';

interface OpportunityCardProps {
  op: SeniorAnalysisResult;
  onOpenChart: (symbol: string) => void;
  onOpenCalculator: (op: SeniorAnalysisResult) => void;
  onFollowSignal?: (op: SeniorAnalysisResult) => void;
}

export function OpportunityCard({ op, onOpenChart, onOpenCalculator, onFollowSignal }: OpportunityCardProps) {
  const isBuy = op.action === 'BUY';
  const [modalidade, setModalidade] = useState<'OPTIONS' | 'SWING' | 'DAYTRADE'>('OPTIONS');
  const [selectedOptionMode, setSelectedOptionMode] = useState<OptionStrategyType>('TRAVA_ALTA_CALL');
  const [simulatedQty, setSimulatedQty] = useState<number>(100);
  const [followed, setFollowed] = useState<boolean>(false);
  const [followingLoading, setFollowingLoading] = useState<boolean>(false);
  const [copiedTicker, setCopiedTicker] = useState<string | null>(null);
  const [showOptionsGrid, setShowOptionsGrid] = useState<boolean>(false);
  const [showScenarios, setShowScenarios] = useState<boolean>(false);
  const [optionsHorizon, setOptionsHorizon] = useState<'SHORT' | 'LONG'>('SHORT');

  const sw = op.swingTrade;
  const dt = op.dayTrade;
  const opt = (optionsHorizon === 'LONG' && op.optionsTrade.longTermPlan) ? op.optionsTrade.longTermPlan : op.optionsTrade;
  const sc = op.institutionalScenarios;
  const isCrypto = op.market === 'CRYPTO' || (!op.ticker.endsWith('.SA') && (op.ticker.includes('BTC') || op.ticker.includes('ETH') || op.ticker.includes('SOL')));

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTicker(text);
    setTimeout(() => setCopiedTicker(null), 2500);
  };

  // CÁLCULOS FINANCEIROS EM REAIS (R$) DE COMPRA E VENDA
  const swingBuyValue = Number((simulatedQty * sw.entryPrice).toFixed(2));
  const swingSellT1Value = Number((simulatedQty * sw.target1).toFixed(2));
  const swingProfitT1 = Number((swingSellT1Value - swingBuyValue).toFixed(2));
  const swingSellT2Value = Number((simulatedQty * sw.target2).toFixed(2));
  const swingProfitT2 = Number((swingSellT2Value - swingBuyValue).toFixed(2));
  const swingSellStopValue = Number((simulatedQty * sw.stopLoss).toFixed(2));
  const swingLossStop = Number((swingBuyValue - swingSellStopValue).toFixed(2));

  const dtBuyValue = Number((simulatedQty * dt.entryTrigger).toFixed(2));
  const dtSellT1Value = Number((simulatedQty * dt.target1).toFixed(2));
  const dtProfitT1 = Number((dtSellT1Value - dtBuyValue).toFixed(2));
  const dtSellStopValue = Number((simulatedQty * dt.stopLoss).toFixed(2));
  const dtLossStop = Number((dtBuyValue - dtSellStopValue).toFixed(2));
  const dtMarginRequired = Number((dtBuyValue * 0.10).toFixed(2));

  // Opções e Estratégia Selecionada
  const optContracts = Math.max(100, Math.floor(simulatedQty / 100) * 100);
  const currentStrategy = (opt.availableStrategies && opt.availableStrategies.find(s => s.id === selectedOptionMode)) 
    || (opt.availableStrategies && opt.availableStrategies[0])
    || {
      id: 'TRAVA_ALTA_CALL' as OptionStrategyType,
      title: opt.structureName,
      badge: '🛡️ Risco 100% Limitado',
      description: opt.riskAnalysis,
      costOrIncomePerUnit: opt.estimatedCostPerUnit,
      isCredit: false,
      maxRiskDescription: opt.maxRiskDescription,
      maxProfitDescription: opt.maxProfitDescription,
      breakevenPrice: opt.breakevenPrice,
      executionGuide: opt.executionSteps,
      leg1: opt.leg1,
      leg2: opt.leg2
    };

  const optFinancialValue = Number((optContracts * currentStrategy.costOrIncomePerUnit).toFixed(2));

  const handleFollowClick = async () => {
    try {
      setFollowingLoading(true);
      const userSession = typeof window !== 'undefined' ? localStorage.getItem('karo_user_session') : null;
      const parsedUser = userSession ? JSON.parse(userSession) : null;
      const userId = parsedUser?.id || 'usr_demo';

      let followPayload: any = {
        signal: op,
        modality: modalidade
      };

      if (modalidade === 'OPTIONS') {
        followPayload = {
          ...followPayload,
          quantity: optContracts,
          customEntry: currentStrategy.costOrIncomePerUnit,
          optionTicker: currentStrategy.leg1.ticker,
          optionStrike: currentStrategy.leg1.strike,
          optionType: currentStrategy.leg1.optionType,
          strategyTitle: currentStrategy.title,
          stopLoss: 0.00,
          target1: currentStrategy.breakevenPrice,
          target2: Number((currentStrategy.breakevenPrice * 1.15).toFixed(2))
        };
      } else if (modalidade === 'SWING') {
        followPayload = {
          ...followPayload,
          quantity: simulatedQty,
          customEntry: sw.entryPrice,
          stopLoss: sw.stopLoss,
          target1: sw.target1,
          target2: sw.target2,
          strategyTitle: 'Swing Trade em Ações B3'
        };
      } else {
        followPayload = {
          ...followPayload,
          quantity: simulatedQty,
          customEntry: dt.entryTrigger,
          stopLoss: dt.stopLoss,
          target1: dt.target1,
          target2: dt.target2,
          strategyTitle: 'Day Trade (5m)'
        };
      }

      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'FOLLOW_SIGNAL',
          userId,
          payload: followPayload
        })
      });
      const json = await res.json();
      if (json.success) {
        setFollowed(true);
        if (onFollowSignal) onFollowSignal(op);
      }
    } catch (err) {
      console.error('Erro ao seguir sinal:', err);
    } finally {
      setFollowingLoading(false);
    }
  };

  return (
    <div className="bg-[#0d1322] border border-slate-800 hover:border-slate-700 transition rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        {/* Header do Ativo com Códigos Oficiais B3 */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">{op.standardLotTicker || op.ticker.replace('.SA', '')}</span>
              <span className="text-xs text-slate-400 font-medium">({op.name})</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isBuy 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {isBuy ? '🟢 COMPRA' : '🔴 VENDA'}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                {isCrypto ? '🪙 Cripto 24/7' : `🇧🇷 B3 (${op.shareType || 'Ação'})`}
              </span>
              <span className="text-xs font-mono font-bold text-white bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                R$ {op.currentPrice.toFixed(2)}
              </span>
            </div>

            {/* Metadados B3: Lote Padrão vs Fracionário */}
            {!isCrypto && (
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                <span>Boleta Clear/XP:</span>
                <button 
                  onClick={() => copyToClipboard(op.standardLotTicker || 'PETR4')}
                  className="font-mono font-bold text-white bg-slate-900 hover:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 flex items-center gap-1"
                  title="Clique para copiar lote de 100"
                >
                  {op.standardLotTicker || 'PETR4'} <span className="text-[9px] text-slate-400">(100 ações)</span>
                  <Copy className="w-3 h-3 text-slate-400" />
                </button>
                <span>ou Fracionário:</span>
                <button 
                  onClick={() => copyToClipboard(op.fractionalLotTicker || 'PETR4F')}
                  className="font-mono font-bold text-cyan-300 bg-slate-900 hover:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 flex items-center gap-1"
                  title="Clique para copiar fracionário de 1 a 99"
                >
                  {op.fractionalLotTicker || 'PETR4F'}
                  <Copy className="w-3 h-3 text-slate-400" />
                </button>
              </div>
            )}

            <p className="text-xs font-semibold text-slate-300 mt-1.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              {op.setupTitle}
            </p>
          </div>

          <div className="text-right">
            <div className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold px-2.5 py-1 rounded-xl text-xs">
              <span>{op.confluenceScore}%</span>
              <span className="text-[10px] text-slate-400 font-normal">Score</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">R:R {op.riskRewardRatio} : 1</p>
          </div>
        </div>

        {/* Feedback de cópia */}
        {copiedTicker && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold p-1.5 rounded-lg mb-3 text-center flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Código "{copiedTicker}" copiado para colar no Home Broker da Clear!
          </div>
        )}

        {/* SELETOR DE QUANTIDADE / LOTE SIMULADO */}
        <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl mb-3 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simular Quantidade:</span>
          </div>
          <div className="flex items-center gap-1">
            {(!isCrypto ? [10, 100, 200, 500, 1000] : [1, 2, 5, 10]).map(q => (
              <button
                key={q}
                onClick={() => setSimulatedQty(q)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition ${
                  simulatedQty === q 
                    ? 'bg-cyan-600 text-white shadow' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {q} {q === 10 && !isCrypto ? '(Frac)' : q === 100 && !isCrypto ? '(1 Lote)' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* SELETOR DAS 3 MODALIDADES PRINCIPAIS */}
        <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 mb-4 text-xs font-semibold">
          <button
            onClick={() => setModalidade('OPTIONS')}
            className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
              modalidade === 'OPTIONS' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            💎 {isCrypto ? 'Alavancado' : 'Opções Reais B3'}
          </button>
          <button
            onClick={() => setModalidade('SWING')}
            className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
              modalidade === 'SWING' 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📊 Ações à Vista (Swing)
          </button>
          <button
            onClick={() => setModalidade('DAYTRADE')}
            className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
              modalidade === 'DAYTRADE' 
                ? 'bg-cyan-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ Day Trade (5m)
          </button>
        </div>

        {/* MODALIDADE 1: OPÇÕES REAIS B3 */}
        {modalidade === 'OPTIONS' && (
          <div className="space-y-3 mb-4">
            <div className="bg-purple-950/30 border border-purple-500/30 p-4 rounded-xl text-xs space-y-3">
              
              {/* SELETOR DE HORIZONTE DE VENCIMENTO (CURTO X LONGO BAIXO RISCO) */}
              {!isCrypto && op.optionsTrade.longTermPlan && (
                <div className="bg-[#0b0f19] p-1 rounded-xl border border-purple-500/30 flex items-center gap-1 text-[11px] font-bold">
                  <button
                    onClick={() => { setOptionsHorizon('SHORT'); setSelectedOptionMode('TRAVA_ALTA_CALL'); }}
                    className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                      optionsHorizon === 'SHORT'
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ⚡ Série Setembro ({op.optionsTrade.daysToExpiration} dias)
                  </button>
                  <button
                    onClick={() => { setOptionsHorizon('LONG'); setSelectedOptionMode('COMPRA_CALL_SECO'); }}
                    className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                      optionsHorizon === 'LONG'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🛡️ Série Longa Outubro - Baixo Risco ({op.optionsTrade.longTermPlan.daysToExpiration} dias)
                  </button>
                </div>
              )}

              {/* SUB-MENU DE ESCOLHA DAS MODALIDADES DE OPÇÕES */}
              {opt.availableStrategies && opt.availableStrategies.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-300 block">
                    🎯 Escolha a Modalidade de Opções Desejada:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {opt.availableStrategies.map((strat) => (
                      <button
                        key={strat.id}
                        onClick={() => setSelectedOptionMode(strat.id)}
                        className={`p-2 rounded-xl text-left border transition text-xs ${
                          selectedOptionMode === strat.id
                            ? 'bg-purple-600/30 border-purple-400 text-white shadow'
                            : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="font-bold text-[11px] text-purple-200 leading-tight mb-0.5">
                          {strat.title.split('(')[0]}
                        </div>
                        <span className="text-[9px] text-slate-400 block truncate">
                          {strat.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Título da Estrutura Selecionada & Vencimento */}
              <div className="flex items-center justify-between pt-1 border-t border-purple-500/20">
                <span className="font-bold text-purple-200 text-xs">{currentStrategy.title}</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-200 px-2.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Vencimento B3: {opt.expirationDateExact} ({opt.daysToExpiration} dias)
                </span>
              </div>

              {/* CARD DE VENCIMENTO X RISCO (DTE & THETA) */}
              <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px]">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    Avaliação de Vencimento x Risco (Tempo):
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    opt.timeRiskLevel === 'RISCO_BAIXO_JANELA_IDEAL' || opt.timeRiskLevel === 'SERIE_SEGUINTE_PROTEGIDA'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {opt.timeRiskLevel === 'SERIE_SEGUINTE_PROTEGIDA' ? '🛡️ Série Ativa Protegida' : '🟢 Janela Ideal'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {opt.timeRiskDescription}
                </p>
                <div className="text-[10px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 p-1.5 rounded font-medium">
                  ⏳ <strong>Regra de Saída:</strong> {opt.timeStopRule}
                </div>
              </div>

              {/* VALORES DE COMPRA / VENDA EM REAIS */}
              <div className="bg-[#0b101d] border border-purple-500/30 p-3 rounded-xl space-y-2">
                <span className="font-bold text-purple-300 block text-[11px]">
                  💎 Valores Financeiros em Reais para {optContracts} opções:
                </span>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="bg-slate-900/80 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">
                      {currentStrategy.isCredit ? '💰 Crédito Recebido:' : '🛒 Custo Máximo:'}
                    </span>
                    <span className="font-bold text-white font-mono">
                      R$ {optFinancialValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] text-slate-400 block">
                      (R$ {currentStrategy.costOrIncomePerUnit.toFixed(2)} / un)
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-400 block">🎯 Lucro Potencial:</span>
                    <span className="font-bold text-emerald-400 font-mono text-[11px]">
                      {currentStrategy.maxProfitDescription.split('(')[0]}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-rose-500/20">
                    <span className="text-[10px] text-rose-400 block">🛑 Risco Máximo:</span>
                    <span className="font-bold text-rose-400 font-mono text-[11px]">
                      {currentStrategy.maxRiskDescription.split('(')[0]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Box de Códigos Oficiais B3 para Boletar na Clear */}
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block">
                  🎯 Códigos Oficiais para digitar no Home Broker da Clear / XP:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="bg-[#0b0f19] border border-emerald-500/30 p-2.5 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-400">
                        {currentStrategy.isCredit ? '1. Venda de Call:' : '1. Compra de Call:'}
                      </span>
                      <button
                        onClick={() => copyToClipboard(currentStrategy.leg1.ticker)}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded"
                      >
                        Copiar <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="font-mono font-bold text-white text-sm">
                      {currentStrategy.leg1.ticker}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Strike: <strong className="text-emerald-300">R$ {currentStrategy.leg1.strike.toFixed(2)}</strong> | Cotação Real: <strong className="text-white">R$ {currentStrategy.leg1.estimatedPremium.toFixed(2)}</strong>
                    </div>
                  </div>

                  {currentStrategy.leg2 && (
                    <div className="bg-[#0b0f19] border border-rose-500/30 p-2.5 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase font-bold text-rose-400">2. Venda de Call:</span>
                        <button
                          onClick={() => copyToClipboard(currentStrategy.leg2.ticker)}
                          className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded"
                        >
                          Copiar <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="font-mono font-bold text-white text-sm">
                        {currentStrategy.leg2.ticker}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Strike: <strong className="text-rose-300">R$ {currentStrategy.leg2.strike.toFixed(2)}</strong> | Cotação Real: <strong className="text-white">R$ {currentStrategy.leg2.estimatedPremium.toFixed(2)}</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Guia de Execução Passo a Passo na Clear */}
              <div className="bg-slate-900/60 border border-purple-500/20 p-2.5 rounded-xl text-[11px] text-slate-300">
                <span className="text-purple-300 font-bold block mb-0.5">💡 Como Executar na Clear:</span>
                {currentStrategy.executionGuide}
              </div>

              {/* Botão de Grade Completa de Strikes B3 */}
              {opt.availableStrikesChain && opt.availableStrikesChain.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowOptionsGrid(!showOptionsGrid)}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[11px] font-semibold text-purple-300 flex items-center justify-center gap-1.5 transition"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    {showOptionsGrid ? 'Ocultar Grade de Strikes' : 'Ver Grade Completa de Opções da B3'}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showOptionsGrid ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Tabela de Strikes B3 Expandida */}
                  {showOptionsGrid && (
                    <div className="mt-2 bg-[#090d16] border border-slate-800 rounded-xl p-2.5 space-y-1 max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-4 text-[10px] font-bold text-slate-400 pb-1 border-b border-slate-800">
                        <span>Código B3</span>
                        <span>Strike</span>
                        <span>Tipo</span>
                        <span className="text-right">Cotação Real</span>
                      </div>
                      {opt.availableStrikesChain.map((contract) => (
                        <div 
                          key={contract.ticker}
                          onClick={() => copyToClipboard(contract.ticker)}
                          className="grid grid-cols-4 text-[11px] py-1 px-1 rounded hover:bg-slate-800 cursor-pointer transition"
                        >
                          <span className="font-mono font-bold text-white flex items-center gap-1">
                            {contract.ticker}
                          </span>
                          <span className="font-mono text-cyan-300">R$ {contract.strike.toFixed(2)}</span>
                          <span className={`text-[10px] ${contract.moneyness === 'ATM' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                            {contract.moneyness}
                          </span>
                          <span className="font-mono text-right text-slate-200 font-bold">R$ {contract.estimatedPremium.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODALIDADE 2: AÇÕES À VISTA (SWING) */}
        {modalidade === 'SWING' && (
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-4 gap-2 bg-slate-900/90 border border-slate-800/80 p-3 rounded-xl text-center">
              <div>
                <span className="text-[10px] uppercase text-slate-400 block">Preço Compra</span>
                <span className="text-xs font-bold text-white font-mono">R$ {sw.entryPrice.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-rose-400 block">Venda Stop</span>
                <span className="text-xs font-bold text-rose-400 font-mono">R$ {sw.stopLoss.toFixed(2)}</span>
                <span className="text-[9px] text-rose-500 block">-{sw.stopLossPercent}%</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-emerald-400 block">Venda Alvo 1</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">R$ {sw.target1.toFixed(2)}</span>
                <span className="text-[9px] text-emerald-500 block">+{sw.target1Percent}%</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-cyan-400 block">Venda Alvo 2</span>
                <span className="text-xs font-bold text-cyan-400 font-mono">R$ {sw.target2.toFixed(2)}</span>
                <span className="text-[9px] text-cyan-500 block">+{sw.target2Percent}%</span>
              </div>
            </div>

            {/* TABELA DE VALORES FINANCEIROS REAIS (R$) DE COMPRA E VENDA */}
            <div className="bg-[#0b101d] border border-emerald-500/30 p-3.5 rounded-xl text-xs space-y-2">
              <span className="font-bold text-emerald-400 block text-[11px]">
                💰 Valores em Reais (R$) para {simulatedQty} {simulatedQty === 10 ? 'ações (Fracionário)' : 'ações (Lote)'}:
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">🛒 Valor Total Compra:</span>
                  <span className="font-bold text-white font-mono">R$ {swingBuyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-400 block">🎯 Venda Alvo 1 (+5%):</span>
                  <span className="font-bold text-emerald-400 font-mono">R$ {swingSellT1Value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <span className="text-[9px] text-emerald-300 block font-semibold">+R$ {swingProfitT1.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-cyan-500/20">
                  <span className="text-[10px] text-cyan-400 block">🚀 Venda Alvo 2 (+10%):</span>
                  <span className="font-bold text-cyan-400 font-mono">R$ {swingSellT2Value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <span className="text-[9px] text-cyan-300 block font-semibold">+R$ {swingProfitT2.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-rose-500/20">
                  <span className="text-[10px] text-rose-400 block">🛑 Venda Stop (-2.5%):</span>
                  <span className="font-bold text-rose-400 font-mono">R$ {swingSellStopValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <span className="text-[9px] text-rose-300 block font-semibold">-R$ {swingLossStop.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-emerald-500/20 p-2.5 rounded-xl text-[11px] text-slate-300">
              <span className="text-emerald-400 font-bold block mb-0.5">🛡️ Como Comprar na Corretora:</span>
              {sw.executionSteps}
            </div>
          </div>
        )}

        {/* MODALIDADE 3: DAY TRADE 5M */}
        {modalidade === 'DAYTRADE' && (
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-3 gap-2 bg-slate-900/90 border border-slate-800/80 p-3 rounded-xl text-center">
              <div>
                <span className="text-[10px] uppercase text-cyan-400 block">Gatilho Compra 5m</span>
                <span className="text-xs font-bold text-white font-mono">R$ {dt.entryTrigger.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-rose-400 block">Venda Stop 5m</span>
                <span className="text-xs font-bold text-rose-400 font-mono">R$ {dt.stopLoss.toFixed(2)}</span>
                <span className="text-[9px] text-rose-500 block">-{dt.stopLossPercent}%</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-emerald-400 block">Venda Alvo Day Trade</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">R$ {dt.target1.toFixed(2)}</span>
                <span className="text-[9px] text-emerald-500 block">+{dt.target1Percent}%</span>
              </div>
            </div>

            <div className="bg-[#0b101d] border border-cyan-500/30 p-3 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-cyan-400 block text-[11px]">
                ⚡ Valores Day Trade para {simulatedQty} ações (Encerramento Hoje até 17h30):
              </span>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="bg-slate-900/80 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">🛡️ Margem Corretora:</span>
                  <span className="font-bold text-white font-mono">R$ {dtMarginRequired.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-emerald-500/20">
                  <span className="text-[10px] text-emerald-400 block">🎯 Lucro no Alvo (+1.6%):</span>
                  <span className="font-bold text-emerald-400 font-mono">+R$ {dtProfitT1.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-rose-500/20">
                  <span className="text-[10px] text-rose-400 block">🛑 Perda no Stop (-0.9%):</span>
                  <span className="font-bold text-rose-400 font-mono">-R$ {dtLossStop.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-cyan-500/20 p-2.5 rounded-xl text-[11px] text-slate-300">
              <span className="text-cyan-400 font-bold block mb-0.5">⚡ Execução Day Trade:</span>
              {dt.executionSteps}
            </div>
          </div>
        )}

        {/* PAINEL INSTITUCIONAL: MATRIZ DE 3 CENÁRIOS (TOP TIER DESK) */}
        {sc && (
          <div className="mb-3">
            <button
              onClick={() => setShowScenarios(!showScenarios)}
              className="w-full py-2 px-3 bg-[#0d1627] hover:bg-[#111e36] border border-cyan-500/30 rounded-xl text-xs font-bold text-cyan-300 flex items-center justify-between transition shadow-sm"
            >
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>🏛️ Visão da Mesa Institucional (Matriz de 3 Cenários)</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showScenarios ? 'rotate-180' : ''}`} />
            </button>

            {showScenarios && (
              <div className="mt-2 bg-[#080d1a] border border-cyan-500/20 rounded-xl p-3.5 space-y-3 text-xs">
                {/* 1. Cenário Otimista */}
                <div className="bg-emerald-950/20 border border-emerald-500/30 p-2.5 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" /> {sc.bullishScenario.title}
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                      Probabilidade: {sc.bullishScenario.probability}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong>Gatilho:</strong> {sc.bullishScenario.trigger}
                  </p>
                  <p className="text-[11px] text-emerald-300/90 bg-emerald-500/10 p-1.5 rounded">
                    <strong>Plano da Mesa:</strong> {sc.bullishScenario.actionPlan}
                  </p>
                </div>

                {/* 2. Cenário Lateral */}
                <div className="bg-amber-950/20 border border-amber-500/30 p-2.5 rounded-lg space-y-1">
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {sc.neutralScenario.title}
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {sc.neutralScenario.behavior}
                  </p>
                  <p className="text-[11px] text-amber-300/90 bg-amber-500/10 p-1.5 rounded">
                    <strong>Gestão de Capital:</strong> {sc.neutralScenario.capitalManagement}
                  </p>
                </div>

                {/* 3. Cenário de Invalidação */}
                <div className="bg-rose-950/20 border border-rose-500/30 p-2.5 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-400 flex items-center gap-1">
                      <ShieldX className="w-3.5 h-3.5" /> {sc.invalidationScenario.title}
                    </span>
                    <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono">
                      Invalidação em R$ {sc.invalidationScenario.technicalInvalidationLevel.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-300/90 bg-rose-500/10 p-1.5 rounded">
                    <strong>Regra Disciplinar:</strong> {sc.invalidationScenario.exitRule}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tese Narrativa do Analista Sênior */}
        <div className="bg-[#111827]/70 border border-slate-800 p-3 rounded-xl mb-3 text-xs leading-relaxed text-slate-300">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Tese Institucional & Noticiário:
          </div>
          <p className="italic text-slate-300/90 text-[11px]">"{op.seniorThesis}"</p>
        </div>
      </div>

      {/* BOTÃO 'ENTREI NO TRADE' + AÇÕES */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <button
          onClick={handleFollowClick}
          disabled={followed || followingLoading}
          className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 ${
            followed 
              ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300' 
              : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-600/25 active:scale-98'
          }`}
        >
          {followed ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Operação Registrada! Robô Acompanhando ao Vivo na Carteira
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              {followingLoading ? 'Registrando...' : '⚡ Entrei no Trade! (Fazer Acompanhamento Ativo)'}
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenChart(op.ticker)}
            className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 transition flex items-center justify-center gap-1"
          >
            <LineChart className="w-3.5 h-3.5 text-cyan-400" /> Ver Gráfico
          </button>
          <button
            onClick={() => onOpenCalculator(op)}
            className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 transition flex items-center justify-center gap-1"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Calcular Lote
          </button>
        </div>
      </div>
    </div>
  );
}