import { defineConfig } from 'vitest/config'

// Unit tests for the Nitro server code. They import h3 directly and build
// real events, so no Nuxt runtime is needed.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'server/utils/ratelimit.ts',
        'server/middleware/**',
        'server/api/health.get.ts',
        'server/api/register.post.ts',
      ],
    },
  },
})
