// Lógica de geração do plano que roda NO SERVIDOR (serverless).
// A chave da API nunca chega ao navegador.
import Anthropic from '@anthropic-ai/sdk'
import type { Plano, User } from '../src/types'

const MODEL = 'claude-sonnet-4-6'

const schema = {
  type: 'object',
  properties: {
    fichas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', enum: ['A', 'B', 'C'] },
          nome: { type: 'string' },
          foco: { type: 'string' },
          exercicios: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                nome: { type: 'string' },
                series: { type: 'integer' },
                repeticoes: { type: 'string' },
                dica: { type: 'string' },
              },
              required: ['nome', 'series', 'repeticoes', 'dica'],
              additionalProperties: false,
            },
          },
        },
        required: ['id', 'nome', 'foco', 'exercicios'],
        additionalProperties: false,
      },
    },
  },
  required: ['fichas'],
  additionalProperties: false,
} as const

const SYSTEM = `Você é um personal trainer brasileiro experiente. Crie planos de treino
seguros, objetivos e adaptados ao perfil e às limitações do aluno. Responda sempre em
português do Brasil. Leve a sério a anamnese: evite exercícios que agravem dores ou lesões
relatadas. Sempre retorne exatamente 3 fichas (A, B, C), cada uma com 5 a 6 exercícios.
A "dica" de cada exercício deve ser curta (uma frase) e prática.`

function montarPrompt(user: User): string {
  return [
    'Crie um plano de treino dividido em 3 fichas (A, B e C) para o seguinte aluno:',
    `- Nome: ${user.nome}`,
    `- Idade: ${user.idade} anos`,
    `- Peso: ${user.peso} kg`,
    `- Altura: ${user.altura} cm`,
    `- Sexo: ${user.sexo}`,
    `- Objetivo: ${user.meta}`,
    `- Anamnese (dores/lesões/limitações): ${user.anamnese || 'nenhuma relatada'}`,
    '',
    'Cada ficha deve ter um nome curto (ex.: "Ficha A - Peito e Tríceps"), um foco e de 5 a 6',
    'exercícios com nome, número de séries, faixa de repetições (ex.: "10-12" ou "30s") e uma dica curta.',
  ].join('\n')
}

export async function gerarPlanoCore(
  user: User,
  apiKey: string,
): Promise<Plano> {
  const client = new Anthropic({ apiKey })

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM,
    messages: [{ role: 'user', content: montarPrompt(user) }],
    output_config: { format: { type: 'json_schema', schema } },
  })

  const bloco = response.content.find((b) => b.type === 'text')
  if (!bloco || bloco.type !== 'text') {
    throw new Error('Resposta inesperada da Claude (sem texto).')
  }

  const dados = JSON.parse(bloco.text) as { fichas: Plano['fichas'] }
  if (!dados.fichas?.length) {
    throw new Error('A Claude não retornou nenhuma ficha. Tente novamente.')
  }

  return { fichas: dados.fichas, geradoEm: new Date().toISOString() }
}
