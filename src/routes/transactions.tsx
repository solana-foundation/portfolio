import { createFileRoute } from '@tanstack/react-router'
import { EmptyState } from '@/components/empty-state'

export const Route = createFileRoute('/transactions')({
  component: TransactionsPage,
})

function TransactionsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Transactions</h1>
      <div className="mt-6">
        <EmptyState
          title="No transactions"
          description="Connect a wallet to view recent transaction history."
        />
      </div>
    </div>
  )
}
