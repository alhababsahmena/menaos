import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

const r = (p: string): string => path.resolve(__dirname, p)

export const aliases = {
  '@': r('./src'),
  '@app': r('./src/app'),
  '@components': r('./src/components'),
  '@features': r('./src/features'),
  '@lib': r('./src/lib'),
  '@config': r('./src/config'),
  '@types': r('./src/types'),
  '@mocks': r('./src/mocks'),
  '@stores': r('./src/stores'),
  '@hooks': r('./src/hooks'),
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: aliases },
  server: { port: 5173 },
})
