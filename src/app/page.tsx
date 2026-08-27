'use client';

import React, { useState, useEffect } from 'react';
import { Zap, LineChart, DollarSign, Smartphone, Award, Newspaper, Target, BookOpen, Briefcase } from 'lucide-react';
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

export default function MarketMasterDashboard() {
  const [activeTab, setActiveTab] = useState<'goals' | 'portfolio' | 'radar' | 'news' | 'chart' | 'calculator' | 'brokers' | 'telegram' | 'methodologies'>('goals');
  const [marketData, setMarketData] = useState<MarketOverview | null>(null);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [scanning, setScanning] = useState<boolean>(false);
  const [filterAction, setFilterAction] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  
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
          fetchPortfolio();
        }
      } else {
        fetchPortfolio();
      }
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
        if (json.data.portfolioSummary) {
          setPortfolioSummary(json.data.portfolioSummary);
        }
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
      const res = await fetch(`/api/portfolio?userId=${targetUserId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setPortfolioSummary(json.data);
      }
    } catch (err) {
      console.error('Erro ao carregar carteira:', err);
    }
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    fetchPortfolio(user.id);
  };

  const handleLogout = () => {
    localStorage.removeItem('karo_user_session');
    setCurrentUser(null);
    fetchPortfolio('usr_demo');
  };

  const handleManualScan = async () => {
    try {
      setScanning(true);
      const res = await fetch('/api/scan', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setMarketData(json.data);
        if (json.data.portfolioSummary) {
          setPortfolioSummary(json.data.portfolioSummary);
        }
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
      if (json.success && json.config) {
        setTelegramConfig(json.config);
      }
    } catch (err) {
      console.error('Erro ao buscar configurações do Telegram:', err);
    }
  };

  const saveTelegramSettings = async () => {
    try {
      setTelegramSending(true);
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE_CONFIG', config: telegramConfig })
      });
      const json = await res.json();
      setTelegramStatusMsg(json.message || 'Configurações salvas com sucesso!');
    } catch (err: any) {
      setTelegramStatusMsg(`Erro: ${err.message}`);
    } finally {
      setTelegramSending(false);
    }
  };

  const sendTestTelegram = async () => {
    try {
      setTelegramSending(true);
      setTelegramStatusMsg('Enviando mensagem de teste para o celular...');
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TEST_NOTIFICATION', config: telegramConfig })
      });
      const json = await res.json();
      setTelegramStatusMsg(json.message);
    } catch (err: any) {
      setTelegramStatusMsg(`Falha no envio: ${err.message}`);
    } finally {
      setTelegramSending(false);
    }
  };

  const handleOpenChart = (symbol: string) => {
    setChartSymbol(symbol);
    setActiveTab('chart');
  };

  const handleOpenCalculator = (op: SeniorAnalysisResult) => {
    setCalcEntry(op.entryTrigger);
    setCalcStop(op.stopLoss);
    setCalcTarget1(op.target1);
    setCalcTarget2(op.target2);
    setActiveTab('calculator');
  };

  const handleFollowSignal = (op: SeniorAnalysisResult) => {
    fetchPortfolio();
    setActiveTab('portfolio');
  };

  const filteredOpportunities = (marketData?.topOpportunities || []).filter(op => {
    if (filterAction !== 'ALL' && op.action !== filterAction) return false;
    return true;
  });

  const topOp = (marketData?.topOpportunities && marketData.topOpportunities.length > 0) 
    ? marketData.topOpportunities[0] 
    : null;

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
            <DollarSign className="w-4 h-4" /> Calculadora de Risco
          </button>

          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'telegram' 
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" /> Alertas Telegram VIP
          </button>

          <button
            onClick={() => setActiveTab('methodologies')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
              activeTab === 'methodologies' 
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" /> 7 Escolas Institucionais
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'goals' && (
          <GoalsPlannerTab 
            topOpportunity={topOp}
            onOpenChart={handleOpenChart}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioTab 
            portfolioSummary={portfolioSummary}
            onRefresh={fetchPortfolio}
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
            onSelectTicker={(sym) => {
              setChartSymbol(sym);
              setActiveTab('chart');
            }}
            onRefresh={handleManualScan}
          />
        )}

        {activeTab === 'chart' && (
          <ChartTab
            chartSymbol={chartSymbol}
            setChartSymbol={setChartSymbol}
            chartTimeframe={chartTimeframe}
            setChartTimeframe={setChartTimeframe}
            chartLoading={chartLoading}
            chartData={chartData}
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
            onSave={saveTelegramSettings}
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

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={handleAuthSuccess} 
      />
    </div>
  );
}
