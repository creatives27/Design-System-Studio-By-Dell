import { defineConfig } from 'vite'

export default defineConfig({
  // Base public path — change this if deploying to a subfolder
  // e.g. base: '/design-system/' for GitHub Pages subfolder
  base: './',

  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },

  server: {
    port: 3000,
    open: true, // Auto-opens browser on npm run dev
  },
})
