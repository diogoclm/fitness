import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'

const inputCls =
  'w-full rounded-xl bg-cardalt px-4 py-3 text-base text-white placeholder:text-muted/60 outline-none ring-1 ring-white/10 focus:ring-accent'

export default function Login() {
  const { login, register } = useAuth()
  const [modo, setModo] = useState<'entrar' | 'cadastrar'>('entrar')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (modo === 'cadastrar' && senha.length < 8) {
      setErro('A senha deve ter ao menos 8 caracteres.')
      return
    }
    setEnviando(true)
    try {
      if (modo === 'entrar') await login(email, senha)
      else await register(email, senha)
      // sucesso: o App redireciona conforme o estado de auth
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Fit<span className="text-accent">AI</span>
        </h1>
        <p className="mt-2 text-sm text-muted">
          {modo === 'entrar' ? 'Entre na sua conta' : 'Crie sua conta'}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          autoComplete="email"
          className={inputCls}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
        />
        <input
          type="password"
          autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
          className={inputCls}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Senha (mín. 8 caracteres)"
          required
        />

        {erro && <p className="text-sm text-red-400">{erro}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="min-h-14 w-full rounded-xl bg-accent text-lg font-bold text-bg disabled:opacity-60 active:scale-[0.99]"
        >
          {enviando
            ? 'Aguarde…'
            : modo === 'entrar'
              ? 'Entrar'
              : 'Cadastrar'}
        </button>
      </form>

      <button
        onClick={() => {
          setModo((m) => (m === 'entrar' ? 'cadastrar' : 'entrar'))
          setErro('')
        }}
        className="mt-6 text-center text-sm text-muted"
      >
        {modo === 'entrar' ? (
          <>
            Não tem conta? <span className="text-accent">Cadastre-se</span>
          </>
        ) : (
          <>
            Já tem conta? <span className="text-accent">Entrar</span>
          </>
        )}
      </button>
    </div>
  )
}
