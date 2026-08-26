# 🏛️ Karo Analista Financeiro (Senior Analyst Pro)

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Status](https://img.shields.io/badge/Status-Produção%20Ativa-emerald?style=for-the-badge)
![Mercados](https://img.shields.io/badge/Mercados-B3%20%7C%20Opções%20%7C%20Cripto-gold?style=for-the-badge)

**Plataforma Institucional de Inteligência Quantitativa, Scanner Contínuo de 5 Minutos e Motor de Confluência Multiestratégia para Ações da B3, Opções Reais e Criptoativos.**

[🌐 Acessar Demonstração](#-deploy--hospedagem) • [✨ Funcionalidades](#-principais-ferramentas--funcionalidades) • [🏛️ Metodologias](#-as-7-metodologias-institucionais) • [🚀 Como Rodar](#-instalação-e-execução-local)

</div>

---

## ⚠️ Aviso Legal e Isenção de Responsabilidade (Disclaimer)
> O **Karo Analista Financeiro** é uma ferramenta de suporte analítico e inteligência algorítmica. Todas as análises, estruturas de opções, scores de confluência e projeções apresentadas são **estudos analíticos e sugestões técnicas**. O usuário é **única e exclusivamente responsável** pela tomada de decisão, verificação de preços em sua própria corretora e gerenciamento do seu capital. Rentabilidade passada não é garantia de resultados futuros.

---

## 🌟 Visão Geral

O **Karo Analista Financeiro** foi concebido sob os padrões de uma **Mesa de Operações Institucional Global (*Top Tier Desk*)**, combinando:
1. **Rigor Matemático e Confluência Multinível**: Exige o alinhamento de 7 grandes escolas do trading clássico e moderno antes de disparar uma recomendação.
2. **Cotações e Cadeias de Opções Reais da B3**: Calibração exata dos strikes oficiais (Série I - Setembro 2026) e prêmios correspondentes aos livros de ofertas reais de corretoras como **Clear, XP, BTG Pactual e Genial**.
3. **Visão Multicenários da Mesa**: Cada oportunidade possui um mapeamento de 3 cenários (Cenário de Alta com Breakeven, Cenário Lateral com desmonte preventivo e Cenário de Invalidação com Stop técnico rigoroso).

---

## 🛠️ Principais Ferramentas & Módulos

### 1. ⚡ Radar 5m (Scanner de Alta Confluência)
- Varredura contínua e em tempo real em mais de **26 ativos** da B3 e Cripto.
- Filtro rigoroso: Apenas setups com **Score Institucional $\ge 80\%$**.
- Seleção instantânea de modalidade:
  - 💎 **Opções Reais B3** (Trava de Alta, Compra a Seco, Venda Coberta de Renda).
  - 📊 **Ações à Vista - Swing Trade** (Lote Padrão de 100 ou Fracionário `F`).
  - ⚡ **Day Trade no 5m** (Alvos rápidos e encerramento intraday).

### 2. 💎 Motor de Opções Reais B3 (Série I - Setembro 2026)
- Identificação precisa de códigos oficiais da B3:
  - **Petrobras (`PETR4`)**: `PETRI417` (Strike R$ 41,67), `PETRI437` (Strike R$ 43,67), `PETRI452` (Strike R$ 45,17).
  - **Bradesco (`BBDC4`)**: `BBDCI168` (Strike R$ 16,75 a R$ 0,35), `BBDCI170`, `BBDCI173`.
  - **Magazine Luiza (`MGLU3`)**: `MGLUI450` (Strike R$ 4,50 a R$ 0,37), `MGLUI480` (Strike R$ 4,80 a R$ 0,13).
  - **Banco do Brasil (`BBAS3`)**: `BBASI181` (R$ 1,80), `BBASI191` (R$ 1,03).
  - **Vale (`VALE3`)**: `VALEI780` (Strike R$ 78,00), `VALEI800`.
- Simulador financeiro em Reais (R$) para 10, 100, 200, 500 ou 1.000 opções com indicação exata de **Custo Máximo, Lucro Potencial e Risco Limitado**.

### 3. 🪙 Mercado Cripto 24/7 (Spot & Futuros)
- Acompanhamento dos principais ativos globais: **Bitcoin (`BTC-USD`)**, **Ethereum (`ETH-USD`)**, **Solana (`SOL-USD`)**, **Binance Coin (`BNB-USD`)**, **Avalanche (`AVAX-USD`)**.
- Estratégias spot direcional e futuros com gestão de alavancagem isolada.

### 4. 📰 Notícias Institucionais com NLP & Mapeamento de Catalisadores
- Ingestão ao vivo multi-fonte via RSS: **Google News Brasil (Mercado & Empresas)**, **Valor Econômico**, **G1 Economia**, **Folha Mercado** e **Broadcast B3**.
- Classificação automática de sentimento (Bullish, Bearish, Neutro) e tópicos críticos:
  - ⚠️ Recuperação Judicial & Crédito
  - 💰 Resultados Corporativos & Dividendos
  - 🏛️ Política Monetária (Selic / Copom / Fed)
  - 🛢️ Commodities Globais (Petróleo Brent / Minério de Ferro)
- Botão direto para leitura completa da matéria no portal de origem.

### 5. 🎯 Planejador de Metas Financeiras (3 Modalidades)
- O usuário define sua meta (R$ fixo ou percentual) e o robô calcula 3 opções para atingir o objetivo:
  - **Opção 1 (Conservadora)**: Ações à Vista com risco mínimo.
  - **Opção 2 (Moderada)**: Estruturas de Opções B3 com risco travado.
  - **Opção 3 (Agressiva)**: Day Trade com alavancagem intraday.

### 6. 💼 Gestão de Carteira & Acompanhamento Ativo
- Botão **`[⚡ Entrei no Trade!]`** em cada oportunidade para acompanhamento ao vivo.
- O robô monitora a posição em tempo real, informando quando realizar 50% no Alvo 1 e quando puxar o Stop Loss para o *Breakeven*.

### 7. 🛡️ Calculadora de Risco & Dimensionamento de Lotes
- Cálculo automático de lotes ideais respeitando a regra clássica de risco máximo de 1% a 2% do capital.

---

## 🏛️ As 7 Metodologias Institucionais

| Metodologia | Autor / Escola | Aplicação no Karo Analista |
| :--- | :--- | :--- |
| **Wyckoff Method** | Richard Wyckoff | Fases de Acumulação, Reacumulação, *Spring* e *Sign of Strength (SOS)*. |
| **Price Action** | Al Brooks | Barras de Sinal, Canais Estreitos, Falhas de Rompimento e Entradas H2/L2. |
| **Barra Elefante & Médias** | Oliver Velez | Barras de Ignição, Médias Móveis EMA 20/200 e *Bottoming Tails*. |
| **SEPA® & VCP** | Mark Minervini | Padrões de Contração de Volatilidade e Alinhamento de Tendência Institucional. |
| **Smart Money (SMC / ICT)** | Michael Huddleston | *Fair Value Gaps (FVG)*, Capturas de Liquidez e Blocos de Ordem (*Order Blocks*). |
| **Larry Williams 9.1/9.2** | Larry Williams | Gatilhos de reversão e continuidade baseados na inclinação da EMA 9. |
| **Triple Screen System** | Alexander Elder | Análise de 3 tempos gráficos (Diário, 15m e 5m) para filtrar ruído de mercado. |

---

## 🚀 Instalação e Execução Local

### Pré-requisitos:
- [Node.js](https://nodejs.org/) versão 18.x ou superior.
- NPM ou Yarn.

### Passo a Passo:

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/MENINOKARO/Karo-Analista-Financeiro.git
   cd Karo-Analista-Financeiro
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Acesse no seu navegador**:
   👉 `http://localhost:3000`

*(No Windows, você também pode simplesmente dar um duplo clique em `start-marketmaster.bat`)*.

---

## 🌐 Deploy & Hospedagem

### Deploy na Vercel (Recomendado):
1. Instale a CLI da Vercel (se necessário):
   ```bash
   npm i -g vercel
   ```
2. Execute o deploy:
   ```bash
   npx vercel --prod
   ```

### Deploy com Docker:
```bash
docker-compose up -d --build
```

---

## 📄 Licença
Distribuído sob a licença MIT. Consulte `LICENSE` para mais detalhes.

---

<div align="center">
Desenvolvido com foco em precisão, transparência e excelência analítica institucional.
</div>