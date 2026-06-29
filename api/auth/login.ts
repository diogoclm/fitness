import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '../_db.js'
import { assinarToken, conferirSenha, cookieSessao } from '../_auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido.' })
    return
  }
  try {
    const { email, senha } = (req.body ?? {}) as {
      email?: string
      senha?: string
    }
    const emailNorm = (email ?? '').trim().toLowerCase()
    if (!emailNorm || !senha) {
      res.status(400).json({ error: 'Informe e-mail e senha.' })
      return
    }

    const rows = await sql`
      select id, password_hash from users where email = ${emailNorm}`
    const user = rows[0]
    // Mensagem genérica de propósito (não revela se o e-mail existe).
    if (!user || !(await conferirSenha(senha, user.password_hash as string))) {
      res.status(401).json({ error: 'E-mail ou senha incorretos.' })
      return
    }

    const token = await assinarToken(user.id as string)
    res.setHeader('Set-Cookie', cookieSessao(token))
    res.status(200).json({ email: emailNorm })
  } catch (e) {
    res.status(500).json({
      error: e instanceof Error ? e.message : 'Erro ao entrar.',
    })
  }
}
