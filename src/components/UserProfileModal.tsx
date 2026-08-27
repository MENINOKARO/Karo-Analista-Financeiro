'use client';

import React, { useState } from 'react';
import { User, Lock, Mail, ShieldCheck, Award, X, CheckCircle2, TrendingUp, Save, LogOut } from 'lucide-react';
import { PortfolioSummary } from '@/core/types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  portfolioSummary: PortfolioSummary | null;
  onUpdateUser: (updatedUser: any) => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  portfolioSummary,
  onUpdateUser,
  onLogout
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [riskProfile, setRiskProfile] = useState<'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE'>(currentUser?.riskProfile || 'MODERATE');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_PROFILE',
          payload: {
            userId: currentUser.id,
            name,
            email,
            riskProfile,
            oldPassword: oldPassword || undefined,
            newPassword: newPassword || undefined
          }
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erro ao atualizar perfil.');
      }

      localStorage.setItem('karo_user_session', JSON.stringify(data.user));
      onUpdateUser(data.user);
      setSuccess('Perfil atualizado com sucesso!');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Falha ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  const totalTrades = portfolioSummary?.openPositionsCount || 0;
  const totalPnl = portfolioSummary?.totalPnlAmount || 0;
  const isProfit = totalPnl >= 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b101d] border border-cyan-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Glow Decorativo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header do Perfil */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-cyan-600/30">
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">{currentUser.name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase">
                {currentUser.plan || 'PRO'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Membro desde: {new Date(currentUser.createdAt || Date.now()).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Estatísticas Rápidas da Carteira do Usuário */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Posições Ativas</span>
            <span className="text-base font-bold text-white font-mono mt-0.5 block">{totalTrades} operações</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Resultado Acumulado</span>
            <span className={`text-base font-bold font-mono mt-0.5 block ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isProfit ? '+' : ''}R$ {totalPnl.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Mensagens */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Formulário de Configurações */}
        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nome Completo</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Perfil de Risco Preferencial</label>
            <select
              value={riskProfile}
              onChange={(e: any) => setRiskProfile(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
            >
              <option value="CONSERVATIVE">🟢 Conservador (Ações à Vista / Swing Trade)</option>
              <option value="MODERATE">💎 Moderado (Opções Reais B3 & Trava de Baixo Custo)</option>
              <option value="AGGRESSIVE">⚡ Agressivo (Day Trade 5m & Alavancado)</option>
            </select>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block mb-2">Alterar Senha (Opcional)</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="password"
                placeholder="Senha atual"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
              />
              <input
                type="password"
                placeholder="Nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>

            <button
              type="button"
              onClick={() => { onClose(); onLogout(); }}
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs transition flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};