import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { WalletUiDropdown } from '@/features/wallet'

const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/router-devtools').then((mod) => ({
        default: mod.TanStackRouterDevtools,
      })),
    )
  : () => null

const navLinks = [
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/swap', label: 'Swap' },
] as const

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: RootError,
  notFoundComponent: NotFound,
})

function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-white">
            Solana Portfolio
          </Link>

          <nav className="flex items-center gap-6">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-sm text-gray-400 hover:text-white [&.active]:text-white"
              >
                {label}
              </Link>
            ))}
          </nav>

          <WalletUiDropdown />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <Suspense>
        <TanStackRouterDevtools position="bottom-right" />
      </Suspense>
    </div>
  )
}

function RootError({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-400">
          Something went wrong
        </h1>
        <p className="mt-2 text-gray-400">{error.message}</p>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-gray-400">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="mt-4 inline-block text-purple-400 hover:text-purple-300"
      >
        Go home
      </Link>
    </div>
  )
}
