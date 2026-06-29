import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { User } from '../src/types'
import { gerarPlanoCore } from './_core.js'
import { sql } from './_db.js'
import { lerSessao } from './_auth.js'

// A geração pela Claude pode levar mais que o timeout padrão (10s no plano
// Hobby). 60s é o máximo permitido no Hobby.
export const config = { maxDuration: 60 }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido.' })
    return
  }

  const userId = await lerSessao(req)
  if (!userId) {
    res.status(401).json({ error: 'Não autenticado.' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({
      error: 'ANTHROPIC_API_KEY não configurada no servidor.',
    })
    return
  }

  try {
    // Perfil vem do banco (fonte de verdade), não do corpo da requisição.
    const rows = await sql`
      select nome, idade, peso, altura, sexo, anamnese, meta
      from profiles where user_id = ${userId}`
    if (rows.length === 0) {
      res.status(400).json({ error: 'Complete seu perfil antes de gerar o plano.' })
      return
    }
    const user = rows[0] as User

    const plano = await gerarPlanoCore(user, apiKey)

    // Persiste o plano gerado para este usuário.
    await sql`
      insert into plans (user_id, fichas, gerado_em)
      values (${userId}, ${JSON.stringify(plano.fichas)}::jsonb, ${plano.geradoEm})
      on conflict (user_id) do update set
        fichas = excluded.fichas, gerado_em = excluded.gerado_em`

    res.status(200).json(plano)
  } catch (e) {
    res.status(500).json({
      error: e instanceof Error ? e.message : 'Erro ao gerar o plano.',
    })
  }
}
