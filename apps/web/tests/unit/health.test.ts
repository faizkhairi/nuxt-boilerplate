import { beforeEach, describe, expect, it, vi } from 'vitest'
import { makeEvent } from './helpers'

const queryRaw = vi.hoisted(() => vi.fn())
vi.mock('@myturborepo/database', () => ({ prisma: { $queryRaw: queryRaw } }))

const { default: health } = await import('../../server/api/health.get')

beforeEach(() => {
  queryRaw.mockReset()
})

describe('GET /api/health', () => {
  it('returns ok when the database answers', async () => {
    queryRaw.mockResolvedValue([{ ok: 1 }])
    const { event, res } = makeEvent({ url: '/api/health' })

    expect(await health(event)).toEqual({ status: 'ok' })
    expect(res.statusCode).toBe(200)
  })

  it('returns 503 when the database is unreachable', async () => {
    queryRaw.mockRejectedValue(new Error('connect ECONNREFUSED'))
    const { event, res } = makeEvent({ url: '/api/health' })

    expect(await health(event)).toEqual({ status: 'error' })
    expect(res.statusCode).toBe(503)
  })
})
