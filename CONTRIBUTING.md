# Contributing

Welcome — this guide walks you through setting up the project, writing code the way the team does, and shipping a pull request through CI to merge. It assumes you are comfortable on the command line and with Git, but new to this stack. If something here is unclear, that is a doc bug — open an issue.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Available Commands](#available-commands)
- [Making Changes](#making-changes)
- [Pull Request Workflow](#pull-request-workflow)
- [When CI Fails](#when-ci-fails)
- [Code Coverage](#code-coverage)
- [Dependency Updates](#dependency-updates)
- [Tech Stack Quick Reference](#tech-stack-quick-reference)

## Prerequisites

- **Node.js 22+** — install from [nodejs.org](https://nodejs.org/) or via a version manager like `nvm` / `fnm` / `volta`
- **Corepack** — ships with Node.js 22; enable it once with `corepack enable` so `pnpm` is auto-installed at the version pinned in `package.json` (`packageManager` field)
- **Git** — and a GitHub account with SSH or HTTPS auth set up

You do not need to install `pnpm` globally. Corepack handles it. If you see `Cannot find module pnpm`, run `corepack enable` and try again.

## Local Setup

```bash
git clone https://github.com/solana-foundation/portfolio.git
cd portfolio
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173). The app should render with hot-reload — edits to `src/` files appear in the browser within ~100ms.

If `pnpm install` fails, the most common causes are:

- Wrong Node version — run `node --version`, must be 22+
- Corepack not enabled — run `corepack enable`
- Network proxy blocking the registry — try a different network

## Available Commands

| Command | What it does | When to run it |
|---|---|---|
| `pnpm dev` | Start Vite dev server with HMR at `localhost:5173` | While developing |
| `pnpm build` | Type-check then build for production | Sanity check before pushing |
| `pnpm build:vite` | Build only — skips type-check (matches CI) | Reproduce CI build issues locally |
| `pnpm preview` | Serve the production build on `localhost:4173` | Inspect the built output |
| `pnpm typecheck` | Run TypeScript in strict mode, no emit | Before pushing |
| `pnpm lint` | Run Biome (lint + format check + import order) | Before pushing |
| `pnpm lint:fix` | Auto-fix everything Biome can fix | After lint fails |
| `pnpm format` | Format files with Biome (no lint) | Rarely needed; `lint:fix` covers it |
| `pnpm test` | Run unit tests once | Before pushing |
| `pnpm test:watch` | Run tests in watch mode | While writing tests |
| `pnpm test:coverage` | Run tests + generate coverage report | When checking coverage gaps |

**Run before every push:** `pnpm lint && pnpm typecheck && pnpm test && pnpm build:vite`. These match CI exactly. If they pass locally, CI almost always passes too.

### Editor setup

Biome enforces a specific style — match it in your editor or `lint:fix` will rewrite your code on every save:

- Single quotes for strings (`'foo'`, not `"foo"`)
- No trailing semicolons (`as needed` only, e.g. before an array literal that starts a new statement)
- 2-space indentation
- Imports auto-organized

Install the [Biome VS Code extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) (or the JetBrains plugin) and set it as the default formatter for TS / TSX / JSON. Configuration lives in `biome.json` — do not add `.eslintrc` or `.prettierrc`.

## Making Changes

1. **Sync main:** `git checkout main && git pull origin main`
2. **Branch from main:** never branch from someone else's branch
3. **Use the naming convention:**
   - `feat/issue-N-short-description` — new feature
   - `fix/issue-N-short-description` — bug fix
   - `chore/issue-N-short-description` — config, build, deps
   - `docs/issue-N-short-description` — documentation
4. **Write code, run checks locally**
5. **Commit using [Conventional Commits](https://www.conventionalcommits.org/):**
   - `feat(portfolio): add token group filter`
   - `fix(wallet): handle disconnect during pending tx`
   - `chore(ci): bump pnpm to 10.34`
   - `docs: clarify CRLF guidance for Windows`

Keep commits small and focused. One logical change per commit. Squash-merge means commit history on `main` will be tidy regardless, but reviewers read your branch's commits — make them readable.

## Pull Request Workflow

1. **Push your branch:** `git push -u origin <branch-name>`
2. **Open a PR on GitHub** against `main`. The push output prints the link.
3. **Fill in the PR description:** what changed, why, and a test plan. Reference the issue with `Closes #N`.
4. **CI runs automatically** — one job called `quality` runs lint, typecheck, `test:coverage`, and `build:vite`. It takes about 2–4 minutes.
5. **Vercel deploys a preview** — a bot comments on your PR with the preview URL within ~1 minute. Click through to verify your change in a real browser.
6. **Request review** from the team. Address feedback by pushing new commits to the same branch (do not force-push during review unless asked).
7. **Resolve all review conversations.** Branch protection blocks merge until they are resolved.
8. **Squash and merge** once approved and CI is green. The branch must be up to date with `main` (GitHub shows an "Update branch" button when it isn't).

**Branch protection rules on `main`:**

- The `quality` CI check must pass
- The branch must be up to date with `main` (strict mode)
- All review conversations must be resolved
- No force-pushes, no branch deletion

## When CI Fails

Click the failing check in the PR's "Checks" panel to see the GitHub Actions log. The log shows which step failed and the full output.

Common failures and fixes:

- **`pnpm lint` fails** — run `pnpm lint:fix` locally. Biome auto-fixes most issues. Commit and push.
- **`pnpm typecheck` fails** — run `pnpm typecheck` locally and read the error. TypeScript is in strict mode with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`, so array access returns `T | undefined` and optional fields cannot accept `undefined`.
- **`pnpm test:coverage` fails** — run `pnpm test` locally. Use `pnpm test:watch` to iterate. Tests live next to source files (`*.test.ts` / `*.test.tsx`).
- **`pnpm build:vite` fails** — usually a runtime import error or a missing dependency. Run `pnpm build:vite` locally to reproduce.

### Windows + CRLF gotcha

Git on Windows defaults to `core.autocrlf=true`, which converts line endings to CRLF on checkout. The repo's `.gitattributes` says `* text=auto eol=lf`, but files checked out before that landed may still have CRLF on disk. Biome will then fail with formatter errors locally even though CI (Linux) passes.

To fix:

```bash
git config core.autocrlf input
git rm --cached -r .
git reset --hard
```

This re-checks out files with LF endings. Do this once on a fresh clone.

## Code Coverage

`pnpm test:coverage` generates a report (terminal summary + `coverage/index.html`). See the [Code Coverage section in README.md](./README.md#code-coverage) for what CI picks up and what it excludes.

No thresholds are enforced. Focus tests on shared logic in `src/lib/` and `src/features/*/`, plus risky code paths. Skip pure layout, framework wrappers, and auto-generated files. Test setup lives in `src/test/setup.ts` and shared test helpers in `src/test/`.

## Dependency Updates

Dependabot opens grouped PRs every Monday. The configuration lives in `.github/dependabot.yml`.

Groups (minor and patch only — majors get their own PRs):

- **production** — runtime deps (`@solana/*`, `@tanstack/react-*`, `@wallet-ui/*`, `react`, `react-dom`, `tailwindcss`)
- **testing** — `vitest`, `@vitest/*`, `@testing-library/*`, `jsdom`
- **tooling** — `@biomejs/*`, `typescript`, `vite`, `@vitejs/*`, `@tailwindcss/vite`, `@tanstack/router-devtools`, `@tanstack/router-plugin`, `@types/*`
- **github-actions** — separate ecosystem, separate PR

Review each Dependabot PR like any other PR: confirm CI passes, skim release notes for breaking changes, then merge. There is no auto-merge. For a major version bump, read the upstream migration guide first.

If one package in a grouped PR breaks CI, rebase the PR without that package and open a separate PR for the problem update.

## Tech Stack Quick Reference

- **[Vite](https://vite.dev/)** — dev server and build tool. Near-instant startup, fast HMR.
- **[React 19](https://react.dev/)** — UI library. The new compiler handles most memoization automatically.
- **[TypeScript (strict)](https://www.typescriptlang.org/)** — type safety with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
- **[TanStack Router](https://tanstack.com/router)** — file-based routing in `src/routes/`. Routes are typed end-to-end. `routeTree.gen.ts` is auto-generated — do not edit it.
- **[TanStack Query](https://tanstack.com/query)** — async state and caching for RPC calls.
- **[Tailwind CSS v4](https://tailwindcss.com/)** — utility-first styling via the Vite plugin. No config file needed.
- **[Biome](https://biomejs.dev/)** — single tool for lint, format, and import sorting. Replaces ESLint + Prettier. Do not install ESLint or Prettier.
- **[Vitest](https://vitest.dev/)** — test runner. Use explicit `import { describe, it, expect } from 'vitest'` (no globals).
- **[pnpm](https://pnpm.io/)** — package manager with strict dep isolation and content-addressable storage.
- **[Vercel](https://vercel.com/)** — preview deploys on every PR, production deploys on merge to `main`.

See the [Tech Stack section in README.md](./README.md#tech-stack) for the full rationale behind each tool.

### Path aliases and structure

- `@/*` resolves to `src/*` (e.g. `import { EmptyState } from '@/components/empty-state'`)
- Feature code under `src/features/<name>/`, shared UI under `src/components/`, utilities under `src/lib/`, routes under `src/routes/` (file-based)
- Tests colocated next to source (`*.test.ts` / `*.test.tsx`), shared test utilities under `src/test/`

For agent-specific conventions, see [`CLAUDE.md`](./CLAUDE.md) and the rule files under `.claude/rules/`.
