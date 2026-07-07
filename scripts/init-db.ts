// Cria as tabelas do FitAI. Idempotente (CREATE ... IF NOT EXISTS).
// Uso: npm run db:init  (precisa de DATABASE_URL no .env)
import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
if (!url) {
  console.error('❌ DATABASE_URL não definida. Coloque no .env e tente de novo.')
  process.exit(1)
}

const sql = neon(url)

const statements = [
  `create extension if not exists pgcrypto`,
  `create table if not exists users (
     id uuid primary key default gen_random_uuid(),
     email text unique not null,
     password_hash text not null,
     created_at timestamptz default now()
   )`,
  `create table if not exists profiles (
     user_id uuid primary key references users(id) on delete cascade,
     nome text, idade int, peso real, altura int,
     sexo text, anamnese text, meta text
   )`,
  `create table if not exists plans (
     user_id uuid primary key references users(id) on delete cascade,
     fichas jsonb not null,
     gerado_em timestamptz not null
   )`,
  // Duração sugerida do plano (rotação ABC) em semanas — define o prazo/validade.
  `alter table plans add column if not exists semanas int not null default 6`,
  // Planos anteriores arquivados (histórico de planos).
  `create table if not exists plans_history (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references users(id) on delete cascade,
     fichas jsonb not null,
     gerado_em timestamptz not null,
     semanas int not null default 6,
     arquivado_em timestamptz not null default now()
   )`,
  `create index if not exists plans_history_user_idx
     on plans_history (user_id, arquivado_em desc)`,
  `create table if not exists workout_sessions (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references users(id) on delete cascade,
     ficha_id text, ficha_nome text,
     data timestamptz not null, duracao_seg int not null
   )`,
]

try {
  for (const stmt of statements) {
    await sql.query(stmt)
  }
  console.log('✅ Tabelas criadas/atualizadas com sucesso.')
} catch (e) {
  console.error('❌ Erro ao criar tabelas:', e instanceof Error ? e.message : e)
  process.exit(1)
}
