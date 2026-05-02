import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const NET_WORTH_CARD_BACKGROUND: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(154.84deg, rgb(19, 78, 74) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 100%), linear-gradient(154.84deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 50%, rgba(109, 95, 213, 0.5) 100%)',
}

export function PortfolioHeaderSkeleton() {
  return (
    <Card
      data-slot="portfolio-header-skeleton"
      style={NET_WORTH_CARD_BACKGROUND}
      className={cn(
        'w-full max-w-[370px] gap-10 !rounded-medium border border-border bg-transparent p-6 ring-0',
        'lg:w-[560px] lg:max-w-none',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col items-start gap-5">
          <Skeleton className="h-4 w-20" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-12 w-56" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="size-10 rounded-full" />
      </div>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-6">
          <div className="flex min-w-[100px] flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="flex min-w-[100px] flex-col gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>
    </Card>
  )
}
