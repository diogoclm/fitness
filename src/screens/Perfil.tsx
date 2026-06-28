import { useNavigate } from 'react-router-dom'
import { getUser, resetTudo } from '../lib/storage'

export default function Perfil() {
  const navigate = useNavigate()
  const user = getUser()
  if (!user) return null

  function refazer() {
    if (
      confirm(
        'Refazer o onboarding apaga seus dados e o plano atual. Continuar?',
      )
    ) {
      resetTudo()
      navigate('/')
    }
  }

  const linhas: [string, string][] = [
    ['Nome', user.nome],
    ['Idade', `${user.idade} anos`],
    ['Peso', `${user.peso} kg`],
    ['Altura', `${user.altura} cm`],
    ['Sexo', user.sexo],
    ['Meta', user.meta],
  ]

  return (
    <div className="px-5 py-8">
      <h1 className="mb-6 text-2xl font-extrabold">Perfil</h1>

      <div className="rounded-2xl bg-card p-5">
        <dl className="divide-y divide-white/5">
          {linhas.map(([k, v]) => (
            <div key={k} className="flex justify-between py-3">
              <dt className="text-muted">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        {user.anamnese && (
          <div className="mt-2 border-t border-white/5 pt-4">
            <p className="mb-1 text-sm text-muted">Anamnese</p>
            <p className="text-sm">{user.anamnese}</p>
          </div>
        )}
      </div>

      <button
        onClick={refazer}
        className="mt-6 min-h-12 w-full rounded-xl bg-card font-medium text-red-400 ring-1 ring-red-400/20 active:scale-[0.99]"
      >
        Refazer onboarding
      </button>
    </div>
  )
}
