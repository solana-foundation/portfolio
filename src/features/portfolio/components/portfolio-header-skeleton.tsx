import { Skeleton } from '@/components/ui/skeleton'

export function PortfolioHeaderSkeleton() {
  return (
    <section className="flex flex-col gap-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-16" />
    </section>
  )
}
