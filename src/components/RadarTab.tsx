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
            📊 26 Ativos Monitorados • Confluência Mínima: 80%
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
              🇧🇷 Ações B3
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
