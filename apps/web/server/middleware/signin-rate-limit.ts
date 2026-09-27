import {
  defineEventHandler,
  getRequestURL,
  setResponseHeader,
  setResponseStatus,
} from 'h3'
import { checkRateLimit, RateLimitPresets, retryAfterSeconds } from '../utils/ratelimit'

/**
 * Rate limits credentials sign-in (POST /api/auth/callback/credentials).
 *
 * The route belongs to the auth handler, so the limit runs here, before it.
 * The body is a sign-in result URL with `error=RateLimited` because the
 * nuxt-auth client reads `url` from the response even on an error status;
 * a bare 429 would surface as an "Invalid URL" exception on the login page.
 */
export default defineEventHandler((event) => {
  if (event.method !== 'POST') return

  const url = getRequestURL(event)
  if (url.pathname !== '/api/auth/callback/credentials') return

  if (!checkRateLimit(event, RateLimitPresets.auth, 'signin')) return

  setResponseStatus(event, 429)
  setResponseHeader(event, 'Retry-After', retryAfterSeconds(event, 'signin'))
  return { url: `${url.origin}/auth/login?error=RateLimited` }
})
