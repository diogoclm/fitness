import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

const COOKIE = 'fitai_session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 dias (segundos)

function getSecret(): Uint8Array {
  const s = process.env.AUTH_SECRET
  if (!s) {
    throw new Error(
      'AUTH_SECRET não configurada. Defina no .env (local) e nas variáveis de ambiente (Vercel).',
    )
  }
  return new TextEncoder().encode(s)
}

// ---- Senha ----
export function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 10)
}
export function conferirSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash)
}

// ---- Token (JWT) ----
export async function assinarToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret())
}

async function verificarToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}

// ---- Cookies ----
// Parseia o header Cookie (funciona tanto na Vercel quanto no plugin de dev).
function lerCookie(req: { headers: Record<string, unknown> }): string | null {
  const raw = req.headers['cookie']
  if (typeof raw !== 'string') return null
  for (const parte of raw.split(';')) {
    const [nome, ...resto] = parte.trim().split('=')
    if (nome === COOKIE) return decodeURIComponent(resto.join('='))
  }
  return null
}

// userId da sessão atual, ou null se não autenticado.
export async function lerSessao(req: {
  headers: Record<string, unknown>
}): Promise<string | null> {
  const token = lerCookie(req)
  return token ? verificarToken(token) : null
}

const ehProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL

export function cookieSessao(token: string): string {
  return [
    `${COOKIE}=${token}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${MAX_AGE}`,
    ehProd ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ')
}

export function cookieLimpar(): string {
  return [
    `${COOKIE}=`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    'Max-Age=0',
    ehProd ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ')
}
