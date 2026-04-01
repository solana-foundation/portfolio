# Portfolio

Open-source Solana portfolio tracker. View token balances, transaction history, and swap tokens — all from a connected wallet. Built as a [Solana Foundation](https://solana.org/) fellowship project.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+

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
| `pnpm test` | Run tests once |
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

## Contributing

1. Run `pnpm lint`, `pnpm typecheck`, and `pnpm test` before pushing
2. All code must pass Biome checks and TypeScript strict mode
3. Tests are colocated with source files (`*.test.ts` / `*.test.tsx`)
