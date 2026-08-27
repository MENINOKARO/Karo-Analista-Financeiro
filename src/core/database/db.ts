import fs from 'fs';
import path from 'path';
import { ActivePosition, PortfolioSummary } from '../types';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  plan: 'FREE' | 'PRO' | 'INSTITUTIONAL';
}

export interface StoredTradePosition extends ActivePosition {
  userId: string;
  modality?: 'OPTIONS' | 'SWING' | 'DAYTRADE';
  optionTicker?: string;
  optionStrike?: number;
  optionType?: 'CALL' | 'PUT';
  strategyTitle?: string;
  notes?: string;
}

export interface DatabaseSchema {
  users: UserProfile[];
  portfolios: Record<string, StoredTradePosition[]>; // key: userId
  closedTrades: Record<string, StoredTradePosition[]>; // key: userId
}

export class KaroDatabase {
  private static DB_PATH = path.join(process.cwd(), 'data', 'karo_db.json');
  private static cachedData: DatabaseSchema | null = null;

  // Carrega ou inicializa a base de dados
  private static load(): DatabaseSchema {
    if (this.cachedData) return this.cachedData;

    try {
      if (fs.existsSync(this.DB_PATH)) {
        const raw = fs.readFileSync(this.DB_PATH, 'utf8');
        this.cachedData = JSON.parse(raw);
        return this.cachedData!;
      }
    } catch (err) {
      console.warn('Não foi possível ler karo_db.json do disco, usando cache de memória:', err);
    }

    // Default Inicial
    this.cachedData = {
      users: [
        {
          id: 'usr_demo',
          name: 'Investidor Pro',
          email: 'investidor@karo.com.br',
          passwordHash: 'demo123',
          createdAt: new Date().toISOString(),
          plan: 'INSTITUTIONAL'
        }
      ],
      portfolios: {
        usr_demo: [
          {
            id: 'pos-init-1',
            userId: 'usr_demo',
            ticker: 'PETRI437',
            name: 'Petrobras PN (Call OTM R$ 43,67)',
            market: 'B3',
            direction: 'BUY',
            entryPrice: 1.42,
            currentPrice: 1.58,
            quantity: 100,
            totalInvested: 142.00,
            currentValue: 158.00,
            pnlAmount: 16.00,
            pnlPercent: 11.27,
            stopLoss: 0.00,
            target1: 45.00,
            target2: 47.00,
            openedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            status: 'ABERTA',
            robotAdvice: '🛡️ Opção no lucro (+11.27%). Deixe o movimento acelerar em direção ao Alvo 1.',
            originSetup: 'Compra de Call OTM (PETRI437)',
            modality: 'OPTIONS',
            optionTicker: 'PETRI437',
            optionStrike: 43.67
          }
        ]
      },
      closedTrades: {
        usr_demo: []
      }
    };

    this.save();
    return this.cachedData;
  }

  // Grava alterações no disco com segurança
  private static save(): void {
    if (!this.cachedData) return;

    try {
      const dir = path.dirname(this.DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.DB_PATH, JSON.stringify(this.cachedData, null, 2), 'utf8');
    } catch (err) {
      console.warn('Aviso: Falha ao persistir em disco (ambiente serverless/read-only). Dados mantidos em memória:', err);
    }
  }

  // ==================== USUÁRIOS & AUTENTICAÇÃO ====================

  public static findUserByEmail(email: string): UserProfile | null {
    const db = this.load();
    const cleanEmail = email.toLowerCase().trim();
    return db.users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  }

  public static findUserById(id: string): UserProfile | null {
    const db = this.load();
    return db.users.find(u => u.id === id) || null;
  }

  public static createUser(name: string, email: string, passwordHash: string): UserProfile {
    const db = this.load();
    const cleanEmail = email.toLowerCase().trim();
    const existing = this.findUserByEmail(cleanEmail);
    if (existing) {
      throw new Error('E-mail já cadastrado no sistema.');
    }

    const newUser: UserProfile = {
      id: "usr_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
      plan: 'PRO'
    };

    db.users.push(newUser);
    db.portfolios[newUser.id] = [];
    db.closedTrades[newUser.id] = [];
    this.save();
    return newUser;
  }

  // ==================== CARTEIRA & POSIÇÕES PERSISTENTES ====================

  public static getUserPositions(userId: string): StoredTradePosition[] {
    const db = this.load();
    return db.portfolios[userId] || [];
  }

  public static addPosition(userId: string, position: StoredTradePosition): StoredTradePosition {
    const db = this.load();
    if (!db.portfolios[userId]) {
      db.portfolios[userId] = [];
    }

    db.portfolios[userId].unshift(position);
    this.save();
    return position;
  }

  public static removePosition(userId: string, positionId: string): boolean {
    const db = this.load();
    if (!db.portfolios[userId]) return false;

    const idx = db.portfolios[userId].findIndex(p => p.id === positionId);
    if (idx !== -1) {
      const [removed] = db.portfolios[userId].splice(idx, 1);
      if (!db.closedTrades[userId]) db.closedTrades[userId] = [];
      db.closedTrades[userId].unshift(removed);
      this.save();
      return true;
    }
    return false;
  }

  public static getPortfolioSummary(userId: string): PortfolioSummary {
    const positions = this.getUserPositions(userId);
    const totalInvested = positions.reduce((acc, p) => acc + (p.totalInvested || 0), 0);
    const totalCurrent = positions.reduce((acc, p) => acc + (p.currentValue || p.totalInvested || 0), 0);
    const totalPnl = totalCurrent - totalInvested;
    const totalPnlPct = totalInvested > 0 ? Number(((totalPnl / totalInvested) * 100).toFixed(2)) : 0;

    const winning = positions.filter(p => (p.pnlAmount || 0) > 0).length;
    const losing = positions.filter(p => (p.pnlAmount || 0) < 0).length;

    return {
      totalCapitalInvested: Number(totalInvested.toFixed(2)),
      totalCurrentValue: Number(totalCurrent.toFixed(2)),
      totalPnlAmount: Number(totalPnl.toFixed(2)),
      totalPnlPercent: totalPnlPct,
      openPositionsCount: positions.length,
      winningPositionsCount: winning,
      losingPositionsCount: losing,
      positions: [...positions]
    };
  }
}
