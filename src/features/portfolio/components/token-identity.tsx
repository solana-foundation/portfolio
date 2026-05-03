import { BadgeCheck } from 'lucide-react'
import { useState } from 'react'
import { firstGraphemes, sanitizeDisplayText } from '../format'
import type { PortfolioAsset } from '../types'

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
  const [loadErrored, setLoadErrored] = useState(false)
  // Reset the runtime image-error state when the source URL changes — this
  // component is reusable, and a refetch can swap imageUrl on the same row.
  const [prevImageUrl, setPrevImageUrl] = useState(asset.imageUrl)
  if (prevImageUrl !== asset.imageUrl) {
    setPrevImageUrl(asset.imageUrl)
    setLoadErrored(false)
  }

  const displayImage = loadErrored ? null : asset.imageUrl

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
      {displayImage !== null ? (
        <img
          src={displayImage}
          alt={imageAlt}
          aria-hidden={imageIsPresentational || undefined}
          onError={() => setLoadErrored(true)}
          className="size-4 overflow-hidden rounded-full object-contain lg:size-5"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex size-4 items-center justify-center overflow-hidden rounded-full bg-muted text-[12px] font-light text-muted-foreground lg:size-5"
        >
          {firstGraphemes(displaySymbol, 2).toUpperCase()}
        </div>
      )}
      <span className="flex items-center gap-1 font-sans text-sm font-normal text-foreground">
        {displaySymbol}
        {/* Trust-signal source is deferred. */}
        {verified ? (
          <span
            role="img"
            aria-label="Verified token"
            data-slot="verified-badge"
            className="text-primary"
          >
            <BadgeCheck className="size-3.5" />
          </span>
        ) : null}
      </span>
    </div>
  )
}
