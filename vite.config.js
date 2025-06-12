import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2']
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'assets/[name].[hash][extname]';
          return 'assets/[name].[hash][extname]';
        }
      }
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer
      ]
    },
    devSourcemap: true
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3030',
        changeOrigin: true,
        secure: false
      }
    }
  },
  define: {
    'process.env': {
      NODE_ENV: process.env.NODE_ENV
    }
  }
})
