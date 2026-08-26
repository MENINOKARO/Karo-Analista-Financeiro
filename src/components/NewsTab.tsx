'use client';

import React, { useState } from 'react';
import { Newspaper, TrendingUp, TrendingDown, ExternalLink, ShieldCheck, Tag, Filter, Search, RefreshCw, AlertTriangle, Sparkles, BookOpen } from 'lucide-react';
import { NewsItem } from '@/core/types';

interface NewsTabProps {
  news: NewsItem[];
  onSelectTicker?: (ticker: string) => void;
  onRefresh?: () => void;
}

export function NewsTab({ news, onSelectTicker, onRefresh }: NewsTabProps) {
  const [filterSentiment, setFilterSentiment] = useState<'ALL' | 'BULLISH' | 'BEARISH'>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const categories = [
    { id: 'ALL', label: 'Todas as Notícias' },
    { id: 'Recuperação Judicial & Crédito', label: '⚠️ Recuperações & Crédito' },
    { id: 'Resultados & Proventos', label: '💰 Resultados & Dividendos' },
    { id: 'Macroeconomia & Juros (Selic)', label: '🏛️ Macro & Juros' },
    { id: 'Commodities Globais', label: '🛢️ Commodities' },
    { id: 'Mercado Corporativo & Negócios', label: '🏢 Empresas & Negócios' }
  ];

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const filteredNews = news.filter(item => {
    if (filterSentiment !== 'ALL' && item.sentiment !== filterSentiment) return false;
    if (filterCategory !== 'ALL' && item.catalystTopic !== filterCategory) return false;
    
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(term);
      const matchSummary = item.summary.toLowerCase().includes(term);
      const matchTopic = item.catalystTopic.toLowerCase().includes(term);
      const matchTickers = item.relatedTickers.some(t => t.toLowerCase().includes(term));
      const matchSource = item.source.toLowerCase().includes(term);
      if (!matchTitle && !matchSummary && !matchTopic && !matchTickers && !matchSource) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header do Radar de Notícias */}
      <div className="bg-[#0d1322] border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-cyan-400" />
              Radar de Notícias, Economia & Mercado em Tempo Real
              <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono font-normal">
                {filteredNews.length} matérias ao vivo
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Varredura de portais oficiais (Valor Econômico, InfoMoney, G1 Economia, Reuters, Folha Mercado e Broadcast B3).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={handleRefreshClick}
                disabled={isRefreshing}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                Atualizar Feed
              </button>
            )}
          </div>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
          {/* Campo de Busca Livre */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por ativo ou tema (ex: Braskem, Selic, Vale, Dividendos...)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-medium"
            />
          </div>

          {/* Filtro por Sentimento */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
            <button 
              onClick={() => setFilterSentiment('ALL')}
              className={`flex-1 py-1 rounded-lg transition text-center ${filterSentiment === 'ALL' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilterSentiment('BULLISH')}
              className={`flex-1 py-1 rounded-lg transition text-center ${filterSentiment === 'BULLISH' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              🟢 Alta
            </button>
            <button 
              onClick={() => setFilterSentiment('BEARISH')}
              className={`flex-1 py-1 rounded-lg transition text-center ${filterSentiment === 'BEARISH' ? 'bg-rose-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              🔴 Queda / Risco
            </button>
          </div>

          {/* Filtro por Categoria */}
          <div className="md:col-span-1">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl focus:border-cyan-500 focus:outline-none"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Notícias Reais */}
      {filteredNews.length === 0 ? (
        <div className="bg-[#0d1322] border border-slate-800 p-12 rounded-2xl text-center space-y-3">
          <Newspaper className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">Nenhuma notícia encontrada com os filtros selecionados.</h3>
          <p className="text-xs text-slate-500">Tente buscar por termos mais genéricos ou limpe o campo de busca.</p>
          <button
            onClick={() => { setSearchTerm(''); setFilterSentiment('ALL'); setFilterCategory('ALL'); }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 rounded-xl border border-slate-700 transition"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNews.map((item) => {
            const isBull = item.sentiment === 'BULLISH';
            const isBear = item.sentiment === 'BEARISH';
            const isHighImpact = item.impactLevel === 'ALTO';

            return (
              <div 
                key={item.id}
                className="bg-[#0d1322] border border-slate-800 hover:border-slate-700 transition p-5 rounded-2xl flex flex-col justify-between shadow-lg"
              >
                <div>
                  {/* Metadados Superiores */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">
                        {item.source}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(item.publishedAt).toLocaleDateString('pt-BR')} às {new Date(item.publishedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isBull 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : isBear
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {isBull ? '▲ IMPACTO POSITIVO' : isBear ? '▼ RISCO / ALERTA' : '● NEUTRO / MACRO'}
                      </span>
                      {isHighImpact && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          🔥 ALTO
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Título da Notícia */}
                  <h3 className="text-sm font-bold text-white leading-snug mb-2">
                    {item.title}
                  </h3>

                  {/* Resumo Limpo */}
                  <p className="text-xs text-slate-300/90 leading-relaxed mb-4">
                    {item.summary}
                  </p>
                </div>

                {/* Botão de Link para Matéria Completa & Tags */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.relatedTickers.length > 0 ? (
                        <>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Tag className="w-3 h-3 text-cyan-400" /> Ações:
                          </span>
                          {item.relatedTickers.map((t, idx) => (
                            <button
                              key={idx}
                              onClick={() => onSelectTicker && onSelectTicker(t.includes('-') ? t : t + '.SA')}
                              className="px-2 py-0.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded text-[11px] font-mono font-bold transition"
                            >
                              {t}
                            </button>
                          ))}
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">
                          Economia & Mercado
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-400 italic bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {item.catalystTopic}
                    </span>
                  </div>

                  {/* BOTÃO LIMPO DE ACESSO À MATÉRIA */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-xl text-xs font-semibold text-cyan-300 flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Ler Notícia Completa no {item.source}
                    <ExternalLink className="w-3 h-3 text-slate-400 ml-1" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
