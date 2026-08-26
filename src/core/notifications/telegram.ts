import axios from 'axios';
import { SeniorAnalysisResult, TelegramConfig, ActivePosition } from '../types';

export class TelegramNotificationService {
  private static lastSentSignals: Map<string, number> = new Map();

  public static async sendSeniorSignalAlert(
    signal: SeniorAnalysisResult,
    config: TelegramConfig
  ): Promise<boolean> {
    if (!config.enabled || !config.botToken || !config.chatId) {
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

    const directionEmoji = signal.action === 'BUY' ? '🟢 COMPRA (LONG)' : '🔴 VENDA (SHORT)';
    const scoreBadge = signal.confluenceScore >= 90 ? '⭐⭐⭐ EXCEPCIONAL' : '⭐⭐ ALTA PROBABILIDADE';
    const opt = signal.optionsTrade;
    const marketBadge = signal.market === 'CRYPTO' ? '🪙 CRIPTO 24/7' : '🇧🇷 B3 BRASIL';

    const message = `
🚨 *[NOVA OPORTUNIDADE SENIOR]* 🚨
━━━━━━━━━━━━━━━━━━━━
📊 *Mercado:* *${marketBadge}*
📈 *Ativo:* \`${signal.ticker}\` (${signal.name})
🧭 *Direção:* *${directionEmoji}*
📊 *Score Confluência:* *${signal.confluenceScore}%* (${scoreBadge})
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
      console.log(`[Telegram] Alerta disparado para ${signal.ticker}`);
      return true;
    } catch (err: any) {
      console.error(`[Telegram] Erro ao enviar: ${err?.response?.data?.description || err?.message}`);
      return false;
    }
  }

  // ALERTA DE ACOMPANHAMENTO ATIVO (TRADE GUARDIAN)
  public static async sendFollowUpAlert(
    pos: ActivePosition,
    eventType: 'BREAKEVEN' | 'ALVO_1' | 'ALVO_FINAL' | 'STOP_LOSS',
    config: TelegramConfig
  ): Promise<boolean> {
    if (!config.enabled || !config.botToken || !config.chatId) {
      return false;
    }

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
      return true;
    } catch (err: any) {
      console.error(`[Telegram Follow-up] Erro: ${err?.message}`);
      return false;
    }
  }

  public static async sendTestNotification(config: TelegramConfig): Promise<{ success: boolean; message: string }> {
    if (!config.botToken || !config.chatId) {
      return { success: false, message: 'Bot Token e Chat ID são obrigatórios.' };
    }

    try {
      const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
      const testMsg = `
🤖 *[CONEXÃO B3 + CRIPTO + CARTEIRA ATIVA]*
━━━━━━━━━━━━━━━━━━━━
✅ O seu robô analista sênior foi configurado com sucesso!
📡 Você receberá alertas de novas oportunidades e acompanhamento em tempo real das suas ações compradas (Breakeven, Parciais e Alvos).

Bons trades com risco controlado! 🚀
      `.trim();

      await axios.post(url, {
        chat_id: config.chatId,
        text: testMsg,
        parse_mode: 'Markdown'
      });

      return { success: true, message: 'Notificação enviada com sucesso para o seu celular!' };
    } catch (err: any) {
      return { 
        success: false, 
        message: `Falha ao enviar: ${err?.response?.data?.description || err?.message}` 
      };
    }
  }
}
