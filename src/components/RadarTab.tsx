'use client';

import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, AlertTriangle, Filter, Coins } from 'lucide-react';
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
            <span className="text-[10px] text-cyan-400 font-bold uppercase block mb-1">1. Ingestão de Dados</span>
            <p className="text-slate-300 font-semibold leading-tight">Coleta de Candles B3 (1d, 60m, 15m, 5m) e Book de Opções</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-purple-400 font-bold uppercase block mb-1">2. Ciclos Diários</span>
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
