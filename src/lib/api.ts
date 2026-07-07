import type { AuthUser, Plano, PlanoArquivado, Sessao, User } from '../types'

// Disparado quando uma chamada retorna 401 — o AuthProvider escuta e desloga.
export const onNaoAutenticado = new EventTarget()

async function req<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new Error('Falha de conexão com o servidor. Tente novamente.')
  }

  if (res.status === 401) {
    onNaoAutenticado.dispatchEvent(new Event('logout'))
    throw new Error('Sessão expirada. Entre novamente.')
  }

  if (!res.ok) {
    let msg = `Erro ${res.status}.`
    try {
      const data = (await res.json()) as { error?: string }
      if (data.error) msg = data.error
    } catch {
      // sem corpo JSON — mantém mensagem padrão
    }
    throw new Error(msg)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

// ---- Auth ----
export const register = (email: string, senha: string) =>
  req<AuthUser>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  })

export const login = (email: string, senha: string) =>
  req<AuthUser>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  })

export const logout = () => req<{ ok: true }>('/api/auth/logout', { method: 'POST' })

export const me = () => req<AuthUser>('/api/auth/me')

// ---- Dados ----
export const getProfile = () => req<User | null>('/api/profile')
export const saveProfile = (p: User) =>
  req<{ ok: true }>('/api/profile', { method: 'PUT', body: JSON.stringify(p) })

export const getPlan = () => req<Plano | null>('/api/plan')
export const savePlan = (p: Plano) =>
  req<{ ok: true }>('/api/plan', { method: 'PUT', body: JSON.stringify(p) })
export const getPlanHistory = () =>
  req<PlanoArquivado[]>('/api/plan-history')

export const getSessions = () => req<Sessao[]>('/api/sessions')
export const addSession = (s: Sessao) =>
  req<{ ok: true }>('/api/sessions', { method: 'POST', body: JSON.stringify(s) })
export const deleteSession = (id: string) =>
  req<{ ok: true }>(`/api/sessions?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
export const clearSessions = () =>
  req<{ ok: true }>('/api/sessions', { method: 'DELETE' })

// Gera o plano via Claude (perfil é lido do servidor) e já persiste.
export const gerarPlano = () => req<Plano>('/api/gerar-plano', { method: 'POST' })
