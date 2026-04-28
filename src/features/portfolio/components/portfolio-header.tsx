import { EyeOff } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { PortfolioHeaderSkeleton } from './portfolio-header-skeleton'

const DASH_USD = '$—.——'
const DASH_FLOAT = '—.——'
const DASH_DELTA = '+—.——%'

const NET_WORTH_CARD_BACKGROUND: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(154.84deg, rgb(19, 78, 74) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 100%), linear-gradient(154.84deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 50%, rgba(109, 95, 213, 0.5) 100%)',
}

type PortfolioHeaderProps = {
  isPending: boolean
  onToggleHide?: () => void
}

export function PortfolioHeader({
  isPending,
  onToggleHide,
}: PortfolioHeaderProps) {
  if (isPending) {
    return <PortfolioHeaderSkeleton />
  }

  return (
    <Card
      style={NET_WORTH_CARD_BACKGROUND}
      className={cn(
        'w-full max-w-[370px] gap-10 rounded-medium border border-border bg-transparent p-6 ring-0',
        'lg:w-[560px] lg:max-w-none',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col items-start gap-5">
          <span className="text-sm font-normal text-muted-foreground">
            Net Worth
          </span>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-2">
              <h1 className="whitespace-nowrap font-numeric text-[50px] leading-[1.1] font-semibold text-muted-foreground/60">
                {DASH_USD}
              </h1>
              <div className="flex items-center gap-1 text-[22px] text-muted-foreground/60">
                <span className="font-numeric font-normal">{DASH_FLOAT}</span>
                <span className="font-sans font-normal">SOL</span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="font-numeric font-medium text-muted-foreground/60">
                {DASH_DELTA}
              </span>
              <span className="text-muted-foreground">since yesterday</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          aria-label="Hide values"
          onClick={() => onToggleHide?.()}
          className="flex shrink-0 items-center justify-center rounded-full bg-[rgba(23,21,51,0.8)] p-[13px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <EyeOff className="size-4 text-[#D1D5DB] opacity-80" aria-hidden />
        </button>
      </div>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-6">
          <StatPill label="Token Holdings" value={DASH_USD} />
          <StatPill label="Staked" value={DASH_USD} />
        </div>
      </div>
    </Card>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-[100px] flex-col gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-numeric text-[20px] font-medium text-muted-foreground/60">
        {value}
      </span>
    </div>
  )
}
