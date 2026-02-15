# nuxt-boilerplate — AI Development Guide

## Project Overview
Production-grade Nuxt 3 Turborepo monorepo with zero external account dependencies. SaaS-ready scaffold with auth, database, email, UI components, and payments (opt-in).

## Quick Start
```bash
pnpm install
docker compose up -d                  # PostgreSQL + Mailpit
cp .env.example .env                  # Configure environment
pnpm --filter @myturborepo/database db:push  # Sync database schema
pnpm dev                              # Start all apps
```
- Web app: http://localhost:3000
- Mailpit UI: http://localhost:8025
- Prisma Studio: `pnpm --filter @myturborepo/database db:studio`

## Architecture
```
apps/web/           — Nuxt 3 application (SSR, Netlify deployment)
apps/docs/          — VitePress documentation site
packages/ui/        — Shadcn-vue components (Button, Card, Input, Badge, etc.)
packages/database/  — Prisma ORM + PostgreSQL schema
packages/email/     — Nodemailer SMTP client + email templates
packages/auth/      — Sidebase Nuxt Auth configuration
packages/payments/  — Stripe integration (opt-in, disabled by default)
packages/e2e/       — Playwright E2E tests
```

## Key Commands
| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in parallel |
| `pnpm build` | Build all apps |
| `pnpm test` | Run all tests (unit) |
| `pnpm test:e2e` | Run E2E tests with Playwright |
| `pnpm test:e2e:ui` | Run E2E tests in Playwright UI mode |
| `pnpm lint` | Lint all packages |
| `pnpm --filter @myturborepo/database db:push` | Sync Prisma schema to DB |
| `pnpm --filter @myturborepo/database db:migrate dev` | Create migration |
| `pnpm --filter @myturborepo/database db:studio` | Open Prisma Studio |
| `docker compose up -d` | Start PostgreSQL + Mailpit |
| `docker compose down` | Stop services |

## Conventions
- **Components**: Shadcn-vue pattern — components in `packages/ui/components/{name}/`. Auto-registered with `Ui` prefix: `<UiButton>`, `<UiCard>`, etc.
- **Database**: Prisma schema at `packages/database/prisma/schema.prisma`. After schema changes, run `db:push` (dev) or `db:migrate` (prod).
- **Email**: Use `sendEmail()` from `@myturborepo/email`. In dev, emails go to Mailpit (localhost:8025). In prod, set SMTP env vars.
- **Auth**: Sidebase Nuxt Auth (`@sidebase/nuxt-auth`) with Auth.js. Handler at `apps/web/server/api/auth/[...].ts`. Use `useSession()` composable in pages.
- **Payments**: Stripe integration (opt-in). Only enabled if `STRIPE_SECRET_KEY` is set. Use `useStripe()` composable from `@myturborepo/payments`.
- **Styling**: Tailwind CSS with Shadcn-vue CSS variables. Theme customization in `apps/web/assets/css/main.css`.
- **Validation**: Use Zod schemas at API boundaries.
- **Env vars**: Server-only vars in `runtimeConfig`, public vars in `runtimeConfig.public`. Access via `useRuntimeConfig()`.

## File Patterns
- **Pages**: `apps/web/pages/*.vue` — file-based routing
- **API routes**: `apps/web/server/api/*.ts` — Nitro server routes
- **Components**: `packages/ui/components/{name}/{Name}.vue` — Shadcn-vue pattern
- **Database models**: `packages/database/prisma/schema.prisma`
- **Email templates**: `packages/email/src/mailer.ts` — template functions

## Testing
- **Unit tests**: Vitest — `pnpm test`
- **UI tests**: `packages/ui/tests/` — component tests with @vue/test-utils
- **E2E tests**: Playwright — `pnpm test:e2e` (headless) or `pnpm test:e2e:ui` (interactive)
- **Test files**: `packages/e2e/tests/*.spec.ts` — E2E test specs (landing, auth flow, etc.)
- **Coverage**: `--coverage` flag enabled by default for unit tests

## Deployment
- **Netlify**: `netlify deploy --build` (Nitro auto-detects Netlify preset)
- **Docker**: `docker compose -f docker-compose.prod.yml up` (add prod compose as needed)
- **Database**: Neon PostgreSQL (free tier) or self-hosted PostgreSQL
