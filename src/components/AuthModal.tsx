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
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER' | 'FORGOT' | 'VERIFY_CODE' | 'NEW_PASSWORD'>('LOGIN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Carrega lista de usuários registrados no navegador
  const getLocalUsers = (): any[] => {
    try {
      const raw = localStorage.getItem('karo_registered_users_v2');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  // Salva e sincroniza usuário localmente e com o servidor
  const persistUserLocal = (user: any, pass: string) => {
    try {
      const users = getLocalUsers();
      const cleanEmail = user.email.toLowerCase().trim();
      const existingIdx = users.findIndex((u: any) => u.email?.toLowerCase().trim() === cleanEmail);
      const record = { ...user, passwordHash: pass };
      if (existingIdx >= 0) {
        users[existingIdx] = record;
      } else {
        users.push(record);
      }
      localStorage.setItem('karo_registered_users_v2', JSON.stringify(users));

      // Sincroniza em background com o servidor
      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SYNC_USERS', payload: { users } })
      }).catch(() => {});
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const cleanEmail = email.toLowerCase().trim();

    try {
      // 1. CADASTRO DE NOVO USUÁRIO
      if (tab === 'REGISTER') {
        const localUsers = getLocalUsers();
        if (localUsers.some((u: any) => u.email?.toLowerCase().trim() === cleanEmail)) {
          throw new Error('Este e-mail já está cadastrado. Por favor, faça login.');
        }

        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'REGISTER', payload: { name, email: cleanEmail, password } })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Erro ao criar conta.');
        }

        persistUserLocal(data.user, password);
        localStorage.setItem('karo_user_session', JSON.stringify(data.user));
        onAuthSuccess(data.user);
        onClose();
      }

      // 2. LOGIN DE USUÁRIO (VALIDAÇÃO ESTRITA)
      else if (tab === 'LOGIN') {
        const localUsers = getLocalUsers();
        const localUser = localUsers.find((u: any) => u.email?.toLowerCase().trim() === cleanEmail);

        // Se o usuário existe localmente, verifica a senha antes de qualquer coisa
        if (localUser && localUser.passwordHash !== password) {
          throw new Error('Senha incorreta. Verifique sua senha ou use a recuperação de senha.');
        }

        // Tenta autenticação com o servidor
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'LOGIN', payload: { email: cleanEmail, password } })
        });

        const data = await res.json();

        // Se o servidor confirmou
        if (res.ok && data.success) {
          persistUserLocal(data.user, password);
          localStorage.setItem('karo_user_session', JSON.stringify(data.user));
          onAuthSuccess(data.user);
          onClose();
          return;
        }

        // Se o servidor não encontrou mas temos no navegador com a senha correta
        if (localUser && localUser.passwordHash === password) {
          const { passwordHash, ...safeUser } = localUser;
          fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'SYNC_USERS', payload: { users: localUsers } })
          }).catch(() => {});

          localStorage.setItem('karo_user_session', JSON.stringify(safeUser));
          onAuthSuccess(safeUser);
          onClose();
          return;
        }

        throw new Error(data.message || 'Usuário não cadastrado. Por favor, crie uma conta na aba Cadastrar.');
      }

      // 3. ETAPA 1 DE RECUPERAÇÃO: SOLICITAR CÓDIGO POR E-MAIL
      else if (tab === 'FORGOT') {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'FORGOT_PASSWORD', payload: { email: cleanEmail } })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Não encontramos nenhuma conta com este e-mail. Por favor, crie seu cadastro.');
        }

        setResetCode('');
        setSuccessMsg(data.message || `Código de verificação enviado para ${cleanEmail}!`);
        setTab('VERIFY_CODE');
      }

      // 4. ETAPA 2 DE RECUPERAÇÃO: VALIDAR CÓDIGO (NÃO ABRE A SENHA SE ERRADO)
      else if (tab === 'VERIFY_CODE') {
        if (!resetCode || resetCode.trim().length !== 6) {
          throw new Error('Por favor, digite o código de 6 dígitos que foi enviado para o seu e-mail.');
        }

        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'VERIFY_RESET_CODE', 
            payload: { email: cleanEmail, code: resetCode.trim() } 
          })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Código de verificação incorreto. Verifique seu e-mail e tente novamente.');
        }

        // Código correto -> Avança para a etapa 3 (abrir campos de nova senha)
        setSuccessMsg('Código validado com sucesso! Agora cadastre sua nova senha.');
        setTab('NEW_PASSWORD');
      }

      // 5. ETAPA 3 DE RECUPERAÇÃO: CADASTRAR NOVA SENHA
      else if (tab === 'NEW_PASSWORD') {
        if (!newPassword || newPassword.length < 4) {
          throw new Error('A nova senha deve ter no mínimo 4 caracteres.');
        }

        if (newPassword !== confirmPassword) {
          throw new Error('As senhas não coincidem. Digite a mesma senha nos dois campos.');
        }

        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'RESET_PASSWORD', 
            payload: { email: cleanEmail, code: resetCode.trim(), newPassword } 
          })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Erro ao salvar a nova senha.');
        }

        persistUserLocal(data.user, newPassword);
        localStorage.setItem('karo_user_session', JSON.stringify(data.user));
        onAuthSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação.');
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

        {/* Botão Fechar */}
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
            {tab === 'FORGOT' || tab === 'VERIFY_CODE' || tab === 'NEW_PASSWORD' ? (
              <KeyRound className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {tab === 'LOGIN' && 'Acessar o Karo Analista'}
            {tab === 'REGISTER' && 'Criar sua Conta'}
            {tab === 'FORGOT' && 'Recuperar sua Senha'}
            {tab === 'VERIFY_CODE' && 'Validar Código do E-mail'}
            {tab === 'NEW_PASSWORD' && 'Cadastrar Nova Senha'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {tab === 'FORGOT' && 'Passo 1 de 3: Digite seu e-mail cadastrado'}
            {tab === 'VERIFY_CODE' && 'Passo 2 de 3: Insira o código de 6 dígitos enviado'}
            {tab === 'NEW_PASSWORD' && 'Passo 3 de 3: Defina sua nova senha de acesso'}
            {(tab === 'LOGIN' || tab === 'REGISTER') && (isMandatory ? '🔒 Identifique-se para liberar o acesso ao sistema' : 'Inteligência Quantitativa B3 & Gestão Institucional')}
          </p>
        </div>

        {/* Abas Entrar / Criar Conta (apenas em LOGIN ou REGISTER) */}
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

        {/* Mensagens de Alerta e Erro */}
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
          {/* CAMPO NOME (APENAS EM REGISTER) */}
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

          {/* CAMPO EMAIL (EM LOGIN, REGISTER, FORGOT) */}
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

          {/* CAMPO SENHA (EM LOGIN E REGISTER) */}
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

          {/* ETAPA 2: VALIDAR CÓDIGO DE 6 DÍGITOS */}
          {tab === 'VERIFY_CODE' && (
            <div className="space-y-3">
              <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-center">
                <p className="text-[11px] text-slate-300">
                  Enviamos um código de segurança para <strong className="text-cyan-400">{email}</strong>.
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Verifique sua caixa de entrada (e pasta de spam) e digite o código abaixo.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Código de 6 Dígitos do E-mail
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Ex: 849201"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-center text-white font-mono tracking-widest placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 3: CADASTRAR NOVA SENHA (SÓ ABRE APÓS CÓDIGO SER VALIDADO) */}
          {tab === 'NEW_PASSWORD' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nova Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Nova senha (mínimo 4 caracteres)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Confirmar Nova Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* BOTÃO PRINCIPAL DE AÇÃO */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Verificando...' : (
              tab === 'LOGIN' ? 'Entrar no Sistema' :
              tab === 'REGISTER' ? 'Finalizar Cadastro' :
              tab === 'FORGOT' ? 'Enviar Código para meu E-mail' :
              tab === 'VERIFY_CODE' ? 'Validar Código' :
              'Salvar Nova Senha e Entrar'
            )}
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* BOTÕES DE NAVEGAÇÃO / VOLTAR */}
          {(tab === 'FORGOT' || tab === 'VERIFY_CODE' || tab === 'NEW_PASSWORD') && (
            <button
              type="button"
              onClick={() => { setTab('LOGIN'); setError(null); setSuccessMsg(null); setResetCode(''); }}
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