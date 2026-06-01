import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), 'VITE_')
  const backendTarget = env.VITE_API_PROXY_TARGET ?? 'http://localhost:3000'

  return {
    plugins: [tailwindcss(), react()],
    server: {
      host: '0.0.0.0',
      allowedHosts: ['lvh.me', '.lvh.me', 'localhost'],
      proxy: {
        '/config': backendTarget,
        '/health': backendTarget,
        '/auth': backendTarget,
        '/tenant': backendTarget,
        '/docs': backendTarget,
        '/openapi.json': backendTarget,
      },
    },
  }
})
