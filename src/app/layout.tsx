import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MarketMaster AI - Scanner Sênior 5 Minutos & Sinais Institucionais',
  description: 'Plataforma institucional de análise quantitativa e scanner de mercado financeiro em tempo real para ações B3 e Globais.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#090d16] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
