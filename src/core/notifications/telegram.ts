import axios from 'axios';
import { SeniorAnalysisResult, TelegramConfig, ActivePosition, NewsItem } from '../types';

export class TelegramNotificationService {
  private static lastSentSignals: Map<string, number> = new Map();
  private static lastSentAlerts: Map<string, number> = new Map();

  // 1. ALERTA DE NOVA OPORTUNIDADE DO RADAR
  public static async sendSeniorSignalAlert(
    signal: SeniorAnalysisResult,
    config: TelegramConfig
  ): Promise<boolean> {
    if (!config.enabled || !config.botToken || !config.chatId) {
      return false;
    }

    if (config.notifyOpportunities === false) {
      return false;
    }

    if (signal.confluenceScore < config.minScore) {
      return false;
    }

    const now = Date.now();
    const lastSent = this.lastSentSignals.get(signal.ticker);
    if (lastSent && (now - lastSent) < 15 * 60 * 1000) {
      return false;
    }

    const directionEmoji = signal.action === 'BUY' ? '🟢 COMPRA (LONG / CALL)' : '🔴 VENDA (SHORT / PUT)';
    const scoreBadge = (signal.probabilityUp && signal.probabilityUp >= 80) || (signal.probabilityDown && signal.probabilityDown >= 80)
      ? '🏆 OPORTUNIDADE OURO'
      : signal.confluenceScore >= 90 ? '⭐⭐⭐ EXCEPCIONAL' : '⭐⭐ ALTA PROBABILIDADE';
    const opt = signal.optionsTrade;
    const marketBadge = signal.market === 'CRYPTO' ? '🪙 CRIPTO 24/7' : '🇧🇷 B3 BRASIL';
    const probDisplay = signal.action === 'BUY'
      ? `🟢 *Probabilidade Alta (5m):* *${signal.probabilityUp || signal.confluenceScore}%* | Queda: ${signal.probabilityDown || (100 - signal.confluenceScore)}%`
      : `🔴 *Probabilidade Queda (5m):* *${signal.probabilityDown || signal.confluenceScore}%* | Alta: ${signal.probabilityUp || (100 - signal.confluenceScore)}%`;

    const message = `
🚨 *[NOVA OPORTUNIDADE SENIOR]* 🚨
━━━━━━━━━━━━━━━━━━━━
📊 *Mercado:* *${marketBadge}*
📈 *Ativo:* \`${signal.ticker}\` (${signal.name})
🧭 *Direção:* *${directionEmoji}*
📊 *Score Confluência:* *${signal.confluenceScore}%* (${scoreBadge})
🎯 *${probDisplay}*
📡 *Fontes de Dados:* _TradingView B3 • Opções.net.br • B3_
🎯 *Setup:* *${signal.setupTitle}*
${signal.recentCatalysts && signal.recentCatalysts.length > 0 ? `📰 *Noticiário:* _${signal.recentCatalysts.join(', ')}_\n` : ''}
━━━━━━━━━━━━━━━━━━━━
💼 *3 OPÇÕES DE EXECUÇÃO:*

1️⃣ *AÇÕES / SPOT (SWING):*
• Entrada: \`R$ ${signal.swingTrade.entryPrice.toFixed(2)}\` | Stop: \`R$ ${signal.swingTrade.stopLoss.toFixed(2)}\` (-${signal.swingTrade.stopLossPercent}%)
• Alvo 1: \`R$ ${signal.swingTrade.target1.toFixed(2)}\` (+${signal.swingTrade.target1Percent}%) | Alvo 2: \`R$ ${signal.swingTrade.target2.toFixed(2)}\` (+${signal.swingTrade.target2Percent}%)

2️⃣ *DAY TRADE 5m:*
• Gatilho: \`R$ ${signal.dayTrade.entryTrigger.toFixed(2)}\` | Stop Curto: \`R$ ${signal.dayTrade.stopLoss.toFixed(2)}\` (-${signal.dayTrade.stopLossPercent}%)
• Alvo Day Trade: \`R$ ${signal.dayTrade.target1.toFixed(2)}\` (+${signal.dayTrade.target1Percent}%)

3️⃣ *OPÇÕES (RISCO LIMITADO):*
• Estrutura: *${opt.structureName}*
• Sugestão: \`${opt.suggestedTicker}\`
• 🛡️ *Risco Máximo:* _${opt.maxRiskDescription}_
• 🚀 *Ganho:* _${opt.maxProfitDescription}_

━━━━━━━━━━━━━━━━━━━━
🧠 *TESE DO ANALISTA SÊNIOR:*
"${signal.seniorThesis}"

━━━━━━━━━━━━━━━━━━━━
📲 *Abra o App e clique em "Entrei no Trade" para o robô acompanhar sua operação ao vivo!*
    `.trim();

    try {
      const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
      await axios.post(url, {
        chat_id: config.chatId,
        text: message,
        parse_mode: 'Markdown'
      });

      this.lastSentSignals.set(signal.ticker, now);
      return true;
    } catch (err: any) {
      console.error(`[Telegram] Erro ao enviar sinal: ${err?.response?.data?.description || err?.message}`);
      return false;
    }
  }

