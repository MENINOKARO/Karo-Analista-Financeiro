'use client';

import React, { useState } from 'react';
import { RefreshCw, Info, HelpCircle, TrendingUp, ShieldCheck, Target, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';

interface ChartTabProps {
  chartSymbol: string;
  setChartSymbol: (s: string) => void;
  chartTimeframe: '5m' | '15m' | '60m' | '1d';
  setChartTimeframe: (tf: '5m' | '15m' | '60m' | '1d') => void;
  chartLoading: boolean;
  chartData: any[];
}

export function ChartTab({
  chartSymbol,
  setChartSymbol,
  chartTimeframe,
  setChartTimeframe,
  chartLoading,
  chartData
}: ChartTabProps) {
  const [showDidacticGuide, setShowDidacticGuide] = useState<boolean>(true);

  // Calcula valores de referência para desenhar as linhas de Entrada, Stop e Alvo no gráfico
  const lastPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : 38.80;
  const entryLevel = Number(lastPrice.toFixed(2));
  const stopLevel = Number((lastPrice * 0.975).toFixed(2));
  const target1Level = Number((lastPrice * 1.035).toFixed(2));
  const target2Level = Number((lastPrice * 1.065).toFixed(2));

  return (
    <div className="space-y-6">
      {/* HEADER E CONTROLES DO GRÁFICO */}
      <div className="bg-[#0d1322] border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-300">Escolha a Ação da B3:</span>
            <select 
              value={chartSymbol} 
              onChange={(e) => setChartSymbol(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white font-bold text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
            >
              <optgroup label="Petróleo, Gás & Mineração">
                <option value="PETR4.SA">PETR4 - Petrobras PN</option>
                <option value="VALE3.SA">VALE3 - Vale ON</option>
                <option value="PRIO3.SA">PRIO3 - PRIO ON</option>
                <option value="CSNA3.SA">CSNA3 - CSN ON</option>
                <option value="GGBR4.SA">GGBR4 - Gerdau PN</option>
              </optgroup>
              <optgroup label="Bancos & Financeiro">
                <option value="ITUB4.SA">ITUB4 - Itaú Unibanco PN</option>
                <option value="BBDC4.SA">BBDC4 - Bradesco PN</option>
                <option value="BBAS3.SA">BBAS3 - Banco do Brasil ON</option>
                <option value="B3SA3.SA">B3SA3 - B3 ON</option>
              </optgroup>
              <optgroup label="Indústria, Energia & Infra">
                <option value="WEGE3.SA">WEGE3 - WEG ON</option>
                <option value="EMBR3.SA">EMBR3 - Embraer ON</option>
                <option value="ELET3.SA">ELET3 - Eletrobras ON</option>
                <option value="CPLE6.SA">CPLE6 - Copel PNB</option>
                <option value="SBSP3.SA">SBSP3 - Sabesp ON</option>
              </optgroup>
              <optgroup label="Varejo, Saúde & Serviços">
                <option value="RENT3.SA">RENT3 - Localiza ON</option>
                <option value="MGLU3.SA">MGLU3 - Magazine Luiza ON</option>
                <option value="LREN3.SA">LREN3 - Lojas Renner ON</option>
                <option value="RADL3.SA">RADL3 - RaiaDrogasil ON</option>
                <option value="ABEV3.SA">ABEV3 - Ambev ON</option>
              </optgroup>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Tempo da Barra:</span>
            <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
              {(['5m', '15m', '60m', '1d'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf)}
                  className={`px-3 py-1 rounded-md transition ${chartTimeframe === tf ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  {tf === '5m' ? '5 MIN (Day Trade)' : tf === '15m' ? '15 MIN' : tf === '60m' ? '60 MIN (Horário)' : 'DIÁRIO (Swing)'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowDidacticGuide(!showDidacticGuide)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
              showDidacticGuide 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            {showDidacticGuide ? 'Ocultar Guia para Leigos' : 'Ver Explicação das Linhas (Para Leigos)'}
          </button>
        </div>

        {/* GUIA DESCOMPLICADO DAS LINHAS (PARA PESSOAS LEIGAS) */}
        {showDidacticGuide && (
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl mb-5 text-xs">
            <div className="font-bold text-slate-200 mb-2 flex items-center gap-1.5 text-sm">
              <Info className="w-4 h-4 text-cyan-400" />
              Como entender as linhas deste gráfico de forma simples e descomplicada:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-[#0b0f19] border border-cyan-500/30 p-3 rounded-lg">
                <div className="flex items-center gap-1.5 font-bold text-cyan-400 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                  Linha Azul: Preço Atual
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Mostra exatamente o valor da ação a cada 5 minutos. Se ela estiver subindo, os compradores estão ganhando.
                </p>
              </div>

              <div className="bg-[#0b0f19] border border-emerald-500/30 p-3 rounded-lg">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  Linha Verde: Média dos Bancos (VWAP)
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Mostra onde os grandes bancos e fundos compraram hoje. <strong>Regra de ouro:</strong> Se o preço está acima da linha verde, é momento de comprar.
                </p>
              </div>

              <div className="bg-[#0b0f19] border border-amber-500/30 p-3 rounded-lg">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  Linha Amarela: Impulso Rápido (Média 9)
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Indica a força do movimento imediato. Quando aponta para cima, o ativo está ganhando velocidade de alta.
                </p>
              </div>

              <div className="bg-[#0b0f19] border border-purple-500/30 p-3 rounded-lg">
                <div className="flex items-center gap-1.5 font-bold text-purple-400 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                  Linha Roxa: Equilíbrio Seguro (Média 20)
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Linha de equilíbrio institucional. Comprar perto da linha roxa garante a você a menor perda possível se algo der errado.
                </p>
              </div>
            </div>

            {/* Marcadores de Operação */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Linhas Automáticas de Trade:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  🎯 Entrada: R$ {entryLevel.toFixed(2)}
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  🛑 Stop Proteção: R$ {stopLevel.toFixed(2)}
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  🚀 Alvo Lucro: R$ {target1Level.toFixed(2)}
                </span>
              </div>
              <span className="text-slate-500 italic">Preços calibrados automaticamente com gestão de risco 3.5 : 1</span>
            </div>
          </div>
        )}

        {/* ÁREA DO GRÁFICO INTERATIVO */}
        {chartLoading ? (
          <div className="h-[420px] flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : (
          <div className="h-[440px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 11 }} orientation="right" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                
                {/* Linhas de Preço e Médias */}
                <Line type="monotone" dataKey="close" stroke="#38bdf8" strokeWidth={2.5} dot={false} name="Preço da Ação" />
                <Line type="monotone" dataKey="ema9" stroke="#fbbf24" strokeWidth={1.5} dot={false} name="Média Rápida (9)" />
                <Line type="monotone" dataKey="ema20" stroke="#c084fc" strokeWidth={1.5} dot={false} name="Média Equilíbrio (20)" />
                <Line type="monotone" dataKey="vwap" stroke="#34d399" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Média dos Bancos (VWAP)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
