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

    // 0. SINCRONIZAÇÃO DE USUÁRIOS DO CLIENTE
    if (action === 'SYNC_USERS') {
      const { users } = payload;
      if (Array.isArray(users) && users.length > 0) {
        KaroDatabase.syncUsers(users);
      }
      return NextResponse.json({ success: true, message: 'Banco de dados sincronizado.' });
    }

    // 1. CADASTRO DE USUÁRIO
    if (action === 'REGISTER') {
      const { name, email, password } = payload;
      if (!name || !email || !password) {
        return NextResponse.json({ success: false, message: 'Nome, e-mail e senha são obrigatórios.' }, { status: 400 });
      }

      const existing = KaroDatabase.findUserByEmail(email);
      if (existing) {
        return NextResponse.json({ success: false, message: 'Este e-mail já está cadastrado. Por favor, faça login.' }, { status: 409 });
      }

      const newUser = KaroDatabase.createUser(name, email, password);
      const { passwordHash, ...safeUser } = newUser;

      return NextResponse.json({
        success: true,
        message: 'Conta criada com sucesso!',
        user: safeUser,
        token: `karo_token_${safeUser.id}`
      });
    }

    // 2. LOGIN DE USUÁRIO (VALIDAÇÃO ESTRITA DE SENHA E CADASTRO)
    if (action === 'LOGIN') {
      const { email, password } = payload;
      if (!email || !password) {
        return NextResponse.json({ success: false, message: 'E-mail e senha são obrigatórios.' }, { status: 400 });
      }

      const user = KaroDatabase.findUserByEmail(email);
      if (!user) {
        return NextResponse.json({ 
          success: false, 
          message: 'Usuário não cadastrado. Por favor, crie uma conta na aba Cadastrar.' 
        }, { status: 404 });
      }

      if (user.passwordHash !== password) {
        return NextResponse.json({ 
          success: false, 
          message: 'Senha incorreta. Verifique sua senha ou use a recuperação de senha.' 
        }, { status: 401 });
      }

      const { passwordHash, ...safeUser } = user;
      return NextResponse.json({
        success: true,
        message: 'Login realizado com sucesso!',
        user: safeUser,
        token: `karo_token_${safeUser.id}`
      });
    }

    // 3. ACESSO RÁPIDO / VISITANTE
    if (action === 'GUEST_SESSION') {
      const guestName = payload?.name || 'Investidor Visitante';
      const guestEmail = `visitante_${Date.now()}@karo.demo`;
      const guestUser = KaroDatabase.createUser(guestName, guestEmail, 'guest_pass');
      const { passwordHash, ...safeUser } = guestUser;

      return NextResponse.json({
        success: true,
        message: 'Sessão de visitante iniciada!',
        user: safeUser,
        token: `karo_token_${safeUser.id}`
      });
    }

    // 4. SOLICITAÇÃO DE RECUPERAÇÃO DE SENHA (ESQUECI MINHA SENHA)
    if (action === 'FORGOT_PASSWORD') {
      const { email } = payload;
      if (!email) {
        return NextResponse.json({ success: false, message: 'Por favor, informe seu e-mail.' }, { status: 400 });
      }

      try {
        const { code, email: cleanEmail, user } = KaroDatabase.createPasswordResetCode(email);
        const { passwordHash, ...safeUser } = user;
        return NextResponse.json({
          success: true,
          message: `Código de verificação enviado para ${cleanEmail}!`,
          codeSimulation: code,
          user: safeUser
        });
      } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 404 });
      }
    }

    // 5. VALIDAR CÓDIGO DE RECUPERAÇÃO (NÃO LIBERA A SENHA SE ESTIVER ERRADO)
    if (action === 'VERIFY_RESET_CODE') {
      const { email, code } = payload;
      if (!email || !code) {
        return NextResponse.json({ success: false, message: 'E-mail e código de verificação são obrigatórios.' }, { status: 400 });
      }

      try {
        KaroDatabase.verifyPasswordResetCode(email, code);
        return NextResponse.json({
          success: true,
          message: 'Código de verificação validado com sucesso! Agora você pode definir sua nova senha.'
        });
      } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
      }
    }

    // 6. REDEFINIÇÃO DE SENHA COM CÓDIGO VALIDADO
    if (action === 'RESET_PASSWORD') {
      const { email, code, newPassword } = payload;
      if (!email || !code || !newPassword) {
        return NextResponse.json({ success: false, message: 'E-mail, código e nova senha são obrigatórios.' }, { status: 400 });
      }

      try {
        const user = KaroDatabase.validateAndResetPassword(email, code, newPassword);
        const { passwordHash, ...safeUser } = user;

        return NextResponse.json({
          success: true,
          message: 'Senha redefinida com sucesso! Você já está conectado.',
          user: safeUser,
          token: `karo_token_${safeUser.id}`
        });
      } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 400 });
      }
    }

    // 6. ATUALIZAÇÃO DE PERFIL / SENHA
    if (action === 'UPDATE_PROFILE') {
      const { userId, name, email, oldPassword, newPassword, riskProfile } = payload;
      if (!userId) {
        return NextResponse.json({ success: false, message: 'userId é obrigatório.' }, { status: 400 });
      }

      const user = KaroDatabase.findUserById(userId);
      if (!user) {
        return NextResponse.json({ success: false, message: 'Usuário não encontrado.' }, { status: 404 });
      }

      const updates: any = {};
      if (name) updates.name = name;
      if (email) updates.email = email;
      if (riskProfile) updates.riskProfile = riskProfile;

      if (newPassword) {
        if (!oldPassword || user.passwordHash !== oldPassword) {
          return NextResponse.json({ success: false, message: 'Senha atual incorreta.' }, { status: 401 });
        }
        updates.passwordHash = newPassword;
      }

      const updated = KaroDatabase.updateUserProfile(userId, updates);
      const { passwordHash, ...safeUser } = updated;

      return NextResponse.json({
        success: true,
        message: 'Perfil atualizado com sucesso!',
        user: safeUser
      });
    }

    return NextResponse.json({ success: false, message: 'Ação não suportada.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}