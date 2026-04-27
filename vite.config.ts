import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // WHY: path alias @/ giúp import tuyệt đối, tránh ../../../ hell
      '@': resolve(__dirname, './src'),
    },
  },
})
