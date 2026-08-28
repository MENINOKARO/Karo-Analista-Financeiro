'use client';

import React from 'react';
import { Smartphone, CheckCircle2, Send } from 'lucide-react';
import { TelegramConfig } from '@/core/types';

interface TelegramTabProps {
  telegramConfig: TelegramConfig;
  setTelegramConfig: (cfg: TelegramConfig) => void;
  telegramStatusMsg: string;
  telegramSending: boolean;
  onSave: () => void;
  onTest: () => void;
}

export function TelegramTab({
  telegramConfig,
  setTelegramConfig,
  telegramStatusMsg,
  telegramSending,
  onSave,
  onTest
}: TelegramTabProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-[#0d1322] border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Notificações VIP no seu Celular (Telegram Bot)</h2>
            <p className="text-xs text-slate-400">Receba os alertas de 5 em 5 minutos diretamente no seu Telegram com stop, alvos e tese sênior.</p>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl mb-6 text-xs text-slate-300 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold text-white text-sm">Bot Oficial do Sistema:</span>
              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold text-xs">
                @Karo_AF_bot
              </span>
            </div>
            <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
              ✓ Autenticado & Certificado
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-slate-300 leading-relaxed text-xs">
              Para receber alertas de oportunidades, proximidade de stop e metas batidas, clique no botão abaixo para abrir o robô oficial e toque em <strong>INICIAR (Start)</strong>:
            </p>

            <a 
              href="https://t.me/Karo_AF_bot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> 🚀 Abrir @Karo_AF_bot no Telegram (1-Clique)
            </a>
          </div>

          <div className="pt-2 text-[11px] text-slate-400">
            💡 <em>Se não souber seu Chat ID, você pode consultar enviando qualquer mensagem para <strong>@userinfobot</strong> no Telegram.</em>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Seu Chat ID no Telegram</label>
            <input 
              type="text" 
              placeholder="Digite seu Chat ID (ex: 123456789)"
              value={telegramConfig.chatId} 
              onChange={(e) => setTelegramConfig({ ...telegramConfig, chatId: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-slate-200">Escolha quais tipos de alertas deseja receber:</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition">
                <div>
                  <span className="text-xs font-semibold text-white block">⚡ Oportunidades do Radar</span>
                  <span className="text-[10px] text-slate-400">Setups com Score ≥ {telegramConfig.minScore}%</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={telegramConfig.notifyOpportunities !== false} 
                  onChange={(e) => setTelegramConfig({ ...telegramConfig, notifyOpportunities: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition">
                <div>
                  <span className="text-xs font-semibold text-rose-300 block">⚠️ Proximidade de Stop</span>
                  <span className="text-[10px] text-slate-400">Aviso quando o preço chegar perto do Stop</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={telegramConfig.notifyStopProximity !== false} 
                  onChange={(e) => setTelegramConfig({ ...telegramConfig, notifyStopProximity: e.target.checked })}
                  className="w-4 h-4 accent-rose-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition">
                <div>
                  <span className="text-xs font-semibold text-emerald-300 block">🎯 Alcance de Alvos</span>
                  <span className="text-[10px] text-slate-400">Alvo 1 (Parcial) e Alvo 2 (Final)</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={telegramConfig.notifyTargets !== false} 
                  onChange={(e) => setTelegramConfig({ ...telegramConfig, notifyTargets: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition">
                <div>
                  <span className="text-xs font-semibold text-cyan-300 block">📰 Notícias & Mudanças B3</span>
                  <span className="text-[10px] text-slate-400">Fatos relevantes e balanços das empresas</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={telegramConfig.notifyNews !== false} 
                  onChange={(e) => setTelegramConfig({ ...telegramConfig, notifyNews: e.target.checked })}
                  className="w-4 h-4 accent-cyan-500"
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Ativação Global do Telegram Bot</span>
              <span className="text-[11px] text-slate-400">Liga/Desliga todos os disparos automáticos</span>
            </div>
            <input 
              type="checkbox" 
              checked={telegramConfig.enabled} 
              onChange={(e) => setTelegramConfig({ ...telegramConfig, enabled: e.target.checked })}
              className="w-5 h-5 accent-emerald-500"
            />
          </div>

          {telegramStatusMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
              {telegramStatusMsg}
            </div>
          )}

          <div className="flex items-center gap-3 pt-3">
            <button 
              onClick={onSave}
              disabled={telegramSending}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
            >
              Salvar Configurações
            </button>
            <button 
              onClick={onTest}
              disabled={telegramSending}
              className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Testar Notificação no Celular
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
