import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import tailwindcss from "@tailwindcss/vite"
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    global: 'window',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router-dom') || id.includes('react-router') || id.includes('@remix-run')) {
              return 'react-router';
            }
            if (id.includes('lucide-react')) {
              return 'lucide-icons';
            }
            if (id.includes('@tanstack')) {
              return 'react-query';
            }
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    // https: {
    //   key: fs.readFileSync('./crts/crt-key.pem'),
    //   cert: fs.readFileSync('./crts/crt.pem'),
    // }
  },
})
