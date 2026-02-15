import { defineEventHandler } from 'h3'
import { logRequest } from '../utils/logger'

/**
 * Request logging middleware
 *
 * Logs all HTTP requests with method, URL, status code, and duration.
 * Runs for all API routes and server-rendered pages.
 */
export default defineEventHandler(async (event) => {
  const startTime = Date.now()

  // Get request details
  const method = event.node.req.method || 'GET'
  const url = event.node.req.url || '/'

  // Wait for the response
  await event.node.res.on('finish', () => {
    const duration = Date.now() - startTime
    const statusCode = event.node.res.statusCode

    // Skip logging for static assets and health checks
    if (
      !url.startsWith('/_nuxt/') &&
      !url.startsWith('/favicon') &&
      !url.startsWith('/api/health')
    ) {
      logRequest(method, url, statusCode, duration)
    }
  })
})
