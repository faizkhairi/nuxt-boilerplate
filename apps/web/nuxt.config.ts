// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: [
    '@myturborepo/ui',
    '@sidebase/nuxt-auth',
    '@nuxt/eslint',
  ],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  auth: {
    isEnabled: true,
    baseURL: `${process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth`,
    provider: {
      type: 'authjs',
    },
    globalAppMiddleware: {
      isEnabled: false,
    },
  },
  nitro: {
    // Netlify by default; CI's e2e job builds with NITRO_PRESET=node-server
    preset: process.env.NITRO_PRESET || 'netlify',
  },
  runtimeConfig: {
    // Server-only env vars (not exposed to client)
    databaseUrl: process.env.DATABASE_URL,
    authSecret: process.env.NUXT_AUTH_SECRET,
    smtpHost: process.env.SMTP_HOST || 'localhost',
    smtpPort: process.env.SMTP_PORT || '1025',
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpFrom: process.env.SMTP_FROM || 'noreply@example.com',
    // Stripe (opt-in)
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    // Client-exposed env vars
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
      stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    },
  },
})
