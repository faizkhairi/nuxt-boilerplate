import { beforeEach, describe, expect, it, vi } from 'vitest'
import signinRateLimit from '../../server/middleware/signin-rate-limit'
import securityHeaders from '../../server/middleware/security-headers'
import logging from '../../server/middleware/logging'
import { resetRateLimitStore } from '../../server/utils/ratelimit'
import { makeEvent } from './helpers'

const logRequest = vi.hoisted(() => vi.fn())
vi.mock('../../server/utils/logger', () => ({ logAudit: vi.fn(), logRequest }))

const signIn = { method: 'POST', url: '/api/auth/callback/credentials', remoteAddress: '192.0.2.1' }

beforeEach(() => {
  resetRateLimitStore()
  logRequest.mockReset()
})

describe('signin-rate-limit middleware', () => {
  it('lets the first five sign-in attempts through', async () => {
    for (let i = 0; i < 5; i++) {
      const { event } = makeEvent(signIn)
      expect(await signinRateLimit(event)).toBeUndefined()
    }
  })

  it('answers the sixth attempt with a 429 the auth client can read', async () => {
    for (let i = 0; i < 5; i++) await signinRateLimit(makeEvent(signIn).event)

    const { event, res } = makeEvent(signIn)
    const body = await signinRateLimit(event)

    expect(res.statusCode).toBe(429)
    expect(Number(res.getHeader('retry-after'))).toBeGreaterThan(0)
    expect(body).toEqual({ url: 'http://localhost:3000/auth/login?error=RateLimited' })
  })

  it('does not count other auth routes or methods', async () => {
    for (let i = 0; i < 10; i++) {
      await signinRateLimit(makeEvent({ ...signIn, url: '/api/auth/session' }).event)
      await signinRateLimit(makeEvent({ ...signIn, method: 'GET' }).event)
    }
    expect(await signinRateLimit(makeEvent(signIn).event)).toBeUndefined()
  })
})

describe('logging middleware', () => {
  it('logs the request once the response finishes', async () => {
    const { event, res } = makeEvent({ method: 'POST', url: '/api/register' })
    await logging(event)
    expect(logRequest).not.toHaveBeenCalled()

    res.statusCode = 201
    res.emit('finish')

    expect(logRequest).toHaveBeenCalledWith('POST', '/api/register', 201, expect.any(Number))
  })

  it('skips health checks and static assets', async () => {
    for (const url of ['/api/health', '/_nuxt/app.js', '/favicon.ico']) {
      const { event, res } = makeEvent({ url })
      await logging(event)
      res.emit('finish')
    }
    expect(logRequest).not.toHaveBeenCalled()
  })
})

describe('security-headers middleware', () => {
  it('sets the CSP and hardening headers', async () => {
    const { event, res } = makeEvent()
    await securityHeaders(event)

    const csp = String(res.getHeader('content-security-policy'))
    expect(csp).toContain(`default-src 'self'`)
    expect(csp).toContain(`frame-ancestors 'none'`)
    expect(csp).toContain(`object-src 'none'`)
    expect(csp).not.toContain('unsafe-eval')
    expect(res.getHeader('x-content-type-options')).toBe('nosniff')
    expect(res.getHeader('x-frame-options')).toBe('DENY')
    expect(res.getHeader('strict-transport-security')).toContain('max-age=')
  })
})
