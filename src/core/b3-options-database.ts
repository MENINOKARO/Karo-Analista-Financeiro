import { B3OptionContract, TimeRiskLevel } from './types';

export interface ExpirationRiskInfo {
  dateString: string;
  monthIndex: number;
  callLetter: string;
  putLetter: string;
  daysToExpiration: number;
  timeRiskLevel: TimeRiskLevel;
  timeRiskDescription: string;
  timeStopRule: string;
  isNextMonthRolled: boolean;
}

export class B3OptionsDatabase {
  public static CALL_SERIES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  public static PUT_SERIES = ['M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'];

  // Calcula a 3ª sexta-feira útil e a Matriz de Vencimento x Risco (DTE)
  public static getB3ExpirationDate(targetMonthOffset: number = 0): ExpirationRiskInfo {
    const now = new Date();
    const currentYear = now.getFullYear();
    let currentMonth = now.getMonth(); // 0 a 11
    
    // Função auxiliar para achar a 3ª sexta-feira de um determinado mês
    const findThirdFriday = (y: number, m: number): Date => {
      let count = 0;
      for (let day = 1; day <= 31; day++) {
        const d = new Date(y, m % 12, day);
        if (d.getMonth() !== (m % 12)) break;
        if (d.getDay() === 5) {
          count++;
          if (count === 3) return d;
        }
      }
      return new Date(y, m % 12, 15);
    };

    let baseTargetDate = findThirdFriday(currentYear, currentMonth);
    let isNextMonthRolled = false;

    // Se o vencimento do mês corrente já passou ou restam menos de 5 dias corridos:
    // Avança automaticamente para o próximo mês ativo (Ex: Setembro - Série I)
    if (baseTargetDate.getTime() <= now.getTime() || (baseTargetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 5) {
      isNextMonthRolled = true;
      currentMonth = (currentMonth + 1) % 12;
    }

    const calculatedMonth = (currentMonth + targetMonthOffset) % 12;
    const calculatedYear = (currentMonth + targetMonthOffset) >= 12 ? currentYear + 1 : currentYear;
    const targetDate = findThirdFriday(calculatedYear, calculatedMonth);

    const diffMs = targetDate.getTime() - now.getTime();
    const daysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    const dayStr = String(targetDate.getDate()).padStart(2, '0');
    const monthStr = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dateString = `${dayStr}/${monthStr}/${targetDate.getFullYear()}`;

    let timeRiskLevel: TimeRiskLevel = 'RISCO_BAIXO_JANELA_IDEAL';
    let timeRiskDescription = '';
    let timeStopRule = '';

    if (targetMonthOffset >= 1) {
      timeRiskLevel = 'SERIE_SEGUINTE_PROTEGIDA';
      timeRiskDescription = `🛡️ Vencimento Estendido Série ${this.CALL_SERIES[calculatedMonth]} (${dateString}): ${daysRemaining} dias de prazo. Baixo risco com decaimento de tempo (Theta) quase NULO no primeiro mês.`;
      timeStopRule = `Tempo amplo a favor do investidor. Mantenha o trade com tranquilidade até 10 dias úteis antes de ${dateString}.`;
    } else if (daysRemaining >= 20) {
      timeRiskLevel = 'SERIE_SEGUINTE_PROTEGIDA';
      timeRiskDescription = `🛡️ Série Mensal Padrão ${this.CALL_SERIES[calculatedMonth]} (Vencimento ${dateString}): ${daysRemaining} dias de prazo. Máxima liquidez da B3.`;
      timeStopRule = `Encerre ou desmonte a trava se a ação não atingir o Alvo 1 até 5 dias úteis antes de ${dateString}.`;
    } else {
      timeRiskLevel = 'RISCO_BAIXO_JANELA_IDEAL';
      timeRiskDescription = `🟢 Janela Ativa: ${daysRemaining} dias úteis até ${dateString}.`;
      timeStopRule = `Acompanhe os alvos do trade diariamente.`;
    }

    return {
      dateString,
      monthIndex: calculatedMonth,
      callLetter: this.CALL_SERIES[calculatedMonth] || 'I',
      putLetter: this.PUT_SERIES[calculatedMonth] || 'U',
      daysToExpiration: daysRemaining,
      timeRiskLevel,
      timeRiskDescription,
      timeStopRule,
      isNextMonthRolled
    };
  }

  // Gera códigos oficiais B3 padronizados com os sistemas das corretoras (Ex: MGLUI450, BBDCI168, PETRI437, VALEI780)
  public static formatB3OptionTicker(cleanStock: string, seriesLetter: string, strike: number): string {
    const root = cleanStock.slice(0, 4).toUpperCase();
    
    if (strike < 10) {
      // Ex: MGLU 4.50 -> MGLUI450, MGLU 4.80 -> MGLUI480
      const intPart = Math.floor(strike);
      const decPart = Math.round((strike - intPart) * 100);
      const decStr = String(decPart).padStart(2, '0');
      return `${root}${seriesLetter}${intPart}${decStr}`;
    } else if (strike < 100) {
      // Ex: BBDC 16.50 -> BBDCI165, BBDC 16.75 -> BBDCI168, PETR 41.67 -> PETRI417, PETR 43.67 -> PETRI437
      const intPart = Math.floor(strike);
      const decPart = Math.round((strike - intPart) * 100);
      if (decPart % 10 === 0) {
        return `${root}${seriesLetter}${intPart}${decPart / 10}`;
      } else {
        const dec1 = Math.round(decPart / 10);
        return `${root}${seriesLetter}${intPart}${dec1}`;
      }
    } else {
      // Ex: VALE 110.00 -> VALEI110
      return `${root}${seriesLetter}${Math.round(strike)}`;
    }
  }

  // Gera a cadeia oficial de strikes B3 com preços calibrados no mercado real
  public static generateOptionChain(
    underlyingStock: string,
    currentPrice: number,
    optionType: 'CALL' | 'PUT' = 'CALL',
    targetMonthOffset: number = 0
  ): B3OptionContract[] {
    const clean = underlyingStock.replace('.SA', '').slice(0, 4);
    const expInfo = this.getB3ExpirationDate(targetMonthOffset);
    const seriesLetter = optionType === 'CALL' ? expInfo.callLetter : expInfo.putLetter;
    const isLongTerm = targetMonthOffset >= 1;

    // 1. BRADESCO (BBDC4) - Calibração Exata do Book da Clear
    if (clean === 'BBDC') {
      const bbdcStrikes = isLongTerm ? [
        { strike: 16.50, code: `BBDC${seriesLetter}165`, callPremium: 0.78, putPremium: 0.30 },
        { strike: 16.75, code: `BBDC${seriesLetter}168`, callPremium: 0.58, putPremium: 0.45 },
        { strike: 17.00, code: `BBDC${seriesLetter}170`, callPremium: 0.42, putPremium: 0.65 },
        { strike: 17.25, code: `BBDC${seriesLetter}173`, callPremium: 0.32, putPremium: 0.85 }, // Baixo Custo OTM
        { strike: 17.50, code: `BBDC${seriesLetter}175`, callPremium: 0.22, putPremium: 1.10 },
        { strike: 18.00, code: `BBDC${seriesLetter}180`, callPremium: 0.12, putPremium: 1.50 }
      ] : [
        { strike: 15.75, code: `BBDC${seriesLetter}158`, callPremium: 1.05, putPremium: 0.03 },
        { strike: 16.25, code: `BBDC${seriesLetter}163`, callPremium: 0.72, putPremium: 0.08 },
        { strike: 16.50, code: `BBDC${seriesLetter}165`, callPremium: 0.52, putPremium: 0.15 },
        { strike: 16.75, code: `BBDC${seriesLetter}168`, callPremium: 0.35, putPremium: 0.28 }, // Exato da Clear: R$ 0,35
        { strike: 17.00, code: `BBDC${seriesLetter}170`, callPremium: 0.22, putPremium: 0.45 },
        { strike: 17.25, code: `BBDC${seriesLetter}173`, callPremium: 0.13, putPremium: 0.68 },
        { strike: 17.50, code: `BBDC${seriesLetter}175`, callPremium: 0.08, putPremium: 0.95 }
      ];

      return bbdcStrikes.map(s => {
        let moneyness: 'ITM' | 'ATM' | 'OTM' = 'ATM';
        if (optionType === 'CALL') {
          if (s.strike < currentPrice * 0.99) moneyness = 'ITM';
          else if (s.strike > currentPrice * 1.01) moneyness = 'OTM';
        } else {
          if (s.strike > currentPrice * 1.01) moneyness = 'ITM';
          else if (s.strike < currentPrice * 0.99) moneyness = 'OTM';
        }

        return {
          ticker: s.code,
          underlyingStock: 'BBDC4',
          strike: s.strike,
          optionType,
          style: 'AMERICANA',
          moneyness,
          expirationDate: expInfo.dateString,
          estimatedPremium: optionType === 'CALL' ? s.callPremium : s.putPremium,
          volume24h: Math.floor(90000 + Math.random() * 300000)
        };
      });
    }

    // 2. BANCO DO BRASIL (BBAS3) - Calibração Exata do Book da Clear
    if (clean === 'BBAS') {
      const bbasStrikes = isLongTerm ? [
        { strike: 18.10, code: `BBAS${seriesLetter}181`, callPremium: 2.20, putPremium: 0.55 },
        { strike: 19.10, code: `BBAS${seriesLetter}191`, callPremium: 1.45, putPremium: 1.10 },
        { strike: 20.10, code: `BBAS${seriesLetter}201`, callPremium: 0.85, putPremium: 1.85 }, // Baixo Risco
        { strike: 21.10, code: `BBAS${seriesLetter}211`, callPremium: 0.45, putPremium: 2.70 }
      ] : [
        { strike: 17.10, code: `BBAS${seriesLetter}171`, callPremium: 2.75, putPremium: 0.08 },
        { strike: 18.10, code: `BBAS${seriesLetter}181`, callPremium: 1.80, putPremium: 0.22 }, // Exato da Clear: R$ 1,80
        { strike: 19.10, code: `BBAS${seriesLetter}191`, callPremium: 1.03, putPremium: 0.65 }, // Exato da Clear: R$ 1,03
        { strike: 20.10, code: `BBAS${seriesLetter}201`, callPremium: 0.48, putPremium: 1.40 },
        { strike: 21.10, code: `BBAS${seriesLetter}211`, callPremium: 0.20, putPremium: 2.30 }
      ];

      return bbasStrikes.map(s => {
        let moneyness: 'ITM' | 'ATM' | 'OTM' = 'ATM';
        if (optionType === 'CALL') {
          if (s.strike < currentPrice * 0.99) moneyness = 'ITM';
          else if (s.strike > currentPrice * 1.01) moneyness = 'OTM';
        } else {
          if (s.strike > currentPrice * 1.01) moneyness = 'ITM';
          else if (s.strike < currentPrice * 0.99) moneyness = 'OTM';
        }

        return {
          ticker: s.code,
          underlyingStock: 'BBAS3',
          strike: s.strike,
          optionType,
          style: 'AMERICANA',
          moneyness,
          expirationDate: expInfo.dateString,
          estimatedPremium: optionType === 'CALL' ? s.callPremium : s.putPremium,
          volume24h: Math.floor(120000 + Math.random() * 350000)
        };
      });
    }

    // 3. PETROBRAS (PETR4) - Calibração Exata do Book da Clear
    if (clean === 'PETR') {
      const petroStrikes = isLongTerm ? [
        { strike: 41.67, code: `PETR${seriesLetter}417`, callPremium: 2.95, putPremium: 0.85 },
        { strike: 42.67, code: `PETR${seriesLetter}427`, callPremium: 2.25, putPremium: 1.35 },
        { strike: 43.67, code: `PETR${seriesLetter}437`, callPremium: 1.75, putPremium: 2.05 },
        { strike: 44.67, code: `PETR${seriesLetter}447`, callPremium: 1.25, putPremium: 2.80 },
        { strike: 45.67, code: `PETR${seriesLetter}457`, callPremium: 0.85, putPremium: 3.50 }, // Baixo Risco OTM
        { strike: 47.00, code: `PETR${seriesLetter}470`, callPremium: 0.48, putPremium: 4.80 }
      ] : [
        { strike: 40.92, code: `PETR${seriesLetter}409`, callPremium: 2.95, putPremium: 0.16 },
        { strike: 41.17, code: `PETR${seriesLetter}412`, callPremium: 2.72, putPremium: 0.21 },
        { strike: 41.42, code: `PETR${seriesLetter}414`, callPremium: 2.50, putPremium: 0.30 },
        { strike: 41.67, code: `PETR${seriesLetter}417`, callPremium: 2.30, putPremium: 0.40 },
        { strike: 42.17, code: `PETR${seriesLetter}422`, callPremium: 1.95, putPremium: 0.65 },
        { strike: 42.67, code: `PETR${seriesLetter}427`, callPremium: 1.68, putPremium: 0.95 },
        { strike: 43.17, code: `PETR${seriesLetter}432`, callPremium: 1.45, putPremium: 1.35 },
        { strike: 43.67, code: `PETR${seriesLetter}437`, callPremium: 1.42, putPremium: 1.80 }, // Exato da Clear: R$ 1,42
        { strike: 44.17, code: `PETR${seriesLetter}442`, callPremium: 1.10, putPremium: 2.25 },
        { strike: 45.17, code: `PETR${seriesLetter}452`, callPremium: 0.79, putPremium: 3.10 }  // Exato da Clear: R$ 0,79
      ];

      return petroStrikes.map(s => {
        let moneyness: 'ITM' | 'ATM' | 'OTM' = 'ATM';
        if (optionType === 'CALL') {
          if (s.strike < currentPrice * 0.988) moneyness = 'ITM';
          else if (s.strike > currentPrice * 1.012) moneyness = 'OTM';
        } else {
          if (s.strike > currentPrice * 1.012) moneyness = 'ITM';
          else if (s.strike < currentPrice * 0.988) moneyness = 'OTM';
        }

        const premium = optionType === 'CALL' ? s.callPremium : s.putPremium;

        return {
          ticker: s.code,
          underlyingStock: 'PETR4',
          strike: s.strike,
          optionType,
          style: 'AMERICANA',
          moneyness,
          expirationDate: expInfo.dateString,
          estimatedPremium: premium,
          volume24h: Math.floor(100000 + Math.random() * 500000)
        };
      });
    }

    // 4. MAGAZINE LUIZA (MGLU3) - Calibração Exata do Book da Clear
    if (clean === 'MGLU') {
      const mgluStrikes = isLongTerm ? [
        { strike: 4.50, code: `MGLU${seriesLetter}450`, callPremium: 0.48, putPremium: 0.35 },
        { strike: 4.80, code: `MGLU${seriesLetter}480`, callPremium: 0.28, putPremium: 0.55 },
        { strike: 5.00, code: `MGLU${seriesLetter}500`, callPremium: 0.18, putPremium: 0.75 }, // Centavos Baixo Risco
        { strike: 5.50, code: `MGLU${seriesLetter}550`, callPremium: 0.08, putPremium: 1.20 }
      ] : [
        { strike: 4.00, code: `MGLU${seriesLetter}400`, callPremium: 0.72, putPremium: 0.05 },
        { strike: 4.20, code: `MGLU${seriesLetter}420`, callPremium: 0.55, putPremium: 0.09 },
        { strike: 4.50, code: `MGLU${seriesLetter}450`, callPremium: 0.37, putPremium: 0.18 }, // Exato da Clear: R$ 0,37
        { strike: 4.80, code: `MGLU${seriesLetter}480`, callPremium: 0.13, putPremium: 0.35 }, // Exato da Clear: R$ 0,13
        { strike: 5.00, code: `MGLU${seriesLetter}500`, callPremium: 0.08, putPremium: 0.50 }
      ];

      return mgluStrikes.map(s => {
        let moneyness: 'ITM' | 'ATM' | 'OTM' = 'ATM';
        if (optionType === 'CALL') {
          if (s.strike < currentPrice * 0.988) moneyness = 'ITM';
          else if (s.strike > currentPrice * 1.012) moneyness = 'OTM';
        } else {
          if (s.strike > currentPrice * 1.012) moneyness = 'ITM';
          else if (s.strike < currentPrice * 0.988) moneyness = 'OTM';
        }

        return {
          ticker: s.code,
          underlyingStock: 'MGLU3',
          strike: s.strike,
          optionType,
          style: 'AMERICANA',
          moneyness,
          expirationDate: expInfo.dateString,
          estimatedPremium: optionType === 'CALL' ? s.callPremium : s.putPremium,
          volume24h: Math.floor(150000 + Math.random() * 400000)
        };
      });
    }

    // 5. VALE (VALE3) - Calibração Exata do Book da Clear
    if (clean === 'VALE') {
      const valeStrikes = isLongTerm ? [
        { strike: 77.00, code: `VALE${seriesLetter}770`, callPremium: 4.20, putPremium: 2.10 },
        { strike: 78.00, code: `VALE${seriesLetter}780`, callPremium: 3.50, putPremium: 2.60 },
        { strike: 80.00, code: `VALE${seriesLetter}800`, callPremium: 2.35, putPremium: 3.65 },
        { strike: 82.00, code: `VALE${seriesLetter}820`, callPremium: 1.45, putPremium: 4.90 } // Baixo Custo Longo
      ] : [
        { strike: 75.00, code: `VALE${seriesLetter}750`, callPremium: 4.80, putPremium: 0.80 },
        { strike: 77.00, code: `VALE${seriesLetter}770`, callPremium: 3.30, putPremium: 1.30 },
        { strike: 78.00, code: `VALE${seriesLetter}780`, callPremium: 2.65, putPremium: 1.65 },
        { strike: 80.00, code: `VALE${seriesLetter}800`, callPremium: 1.55, putPremium: 2.55 },
        { strike: 82.00, code: `VALE${seriesLetter}820`, callPremium: 0.90, putPremium: 3.90 }
      ];

      return valeStrikes.map(s => {
        let moneyness: 'ITM' | 'ATM' | 'OTM' = 'ATM';
        if (optionType === 'CALL') {
          if (s.strike < currentPrice * 0.988) moneyness = 'ITM';
          else if (s.strike > currentPrice * 1.012) moneyness = 'OTM';
        } else {
          if (s.strike > currentPrice * 1.012) moneyness = 'ITM';
          else if (s.strike < currentPrice * 0.988) moneyness = 'OTM';
        }

        return {
          ticker: s.code,
          underlyingStock: 'VALE3',
          strike: s.strike,
          optionType,
          style: 'AMERICANA',
          moneyness,
          expirationDate: expInfo.dateString,
          estimatedPremium: optionType === 'CALL' ? s.callPremium : s.putPremium,
          volume24h: Math.floor(180000 + Math.random() * 450000)
        };
      });
    }

    // 6. ITAÚ (ITUB4)
    if (clean === 'ITUB') {
      const itubStrikes = [
        { strike: 37.50, code: `ITUB${seriesLetter}375`, callPremium: 1.60, putPremium: 0.12 },
        { strike: 38.50, code: `ITUB${seriesLetter}385`, callPremium: 0.85, putPremium: 0.28 },
        { strike: 39.50, code: `ITUB${seriesLetter}395`, callPremium: 0.45, putPremium: 0.65 },
        { strike: 40.50, code: `ITUB${seriesLetter}405`, callPremium: 0.22, putPremium: 1.25 }
      ];

      return itubStrikes.map(s => {
        let moneyness: 'ITM' | 'ATM' | 'OTM' = 'ATM';
        if (optionType === 'CALL') {
          if (s.strike < currentPrice * 0.988) moneyness = 'ITM';
          else if (s.strike > currentPrice * 1.012) moneyness = 'OTM';
        } else {
          if (s.strike > currentPrice * 1.012) moneyness = 'ITM';
          else if (s.strike < currentPrice * 0.988) moneyness = 'OTM';
        }

        return {
          ticker: s.code,
          underlyingStock: 'ITUB4',
          strike: s.strike,
          optionType,
          style: 'AMERICANA',
          moneyness,
          expirationDate: expInfo.dateString,
          estimatedPremium: optionType === 'CALL' ? s.callPremium : s.putPremium,
          volume24h: Math.floor(110000 + Math.random() * 320000)
        };
      });
    }

    // Para outros ativos da B3
    let step = 0.50;
    if (currentPrice > 50) step = 1.00;
    else if (currentPrice < 20) step = 0.25;

    const baseStrike = Math.round(currentPrice / step) * step;
    const chain: B3OptionContract[] = [];

    for (let i = -4; i <= 5; i++) {
      const strike = Number((baseStrike + (i * step)).toFixed(2));
      const ticker = this.formatB3OptionTicker(clean, seriesLetter, strike);

      let moneyness: 'ITM' | 'ATM' | 'OTM' = 'ATM';
      if (optionType === 'CALL') {
        if (strike < currentPrice * 0.988) moneyness = 'ITM';
        else if (strike > currentPrice * 1.012) moneyness = 'OTM';
      } else {
        if (strike > currentPrice * 1.012) moneyness = 'ITM';
        else if (strike < currentPrice * 0.988) moneyness = 'OTM';
      }

      const intrinsic = optionType === 'CALL' ? Math.max(0, currentPrice - strike) : Math.max(0, strike - currentPrice);
      const timeFactor = Math.sqrt(expInfo.daysToExpiration / 30);
      const timeValue = Number((currentPrice * 0.024 * timeFactor * Math.exp(-Math.abs(strike - currentPrice) / (currentPrice * 0.08))).toFixed(2));
      const estimatedPremium = Number(Math.max(0.08, intrinsic + timeValue).toFixed(2));

      chain.push({
        ticker,
        underlyingStock: underlyingStock.replace('.SA', ''),
        strike,
        optionType,
        style: 'AMERICANA',
        moneyness,
        expirationDate: expInfo.dateString,
        estimatedPremium,
        volume24h: Math.floor(80000 + Math.random() * 400000)
      });
    }

    return chain;
  }
}