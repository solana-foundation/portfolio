import { PortfolioHeaderSkeleton } from './portfolio-header-skeleton'

type PortfolioHeaderProps = {
  assetCount: number | undefined
  isPending: boolean
}

export function PortfolioHeader({
  assetCount,
  isPending,
}: PortfolioHeaderProps) {
  if (isPending) {
    return <PortfolioHeaderSkeleton />
  }

  const countLabel =
    assetCount === undefined
      ? ''
      : assetCount === 1
        ? '1 asset'
        : `${assetCount} assets`

  return (
    <section className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Net Worth
      </span>
      <h1 className="text-4xl font-bold text-muted-foreground/60">$—.——</h1>
      <span className="text-sm text-muted-foreground/60">+—.——%</span>
      {countLabel && (
        <span className="text-sm text-muted-foreground">{countLabel}</span>
      )}
    </section>
  )
}
