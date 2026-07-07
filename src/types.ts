export type Sexo = 'Masculino' | 'Feminino' | 'Outro'

export type Meta =
  | 'Emagrecimento'
  | 'Hipertrofia'
  | 'Condicionamento'
  | 'Saúde geral'

export interface User {
  nome: string
  idade: number
  peso: number // kg
  altura: number // cm
  sexo: Sexo
  anamnese: string
  meta: Meta
}

export interface Exercicio {
  nome: string
  series: number
  repeticoes: string // ex.: "10-12" ou "30s"
  dica: string
}

export interface Ficha {
  id: 'A' | 'B' | 'C'
  nome: string
  foco: string
  exercicios: Exercicio[]
}

export interface Plano {
  fichas: Ficha[]
  geradoEm: string // ISO date
  semanas: number // duração sugerida do plano (rotação ABC) → define a validade
}

// Plano arquivado (histórico de planos anteriores).
export interface PlanoArquivado extends Plano {
  id: string
  arquivadoEm: string // ISO date
}

export interface Sessao {
  id: string
  fichaId: 'A' | 'B' | 'C'
  fichaNome: string
  data: string // ISO date
  duracaoSeg: number
}

export interface AuthUser {
  id: string
  email: string
}
