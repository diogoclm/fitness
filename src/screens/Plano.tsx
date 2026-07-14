import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Ficha, Plano as PlanoType } from '../types'
import { useAuth } from '../auth/AuthProvider'

// ---- datas / validade ----
function fmtData(d: Date) {
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
function calcPeriodo(plano: PlanoType) {
  const inicio = new Date(plano.geradoEm)
  const fim = new Date(inicio)
  fim.setDate(fim.getDate() + plano.semanas * 7)
  const venceu = Date.now() > fim.getTime()
  const diasRestantes = Math.ceil((fim.getTime() - Date.now()) / 86400000)
  return { inicio, fim, venceu, diasRestantes }
}

export default function Plano() {
  const navigate = useNavigate()
  const { plan, gerarNovoPlano } = useAuth()
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function gerar() {
    setCarregando(true)
    setErro('')
    try {
      await gerarNovoPlano()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao gerar o plano.')
    } finally {
      setCarregando(false)
    }
  }

  function gerarNovo() {
    if (
      plan &&
      !confirm(
        'Gerar um novo plano? O plano atual será substituído (fica salvo em "Planos anteriores").',
      )
    )
      return
    void gerar()
  }

  if (carregando) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="size-12 animate-spin rounded-full border-4 border-white/15 border-t-accent" />
        <p className="text-muted">Gerando seu plano com IA…</p>
      </div>
    )
  }

  // ----- Sem plano: NÃO gera sozinho; usuário decide -----
  if (!plan) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="text-5xl">🏋️</div>
        <div>
          <h1 className="text-2xl font-extrabold">Você ainda não tem um plano</h1>
          <p className="mt-1 text-sm text-muted">
            Gere seu plano de treino personalizado com IA.
          </p>
        </div>
        {erro && <p className="text-sm text-red-400">{erro}</p>}
        <button
          onClick={() => void gerar()}
          className="min-h-14 w-full max-w-xs rounded-xl bg-accent text-lg font-bold text-bg active:scale-[0.99]"
        >
          Gerar meu plano
        </button>
      </div>
    )
  }

  // ----- Modo visualização -----
  const periodo = calcPeriodo(plan)
  return (
    <div className="px-5 py-8">
      <header className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold">Seu plano</h1>
          <p className="text-sm text-muted">Rotação A · B · C</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            onClick={() => navigate('/plano/editar')}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-accent ring-1 ring-accent/40 active:scale-95"
          >
            Editar
          </button>
          <button
            onClick={gerarNovo}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted ring-1 ring-white/15 active:scale-95"
          >
            Gerar novo
          </button>
        </div>
      </header>

      {/* Prazo / validade */}
      <div
        className={`mb-5 rounded-xl p-4 text-sm ring-1 ${
          periodo.venceu
            ? 'bg-red-500/10 text-red-300 ring-red-500/30'
            : 'bg-card text-muted ring-white/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <span>
            📅 {fmtData(periodo.inicio)} → <b>{fmtData(periodo.fim)}</b>
          </span>
          <span className="text-xs">{plan.semanas} semanas</span>
        </div>
        <p className="mt-1 text-xs">
          {periodo.venceu
            ? 'Plano vencido — hora de renovar (Gerar novo).'
            : `Faltam ${periodo.diasRestantes} dia(s) para renovar.`}
        </p>
      </div>

      <div className="space-y-5">
        {plan.fichas.map((ficha) => (
          <FichaCard
            key={ficha.id}
            ficha={ficha}
            onIniciar={() => navigate(`/treino/${ficha.id}`)}
          />
        ))}
      </div>

      <button
        onClick={() => navigate('/planos')}
        className="mt-6 min-h-11 w-full rounded-xl bg-card text-sm font-medium text-muted ring-1 ring-white/10 active:scale-[0.99]"
      >
        Ver planos anteriores
      </button>
    </div>
  )
}

function FichaCard({ ficha, onIniciar }: { ficha: Ficha; onIniciar: () => void }) {
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
