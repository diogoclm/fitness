import type { Plano, User } from '../types'

// O frontend não fala direto com a Anthropic. Ele chama nosso proxy
// serverless (/api/gerar-plano), que guarda a chave no servidor.
export async function gerarPlano(user: User): Promise<Plano> {
  let res: Response
  try {
    res = await fetch('/api/gerar-plano', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    })
  } catch {
    throw new Error('Falha de conexão com o servidor. Tente novamente.')
  }

  if (!res.ok) {
    let msg = `Erro ${res.status} ao gerar o plano.`
    try {
      const data = (await res.json()) as { error?: string }
      if (data.error) msg = data.error
    } catch {
      // resposta sem JSON — mantém mensagem padrão
    }
    throw new Error(msg)
  }

  return (await res.json()) as Plano
}
