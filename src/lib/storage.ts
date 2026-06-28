import type { Plano, Sessao, User } from '../types'

const KEYS = {
  user: 'fitai.user',
  plan: 'fitai.plan',
  sessions: 'fitai.sessions',
} as const

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

// User
export const getUser = (): User | null => read<User>(KEYS.user)
export const setUser = (user: User): void => write(KEYS.user, user)

// Plano
export const getPlano = (): Plano | null => read<Plano>(KEYS.plan)
export const setPlano = (plano: Plano): void => write(KEYS.plan, plano)
export const clearPlano = (): void => localStorage.removeItem(KEYS.plan)

// Sessões
export const getSessoes = (): Sessao[] => read<Sessao[]>(KEYS.sessions) ?? []
export const addSessao = (sessao: Sessao): void => {
  const all = getSessoes()
  all.push(sessao)
  write(KEYS.sessions, all)
}

// Reset onboarding
export const resetTudo = (): void => {
  localStorage.removeItem(KEYS.user)
  localStorage.removeItem(KEYS.plan)
}
