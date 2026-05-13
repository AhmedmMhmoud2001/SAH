import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { SAH_PUBLIC_ORIGIN } from './src/lib/sahPublicOrigin.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const apiBase = (env.VITE_API_BASE_URL || SAH_PUBLIC_ORIGIN).trim().replace(/\/$/, '')
  const apiUrl = (env.VITE_API_URL || `${apiBase}/api`).trim()
  const dashboardBase = (env.VITE_DASHBOARD_BASE_URL || '').trim().replace(/\/$/, '')

  return {
    plugins: [
      react(),
      {
        name: 'sah-inject-api-origin',
        transformIndexHtml(html, ctx) {
          if (ctx.server) return html
          const inject = `<script>window.__SAH_API_URL__=${JSON.stringify(apiUrl)};window.__SAH_API_BASE_URL__=${JSON.stringify(apiBase)};window.__SAH_DASHBOARD_BASE_URL__=${JSON.stringify(dashboardBase)};</script>`
          return html.replace('<head>', `<head>\n    ${inject}`)
        },
      },
    ],
  }
})
