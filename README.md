# Portfolio

An open source Solana portfolio tracker built with Next.js, TypeScript, and Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js 20.9.0+
- npm

### Setup

```bash
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm run typecheck` | Run TypeScript type checking |

## Architecture

```
src/
├── app/            # Next.js App Router pages and layouts
│   ├── layout.tsx  # Root layout (header + content shell)
│   ├── page.tsx    # Home page
│   ├── error.tsx   # Error boundary
│   └── not-found.tsx
├── components/     # Shared UI components
│   ├── header.tsx  # App header with wallet placeholder
│   └── empty-state.tsx
├── lib/            # Utilities, services, and data logic
└── styles/         # Shared styles (beyond Tailwind)
```

### Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Linting:** ESLint with next config
- **Formatting:** Prettier
