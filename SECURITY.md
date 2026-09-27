# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, use [GitHub's private vulnerability reporting](https://github.com/faizkhairi/nuxt-boilerplate/security/advisories/new), which is enabled on this repository. Include:

1. A description of the vulnerability
2. Steps to reproduce the issue
3. Any potential impact

You will receive acknowledgment within 48 hours and a detailed response within 5 business days.

## Supported Versions

Only the latest commit on `main` is supported. There are no maintained release branches.

## Built-in Protections

This boilerplate ships with, and CI enforces:

- **Security headers and CSP** on every response (`apps/web/server/middleware/security-headers.ts`): Content-Security-Policy, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, and HSTS outside development.
- **Rate limiting** on auth endpoints (`apps/web/server/utils/ratelimit.ts`, applied via `apps/web/server/middleware/signin-rate-limit.ts`): the credentials sign-in callback, plus registration and password reset. It keys on the client IP recorded by the outermost trusted proxy (`TRUSTED_PROXY_COUNT`), not the spoofable leftmost `X-Forwarded-For` entry. It is in-memory and per-instance; use a shared store (for example Redis) behind a load balancer.
- **The next-auth patch** (`patches/next-auth.patch`): keeps next-auth on 4.24.15 (fixing GHSA-7rqj-j65f-68wh) while `@sidebase/nuxt-auth` 1.4 still expects the module layout from 4.21.
- **Secret scanning**: gitleaks runs in CI on every push and pull request.
- **Dependency auditing**: `pnpm audit --audit-level=high` runs in CI, and Dependabot opens automated dependency update pull requests.
- **Password hashing** with bcrypt. Email verification is tracked on the session (`session.user.emailVerified`) but does not block sign-in; add a check in `authorize()` in `apps/web/server/api/auth/[...].ts` if your app needs that.
- **Health check** (`GET /api/health`) for monitoring and load balancers.

## Security Best Practices

When using this boilerplate, ensure you:

- Never commit `.env` files or secrets to version control
- Generate a strong `NUXT_AUTH_SECRET` (`openssl rand -base64 32`)
- Use HTTPS in production
- Keep dependencies updated (`pnpm audit`, or let Dependabot open the PR)
- Swap the in-memory rate limiter for a shared store before scaling past one instance
- Set `TRUSTED_PROXY_COUNT` to match your actual reverse proxy chain (`0` when clients connect directly, so client-written IP headers are ignored)
