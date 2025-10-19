import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    warmup: {
      clientFiles: ['./src/main.jsx', './src/App.jsx']
    },
    fs: {
      strict: false
    }
  },
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom', 
      'framer-motion', 'dexie', 'uuid',
      'react-window', 'react-beautiful-dnd',
      '@headlessui/react', '@heroicons/react/24/outline'
    ],
    force: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          db: ['dexie']
        }
      }
    }
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
})