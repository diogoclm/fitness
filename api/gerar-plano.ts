import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { User } from '../src/types'
import { gerarPlanoCore } from './_core.js'

// A geração pela Claude pode levar mais que o timeout padrão (10s no plano
// Hobby). 60s é o máximo permitido no Hobby.
export const config = { maxDuration: 60 }

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido.' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({
      error:
        'ANTHROPIC_API_KEY não configurada no servidor. Defina nas variáveis de ambiente.',
    })
    return
  }

  try {
    const user = req.body as User
    if (!user?.nome) {
      res.status(400).json({ error: 'Dados do usuário inválidos.' })
      return
    }
    const plano = await gerarPlanoCore(user, apiKey)
    res.status(200).json(plano)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erro ao gerar o plano.'
    res.status(500).json({ error: msg })
  }
}
