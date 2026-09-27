// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  // Generated reports, not source
  ignores: ['coverage/**', 'test-results/**', 'playwright-report/**'],
})
