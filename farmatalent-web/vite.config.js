import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const proxyTarget = process.env.VITE_DEV_API_ORIGIN || 'http://localhost:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // expone el servidor a Windows (necesario desde WSL)
    port: 5176,         // puerto exclusivo para FarmaTalent (El Vergel usa 5173)
    proxy: {
      // API Laravel
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
      // Archivos públicos de Laravel (logos, imágenes subidas)
      '/storage': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
      // Páginas de compartir con Open Graph dinámico
      '/compartir': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
      '/images': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
