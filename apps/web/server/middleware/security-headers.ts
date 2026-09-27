import { defineEventHandler, setResponseHeaders } from 'h3'

const isDev = import.meta.dev

// Security headers applied to every response.
//
// Why 'unsafe-inline' in script-src: Nuxt's server render inlines a small
// script that sets window.__NUXT__ (runtime config and state). Dropping
// 'unsafe-inline' needs a per-request nonce threaded into that script, which
// the nuxt-security module can do (https://nuxt-security.vercel.app) at the
// cost of another dependency. This boilerplate keeps the dependency list
// short and accepts 'unsafe-inline' instead; the same trade-off as the
// sibling Next.js template.
//
// Dev adds 'unsafe-eval' and ws: for Vite's HMR client.
const contentSecurityPolicy = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' data:`,
  // Checkout is a top-level redirect to Stripe-hosted pages, so no Stripe
  // domains are needed here. Add them if you embed Stripe.js.
  `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
  `frame-src 'none'`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
].join('; ')

const securityHeaders: Record<string, string> = {
  'Content-Security-Policy': contentSecurityPolicy,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  // HSTS only makes sense once the app is served over HTTPS.
  ...(isDev
    ? {}
    : { 'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload' }),
}

export default defineEventHandler((event) => {
  setResponseHeaders(event, securityHeaders)
})
