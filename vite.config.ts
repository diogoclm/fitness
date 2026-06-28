import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { gerarPlanoCore } from './api/_core'

// Em produção, /api/gerar-plano é uma serverless function (Vercel).
// Em dev (`npm run dev`), este plugin serve a mesma rota usando a chave
// ANTHROPIC_API_KEY do .env — sem nunca expô-la ao navegador.
function apiDev(apiKey: string): Plugin {
  return {
    name: 'fitai-api-dev',
    configureServer(server) {
      server.middlewares.use('/api/gerar-plano', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Método não permitido.' }))
          return
        }
        if (!apiKey) {
          res.statusCode = 500
          res.end(
            JSON.stringify({
              error:
                'ANTHROPIC_API_KEY não configurada. Defina no .env e reinicie o npm run dev.',
            }),
          )
          return
        }
        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json')
          try {
            const user = JSON.parse(body || '{}')
            const plano = await gerarPlanoCore(user, apiKey)
            res.statusCode = 200
            res.end(JSON.stringify(plano))
          } catch (e) {
            res.statusCode = 500
            res.end(
              JSON.stringify({
                error: e instanceof Error ? e.message : 'Erro ao gerar o plano.',
              }),
            )
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), apiDev(env.ANTHROPIC_API_KEY)],
  }
})
