import { NextRequest, NextResponse } from 'next/server';
import { KaroDatabase } from '@/core/database/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId é obrigatório' }, { status: 400 });
    }

    const user = KaroDatabase.findUserById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Usuário não encontrado' }, { status: 404 });
    }

    const { passwordHash, ...safeUser } = user;
    return NextResponse.json({ success: true, user: safeUser });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    // 1. CADASTRO DE USUÁRIO
    if (action === 'REGISTER') {
      const { name, email, password } = payload;
      if (!name || !email || !password) {
        return NextResponse.json({ success: false, message: 'Nome, e-mail e senha são obrigatórios.' }, { status: 400 });
      }

      const existing = KaroDatabase.findUserByEmail(email);
      if (existing) {
        return NextResponse.json({ success: false, message: 'Este e-mail já está cadastrado.' }, { status: 409 });
      }

      const newUser = KaroDatabase.createUser(name, email, password);
      const { passwordHash, ...safeUser } = newUser;

      return NextResponse.json({
        success: true,
        message: 'Conta criada com sucesso!',
        user: safeUser,
        token: 'karo_token_' + safeUser.id
      });
    }

    // 2. LOGIN DE USUÁRIO
    if (action === 'LOGIN') {
      const { email, password } = payload;
      if (!email || !password) {
        return NextResponse.json({ success: false, message: 'E-mail e senha são obrigatórios.' }, { status: 400 });
      }

      const user = KaroDatabase.findUserByEmail(email);
      if (!user || user.passwordHash !== password) {
        return NextResponse.json({ success: false, message: 'E-mail ou senha incorretos.' }, { status: 401 });
      }

      const { passwordHash, ...safeUser } = user;
      return NextResponse.json({
        success: true,
        message: 'Login realizado com sucesso!',
        user: safeUser,
        token: 'karo_token_' + safeUser.id
      });
    }

    // 3. ACESSO RÁPIDO / VISITANTE
    if (action === 'GUEST_SESSION') {
      const guestName = payload?.name || 'Investidor Visitante';
      const guestEmail = 'visitante_' + Date.now() + '@karo.demo';
      const guestUser = KaroDatabase.createUser(guestName, guestEmail, 'guest_pass');
      const { passwordHash, ...safeUser } = guestUser;

      return NextResponse.json({
        success: true,
        message: 'Sessão de visitante iniciada!',
        user: safeUser,
        token: 'karo_token_' + safeUser.id
      });
    }

    return NextResponse.json({ success: false, message: 'Ação não suportada.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}