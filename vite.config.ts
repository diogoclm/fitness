import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'

// Lê o corpo da requisição e tenta parsear como JSON.
function lerBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolvePromise) => {
    let data = ''
    req.on('data', (c) => (data += c))
    req.on('end', () => {
      if (!data) return resolvePromise(undefined)
      try {
        resolvePromise(JSON.parse(data))
      } catch {
        resolvePromise(data)
      }
    })
  })
}

// Em produção cada arquivo em api/ é uma serverless function (Vercel).
// Em dev, este plugin reproduz o roteamento: /api/<rota> -> api/<rota>.ts,
// carregado via ssrLoadModule, com req/res no formato que os handlers esperam.
function apiDev(): Plugin {
  return {
    name: 'fitai-api-dev',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? ''
        if (!url.startsWith('/api/')) return next()

        const rota = url.split('?')[0].replace(/^\/api\//, '').replace(/\/+$/, '')
        const arquivo = resolve('api', `${rota}.ts`)
        if (!existsSync(arquivo)) return next()

        try {
          const body = await lerBody(req)
          const mod = await server.ssrLoadModule(`/api/${rota}.ts`)
          const handler = mod.default as (rq: unknown, rs: unknown) => unknown

          // Shim estilo Vercel sobre o res do Node.
          const vercelRes = res as ServerResponse & {
            status: (c: number) => typeof vercelRes
            json: (o: unknown) => void
          }
          vercelRes.status = (c: number) => {
            res.statusCode = c
            return vercelRes
          }
          vercelRes.json = (o: unknown) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(o))
          }

          const vercelReq = Object.assign(req, { body })
          await handler(vercelReq, vercelRes)
        } catch (e) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: e instanceof Error ? e.message : 'Erro interno.',
            }),
          )
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Disponibiliza as vars do .env (sem prefixo VITE_) para os handlers de API
  // em dev via process.env.
  const env = loadEnv(mode, process.cwd(), '')
  for (const [k, v] of Object.entries(env)) {
    if (process.env[k] === undefined) process.env[k] = v
  }
  return {
    plugins: [react(), tailwindcss(), apiDev()],
  }
})
