import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Ficha, Plano as PlanoType } from '../types'
import { gerarPlano } from '../lib/claude'
import { getPlano, getUser, setPlano } from '../lib/storage'

export default function Plano() {
  const navigate = useNavigate()
  const [plano, setPlanoState] = useState<PlanoType | null>(() => getPlano())
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function gerar() {
    const user = getUser()
    if (!user) return
    setCarregando(true)
    setErro('')
    try {
      const novo = await gerarPlano(user)
      setPlano(novo)
      setPlanoState(novo)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao gerar o plano.')
    } finally {
      setCarregando(false)
    }
  }

  // Gera automaticamente na primeira visita (sem plano salvo).
  useEffect(() => {
    if (!plano && !carregando && !erro) void gerar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (carregando) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="size-12 animate-spin rounded-full border-4 border-white/15 border-t-accent" />
        <p className="text-muted">Gerando seu plano com IA…</p>
      </div>
    )
  }

  if (erro && !plano) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-red-400">{erro}</p>
        <button
          onClick={() => void gerar()}
          className="min-h-12 rounded-xl bg-accent px-6 font-bold text-bg"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="px-5 py-8">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Seu plano</h1>
          <p className="text-sm text-muted">3 fichas geradas para você</p>
        </div>
        <button
          onClick={() => void gerar()}
          className="rounded-lg px-3 py-2 text-sm font-medium text-accent ring-1 ring-accent/40 active:scale-95"
        >
          Gerar novo
        </button>
      </header>

      {erro && <p className="mb-4 text-sm text-red-400">{erro}</p>}

      <div className="space-y-5">
        {plano?.fichas.map((ficha) => (
          <FichaCard
            key={ficha.id}
            ficha={ficha}
            onIniciar={() => navigate(`/treino/${ficha.id}`)}
          />
        ))}
      </div>
    </div>
  )
}

function FichaCard({
  ficha,
  onIniciar,
}: {
  ficha: Ficha
  onIniciar: () => void
}) {
  return (
    <section className="rounded-2xl bg-card p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-lg font-extrabold text-bg">
          {ficha.id}
        </span>
        <div>
          <h2 className="font-bold leading-tight">{ficha.nome}</h2>
          <p className="text-xs text-muted">{ficha.foco}</p>
        </div>
      </div>

      <ul className="mb-4 divide-y divide-white/5">
        {ficha.exercicios.map((ex, i) => (
          <li key={i} className="py-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-medium">{ex.nome}</span>
              <span className="shrink-0 text-sm text-accent">
                {ex.series} × {ex.repeticoes}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted">{ex.dica}</p>
          </li>
        ))}
      </ul>

      <button
        onClick={onIniciar}
        className="min-h-12 w-full rounded-xl bg-accent font-bold text-bg active:scale-[0.99]"
      >
        Iniciar treino
      </button>
    </section>
  )
}