  // 2. ALERTA DE PROXIMIDADE DO STOP LOSS
  public static async sendStopProximityAlert(
    pos: ActivePosition,
    config: TelegramConfig
  ): Promise<boolean> {
    if (!config.enabled || !config.botToken || !config.chatId || config.notifyStopProximity === false) {
      return false;
    }

    const key = `stop_prox_${pos.id}`;
    const now = Date.now();
    const last = this.lastSentAlerts.get(key);
    if (last && (now - last) < 20 * 60 * 1000) return false; // Evita spam

    const distPct = (((pos.currentPrice - pos.stopLoss) / pos.currentPrice) * 100).toFixed(2);

    const message = `
⚠️ *[ALERTA DE RISCO: PROXIMIDADE DE STOP LOSS]* ⚠️
━━━━━━━━━━━━━━━━━━━━
📈 *Ativo na sua Carteira:* \`${pos.ticker}\` (${pos.name})
💰 *Preço de Compra:* \`R$ ${pos.entryPrice.toFixed(2)}\`
📊 *Cotação Atual:* \`R$ ${pos.currentPrice.toFixed(2)}\`
🛑 *Stop Loss Definido:* \`R$ ${pos.stopLoss.toFixed(2)}\`
📉 *Distância do Stop:* *${distPct}%*

━━━━━━━━━━━━━━━━━━━━
🧠 *ORIENTAÇÃO DO ROBÔ:*
"O preço do ativo está a apenas ${distPct}% do seu Stop Loss. O robô recomenda ficar atento para respeitar o gerenciamento de risco e proteger seu capital."

━━━━━━━━━━━━━━━━━━━━
📱 *Acesse sua Carteira para acompanhar ou finalizar a operação.*
    `.trim();

    try {
      const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
      await axios.post(url, { chat_id: config.chatId, text: message, parse_mode: 'Markdown' });
      this.lastSentAlerts.set(key, now);
      return true;
    } catch (err: any) {
      return false;
    }
  }

  // 3. ALERTA DE ALVO ATINGIDO & ACOMPANHAMENTO ATIVO
  public static async sendFollowUpAlert(
    pos: ActivePosition,
    eventType: 'BREAKEVEN' | 'ALVO_1' | 'ALVO_FINAL' | 'STOP_LOSS',
    config: TelegramConfig
  ): Promise<boolean> {
    if (!config.enabled || !config.botToken || !config.chatId || config.notifyTargets === false) {
      return false;
    }

    const key = `follow_${pos.id}_${eventType}`;
    const now = Date.now();
    const last = this.lastSentAlerts.get(key);
    if (last && (now - last) < 30 * 60 * 1000) return false;

    let title = '🔔 [ATUALIZAÇÃO DE TRADE EM ANDAMENTO]';
    let icon = '⚡';

    if (eventType === 'BREAKEVEN') {
      title = '🛡️ [PROTEÇÃO DE CAPITAL: RISCO ZERO ATIVADO]';
      icon = '🛡️';
    } else if (eventType === 'ALVO_1') {
      title = '🎯 [ALVO 1 ATINGIDO: REALIZE 50% DO LUCRO]';
      icon = '💰';
    } else if (eventType === 'ALVO_FINAL') {
      title = '🚀 [ALVO FINAL ATINGIDO: LUCRO MÁXIMO]';
      icon = '🏆';
    } else if (eventType === 'STOP_LOSS') {
      title = '🛑 [STOP LOSS EXECUTADO: CAPITAL PROTEGIDO]';
      icon = '🛑';
    }

    const pnlSign = pos.pnlAmount >= 0 ? '+' : '';
    const message = `
${icon} *${title}* ${icon}
━━━━━━━━━━━━━━━━━━━━
📈 *Ativo na sua Carteira:* \`${pos.ticker}\` (${pos.name})
💰 *Preço de Compra:* \`R$ ${pos.entryPrice.toFixed(2)}\`
📊 *Cotação Atual:* \`R$ ${pos.currentPrice.toFixed(2)}\`
💵 *Resultado Atual:* *${pnlSign}R$ ${pos.pnlAmount.toFixed(2)} (${pnlSign}${pos.pnlPercent}%)*

━━━━━━━━━━━━━━━━━━━━
🧠 *ORIENTAÇÃO DO SEU ROBÔ ANALISTA:*
"${pos.robotAdvice}"

━━━━━━━━━━━━━━━━━━━━
📱 *Acesse sua aba "Minha Carteira" no App para gerenciar a posição.*
    `.trim();

    try {
      const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
      await axios.post(url, {
        chat_id: config.chatId,
        text: message,
        parse_mode: 'Markdown'
      });
      this.lastSentAlerts.set(key, now);
      return true;
    } catch (err: any) {
      console.error(`[Telegram Follow-up] Erro: ${err?.message}`);
      return false;
    }
  }

