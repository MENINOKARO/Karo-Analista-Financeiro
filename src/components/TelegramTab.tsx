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

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl mb-6 text-xs text-slate-300 space-y-2">
          <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Como configurar em menos de 1 minuto:
          </h4>
          <ol className="list-decimal list-inside space-y-1 text-slate-400">
            <li>Abra o Telegram no seu celular e busque por <strong>@BotFather</strong>.</li>
            <li>Envie o comando <code>/newbot</code>, escolha um nome e copie o <strong>Bot Token</strong> gerado.</li>
            <li>Busque por <strong>@userinfobot</strong> no Telegram e pegue o seu <strong>Chat ID</strong> numérico.</li>
            <li>Cole ambos os campos abaixo e clique em <strong>Salvar & Testar</strong>.</li>
          </ol>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Telegram Bot Token (API Key)</label>
            <input 
              type="password" 
              placeholder="Ex: 7123456789:AAHk1_..."
              value={telegramConfig.botToken} 
              onChange={(e) => setTelegramConfig({ ...telegramConfig, botToken: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Seu Chat ID no Telegram</label>
            <input 
              type="text" 
              placeholder="Ex: 123456789"
              value={telegramConfig.chatId} 
              onChange={(e) => setTelegramConfig({ ...telegramConfig, chatId: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Ativar Disparos Automáticos de 5m</span>
              <span className="text-[11px] text-slate-400">Disparar alertas apenas quando o Score de Confluência for ≥ {telegramConfig.minScore}%</span>
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
