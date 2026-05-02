# Portfolio — Solana Portfolio Tracker

Open-source Solana portfolio tracker. Vite + React + TypeScript + Tailwind v4.

## Commands
- `pnpm dev` — start dev server
- `pnpm build` — type-check and build for production
- `pnpm preview` — preview production build
- `pnpm lint` — run Biome (lint + format + imports)
- `pnpm lint:fix` — auto-fix all Biome issues
- `pnpm format` — format files with Biome
- `pnpm typecheck` — TypeScript strict check
- `pnpm test` — run tests once
- `pnpm test:coverage` — run tests with coverage report
- `pnpm test:watch` — run tests in watch mode

## Code Conventions
- TypeScript strict mode — no `any` unless justified in a comment
- Prefer named exports over default exports
- Use `@/` path alias for imports (e.g., `@/components/ui/button`)
- Feature code in `src/features/[name]/`, shared UI in `src/components/`, utilities in `src/lib/`
- Colocate tests next to source files (`*.test.ts` / `*.test.tsx`)
- Use explicit `import { describe, it, expect } from 'vitest'` (no globals)
- Shared test utilities live in `src/test/`
- TanStack Router file-based routing in `src/routes/`
- `routeTree.gen.ts` is auto-generated — do not edit. It regenerates when the dev server runs after route files are added or removed.
- Do not install `eslint`, `prettier`, or their plugins — Biome handles lint, format, and import sorting

## Solana Stack
- `@wallet-ui/react` — wallet connection UI, hooks, provider
- `@wallet-ui/tailwind` — wallet component CSS
- `@solana/kit` — core Solana SDK (transactions, RPC, encoding)
- `@solana/kit-plugin-rpc` — RPC plugin for composable Kit client
- Do NOT use `@solana/web3.js` v1 or deprecated packages
- Do NOT expose API keys in `VITE_` env vars

## Testing Guidelines
- When writing or reviewing tests, see `.claude/rules/testing.md`

## Quality Gates
- Preview deployments are automatic on all PRs via Vercel
- CI runs `pnpm test:coverage` — test files must match `src/**/*.test.{ts,tsx}`
- Coverage measures all `src/**/*.{ts,tsx}` except `routeTree.gen.ts`, `src/test/**`, `src/vite-env.d.ts`, and test files

## Dependency Updates
- Dependabot opens grouped PRs weekly (`.github/dependabot.yml`) — see README "Dependency Updates" section for groups and review flow
- No auto-merge: every update PR is reviewed and merged manually

## Documentation Maintenance
When adding a new feature module to `src/features/`, update the system overview if it exists.
When introducing a new convention, consider whether it belongs here or in a path-scoped `.claude/rules/` file.
