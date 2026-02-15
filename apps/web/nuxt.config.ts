// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: [
    '@myturborepo/ui',
    '@nuxtjs/tailwindcss',
    '@sidebase/nuxt-auth',
  ],
  auth: {
    isEnabled: true,
    baseURL: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
    provider: {
      type: 'authjs',
    },
    globalAppMiddleware: {
      isEnabled: false,
    },
  },
  nitro: {
    preset: 'netlify',
  },
  tailwindcss: {
    configPath: './tailwind.config.ts',
    cssPath: './assets/css/main.css',
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
