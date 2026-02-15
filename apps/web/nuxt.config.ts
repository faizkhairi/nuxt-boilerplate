// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: [
    '@myturborepo/ui',
    '@nuxtjs/tailwindcss',
  ],
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
    // Client-exposed env vars
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },
  },
})
