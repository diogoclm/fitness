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
  const { sessions: sessoes } = useAuth()

  return (
    <div className="px-5 py-8">
      <h1 className="mb-6 text-2xl font-extrabold">Histórico</h1>

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
              className="flex items-center justify-between rounded-2xl bg-card p-4"
            >
              <div>
                <p className="font-bold">{s.fichaNome}</p>
                <p className="text-xs text-muted">{formatarData(s.data)}</p>
              </div>
              <span className="shrink-0 rounded-lg bg-cardalt px-3 py-1 text-sm font-medium text-accent">
                {formatarDuracao(s.duracaoSeg)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
