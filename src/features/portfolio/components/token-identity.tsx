import { BadgeCheck } from 'lucide-react'
import { sanitizeDisplayText } from '../format'
import type { PortfolioAsset } from '../types'
import { TokenIcon } from './token-icon'

const SYMBOL_MAX_LENGTH = 20
const NAME_MAX_LENGTH = 60
const NATIVE_ALT_TEXT = 'Solana'
const NATIVE_FALLBACK_LABEL = 'SOL'

function truncatedMintLabel(mint: string): string {
  return `${mint.slice(0, 4)}...${mint.slice(-4)}`
}

type TokenIdentityProps = {
  asset: PortfolioAsset
  verified?: boolean
}

export function TokenIdentity({ asset, verified = false }: TokenIdentityProps) {
  const sanitizedSymbol = sanitizeDisplayText(asset.symbol, {
    maxLength: SYMBOL_MAX_LENGTH,
  })
  const sanitizedName = sanitizeDisplayText(asset.name, {
    maxLength: NAME_MAX_LENGTH,
  })
  // Final fallback when sanitization erases both fields. asset.mint is a
  // normalized base58 Solana address (always at least 32 characters), so
  // the truncated form is non-empty.
  const lastResortLabel =
    asset.kind === 'native'
      ? NATIVE_FALLBACK_LABEL
      : truncatedMintLabel(asset.mint)
  // Cascade so the row always shows readable identity text even when DAS
  // metadata is empty, blank, or composed entirely of stripped characters.
  const displaySymbol =
    sanitizedSymbol ||
    sanitizeDisplayText(asset.name, { maxLength: SYMBOL_MAX_LENGTH }) ||
    lastResortLabel
  const accessibleLabel = sanitizedName || sanitizedSymbol || lastResortLabel

  // The symbol text already announces the token in this layout, so when the
  // would-be alt collapses to the same string the image is decorative.
  // Native SOL keeps an explicit alt because the brand mark is a global
  // identity and tests lock the contract.
  const imageIsPresentational =
    asset.kind !== 'native' && displaySymbol === accessibleLabel
  const imageAlt =
    asset.kind === 'native'
      ? NATIVE_ALT_TEXT
      : imageIsPresentational
        ? ''
        : accessibleLabel

  return (
    <div className="flex items-center gap-2">
      <TokenIcon
        asset={asset}
        alt={imageAlt}
        fallbackLabel={displaySymbol}
        size="sm"
      />
      <span className="flex items-center gap-1 font-sans text-sm font-normal text-foreground">
        {displaySymbol}
        {/* Trust-signal source is deferred. */}
        {verified ? (
          <span
            role="img"
            aria-label="Verified token"
            data-slot="verified-badge"
            className="text-success"
          >
            <BadgeCheck className="size-3.5" />
          </span>
        ) : null}
      </span>
    </div>
  )
}
