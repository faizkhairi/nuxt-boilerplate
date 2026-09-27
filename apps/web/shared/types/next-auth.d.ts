import type { DefaultSession } from 'next-auth'

// Fields the auth handler's session callback adds to `session.user`.
declare module 'next-auth' {
  interface Session {
    user?: DefaultSession['user'] & {
      id?: string
      role?: string
      emailVerified?: boolean
    }
  }
}
