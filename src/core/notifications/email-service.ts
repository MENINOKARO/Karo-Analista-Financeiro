import nodemailer from 'nodemailer';

export interface SendResetEmailParams {
  toEmail: string;
  userName?: string;
  resetCode: string;
}

export class EmailService {
  public static async sendPasswordResetEmail({
    toEmail,
    userName,
    resetCode
  }: SendResetEmailParams): Promise<{ success: boolean; provider?: string; error?: string }> {
    const cleanEmail = toEmail.toLowerCase().trim();
    const displayName = userName || cleanEmail.split('@')[0];

    const htmlContent = `
      <div style="background:#0b101d;color:#f1f5f9;font-family:sans-serif;padding:24px;border-radius:12px;max-width:500px;margin:auto;border:1px solid #1e293b;">
        <div style="text-align:center;padding-bottom:16px;border-bottom:1px solid #1e293b;">
          <h2 style="color:#38bdf8;margin:0;">⚡ KARO ANALISTA FINANCEIRO</h2>
          <p style="color:#94a3b8;font-size:13px;margin:4px 0 0 0;">Recuperação de Senha</p>
        </div>
        <div style="padding:20px 0;font-size:14px;color:#cbd5e1;line-height:1.6;">
          Olá, <strong>${displayName}</strong>.<br><br>
          Seu código de segurança de 6 dígitos para redefinir sua senha é:
          <div style="background:#0f172a;border:2px dashed #0284c7;border-radius:8px;padding:16px;text-align:center;margin:16px 0;">
            <span style="font-family:monospace;font-size:28px;font-weight:bold;letter-spacing:6px;color:#38bdf8;">${resetCode}</span>
            <div style="font-size:11px;color:#64748b;margin-top:6px;">⏱️ Válido por 30 minutos</div>
          </div>
          Caso você não tenha solicitado este código, ignore esta mensagem.
        </div>
        <div style="text-align:center;border-top:1px solid #1e293b;padding-top:12px;font-size:11px;color:#475569;">
          © Karo Analista Financeiro • B3 & Opções
        </div>
      </div>
    `;

    // 1. Envio via Resend API
    if (process.env.RESEND_API_KEY) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'Karo Analista <onboarding@resend.dev>',
            to: [cleanEmail],
            subject: `Seu Código de Recuperação: ${resetCode} - Karo Analista`,
            html: htmlContent
          })
        });
        if (res.ok) {
          console.log('[EmailService] E-mail enviado via Resend para', cleanEmail);
          return { success: true, provider: 'RESEND' };
        }
      } catch (err: any) {
        console.error('[EmailService] Falha Resend:', err.message);
      }
    }

    // 2. Envio via SMTP (Gmail, Brevo, Sendgrid, etc.)
    const smtpHost = process.env.SMTP_HOST || (process.env.GMAIL_USER ? 'smtp.gmail.com' : null);
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS || process.env.GMAIL_PASSWORD;
    const smtpPort = Number(process.env.SMTP_PORT) || 465;
    const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: { user: smtpUser, pass: smtpPass }
        });
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || `Karo Analista <${smtpUser}>`,
          to: cleanEmail,
          subject: `Código de Recuperação: ${resetCode} - Karo Analista Financeiro`,
          html: htmlContent
        });
        console.log('[EmailService] E-mail enviado via SMTP para', cleanEmail);
        return { success: true, provider: 'SMTP' };
      } catch (err: any) {
        console.error('[EmailService] Falha SMTP:', err.message);
      }
    }

    console.log(`[EmailService Local] Código ${resetCode} gerado para ${cleanEmail}`);
    return { success: false, provider: 'LOCAL', error: 'Configure SMTP ou RESEND_API_KEY para disparo ao vivo.' };
  }
}