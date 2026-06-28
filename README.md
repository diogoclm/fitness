# FitAI 🏋️

MVP de app de fitness (mobile-first, em português do Brasil) que gera planos de
treino personalizados com a **Claude API**. O frontend é uma SPA (Vite/React) e
as chamadas à Claude passam por uma **função serverless** (`/api/gerar-plano`),
para que a chave fique **somente no servidor**. Os dados do usuário ficam no
`localStorage` do navegador.

## Telas

1. **Onboarding** — nome, idade, peso, altura, sexo, anamnese e meta.
2. **Plano gerado** — 3 fichas (A, B, C) com 5–6 exercícios cada (séries, repetições e dica), criadas pela Claude.
3. **Execução do treino** — exercício atual em destaque, navegação anterior/próximo, timer de intervalo (60s, com −15s/+15s, beep e vibração) e "Finalizar Treino".
4. **Histórico** — lista dos treinos concluídos (data, ficha, duração).

Navegação inferior: **Plano · Histórico · Perfil**.

## Stack

- React + Vite + TypeScript
- Tailwind CSS v4
- `@anthropic-ai/sdk` no servidor (modelo `claude-sonnet-4-6`)
- Função serverless (Vercel) como proxy da Claude
- `localStorage` para persistência

## Rodar localmente

```bash
npm install
cp .env.example .env      # edite e cole sua chave
npm run dev
```

Abra http://localhost:5173.

No `.env` (a chave **não** tem prefixo `VITE_`, então nunca vai pro navegador):

```
ANTHROPIC_API_KEY=sk-ant-...
```

Em dev, um plugin do Vite serve a rota `/api/gerar-plano` usando essa chave —
mesma rota que vira serverless function em produção. Pegue sua chave em
https://console.anthropic.com (precisa de saldo em Billing).

> Editou o `.env` com o servidor rodando? **Reinicie** o `npm run dev`.

## Deploy (Vercel)

1. Suba o repositório no GitHub.
2. Em https://vercel.com → **Add New Project** → importe o repo.
3. Framework: **Vite** (detectado automaticamente). A pasta `api/` vira
   serverless functions sozinha.
4. **Settings → Environment Variables**: adicione `ANTHROPIC_API_KEY` com a sua
   chave (em Production e Preview).
5. Deploy. A URL pública funciona em qualquer celular, fora de casa.
6. (Opcional) "Adicionar à Tela de Início" no celular pra usar como app.

> A chave fica só no ambiente do servidor da Vercel — nunca é enviada ao
> navegador. O `.env` local está no `.gitignore` e não deve ser commitado.

## Scripts

| Comando           | O que faz                       |
| ----------------- | ------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento     |
| `npm run build`   | Type-check + build de produção  |
| `npm run preview` | Pré-visualiza o build           |

## Estrutura

```
api/
  _core.ts         # lógica da geração (roda no servidor) — chamada à Claude
  gerar-plano.ts   # handler serverless (Vercel)
src/
  lib/
    claude.ts      # frontend: fetch para /api/gerar-plano
    storage.ts     # wrapper tipado do localStorage
  components/
    BottomNav.tsx
    RestTimer.tsx  # timer de intervalo (beep + vibração)
  screens/
    Onboarding.tsx
    Plano.tsx
    Treino.tsx
    Historico.tsx
    Perfil.tsx
  types.ts
  App.tsx          # rotas + layout
vite.config.ts     # plugin que serve /api em dev
```

## Limitação conhecida

Os dados (perfil, plano, histórico) ficam no `localStorage` de **cada
dispositivo**. Não sincronizam entre celular e computador. Para multi-dispositivo
seria necessário um banco de dados + login (fora do escopo do MVP).
