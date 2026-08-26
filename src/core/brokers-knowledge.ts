import { BrokerProfile, BrokerType } from './types';

export const BROKERS_DATABASE: Record<BrokerType, BrokerProfile> = {
  CLEAR: {
    id: 'CLEAR',
    name: 'Clear Corretora (Grupo XP)',
    popularFor: 'Pioneira em Corretagem Zero, Day Trade e Swing Trade',
    brokerageFee: 'R$ 0,00 (Taxa Zero em Ações, Opções e Futuros)',
    platforms: ['Clear Trader (Profit)', 'Pit de Negociação Web', 'Clear Mobile App', 'Tryd Clear'],
    orderStepsGuide: {
      swingTrade: [
        '1. Abra o Pit da Clear ou o app Clear Mobile e vá na aba "Swing Trade".',
        '2. Digite o ticker (ex: PETR4 para lote de 100 ou PETR4F para fracionário de 1 a 99 ações).',
        '3. Selecione o tipo de ordem: "Ordem Limitada" ou "Start Compra".',
        '4. Preencha a Quantidade, o Preço de Stop Loss e o Preço de Alvo.',
        '5. Digite sua Assinatura Eletrônica e clique em "Enviar Ordem".'
      ],
      dayTrade: [
        '1. No menu lateral, acerte o módulo para "Day Trade".',
        '2. No Clear Trader (Profit) ou Pit, abra a boleta rápida do ativo.',
        '3. Defina a Ordem OCO (Stop Loss automático de 0.9% e Alvo de 1.8%).',
        '4. Clique no botão de Compra a Mercado ou posicione a ordem no Book.',
        '5. Todas as ordens Day Trade são encerradas automaticamente às 17h30.'
      ],
      options: [
        '1. Vá no menu "Estratégia de Opções" da Clear.',
        '2. Selecione a estrutura recomendada (ex: "Trava de Alta com Call").',
        '3. Confirme os strikes e clique em "Montar Estrutura".'
      ]
    },
    lessons: [
      {
        teacher: 'André Moraes (Mestre do Trade ao Vivo / Clear)',
        role: 'Analista CNPI e Educador Chefe',
        coreConcept: 'Cruzamento de Médias Móveis com Alinhamento de Múltiplos Tempos Gráficos (Setup dos Três Gigantes)',
        practicalRule: 'Nunca opere contra a Média Móvel de 72 períodos no gráfico Diário. Espere o recuo até a média para comprar com Stop curto abaixo do fundo anterior.',
        videoOrCourseTopic: 'Curso "DNA da Consistência" & Sala de Análise ao Vivo'
      },
      {
        teacher: 'Filipe Fradique & Aliakyn',
        role: 'Especialistas em Price Action e Fluxo da Clear',
        coreConcept: 'Leitura de Absorção e Falha de Rompimento',
        practicalRule: 'Se uma barra tenta romper a máxima do dia com volume gigante mas fecha com cauda superior longa, é uma armadilha institucional. Proteja-se imediatamente.',
        videoOrCourseTopic: 'Aulas de Price Action Avançado e Tape Reading na B3'
      }
    ]
  },
  XP: {
    id: 'XP',
    name: 'XP Investimentos',
    popularFor: 'Maior corretora do Brasil, Assessoria Institucional e Research Completo',
    brokerageFee: 'Opções de Corretagem Zero no App / Planos Profit Pro',
    platforms: ['XP Investimentos App', 'Home Broker XP', 'Profit Pro XP', 'MetaTrader 5'],
    orderStepsGuide: {
      swingTrade: [
        '1. No app da XP ou Home Broker, acesse a aba "Bolsa".',
        '2. Digite o código do ativo e clique em "Comprar".',
        '3. Preencha o "Stop Simultâneo" com os valores informados pelo robô.',
        '4. Confirme sua biometria/token e envie a boleta.'
      ],
      dayTrade: [
        '1. Ative a alavancagem Day Trade no portal da XP.',
        '2. Abra o Profit Pro da XP ou o Chart Trading do app.',
        '3. Envie ordem com estratégia OCO configurada com Stop de proteção.'
      ],
      options: [
        '1. Acesse o "Módulo de Opções Estruturadas" no Home Broker da XP.',
        '2. Selecione a trava recomendada pelo robô.'
      ]
    },
    lessons: [
      {
        teacher: 'Gerson Zanetti & Fernando Ferreira',
        role: 'Estrategistas Chefes de Research XP',
        coreConcept: 'Rastreamento de Fluxo de Capital Estrangeiro e Rotação Setorial',
        practicalRule: 'O mercado brasileiro é movido pelo investidor não-residente (estrangeiro). Quando o saldo de capital gringo na B3 é positivo em semanas consecutivas, ações de Commodities (PETR4, VALE3) e Grandes Bancos (ITUB4) tendem a liderar as altas.',
        videoOrCourseTopic: 'Relatórios "Onde Investir" & XP Research Semanal'
      },
      {
        teacher: 'Alan Ghani & Marco Saravalle',
        role: 'Educadores da XP Educação',
        coreConcept: 'Alavancagem Inteligente com Travas de Opções',
        practicalRule: 'Para rentabilizar com segurança, nunca compre opções a seco sem stop no tempo. Prefira sempre Travas de Alta ou Baixa onde o risco é limitado a 100% do valor alocado.',
        videoOrCourseTopic: 'Masterclass de Derivativos e Renda Variável'
      }
    ]
  },
  BTG: {
    id: 'BTG',
    name: 'BTG Pactual (Banco de Investimentos)',
    popularFor: 'Execução Institucional de Alta Velocidade e Carteiras Quantitativas',
    brokerageFee: 'Planos com Corretagem Zero e Plataforma Profit Grátis por RLP',
    platforms: ['BTG Trader', 'BTG Banking & Investimentos App', 'Profit BTG', 'Home Broker BTG'],
    orderStepsGuide: {
      swingTrade: [
        '1. Abra o app BTG Trader e vá em "Renda Variável".',
        '2. Busque o ativo da B3 e clique em "Negociar".',
        '3. Ative a chave "Ordem Stop" com Gain e Loss calculados.'
      ],
      dayTrade: [
        '1. No BTG Trader, selecione a conta Day Trade com margem reduzida.',
        '2. Opere via SuperDOM ou Gráfico 5m com 1 clique.'
      ],
      options: [
        '1. Acesse o Simulador de Opções do BTG e monte o spread de Call ou Put.'
      ]
    },
    lessons: [
      {
        teacher: 'Carlos Sequeira & Lucas Tambellini',
        role: 'Chefes de Análise de Ações BTG Pactual',
        coreConcept: 'Análise Quantitativa de Tendência e Momentum Institucional',
        practicalRule: 'O melhor trade une valuation atrativo com timing técnico de rompimento. Se o ativo está acima da VWAP e rompendo máxima semanal, a probabilidade estatística de ganho passa de 70%.',
        videoOrCourseTopic: 'Carteiras Recomendadas & Estratégias Quantitativas BTG'
      }
    ]
  },
  RICO: {
    id: 'RICO',
    name: 'Rico Investimentos',
    popularFor: 'Interface Simples, Didática para Iniciantes e Taxa Zero',
    brokerageFee: 'R$ 0,00 (Corretagem Zero)',
    platforms: ['Rico App Mobile', 'Rico Trader', 'Home Broker Rico'],
    orderStepsGuide: {
      swingTrade: [
        '1. No App Rico, toque em "Bolsa" e procure a ação.',
        '2. Toque no botão verde "Comprar" e configure Alvo e Stop.'
      ],
      dayTrade: [
        '1. Ative a modalidade Day Trade no app Rico e use o Rico Trader.'
      ],
      options: [
        '1. Na aba Opções, selecione o vencimento do mês e o strike sugerido.'
      ]
    },
    lessons: [
      {
        teacher: 'Beto Altenhofen & Educadores Rico',
        role: 'Analistas e Apresentadores de Mercado',
        coreConcept: 'Desmistificação do Mercado e Gestão 2 para 1',
        practicalRule: 'Se você perder R$ 50 quando errar, você deve obrigatoriamente buscar pelo menos R$ 100 ou R$ 150 quando acertar. Com essa matemática, você será consistentemente lucrativo.',
        videoOrCourseTopic: 'Série "Investir sem Medo" e lives diárias da Rico'
      }
    ]
  },
  GENIAL: {
    id: 'GENIAL',
    name: 'Genial Investimentos',
    popularFor: 'Análise Técnica ao Vivo, Salas Diárias e RLP Ativo',
    brokerageFee: 'R$ 0,00 (Corretagem Zero em Ações e Opções)',
    platforms: ['Profit Genial Grátis', 'App Genial', 'Home Broker Genial'],
    orderStepsGuide: {
      swingTrade: [
        '1. No Home Broker ou Profit Genial, abra a boleta de Compra.',
        '2. Configure ordem Start Compra com Stop Loss automático.'
      ],
      dayTrade: [
        '1. Opere no Profit Genial com ordens OCO e trailing stop ativado.'
      ],
      options: [
        '1. Monte travas no módulo de opções com garantia alocada em renda fixa.'
      ]
    },
    lessons: [
      {
        teacher: 'Igor Rodrigues & Denise Vieira',
        role: 'Analistas Técnicos CNPI Genial',
        coreConcept: 'Setup 9.1 de Larry Williams e Rompimento de Pivô na B3',
        practicalRule: 'A Média Móvel Exponencial de 9 períodos é o termômetro mais rápido do mercado. Quando a média 9 vira para cima e a máxima do candle é superada, entre na compra com stop na mínima.',
        videoOrCourseTopic: 'Morningshow & Sala ao Vivo Genial Analisa'
      }
    ]
  },
  TORO: {
    id: 'TORO',
    name: 'Toro Investimentos (Santander)',
    popularFor: 'Operações em 1 Clique e Modelo Ganha-Ganha',
    brokerageFee: 'Corretagem Zero',
    platforms: ['Toro App Mobile', 'Toro Trader', 'Home Broker Toro'],
    orderStepsGuide: {
      swingTrade: [
        '1. No App da Toro, digite o ticker da ação recomendada.',
        '2. Clique em "Investir" e programe o lucro e stop com 1 toque.'
      ],
      dayTrade: [
        '1. Abra o Toro Trader e envie ordens com limites de risco automáticos.'
      ],
      options: [
        '1. Acesse o menu de opções estruturadas do Toro App.'
      ]
    },
    lessons: [
      {
        teacher: 'Estrategistas Toro & Santander',
        role: 'Equipe de Análise Renda Variável',
        coreConcept: 'Controle Rígido de Drawdown e Proteção de Capital',
        practicalRule: 'Nunca permita que um trade vencedor se transforme em um trade perdedor. Assim que o Alvo 1 for atingido, mova o seu Stop Loss para o preço de entrada (Breakeven).',
        videoOrCourseTopic: 'Cursos Toro Academy'
      }
    ]
  },
  NUINVEST: {
    id: 'NUINVEST',
    name: 'NuInvest / Nubank',
    popularFor: 'Facilidade pelo App Nubank e Compra Fracionária',
    brokerageFee: 'Taxa Zero em Ações e BDRs',
    platforms: ['App Nubank (Aba Investimentos)', 'NuInvest Web'],
    orderStepsGuide: {
      swingTrade: [
        '1. No app Nubank, toque em Investimentos -> Bolsa de Valores.',
        '2. Digite o valor que deseja investir em Reais (R$) e confirme.'
      ],
      dayTrade: ['1. Voltado para Swing Trade.'],
      options: ['1. Negociação simples no app.']
    },
    lessons: [
      {
        teacher: 'Especialistas NuInvest',
        role: 'Educadores Financeiros',
        coreConcept: 'Constância e Acúmulo de Ações de Qualidade com Stop Técnico',
        practicalRule: 'Compre empresas sólidas geradoras de caixa e dividendos nos momentos em que o mercado corrige até as médias de suporte.',
        videoOrCourseTopic: 'Conteúdos NuEnsina'
      }
    ]
  },
  INTER: {
    id: 'INTER',
    name: 'Inter Invest (Banco Inter)',
    popularFor: 'Super App Completo, Home Broker Gratuito e Taxa Zero',
    brokerageFee: 'R$ 0,00 (Corretagem Zero)',
    platforms: ['Inter App', 'Home Broker Inter Web'],
    orderStepsGuide: {
      swingTrade: ['1. No App Inter, vá em Investir -> Ações Brasil e envie ordem.'],
      dayTrade: ['1. Habilite custódia Day Trade no Home Broker Inter.'],
      options: ['1. Negociação via Home Broker Inter.']
    },
    lessons: [
      {
        teacher: 'Inter Research',
        role: 'Equipe de Estratégia',
        coreConcept: 'Alocação Eficiente e Swing Trade em Setores Defensivos',
        practicalRule: 'Combine ativos cíclicos com ativos defensivos para reduzir a volatilidade.',
        videoOrCourseTopic: 'Inter Research Podcasts'
      }
    ]
  },
  AGORA: {
    id: 'AGORA',
    name: 'Ágora Investimentos (Bradesco)',
    popularFor: 'Tradição, Integração com Bradesco e Ágora Trader',
    brokerageFee: 'Planos com Isenção ou Pacotes Especiais',
    platforms: ['Ágora App', 'Ágora Trader (Profit)', 'Home Broker Ágora'],
    orderStepsGuide: {
      swingTrade: ['1. Acesse o App Ágora e envie boleta com Stop Loss programado.'],
      dayTrade: ['1. Utilize a plataforma Ágora Trader.'],
      options: ['1. Módulo de derivativos estruturados Ágora.']
    },
    lessons: [
      {
        teacher: 'José Cataldo & Equipe Ágora',
        role: 'Superintendente de Research Ágora',
        coreConcept: 'Análise Gráfica com Suportes e Resistências Clássicos',
        practicalRule: 'Respeite as zonas de suporte diário para garantir a melhor relação de retorno.',
        videoOrCourseTopic: 'Ágora Talks'
      }
    ]
  },
  BINANCE: {
    id: 'BINANCE',
    name: 'Binance (Maior Exchange Cripto do Mundo)',
    popularFor: 'Mercado Cripto 24/7, Maior Liquidez Global e Taxas Baixas (0.075%)',
    brokerageFee: '0.075% a 0.10% (Desconto com BNB)',
    platforms: ['Binance Pro App Mobile', 'Binance Web Trading', 'Binance Futures'],
    orderStepsGuide: {
      swingTrade: [
        '1. No app Binance, vá na aba "Trade" -> "Spot".',
        '2. Selecione o par (ex: BTC/USDT, ETH/USDT, SOL/USDT).',
        '3. Escolha o tipo de ordem "Stop-Limit" ou "OCO".',
        '4. Digite o Preço de Compra, o Stop Loss e o Take Profit (Alvo).',
        '5. Confirme e acompanhe a posição 24h por dia.'
      ],
      dayTrade: [
        '1. Use o Binance Futures (Futuros USD-M) ou Spot com ordem Limit rápida.',
        '2. Configure Stop Loss OCO de 0.9% para proteger contra volatilidade.',
        '3. Opere a qualquer hora do dia, noite ou fins de semana.'
      ],
      options: [
        '1. Negociação de opções de Bitcoin e Ethereum no módulo Binance Options.'
      ]
    },
    lessons: [
      {
        teacher: 'Estrategistas Globais Cripto & Binance Academy',
        role: 'Educadores e Analistas Quantitativos',
        coreConcept: 'Análise Técnica 24/7 e Rompimentos de Volume em Cripto',
        practicalRule: 'Criptomoedas operam 24/7 sem intervalo de pregão. O melhor momento para operar são os fechamentos de velas de 4h e cruzamentos de VWAP no 5m com alto volume.',
        videoOrCourseTopic: 'Binance Academy Masterclass & Price Action Cripto'
      }
    ]
  },
  MERCADO_BITCOIN: {
    id: 'MERCADO_BITCOIN',
    name: 'Mercado Bitcoin (MB - Brasil)',
    popularFor: 'Maior Exchange Brasileira, Depósitos via Pix Instantâneo e Segurança Regulada',
    brokerageFee: '0.30% a 0.70% (Depósitos Pix Gratuitos)',
    platforms: ['App Mercado Bitcoin', 'MB Trade Pro Web'],
    orderStepsGuide: {
      swingTrade: [
        '1. No App MB, selecione a moeda (ex: Bitcoin, Ethereum, Solana).',
        '2. Clique em "Comprar" via Pix em Reais (R$).',
        '3. No MB Trade Pro, configure ordens Stop e Alvo.'
      ],
      dayTrade: [
        '1. Utilize a plataforma MB Trade Pro para gráficos em tempo real.'
      ],
      options: ['1. Negociação spot de ativos digitais.']
    },
    lessons: [
      {
        teacher: 'Ronaldo Silva & Educadores MB',
        role: 'Especialistas em Ativos Digitais',
        coreConcept: 'Estratégia DCA com Timing Técnico de Médias',
        practicalRule: 'Compre criptoativos fortes (BTC e ETH) quando o RSI de 15m estiver sobrevendido (< 30) em tendências macro de alta.',
        videoOrCourseTopic: 'MB Talks & Cursos de Criptoeconomia'
      }
    ]
  }
};
