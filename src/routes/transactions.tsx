import { createFileRoute } from '@tanstack/react-router'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'

export const Route = createFileRoute('/transactions')({
  component: TransactionsPage,
})

function TransactionsPage() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No transactions</EmptyTitle>
        <EmptyDescription>
          Connect a wallet to view recent transaction history.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent />
    </Empty>
  )
}
