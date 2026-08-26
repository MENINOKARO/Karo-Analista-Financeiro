import { ActionDirection, OptionsTradePlan, SwingTradePlan, DayTradePlan, B3OptionContract, OptionStrategyDetail } from './types';
import { B3OptionsDatabase } from './b3-options-database';

export class OptionsEngine {
  public static generateOptionsPlan(
    ticker: string,
    currentPrice: number,
    direction: ActionDirection
  ): OptionsTradePlan {
    const isCrypto = ticker.includes('USD') || ticker.includes('-') || (!ticker.endsWith('.SA') && (ticker.includes('BTC') || ticker.includes('ETH') || ticker.includes('SOL') || ticker.includes('BNB')));
    
    const shortTermPlan = this.generateOptionsPlanForOffset(ticker, currentPrice, direction, 0);
    if (!isCrypto) {
      shortTermPlan.longTermPlan = this.generateOptionsPlanForOffset(ticker, currentPrice, direction, 1);
    }
    return shortTermPlan;
  }

  public static generateOptionsPlanForOffset(
    ticker: string,
    currentPrice: number,
    direction: ActionDirection,
    monthOffset: number = 0
  ): OptionsTradePlan {
    const isCrypto = ticker.includes('USD') || ticker.includes('-') || (!ticker.endsWith('.SA') && (ticker.includes('BTC') || ticker.includes('ETH') || ticker.includes('SOL') || ticker.includes('BNB')));
    const cleanStock = ticker.replace('.SA', '');
    const expInfo = B3OptionsDatabase.getB3ExpirationDate(monthOffset);
    const isLongTerm = monthOffset >= 1;

    // SE FOR CRIPTOATIVO (NÃO EXISTE OPÇÕES NA B3)
    if (isCrypto) {
      const dummyContract: B3OptionContract = {
        ticker,
        underlyingStock: ticker,
        strike: currentPrice,
        optionType: 'CALL',
        style: 'EUROPEIA',
        moneyness: 'ATM',
        expirationDate: 'Contínuo 24/7',
        estimatedPremium: Number((currentPrice * 0.05).toFixed(2))
      };

      const availableStrategies: OptionStrategyDetail[] = [
        {
          id: 'COMPRA_CALL_SECO',
          title: `Trade Spot Direcional (${ticker})`,
          badge: '🪙 Mercado À Vista Cripto 24/7',
          description: `Compra direta do token à vista na Binance ou Mercado Bitcoin sem risco de liquidação ou decaimento de opções.`,
          costOrIncomePerUnit: currentPrice,
          isCredit: false,
          maxRiskDescription: `Stop Loss técnico em -3.5% do capital alocado.`,
          maxProfitDescription: `Alvo projetado de +8% a +15% de valorização.`,
          breakevenPrice: currentPrice,
          executionGuide: `Na Binance ou Mercado Bitcoin: Compre o token ${ticker} a mercado no par USDT ou BRL.`,
          leg1: dummyContract
        },
        {
          id: 'TRAVA_ALTA_CALL',
          title: `Futuros Perpétuos com Alavancagem 3x (${ticker})`,
          badge: '⚡ Futuros Binance com Gestão de Margem',
          description: `Operação nos contratos perpétuos de criptoativos com alavancagem moderada de 3x e Stop Loss rigoroso.`,
          costOrIncomePerUnit: Number((currentPrice / 3).toFixed(2)),
          isCredit: false,
          maxRiskDescription: `Stop Loss automático de 1.5% do preço (4.5% da margem).`,
          maxProfitDescription: `Ganho de +18% a +35% sobre a margem alocada.`,
          breakevenPrice: currentPrice,
          executionGuide: `Na Binance Futures: Abra posição LONG em ${ticker} com alavancagem isolada de 3x.`,
          leg1: dummyContract
        }
      ];

      return {
        structureType: 'COMPRA_CALL_SECO',
        structureName: `Mercado Cripto 24/7 (${ticker})`,
        suggestedTicker: ticker,
        strike1: currentPrice,
        expirationMonth: 'Mercado Contínuo 24/7',
        expirationDateExact: '24/7 (Sem vencimento B3)',
        daysToExpiration: 365,
        timeRiskLevel: 'RISCO_BAIXO_JANELA_IDEAL',
        timeRiskDescription: '🪙 Criptoativos operam 24 horas por dia, 7 dias por semana, sem vencimento mensal da B3.',
        timeStopRule: 'Utilize Stop Loss de preço fixo na exchange.',
        estimatedCostPerUnit: currentPrice,
        maxRiskDescription: 'Stop Loss técnico de -3.5%.',
        maxProfitDescription: 'Alvo projetado de +8% a +15%.',
        breakevenPrice: currentPrice,
        riskAnalysis: 'Criptoativos não possuem contratos de opções listados na B3. O robô recomenda operações à vista (Spot) ou Futuros na Binance/Mercado Bitcoin.',
        executionSteps: `Acesse sua conta na Binance ou Mercado Bitcoin e compre ${ticker}.`,
        leg1: dummyContract,
        availableStrikesChain: [dummyContract],
        availableStrategies
      };
    }

    // AÇÕES DA B3 (MERCADO OFICIAL DE OPÇÕES)
    if (direction === 'BUY') {
      const callChain = B3OptionsDatabase.generateOptionChain(ticker, currentPrice, 'CALL', monthOffset);
      
      // Encontra opções ideais para Compra e Venda
      const atmContract = callChain.find(c => c.moneyness === 'ATM') || callChain[Math.floor(callChain.length / 2)];
      const otmContract = callChain.find(c => c.moneyness === 'OTM') || callChain[callChain.length - 2];
      const leg1 = isLongTerm ? otmContract : atmContract;
      const leg2 = callChain.find(c => c.strike > leg1.strike * 1.025) || callChain[callChain.length - 1];

      const spreadWidth = Number((leg2.strike - leg1.strike).toFixed(2));
      const estimatedCost = Number(Math.max(0.15, (leg1.estimatedPremium - leg2.estimatedPremium)).toFixed(2));
      const maxProfit = Number(Math.max(0.20, (spreadWidth - estimatedCost)).toFixed(2));
      const profitPercent = Math.round((maxProfit / estimatedCost) * 100);
      const breakeven = Number((leg1.strike + estimatedCost).toFixed(2));

      // GERAÇÃO DAS DIVERSAS MODALIDADES DE OPÇÕES PARA ESCOLHA DO USUÁRIO
      const availableStrategies: OptionStrategyDetail[] = isLongTerm ? [
        {
          id: 'COMPRA_CALL_SECO',
          title: `Compra de Call Longa OTM - Baixo Risco (${otmContract.ticker})`,
          badge: `🛡️ Baixo Custo (Centavos) & ${expInfo.daysToExpiration} Dias de Prazo`,
          description: `Compra direta da Call Série ${expInfo.callLetter} (${otmContract.ticker} - Strike R$ ${otmContract.strike.toFixed(2)}). O valor investido é muito baixo (R$ ${otmContract.estimatedPremium.toFixed(2)} por opção), o risco é estritamente limitado a esses centavos e o decaimento de tempo (Theta) é quase nulo no primeiro mês.`,
          costOrIncomePerUnit: otmContract.estimatedPremium,
          isCredit: false,
          maxRiskDescription: `Perda máxima 100% LIMITADA ao valor pago (R$ ${otmContract.estimatedPremium.toFixed(2)} por opção = R$ ${(otmContract.estimatedPremium * 100).toFixed(2)} por lote). Sem risco de chamada de margem.`,
          maxProfitDescription: `Potencial assimétrico de +150% a +400% na continuidade do movimento até ${expInfo.dateString}.`,
          breakevenPrice: Number((otmContract.strike + otmContract.estimatedPremium).toFixed(2)),
          executionGuide: `No Home Broker da Clear: Digite ${otmContract.ticker}, selecione COMPRA e envie a ordem no valor de mercado (R$ ${otmContract.estimatedPremium.toFixed(2)}).`,
          leg1: otmContract
        },
        {
          id: 'TRAVA_ALTA_CALL',
          title: `Trava de Alta Longa com Call (${atmContract.ticker} / ${otmContract.ticker})`,
          badge: '🛡️ Risco Travado & Tempo Amplo a Favor',
          description: `Compra da Call ${atmContract.ticker} (Strike R$ ${atmContract.strike.toFixed(2)}) e venda da Call ${otmContract.ticker} (Strike R$ ${otmContract.strike.toFixed(2)}). Financiamento do custo e proteção máxima contra volatilidade.`,
          costOrIncomePerUnit: Number(Math.max(0.20, atmContract.estimatedPremium - otmContract.estimatedPremium).toFixed(2)),
          isCredit: false,
          maxRiskDescription: `Risco 100% limitado ao débito pago. Sem chamada de margem.`,
          maxProfitDescription: `Retorno líquido planejado de +80% a +180% sobre o capital investido.`,
          breakevenPrice: Number((atmContract.strike + Math.max(0.20, atmContract.estimatedPremium - otmContract.estimatedPremium)).toFixed(2)),
          executionGuide: `No Home Broker da Clear: Compre ${atmContract.ticker} e venda ${otmContract.ticker} na mesma quantidade.`,
          leg1: atmContract,
          leg2: otmContract
        },
        {
          id: 'VENDA_COBERTA_CALL',
          title: `Venda Coberta Longa de Taxa (${otmContract.ticker})`,
          badge: '💵 Geração de Renda Passiva Estendida',
          description: `Para quem possui as ações ${cleanStock} em custódia: venda a Call ${otmContract.ticker} e receba o prêmio integralmente em conta com prazo elástico.`,
          costOrIncomePerUnit: otmContract.estimatedPremium,
          isCredit: true,
          maxRiskDescription: `Risco zero de chamada (as ações em carteira cobrem a operação).`,
          maxProfitDescription: `Renda imediata no bolso de R$ ${otmContract.estimatedPremium.toFixed(2)} por opção (+${((otmContract.estimatedPremium / currentPrice) * 100).toFixed(1)}% no período).`,
          breakevenPrice: Number((currentPrice - otmContract.estimatedPremium).toFixed(2)),
          executionGuide: `No Home Broker da Clear: Digite ${otmContract.ticker}, selecione VENDA e receba o crédito.`,
          leg1: otmContract
        }
      ] : [
        {
          id: 'TRAVA_ALTA_CALL',
          title: `Trava de Alta com Call (${leg1.ticker} / ${leg2.ticker})`,
          badge: '🛡️ Risco 100% Limitado & Custo Reduzido',
          description: `Compra da Call ${leg1.ticker} (Strike R$ ${leg1.strike.toFixed(2)}) e venda da Call ${leg2.ticker} (Strike R$ ${leg2.strike.toFixed(2)}). O prêmio recebido da venda financia a compra, reduzindo o custo total.`,
          costOrIncomePerUnit: estimatedCost,
          isCredit: false,
          maxRiskDescription: `Risco 100% LIMITADO ao valor pago (R$ ${estimatedCost.toFixed(2)} por opção = R$ ${(estimatedCost * 100).toFixed(2)} por lote).`,
          maxProfitDescription: `R$ ${maxProfit.toFixed(2)} por opção (+${profitPercent}% de lucro líquido sobre o capital investido).`,
          breakevenPrice: breakeven,
          executionGuide: `No Home Broker da Clear: 1º Compre ${leg1.ticker} e 2º Venda ${leg2.ticker} (ou use o módulo Estratégia de Opções).`,
          leg1,
          leg2
        },
        {
          id: 'COMPRA_CALL_SECO',
          title: `Compra a Seco Direcional (${leg1.ticker})`,
          badge: '🚀 Alavancagem Máxima Direcional',
          description: `Compra pura da Call ${leg1.ticker} (Strike R$ ${leg1.strike.toFixed(2)}). Lucro ilimitado conforme a ação sobe, sem teto de ganho.`,
          costOrIncomePerUnit: leg1.estimatedPremium,
          isCredit: false,
          maxRiskDescription: `Perda máxima limitada ao prêmio pago (R$ ${leg1.estimatedPremium.toFixed(2)} por opção = R$ ${(leg1.estimatedPremium * 100).toFixed(2)} por lote).`,
          maxProfitDescription: `Lucro Ilimitado na valorização da ação (+100% a +250% se a ação romper a resistência).`,
          breakevenPrice: Number((leg1.strike + leg1.estimatedPremium).toFixed(2)),
          executionGuide: `No Home Broker da Clear: Digite ${leg1.ticker}, selecione COMPRA e envie a ordem no valor de mercado (R$ ${leg1.estimatedPremium.toFixed(2)}).`,
          leg1
        },
        {
          id: 'VENDA_COBERTA_CALL',
          title: `Venda Coberta de Taxa (${leg2.ticker})`,
          badge: '💵 Geração de Renda Mensal (Para quem tem a Ação)',
          description: `Se você já possui as ações ${cleanStock} em carteira, vende a Call ${leg2.ticker} (Strike R$ ${leg2.strike.toFixed(2)}) e embolsa o prêmio imediatamente como renda passiva.`,
          costOrIncomePerUnit: leg2.estimatedPremium,
          isCredit: true,
          maxRiskDescription: `Risco zero de chamada extra (as ações já em carteira cobrem a operação).`,
          maxProfitDescription: `Renda imediata no bolso de R$ ${leg2.estimatedPremium.toFixed(2)} por opção (+${((leg2.estimatedPremium / currentPrice) * 100).toFixed(1)}% de rentabilidade no mês).`,
          breakevenPrice: Number((currentPrice - leg2.estimatedPremium).toFixed(2)),
          executionGuide: `No Home Broker da Clear: Digite ${leg2.ticker}, selecione VENDA e receba o crédito em conta.`,
          leg1: leg2
        }
      ];

      return {
        structureType: isLongTerm ? 'COMPRA_CALL_SECO' : 'TRAVA_ALTA_CALL',
        structureName: isLongTerm ? `Opções Longas de Baixo Risco - Série ${expInfo.callLetter} (${expInfo.dateString})` : `Trava de Alta com Call (${leg1.ticker} / ${leg2.ticker})`,
        suggestedTicker: isLongTerm ? `${otmContract.ticker} (Compra de Baixo Custo)` : `${leg1.ticker} (Compra) + ${leg2.ticker} (Venda)`,
        strike1: leg1.strike,
        strike2: leg2.strike,
        expirationMonth: `Série ${expInfo.callLetter} (${expInfo.dateString})`,
        expirationDateExact: expInfo.dateString,
        daysToExpiration: expInfo.daysToExpiration,
        timeRiskLevel: expInfo.timeRiskLevel,
        timeRiskDescription: expInfo.timeRiskDescription,
        timeStopRule: expInfo.timeStopRule,
        estimatedCostPerUnit: isLongTerm ? otmContract.estimatedPremium : estimatedCost,
        maxRiskDescription: isLongTerm ? `Risco 100% LIMITADO aos centavos pagos (R$ ${otmContract.estimatedPremium.toFixed(2)} por opção).` : `Risco 100% TRAVADO e LIMITADO ao prêmio investido (R$ ${estimatedCost.toFixed(2)} por opção). Sem chamada de margem.`,
        maxProfitDescription: isLongTerm ? `Retorno assimétrico de +150% a +400% no prazo estendido.` : `R$ ${maxProfit.toFixed(2)} por opção (+${profitPercent}% de retorno sobre o capital alocado).`,
        breakevenPrice: breakeven,
        riskAnalysis: isLongTerm 
          ? `Excelente oportunidade de baixo risco: ao comprar a Call Série ${expInfo.callLetter} com ${expInfo.daysToExpiration} dias de prazo, o investidor protege seu capital contra a perda de tempo rápida (Theta), pagando apenas centavos e mantendo o potencial de valorização explosiva.`
          : `Excelente estrutura institucional calculada para a janela de ${expInfo.daysToExpiration} dias. Ao comprar a Call ${leg1.ticker} (Strike R$ ${leg1.strike.toFixed(2)}) e vender a Call ${leg2.ticker} (Strike R$ ${leg2.strike.toFixed(2)}), você anula o efeito negativo da passagem do tempo (Theta) e reduz o custo da operação.`,
        executionSteps: isLongTerm 
          ? `No Home Broker da Clear/XP: Selecione ${cleanStock}, vá no vencimento ${expInfo.dateString} e compre a opção ${otmContract.ticker}.`
          : `No Home Broker da Clear/XP: Selecione a ação ${cleanStock}, vá em Opções e monte a trava comprando ${leg1.ticker} e vendendo ${leg2.ticker}.`,
        leg1,
        leg2,
        availableStrikesChain: callChain,
        availableStrategies
      };
    } else {
      const putChain = B3OptionsDatabase.generateOptionChain(ticker, currentPrice, 'PUT', monthOffset);
      
      const leg1 = putChain.find(c => c.moneyness === 'ATM') || putChain[Math.floor(putChain.length / 2)];
      const leg2 = putChain.find(c => c.strike < leg1.strike * 0.97) || putChain[0];

      const spreadWidth = Number((leg1.strike - leg2.strike).toFixed(2));
      const estimatedCost = Number(Math.max(0.15, (leg1.estimatedPremium - leg2.estimatedPremium)).toFixed(2));
      const maxProfit = Number(Math.max(0.20, (spreadWidth - estimatedCost)).toFixed(2));
      const profitPercent = Math.round((maxProfit / estimatedCost) * 100);
      const breakeven = Number((leg1.strike - estimatedCost).toFixed(2));

      const availableStrategies: OptionStrategyDetail[] = [
        {
          id: 'TRAVA_BAIXA_PUT',
          title: `Trava de Baixa com Put (${leg1.ticker} / ${leg2.ticker})`,
          badge: '🛡️ Risco 100% Limitado na Queda',
          description: `Compre a Put ${leg1.ticker} (Strike R$ ${leg1.strike.toFixed(2)}) e venda a Put ${leg2.ticker} (Strike R$ ${leg2.strike.toFixed(2)}) para lucrar na desvalorização do ativo sem alugar ações.`,
          costOrIncomePerUnit: estimatedCost,
          isCredit: false,
          maxRiskDescription: `Risco 100% LIMITADO ao valor pago (R$ ${estimatedCost.toFixed(2)} por opção).`,
          maxProfitDescription: `R$ ${maxProfit.toFixed(2)} por opção (+${profitPercent}% de lucro).`,
          breakevenPrice: breakeven,
          executionGuide: `No Home Broker: Compre ${leg1.ticker} e venda ${leg2.ticker}.`,
          leg1,
          leg2
        },
        {
          id: 'COMPRA_PUT_SECO',
          title: `Compra de Put a Seco (${leg1.ticker})`,
          badge: '🛡️ Seguro de Carteira & Lucro na Queda',
          description: `Compra direta da Put ${leg1.ticker} (Strike R$ ${leg1.strike.toFixed(2)}) para proteger sua carteira de ações contra quedas abruptas de mercado.`,
          costOrIncomePerUnit: leg1.estimatedPremium,
          isCredit: false,
          maxRiskDescription: `Perda máxima restrita ao valor do seguro (R$ ${leg1.estimatedPremium.toFixed(2)} por opção).`,
          maxProfitDescription: `Valorização exponencial se o ativo sofrer forte correção.`,
          breakevenPrice: Number((leg1.strike - leg1.estimatedPremium).toFixed(2)),
          executionGuide: `No Home Broker da Clear: Digite ${leg1.ticker}, selecione COMPRA e execute.`,
          leg1
        }
      ];

      return {
        structureType: 'TRAVA_BAIXA_PUT',
        structureName: `Trava de Baixa com Put (${leg1.ticker} / ${leg2.ticker})`,
        suggestedTicker: `${leg1.ticker} (Compra) + ${leg2.ticker} (Venda)`,
        strike1: leg1.strike,
        strike2: leg2.strike,
        expirationMonth: `Série ${expInfo.putLetter} (${expInfo.dateString})`,
        expirationDateExact: expInfo.dateString,
        daysToExpiration: expInfo.daysToExpiration,
        timeRiskLevel: expInfo.timeRiskLevel,
        timeRiskDescription: expInfo.timeRiskDescription,
        timeStopRule: expInfo.timeStopRule,
        estimatedCostPerUnit: estimatedCost,
        maxRiskDescription: `Risco 100% TRAVADO e LIMITADO ao prêmio pago (R$ ${estimatedCost.toFixed(2)} por opção).`,
        maxProfitDescription: `R$ ${maxProfit.toFixed(2)} por opção (+${profitPercent}% de retorno potencial na queda).`,
        breakevenPrice: breakeven,
        riskAnalysis: `Permite lucrar na queda do ativo sem necessidade de alugar ações nem expor a conta a risco ilimitado.`,
        executionSteps: `No Home Broker da Clear/XP: Compre a Put ${leg1.ticker} (Strike R$ ${leg1.strike.toFixed(2)}) e venda a Put ${leg2.ticker} (Strike R$ ${leg2.strike.toFixed(2)}).`,
        leg1,
        leg2,
        availableStrikesChain: putChain,
        availableStrategies
      };
    }
  }

