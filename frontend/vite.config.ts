import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Force restart to load new tailwind config
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          const normalized = id.replace(/\\/g, '/');
          if (normalized.includes('node_modules')) {
            if (normalized.includes('xlsx')) {
              return 'vendor-xlsx';
            }
            if (normalized.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (normalized.includes('react-dom') || normalized.includes('react-router-dom') || normalized.includes('/react/')) {
              return 'vendor-react';
            }
            if (normalized.includes('@reduxjs') || normalized.includes('react-redux')) {
              return 'vendor-redux';
            }
            if (normalized.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (normalized.includes('firebase')) {
              return 'vendor-firebase';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
