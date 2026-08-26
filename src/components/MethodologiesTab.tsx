'use client';

import React from 'react';

export function MethodologiesTab() {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-xl font-bold text-white">Metodologias Institucionais Integradas</h2>
        <p className="text-xs text-slate-400 mt-1">
          O MarketMaster AI sintetiza as 7 maiores escolas de análise técnica e fluxo institucional do mundo em um único motor matemático de confluência.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-[#0d1322] border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm">
              W
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Richard Wyckoff & VSA</h3>
              <span className="text-[10px] text-slate-500">Volume Spread Analysis</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Rastreia a pegada do 'Smart Money' identificando fases de Acumulação, Distribuição, Shakeouts (Spring) e Upthrusts com absorção de volume institucional.
          </p>
        </div>

        <div className="bg-[#0d1322] border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm">
              B
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Al Brooks Price Action</h3>
              <span className="text-[10px] text-slate-500">Price Action Puro</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Detecção de Barras de Tendência (Trend Bars), correções de 2 pernas (High 2 e Low 2), rompimentos e falhas de rompimento em micro-canais.
          </p>
        </div>

        <div className="bg-[#0d1322] border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
              M
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Mark Minervini SEPA</h3>
              <span className="text-[10px] text-slate-500">Volatility Contraction Pattern (VCP)</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Identifica contrações sucessivas de volatilidade com volume residual (seco) antes da explosão de rompimento no Ponto Pivô.
          </p>
        </div>

        <div className="bg-[#0d1322] border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
              V
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Oliver Velez</h3>
              <span className="text-[10px] text-slate-500">Elephant Bars & MMA20/200</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Uso das médias móveis de 20 e 200 períodos como localização mestra e gatilhos em Barras Elefante de ignição e Bottoming Tails.
          </p>
        </div>

        <div className="bg-[#0d1322] border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-sm">
              S
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Smart Money Concepts (SMC)</h3>
              <span className="text-[10px] text-slate-500">Fair Value Gaps & Liquidity</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Mapeamento de desbalanceamentos institucionais (FVG), quebra de estrutura (BOS), mudança de caráter (CHoCH) e captura de liquidez.
          </p>
        </div>

        <div className="bg-[#0d1322] border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-sm">
              E
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Alexander Elder Triple Screen</h3>
              <span className="text-[10px] text-slate-500">Múltiplos Tempos Gráficos (MTF)</span>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Sistema de 3 telas: Maré Macro (60m/Diário), Onda Intermediária de Pullback (15m) e Gatilho Cirúrgico de rompimento (5m).
          </p>
        </div>
      </div>
    </div>
  );
}
