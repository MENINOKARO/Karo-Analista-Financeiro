import cron from 'node-cron';
import { MarketScannerEngine } from '../core/scanner';

console.log('===========================================================');
console.log('🚀 [MARKETMASTER AI - B3] INICIANDO SCANNER INSTITUCIONAL');
console.log('⏱️ Frequência de Varredura: A cada 5 minutos (*/5 * * * *)');
console.log('🇧🇷 Mercado: 100% Ações Brasileiras (B3 / Ibovespa)');
console.log('💼 Modalidades: Ações (Swing), Day Trade 5m & Opções Estruturadas');
console.log('📰 Noticiário: Ingestão de Catalisadores em Tempo Real');
console.log('===========================================================');

async function runCycle() {
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  console.log(`\n[${timestamp}] 🔄 Executando ciclo de varredura B3 + Notícias...`);
  try {
    const overview = await MarketScannerEngine.executeFullScan();
    console.log(`[${timestamp}] ✅ Varredura finalizada. Regime de Mercado: ${overview.marketRegime}`);
    console.log(`[${timestamp}] 🎯 Oportunidades B3 com Alto Score: ${overview.topOpportunities.length}`);
    console.log(`[${timestamp}] 📰 Notícias e Fatos Relevantes Processados: ${overview.latestNews.length}`);

    overview.topOpportunities.forEach((op, index) => {
      console.log(`\n  ${index + 1}. [${op.action}] ${op.ticker} (${op.name}) | Score: ${op.confluenceScore}%`);
      console.log(`     Setup: ${op.setupTitle}`);
      console.log(`     📊 Swing Trade: Entrada R$ ${op.swingTrade.entryPrice} | Stop R$ ${op.swingTrade.stopLoss} (-${op.swingTrade.stopLossPercent}%) | Alvo 1 R$ ${op.swingTrade.target1} (+${op.swingTrade.target1Percent}%) | R:R ${op.swingTrade.riskRewardRatio}:1`);
      console.log(`     ⚡ Day Trade 5m: Gatilho R$ ${op.dayTrade.entryTrigger} | Stop R$ ${op.dayTrade.stopLoss} (-${op.dayTrade.stopLossPercent}%) | Alvo R$ ${op.dayTrade.target1} (+${op.dayTrade.target1Percent}%) | R:R ${op.dayTrade.riskRewardRatio}:1`);
      console.log(`     💎 Opções B3: ${op.optionsTrade.structureName} | Custo R$ ${op.optionsTrade.estimatedCostPerUnit} | Risco: ${op.optionsTrade.maxRiskDescription}`);
      if (op.recentCatalysts && op.recentCatalysts.length > 0) {
        console.log(`     📰 Catalisador Notícia: ${op.recentCatalysts.join(', ')}`);
      }
    });
  } catch (err: any) {
    console.error(`[${timestamp}] ❌ Erro durante a varredura:`, err.message);
  }
}

// Executa ciclo imediato na inicialização
runCycle();

// Agenda para rodar a cada 5 minutos
cron.schedule('*/5 * * * *', () => {
  runCycle();
});
