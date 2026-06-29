import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'

function formatarData(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatarDuracao(seg: number): string {
  const m = Math.floor(seg / 60)
  const s = seg % 60
  return `${m}min ${String(s).padStart(2, '0')}s`
}

export default function Historico() {
  // Já vem do servidor ordenado (mais recentes primeiro).
  const { sessions: sessoes, removerSessao, limparHistorico } = useAuth()
  const [ocupado, setOcupado] = useState(false)

  async function remover(id: string) {
    if (ocupado) return
    setOcupado(true)
    try {
      await removerSessao(id)
    } finally {
      setOcupado(false)
    }
  }

  async function limparTudo() {
    if (ocupado) return
    if (!confirm('Apagar todo o histórico de treinos? Isso não pode ser desfeito.'))
      return
    setOcupado(true)
    try {
      await limparHistorico()
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div className="px-5 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Histórico</h1>
        {sessoes.length > 0 && (
          <button
            onClick={limparTudo}
            disabled={ocupado}
            className="rounded-lg px-3 py-2 text-sm font-medium text-red-400 ring-1 ring-red-400/30 disabled:opacity-50 active:scale-95"
          >
            Limpar tudo
          </button>
        )}
      </header>

      {sessoes.length === 0 ? (
        <div className="rounded-2xl bg-card p-8 text-center text-muted">
          Nenhum treino concluído ainda.
          <br />
          Bora treinar! 🏋️
        </div>
      ) : (
        <ul className="space-y-3">
          {sessoes.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-3 rounded-2xl bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{s.fichaNome}</p>
                <p className="text-xs text-muted">{formatarData(s.data)}</p>
              </div>
              <span className="shrink-0 rounded-lg bg-cardalt px-3 py-1 text-sm font-medium text-accent">
                {formatarDuracao(s.duracaoSeg)}
              </span>
              <button
                onClick={() => void remover(s.id)}
                disabled={ocupado}
                aria-label="Apagar treino"
                className="shrink-0 rounded-lg px-2 py-2 text-lg text-muted disabled:opacity-50 active:scale-90"
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
