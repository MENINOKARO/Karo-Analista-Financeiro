'use client';

import React, { useState } from 'react';
import { Building2, BookOpen, Video, Award, CheckCircle2, ShieldCheck, ChevronRight } from 'lucide-react';
import { BROKERS_DATABASE } from '@/core/brokers-knowledge';
import { BrokerType } from '@/core/types';

export function BrokersTab() {
  const [selectedBrokerKey, setSelectedBrokerKey] = useState<BrokerType>('CLEAR');
  const currentBroker = BROKERS_DATABASE[selectedBrokerKey];

  return (
    <div className="space-y-6">
      {/* HEADER DA CENTRAL DE ENSINAMENTOS DAS CORRETORAS */}
      <div className="bg-[#0d1322] border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Central de Ensinamentos & Aulas das Principais Corretoras</h2>
            <p className="text-xs text-slate-400">
              Síntese dos melhores professores, analistas chefes e métodos ensinados na Clear, XP, BTG, Rico, Genial e Toro.
            </p>
          </div>
        </div>

        {/* SELETOR DE CORRETORA */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-6">
          {(Object.keys(BROKERS_DATABASE) as BrokerType[]).slice(0, 6).map((bKey) => {
            const b = BROKERS_DATABASE[bKey];
            const isSel = selectedBrokerKey === bKey;

            return (
              <button
                key={bKey}
                onClick={() => setSelectedBrokerKey(bKey)}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                  isSel 
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 ring-2 ring-cyan-500/20' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="text-xs font-bold">{b.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* DETALHES DA CORRETORA SELECIONADA */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {currentBroker.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{currentBroker.popularFor}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                {currentBroker.brokerageFee}
              </span>
            </div>
          </div>

          {/* AULAS E ENSINAMENTOS DOS PROFESSORES */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Video className="w-4 h-4 text-amber-400" />
              Metodologias e Aulas dos Melhores Professores:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentBroker.lessons.map((lesson, idx) => (
                <div key={idx} className="bg-[#0b0f19] border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white text-xs">{lesson.teacher}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-medium">{lesson.role}</span>
                  </div>

                  <div className="text-xs font-semibold text-cyan-300">
                    📚 Conceito: {lesson.coreConcept}
                  </div>

                  <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg text-[11px] text-slate-300 leading-relaxed">
                    <strong className="text-amber-400 block mb-0.5">🎯 Regra de Ouro Prática:</strong>
                    "{lesson.practicalRule}"
                  </div>

                  <div className="text-[10px] text-slate-500 italic">
                    Origem: {lesson.videoOrCourseTopic}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GUIA DE COMO ENVIAR ORDENS NESSA CORRETORA */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Passo a Passo de Envio de Ordens na {currentBroker.name}:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#0b0f19] border border-slate-800 p-3.5 rounded-xl space-y-2">
                <span className="font-bold text-emerald-400 block">📊 Como Comprar Ações (Swing):</span>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {currentBroker.orderStepsGuide.swingTrade.map((step, sIdx) => (
                    <li key={sIdx} className="leading-snug">{step}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0b0f19] border border-slate-800 p-3.5 rounded-xl space-y-2">
                <span className="font-bold text-cyan-400 block">⚡ Como Fazer Day Trade:</span>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {currentBroker.orderStepsGuide.dayTrade.map((step, sIdx) => (
                    <li key={sIdx} className="leading-snug">{step}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#0b0f19] border border-slate-800 p-3.5 rounded-xl space-y-2">
                <span className="font-bold text-purple-400 block">💎 Como Montar Opções:</span>
                <ul className="space-y-1 text-[11px] text-slate-300">
                  {currentBroker.orderStepsGuide.options.map((step, sIdx) => (
                    <li key={sIdx} className="leading-snug">{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
