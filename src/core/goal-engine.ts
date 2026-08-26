import { UserFinancialGoal, CustomizedStrategyOption, SeniorAnalysisResult } from './types';
import { BROKERS_DATABASE } from './brokers-knowledge';

export class GoalEngine {
  public static generateGoalStrategies(
    goal: UserFinancialGoal,
    topOpportunity: SeniorAnalysisResult
  ): CustomizedStrategyOption[] {
    const broker = BROKERS_DATABASE[goal.selectedBroker] || BROKERS_DATABASE['CLEAR'];
    const capital = goal.accountCapital || 20000;
    
    // Calcula o valor da meta em Reais (R$)
    let targetBRL = goal.targetAmount;
    if (goal.unit === 'PERCENT') {
      targetBRL = (capital * (goal.targetAmount / 100));
    }

    // Ajusta o multiplicador pelo período
    const periodLabel = goal.period === 'DAILY' ? 'Diário' : goal.period === 'WEEKLY' ? 'Semanal' : 'Mensal';
    const ticker = topOpportunity.ticker.replace('.SA', '');
    const price = topOpportunity.currentPrice;

    // -------------------------------------------------------------
    // OPÇÃO 1: CONSERVADORA (AÇÕES À VISTA / SWING TRADE)
    // -------------------------------------------------------------
    const swingTargetGainPerShare = Math.max(0.20, (price * 0.05)); // 5% de ganho médio no alvo 1
    const swingLossPerShare = Math.max(0.10, (price * 0.025));      // 2.5% de perda no stop
    
    // Quantidade de ações para bater a meta
    let swingShares = Math.ceil(targetBRL / swingTargetGainPerShare);
    // Limite de segurança de capital
    const maxSharesByCapital = Math.floor((capital * 0.6) / price); // Usa no máximo 60% do capital
    if (swingShares > maxSharesByCapital && maxSharesByCapital > 0) {
      swingShares = maxSharesByCapital;
    }
    swingShares = Math.max(1, swingShares);

    const swingCapitalReq = Number((swingShares * price).toFixed(2));
    const swingEstimatedReturn = Number((swingShares * swingTargetGainPerShare).toFixed(2));
    const swingEstimatedLoss = Number((swingShares * swingLossPerShare).toFixed(2));

    const option1: CustomizedStrategyOption = {
      optionNumber: 1,
      category: 'CONSERVADORA_ACOES',
      title: `Opção 1: Compra de Ações à Vista (${topOpportunity.name})`,
      tickerOrStructure: `${topOpportunity.ticker} (Lote: ${swingShares} ações)`,
      capitalRequired: swingCapitalReq,
      sharesOrContractsQuantity: swingShares,
      entryPrice: Number(price.toFixed(2)),
      stopLossPrice: Number((price * 0.975).toFixed(2)),
      targetPrice: Number((price * 1.05).toFixed(2)),
      estimatedReturnBRL: swingEstimatedReturn,
      estimatedLossBRL: swingEstimatedLoss,
      riskRewardDisplay: '3.5 : 1 (Risco Baixo / Sem Vencimento)',
      timeframeDisplay: '3 a 15 dias úteis (Swing Trade)',
      howToExecuteInBroker: `Na sua corretora ${broker.name}: Abra a boleta de Swing Trade, digite ${topOpportunity.ticker} e compre ${swingShares} ações com Stop Loss em R$ ${(price * 0.975).toFixed(2)} e Alvo em R$ ${(price * 1.05).toFixed(2)}.`,
      explanationForBeginners: `Você se torna sócio da ${topOpportunity.name} comprando as ações reais. Não tem prazo de validade nem pressa. Se o mercado subir 5%, você atinge seu ganho estimado de R$ ${swingEstimatedReturn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} com máxima tranquilidade.`,
      whyThisOptionFitsGoal: `Ideal para quem busca atingir a meta de R$ ${targetBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} sem sofrer com a volatilidade do dia a dia e com risco controlado.`
    };

    // -------------------------------------------------------------
    // OPÇÃO 2: MODERADA (TRAVA DE ALTA EM OPÇÕES B3 - RISCO TRAVADO)
    // -------------------------------------------------------------
    const optPlan = topOpportunity.optionsTrade;
    const costPerOption = optPlan.estimatedCostPerUnit || 0.80;
    const profitPerOption = 1.60; // Retorno médio de ~200% sobre o prêmio da trava

    let optionContracts = Math.ceil(targetBRL / profitPerOption);
    // Limite de segurança: no máximo 15% do capital total alocado em travas
    const maxOptionsByCapital = Math.floor((capital * 0.15) / costPerOption);
    if (optionContracts > maxOptionsByCapital && maxOptionsByCapital > 0) {
      optionContracts = maxOptionsByCapital;
    }
    optionContracts = Math.max(100, Math.floor(optionContracts / 100) * 100); // Múltiplos de 100 (lote padrão de opções B3)

    const optCapitalReq = Number((optionContracts * costPerOption).toFixed(2));
    const optEstimatedReturn = Number((optionContracts * profitPerOption).toFixed(2));
    const optEstimatedLoss = optCapitalReq; // Risco máximo é exatamente 100% do valor desembolsado

    const option2: CustomizedStrategyOption = {
      optionNumber: 2,
      category: 'MODERADA_OPCOES',
      title: `Opção 2: Estrutura em Opções B3 (${optPlan.structureName})`,
      tickerOrStructure: `${optPlan.suggestedTicker} (${optionContracts} opções)`,
      capitalRequired: optCapitalReq,
      sharesOrContractsQuantity: optionContracts,
      entryPrice: costPerOption,
      stopLossPrice: 0.00, // Risco já é travado no custo
      targetPrice: costPerOption + profitPerOption,
      estimatedReturnBRL: optEstimatedReturn,
      estimatedLossBRL: optEstimatedLoss,
      riskRewardDisplay: '2.5 : 1 (Risco 100% Travado no Desembolso)',
      timeframeDisplay: 'Vencimento Mensal B3 (1 a 4 semanas)',
      howToExecuteInBroker: `Na sua corretora ${broker.name}: Acesse o menu de Opções Estruturadas, monte a ${optPlan.structureName} com ${optionContracts} opções. Seu custo máximo total será de R$ ${optCapitalReq.toFixed(2)}.`,
      explanationForBeginners: `Uma estratégia genial onde você investe apenas R$ ${optCapitalReq.toFixed(2)} (um valor bem menor que comprar ações). Seu risco máximo de perda é exatamente o valor investido (nunca perde a mais). Se a ação subir até o alvo, você embolsa R$ ${optEstimatedReturn.toFixed(2)} (+200% de lucro).`,
      whyThisOptionFitsGoal: `Excelente assimetria: você arrisca pouco dinheiro do bolso para buscar a sua meta de R$ ${targetBRL.toFixed(2)} com retorno alavancado e seguro.`
    };

    // -------------------------------------------------------------
    // OPÇÃO 3: AGRESSIVA (DAY TRADE INTRADAY 5M - NO MESMO DIA)
    // -------------------------------------------------------------
    const dtGainPerShare = Math.max(0.12, (price * 0.016)); // 1.6% de alvo intraday
    const dtLossPerShare = Math.max(0.06, (price * 0.009)); // 0.9% de stop curto
    
    let dtShares = Math.ceil(targetBRL / dtGainPerShare);
    dtShares = Math.max(100, Math.floor(dtShares / 100) * 100);

    const dtCapitalReq = Number(((dtShares * price) / 10).toFixed(2)); // Alavancagem Day Trade na B3 (margem de ~10%)
    const dtEstimatedReturn = Number((dtShares * dtGainPerShare).toFixed(2));
    const dtEstimatedLoss = Number((dtShares * dtLossPerShare).toFixed(2));

    const option3: CustomizedStrategyOption = {
      optionNumber: 3,
      category: 'AGRESSIVA_DAYTRADE',
      title: `Opção 3: Day Trade Rápido no 5m (${topOpportunity.name})`,
      tickerOrStructure: `${topOpportunity.ticker} (${dtShares} ações intraday)`,
      capitalRequired: dtCapitalReq,
      sharesOrContractsQuantity: dtShares,
      entryPrice: Number(price.toFixed(2)),
      stopLossPrice: Number((price * 0.991).toFixed(2)),
      targetPrice: Number((price * 1.016).toFixed(2)),
      estimatedReturnBRL: dtEstimatedReturn,
      estimatedLossBRL: dtEstimatedLoss,
      riskRewardDisplay: '2.0 : 1 (Gatilho Rápido no Gráfico de 5m)',
      timeframeDisplay: 'Intraday (Entra e Encerra Hoje até 17h30)',
      howToExecuteInBroker: `Na sua corretora ${broker.name}: No módulo Day Trade, coloque ordem Start Compra em R$ ${price.toFixed(2)} com Stop Loss curto em R$ ${(price * 0.991).toFixed(2)} e Alvo em R$ ${(price * 1.016).toFixed(2)}.`,
      explanationForBeginners: `Operação de alta agilidade no gráfico de 5 minutos. Você entra no rompimento de fluxo institucional e encerra no mesmo dia. Se bater o alvo do dia, você coloca no bolso R$ ${dtEstimatedReturn.toFixed(2)} e dorme 100% líquido sem posição aberta.`,
      whyThisOptionFitsGoal: `Perfeito para atingir a meta diária imediata de R$ ${targetBRL.toFixed(2)} aproveitando a volatilidade do pregão.`
    };

    return [option1, option2, option3];
  }
}
