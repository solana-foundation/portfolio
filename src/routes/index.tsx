import { createFileRoute } from '@tanstack/react-router'
import { EmptyState } from '@/components/empty-state'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-6">
        <EmptyState
          title="No wallet connected"
          description="Connect a wallet to view your portfolio overview."
        />
      </div>
    </div>
  )
}
