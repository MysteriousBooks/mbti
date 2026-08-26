/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: 'dist' },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.ts',
    passWithNoTests: true,
    coverage: { provider: 'v8', reporter: ['text', 'html'], thresholds: { lines: 80 } },
  },
})