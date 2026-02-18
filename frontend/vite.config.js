import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  base: './',
  build: {
    outDir: path.resolve(__dirname, '../docs'),
    emptyOutDir: false,
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, '..')]
    }
  }
})
