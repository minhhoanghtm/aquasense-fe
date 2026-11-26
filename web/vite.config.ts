import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolveViteServerEnv } from './src/config/envSchema.ts'

export default defineConfig(({ mode }) => {
  const rawEnv = loadEnv(mode, process.cwd(), 'VITE_')
  const env = resolveViteServerEnv(rawEnv, mode)

  const proxy = env.proxyTarget
    ? {
        '/api': {
          target: env.proxyTarget,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ''),
        },
        [env.wsPath]: {
          target: env.proxyTarget,
          changeOrigin: true,
          ws: true,
        },
      }
    : undefined

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: env.host,
      port: env.port,
      strictPort: env.strictPort,
      proxy,
    },
    preview: {
      host: env.host,
      port: env.previewPort,
      strictPort: env.strictPort,
    },
  }
})
