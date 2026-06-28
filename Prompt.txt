Crie um plano para executar o prompt abaixo. Crie em etapas e a cada etapa realize testes.

Build a full-stack fitness web app (PWA — Progressive Web App installable on mobile) called **FitAI** in Portuguese (Brazil). The app should be deployable and work as a mobile-first experience.

---

## TECH STACK

- **Frontend:** React + Vite + TypeScript
- **Styling:** Tailwind CSS (mobile-first, responsive)
- **Backend/DB:** Supabase (auth + PostgreSQL + realtime)
- **AI:** Anthropic Claude API (claude-sonnet-4-6) for workout plan generation
- **PWA:** Vite PWA plugin (installable on iPhone/Android home screen)
- **State:** Zustand
- **Routing:** React Router v6

---

## CORE FEATURES

### 1. ONBOARDING — Anamnese + Dados Pessoais
- Form multi-step:
  - **Step 1 – Dados básicos:** nome, sexo, idade, peso (kg), altura (cm)
  - **Step 2 – Anamnese:** campo de texto livre onde o usuário descreve dores, lesões, limitações físicas, histórico de atividade física
  - **Step 3 – Metas:** seleção de objetivos (emagrecimento, hipertrofia, condicionamento, reabilitação, saúde geral) + campo de texto livre para detalhar
  - **Step 4 – Medidas corporais (opcional):** cintura, quadril, peito, braço, coxa (cm) — para acompanhamento de evolução
- Salvar tudo no perfil do usuário no Supabase
- Editar perfil e re-gerar plano a qualquer momento

---

### 2. GERAÇÃO DE PLANO COM IA
- Após onboarding, chamar Claude API com um system prompt robusto que inclua:
  - Dados do usuário (idade, peso, altura, sexo)
  - Anamnese (dores, limitações)
  - Metas
  - Gerar um plano de treino personalizado com:
    - Número de dias por semana recomendados
    - Fichas de treino (ex: Ficha A – Peito/Tríceps, Ficha B – Costas/Bíceps, etc.)
    - Para cada exercício: nome, séries, repetições, carga sugerida, dicas de execução, músculos trabalhados
    - Observações sobre limitações do usuário
- Retornar o plano em JSON estruturado (prompt Claude para retornar JSON puro)
- Salvar plano no Supabase
- Exibir plano de forma visual e bonita
- Permitir **editar o plano gerado:** adicionar/remover exercícios de cada ficha, reordenar, ajustar séries/reps
- Botão "Gerar novo plano" que re-chama a IA

---

### 3. FICHAS DE TREINO
- Listagem de fichas do plano ativo (Ficha A, B, C…)
- Cada ficha exibe: lista de exercícios, séries x reps, musculatura
- **Edição de ficha:** 
  - Adicionar exercício (busca por nome, com sugestão da IA se quiser)
  - Remover exercício
  - Reordenar (drag-and-drop ou botões ↑↓)
  - Editar séries/reps/carga de cada exercício

---

### 4. EXECUÇÃO DO TREINO (modo "play")
- Na tela de ficha, botão **"Iniciar Treino"**
- Ao iniciar:
  - **Timer geral** do treino começa (cronômetro crescente, visível sempre no topo)
  - Exibe exercício atual: nome, séries x reps, carga, dica de execução
  - Navegação: botões "Anterior" / "Próximo exercício"
  - Para cada exercício, botão **"Iniciar intervalo"** → abre um timer de descanso regressivo (padrão 60s, editável antes de iniciar — 30s, 45s, 60s, 90s, 2min)
  - O timer de intervalo toca um som/vibração ao terminar (Web API)
  - Campo para anotar a **carga usada** no treino atual (ex: "12kg")
  - Campo para **observações** do exercício (opcional)
  - Ao finalizar todos os exercícios: tela de conclusão mostrando:
    - Tempo total do treino
    - Exercícios feitos
    - Opções: **"Salvar treino"** / **"Refazer este treino"** / **"Editar ficha e salvar"**

---

### 5. HISTÓRICO DE TREINOS
- Registro automático ao salvar o treino:
  - Data e hora
  - Qual ficha foi feita
  - Tempo total
  - Exercícios executados com cargas anotadas
  - Observações gerais
- Tela de histórico: lista cronológica de sessões
- Ao clicar em uma sessão: detalhes completos
- **Gráficos de evolução:**
  - Frequência semanal de treinos (gráfico de barras)
  - Evolução de carga por exercício ao longo do tempo (linha)
  - Tempo médio de treino
- Aba de **medidas corporais:** registrar medidas ao longo do tempo + gráfico de evolução

---

### 6. AUTENTICAÇÃO
- Login/signup com email+senha via Supabase Auth
- Persistência de sessão
- Cada usuário tem seus próprios dados isolados (RLS no Supabase)

---

## DESIGN

- **Mobile-first, PWA** — deve funcionar perfeitamente no iPhone como app instalado
- Tema escuro por padrão (academia = ambiente com baixa luz)
- Paleta: fundo #0F0F0F, cards #1A1A1A, accent primário #E8FF3D (amarelo-neon), accent secundário #FF4444 (vermelho para alertas)
- Tipografia: Inter para corpo, peso heavy para números e timers
- Fonte grande nos timers (deve ser legível com o celular longe)
- Navegação inferior (bottom nav) com 4 itens: Início, Fichas, Histórico, Perfil
- Animações suaves mas sem exagero
- Modo landscape para a tela de execução de treino (considerar)

---

## ESTRUTURA DE DADOS (Supabase)

```sql
users (via Supabase Auth)

profiles:
  id, user_id, nome, sexo, idade, peso, altura, anamnese, metas, criado_em, atualizado_em

body_measurements:
  id, user_id, data, cintura, quadril, peito, braco, coxa

workout_plans:
  id, user_id, plano_json, ativo, criado_em

workout_sheets (fichas):
  id, plan_id, user_id, nome, ordem, descricao

exercises:
  id, sheet_id, user_id, nome, series, repeticoes, carga_sugerida, dica, musculos, ordem

workout_sessions (histórico):
  id, user_id, sheet_id, iniciado_em, finalizado_em, duracao_segundos, observacoes

session_exercises:
  id, session_id, exercise_id, carga_usada, series_feitas, observacoes
```

---

## VARIÁVEIS DE AMBIENTE NECESSÁRIAS
VITE_SUPABASE_URL=

VITE_SUPABASE_ANON_KEY=

VITE_ANTHROPIC_API_KEY=

---

## ENTREGÁVEIS ESPERADOS
1. Projeto completo rodando com `npm run dev`
2. Arquivo `README.md` com instruções de setup (Supabase tables SQL, variáveis de ambiente, deploy)
3. SQL script completo para criar todas as tabelas no Supabase com RLS
4. Build funcionando como PWA (manifest.json + service worker)
5. Deploy-ready para Vercel ou Netlify

---

## PRIORIDADE DE IMPLEMENTAÇÃO
Implemente nesta ordem:
1. Setup do projeto (Vite + React + TS + Tailwind + PWA)
2. Supabase config + SQL schema + auth
3. Onboarding flow
4. Integração Claude API + geração do plano
5. Telas de fichas + edição
6. Modo execução de treino (play + timers)
7. Histórico + gráficos
8. Polish visual + PWA manifest

Comece agora pelo passo 1 e pergunte se tiver dúvidas antes de prosseguir para o próximo passo.