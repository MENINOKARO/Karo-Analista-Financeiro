'use client';

import React from 'react';
import { Zap, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { MarketOverview } from '@/core/types';

interface HeaderProps {
  marketData: MarketOverview | null;
  scanning: boolean;
  onManualScan: () => void;
  currentUser?: any;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export function Header({ marketData, scanning, onManualScan, currentUser, onOpenAuthModal, onLogout }: HeaderProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              Karo Analista Financeiro
            </h1>
            <span className="text-[10px] uppercase font-semibold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Senior Analyst Pro
            </span>
          </div>
          <p className="text-xs text-slate-400">Scanner Contínuo 5m & Inteligência Institucional Confluente</p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6 text-xs bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Regime Geral:</span>
          <span className="font-semibold text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> {marketData?.marketRegime || 'BULLISH'}
          </span>
        </div>
        <div className="w-px h-4 bg-slate-700"></div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">IBOV Confluência:</span>
          <span className="font-semibold text-cyan-400">{marketData?.ibovScore || 82}%</span>
        </div>
        <div className="w-px h-4 bg-slate-700"></div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Varredura:</span>
          <span className="text-slate-200 font-mono flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> A cada 5 min
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {currentUser ? (
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <div className="w-6 h-6 rounded-full bg-cyan-600/30 border border-cyan-400/50 flex items-center justify-center text-cyan-300 font-bold text-[11px]">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-white font-semibold block text-[11px] leading-tight truncate max-w-[110px]">
                {currentUser.name}
              </span>
              <span className="text-[9px] text-cyan-400 block font-mono">
                {currentUser.plan || 'PRO'}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-400 text-[10px] font-semibold ml-1 transition"
              title="Sair da Conta"
            >
              Sair
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition"
          >
            Entrar / Cadastrar
          </button>
        )}

        <button 
          onClick={onManualScan}
          disabled={scanning}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-medium text-xs shadow-lg shadow-emerald-600/25 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Escaneando...' : 'Escanear Mercado'}
        </button>
      </div>
    </div>
  );
}
