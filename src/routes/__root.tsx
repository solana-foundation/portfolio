import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { lazy, Suspense, useState } from 'react'
import logoUrl from '@/assets/logo-wordmark.svg'
import { WalletButton } from '@/features/wallet'
import { cn } from '@/lib/utils'

const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/router-devtools').then((mod) => ({
        default: mod.TanStackRouterDevtools,
      })),
    )
  : () => null

const navLinks = [
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/swap', label: 'Swap' },
  { to: '/transactions', label: 'Activity' },
] as const

const NAV_LINK_BASE =
  'flex h-full items-center justify-center px-2.5 text-base text-muted-foreground transition-colors hover:text-foreground [&.active]:font-medium [&.active]:text-foreground'

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: RootError,
  notFoundComponent: NotFound,
})

function RootLayout() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <div className="flex h-[57px] w-full items-center justify-between overflow-clip border-b border-border px-8 py-2">
          <div className="flex h-full items-center gap-10">
            <Link
              to="/portfolio"
              className="flex h-full items-center"
              aria-label="Solana Portfolio"
            >
              <img
                src={logoUrl}
                alt="Solana Portfolio"
                width={109}
                height={22}
                className="h-[22px] w-[109px]"
              />
            </Link>

            <nav className="hidden h-full items-center gap-6 md:flex">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} className={NAV_LINK_BASE}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground md:hidden"
              onClick={() => setNavOpen((o) => !o)}
              aria-expanded={navOpen}
              aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
            >
              {navOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <WalletButton />
          </div>
        </div>

        {navOpen && (
          <nav className="border-b border-border px-4 py-2 md:hidden">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'block py-2 text-sm text-muted-foreground hover:text-foreground',
                  '[&.active]:font-medium [&.active]:text-foreground',
                )}
                onClick={() => setNavOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main>
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
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-destructive">
          Something went wrong
        </h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/portfolio"
        className="mt-4 inline-block text-primary hover:text-primary/80"
      >
        Go home
      </Link>
    </div>
  )
}
