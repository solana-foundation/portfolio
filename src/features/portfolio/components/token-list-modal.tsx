import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatTokenAmount, sanitizeDisplayText } from '../format'
import type { PortfolioAsset } from '../types'
import { TokenIcon } from './token-icon'

const NATIVE_ALT_TEXT = 'Solana'
// Match the display caps applied by TokenIdentity so the same impersonator
// never widens its surface in the modal context.
const SYMBOL_MAX_LENGTH = 20
const NAME_MAX_LENGTH = 60
const NATIVE_FALLBACK_LABEL = 'SOL'

function truncatedMintLabel(mint: string): string {
  return `${mint.slice(0, 4)}...${mint.slice(-4)}`
}

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
  // The modal stacks name and symbol next to the icon, so non-native rows
  // already announce their identity in text and the image is decorative.
  // Native SOL keeps an explicit alt because the brand mark is a global
  // identity worth naming for screen readers.
  const imageAlt = asset.kind === 'native' ? NATIVE_ALT_TEXT : ''
  const sanitizedName = sanitizeDisplayText(asset.name, {
    maxLength: NAME_MAX_LENGTH,
  })
  const sanitizedSymbol = sanitizeDisplayText(asset.symbol, {
    maxLength: SYMBOL_MAX_LENGTH,
  })
  // Mirror TokenIdentity's last-resort cascade so an impersonator whose name
  // and symbol sanitize to empty still gets readable text on both lines
  // instead of a blank row.
  const lastResortLabel =
    asset.kind === 'native'
      ? NATIVE_FALLBACK_LABEL
      : truncatedMintLabel(asset.mint)
  const displaySymbol =
    sanitizedSymbol ||
    sanitizeDisplayText(asset.name, { maxLength: SYMBOL_MAX_LENGTH }) ||
    lastResortLabel
  const displayName = sanitizedName || sanitizedSymbol || lastResortLabel

  return (
    <div className="flex h-[38px] w-full items-center gap-3.5">
      <div className="flex min-w-0 flex-1 items-center gap-3.5">
        <TokenIcon
          asset={asset}
          alt={imageAlt}
          fallbackLabel={displaySymbol}
          size="md"
        />
        <div className="flex min-w-0 flex-col gap-px">
          <span className="truncate text-sm font-semibold text-foreground">
            {displayName}
          </span>
          <span className="truncate text-xs font-light text-muted-foreground">
            {displaySymbol}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-end gap-px">
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {formatTokenAmount(asset.rawBalance, asset.decimals)}
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
