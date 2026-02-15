# Nuxt Boilerplate

Production-grade Nuxt 3 monorepo — zero external account dependencies. SaaS-ready scaffold with auth, database, email, UI components, and payments (opt-in).

## Features

- **Nuxt 3** with SSR, file-based routing, and Nitro server
- **Shadcn-vue + Tailwind CSS** — copy-paste UI components with dark mode
- **Prisma ORM + PostgreSQL** — type-safe database with migrations
- **Nodemailer** — SMTP-agnostic email with pre-built templates
- **Vitest + Playwright** — unit and E2E testing
- **Turborepo** — monorepo with shared packages
- **Docker Compose** — one-command local development
- **Netlify** — zero-config deployment

## Quick Start

```bash
# 1. Create project from template
gh repo create my-app --template faizkhairi/nuxt-boilerplate --private --clone
cd my-app

# 2. Install dependencies
pnpm install

# 3. Start services (PostgreSQL + Mailpit)
docker compose up -d

# 4. Configure environment
cp .env.example .env

# 5. Sync database schema
pnpm --filter @myturborepo/database db:push

# 6. Start development
pnpm dev
```

**Access:**
- App: http://localhost:3000
- Mailpit (email testing): http://localhost:8025
- Prisma Studio: `pnpm --filter @myturborepo/database db:studio`

## Architecture

```
apps/
├── web/              Nuxt 3 application
└── docs/             VitePress documentation

packages/
├── ui/               Shadcn-vue components (Button, Card, Input, Badge, ...)
├── database/         Prisma ORM + PostgreSQL schema
├── email/            Nodemailer + email templates (welcome, password reset, verification)
├── eslint-config/    Shared ESLint config
└── tsconfig/         Shared TypeScript config
```

## Tech Stack

| Concern | Technology | External Account? |
|---------|-----------|-------------------|
| Framework | Nuxt 3 (Vue 3, Nitro) | No |
| UI | Shadcn-vue + Tailwind CSS | No |
| Database | Prisma + PostgreSQL (Docker) | No |
| Email | Nodemailer + Mailpit (dev) | No |
| Auth | Sidebase Nuxt Auth (Auth.js) | No |
| Payments | Stripe (opt-in) | Only if needed |
| Testing | Vitest + Playwright | No |
| Deployment | Netlify | Free tier |

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps |
| `pnpm build` | Build all apps |
| `pnpm test` | Run all tests |
| `pnpm lint` | Lint all packages |
| `docker compose up -d` | Start PostgreSQL + Mailpit |
| `docker compose down` | Stop services |

## Email

**Development**: All emails are caught by Mailpit. View them at http://localhost:8025.

**Production**: Set SMTP environment variables to use any email provider:
```
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_xxx
```

Works with: Resend, Mailgun, SendGrid, Gmail SMTP, or any SMTP server.

## Deployment

**Netlify** (recommended):
```bash
netlify deploy --build
```

**Self-hosted** (Docker):
```bash
docker compose -f docker-compose.prod.yml up -d
```

## License

MIT
