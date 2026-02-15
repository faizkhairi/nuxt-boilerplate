/// <reference types="vitest" />
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { resolve } from 'path'

// Resolve to a single Vue instance (prevents isCE mismatch between versions)
const vuePath = resolve(__dirname, '../../node_modules/vue')

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      vue: vuePath,
    },
    dedupe: ['vue'],
  },
  test: {
    reporters: ['verbose'],
    include: ['tests/**/*.test.ts'],
    globals: true,
    environment: 'jsdom',
  },
})
