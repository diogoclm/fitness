import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

// Inicialização preguiçosa: nunca lança no import do módulo (isso causaria
// FUNCTION_INVOCATION_FAILED na Vercel). O erro só aparece — de forma capturável
// pelo try/catch do handler — quando uma query é executada.
let _sql: NeonQueryFunction<false, false> | null = null

function getSql(): NeonQueryFunction<false, false> {
  if (_sql) return _sql
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) {
    throw new Error(
      'DATABASE_URL não configurada. Defina nas variáveis de ambiente (Vercel) ou no .env (local).',
    )
  }
  _sql = neon(url)
  return _sql
}

// Mantém o uso `sql\`...\`` nos handlers, delegando para a conexão lazy.
export const sql: NeonQueryFunction<false, false> = ((
  strings: TemplateStringsArray,
  ...values: unknown[]
) => getSql()(strings, ...values)) as NeonQueryFunction<false, false>
