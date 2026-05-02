import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const LEGEND_ROW_KEYS = ['a', 'b', 'c', 'd', 'e', 'f'] as const

export function BreakdownCardSkeleton() {
  return (
    <Card
      data-slot="breakdown-card-skeleton"
      className={cn(
        'flex w-full min-w-0 flex-col items-start justify-between gap-10 !rounded-medium border border-border bg-background p-6 ring-0',
        'lg:flex-1',
        'xl:h-[250px] xl:gap-0',
      )}
    >
      <Skeleton className="h-3.5 w-24" />
      <div
        className={cn(
          'flex w-full min-w-0 flex-col items-center gap-10',
          'xl:flex-row xl:items-center xl:gap-10 xl:py-4',
        )}
      >
        <Skeleton className="size-[140px] shrink-0 rounded-full" />
        <div className="grid w-full min-w-0 grid-cols-2 gap-x-5 gap-y-5">
          {LEGEND_ROW_KEYS.map((key) => (
            <div key={key} className="flex min-w-0 items-center gap-2">
              <Skeleton className="size-7 shrink-0 rounded-full" />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
