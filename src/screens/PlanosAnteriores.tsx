import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PlanoArquivado } from '../types'
import { getPlanHistory } from '../lib/api'

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function PlanosAnteriores() {
  const navigate = useNavigate()
  const [planos, setPlanos] = useState<PlanoArquivado[] | null>(null)
  const [erro, setErro] = useState('')
  const [aberto, setAberto] = useState<string | null>(null)

  useEffect(() => {
    getPlanHistory()
      .then(setPlanos)
      .catch((e) =>
        setErro(e instanceof Error ? e.message : 'Erro ao carregar.'),
      )
  }, [])

  return (
    <div className="px-5 py-8">
      <header className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate('/plano')} className="text-sm text-muted">
          ← Voltar
        </button>
        <h1 className="text-2xl font-extrabold">Planos anteriores</h1>
      </header>

      {erro && <p className="text-sm text-red-400">{erro}</p>}

      {!planos && !erro && <p className="text-muted">Carregando…</p>}

      {planos && planos.length === 0 && (
        <div className="rounded-2xl bg-card p-8 text-center text-muted">
          Nenhum plano anterior ainda.
          <br />
          Ao gerar um novo plano, o atual fica guardado aqui.
        </div>
      )}

      <div className="space-y-3">
        {planos?.map((p) => (
          <section key={p.id} className="rounded-2xl bg-card p-4">
            <button
              onClick={() => setAberto(aberto === p.id ? null : p.id)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <div>
                <p className="font-bold">Plano de {fmt(p.geradoEm)}</p>
                <p className="text-xs text-muted">
                  {p.fichas.length} fichas · {p.semanas} semanas · arquivado em{' '}
                  {fmt(p.arquivadoEm)}
                </p>
              </div>
              <span className="text-muted">{aberto === p.id ? '▲' : '▼'}</span>
            </button>

            {aberto === p.id && (
              <div className="mt-4 space-y-4 border-t border-white/5 pt-4">
                {p.fichas.map((f) => (
                  <div key={f.id}>
                    <p className="mb-1 text-sm font-bold text-accent">
                      {f.nome}
                    </p>
                    <ul className="space-y-1">
                      {f.exercicios.map((ex, i) => (
                        <li
                          key={i}
                          className="flex justify-between gap-3 text-sm"
                        >
                          <span>{ex.nome}</span>
                          <span className="shrink-0 text-muted">
                            {ex.series} × {ex.repeticoes}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
