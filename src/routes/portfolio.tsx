import { createFileRoute } from '@tanstack/react-router'
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { usePortfolioAssets } from '@/features/portfolio'
import { BreakdownCardSkeleton } from '@/features/portfolio/components/breakdown-card-skeleton'
import { FilterRowSkeleton } from '@/features/portfolio/components/filter-row-skeleton'
import { PortfolioHeader } from '@/features/portfolio/components/portfolio-header'
import { TokenTable } from '@/features/portfolio/components/token-table'
import { TokenTableSkeleton } from '@/features/portfolio/components/token-table-skeleton'
import { useWallet, WalletUiDropdown } from '@/features/wallet'

export const Route = createFileRoute('/portfolio')({
  component: PortfolioPage,
})

function PortfolioPage() {
  const { account } = useWallet()
  const { data, isPending, isError, refetch } = usePortfolioAssets()

  return (
    <div
      data-slot="portfolio-page"
      className="w-full px-4 py-12 lg:px-12 lg:py-20"
    >
      <div
        data-slot="portfolio-content"
        className="mx-auto flex w-full max-w-[1140px] flex-col items-center gap-6"
      >
        {!account ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No wallet connected</EmptyTitle>
              <EmptyDescription>
                Connect a wallet to view your portfolio.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <WalletUiDropdown />
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <div
              data-slot="portfolio-header-region"
              className="flex w-full flex-col gap-4 lg:flex-row lg:items-stretch"
            >
              <PortfolioHeader isPending={isPending} />
              <BreakdownCardSkeleton />
            </div>

            <FilterRowSkeleton />

            <section
              aria-label="Token list"
              aria-busy={isPending}
              className="w-full"
            >
              {isPending ? (
                <>
                  <span className="sr-only" role="status">
                    Loading portfolio data
                  </span>
                  <TokenTableSkeleton />
                </>
              ) : isError ? (
                <Alert variant="destructive">
                  <AlertTitle>Failed to load portfolio</AlertTitle>
                  <AlertDescription>
                    Something went wrong while fetching your tokens.
                  </AlertDescription>
                  <AlertAction>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                    >
                      Retry
                    </Button>
                  </AlertAction>
                </Alert>
              ) : data && data.items.length > 0 ? (
                <TokenTable assets={data.items} />
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>No tokens found</EmptyTitle>
                    <EmptyDescription>
                      This wallet doesn&apos;t hold any tokens yet.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
