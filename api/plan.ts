import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from './_db.js'
import { lerSessao } from './_auth.js'
import type { Plano } from '../src/types'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await lerSessao(req)
  if (!userId) {
    res.status(401).json({ error: 'Não autenticado.' })
    return
  }

  try {
    if (req.method === 'GET') {
      const rows = await sql`
        select fichas, gerado_em, semanas from plans where user_id = ${userId}`
      if (rows.length === 0) {
        res.status(200).json(null)
        return
      }
      const plano: Plano = {
        fichas: rows[0].fichas,
        geradoEm: new Date(rows[0].gerado_em).toISOString(),
        semanas: rows[0].semanas ?? 6,
      }
      res.status(200).json(plano)
      return
    }

    if (req.method === 'PUT') {
      const plano = (req.body ?? {}) as Plano
      if (!plano.fichas?.length) {
        res.status(400).json({ error: 'Plano inválido.' })
        return
      }
      const semanas = Number(plano.semanas) > 0 ? Number(plano.semanas) : 6
      await sql`
        insert into plans (user_id, fichas, gerado_em, semanas)
        values (${userId}, ${JSON.stringify(plano.fichas)}::jsonb, ${plano.geradoEm}, ${semanas})
        on conflict (user_id) do update set
          fichas = excluded.fichas, gerado_em = excluded.gerado_em, semanas = excluded.semanas`
      res.status(200).json({ ok: true })
      return
    }

    res.status(405).json({ error: 'Método não permitido.' })
  } catch (e) {
    res.status(500).json({
      error: e instanceof Error ? e.message : 'Erro no plano.',
    })
  }
}
