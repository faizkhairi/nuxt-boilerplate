# nuxt-boilerplate: AI Development Guide

## Project Overview
Nuxt 4 Turborepo monorepo starter with no required third-party SaaS accounts. Scaffold with auth, database, email, UI components, and payments (opt-in). Last updated: 2026-09-27.

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
apps/web/           - Nuxt 4 application (app code under app/, SSR, Netlify deployment)
apps/docs/          - VitePress documentation site
packages/ui/        - Shadcn-vue components (Button, Card, Input, Badge, etc.)
packages/database/  - Prisma 7 ORM + PostgreSQL schema
packages/email/     - Nodemailer SMTP client + email templates
packages/payments/  - Stripe integration (opt-in, disabled by default)
packages/e2e/       - Playwright E2E tests
packages/tsconfig/  - Shared TypeScript config
```
Auth is not a separate package: `@sidebase/nuxt-auth` is configured directly in `apps/web/nuxt.config.ts` and `apps/web/server/api/auth/[...].ts`.

## Key Commands
| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in parallel |
| `pnpm build` | Build all apps |
| `pnpm test` | Run all unit tests (excludes the e2e package) |
| `pnpm test:e2e` | Run E2E tests with Playwright |
| `pnpm test:e2e:ui` | Run E2E tests in Playwright UI mode |
| `pnpm lint` | Lint all packages |
| `pnpm typecheck` | Typecheck all packages |
| `pnpm --filter @myturborepo/database db:push` | Sync Prisma schema to DB |
| `pnpm --filter @myturborepo/database db:migrate` | Create migration |
| `pnpm --filter @myturborepo/database db:studio` | Open Prisma Studio |
| `docker compose up -d` | Start PostgreSQL + Mailpit |
| `docker compose down` | Stop services |

## Conventions
- **Components**: Shadcn-vue pattern, components in `packages/ui/components/{name}/`. Auto-registered with `Ui` prefix: `<UiButton>`, `<UiCard>`, etc.
- **Database**: Prisma schema at `packages/database/prisma/schema.prisma`, Prisma 7 with the Postgres adapter. After schema changes, run `db:push` (dev) or `db:migrate` (prod).
- **Email**: Use `sendEmail()` from `@myturborepo/email`. In dev, emails go to Mailpit (localhost:8025). In prod, set SMTP env vars.
- **Auth**: Sidebase Nuxt Auth (`@sidebase/nuxt-auth` 1.4) on next-auth 4.24, credentials provider plus optional GitHub/Google OAuth. Handler at `apps/web/server/api/auth/[...].ts`. Use `useSession()` composable in pages.
- **Payments**: Stripe integration (opt-in). Only enabled if `STRIPE_SECRET_KEY` is set. Use `useStripe()` composable from `@myturborepo/payments`.
- **Styling**: Tailwind CSS 4 via `@tailwindcss/vite`, with Shadcn-vue CSS variables. Theme customization in `apps/web/app/assets/css/main.css`.
- **Env vars**: Server-only vars in `runtimeConfig`, public vars in `runtimeConfig.public`. Access via `useRuntimeConfig()`.

## File Patterns
- **Pages**: `apps/web/app/pages/*.vue`, file-based routing
- **API routes**: `apps/web/server/api/*.ts`, Nitro server routes
- **Components**: `packages/ui/components/{name}/{Name}.vue`, Shadcn-vue pattern
- **Database models**: `packages/database/prisma/schema.prisma`
- **Email templates**: `packages/email/src/mailer.ts`, template functions

## Testing
- **Unit tests**: Vitest, `pnpm test`. Coverage floors are enforced in `apps/web/vitest.config.ts` and `packages/ui/vite.config.ts`.
- **UI tests**: `packages/ui/tests/`, component tests with `@vue/test-utils`
- **E2E tests**: Playwright, `pnpm test:e2e` (headless) or `pnpm test:e2e:ui` (interactive). The suite runs against a production `node-server` build (`NITRO_PRESET=node-server pnpm --filter @myturborepo/web build`), not `pnpm dev`.
- **Test files**: `packages/e2e/tests/*.spec.ts`, E2E test specs (landing, auth flow, session)
- **Windows note**: the `node-server` build fails at runtime locally with `ERR_INVALID_FILE_URL_PATH` from Prisma's generated client (a Nitro chunk-ordering issue). Run the e2e suite in WSL, Docker, or CI on Windows.

## Pre-Push Build Verification
**Always run the production build locally before pushing to CI:**
```bash
pnpm build
```
This catches type errors, missing imports, and Nitro build issues that dev mode silently ignores.

## Deployment
- **Netlify**: default target, Nitro's `netlify` preset is used unless `NITRO_PRESET` is overridden. CI's `deploy-*-main` jobs only run on tag pushes.
- **Self-hosted**: build with `NITRO_PRESET=node-server pnpm build` and run `node apps/web/.output/server/index.mjs`. `docker-compose.yml` covers local PostgreSQL and Mailpit only; there is no bundled production compose file, add one for your own deployment if needed.
- **Database**: any managed or self-hosted PostgreSQL instance.
