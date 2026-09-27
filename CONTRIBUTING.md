# Contributing

Thanks for considering a contribution to nuxt-boilerplate.

## Setup

```bash
pnpm install
cp .env.example .env
# generate NUXT_AUTH_SECRET and paste it into .env
openssl rand -base64 32
docker compose up -d
pnpm --filter @myturborepo/database db:push
pnpm dev
```

## Branching and commits

- Branch off `main`.
- Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`, `ci:`, ...) for commit messages and PR titles.
- Keep PRs focused on one change.

## Before opening a PR

Run the same checks CI runs, in the same order it runs them:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

- Coverage thresholds (`apps/web/vitest.config.ts`, `packages/ui/vite.config.ts`) are a floor: they may only go up. Do not lower a threshold to make a failing suite pass, add tests instead.
- Do not use an em dash (U+2014) or ` -- ` as a dash in any file, including commit messages and PR text. CI's `check-dashes.sh` script fails the `lint` job on either. Use a period, colon, comma or parentheses instead.
- If you touched `packages/e2e/`, also run the E2E suite locally: `NITRO_PRESET=node-server pnpm --filter @myturborepo/web build`, then `pnpm test:e2e` (needs `docker compose up -d` and `pnpm --filter @myturborepo/database db:push` first). On Windows, run this in WSL or Docker instead of natively; see the Testing section in README.md.

## Reporting a security issue

Do not open a public issue for a vulnerability. Follow the private reporting process in [SECURITY.md](SECURITY.md) instead.
