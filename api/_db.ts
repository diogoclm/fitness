import { neon } from '@neondatabase/serverless'

// Vercel Postgres (Neon) injeta DATABASE_URL. Em alguns setups o nome é
// POSTGRES_URL — aceitamos os dois.
const url = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!url) {
  throw new Error(
    'DATABASE_URL não configurada. Defina no .env (local) ou nas variáveis de ambiente (Vercel).',
  )
}

export const sql = neon(url)
