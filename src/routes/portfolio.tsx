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

  if (!account) {
    return (
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
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <PortfolioHeader isPending={isPending} />
        {/* Issue #8 chart sits as a sibling in this flex row */}
      </div>

      {/* Issue #7 drops <SortFilterBar> here */}

      <section aria-label="Token list" aria-busy={isPending}>
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
              <Button variant="outline" size="sm" onClick={() => refetch()}>
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
    </div>
  )
}
