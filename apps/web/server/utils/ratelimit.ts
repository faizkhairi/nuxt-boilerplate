import { createError, setResponseHeader, type H3Event } from 'h3'
import { logAudit } from './logger'

/**
 * In-memory rate limiter
 *
 * Tracks request counts per client IP in a fixed window.
 * The store lives in this process only: with several server instances each
 * one counts separately, so use a shared store (Redis) in that setup.
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
const cleanup = setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetTime < now) store.delete(key)
  }
}, 5 * 60 * 1000)
cleanup.unref?.()

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxRequests: number // Maximum requests allowed
  windowMs: number // Time window in milliseconds
  message?: string // Custom error message
}

/**
 * Check if request should be rate limited
 *
 * @param event - H3 event
 * @param config - Rate limit configuration
 * @param scope - Bucket name, so each route keeps its own count
 * @returns true if request should be blocked
 */
export function checkRateLimit(
  event: H3Event,
  config: RateLimitConfig,
  scope = 'default'
): boolean {
  const ip = getClientIP(event) || 'unknown'

  const now = Date.now()
  const key = `ratelimit:${scope}:${ip}`

  const entry = store.get(key)
  if (!entry || entry.resetTime < now) {
    store.set(key, { count: 1, resetTime: now + config.windowMs })
    return false
  }

  entry.count += 1

  if (entry.count > config.maxRequests) {
    logAudit('RATE_LIMIT_EXCEEDED', {
      ip,
      scope,
      count: entry.count,
      limit: config.maxRequests,
    })
    return true
  }

  return false
}

/**
 * Counts the request and, over the limit, sets Retry-After and throws a 429.
 */
export function enforceRateLimit(
  event: H3Event,
  config: RateLimitConfig,
  scope: string
): void {
  if (!checkRateLimit(event, config, scope)) return
  setResponseHeader(event, 'Retry-After', retryAfterSeconds(event, scope))
  throw createError({ statusCode: 429, message: config.message })
}

/** Seconds until the caller's window resets, for the Retry-After header. */
export function retryAfterSeconds(event: H3Event, scope = 'default'): number {
  const ip = getClientIP(event) || 'unknown'
  const entry = store.get(`ratelimit:${scope}:${ip}`)
  if (!entry) return 0
  return Math.max(0, Math.ceil((entry.resetTime - Date.now()) / 1000))
}

/** Clears every counter. Tests only. */
export function resetRateLimitStore(): void {
  store.clear()
}

function trustedProxyCount(): number {
  const parsed = Number.parseInt(process.env.TRUSTED_PROXY_COUNT ?? '', 10)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 1
}

function headerValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value.join(',') : value
}

/**
 * Client IP for rate limiting.
 *
 * X-Forwarded-For is a list the client can prepend to, so the leftmost entry
 * is whatever the client chose. Each trusted proxy appends the address it saw,
 * so the entry TRUSTED_PROXY_COUNT places from the right (default 1: one
 * reverse proxy) is the first address no client can forge. With fewer entries
 * than that the header did not pass through the expected proxies, so no IP is
 * trusted and those requests share the 'unknown' bucket.
 *
 * X-Real-IP is used only when X-Forwarded-For is absent (proxies that set just
 * that header). With neither header, the socket address is used.
 *
 * TRUSTED_PROXY_COUNT=0 means no proxy: every IP header is client-written, so
 * both are ignored and only the socket address counts.
 */
export function getClientIP(event: H3Event): string | undefined {
  const headers = event.node.req.headers
  if (trustedProxyCount() === 0) return event.node.req.socket?.remoteAddress

  const forwardedFor = headerValue(headers['x-forwarded-for'])
  if (forwardedFor) {
    const hops = forwardedFor
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
    const trusted = trustedProxyCount()
    if (hops.length < trusted) return undefined
    return hops[hops.length - trusted]
  }

  const realIp = headerValue(headers['x-real-ip'])?.trim()
  if (realIp) return realIp

  return event.node.req.socket?.remoteAddress
}

/**
 * Rate limit presets for common use cases
 */
export const RateLimitPresets = {
  // Strict limit for auth endpoints (5 requests per minute)
  auth: {
    maxRequests: 5,
    windowMs: 60 * 1000,
    message: 'Too many authentication attempts. Please try again later.',
  },

  // Moderate limit for API endpoints (30 requests per minute)
  api: {
    maxRequests: 30,
    windowMs: 60 * 1000,
    message: 'Too many requests. Please slow down.',
  },

  // Lenient limit for general routes (100 requests per minute)
  general: {
    maxRequests: 100,
    windowMs: 60 * 1000,
    message: 'Too many requests. Please try again later.',
  },
} satisfies Record<string, RateLimitConfig>
