import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cookieLimpar } from '../_auth.js'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Set-Cookie', cookieLimpar())
  res.status(200).json({ ok: true })
}
