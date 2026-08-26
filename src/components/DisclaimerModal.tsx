'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Scale, Lock } from 'lucide-react';

export function DisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já aceitou o termo na sessão
    const hasAccepted = localStorage.getItem('karo_disclaimer_accepted');
    if (!hasAccepted) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('karo_disclaimer_accepted', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b101d] border border-cyan-500/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-4">
        {/* Header do Modal */}
        <div className="flex items-start gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Aviso Importante & Isenção de Responsabilidade
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Termos de Uso e Responsabilidade do Investidor - Karo Analista Financeiro
            </p>
          </div>
        </div>

        {/* Corpo do Aviso */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl text-xs space-y-2.5 text-slate-300 leading-relaxed max-h-72 overflow-y-auto">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">1. Sugestões e Estudos Algorítmicos:</strong> O <strong>Karo Analista Financeiro</strong> é uma plataforma de inteligência quantitativa e análise gráfica. Todas as informações, pontuações de confluência, estruturas de opções, preços de entrada, alvos e stops são <strong>sugestões técnicas e estudos analíticos</strong> para apoio à tomada de decisão.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <Scale className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">2. Decisão Exclusiva do Usuário:</strong> Toda e qualquer operação no mercado financeiro (Ações, Opções B3, Criptoativos, Day Trade ou Swing Trade) é de <strong>responsabilidade única e exclusiva do usuário</strong>. O investidor deve avaliar criteriosamente seu perfil de risco e verificar as cotações em sua própria corretora antes de boletar.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">3. Risco de Mercado e Renda Variável:</strong> O mercado de renda variável está sujeito a oscilações de preços e riscos. <strong>Rentabilidade passada não representa garantia de ganhos futuros.</strong> Nunca opere um capital que comprometa sua estabilidade financeira sem a devida gestão de risco.
            </p>
          </div>
        </div>

        {/* Checkbox de Concordância */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="disclaimer-check"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
          />
          <label htmlFor="disclaimer-check" className="text-xs text-slate-300 cursor-pointer select-none">
            Li, compreendo que são <strong className="text-cyan-300">apenas sugestões de mercado</strong> e assumo total responsabilidade por minhas decisões financeiras.
          </label>
        </div>

        {/* Botão de Confirmação */}
        <button
          onClick={handleAccept}
          disabled={!agreed}
          className={`w-full py-3 rounded-xl font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 ${
            agreed
              ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white shadow-emerald-500/25 active:scale-98 cursor-pointer'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Compreendo e Concordo em Prosseguir para a Plataforma
        </button>
      </div>
    </div>
  );
}