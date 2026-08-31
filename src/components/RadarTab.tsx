'use client';

import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, AlertTriangle, Filter, Coins, TrendingUp, TrendingDown, Flame, ChevronRight } from 'lucide-react';
import { SeniorAnalysisResult } from '@/core/types';
import { OpportunityCard } from './OpportunityCard';

interface RadarTabProps {
  loading: boolean;
  filteredOpportunities: SeniorAnalysisResult[];
  filterAction: 'ALL' | 'BUY' | 'SELL';
  setFilterAction: (a: 'ALL' | 'BUY' | 'SELL') => void;
  onOpenChart: (symbol: string) => void;
  onOpenCalculator: (op: SeniorAnalysisResult) => void;
  onFollowSignal?: (op: SeniorAnalysisResult) => void;
}

export function RadarTab({
  loading,
  filteredOpportunities,
  filterAction,
  setFilterAction,
  onOpenChart,
  onOpenCalculator,
  onFollowSignal
}: RadarTabProps) {
  const [marketFilter, setMarketFilter] = useState<'ALL' | 'B3' | 'CRYPTO'>('ALL');
  const [customTicker, setCustomTicker] = useState('');
  const [customSearching, setCustomSearching] = useState(false);
  const [customAnalysis, setCustomAnalysis] = useState<SeniorAnalysisResult | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);

  const handleSearchTicker = async (tickerToSearch?: string) => {
    const target = (tickerToSearch || customTicker).trim().toUpperCase();
    if (!target) return;

    setCustomSearching(true);
    setCustomError(null);
    try {
      const res = await fetch(`/api/analyze-ticker?ticker=${encodeURIComponent(target)}`);
      const data = await res.json();
      if (data.success && data.analysis) {
        setCustomAnalysis(data.analysis);
        setCustomTicker(target);
      } else {
        setCustomError(data.error || `Não foi possível encontrar dados para ${target} na B3.`);
      }
    } catch (err: any) {
      setCustomError(`Erro de conexão ao buscar ${target}: ${err.message}`);
    } finally {
      setCustomSearching(false);
    }
  };

  const quickTickers = ['PETR4', 'VALE3', 'ITUB4', 'MGLU3', 'EMBR3', 'AZUL4', 'COGN3', 'BBSE3', 'CMIG4', 'CYRE3', 'RADL3', 'ABEV3', 'POMO4'];

  const displayedOps = filteredOpportunities.filter(op => {
    const isCrypto = op.market === 'CRYPTO' || (!op.ticker.endsWith('.SA') && (op.ticker.includes('BTC') || op.ticker.includes('ETH') || op.ticker.includes('SOL') || op.ticker.includes('USD')));
    if (marketFilter === 'B3' && isCrypto) return false;
    if (marketFilter === 'CRYPTO' && !isCrypto) return false;
    return true;
  });

  const topBuyOps = displayedOps
    .filter(o => o.action === 'BUY')
    .sort((a, b) => (b.probabilityUp || b.confluenceScore) - (a.probabilityUp || a.confluenceScore))
    .slice(0, 3);

  const topSellOps = displayedOps
    .filter(o => o.action === 'SELL')
    .sort((a, b) => (b.probabilityDown || b.confluenceScore) - (a.probabilityDown || a.confluenceScore))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* PIPELINE INSTITUCIONAL: COLETA -> AVALIAÇÃO DE CICLOS DIÁRIOS -> SUGESTÕES */}
      <div className="bg-[#0b101d] border border-cyan-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
              ⚡
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Esteira de Inteligência Quantitativa & Ciclos Diários
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono uppercase">
                  Motor Ativo 5m
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                O robô consolida os dados de mercado, diagnostica as fases dos ciclos diários e apresenta apenas as entradas de maior probabilidade.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-cyan-300 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
            📊 ~75 Ativos B3 Monitorados • Confluência Mínima: 80%
          </span>
        </div>

        {/* 4 ETAPAS DO PROCESSO */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-cyan-400 font-bold uppercase block mb-1">1. Ingestão Multi-Fontes</span>
            <p className="text-slate-300 font-semibold leading-tight">TradingView B3 (Tempo Real) + Opções.net.br + Yahoo Feed</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-purple-400 font-bold uppercase block mb-1">2. Ciclos & Probabilidades</span>
            <p className="text-slate-300 font-semibold leading-tight">Mapeamento de Suportes de Fundo, Acumulação Wyckoff e SEPA</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-amber-400 font-bold uppercase block mb-1">3. Confluência 5m</span>
            <p className="text-slate-300 font-semibold leading-tight">Validação Cruzada de 7 Escolas e Detecção de Barra de Ignição</p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
            <span className="text-[10px] text-emerald-400 font-bold uppercase block mb-1">4. Sugestão Pronta</span>
            <p className="text-emerald-200 font-bold leading-tight">Ações à Vista + Opções OTM Calibradas com Stop & Alvos</p>
          </div>
        </div>
      </div>

      {/* PAINEL TOP OPORTUNIDADES QUENTES DO MOMENTO (RANKING 5M) */}
      <div className="bg-[#0c1220] border border-cyan-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Ranking das Melhores Oportunidades em 5m
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded font-mono font-bold">
                  ⚡ TradingView B3 + Opções.net.br
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Ações com maior confluência probabilística de subida (CALL) ou correção (PUT) detectadas no scanner.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-lg">
            🟢 {displayedOps.length} Ativos Analisados
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* TOP 3 ALTA (COMPRA / CALL) */}
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pb-1.5 border-b border-emerald-500/20">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> 🚀 TOP OPORTUNIDADES DE ALTA (CALL / COMPRA)
              </span>
              <span className="text-[10px] text-slate-400">Probabilidade 5m</span>
            </div>
            {topBuyOps.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2 text-center">Nenhuma oportunidade de alta no momento.</p>
            ) : (
              topBuyOps.map((op, idx) => (
                <div 
                  key={op.ticker}
                  className="bg-slate-950/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-2.5 transition flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs font-mono">{op.standardLotTicker || op.ticker.replace('.SA', '')}</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{op.name}</span>
                      </div>
                      <span className="text-[10px] text-cyan-300 font-mono">
                        R$ {op.currentPrice.toFixed(2)} • Opção: {op.optionsTrade.suggestedTicker}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-400 block">
                        🟢 {op.probabilityUp || op.confluenceScore}%
                      </span>
                      <span className="text-[9px] text-slate-400">Score {op.confluenceScore}%</span>
                    </div>
                    <button
                      onClick={() => handleSearchTicker(op.standardLotTicker || op.ticker.replace('.SA', ''))}
                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition"
                      title="Ver detalhes"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* TOP 3 BAIXA (VENDA / PUT) */}
          <div className="bg-slate-900/90 border border-rose-500/30 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-rose-400 pb-1.5 border-b border-rose-500/20">
              <span className="flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" /> 🔻 TOP OPORTUNIDADES DE CORREÇÃO (PUT / VENDA)
              </span>
              <span className="text-[10px] text-slate-400">Probabilidade 5m</span>
            </div>
            {topSellOps.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2 text-center">Nenhuma oportunidade de correção relevante.</p>
            ) : (
              topSellOps.map((op, idx) => (
                <div 
                  key={op.ticker}
                  className="bg-slate-950/60 hover:bg-slate-900 border border-slate-800 hover:border-rose-500/40 rounded-xl p-2.5 transition flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs font-mono">{op.standardLotTicker || op.ticker.replace('.SA', '')}</span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{op.name}</span>
                      </div>
                      <span className="text-[10px] text-rose-300 font-mono">
                        R$ {op.currentPrice.toFixed(2)} • Opção: {op.optionsTrade.suggestedTicker}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-rose-400 block">
                        🔴 {op.probabilityDown || op.confluenceScore}%
                      </span>
                      <span className="text-[9px] text-slate-400">Score {op.confluenceScore}%</span>
                    </div>
                    <button
                      onClick={() => handleSearchTicker(op.standardLotTicker || op.ticker.replace('.SA', ''))}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition"
                      title="Ver detalhes"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* BARRA DE BUSCA E ANÁLISE SOB DEMANDA DE QUALQUER AÇÃO DA B3 */}
      <div className="bg-gradient-to-r from-[#0d1527] via-[#0f1b33] to-[#0d1527] border border-cyan-500/40 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🔍</span>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Analisar Qualquer Ação da B3 em Tempo Real
            </h3>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
              🟢 B3 Live Feed
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Digite o código de qualquer ação listada na B3 para rodar as 7 escolas de análise.
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 mb-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Digite o código B3 (Ex: EMBR3, AZUL4, BBSE3, COGN3, POMO4...)"
              value={customTicker}
              onChange={(e) => setCustomTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchTicker()}
              className="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 outline-none uppercase font-bold"
            />
          </div>
          <button
            onClick={() => handleSearchTicker()}
            disabled={customSearching || !customTicker.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
          >
            {customSearching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Conectando à B3...
              </>
            ) : (
              <>
                ⚡ Analisar Ativo B3 Agora
              </>
            )}
          </button>
        </div>

        {/* ATALHOS RÁPIDOS DE ATIVOS LÍDERES */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          <span className="text-[10px] font-semibold text-slate-500 mr-1">Atalhos rápidos:</span>
          {quickTickers.map((t) => (
            <button
              key={t}
              onClick={() => handleSearchTicker(t)}
              className="px-2 py-0.5 rounded bg-slate-900/90 hover:bg-cyan-950/50 hover:text-cyan-300 border border-slate-800 text-[11px] font-mono font-semibold transition"
            >
              {t}
            </button>
          ))}
        </div>

        {/* FEEDBACK DE ERRO */}
        {customError && (
          <div className="mt-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-2.5 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{customError}</span>
          </div>
        )}

        {/* CARD DO ATIVO PESQUISADO SOB DEMANDA */}
        {customAnalysis && (
          <div className="mt-4 pt-4 border-t border-cyan-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                ⚡ Diagnóstico sob demanda em tempo real:
              </span>
              <button
                onClick={() => setCustomAnalysis(null)}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                ✕ Fechar análise
              </button>
            </div>
            <div className="max-w-2xl">
              <OpportunityCard
                op={customAnalysis}
                onOpenChart={onOpenChart}
                onOpenCalculator={onOpenCalculator}
                onFollowSignal={onFollowSignal}
              />
            </div>
          </div>
        )}
      </div>

      {/* BARRA DE CONTROLE E FILTROS DE MERCADO */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d1322] p-4 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          {/* Seletor de Mercado B3 vs Cripto */}
          <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
            <button 
              onClick={() => setMarketFilter('ALL')} 
              className={`px-3 py-1 rounded-md transition ${marketFilter === 'ALL' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Todos os Mercados
            </button>
            <button 
              onClick={() => setMarketFilter('B3')} 
              className={`px-3 py-1 rounded-md transition flex items-center gap-1 ${marketFilter === 'B3' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              🇧🇷 Ações B3 (~75 Ativos)
            </button>
            <button 
              onClick={() => setMarketFilter('CRYPTO')} 
              className={`px-3 py-1 rounded-md transition flex items-center gap-1 ${marketFilter === 'CRYPTO' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              🪙 Cripto 24/7
            </button>
          </div>

          {/* Seletor de Direção */}
          <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
            <button 
              onClick={() => setFilterAction('ALL')} 
              className={`px-3 py-1 rounded-md transition ${filterAction === 'ALL' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              Ambas
            </button>
            <button 
              onClick={() => setFilterAction('BUY')} 
              className={`px-3 py-1 rounded-md transition ${filterAction === 'BUY' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              🟢 Compra
            </button>
            <button 
              onClick={() => setFilterAction('SELL')} 
              className={`px-3 py-1 rounded-md transition ${filterAction === 'SELL' ? 'bg-rose-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              🔴 Venda
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>Filtro Institucional: <strong>Score ≥ 75%</strong> • <strong>R:R ≥ 2.5:1</strong></span>
        </div>
      </div>

      {/* GRID DE OPORTUNIDADES */}
      {loading ? (
        <div className="text-center py-20 bg-[#0d1322] rounded-2xl border border-slate-800">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-300 font-medium">Escaneando mercado B3 e Criptomoedas a cada 5 minutos...</p>
          <p className="text-xs text-slate-500 mt-1">Calculando setups de confluência institucional e gestão de risco</p>
        </div>
      ) : displayedOps.length === 0 ? (
        <div className="text-center py-16 bg-[#0d1322] rounded-2xl border border-slate-800">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="text-slate-200 font-bold text-base">Nenhum setup com 100% de confluência no momento</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Como analistas seniores, operamos apenas quando todas as condições técnicas e fluxo se alinham. O scanner continuará monitorando de 5 em 5 minutos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {displayedOps.map((op, idx) => (
            <OpportunityCard 
              key={idx} 
              op={op} 
              onOpenChart={onOpenChart} 
              onOpenCalculator={onOpenCalculator}
              onFollowSignal={onFollowSignal}
            />
          ))}
        </div>
      )}
    </div>
  );
}
