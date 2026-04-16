import { createFileRoute } from '@tanstack/react-router'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'

export const Route = createFileRoute('/swap')({
  component: SwapPage,
})

function SwapPage() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>Swap unavailable</EmptyTitle>
        <EmptyDescription>Connect a wallet to swap tokens.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent />
    </Empty>
  )
}
