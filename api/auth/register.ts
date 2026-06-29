import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '../_db.js'
import { assinarToken, cookieSessao, hashSenha } from '../_auth.js'

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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      res.status(400).json({ error: 'E-mail inválido.' })
      return
    }
    if (!senha || senha.length < 8) {
      res.status(400).json({ error: 'A senha deve ter ao menos 8 caracteres.' })
      return
    }

    const existe = await sql`select 1 from users where email = ${emailNorm}`
    if (existe.length > 0) {
      res.status(409).json({ error: 'Este e-mail já está cadastrado.' })
      return
    }

    const hash = await hashSenha(senha)
    const rows = await sql`
      insert into users (email, password_hash)
      values (${emailNorm}, ${hash})
      returning id`
    const userId = rows[0].id as string

    const token = await assinarToken(userId)
    res.setHeader('Set-Cookie', cookieSessao(token))
    res.status(200).json({ email: emailNorm })
  } catch (e) {
    res.status(500).json({
      error: e instanceof Error ? e.message : 'Erro ao cadastrar.',
    })
  }
}
