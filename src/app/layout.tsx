import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Karo Analista Financeiro - Scanner Sênior 5m & Inteligência de Mercado',
  description: 'Plataforma institucional de análise quantitativa, scanner de mercado financeiro em tempo real para ações B3, Opções Reais e Criptoativos.',
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
