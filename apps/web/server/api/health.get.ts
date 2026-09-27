import { defineEventHandler, setResponseStatus } from 'h3'
import { prisma } from '@myturborepo/database'

/**
 * GET /api/health
 *
 * Health check for monitoring and load balancers.
 * Runs a cheap query to confirm the database is reachable.
 *
 * @returns {200} { status: "ok" }
 * @returns {503} { status: "error" } - database connection failed
 */
export default defineEventHandler(async (event) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'ok' }
  } catch {
    setResponseStatus(event, 503)
    return { status: 'error' }
  }
})
