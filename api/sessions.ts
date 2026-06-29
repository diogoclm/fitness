import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from './_db.js'
import { lerSessao } from './_auth.js'
import type { Sessao } from '../src/types'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await lerSessao(req)
  if (!userId) {
    res.status(401).json({ error: 'Não autenticado.' })
    return
  }

  try {
    if (req.method === 'GET') {
      const rows = await sql`
        select id, ficha_id, ficha_nome, data, duracao_seg
        from workout_sessions where user_id = ${userId}
        order by data desc`
      const sessoes: Sessao[] = rows.map((r) => ({
        id: r.id,
        fichaId: r.ficha_id,
        fichaNome: r.ficha_nome,
        data: new Date(r.data).toISOString(),
        duracaoSeg: r.duracao_seg,
      }))
      res.status(200).json(sessoes)
      return
    }

    if (req.method === 'POST') {
      const s = (req.body ?? {}) as Sessao
      if (!s.fichaId) {
        res.status(400).json({ error: 'Sessão inválida.' })
        return
      }
      await sql`
        insert into workout_sessions (user_id, ficha_id, ficha_nome, data, duracao_seg)
        values (${userId}, ${s.fichaId}, ${s.fichaNome}, ${s.data}, ${s.duracaoSeg})`
      res.status(200).json({ ok: true })
      return
    }

    res.status(405).json({ error: 'Método não permitido.' })
  } catch (e) {
    res.status(500).json({
      error: e instanceof Error ? e.message : 'Erro nas sessões.',
    })
  }
}
