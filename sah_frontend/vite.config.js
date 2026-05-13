import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const apiBase = (env.VITE_API_BASE_URL || 'https://sah.nodeteam.site').trim().replace(/\/$/, '')
  const apiUrl = (env.VITE_API_URL || `${apiBase}/api`).trim()

  return {
    plugins: [
      react(),
      {
        name: 'sah-inject-api-origin',
        transformIndexHtml(html, ctx) {
          if (ctx.server) return html
          const inject = `<script>window.__SAH_API_URL__=${JSON.stringify(apiUrl)};window.__SAH_API_BASE_URL__=${JSON.stringify(apiBase)};</script>`
          return html.replace('<head>', `<head>\n    ${inject}`)
        },
      },
    ],
  }
})
