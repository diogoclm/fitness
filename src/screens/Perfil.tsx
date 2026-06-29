import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export default function Perfil() {
  const navigate = useNavigate()
  const { user, profile, logout } = useAuth()
  if (!profile) return null

  const linhas: [string, string][] = [
    ['Nome', profile.nome],
    ['Idade', `${profile.idade} anos`],
    ['Peso', `${profile.peso} kg`],
    ['Altura', `${profile.altura} cm`],
    ['Sexo', profile.sexo],
    ['Meta', profile.meta],
  ]

  return (
    <div className="px-5 py-8">
      <h1 className="mb-1 text-2xl font-extrabold">Perfil</h1>
      {user && <p className="mb-6 text-sm text-muted">{user.email}</p>}

      <div className="rounded-2xl bg-card p-5">
        <dl className="divide-y divide-white/5">
          {linhas.map(([k, v]) => (
            <div key={k} className="flex justify-between py-3">
              <dt className="text-muted">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        {profile.anamnese && (
          <div className="mt-2 border-t border-white/5 pt-4">
            <p className="mb-1 text-sm text-muted">Anamnese</p>
            <p className="text-sm">{profile.anamnese}</p>
          </div>
        )}
      </div>

      <button
        onClick={() => navigate('/onboarding')}
        className="mt-6 min-h-12 w-full rounded-xl bg-card font-medium text-accent ring-1 ring-accent/30 active:scale-[0.99]"
      >
        Editar perfil
      </button>

      <button
        onClick={() => void logout()}
        className="mt-3 min-h-12 w-full rounded-xl bg-card font-medium text-red-400 ring-1 ring-red-400/20 active:scale-[0.99]"
      >
        Sair
      </button>
    </div>
  )
}
