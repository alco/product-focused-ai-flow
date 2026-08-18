import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// VITE_PORT/PHX_PORT let ../run.sh run multiple instances in parallel (one
// per git worktree) without colliding — see the "PORTS" section of
// ../README.md. Defaults match running this file standalone (no run.sh).
const vitePort = Number(process.env.VITE_PORT ?? 5173)
const phoenixPort = Number(process.env.PHX_PORT ?? 4000)

export default defineConfig({
  clearScreen: false,
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
  ],
  server: {
    port: vitePort,
    // Fail loudly instead of silently picking a different port when
    // vitePort is taken — a silent fallback would desync from what Caddy
    // (and, for the proxy target below, Phoenix) is actually listening on.
    strictPort: true,
    // Forward the backend API (including Electric sync under /api/sync) to
    // Phoenix so the browser only ever talks to one origin — no CORS needed.
    proxy: {
      '/api': `http://localhost:${phoenixPort}`,
    },
  },
})
