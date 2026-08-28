'use client';

import React, { useState } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  LineChart, 
  DollarSign, 
  Edit3, 
  RefreshCw, 
  Save, 
  X, 
  Check, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Flag,
  BadgeCheck
} from 'lucide-react';
import { PortfolioSummary, ActivePosition, MarketType } from '@/core/types';
import { resolveTickerInfo } from '@/core/market-feed';

interface PortfolioTabProps {
  portfolioSummary: PortfolioSummary | null;
  onRefresh: () => void;
  onOpenChart: (symbol: string) => void;
}

export function PortfolioTab({ portfolioSummary, onRefresh, onOpenChart }: PortfolioTabProps) {
  // Modal de Adição
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [manualTicker, setManualTicker] = useState<string>('PETR4.SA');
  const [manualName, setManualName] = useState<string>('Petrobras PN');
  const [manualMarket, setManualMarket] = useState<MarketType>('B3');
  const [manualEntry, setManualEntry] = useState<number>(38.50);
  const [manualQty, setManualQty] = useState<number>(100);
  const [manualStop, setManualStop] = useState<number>(37.50);
  const [manualTarget, setManualTarget] = useState<number>(40.50);
  const [manualTarget2, setManualTarget2] = useState<number>(42.00);

  // Modal de Edição
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingPos, setEditingPos] = useState<any | null>(null);
  const [editEntry, setEditEntry] = useState<number>(0);
  const [editQty, setEditQty] = useState<number>(0);
  const [editStop, setEditStop] = useState<number>(0);
  const [editTarget1, setEditTarget1] = useState<number>(0);
  const [editTarget2, setEditTarget2] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<string>('ABERTA');
  const [editName, setEditName] = useState<string>('');

  // Modal de Finalizar Operação
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);
  const [closingPos, setClosingPos] = useState<any | null>(null);
  const [closeExitPrice, setCloseExitPrice] = useState<number>(0);

  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [refreshingQuotes, setRefreshingQuotes] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  const getUserId = () => {
    try {
      const userSession = typeof window !== 'undefined' ? localStorage.getItem('karo_user_session') : null;
      const parsedUser = userSession ? JSON.parse(userSession) : null;
      return parsedUser?.id || 'usr_demo';
    } catch {
      return 'usr_demo';
    }
  };

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // AUTO-PREENCHIMENTO DO NOME DA EMPRESA AO DIGITAR O CÓDIGO
  const handleTickerInputChange = (value: string) => {
    const upper = value.toUpperCase();
    setManualTicker(upper);
    if (upper.length >= 3) {
      const info = resolveTickerInfo(upper);
      if (info.name) {
        setManualName(info.name);
        setManualMarket(info.market);
      }
    }
  };

  // Atualiza cotações ao vivo de todas as posições
  const handleRefreshLiveQuotes = async () => {
    try {
      setRefreshingQuotes(true);
      const userId = getUserId();
      const res = await fetch(`/api/portfolio?userId=${userId}`);
      const json = await res.json();
      if (json.success) {
        onRefresh();
        showToast('Cotações atualizadas em tempo real com o feed B3!');
      }
    } catch (err) {
      console.error('Erro ao atualizar cotações:', err);
    } finally {
      setRefreshingQuotes(false);
    }
  };

  // Abre modal de edição preenchido com os dados da posição selecionada
  const handleOpenEditModal = (pos: any) => {
    setEditingPos(pos);
    setEditEntry(pos.entryPrice || 0);
    setEditQty(pos.quantity || 0);
    setEditStop(pos.stopLoss || 0);
    setEditTarget1(pos.target1 || 0);
    setEditTarget2(pos.target2 || (pos.entryPrice * 1.10));
    setEditStatus(pos.status || 'ABERTA');
    setEditName(pos.name || pos.ticker);
    setShowEditModal(true);
  };

  // Abre modal de finalização de trade
  const handleOpenCloseModal = (pos: any) => {
    setClosingPos(pos);
    setCloseExitPrice(pos.currentPrice || pos.entryPrice);
    setShowCloseModal(true);
  };

  // Salva alterações da posição
  const handleSaveEdit = async () => {
    if (!editingPos) return;
    try {
      setLoadingAction(true);
      const userId = getUserId();

      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_POSITION',
          userId,
          payload: {
            id: editingPos.id,
            name: editName,
            entryPrice: editEntry,
            quantity: editQty,
            stopLoss: editStop,
            target1: editTarget1,
            target2: editTarget2,
            status: editStatus
          }
        })
      });

      const json = await res.json();
      if (json.success) {
        setShowEditModal(false);
        if (json.summary && typeof window !== 'undefined') {
          localStorage.setItem(`karo_portfolio_${userId}`, JSON.stringify(json.summary.positions || []));
        }
        onRefresh();
        showToast(`Posição ${editingPos.ticker} atualizada com sucesso!`);
      }
    } catch (err) {
      console.error('Erro ao editar posição:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  // Mover Stop para o Breakeven (Risco Zero)
  const handleSetBreakeven = () => {
    setEditStop(editEntry);
    setEditStatus('STOP_BREAKEVEN');
    showToast('Stop Loss ajustado para o Preço de Entrada (Risco Zero)!');
  };

  // Confirmar encerramento do trade
  const handleConfirmClosePosition = async () => {
    if (!closingPos) return;
    try {
      setLoadingAction(true);
      const userId = getUserId();

      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CLOSE_POSITION',
          userId,
          payload: { 
            id: closingPos.id, 
            exitPrice: closeExitPrice 
          }
        })
      });

      const json = await res.json();
      if (json.success) {
        setShowCloseModal(false);
        if (showEditModal) setShowEditModal(false);
        if (json.summary && typeof window !== 'undefined') {
          localStorage.setItem(`karo_portfolio_${userId}`, JSON.stringify(json.summary.positions || []));
        }
        onRefresh();
        showToast(`Operação em ${closingPos.ticker} encerrada com sucesso!`);
      }
    } catch (err) {
      console.error('Erro ao encerrar posição:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAddManual = async () => {
    try {
      setLoadingAction(true);
      const userId = getUserId();

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
            target1: manualTarget,
            target2: manualTarget2
          }
        })
      });
      const json = await res.json();
      if (json.success) {
        setShowAddModal(false);
        if (json.summary && typeof window !== 'undefined') {
          localStorage.setItem(`karo_portfolio_${userId}`, JSON.stringify(json.summary.positions || []));
        }
        onRefresh();
        showToast(`Posição em ${manualTicker} (${manualName}) cadastrada com sucesso!`);
      }
    } catch (err) {
      console.error('Erro ao adicionar posição:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRemovePosition = async (id: string) => {
    if (!confirm('Deseja realmente excluir este registro da sua carteira?')) return;
    try {
      setLoadingAction(true);
      const userId = getUserId();

      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REMOVE_POSITION', userId, payload: { id } })
      });
      const json = await res.json();
      if (json.summary && typeof window !== 'undefined') {
        localStorage.setItem(`karo_portfolio_${userId}`, JSON.stringify(json.summary.positions || []));
      }
      onRefresh();
      showToast('Posição removida da carteira.');
    } catch (err) {
      console.error('Erro ao remover posição:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  const isTotalProfit = summary.totalPnlAmount >= 0;

  return (
    <div className="space-y-6">
      {/* TOAST DE FEEDBACK */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER DE PATRIMÔNIO & RENTABILIDADE */}
      <div className="bg-[#0d1322] border border-slate-800 p-6 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Minha Carteira & Gestão de Posições</h2>
              <p className="text-xs text-slate-400">
                Cotações 100% sincronizadas ao vivo com o Radar e consultoria instantânea do robô.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshLiveQuotes}
              disabled={refreshingQuotes}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-bold text-xs shadow-md transition flex items-center gap-1.5"
              title="Sincronizar com as cotações em tempo real do Radar"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingQuotes ? 'animate-spin text-cyan-400' : ''}`} />
              {refreshingQuotes ? 'Atualizando B3...' : 'Atualizar Cotações'}
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Cadastrar Ação / Opção
            </button>
          </div>
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
            <span className="text-lg font-bold text-cyan-300 font-mono mt-1 block">
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
        <div className="flex items-center justify-between">
          <h3 className="text-sm uppercase font-bold text-slate-300 tracking-wider flex items-center gap-2">
            <span>Posições em Andamento (Guardião do Robô):</span>
          </h3>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" /> Cotações ao Vivo B3
          </span>
        </div>

        {summary.positions.length === 0 ? (
          <div className="text-center py-16 bg-[#0d1322] border border-slate-800 rounded-2xl">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-300 font-semibold text-sm">Nenhuma posição ativa cadastrada no momento.</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Vá na aba de Radar de Oportunidades e clique em <strong>"⚡ Entrei no Trade"</strong> para o robô acompanhar sua operação, ou clique em <strong>"Cadastrar Ação / Opção"</strong> acima para registrar manualmente!
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg font-bold text-white tracking-tight">{pos.ticker}</span>
                          <span className="text-xs text-slate-300 font-semibold">({pos.name})</span>
                          {pos.modality === 'OPTIONS' || (pos.ticker.length >= 7 && !pos.ticker.includes('.SA') && !pos.ticker.includes('USD')) ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 font-mono">
                              💎 Opção B3 • {pos.quantity} un
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono">
                              {pos.quantity} cotas
                            </span>
                          )}
                          {isBreakeven && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              🛡️ Breakeven
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Origem: {pos.originSetup || 'Entrada Registrada'} • Status: <strong className="text-slate-400">{pos.status}</strong>
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
                      <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-lg py-1">
                        <span className="text-[10px] uppercase text-cyan-400 block font-bold">
                          Cotação Atual
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
                        Guardião do Robô (Tempo Real):
                      </div>
                      <p className="italic">{pos.robotAdvice}</p>
                    </div>
                  </div>

                  {/* Ações da Posição */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 flex-wrap">
                    {/* BOTÃO FINALIZAR OPERAÇÃO */}
                    <button
                      onClick={() => handleOpenCloseModal(pos)}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md ${
                        isProfit 
                          ? 'bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-emerald-600/20' 
                          : 'bg-amber-600/90 hover:bg-amber-500 text-white shadow-amber-600/20'
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" /> Finalizar Operação
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(pos)}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-cyan-300 transition flex items-center justify-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Editar
                    </button>

                    <button
                      onClick={() => onOpenChart(pos.ticker)}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-1"
                    >
                      <LineChart className="w-3.5 h-3.5 text-cyan-400" /> Gráfico
                    </button>

                    <button
                      onClick={() => handleRemovePosition(pos.id)}
                      disabled={loadingAction}
                      className="p-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-400 text-xs transition flex items-center"
                      title="Excluir da carteira"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE FINALIZAR OPERAÇÃO */}
      {/* ========================================================================= */}
      {showCloseModal && closingPos && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1322] border border-emerald-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Finalizar Operação • {closingPos.ticker}</h3>
              </div>
              <button onClick={() => setShowCloseModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Ativo:</span>
                <strong className="text-white font-mono">{closingPos.ticker} ({closingPos.name})</strong>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Quantidade:</span>
                <strong className="text-white font-mono">{closingPos.quantity} un</strong>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Preço de Entrada:</span>
                <strong className="text-white font-mono">R$ {closingPos.entryPrice.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between items-center text-cyan-400 border-t border-slate-800/80 pt-2">
                <span className="font-bold">Cotação Atual de Saída:</span>
                <strong className="text-cyan-300 font-mono text-sm">R$ {closeExitPrice.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between items-center border-t border-slate-800/80 pt-2 text-sm">
                <span className="font-bold text-slate-200">Resultado Final Estimado:</span>
                <span className={`font-bold font-mono ${
                  (closeExitPrice - closingPos.entryPrice) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {(closeExitPrice - closingPos.entryPrice) >= 0 ? '+' : ''}
                  R$ {((closeExitPrice - closingPos.entryPrice) * closingPos.quantity).toFixed(2)} ({
                    (((closeExitPrice - closingPos.entryPrice) / closingPos.entryPrice) * 100).toFixed(2)
                  }%)
                </span>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1 text-xs">
                Ajustar Preço de Venda Executado (R$):
              </label>
              <input 
                type="number" 
                step="0.01" 
                value={closeExitPrice} 
                onChange={(e) => setCloseExitPrice(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm font-bold"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button 
                onClick={() => setShowCloseModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmClosePosition}
                disabled={loadingAction}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Confirmar & Realizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE EDIÇÃO DE POSIÇÃO */}
      {/* ========================================================================= */}
      {showEditModal && editingPos && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1322] border border-cyan-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">Editar Posição • {editingPos.ticker}</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nome / Descrição:</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Preço de Entrada (R$):</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={editEntry} 
                    onChange={(e) => setEditEntry(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Quantidade:</label>
                  <input 
                    type="number" 
                    value={editQty} 
                    onChange={(e) => setEditQty(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-rose-400 font-semibold block mb-1">Stop Loss (R$):</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={editStop} 
                    onChange={(e) => setEditStop(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-rose-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-emerald-400 font-semibold block mb-1">Alvo 1 (R$):</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={editTarget1} 
                    onChange={(e) => setEditTarget1(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-emerald-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-cyan-400 font-semibold block mb-1">Alvo 2 (R$):</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={editTarget2} 
                    onChange={(e) => setEditTarget2(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-cyan-400 font-mono"
                  />
                </div>
              </div>

              {/* Botão de Breakeven Rápido */}
              <button
                type="button"
                onClick={handleSetBreakeven}
                className="w-full py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Mover Stop para Breakeven (R$ {editEntry.toFixed(2)})
              </button>

              {/* Status do Trade */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Status da Posição:</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold"
                >
                  <option value="ABERTA">ABERTA (Em Andamento)</option>
                  <option value="STOP_BREAKEVEN">STOP BREAKEVEN (Risco Zero)</option>
                  <option value="ALVO_1_ATINGIDO">ALVO 1 ATINGIDO (Realização Parcial)</option>
                  <option value="ENCERRADA_LUCRO">ENCERRADA NO LUCRO (Meta Concluída)</option>
                  <option value="ENCERRADA_STOP">ENCERRADA NO STOP LOSS</option>
                </select>
              </div>
            </div>

            {/* Ações do Modal de Edição */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveEdit}
                  disabled={loadingAction}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Salvar Alterações
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  handleOpenCloseModal(editingPos);
                }}
                disabled={loadingAction}
                className="w-full py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition flex items-center justify-center gap-1"
              >
                🏁 Finalizar / Encerrar Operação ao Preço Atual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CADASTRO MANUAL DE AÇÕES */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1322] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Cadastrar Ação ou Opção na Carteira</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Mercado:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => { setManualMarket('B3'); setManualTicker('PETR4.SA'); setManualName('Petrobras PN'); }}
                    className={`py-1.5 rounded-lg border font-bold text-center ${manualMarket === 'B3' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    🇧🇷 Ações & Opções B3
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
                    placeholder="Ex: ABEVI153 ou PETR4"
                    value={manualTicker} 
                    onChange={(e) => handleTickerInputChange(e.target.value)}
                    className="w-full bg-slate-900 border border-cyan-500/50 rounded-lg px-3 py-2 text-white font-mono font-bold uppercase focus:border-cyan-400 outline-none"
                  />
                  <span className="text-[10px] text-cyan-400/80 block mt-1">
                    Auto-completa a empresa ao digitar
                  </span>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Nome da Empresa:</label>
                  <input 
                    type="text" 
                    value={manualName} 
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium"
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
                  <label className="text-slate-300 font-semibold block mb-1">Quantidade:</label>
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
                  <label className="text-emerald-400 font-semibold block mb-1">Alvo 1 de Lucro (R$):</label>
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
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddManual}
                disabled={loadingAction}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition"
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
