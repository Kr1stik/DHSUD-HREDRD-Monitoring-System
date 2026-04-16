import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    // 'serve' means local dev server (npm run dev). 'build' means production (npm run build).
    base: command === 'serve' ? '/HREDRD/' : '/static/',
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      proxy: {
        '/api': 'http://127.0.0.1:8000',
        '/media': 'http://127.0.0.1:8000'
      }
    }
  }
})
