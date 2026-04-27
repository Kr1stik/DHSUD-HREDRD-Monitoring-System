import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure there is absolutely no 'base' property here
  build: {
    outDir: 'dist',
  }
})