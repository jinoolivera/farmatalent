import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // expone el servidor a Windows (necesario desde WSL)
    port: 5176,         // puerto exclusivo para FarmaTalent (El Vergel usa 5173)
    proxy: {
      // API Laravel
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // Archivos públicos de Laravel (logos, imágenes subidas)
      '/storage': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
