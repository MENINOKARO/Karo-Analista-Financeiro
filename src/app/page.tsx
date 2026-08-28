'use client';

import React, { useState, useEffect } from 'react';
import { Zap, LineChart, DollarSign, Smartphone, Award, Newspaper, Target, BookOpen, Briefcase, Lock, Sparkles, ShieldCheck } from 'lucide-react';
import { SeniorAnalysisResult, MarketOverview, TelegramConfig, PortfolioSummary } from '@/core/types';
import { Header } from '@/components/Header';
import { RadarTab } from '@/components/RadarTab';
import { ChartTab } from '@/components/ChartTab';
import { RiskCalculatorTab } from '@/components/RiskCalculatorTab';
import { TelegramTab } from '@/components/TelegramTab';
import { MethodologiesTab } from '@/components/MethodologiesTab';
import { NewsTab } from '@/components/NewsTab';
import { GoalsPlannerTab } from '@/components/GoalsPlannerTab';
import { BrokersTab } from '@/components/BrokersTab';
import { PortfolioTab } from '@/components/PortfolioTab';
import { DisclaimerModal } from '@/components/DisclaimerModal';
import { AuthModal } from '@/components/AuthModal';
import { UserProfileModal } from '@/components/UserProfileModal';

export default function MarketMasterDashboard() {
  const [activeTab, setActiveTab] = useState<'goals' | 'portfolio' | 'radar' | 'news' | 'chart' | 'calculator' | 'brokers' | 'telegram' | 'methodologies'>('goals');
  const [marketData, setMarketData] = useState<MarketOverview | null>(null);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [scanning, setScanning] = useState<boolean>(false);
  const [filterAction, setFilterAction] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  
  // Autenticação & Perfil de Usuário
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);
  
  // Gráficos
  const [chartSymbol, setChartSymbol] = useState<string>('PETR4.SA');
  const [chartTimeframe, setChartTimeframe] = useState<'5m' | '15m' | '60m' | '1d'>('5m');
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState<boolean>(false);

  // Calculadora de Risco
  const [accountCapital, setAccountCapital] = useState<number>(20000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [calcEntry, setCalcEntry] = useState<number>(38.80);
  const [calcStop, setCalcStop] = useState<number>(37.90);
  const [calcTarget1, setCalcTarget1] = useState<number>(40.50);
  const [calcTarget2, setCalcTarget2] = useState<number>(42.00);

  // Telegram Config
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>({
    botToken: '',
    chatId: '',
    enabled: true,
    minScore: 75
  });
  const [telegramStatusMsg, setTelegramStatusMsg] = useState<string>('');
  const [telegramSending, setTelegramSending] = useState<boolean>(false);

  useEffect(() => {
    // Carrega sessão de usuário persistida
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('karo_user_session');
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          setCurrentUser(u);
          fetchPortfolio(u.id);
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsAuthChecked(true);
    }
    fetchMarketScan();
    fetchTelegramSettings();
  }, []);

  useEffect(() => {
    fetchChartData(chartSymbol, chartTimeframe);
  }, [chartSymbol, chartTimeframe]);

  const fetchMarketScan = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/scan');
      const json = await res.json();
      if (json.success) {
        setMarketData(json.data);
      }
    } catch (err) {
      console.error('Erro ao buscar varredura:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolio = async (uid?: string) => {
    try {
      const targetUserId = uid || currentUser?.id || 'usr_demo';
      const localKey = `karo_portfolio_${targetUserId}`;
      const savedLocal = typeof window !== 'undefined' ? localStorage.getItem(localKey) : null;
      let localPositions = savedLocal ? JSON.parse(savedLocal) : null;

      const res = await fetch(`/api/portfolio?userId=${targetUserId}`);
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.positions && json.data.positions.length > 0) {
          setPortfolioSummary(json.data);
          if (typeof window !== 'undefined') {
            localStorage.setItem(localKey, JSON.stringify(json.data.positions));
          }
        } else if (localPositions && localPositions.length > 0) {
          // Servidor lambdas reiniciou -> recupera automaticamente do armazenamento do navegador
          const syncRes = await fetch('/api/portfolio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'SYNC_POSITIONS',
              userId: targetUserId,
              payload: { positions: localPositions }
            })
          });
          const syncJson = await syncRes.json();
          if (syncJson.success && syncJson.data) {
            setPortfolioSummary(syncJson.data);
          }
        } else {
          setPortfolioSummary(json.data);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar carteira:', err);
    }
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    fetchPortfolio(user.id);
  };

  const handleLogout = () => {
    localStorage.removeItem('karo_user_session');
    setCurrentUser(null);
    setIsProfileModalOpen(false);
  };

  const handleManualScan = async () => {
    try {
      setScanning(true);
      const res = await fetch('/api/scan', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setMarketData(json.data);
      }
    } catch (err) {
      console.error('Erro ao forçar varredura:', err);
    } finally {
      setScanning(false);
    }
  };

  const fetchChartData = async (symbol: string, interval: string) => {
    try {
      setChartLoading(true);
      const res = await fetch(`/api/market?symbol=${symbol}&interval=${interval}`);
      const json = await res.json();
      if (json.success) {
        setChartData(json.data);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do gráfico:', err);
    } finally {
      setChartLoading(false);
    }
  };

  const fetchTelegramSettings = async () => {
    try {
      const res = await fetch('/api/telegram');
      const json = await res.json();
      if (json.success && json.data) {
        setTelegramConfig(json.data);
      }
    } catch (err) {
      console.error('Erro ao carregar configs do Telegram:', err);
    }
  };

  const saveTelegramSettings = async (cfg: TelegramConfig) => {
    try {
      setTelegramSending(true);
      setTelegramStatusMsg('');
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE_CONFIG', config: cfg })
      });
      const json = await res.json();
      if (json.success) {
        setTelegramConfig(cfg);
        setTelegramStatusMsg('Configurações salvas com sucesso!');
      } else {
        setTelegramStatusMsg(`Erro: ${json.error || 'Não foi possível salvar'}`);
      }
    } catch (err: any) {
      setTelegramStatusMsg(`Erro de conexão: ${err.message}`);
    } finally {
      setTelegramSending(false);
    }
  };

  const sendTestTelegram = async () => {
    try {
      setTelegramSending(true);
      setTelegramStatusMsg('');
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SEND_TEST_MESSAGE' })
      });
      const json = await res.json();
      if (json.success) {
        setTelegramStatusMsg('Mensagem de teste enviada com sucesso no Telegram!');
      } else {
        setTelegramStatusMsg(`Falha no envio: ${json.error || 'Verifique Token e Chat ID'}`);
      }
    } catch (err: any) {
      setTelegramStatusMsg(`Erro de conexão: ${err.message}`);
    } finally {
      setTelegramSending(false);
    }
  };

  const handleOpenChart = (symbol: string) => {
    setChartSymbol(symbol);
    setActiveTab('chart');
  };

  const handleOpenCalculator = (op: SeniorAnalysisResult) => {
    setCalcEntry(op.currentPrice);
    setCalcStop(op.stopLoss);
    setCalcTarget1(op.target1);
    setCalcTarget2(op.target2);
    setActiveTab('calculator');
  };

  const handleFollowSignal = (op: SeniorAnalysisResult) => {
    fetchPortfolio(currentUser?.id);
    setActiveTab('portfolio');
  };

  const handleSelectStrategyFromGoals = (modality: 'OPTIONS' | 'SWING' | 'DAYTRADE') => {
    setActiveTab('radar');
  };

  const filteredOpportunities = (marketData?.topOpportunities || []).filter(op => {
    if (filterAction !== 'ALL' && op.action !== filterAction) return false;
    return true;
  });

  const topOp = (marketData?.topOpportunities && marketData.topOpportunities.length > 0) 
    ? marketData.topOpportunities[0] 
    : null;

  // ==================== TELA DE ACESSO OBRIGATÓRIO (AUTH GATE) ====================
  if (isAuthChecked && !currentUser) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between">
        <header className="border-b border-slate-800 bg-[#0d1322]/90 backdrop-blur px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">Karo Analista Financeiro</h1>
              <p className="text-xs text-slate-400">Inteligência Quantitativa & Opções B3 em Tempo Real</p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-600/20"
          >
            Entrar / Criar Conta
          </button>
        </header>

        {/* HERO DE APRESENTAÇÃO & BLOQUEIO DE ACESSO */}
        <main className="flex-1 flex items-center justify-center p-6 text-center max-w-4xl mx-auto">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" /> Plataforma Restrita para Usuários Cadastrados
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Análise Quantitativa Institucional & <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                Opções Reais B3 de Alto Retorno
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Scanner contínuo de 5 minutos alimentado por 7 escolas clássicas (Oliver Velez, Wyckoff, Al Brooks, Minervini, SMC, Elder e Williams) com gestão de risco milimétrica e precificação real da Clear e B3.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-600/30 transition transform hover:scale-105 flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
                Acessar a Plataforma Agora
              </button>
            </div>
          </div>
        </main>

        <footer className="border-t border-slate-800/80 bg-[#090d16] py-4 text-center text-xs text-slate-500">
          <p>Karo Analista Financeiro • Ambiente Seguro e Criptografado</p>
        </footer>

        {/* Modal de Login / Cadastro / Recuperação de Senha / Demo */}
        <AuthModal 
          isOpen={true} 
          onClose={() => {}} 
          onAuthSuccess={handleAuthSuccess} 
          isMandatory={true} 
        />
      </div>
    );
  }

  // ==================== DASHBOARD COMPLETO (LIBERADO APÓS LOGIN) ====================
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <DisclaimerModal />
      
      <header className="border-b border-slate-800 bg-[#0d1322]/90 backdrop-blur sticky top-0 z-50">
        <Header 
          marketData={marketData} 
          scanning={scanning} 
          onManualScan={handleManualScan} 
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onLogout={handleLogout}
        />

        <div className="max-w-7xl mx-auto px-4 flex gap-2 border-t border-slate-800/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'goals' 
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-4 h-4 text-emerald-400" /> Suas Metas (3 Opções)
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'portfolio' 
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4 text-emerald-400" /> Minha Carteira & Posições
            {portfolioSummary && portfolioSummary.positions.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
                {portfolioSummary.positions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'radar' 
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" /> Radar 5m (B3 & Cripto)
            {filteredOpportunities.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
                {filteredOpportunities.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'news' 
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Newspaper className="w-4 h-4 text-cyan-400" /> Notícias & Catalisadores
            {marketData?.latestNews && marketData.latestNews.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px]">
                {marketData.latestNews.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('chart')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'chart' 
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LineChart className="w-4 h-4" /> Gráficos Didáticos (Leigos)
          </button>

          <button
            onClick={() => setActiveTab('brokers')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'brokers' 
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-cyan-400" /> Corretoras & Aulas
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'calculator' 
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" /> Calculadora de Risco (1%)
          </button>

          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'telegram' 
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-cyan-400" /> Alertas Telegram
          </button>

          <button
            onClick={() => setActiveTab('methodologies')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'methodologies' 
                ? 'border-purple-400 text-purple-400 bg-purple-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4 text-purple-400" /> 7 Metodologias
          </button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL DO DASHBOARD */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'goals' && (
          <GoalsPlannerTab
            topOpportunity={topOp}
            onOpenChart={handleOpenChart}
            onSelectStrategy={handleSelectStrategyFromGoals}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioTab
            portfolioSummary={portfolioSummary}
            onRefresh={() => fetchPortfolio(currentUser?.id)}
            onOpenChart={handleOpenChart}
          />
        )}

        {activeTab === 'radar' && (
          <RadarTab
            loading={loading}
            filteredOpportunities={filteredOpportunities}
            filterAction={filterAction}
            setFilterAction={setFilterAction}
            onOpenChart={handleOpenChart}
            onOpenCalculator={handleOpenCalculator}
            onFollowSignal={handleFollowSignal}
          />
        )}

        {activeTab === 'news' && (
          <NewsTab
            news={marketData?.latestNews || []}
            onSelectTicker={handleOpenChart}
          />
        )}

        {activeTab === 'chart' && (
          <ChartTab
            chartSymbol={chartSymbol}
            setChartSymbol={setChartSymbol}
            chartTimeframe={chartTimeframe}
            setChartTimeframe={setChartTimeframe}
            chartData={chartData}
            chartLoading={chartLoading}
          />
        )}

        {activeTab === 'brokers' && (
          <BrokersTab />
        )}

        {activeTab === 'calculator' && (
          <RiskCalculatorTab
            accountCapital={accountCapital}
            setAccountCapital={setAccountCapital}
            riskPercent={riskPercent}
            setRiskPercent={setRiskPercent}
            calcEntry={calcEntry}
            setCalcEntry={setCalcEntry}
            calcStop={calcStop}
            setCalcStop={setCalcStop}
            calcTarget1={calcTarget1}
            setCalcTarget1={setCalcTarget1}
            calcTarget2={calcTarget2}
            setCalcTarget2={setCalcTarget2}
          />
        )}

        {activeTab === 'telegram' && (
          <TelegramTab
            telegramConfig={telegramConfig}
            setTelegramConfig={setTelegramConfig}
            telegramStatusMsg={telegramStatusMsg}
            telegramSending={telegramSending}
            onSave={() => saveTelegramSettings(telegramConfig)}
            onTest={sendTestTelegram}
          />
        )}

        {activeTab === 'methodologies' && (
          <MethodologiesTab />
        )}
      </main>

      <footer className="border-t border-slate-800/80 bg-[#090d16] py-4 text-center text-xs text-slate-500">
        <p>Karo Analista Financeiro • Gestão de Carteira Ativa, Mercado B3 & Criptomoedas 24/7 com Risco Controlado</p>
      </footer>

      {/* Modais Globais */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={handleAuthSuccess} 
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        portfolioSummary={portfolioSummary}
        onUpdateUser={(u) => setCurrentUser(u)}
        onLogout={handleLogout}
      />
    </div>
  );
}