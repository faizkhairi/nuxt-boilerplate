import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // One Vue instance for the components and @vue/test-utils
    dedupe: ['vue'],
  },
  test: {
    reporters: ['verbose'],
    include: ['tests/**/*.test.ts'],
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      include: ['components/**/*.{vue,ts}', 'lib/**/*.ts'],
      // Floors: measured coverage rounded down to the nearest 5%
      thresholds: { statements: 95, branches: 100, functions: 80, lines: 95 },
    },
  },
})
