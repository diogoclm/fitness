import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Meta, Sexo, User } from '../types'
import { useAuth } from '../auth/AuthProvider'

const METAS: Meta[] = [
  'Emagrecimento',
  'Hipertrofia',
  'Condicionamento',
  'Saúde geral',
]
const SEXOS: Sexo[] = ['Masculino', 'Feminino', 'Outro']

const labelCls = 'mb-1.5 block text-sm font-medium text-muted'
const inputCls =
  'w-full rounded-xl bg-cardalt px-4 py-3 text-base text-white placeholder:text-muted/60 outline-none ring-1 ring-white/10 focus:ring-accent'

export default function Onboarding() {
  const navigate = useNavigate()
  const { profile, salvarProfile } = useAuth()
  const [nome, setNome] = useState(profile?.nome ?? '')
  const [idade, setIdade] = useState(profile ? String(profile.idade) : '')
  const [peso, setPeso] = useState(profile ? String(profile.peso) : '')
  const [altura, setAltura] = useState(profile ? String(profile.altura) : '')
  const [sexo, setSexo] = useState<Sexo>(profile?.sexo ?? 'Masculino')
  const [anamnese, setAnamnese] = useState(profile?.anamnese ?? '')
  const [meta, setMeta] = useState<Meta>(profile?.meta ?? 'Hipertrofia')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !idade || !peso || !altura) {
      setErro('Preencha nome, idade, peso e altura.')
      return
    }
    const user: User = {
      nome: nome.trim(),
      idade: Number(idade),
      peso: Number(peso),
      altura: Number(altura),
      sexo,
      anamnese: anamnese.trim(),
      meta,
    }
    setErro('')
    setSalvando(true)
    try {
      await salvarProfile(user)
      navigate('/plano')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar perfil.')
      setSalvando(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Fit<span className="text-accent">AI</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Conte um pouco sobre você para gerarmos seu treino.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls} htmlFor="nome">
            Nome
          </label>
          <input
            id="nome"
            className={inputCls}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls} htmlFor="idade">
              Idade
            </label>
            <input
              id="idade"
              type="number"
              inputMode="numeric"
              className={inputCls}
              value={idade}
              onChange={(e) => setIdade(e.target.value)}
              placeholder="anos"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="peso">
              Peso (kg)
            </label>
            <input
              id="peso"
              type="number"
              inputMode="decimal"
              className={inputCls}
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              placeholder="kg"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="altura">
              Altura (cm)
            </label>
            <input
              id="altura"
              type="number"
              inputMode="numeric"
              className={inputCls}
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
              placeholder="cm"
            />
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="sexo">
            Sexo
          </label>
          <select
            id="sexo"
            className={inputCls}
            value={sexo}
            onChange={(e) => setSexo(e.target.value as Sexo)}
          >
            {SEXOS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls} htmlFor="anamnese">
            Anamnese
          </label>
          <textarea
            id="anamnese"
            className={`${inputCls} min-h-24 resize-none`}
            value={anamnese}
            onChange={(e) => setAnamnese(e.target.value)}
            placeholder="Descreva dores, lesões ou limitações físicas"
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="meta">
            Meta
          </label>
          <select
            id="meta"
            className={inputCls}
            value={meta}
            onChange={(e) => setMeta(e.target.value as Meta)}
          >
            {METAS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {erro && <p className="text-sm text-red-400">{erro}</p>}

        <button
          type="submit"
          disabled={salvando}
          className="mt-2 min-h-14 w-full rounded-xl bg-accent text-lg font-bold text-bg disabled:opacity-60 active:scale-[0.99]"
        >
          {salvando ? 'Salvando…' : 'Salvar e continuar'}
        </button>
      </form>
    </div>
  )
}
