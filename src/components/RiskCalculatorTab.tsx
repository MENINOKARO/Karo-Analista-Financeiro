'use client';

import React from 'react';
import { DollarSign } from 'lucide-react';

interface RiskCalculatorTabProps {
  accountCapital: number;
  setAccountCapital: (val: number) => void;
  riskPercent: number;
  setRiskPercent: (val: number) => void;
  calcEntry: number;
  setCalcEntry: (val: number) => void;
  calcStop: number;
  setCalcStop: (val: number) => void;
  calcTarget1: number;
  setCalcTarget1: (val: number) => void;
  calcTarget2: number;
  setCalcTarget2: (val: number) => void;
}

export function RiskCalculatorTab({
  accountCapital,
  setAccountCapital,
  riskPercent,
  setRiskPercent,
  calcEntry,
  setCalcEntry,
  calcStop,
  setCalcStop,
  calcTarget1,
  setCalcTarget1,
  calcTarget2,
  setCalcTarget2
}: RiskCalculatorTabProps) {
  const riskAmount = (accountCapital * (riskPercent / 100));
  const riskPerShare = Math.max(0.01, Math.abs(calcEntry - calcStop));
  const sharesQuantity = Math.floor(riskAmount / riskPerShare);
  const positionValue = sharesQuantity * calcEntry;
  const target1Gain = sharesQuantity * Math.abs(calcTarget1 - calcEntry);
  const target2Gain = sharesQuantity * Math.abs(calcTarget2 - calcEntry);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#0d1322] border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Calculadora Institucional de Posição & Risco</h2>
            <p className="text-xs text-slate-400">Nunca arrisque mais do que sua meta institucional por trade (Gestão Mark Minervini / Alexander Elder)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Seu Capital Total na Corretora (R$)</label>
              <input 
                type="number" 
                value={accountCapital} 
                onChange={(e) => setAccountCapital(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono font-bold text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Risco Máximo Permitido por Trade: <span className="text-emerald-400 font-bold">{riskPercent}%</span> (R$ {riskAmount.toFixed(2)})
              </label>
              <input 
                type="range" 
                min="0.25" 
                max="3.0" 
                step="0.25" 
                value={riskPercent} 
                onChange={(e) => setRiskPercent(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Preço de Entrada (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={calcEntry} 
                  onChange={(e) => setCalcEntry(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-rose-400 mb-1">Stop Loss (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={calcStop} 
                  onChange={(e) => setCalcStop(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-rose-400 font-mono text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-emerald-400 mb-1">Alvo 1 (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={calcTarget1} 
                  onChange={(e) => setCalcTarget1(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-cyan-400 mb-1">Alvo 2 (R$)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={calcTarget2} 
                  onChange={(e) => setCalcTarget2(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-cyan-400 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Dimensionamento Exato de Lote:</h3>
            
            <div className="my-4 text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <span className="text-xs text-slate-400 block">Compre exatamente:</span>
              <span className="text-3xl font-extrabold text-emerald-400 font-mono">{sharesQuantity}</span>
              <span className="text-xs text-slate-300 font-medium"> Ações / Contratos</span>
              <span className="text-[11px] text-slate-500 block mt-1">Valor da Ordem: R$ {positionValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Risco Máximo se Stopar:</span>
                <span className="font-bold text-rose-400 font-mono">- R$ {riskAmount.toFixed(2)} (-{riskPercent}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lucro Estimado no Alvo 1:</span>
                <span className="font-bold text-emerald-400 font-mono">+ R$ {target1Gain.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lucro Estimado no Alvo 2:</span>
                <span className="font-bold text-cyan-400 font-mono">+ R$ {target2Gain.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
