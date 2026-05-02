import { Skeleton } from '@/components/ui/skeleton'

export function FilterRowSkeleton() {
  return (
    <div
      data-slot="filter-row-skeleton"
      className="flex w-full flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6"
    >
      <Skeleton className="h-[42px] w-full rounded-medium lg:max-w-[557px]" />
      <div className="flex items-center gap-6">
        <Skeleton className="h-5 w-[120px]" />
        <Skeleton className="h-5 w-[120px]" />
      </div>
    </div>
  )
}
