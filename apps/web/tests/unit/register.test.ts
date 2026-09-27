import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetRateLimitStore } from '../../server/utils/ratelimit'
import { makeEvent } from './helpers'

const registerUser = vi.hoisted(() => vi.fn())
const logError = vi.hoisted(() => vi.fn())
vi.mock('../../server/utils/auth', () => ({ registerUser }))
vi.mock('../../server/utils/logger', () => ({ logAudit: vi.fn(), logError }))

vi.stubGlobal('createError', (input: { statusCode: number; message: string }) =>
  Object.assign(new Error(input.message), input),
)

const { default: register } = await import('../../server/api/register.post')

function postRegister(body: Record<string, unknown>) {
  const { event } = makeEvent({ method: 'POST', url: '/api/register', remoteAddress: '192.0.2.1' })
  event._requestBody = JSON.stringify(body)
  event.node.req.headers['content-type'] = 'application/json'
  return register(event)
}

async function rejection(promise: Promise<unknown>) {
  try {
    await promise
  } catch (error) {
    return error
  }
  throw new Error('expected a rejection')
}

beforeEach(() => {
  resetRateLimitStore()
  registerUser.mockReset()
  logError.mockReset()
})

describe('POST /api/register', () => {
  it('returns the created user', async () => {
    registerUser.mockResolvedValue({ id: 'u1', email: 'a@example.com', name: 'A' })

    const result = await postRegister({ email: 'a@example.com', password: 'Password123!' })

    expect(result).toMatchObject({ success: true, user: { id: 'u1' } })
  })

  it('rejects a missing password with 400', async () => {
    const error = await rejection(postRegister({ email: 'a@example.com' }))

    expect(error).toMatchObject({ statusCode: 400, message: 'Email and password are required' })
    expect(registerUser).not.toHaveBeenCalled()
  })

  it('reports a duplicate account as 409', async () => {
    registerUser.mockRejectedValue(new Error('User already exists'))

    const error = await rejection(postRegister({ email: 'a@example.com', password: 'Password123!' }))

    expect(error).toMatchObject({ statusCode: 409, message: 'User already exists' })
  })

  it('hides internal error text from the client and logs it instead', async () => {
    registerUser.mockRejectedValue(new Error('connect ECONNREFUSED 127.0.0.1:5432'))

    const error = await rejection(postRegister({ email: 'a@example.com', password: 'Password123!' }))

    expect(error).toMatchObject({ statusCode: 400, message: 'Registration failed' })
    expect(logError).toHaveBeenCalledOnce()
  })
})