  public static generateSwingTradePlan(
    ticker: string,
    currentPrice: number,
    direction: ActionDirection
  ): SwingTradePlan {
    const isBuy = direction === 'BUY';
    const entryPrice = currentPrice;
    const cleanStock = ticker.replace('.SA', '');
    const standardLot = cleanStock;
    const fractionalLot = `${cleanStock}F`;
    const shareType = cleanStock.endsWith('4') ? 'PN' : cleanStock.endsWith('3') ? 'ON' : 'UNT';
    
    const stopDistance = currentPrice * 0.025;
    const stopLoss = isBuy ? Number((entryPrice - stopDistance).toFixed(2)) : Number((entryPrice + stopDistance).toFixed(2));
    const stopLossPercent = 2.5;

    const target1 = isBuy ? Number((entryPrice + (stopDistance * 2.0)).toFixed(2)) : Number((entryPrice - (stopDistance * 2.0)).toFixed(2));
    const target2 = isBuy ? Number((entryPrice + (stopDistance * 4.0)).toFixed(2)) : Number((entryPrice - (stopDistance * 4.0)).toFixed(2));

    return {
      entryPrice,
      stopLoss,
      stopLossPercent,
      target1,
      target1Percent: 5.0,
      target2,
      target2Percent: 10.0,
      riskRewardRatio: 3.5,
      timeHorizon: '3 a 15 dias úteis (Swing Trade)',
      riskProfile: 'MODERADO',
      riskAnalysis: `Na compra de ações à vista, você tem tempo a seu favor (sem vencimento e sem decaimento de tempo). Relação R:R de 3.5 : 1.`,
      executionSteps: `No Home Broker da sua corretora: Digite ${standardLot} (para lotes de 100) ou ${fractionalLot} (para fracionário de 1 a 99 ações). Preencha o Stop Loss em R$ ${stopLoss.toFixed(2)} e Alvo 1 em R$ ${target1.toFixed(2)}.`,
      standardLotTicker: standardLot,
      fractionalLotTicker: fractionalLot,
      shareType,
      governanceSegment: cleanStock === 'PETR4' ? 'Nível 2 B3' : 'Novo Mercado B3'
    };
  }

