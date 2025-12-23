import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/__tests__/**/*.test.ts', 'tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules', 'tests', 'dist'],
    },
  },
  resolve: {
    alias: {
      '#config': resolve(__dirname, './src/config'),
      '#common': resolve(__dirname, './src/common'),
      '#modules': resolve(__dirname, './src/modules'),
    },
  },
})
