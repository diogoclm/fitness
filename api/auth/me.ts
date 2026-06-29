import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '../_db.js'
import { lerSessao } from '../_auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const userId = await lerSessao(req)
    if (!userId) {
      res.status(401).json({ error: 'Não autenticado.' })
      return
    }
    const rows = await sql`select email from users where id = ${userId}`
    if (rows.length === 0) {
      res.status(401).json({ error: 'Sessão inválida.' })
      return
    }
    res.status(200).json({ id: userId, email: rows[0].email })
  } catch (e) {
    res.status(500).json({
      error: e instanceof Error ? e.message : 'Erro ao validar sessão.',
    })
  }
}
