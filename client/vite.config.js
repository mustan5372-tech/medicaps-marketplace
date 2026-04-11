import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build: 2
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Animation
          'vendor-motion': ['framer-motion'],
          // UI utilities
          'vendor-ui': ['react-hot-toast', 'react-icons', 'date-fns'],
          // State
          'vendor-state': ['zustand'],
          // Socket + API
          'vendor-network': ['axios', 'socket.io-client'],
        }
      }
    },
    chunkSizeWarningLimit: 600,
  }
})
