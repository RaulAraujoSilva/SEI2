import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globals: true,
    reporters: ['default'],
    setupFiles: ['dotenv/config'],
    testTimeout: 20000,
    hookTimeout: 20000,
    fileParallelism: false,
    poolOptions: {
      threads: { minThreads: 1, maxThreads: 1 },
    },
  },
})


