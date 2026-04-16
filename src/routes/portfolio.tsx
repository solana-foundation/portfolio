import { createFileRoute } from '@tanstack/react-router'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'

export const Route = createFileRoute('/portfolio')({
  component: PortfolioPage,
})

function PortfolioPage() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No wallet connected</EmptyTitle>
        <EmptyDescription>
          Connect a wallet to view your portfolio.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent />
    </Empty>
  )
}
