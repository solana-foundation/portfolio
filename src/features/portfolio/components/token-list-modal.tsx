import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatBalance } from '../format'
import type { PortfolioAsset } from '../types'

type TokenListModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  countLabel?: string
  items: PortfolioAsset[]
}

export function TokenListModal({
  open,
  onOpenChange,
  title = 'All your tokens',
  countLabel,
  items,
}: TokenListModalProps) {
  const subtitle = countLabel ?? `${items.length} detected`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="font-numeric text-xs">
            {subtitle}
          </DialogDescription>
        </DialogHeader>
        <ul className="flex w-full flex-col gap-3">
          {items.map((asset) => (
            <li key={asset.id}>
              <TokenListModalRow asset={asset} />
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}

function TokenListModalRow({ asset }: { asset: PortfolioAsset }) {
  return (
    <div className="flex h-[38px] w-full items-center gap-3.5">
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        {asset.imageUrl !== null ? (
          <img
            src={asset.imageUrl}
            alt={`${asset.name} icon`}
            className="size-8 shrink-0 rounded-full"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
          >
            {asset.symbol.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-px">
          <span className="truncate text-sm font-semibold text-foreground">
            {asset.name}
          </span>
          <span className="truncate text-xs font-light text-muted-foreground">
            {asset.symbol}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-end gap-px">
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {formatBalance(asset.rawBalance, asset.decimals)}
        </span>
        {/* USD value slot — wired when token-pricing work lands */}
        <span
          data-slot="usd-value"
          className="text-xs font-light tabular-nums text-muted-foreground"
        />
      </div>
    </div>
  )
}