  public static generateDayTradePlan(
    ticker: string,
    currentPrice: number,
    direction: ActionDirection
  ): DayTradePlan {
    const isBuy = direction === 'BUY';
    const entryTrigger = currentPrice;
    const cleanStock = ticker.replace('.SA', '');
    const standardLot = cleanStock;
    const fractionalLot = `${cleanStock}F`;
    
    const stopDistance = currentPrice * 0.009;
    const stopLoss = isBuy ? Number((entryTrigger - stopDistance).toFixed(2)) : Number((entryTrigger + stopDistance).toFixed(2));
    const stopLossPercent = 0.9;

    const target1 = isBuy ? Number((entryTrigger + (stopDistance * 1.8)).toFixed(2)) : Number((entryTrigger - (stopDistance * 1.8)).toFixed(2));
    const target2 = isBuy ? Number((entryTrigger + (stopDistance * 3.0)).toFixed(2)) : Number((entryTrigger - (stopDistance * 3.0)).toFixed(2));

    return {
      entryTrigger,
      stopLoss,
      stopLossPercent,
      target1,
      target1Percent: 1.62,
      target2,
      target2Percent: 2.70,
      riskRewardRatio: 2.5,
      timeHorizon: 'Intraday (Fechamento obrigatório até 17h30)',
      riskProfile: 'ALTO_RETORNO',
      riskAnalysis: `Operação de alta velocidade com gatilho no gráfico de 5 minutos. Stop automático na corretora.`,
      executionSteps: `No módulo Day Trade ou Profit: Digite ${standardLot} e envie ordem Start Compra com estratégia OCO configurada.`,
      standardLotTicker: standardLot,
      fractionalLotTicker: fractionalLot
    };
  }
}