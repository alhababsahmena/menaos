import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { aliases } from './vite.config'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: aliases },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e', 'playwright-report', 'test-results'],
  },
})
