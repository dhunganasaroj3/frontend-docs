import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// HashRouter + this base keeps routes working on GitHub Pages under /frontend-docs/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/frontend-docs/' : '/',
  plugins: [react(), tailwindcss()],
}))
