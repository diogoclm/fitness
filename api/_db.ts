import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

// Inicialização preguiçosa: nunca lança no import do módulo (isso causaria
// FUNCTION_INVOCATION_FAILED na Vercel). O erro só aparece — de forma capturável
// pelo try/catch do handler — quando uma query é executada.
let _sql: NeonQueryFunction<false, false> | null = null

// Procura a connection string. Integrações da Vercel às vezes prefixam o nome
// (ex.: fitness_DATABASE_URL), então também varremos por qualquer *DATABASE_URL
// / *POSTGRES_URL (ignorando as variantes _UNPOOLED).
function acharUrl(): string | undefined {
  const env = process.env
  if (env.DATABASE_URL) return env.DATABASE_URL
  if (env.POSTGRES_URL) return env.POSTGRES_URL
  for (const [k, v] of Object.entries(env)) {
    if (!v || /UNPOOLED/.test(k)) continue
    if (/(^|_)DATABASE_URL$/.test(k) || /(^|_)POSTGRES_URL$/.test(k)) return v
  }
  return undefined
}

function getSql(): NeonQueryFunction<false, false> {
  if (_sql) return _sql
  const url = acharUrl()
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
