import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import type { Exercicio, Ficha, Plano as PlanoType } from '../types'
import { useAuth } from '../auth/AuthProvider'

const inputCls =
  'w-full rounded-lg bg-cardalt px-3 py-2 text-sm text-white placeholder:text-muted/60 outline-none ring-1 ring-white/10 focus:ring-accent'

const exercicioVazio: Exercicio = {
  nome: '',
  series: 3,
  repeticoes: '10-12',
  dica: '',
}

export default function EditarPlano() {
  const navigate = useNavigate()
  const { plan, salvarPlano } = useAuth()
  const [rascunho, setRascunho] = useState<PlanoType | null>(() =>
    plan ? structuredClone(plan) : null,
  )
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  if (!plan || !rascunho) return <Navigate to="/plano" replace />

  function atualizar(fi: number, fn: (f: Ficha) => Ficha) {
    setRascunho((r) =>
      r ? { ...r, fichas: r.fichas.map((f, i) => (i === fi ? fn(f) : f)) } : r,
    )
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
    if (!rascunho) return
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
      await salvarPlano(rascunho)
      navigate('/plano')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar.')
      setSalvando(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-8 pb-32">
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
            setRascunho((r) =>
              r ? { ...r, semanas: Number(e.target.value) || 0 } : r,
            )
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

      {/* Barra fixa de ações (esta tela fica fora do Layout, sem bottom nav) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-bg p-4">
        <div className="mx-auto flex max-w-md gap-3">
          <button
            onClick={() => navigate('/plano')}
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
