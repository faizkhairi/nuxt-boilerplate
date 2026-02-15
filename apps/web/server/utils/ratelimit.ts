import type { H3Event } from 'h3'
import { logAudit } from './logger'

/**
 * In-memory rate limiter
 *
 * Tracks request counts per IP address in a sliding window.
 * For production with multiple servers, use Redis-based rate limiting.
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

/**
 * Rate limit configuration
 */
interface RateLimitConfig {
  maxRequests: number // Maximum requests allowed
  windowMs: number // Time window in milliseconds
  message?: string // Custom error message
}

/**
 * Check if request should be rate limited
 *
 * @param event - H3 event
 * @param config - Rate limit configuration
 * @returns true if request should be blocked
 */
export function checkRateLimit(
  event: H3Event,
  config: RateLimitConfig
): boolean {
  // Get client IP from request
  const ip = getRequestIP(event) || 'unknown'

  const now = Date.now()
  const key = `ratelimit:${ip}`

  // Initialize or get existing rate limit data
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    return false
  }

  // Increment request count
  store[key].count += 1

  // Check if limit exceeded
  if (store[key].count > config.maxRequests) {
    logAudit('RATE_LIMIT_EXCEEDED', {
      ip,
      count: store[key].count,
      limit: config.maxRequests,
    })
    return true
  }

  return false
}

/**
 * Get client IP address from request
 */
function getRequestIP(event: H3Event): string | undefined {
  const headers = event.node.req.headers

  // Try various IP headers (in order of preference)
  const ipHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip', // Cloudflare
    'x-client-ip',
  ]

  for (const header of ipHeaders) {
    const value = headers[header]
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return Array.isArray(value) ? value[0].split(',')[0].trim() : value.split(',')[0].trim()
    }
  }

  // Fallback to socket remote address
  return event.node.req.socket.remoteAddress
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
}
