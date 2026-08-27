'use client';

import React, { useState } from 'react';
import { Briefcase, TrendingUp, TrendingDown, Plus, Trash2, ShieldCheck, Sparkles, CheckCircle2, AlertCircle, LineChart, DollarSign } from 'lucide-react';
import { PortfolioSummary, ActivePosition, MarketType } from '@/core/types';

interface PortfolioTabProps {
  portfolioSummary: PortfolioSummary | null;
  onRefresh: () => void;
  onOpenChart: (symbol: string) => void;
}

export function PortfolioTab({ portfolioSummary, onRefresh, onOpenChart }: PortfolioTabProps) {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [manualTicker, setManualTicker] = useState<string>('PETR4.SA');
  const [manualName, setManualName] = useState<string>('Petrobras PN');
  const [manualMarket, setManualMarket] = useState<MarketType>('B3');
  const [manualEntry, setManualEntry] = useState<number>(38.50);
  const [manualQty, setManualQty] = useState<number>(100);
  const [manualStop, setManualStop] = useState<number>(37.50);
  const [manualTarget, setManualTarget] = useState<number>(40.50);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);

  const summary = portfolioSummary || {
    totalCapitalInvested: 21760.00,
    totalCurrentValue: 22200.00,
    totalPnlAmount: 440.00,
    totalPnlPercent: 2.02,
    openPositionsCount: 2,
    winningPositionsCount: 2,
    losingPositionsCount: 0,
    positions: []
  };

  const handleAddManual = async () => {
    try {
      setLoadingAction(true);
      const userSession = typeof window !== 'undefined' ? localStorage.getItem('karo_user_session') : null;
      const parsedUser = userSession ? JSON.parse(userSession) : null;
      const userId = parsedUser?.id || 'usr_demo';

      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_MANUAL',
          userId,
          payload: {
            ticker: manualTicker,
            name: manualName,
            market: manualMarket,
            entryPrice: manualEntry,
            quantity: manualQty,
            stopLoss: manualStop,
            target1: manualTarget
          }
        })
      });
      const json = await res.json();
      if (json.success) {
        setShowAddModal(false);
        onRefresh();
      }
    } catch (err) {
      console.error('Erro ao adicionar posição:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRemovePosition = async (id: string) => {
    try {
      setLoadingAction(true);
      const userSession = typeof window !== 'undefined' ? localStorage.getItem('karo_user_session') : null;
      const parsedUser = userSession ? JSON.parse(userSession) : null;
      const userId = parsedUser?.id || 'usr_demo';

      await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REMOVE_POSITION', userId, payload: { id } })
      });
      onRefresh();
    } catch (err) {
      console.error('Erro ao remover posição:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  const isTotalProfit = summary.totalPnlAmount >= 0;

  return (
    <div className="space-y-6">
      {/* HEADER DE PATRIMÔNIO & RENTABILIDADE */}
      <div className="bg-[#0d1322] border border-slate-800 p-6 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Minha Carteira & Acompanhamento de Posições</h2>
              <p className="text-xs text-slate-400">
                O robô monitora suas ações em tempo real, avisando quando realizar lucros parciais ou mover o Stop para o Breakeven.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Cadastrar Ação na Carteira
          </button>
        </div>

        {/* CARDS DE RESUMO FINANCEIRO */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Investido</span>
            <span className="text-lg font-bold text-white font-mono mt-1 block">
              R$ {summary.totalCapitalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Valor Atual de Mercado</span>
            <span className="text-lg font-bold text-white font-mono mt-1 block">
              R$ {summary.totalCurrentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Resultado em Aberto</span>
            <span className={`text-lg font-bold font-mono mt-1 flex items-center gap-1 ${isTotalProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isTotalProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isTotalProfit ? '+' : ''}R$ {summary.totalPnlAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({isTotalProfit ? '+' : ''}{summary.totalPnlPercent}%)
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Posições Monitoradas</span>
            <span className="text-lg font-bold text-cyan-400 font-mono mt-1 block">
              {summary.openPositionsCount} Ativas ({summary.winningPositionsCount} no Lucro)
            </span>
          </div>
        </div>
      </div>

      {/* LISTA DE POSIÇÕES ATIVAS MONITORADAS PELO ROBÔ */}
      <div className="space-y-4">
        <h3 className="text-sm uppercase font-bold text-slate-300 tracking-wider flex items-center gap-2">
          <span>Posições em Andamento (Guardião do Robô):</span>
        </h3>

        {summary.positions.length === 0 ? (
          <div className="text-center py-16 bg-[#0d1322] border border-slate-800 rounded-2xl">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-300 font-semibold text-sm">Nenhuma posição ativa cadastrada no momento.</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Vá na aba de Radar de Oportunidades e clique em <strong>"⚡ Entrei no Trade"</strong> para o robô começar a acompanhar sua operação, ou cadastre manualmente acima!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {summary.positions.map((pos) => {
              const isProfit = pos.pnlAmount >= 0;
              const isBreakeven = pos.status === 'STOP_BREAKEVEN';
              const isTarget1 = pos.status === 'ALVO_1_ATINGIDO';

              return (
                <div 
                  key={pos.id}
                  className="bg-[#0d1322] border border-slate-800 hover:border-slate-700 transition rounded-2xl p-5 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    {/* Header da Posição */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white tracking-tight">{pos.ticker}</span>
                          <span className="text-xs text-slate-400">({pos.name})</span>
                          {pos.modality === 'OPTIONS' || (pos.ticker.length >= 7 && !pos.ticker.includes('.SA') && !pos.ticker.includes('USD')) ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 font-mono">
                              💎 Opção B3 • {pos.quantity} un
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono">
                              {pos.quantity} cotas
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Origem: {pos.originSetup || 'Entrada Registrada'}
                        </span>
                      </div>

                      {/* Badge de Lucro / Prejuízo */}
                      <div className="text-right">
                        <span className={`text-sm font-bold font-mono px-2.5 py-1 rounded-xl border block ${
                          isProfit 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                          {isProfit ? '+' : ''}R$ {pos.pnlAmount.toFixed(2)} ({isProfit ? '+' : ''}{pos.pnlPercent}%)
                        </span>
                      </div>
                    </div>

                    {/* Dados de Preço, Stop e Alvos */}
                    <div className="grid grid-cols-4 gap-2 bg-slate-900/90 border border-slate-800 p-3 rounded-xl mb-3 text-center text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block">
                          {pos.modality === 'OPTIONS' ? 'Prêmio Pago' : 'Preço Compra'}
                        </span>
                        <span className="font-bold text-white font-mono">R$ {pos.entryPrice.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-cyan-400 block">
                          {pos.modality === 'OPTIONS' ? 'Prêmio Atual' : 'Cotação Atual'}
                        </span>
                        <span className="font-bold text-cyan-300 font-mono">R$ {pos.currentPrice.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-rose-400 block">
                          {pos.modality === 'OPTIONS' ? 'Risco Máx' : 'Stop Loss'}
                        </span>
                        <span className="font-bold text-rose-400 font-mono">
                          {pos.modality === 'OPTIONS' ? `R$ ${(pos.entryPrice * pos.quantity).toFixed(2)}` : `R$ ${pos.stopLoss.toFixed(2)}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-emerald-400 block">Alvo 1</span>
                        <span className="font-bold text-emerald-400 font-mono">R$ {pos.target1.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* ORIENTAÇÃO DO ROBÔ AO VIVO */}
                    <div className={`p-3.5 rounded-xl border text-xs leading-relaxed mb-4 ${
                      isTarget1 
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' 
                        : isBreakeven 
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300'
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        Guardião do Robô (Acompanhamento em Tempo Real):
                      </div>
                      <p className="italic">{pos.robotAdvice}</p>
                    </div>
                  </div>

                  {/* Ações da Posição */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => onOpenChart(pos.ticker)}
                      className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-1.5"
                    >
                      <LineChart className="w-3.5 h-3.5 text-cyan-400" /> Ver Gráfico
                    </button>
                    <button
                      onClick={() => handleRemovePosition(pos.id)}
                      disabled={loadingAction}
                      className="px-3 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 text-xs font-semibold transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Encerrar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DE CADASTRO MANUAL DE AÇÕES */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1322] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Cadastrar Ação que Já Possuo</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Mercado:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => { setManualMarket('B3'); setManualTicker('PETR4.SA'); setManualName('Petrobras PN'); }}
                    className={`py-1.5 rounded-lg border font-bold text-center ${manualMarket === 'B3' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    🇧🇷 Ações B3
                  </button>
                  <button 
                    onClick={() => { setManualMarket('CRYPTO'); setManualTicker('BTC-USD'); setManualName('Bitcoin (BTC)'); }}
                    className={`py-1.5 rounded-lg border font-bold text-center ${manualMarket === 'CRYPTO' ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    🪙 Cripto 24/7
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Código (Ticker):</label>
                  <input 
                    type="text" 
                    value={manualTicker} 
                    onChange={(e) => setManualTicker(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Nome da Empresa:</label>
                  <input 
                    type="text" 
                    value={manualName} 
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Seu Preço de Compra (R$):</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={manualEntry} 
                    onChange={(e) => setManualEntry(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Quantidade de Ações:</label>
                  <input 
                    type="number" 
                    value={manualQty} 
                    onChange={(e) => setManualQty(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-rose-400 font-semibold block mb-1">Stop Loss Desejado (R$):</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={manualStop} 
                    onChange={(e) => setManualStop(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-rose-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-emerald-400 font-semibold block mb-1">Alvo de Lucro (R$):</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={manualTarget} 
                    onChange={(e) => setManualTarget(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddManual}
                disabled={loadingAction}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20"
              >
                Salvar & Acompanhar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
