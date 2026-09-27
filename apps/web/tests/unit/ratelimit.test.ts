import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  checkRateLimit,
  enforceRateLimit,
  getClientIP,
  resetRateLimitStore,
  retryAfterSeconds,
} from '../../server/utils/ratelimit'
import { makeEvent } from './helpers'

vi.mock('../../server/utils/logger', () => ({ logAudit: vi.fn() }))

const limit = { maxRequests: 2, windowMs: 60_000, message: 'Slow down' }

beforeEach(() => {
  resetRateLimitStore()
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.useRealTimers()
})

describe('getClientIP', () => {
  it('takes the entry the trusted proxy appended, not the client-written leftmost one', () => {
    const { event } = makeEvent({ headers: { 'x-forwarded-for': '6.6.6.6, 203.0.113.7' } })
    expect(getClientIP(event)).toBe('203.0.113.7')
  })

  it('gives a spoofer rotating the leftmost entry a single bucket', () => {
    for (const fake of ['1.1.1.1', '2.2.2.2']) {
      const { event } = makeEvent({ headers: { 'x-forwarded-for': `${fake}, 198.51.100.9` } })
      expect(checkRateLimit(event, limit, 'spoof')).toBe(false)
    }
    const { event } = makeEvent({ headers: { 'x-forwarded-for': '3.3.3.3, 198.51.100.9' } })
    expect(checkRateLimit(event, limit, 'spoof')).toBe(true)
  })

  it('honours TRUSTED_PROXY_COUNT for chained proxies', () => {
    vi.stubEnv('TRUSTED_PROXY_COUNT', '2')
    const { event } = makeEvent({ headers: { 'x-forwarded-for': '6.6.6.6, 203.0.113.7, 10.0.0.2' } })
    expect(getClientIP(event)).toBe('203.0.113.7')
  })

  it('trusts no address when there are fewer hops than trusted proxies', () => {
    vi.stubEnv('TRUSTED_PROXY_COUNT', '3')
    const { event } = makeEvent({ headers: { 'x-forwarded-for': '203.0.113.7, 10.0.0.2' } })
    expect(getClientIP(event)).toBeUndefined()
  })

  it('falls back to X-Real-IP only when X-Forwarded-For is absent', () => {
    const { event } = makeEvent({ headers: { 'x-real-ip': ' 192.0.2.4 ' } })
    expect(getClientIP(event)).toBe('192.0.2.4')

    const both = makeEvent({
      headers: { 'x-forwarded-for': '203.0.113.7', 'x-real-ip': '192.0.2.4' },
    })
    expect(getClientIP(both.event)).toBe('203.0.113.7')
  })

  it('uses the socket address when no proxy header is present', () => {
    const { event } = makeEvent({ remoteAddress: '127.0.0.1' })
    expect(getClientIP(event)).toBe('127.0.0.1')
  })

  it('uses only the socket address when TRUSTED_PROXY_COUNT is 0', () => {
    vi.stubEnv('TRUSTED_PROXY_COUNT', '0')
    const { event } = makeEvent({
      headers: { 'x-forwarded-for': '6.6.6.6, 203.0.113.7', 'x-real-ip': '192.0.2.4' },
      remoteAddress: '198.51.100.20',
    })
    expect(getClientIP(event)).toBe('198.51.100.20')
  })

  it('gives a client rotating X-Forwarded-For one bucket when TRUSTED_PROXY_COUNT is 0', () => {
    vi.stubEnv('TRUSTED_PROXY_COUNT', '0')
    for (const fake of ['1.1.1.1', '2.2.2.2']) {
      const { event } = makeEvent({
        headers: { 'x-forwarded-for': fake },
        remoteAddress: '198.51.100.20',
      })
      expect(checkRateLimit(event, limit, 'direct')).toBe(false)
    }
    const { event } = makeEvent({
      headers: { 'x-forwarded-for': '3.3.3.3' },
      remoteAddress: '198.51.100.20',
    })
    expect(checkRateLimit(event, limit, 'direct')).toBe(true)
  })

  it('ignores a negative TRUSTED_PROXY_COUNT and defaults to one proxy', () => {
    vi.stubEnv('TRUSTED_PROXY_COUNT', '-1')
    const { event } = makeEvent({ headers: { 'x-forwarded-for': '6.6.6.6, 203.0.113.7' } })
    expect(getClientIP(event)).toBe('203.0.113.7')
  })

  it('ignores an invalid TRUSTED_PROXY_COUNT and defaults to one proxy', () => {
    vi.stubEnv('TRUSTED_PROXY_COUNT', 'abc')
    const { event } = makeEvent({ headers: { 'x-forwarded-for': '6.6.6.6, 203.0.113.7' } })
    expect(getClientIP(event)).toBe('203.0.113.7')
  })
})

describe('checkRateLimit', () => {
  it('allows requests up to the limit and blocks the next one', () => {
    const { event } = makeEvent({ remoteAddress: '192.0.2.1' })
    expect(checkRateLimit(event, limit, 'a')).toBe(false)
    expect(checkRateLimit(event, limit, 'a')).toBe(false)
    expect(checkRateLimit(event, limit, 'a')).toBe(true)
  })

  it('keeps a separate count per scope', () => {
    const { event } = makeEvent({ remoteAddress: '192.0.2.1' })
    checkRateLimit(event, limit, 'a')
    checkRateLimit(event, limit, 'a')
    expect(checkRateLimit(event, limit, 'b')).toBe(false)
  })

  it('starts a fresh window once the old one expires', () => {
    vi.useFakeTimers()
    const { event } = makeEvent({ remoteAddress: '192.0.2.1' })
    checkRateLimit(event, limit, 'a')
    checkRateLimit(event, limit, 'a')
    expect(checkRateLimit(event, limit, 'a')).toBe(true)

    vi.advanceTimersByTime(60_001)
    expect(checkRateLimit(event, limit, 'a')).toBe(false)
  })
})

describe('retryAfterSeconds', () => {
  it('is 0 for a caller with no window', () => {
    const { event } = makeEvent({ remoteAddress: '192.0.2.1' })
    expect(retryAfterSeconds(event, 'none')).toBe(0)
  })

  it('counts down to the end of the window', () => {
    vi.useFakeTimers()
    const { event } = makeEvent({ remoteAddress: '192.0.2.1' })
    checkRateLimit(event, limit, 'a')
    vi.advanceTimersByTime(15_000)
    expect(retryAfterSeconds(event, 'a')).toBe(45)
  })
})

describe('enforceRateLimit', () => {
  it('passes under the limit', () => {
    const { event } = makeEvent({ remoteAddress: '192.0.2.1' })
    expect(() => enforceRateLimit(event, limit, 'a')).not.toThrow()
  })

  it('throws a 429 with Retry-After over the limit', () => {
    const { event, res } = makeEvent({ remoteAddress: '192.0.2.1' })
    enforceRateLimit(event, limit, 'a')
    enforceRateLimit(event, limit, 'a')

    let caught: unknown
    try {
      enforceRateLimit(event, limit, 'a')
    } catch (error) {
      caught = error
    }
    expect(caught).toMatchObject({ statusCode: 429, message: 'Slow down' })
    expect(Number(res.getHeader('retry-after'))).toBeGreaterThan(0)
  })
})
