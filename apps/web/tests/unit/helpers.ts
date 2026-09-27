import { IncomingMessage, ServerResponse } from 'node:http'
import { Socket } from 'node:net'
import { createEvent, type H3Event } from 'h3'

export interface FakeRequest {
  method?: string
  url?: string
  headers?: Record<string, string>
  remoteAddress?: string
}

/** A real h3 event over an unconnected socket, for calling handlers directly. */
export function makeEvent({
  method = 'GET',
  url = '/',
  headers = {},
  remoteAddress,
}: FakeRequest = {}): { event: H3Event; res: ServerResponse } {
  const socket = new Socket()
  Object.defineProperty(socket, 'remoteAddress', { value: remoteAddress })
  const req = new IncomingMessage(socket)
  req.method = method
  req.url = url
  req.headers = { host: 'localhost:3000', ...headers }
  const res = new ServerResponse(req)
  return { event: createEvent(req, res), res }
}
