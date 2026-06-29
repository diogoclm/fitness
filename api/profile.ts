import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from './_db.js'
import { lerSessao } from './_auth.js'
import type { User } from '../src/types'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await lerSessao(req)
  if (!userId) {
    res.status(401).json({ error: 'Não autenticado.' })
    return
  }

  try {
    if (req.method === 'GET') {
      const rows = await sql`
        select nome, idade, peso, altura, sexo, anamnese, meta
        from profiles where user_id = ${userId}`
      res.status(200).json(rows[0] ?? null)
      return
    }

    if (req.method === 'PUT') {
      const p = (req.body ?? {}) as User
      if (!p.nome) {
        res.status(400).json({ error: 'Dados do perfil inválidos.' })
        return
      }
      await sql`
        insert into profiles (user_id, nome, idade, peso, altura, sexo, anamnese, meta)
        values (${userId}, ${p.nome}, ${p.idade}, ${p.peso}, ${p.altura}, ${p.sexo}, ${p.anamnese}, ${p.meta})
        on conflict (user_id) do update set
          nome = excluded.nome, idade = excluded.idade, peso = excluded.peso,
          altura = excluded.altura, sexo = excluded.sexo,
          anamnese = excluded.anamnese, meta = excluded.meta`
      res.status(200).json({ ok: true })
      return
    }

    res.status(405).json({ error: 'Método não permitido.' })
  } catch (e) {
    res.status(500).json({
      error: e instanceof Error ? e.message : 'Erro no perfil.',
    })
  }
}
