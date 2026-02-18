import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: path.resolve(__dirname, '../'),
  build: {
    outDir: path.resolve(__dirname, '../docs'),
    emptyOutDir: true,
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, '..')]
    }
  }
})
