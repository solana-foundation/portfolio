# Portfolio

Open-source Solana portfolio tracker. View token balances, transaction history, and swap tokens — all from a connected wallet. Built as a [Solana Foundation](https://solana.org/) fellowship project.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) — use [Corepack](https://nodejs.org/api/corepack.html) with the pinned `packageManager` version

### Setup

```bash
pnpm install
pnpm dev
```

The app runs at [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server with HMR |
| `pnpm build` | Type-check and build for production |
| `pnpm preview` | Serve the production build locally |
| `pnpm lint` | Run Biome (lint + format + import sorting) |
| `pnpm lint:fix` | Auto-fix all Biome issues |
| `pnpm format` | Format files with Biome |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm build:vite` | Build for production (without type-checking) |
| `pnpm test` | Run tests once |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm test:watch` | Run tests in watch mode |

## Tech Stack

**[Vite](https://vite.dev/) + [React](https://react.dev/)** — This is a fully client-side app with no server-side rendering needs. Vite provides near-instant dev server startup and fast HMR, while React gives us the component model and ecosystem for building interactive wallet UIs. Next.js was considered but adds SSR complexity with no benefit here.

**[TanStack Router](https://tanstack.com/router)** — File-based routing with full TypeScript type safety for route params and search params. Auto code-splitting via Vite plugin means each route is lazy-loaded by default. Chosen over React Router for the type-safe route/param contracts that catch errors at compile time.

**[Tailwind CSS v4](https://tailwindcss.com/)** — Utility-first CSS with a Vite plugin that handles compilation automatically — no config file needed. Keeps styling colocated with components and avoids the overhead of CSS-in-JS at runtime.

**[Biome](https://biomejs.dev/)** — Single tool for linting, formatting, and import sorting. Replaces the ESLint + Prettier combination with one binary that's 10-25x faster. One config file (`biome.json`) instead of two, no plugin compatibility issues.

**[pnpm](https://pnpm.io/)** — Strict dependency isolation prevents phantom dependencies (importing packages you didn't explicitly install). Faster installs through content-addressable storage.

**[TypeScript](https://www.typescriptlang.org/) (strict)** — Strict mode with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` enabled. These catch real bugs in Solana work: array access on token account lists returns `T | undefined`, and optional fields in account data can't accidentally receive `undefined`.

## Project Structure

```
src/
├── components/    # Shared, reusable UI components
├── lib/           # Shared utilities
├── routes/        # TanStack Router file-based routes
│   ├── __root.tsx # App shell layout (header, nav, outlet)
│   ├── index.tsx  # Dashboard (/)
│   ├── portfolio.tsx
│   ├── transactions.tsx
│   └── swap.tsx
└── styles/        # Global styles
```

Feature code will be organized by business domain (e.g., `src/features/wallet/`, `src/features/portfolio/`) as the project grows.

## Code Coverage

Run `pnpm test:coverage` to generate a coverage report. The terminal displays a summary table with statements, branches, functions, and line coverage for each file.

An HTML report is also generated at `coverage/index.html` — open it in a browser for detailed, line-by-line coverage highlighting. The `coverage/` directory is git-ignored.

CI also runs `pnpm test:coverage` on every PR, so coverage output is visible in GitHub Actions logs.

### What CI picks up

- **Test files:** `src/**/*.test.{ts,tsx}` — any `.test.ts` or `.test.tsx` file under `src/`
- **Coverage source files:** `src/**/*.{ts,tsx}` — all TypeScript/TSX files under `src/`
- **Excluded from coverage:** `src/routeTree.gen.ts` (auto-generated), `src/test/**` (test utilities), `src/vite-env.d.ts` (type declarations), and test files themselves

Coverage thresholds are not enforced yet. The goal is visibility: identify gaps in shared logic and risky code paths, then improve coverage incrementally.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow — local setup, branch and commit conventions, the pull request process, CI debugging, and dependency updates.

Quick rules: run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build:vite` before pushing. All four must pass in CI before merge.

## Preview Deployments

Every pull request automatically receives a preview deployment via Vercel. The preview URL appears as a comment on the PR and as a deployment status check. No configuration is needed from contributors.

Preview builds use `pnpm build:vite` — the same command CI runs. If the preview fails, check the Vercel deployment logs linked from the PR status check.

## Dependency Updates

Dependabot opens grouped update PRs every Monday. Configuration lives in `.github/dependabot.yml`.

### Groups

npm minor and patch updates are grouped into three PRs to reduce review load:

- **production** — runtime dependencies (`@solana/*`, `@tanstack/react-*`, `@wallet-ui/*`, `react`, `react-dom`, `tailwindcss`)
- **testing** — `vitest`, `@vitest/*`, `@testing-library/*`, `jsdom`
- **tooling** — `@biomejs/*`, `typescript`, `vite`, `@vitejs/*`, `@tailwindcss/vite`, `@tanstack/router-devtools`, `@tanstack/router-plugin`, `@types/*`

GitHub Actions updates are handled as a separate ecosystem and opened as their own PR(s).

Major version bumps are **not** grouped — each major lands in its own PR so the change can be reviewed carefully against breaking-change notes.

### Reviewing update PRs

1. Confirm the CI quality check passes (`lint`, `typecheck`, `test:coverage`, `build:vite`).
2. Review release notes linked in the PR body for each package in the group.
3. For majors, read the upstream migration guide before merging.
4. Merge manually — there is no auto-merge.

If a single package in a grouped PR breaks CI, rebase the PR without that package and open a separate PR for the problem update.
