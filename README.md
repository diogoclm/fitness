# FitAI 🏋️

MVP de app de fitness (mobile-first, em português do Brasil) que gera planos de
treino personalizados com a **Claude API**. O frontend é uma SPA (Vite/React) e
toda a lógica de servidor roda em **funções serverless** (`api/`): autenticação
(login/senha) e dados ficam no **Postgres**; a chave da Claude fica **somente no
servidor**. Cada usuário tem conta própria — perfil, plano e histórico
sincronizam entre dispositivos.

## Telas

0. **Login / Cadastro** — email + senha.
1. **Onboarding** — nome, idade, peso, altura, sexo, anamnese e meta.
2. **Plano gerado** — 3 fichas (A, B, C) com 5–6 exercícios cada (séries, repetições e dica), criadas pela Claude.
3. **Execução do treino** — exercício atual em destaque, navegação anterior/próximo, timer de intervalo (60s, com −15s/+15s, beep e vibração) e "Finalizar Treino".
4. **Histórico** — lista dos treinos concluídos (data, ficha, duração).

Navegação inferior: **Plano · Histórico · Perfil**.

## Stack

- React + Vite + TypeScript
- Tailwind CSS v4
- `@anthropic-ai/sdk` no servidor (modelo `claude-sonnet-4-6`)
- Funções serverless (Vercel) em `api/`
- **Postgres** (Vercel Postgres / Neon) via `@neondatabase/serverless`
- Auth caseiro: senha com **bcryptjs** + sessão **JWT** (`jose`) em cookie `httpOnly`

## Rodar localmente

```bash
npm install
cp .env.example .env      # preencha as 3 variáveis (abaixo)
npm run db:init           # cria as tabelas no Postgres (idempotente)
npm run dev
```

Abra http://localhost:5173.

No `.env` (nenhuma tem prefixo `VITE_`, então nada vai pro navegador):

```
ANTHROPIC_API_KEY=sk-ant-...        # https://console.anthropic.com (precisa saldo)
DATABASE_URL=postgresql://...        # connection string do Vercel Postgres / Neon
AUTH_SECRET=...                      # gere: node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Em dev, um plugin do Vite serve as rotas `/api/*` (mesmos handlers que viram
serverless functions em produção) lendo essas variáveis via `process.env`.

> Editou o `.env` com o servidor rodando? **Reinicie** o `npm run dev`.

## Deploy (Vercel)

1. Vercel → projeto → aba **Storage** → **Create Database → Postgres** (Neon).
   Conecte ao projeto (injeta `DATABASE_URL` automaticamente).
2. **Settings → Environment Variables** (Production + Preview): adicione
   `ANTHROPIC_API_KEY` e `AUTH_SECRET`. (`DATABASE_URL` já entra pela integração.)
3. Crie as tabelas uma vez, apontando para o banco de produção:
   `DATABASE_URL` no `.env` local → `npm run db:init` (ou rode o SQL no editor do Neon).
4. Suba o repo no GitHub e faça o deploy. Framework **Vite** é detectado; a pasta
   `api/` vira serverless functions sozinha.
5. URL pública funciona em qualquer celular. (Opcional) "Adicionar à Tela de
   Início" pra usar como app.

> Chaves e segredos ficam só no servidor da Vercel — nunca vão ao navegador.
> O `.env` local está no `.gitignore` e não deve ser commitado.

## Segurança

- Senhas: hash **bcryptjs** (nunca texto puro).
- Sessão: **JWT** assinado com `AUTH_SECRET`, em cookie **`httpOnly`** (`SameSite=Lax`,
  `Secure` em produção) — resistente a roubo via XSS.
- Todo endpoint de dados valida a sessão e usa o `user_id` do token (nunca um id
  vindo do cliente) → contas isoladas.
- **Fora do escopo deste MVP** (melhorias recomendadas para produção real):
  rate-limiting no login, verificação de e-mail e recuperação de senha.

## Scripts

| Comando           | O que faz                       |
| ----------------- | ------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento     |
| `npm run build`   | Type-check + build de produção  |
| `npm run preview` | Pré-visualiza o build           |

## Estrutura

```
api/
  _core.ts         # lógica da geração (servidor) — chamada à Claude
  _db.ts           # conexão Postgres (Neon)
  _auth.ts         # hash de senha, JWT, cookies de sessão
  gerar-plano.ts   # gera plano (exige sessão; lê perfil do banco; persiste)
  profile.ts       # GET/PUT perfil
  plan.ts          # GET/PUT plano
  sessions.ts      # GET/POST histórico de treinos
  auth/
    register.ts  login.ts  logout.ts  me.ts
scripts/
  init-db.ts       # cria as tabelas (npm run db:init)
src/
  lib/api.ts       # frontend: wrapper fetch dos endpoints
  auth/AuthProvider.tsx  # contexto: sessão + dados do usuário
  components/      # BottomNav, RestTimer
  screens/         # Login, Onboarding, Plano, Treino, Historico, Perfil
  types.ts
  App.tsx          # rotas + proteção por sessão/perfil
vite.config.ts     # plugin que serve /api/* em dev
```