  // 4. ALERTA DE NOTÍCIAS DE ALTO IMPACTO NO MERCADO
  public static async sendMarketNewsAlert(
    news: NewsItem,
    config: TelegramConfig
  ): Promise<boolean> {
    if (!config.enabled || !config.botToken || !config.chatId || config.notifyNews === false) {
      return false;
    }

    const key = `news_${news.id}`;
    const now = Date.now();
    const last = this.lastSentAlerts.get(key);
    if (last && (now - last) < 60 * 60 * 1000) return false;

    const message = `
📰 *[NOTÍCIA URGENTE: MUDANÇA DE MERCADO]* 📰
━━━━━━━━━━━━━━━━━━━━
⚡ *${news.title}*
🏛️ *Fonte:* ${news.source} • ${news.publishedAt}
📊 *Impacto:* *${news.impactLevel === 'ALTO' ? '🔥 ALTO IMPACTO (IBOV/AÇÕES)' : '⚡ RELEVANTE'}*

📝 *Resumo & Implicações:*
"${news.summary}"

━━━━━━━━━━━━━━━━━━━━
🧭 *Fique atento à volatilidade nas suas posições ativas.*
    `.trim();

    try {
      const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
      await axios.post(url, { chat_id: config.chatId, text: message, parse_mode: 'Markdown' });
      this.lastSentAlerts.set(key, now);
      return true;
    } catch (err: any) {
      return false;
    }
  }

  public static async sendTestNotification(config: TelegramConfig): Promise<{ success: boolean; message: string }> {
    const botToken = config.botToken || '8870401097:AAGStWSy-NzsnMZKVL_VTaCUErqV116DTvM';
    const cleanChatId = (config.chatId || '').trim().replace(/[^0-9-]/g, '');

    if (!cleanChatId) {
      return { success: false, message: 'Por favor, informe o seu Chat ID numérico (ex: 5719851150).' };
    }

    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const testMsg = `
🤖 *[CONEXÃO B3 + TELEGRAM + CARTEIRA ATIVA]*
━━━━━━━━━━━━━━━━━━━━
✅ Olá! A sua conexão com o *Karo Analista Financeiro* foi ativada com sucesso!

📡 *Canais Habilitados no seu Celular:*
• ⚡ Novas Oportunidades do Radar (Score ≥ ${config.minScore || 75}%)
• ⚠️ Alertas de Proximidade de Stop Loss das suas ações
• 🎯 Alertas de Alcance de Alvo 1 e Alvo 2
• 📰 Notícias Relevantes e Catalisadores B3

Bons trades com risco controlado! 🚀
      `.trim();

      await axios.post(url, {
        chat_id: cleanChatId,
        text: testMsg,
        parse_mode: 'Markdown'
      });

      return { success: true, message: '✅ Notificação de teste enviada com sucesso para o seu celular!' };
    } catch (err: any) {
      const desc = err?.response?.data?.description || err?.message;
      if (desc && desc.includes('chat not found')) {
        return {
          success: false,
          message: '⚠️ Quase lá! Abra o robô @Karo_AF_bot no Telegram e clique em "INICIAR" (Start) uma vez para autorizar o recebimento de alertas.'
        };
      }
      return { 
        success: false, 
        message: `Falha no envio: ${desc}` 
      };
    }
  }
}
