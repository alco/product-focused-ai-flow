import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  clearScreen: false,
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
  ],
  server: {
    // Forward the backend API (including Electric sync under /api/sync) to
    // Phoenix so the browser only ever talks to one origin — no CORS needed.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
