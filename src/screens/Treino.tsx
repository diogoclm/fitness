import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import RestTimer from '../components/RestTimer'
import type { Sessao } from '../types'
import { useAuth } from '../auth/AuthProvider'

export default function Treino() {
  const navigate = useNavigate()
  const { fichaId } = useParams<{ fichaId: string }>()
  const { plan, adicionarSessao } = useAuth()
  const ficha = plan?.fichas.find((f) => f.id === fichaId)

  const [idx, setIdx] = useState(0)
  const [mostrarTimer, setMostrarTimer] = useState(false)
  const [finalizando, setFinalizando] = useState(false)
  const inicioRef = useRef(Date.now())

  // Cronômetro de duração da sessão (apenas para exibição).
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - inicioRef.current) / 1000)),
      1000,
    )
    return () => clearInterval(id)
  }, [])

  if (!ficha) return <Navigate to="/plano" replace />

  const total = ficha.exercicios.length
  const ex = ficha.exercicios[idx]

  async function finalizar() {
    if (finalizando) return
    setFinalizando(true)
    const sessao: Sessao = {
      id: crypto.randomUUID(),
      fichaId: ficha!.id,
      fichaNome: ficha!.nome,
      data: new Date().toISOString(),
      duracaoSeg: Math.floor((Date.now() - inicioRef.current) / 1000),
    }
    try {
      await adicionarSessao(sessao)
    } catch {
      // mesmo se falhar o save, libera o usuário; histórico mostra o que persistiu
    }
    navigate('/historico')
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')

  return (
    <div className="flex min-h-screen flex-col px-5 py-6">
      <header className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/plano')}
          className="text-sm text-muted"
        >
          ← Sair
        </button>
        <span className="rounded-lg bg-card px-3 py-1 text-sm tabular-nums text-muted">
          ⏱ {mm}:{ss}
        </span>
      </header>

      <div className="mb-4">
        <p className="text-sm text-muted">
          Ficha {ficha.id} · Exercício {idx + 1} de {total}
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-card">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${((idx + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Exercício atual — grande e legível */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-extrabold leading-tight">{ex.nome}</h1>
        <p className="mt-6 text-6xl font-black tabular-nums text-accent">
          {ex.series} <span className="text-3xl text-white">×</span>{' '}
          {ex.repeticoes}
        </p>
        <p className="mt-2 text-sm uppercase tracking-widest text-muted">
          séries × repetições
        </p>
        {ex.dica && (
          <p className="mt-8 max-w-xs rounded-xl bg-card p-4 text-sm text-muted">
            💡 {ex.dica}
          </p>
        )}
      </div>

      {/* Controles */}
      <div className="mt-6 space-y-3">
        <button
          onClick={() => setMostrarTimer(true)}
          className="min-h-14 w-full rounded-xl bg-cardalt text-lg font-bold ring-1 ring-white/10 active:scale-[0.99]"
        >
          Intervalo
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="min-h-14 flex-1 rounded-xl bg-card font-bold disabled:opacity-40 active:scale-[0.99]"
          >
            ‹ Anterior
          </button>
          <button
            onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
            disabled={idx === total - 1}
            className="min-h-14 flex-1 rounded-xl bg-card font-bold disabled:opacity-40 active:scale-[0.99]"
          >
            Próximo ›
          </button>
        </div>

        <button
          onClick={finalizar}
          disabled={finalizando}
          className="min-h-14 w-full rounded-xl bg-accent text-lg font-extrabold text-bg disabled:opacity-60 active:scale-[0.99]"
        >
          {finalizando ? 'Salvando…' : 'Finalizar Treino'}
        </button>
      </div>

      {mostrarTimer && <RestTimer onClose={() => setMostrarTimer(false)} />}
    </div>
  )
}
