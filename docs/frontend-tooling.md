# Frontend Tooling Decisions

Why we picked what we picked — so future contributors don't have to guess.

## Next.js 16 (App Router)

Over Vite + React Router. Next.js gives us file-based routing, server/client components, and API routes in one package. The Solana ecosystem has strong Next.js support, so contributors will find plenty of reference material.

## Turbopack

Default bundler in Next.js 16. Fast cold starts, instant HMR, no config needed. Fall back to Webpack with `--webpack` if ever needed.

## TypeScript (strict mode)

Multi-contributor project — TypeScript catches integration bugs early and gives editors autocompletion for props, API types, and Solana types.

## Tailwind CSS v4

Styles live next to markup — no file jumping. Consistent design tokens out of the box. Good fit for dashboard-style UI. For complex patterns, extract into components rather than using `@apply`.

## ESLint + Prettier

Two tools, separate concerns. ESLint catches code issues (unused vars, Next.js rules). Prettier handles formatting. Keeps config simple and conflict-free.

## Project Structure

```
src/
├── app/            # Pages, layouts, error boundaries
├── components/     # Shared UI components
├── lib/            # Utilities, services, data fetching
└── styles/         # Shared styles beyond Tailwind
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build |
| `npm run lint` | ESLint checks |
| `npm run format` | Auto-format with Prettier |
| `npm run format:check` | Check formatting (for CI) |
| `npm run typecheck` | Type check without emitting |

## When to Revisit

- Adding shared packages → consider Turborepo
- Turbopack missing a feature → fall back to Webpack
- Need a real backend → evaluate a separate service
