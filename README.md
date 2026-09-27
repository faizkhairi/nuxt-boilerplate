# Nuxt Boilerplate

Nuxt 4 Turborepo monorepo starter that needs no third-party SaaS accounts: credentials auth, Postgres via Prisma, email templates, and Stripe (opt-in), all running locally through Docker Compose.

[![CI](https://github.com/faizkhairi/nuxt-boilerplate/actions/workflows/ci.yaml/badge.svg)](https://github.com/faizkhairi/nuxt-boilerplate/actions/workflows/ci.yaml)

## Features

- **Auth**: Sidebase Nuxt Auth (`@sidebase/nuxt-auth` 1.4 on next-auth 4.24) with credentials + optional GitHub/Google OAuth, JWT sessions, email verification, password reset
- **Database**: Prisma 7 (`@prisma/adapter-pg`) + PostgreSQL, with `User`, `Account`, `Session`, `VerificationToken` and `Subscription` models
- **Email**: Nodemailer, SMTP-agnostic, with pre-built templates (welcome, verify, reset password); Mailpit catches everything locally
- **UI**: Shadcn-vue components on Tailwind CSS 4 (`@tailwindcss/vite`), dark mode
- **Payments (opt-in)**: Stripe Checkout Sessions and webhook handling, only active once `STRIPE_SECRET_KEY` is set
- **Security**: CSP and other security headers on every route, in-memory rate limiting on auth endpoints, an `/api/health` endpoint for uptime checks
- **Monorepo**: Turborepo + pnpm workspaces, `apps/web` (Nuxt 4), `apps/docs` (VitePress), shared `packages/ui`, `packages/database`, `packages/email`, `packages/payments`
- **CI**: lint, typecheck, unit tests with an enforced coverage floor, build on Node 22 and 24, `pnpm audit`, gitleaks secret scanning, and a Playwright E2E job, all in GitHub Actions
- **Dependabot**: automated dependency updates for npm and GitHub Actions

## Quick Start

Create a new project from this template, either:

```bash
npx degit faizkhairi/nuxt-boilerplate my-app
```

or:

```bash
gh repo create my-app --template faizkhairi/nuxt-boilerplate --clone
```

or click **Use this template** on GitHub and clone the resulting repository.

### Prerequisites

- Node.js 22.13+ (see `.nvmrc`; 24 is what this repo pins and CI's default build job uses)
- pnpm 12, via `corepack enable` (reads the pinned version from `package.json`) or `npm i -g pnpm@12`
- Docker Desktop, for local PostgreSQL and Mailpit

### Install and run

```bash
cd my-app

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Generate NUXT_AUTH_SECRET and paste the output into .env
openssl rand -base64 32

# Start PostgreSQL + Mailpit
docker compose up -d

# Sync the Prisma schema to the database
pnpm --filter @myturborepo/database db:push

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Development emails land in Mailpit at [http://localhost:8025](http://localhost:8025). Prisma Studio: `pnpm --filter @myturborepo/database db:studio`.

## Environment Variables

All variables are documented with placeholders in `.env.example`.

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma |
| `NUXT_AUTH_SECRET` | Yes | Signs auth JWTs and cookies; generate with `openssl rand -base64 32` |
| `NUXT_PUBLIC_APP_URL` | Yes | Base URL of the app, used for auth callbacks and links in emails |
| `SMTP_HOST` | Yes | SMTP server host (Mailpit locally, any provider in production) |
| `SMTP_PORT` | Yes | SMTP server port |
| `SMTP_USER` | Optional | SMTP username (empty for Mailpit) |
| `SMTP_PASS` | Optional | SMTP password (empty for Mailpit) |
| `SMTP_FROM` | Yes | Sender address for outgoing email |
| `NUXT_OAUTH_GITHUB_CLIENT_ID` | Optional | Enables GitHub OAuth when set with the secret below |
| `NUXT_OAUTH_GITHUB_CLIENT_SECRET` | Optional | GitHub OAuth app secret |
| `NUXT_OAUTH_GOOGLE_CLIENT_ID` | Optional | Enables Google OAuth when set with the secret below |
| `NUXT_OAUTH_GOOGLE_CLIENT_SECRET` | Optional | Google OAuth app secret |
| `STRIPE_SECRET_KEY` | Optional | Enables Stripe checkout and subscription management |
| `STRIPE_WEBHOOK_SECRET` | Optional | Verifies incoming Stripe webhook signatures |
| `NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional | Client-side Stripe publishable key |
| `TRUSTED_PROXY_COUNT` | Optional | Reverse proxies in front of the app that append to `X-Forwarded-For` (default `1`); sets which entry the rate limiter trusts as the client IP. `0` means no proxy: IP headers are ignored and the socket address is used |
| `NITRO_PRESET` | Optional | Overrides the Nitro deployment preset (default `netlify`); set to `node-server` for self-hosting or the E2E suite |

## Scripts

Run from the repository root; each fans out to every workspace package via Turborepo.

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in dev mode (parallel) |
| `pnpm build` | Build all apps and packages |
| `pnpm generate` | Static-generate apps that support it |
| `pnpm lint` / `pnpm lint:fix` | Lint (and autofix) the workspace |
| `pnpm typecheck` | Typecheck the workspace |
| `pnpm test` | Run unit tests across the workspace, excluding the e2e package |
| `pnpm test:e2e` | Run the Playwright E2E suite |
| `pnpm test:e2e:ui` | Run the E2E suite in Playwright's UI mode |
| `pnpm test:e2e:headed` | Run the E2E suite with a visible browser |

Package-level scripts used directly, with no root shortcut:

| Command | Description |
|---------|-------------|
| `pnpm --filter @myturborepo/database db:push` | Push the Prisma schema to the database (dev) |
| `pnpm --filter @myturborepo/database db:migrate` | Create and apply a Prisma migration |
| `pnpm --filter @myturborepo/database db:migrate:deploy` | Apply pending migrations in production |
| `pnpm --filter @myturborepo/database db:studio` | Open Prisma Studio |
| `pnpm --filter @myturborepo/database db:seed` | Run the Prisma seed script |
| `pnpm --filter @myturborepo/web test` | Run the web app's Vitest suite directly |
| `pnpm --filter @myturborepo/ui test` | Run the UI package's component tests |

## Testing

### Unit tests (Vitest)

```bash
pnpm test
```

- `apps/web/tests/unit` covers the Nitro server code (rate limiting, middleware, health check, registration) directly against `h3`, no Nuxt runtime needed. Coverage floors are enforced in `apps/web/vitest.config.ts`: 95% statements, 80% branches, 90% functions, 95% lines.
- `packages/ui/tests` covers the Shadcn-vue components with `@vue/test-utils`. Coverage floors are enforced in `packages/ui/vite.config.ts`: 95% statements, 100% branches, 80% functions, 95% lines.
- Coverage thresholds are a floor: they may only go up. Do not lower a threshold to make a failing suite pass, add tests instead.

### E2E tests (Playwright)

```bash
NITRO_PRESET=node-server pnpm --filter @myturborepo/web build
pnpm test:e2e
```

The Playwright config (`packages/e2e/playwright.config.ts`) starts a production `node-server` build with plain `node`, not `pnpm dev`, because the default `netlify` preset does not produce something Playwright can boot directly. Locally, a server already running on port 3000 is reused, so the two-step build-then-test sequence above is only required the first time or after a code change.

**Windows note**: the `node-server` build fails at runtime locally with `ERR_INVALID_FILE_URL_PATH`, a Nitro chunk-ordering issue with `import.meta.url` in Prisma's generated client. Linux and CI are unaffected. Run the E2E suite in WSL, Docker, or CI on Windows.

### Continuous Integration

`.github/workflows/ci.yaml` runs on every push to `main` and every pull request:

| Job | What it does |
|-----|---------------|
| `lint` | `pnpm lint`, plus a check for em dashes (`.github/scripts/check-dashes.sh`) |
| `typecheck` | `pnpm typecheck` |
| `test` | `pnpm test` (unit tests with coverage) |
| `build` | `pnpm build`, on Node 22 and Node 24 |
| `audit` | `pnpm audit --audit-level=high` |
| `secrets` | gitleaks secret scan |
| `e2e` | Builds a `node-server` bundle against a Postgres service container, then runs the Playwright suite on Chromium |

Three `deploy-*-main` jobs (docs, web, UI) are gated on `github.ref_type == 'tag'`: they only run when a tag is pushed, and they deploy to Netlify using site IDs and an auth token stored as repository secrets.

## Project Structure

```
nuxt-boilerplate/
├── apps/
│   ├── web/                      # Nuxt 4 application
│   │   ├── app/                  # Pages, components, assets (Nuxt 4 app/ layout)
│   │   ├── server/
│   │   │   ├── api/              # Nitro routes (auth, register, health, forgot/reset password)
│   │   │   ├── middleware/       # Security headers, sign-in rate limit, logging
│   │   │   └── utils/            # Auth, rate limiting, logging helpers
│   │   ├── tests/unit/           # Vitest specs for the server code
│   │   └── nuxt.config.ts
│   └── docs/                     # VitePress documentation site
│
├── packages/
│   ├── ui/                       # Shadcn-vue components (Button, Card, Input, Badge, ...)
│   ├── database/                 # Prisma schema, config and client
│   ├── email/                    # Nodemailer client + email templates
│   ├── payments/                 # Stripe client and composable (opt-in)
│   ├── e2e/                      # Playwright E2E tests
│   └── tsconfig/                 # Shared TypeScript config
│
├── docker-compose.yml            # PostgreSQL + Mailpit (local development)
├── turbo.json                    # Turborepo pipeline
└── .env.example                  # Environment variable template
```

## Security

- **Headers and CSP**: `apps/web/server/middleware/security-headers.ts` sets a Content-Security-Policy plus `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, and (outside development) `Strict-Transport-Security` on every response. The CSP keeps `script-src 'unsafe-inline'` because Nuxt's server render inlines a small script that sets `window.__NUXT__`; dropping it needs a per-request nonce threaded through the [nuxt-security](https://nuxt-security.vercel.app) module, an extra dependency this boilerplate deliberately does not add.
- **Rate limiting**: `apps/web/server/utils/ratelimit.ts` is an in-memory, per-instance limiter. It reads the client IP as the `X-Forwarded-For` entry `TRUSTED_PROXY_COUNT` hops from the right (default `1`, one reverse proxy), not the spoofable leftmost entry. With no proxy in front, set `TRUSTED_PROXY_COUNT=0` so it ignores IP headers and keys on the socket address. `apps/web/server/middleware/signin-rate-limit.ts` applies it to the credentials sign-in callback. The store resets on restart and does not coordinate across instances: swap it for a shared store (for example Redis) before running more than one instance.
- **Health check**: `GET /api/health` runs a cheap `SELECT 1` against the database and returns `503` if it fails, for monitoring and load balancers.
- **The next-auth patch**: `@sidebase/nuxt-auth` 1.4 imports `next-auth/core`, which next-auth stopped exporting after 4.21. Staying on 4.21 ships a critical advisory (GHSA-7rqj-j65f-68wh, fixed in 4.24.15), so `patches/next-auth.patch` re-exposes the `core` folder that 4.24.15 still ships. It is applied automatically via `pnpm-workspace.yaml`'s `patchedDependencies`. Remove it once sidebase supports next-auth 4.24 natively.
- **Dependency overrides**: `pnpm-workspace.yaml` pins `vitepress`'s transitive `vite`, `deepmerge-ts`, and `mysql2` past known advisories that would otherwise ship through Prisma's CLI or the docs app's dev server.
- **Secret scanning**: gitleaks runs in CI on every push and pull request.
- **Dependency auditing**: `pnpm audit --audit-level=high` runs in CI, and Dependabot opens automated dependency update pull requests.
- Report vulnerabilities as described in [SECURITY.md](SECURITY.md).

## Deployment

**Netlify** (default): Nitro's `netlify` preset is used automatically; no `NITRO_PRESET` override needed. CI's tag-gated `deploy-*-main` jobs deploy the docs, web, and UI Histoire builds using the Netlify CLI and `nwtgck/actions-netlify`.

**Self-hosted**:
```bash
NITRO_PRESET=node-server pnpm --filter @myturborepo/web build
node apps/web/.output/server/index.mjs
```
Run PostgreSQL alongside the app (`docker-compose.yml` covers local Postgres + Mailpit; run your own Postgres in production) and set environment variables via your process manager or container runtime. There is no bundled production Docker Compose file, add one if your deployment needs it.

Before deploying: apply pending migrations against the production database with `pnpm --filter @myturborepo/database db:migrate:deploy`, set all required environment variables, and confirm `/api/health` returns `200` after the deploy.

## Tech Stack

| Layer | Technology | External Account? |
|-------|-----------|-------------------|
| Framework | Nuxt 4.5 (Vue 3, Nitro) | No |
| UI | Shadcn-vue + Tailwind CSS 4 | No |
| Database | Prisma 7 (`@prisma/adapter-pg`) + PostgreSQL (Docker) | No |
| Email | Nodemailer + Mailpit (dev) | No |
| Auth | Sidebase Nuxt Auth 1.4 (next-auth 4.24) | No |
| Payments | Stripe (opt-in) | Only if enabled |
| Testing | Vitest + Playwright | No |
| Monorepo | Turborepo + pnpm 12 | No |
| Deployment | Netlify | Free tier |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, the checks CI runs, and commit conventions.

## License

[MIT](LICENSE). Based on [gurvancampion/turborepo-nuxt-boilerplate](https://github.com/gurvancampion/turborepo-nuxt-boilerplate) (MIT), extended with auth, database, email, payments, and testing scaffolding.

Author: Faiz Khairi ([faizkhairi.github.io](https://faizkhairi.github.io), [@faizkhairi](https://github.com/faizkhairi))
