import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Eliminar console.* y debugger del bundle de producción
    minify: 'esbuild',
    terserOptions: undefined,
    esbuildOptions: {
      drop: ['console', 'debugger'],
      pure: ['console.log', 'console.info', 'console.debug'],
    },
  },
})
