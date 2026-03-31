import { createFileRoute } from '@tanstack/react-router'
import { EmptyState } from '@/components/empty-state'

export const Route = createFileRoute('/portfolio')({
  component: PortfolioPage,
})

function PortfolioPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Portfolio</h1>
      <div className="mt-6">
        <EmptyState
          title="No assets to display"
          description="Connect a wallet to view token balances and asset details."
        />
      </div>
    </div>
  )
}
