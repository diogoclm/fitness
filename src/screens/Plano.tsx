import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Exercicio, Ficha, Plano as PlanoType } from '../types'
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
  const { plan, gerarNovoPlano, salvarPlano } = useAuth()
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [rascunho, setRascunho] = useState<PlanoType | null>(null) // != null => editando

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

  // ----- Modo edição -----
  if (rascunho) {
    return (
      <EditorPlano
        rascunho={rascunho}
        setRascunho={setRascunho}
        onCancelar={() => setRascunho(null)}
        onSalvar={async (p) => {
          await salvarPlano(p)
          setRascunho(null)
        }}
      />
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
            onClick={() => setRascunho(structuredClone(plan))}
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

// ---------- Editor ----------

const inputCls =
  'w-full rounded-lg bg-cardalt px-3 py-2 text-sm text-white placeholder:text-muted/60 outline-none ring-1 ring-white/10 focus:ring-accent'

const exercicioVazio: Exercicio = {
  nome: '',
  series: 3,
  repeticoes: '10-12',
  dica: '',
}

function EditorPlano({
  rascunho,
  setRascunho,
  onCancelar,
  onSalvar,
}: {
  rascunho: PlanoType
  setRascunho: (p: PlanoType) => void
  onCancelar: () => void
  onSalvar: (p: PlanoType) => Promise<void>
}) {
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  function atualizar(fi: number, fn: (f: Ficha) => Ficha) {
    const fichas = rascunho.fichas.map((f, i) => (i === fi ? fn(f) : f))
    setRascunho({ ...rascunho, fichas })
  }

  function setEx(fi: number, ei: number, campo: keyof Exercicio, valor: string) {
    atualizar(fi, (f) => ({
      ...f,
      exercicios: f.exercicios.map((ex, i) =>
        i === ei
          ? { ...ex, [campo]: campo === 'series' ? Number(valor) || 0 : valor }
          : ex,
      ),
    }))
  }

  function removerEx(fi: number, ei: number) {
    atualizar(fi, (f) => ({
      ...f,
      exercicios: f.exercicios.filter((_, i) => i !== ei),
    }))
  }

  function addEx(fi: number) {
    atualizar(fi, (f) => ({
      ...f,
      exercicios: [...f.exercicios, { ...exercicioVazio }],
    }))
  }

  async function salvar() {
    const temVazio = rascunho.fichas.some((f) =>
      f.exercicios.some((ex) => !ex.nome.trim()),
    )
    if (temVazio) {
      setErro('Há exercícios sem nome. Preencha ou remova antes de salvar.')
      return
    }
    setErro('')
    setSalvando(true)
    try {
      await onSalvar(rascunho)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar.')
      setSalvando(false)
    }
  }

  return (
    <div className="px-5 py-8 pb-28">
      <h1 className="mb-4 text-2xl font-extrabold">Editar plano</h1>

      <label className="mb-5 block rounded-xl bg-card p-4">
        <span className="mb-1 block text-sm text-muted">
          Duração do plano (semanas)
        </span>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          className={inputCls}
          value={rascunho.semanas}
          onChange={(e) =>
            setRascunho({ ...rascunho, semanas: Number(e.target.value) || 0 })
          }
        />
      </label>

      <div className="space-y-5">
        {rascunho.fichas.map((ficha, fi) => (
          <section key={ficha.id} className="rounded-2xl bg-card p-4">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-base font-extrabold text-bg">
                {ficha.id}
              </span>
              <div className="flex-1 space-y-2">
                <input
                  className={inputCls}
                  value={ficha.nome}
                  onChange={(e) =>
                    atualizar(fi, (f) => ({ ...f, nome: e.target.value }))
                  }
                  placeholder="Nome da ficha"
                />
                <input
                  className={inputCls}
                  value={ficha.foco}
                  onChange={(e) =>
                    atualizar(fi, (f) => ({ ...f, foco: e.target.value }))
                  }
                  placeholder="Foco (ex.: Peito e tríceps)"
                />
              </div>
            </div>

            <div className="space-y-3">
              {ficha.exercicios.map((ex, ei) => (
                <div
                  key={ei}
                  className="rounded-xl bg-cardalt/40 p-3 ring-1 ring-white/5"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <input
                      className={inputCls}
                      value={ex.nome}
                      onChange={(e) => setEx(fi, ei, 'nome', e.target.value)}
                      placeholder="Nome do exercício"
                    />
                    <button
                      onClick={() => removerEx(fi, ei)}
                      aria-label="Remover exercício"
                      className="shrink-0 rounded-lg px-2 py-2 text-lg text-red-400 active:scale-90"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <label className="flex-1">
                      <span className="mb-1 block text-xs text-muted">Séries</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        className={inputCls}
                        value={ex.series}
                        onChange={(e) => setEx(fi, ei, 'series', e.target.value)}
                      />
                    </label>
                    <label className="flex-1">
                      <span className="mb-1 block text-xs text-muted">Reps</span>
                      <input
                        className={inputCls}
                        value={ex.repeticoes}
                        onChange={(e) =>
                          setEx(fi, ei, 'repeticoes', e.target.value)
                        }
                        placeholder="10-12 ou 30s"
                      />
                    </label>
                  </div>
                  <input
                    className={`${inputCls} mt-2`}
                    value={ex.dica}
                    onChange={(e) => setEx(fi, ei, 'dica', e.target.value)}
                    placeholder="Dica curta"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => addEx(fi)}
              className="mt-3 min-h-11 w-full rounded-xl border border-dashed border-white/20 text-sm font-medium text-accent active:scale-[0.99]"
            >
              + Adicionar exercício
            </button>
          </section>
        ))}
      </div>

      {erro && <p className="mt-4 text-sm text-red-400">{erro}</p>}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-bg/95 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-md gap-3">
          <button
            onClick={onCancelar}
            disabled={salvando}
            className="min-h-12 flex-1 rounded-xl bg-card font-bold disabled:opacity-50 active:scale-[0.99]"
          >
            Cancelar
          </button>
          <button
            onClick={() => void salvar()}
            disabled={salvando}
            className="min-h-12 flex-1 rounded-xl bg-accent font-bold text-bg disabled:opacity-60 active:scale-[0.99]"
          >
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
