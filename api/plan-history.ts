import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from './_db.js'
import { lerSessao } from './_auth.js'
import type { PlanoArquivado } from '../src/types'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await lerSessao(req)
  if (!userId) {
    res.status(401).json({ error: 'Não autenticado.' })
    return
  }

  try {
    if (req.method === 'GET') {
      const rows = await sql`
        select id, fichas, gerado_em, semanas, arquivado_em
        from plans_history where user_id = ${userId}
        order by arquivado_em desc`
      const planos: PlanoArquivado[] = rows.map((r) => ({
        id: r.id,
        fichas: r.fichas,
        geradoEm: new Date(r.gerado_em).toISOString(),
        semanas: r.semanas ?? 6,
        arquivadoEm: new Date(r.arquivado_em).toISOString(),
      }))
      res.status(200).json(planos)
      return
    }

    res.status(405).json({ error: 'Método não permitido.' })
  } catch (e) {
    res.status(500).json({
      error: e instanceof Error ? e.message : 'Erro no histórico de planos.',
    })
  }
}
