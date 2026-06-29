import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { AuthUser, Plano, Sessao, User } from '../types'
import * as api from '../lib/api'

interface Ctx {
  user: AuthUser | null
  loading: boolean
  profile: User | null
  plan: Plano | null
  sessions: Sessao[]
  login: (email: string, senha: string) => Promise<void>
  register: (email: string, senha: string) => Promise<void>
  logout: () => Promise<void>
  salvarProfile: (p: User) => Promise<void>
  gerarNovoPlano: () => Promise<void>
  salvarPlano: (p: Plano) => Promise<void>
  adicionarSessao: (s: Sessao) => Promise<void>
  removerSessao: (id: string) => Promise<void>
  limparHistorico: () => Promise<void>
}

const AuthCtx = createContext<Ctx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<User | null>(null)
  const [plan, setPlan] = useState<Plano | null>(null)
  const [sessions, setSessions] = useState<Sessao[]>([])

  // Carrega os dados do usuário autenticado.
  const carregarDados = useCallback(async () => {
    const [p, pl, ss] = await Promise.all([
      api.getProfile(),
      api.getPlan(),
      api.getSessions(),
    ])
    setProfile(p)
    setPlan(pl)
    setSessions(ss)
  }, [])

  const limpar = useCallback(() => {
    setUser(null)
    setProfile(null)
    setPlan(null)
    setSessions([])
  }, [])

  // Sessão atual no mount.
  useEffect(() => {
    api
      .me()
      .then(async (u) => {
        setUser(u)
        await carregarDados()
      })
      .catch(() => limpar())
      .finally(() => setLoading(false))
  }, [carregarDados, limpar])

  // 401 em qualquer chamada -> desloga localmente.
  useEffect(() => {
    const h = () => limpar()
    api.onNaoAutenticado.addEventListener('logout', h)
    return () => api.onNaoAutenticado.removeEventListener('logout', h)
  }, [limpar])

  const entrar = useCallback(
    async (fn: () => Promise<AuthUser>) => {
      const u = await fn()
      setUser(u)
      await carregarDados()
    },
    [carregarDados],
  )

  const value: Ctx = {
    user,
    loading,
    profile,
    plan,
    sessions,
    login: (email, senha) => entrar(() => api.login(email, senha)),
    register: (email, senha) => entrar(() => api.register(email, senha)),
    logout: async () => {
      await api.logout().catch(() => {})
      limpar()
    },
    salvarProfile: async (p) => {
      await api.saveProfile(p)
      setProfile(p)
    },
    gerarNovoPlano: async () => {
      const novo = await api.gerarPlano()
      setPlan(novo)
    },
    salvarPlano: async (p) => {
      await api.savePlan(p)
      setPlan(p)
    },
    adicionarSessao: async (s) => {
      await api.addSession(s)
      setSessions((prev) => [s, ...prev])
    },
    removerSessao: async (id) => {
      await api.deleteSession(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
    },
    limparHistorico: async () => {
      await api.clearSessions()
      setSessions([])
    },
  }

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): Ctx {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
