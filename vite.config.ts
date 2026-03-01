import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Dev-only bridge to expose the Vercel function locally via Vite
const devApiProxy = {
  name: 'dev-api-proxy',
  apply: 'serve' as const,
  configureServer(server: any) {
    async function runHandler(path: string, req: any, res: any, handlerImport: () => Promise<any>) {
      try {
        const chunks: Uint8Array[] = []
        for await (const chunk of req) chunks.push(chunk)
        const raw = Buffer.concat(chunks).toString()
        req.body = raw ? JSON.parse(raw) : {}

        // Minimal Vercel-style response helpers
        res.status = (code: number) => {
          res.statusCode = code
          return res
        }
        res.json = (obj: any) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(obj))
        }

        console.log(`[dev-api] ${path}`)

        const handler = (await handlerImport()).default
        await handler(req, res)
      } catch (error) {
        console.error(`Dev API proxy error (${path}):`, error)
        res.statusCode = 500
        res.end(JSON.stringify({ error: 'Dev API proxy failed' }))
      }
    }

    server.middlewares.use('/api/whatsapp/tester', (req: any, res: any, next: any) => {
      if (req.method !== 'POST') return next()
      return runHandler('/api/whatsapp/tester', req, res, () => import('./api/whatsapp/tester'))
    })

    server.middlewares.use('/api/auth/verify-otp', (req: any, res: any, next: any) => {
      if (req.method !== 'POST') return next()
      return runHandler('/api/auth/verify-otp', req, res, () => import('./api/auth/verify-otp'))
    })

    server.middlewares.use('/api/auth/request-otp', (req: any, res: any, next: any) => {
      if (req.method !== 'POST') return next()
      return runHandler('/api/auth/request-otp', req, res, () => import('./api/auth/request-otp'))
    })
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devApiProxy],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
