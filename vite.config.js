import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The chat asks the server (server/, port 3001) for replies at /api
const api = { '/api': 'http://localhost:3001' }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy: api },
  preview: { proxy: api },
})
