import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'
const isCI = !!process.env.CI

/**
 * See https://playwright.dev/docs/test-configuration.
 *
 * The web server is the production build (`pnpm build` with
 * NITRO_PRESET=node-server). It is started with `node` directly rather than
 * through pnpm, because the pnpm wrapper does not forward the shutdown
 * signal and teardown would hang. Locally, a server already running on
 * port 3000 is reused.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 1 : undefined,
  globalTimeout: isCI ? 10 * 60_000 : undefined,
  reporter: isCI
    ? [['list'], ['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'node ../../apps/web/.output/server/index.mjs',
    url: `${baseURL}/api/health`,
    reuseExistingServer: !isCI,
    timeout: 60_000,
  },
})
