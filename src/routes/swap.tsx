import { createFileRoute } from '@tanstack/react-router'
import { EmptyState } from '@/components/empty-state'

export const Route = createFileRoute('/swap')({
  component: SwapPage,
})

function SwapPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Swap</h1>
      <div className="mt-6">
        <EmptyState
          title="Swap unavailable"
          description="Connect a wallet to swap tokens."
        />
      </div>
    </div>
  )
}
