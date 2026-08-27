'use client';

import React, { useState } from 'react';
import { User, Lock, Mail, ShieldCheck, ArrowRight, Sparkles, X, KeyRound, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
  isMandatory?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onAuthSuccess,
  isMandatory = false
}) => {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER' | 'FORGOT' | 'RESET'>('LOGIN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (tab === 'LOGIN' || tab === 'REGISTER') {
        const action = tab;
        const payload = tab === 'REGISTER' ? { name, email, password } : { email, password };

        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, payload })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Erro ao processar autenticação.');
        }

        localStorage.setItem('karo_user_session', JSON.stringify(data.user));
        onAuthSuccess(data.user);
        onClose();
      } else if (tab === 'FORGOT') {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'FORGOT_PASSWORD', payload: { email } })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'E-mail não encontrado.');
        }

        if (data.codeSimulation) {
          setResetCode(data.codeSimulation);
        }
        setSuccessMsg(`Código de recuperação gerado com sucesso para ${email}!`);
        setTab('RESET');
      } else if (tab === 'RESET') {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'RESET_PASSWORD', 
            payload: { email, code: resetCode, newPassword } 
          })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Erro ao redefinir senha.');
        }

        localStorage.setItem('karo_user_session', JSON.stringify(data.user));
        onAuthSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Falha na conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'GUEST_SESSION', payload: { name: 'Investidor Convidado' } })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('karo_user_session', JSON.stringify(data.user));
        onAuthSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError('Erro ao entrar como convidado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b101d] border border-cyan-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Glow Decorativo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Botão Fechar (apenas se não for obrigatório) */}
        {!isMandatory && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header do Modal */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3 shadow-inner">
            {tab === 'FORGOT' || tab === 'RESET' ? <KeyRound className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {tab === 'LOGIN' && 'Acessar o Karo Analista'}
            {tab === 'REGISTER' && 'Criar sua Conta Pro'}
            {tab === 'FORGOT' && 'Recuperar sua Senha'}
            {tab === 'RESET' && 'Criar Nova Senha'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isMandatory ? '🔒 Identifique-se para liberar o acesso ao sistema' : 'Inteligência Quantitativa B3 & Gestão Institucional'}
          </p>
        </div>

        {/* Abas Entrar / Criar Conta (quando em modo normal) */}
        {(tab === 'LOGIN' || tab === 'REGISTER') && (
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 mb-5 text-xs font-semibold">
            <button
              onClick={() => { setTab('LOGIN'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 rounded-lg transition ${
                tab === 'LOGIN' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setTab('REGISTER'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 rounded-lg transition ${
                tab === 'REGISTER' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Criar Conta
            </button>
          </div>
        )}

        {/* Mensagens de Alerta */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Formulário Principal */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'REGISTER' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nome Completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>
          )}

          {(tab === 'LOGIN' || tab === 'REGISTER' || tab === 'FORGOT') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-300">E-mail Cadastrado</label>
                {tab === 'LOGIN' && (
                  <button
                    type="button"
                    onClick={() => { setTab('FORGOT'); setError(null); setSuccessMsg(null); }}
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>
          )}

          {(tab === 'LOGIN' || tab === 'REGISTER') && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>
          )}

          {tab === 'RESET' && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Código de 6 Dígitos Enviado</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Ex: 849201"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono tracking-widest placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nova Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Sua nova senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Processando...' : (
              tab === 'LOGIN' ? 'Entrar no Sistema' :
              tab === 'REGISTER' ? 'Finalizar Cadastro' :
              tab === 'FORGOT' ? 'Enviar Código de Recuperação' :
              'Salvar Nova Senha e Entrar'
            )}
            <ArrowRight className="w-4 h-4" />
          </button>

          {(tab === 'FORGOT' || tab === 'RESET') && (
            <button
              type="button"
              onClick={() => { setTab('LOGIN'); setError(null); setSuccessMsg(null); }}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200 mt-2 block"
            >
              ← Voltar para o Login
            </button>
          )}
        </form>

        {/* Divisor & Acesso Rápido */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-[#0b101d] px-2 text-slate-500 font-semibold">ou experimente</span>
          </div>
        </div>

        <button
          onClick={handleGuestLogin}
          disabled={loading}
          className="w-full py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white font-medium text-xs transition flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Acessar como Convidado / Demo
        </button>

        <p className="text-[10px] text-center text-slate-500 mt-4">
          🔒 Seus dados e posições são salvos de forma privada no seu perfil.
        </p>
      </div>
    </div>
  );
};