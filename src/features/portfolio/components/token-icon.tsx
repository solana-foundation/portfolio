import { useState } from 'react'
import { cn } from '@/lib/utils'
import { firstGraphemes } from '../format'
import type { PortfolioAsset } from '../types'

type TokenIconSize = 'sm' | 'md'

type TokenIconProps = {
  asset: PortfolioAsset
  alt: string
  fallbackLabel: string
  size: TokenIconSize
}

const SIZE_CLASSES: Record<TokenIconSize, string> = {
  sm: 'size-4 lg:size-5',
  md: 'size-8',
}

// Square pixel dimensions of the layout box at the smallest variant width.
// Browsers reserve aspect-ratio space from these attributes before CSS loads;
// CSS overrides the actual rendered size at lg breakpoints.
const SIZE_PIXELS: Record<TokenIconSize, number> = {
  sm: 16,
  md: 32,
}

const FALLBACK_TEXT_CLASSES: Record<TokenIconSize, string> = {
  sm: 'text-[12px] font-light',
  md: 'text-xs font-medium',
}

export function TokenIcon({ asset, alt, fallbackLabel, size }: TokenIconProps) {
  const [loadErrored, setLoadErrored] = useState(false)
  // Reset the runtime image-error state when the source URL changes — this
  // component is reusable, and a refetch can swap imageUrl on the same row.
  const [prevImageUrl, setPrevImageUrl] = useState(asset.imageUrl)
  if (prevImageUrl !== asset.imageUrl) {
    setPrevImageUrl(asset.imageUrl)
    setLoadErrored(false)
  }

  const displayImage = loadErrored ? null : asset.imageUrl
  const sizeClasses = SIZE_CLASSES[size]
  const sizePx = SIZE_PIXELS[size]

  if (displayImage !== null) {
    return (
      <img
        src={displayImage}
        alt={alt}
        aria-hidden={alt === '' || undefined}
        width={sizePx}
        height={sizePx}
        loading="lazy"
        decoding="async"
        onError={() => setLoadErrored(true)}
        className={cn(
          sizeClasses,
          'shrink-0 overflow-hidden object-contain',
          // The bundled SOL brand mark is rectangular; rounded-full would
          // clip its full-width gradient bars. SPL token icons keep the
          // circular row treatment.
          asset.kind !== 'native' && 'rounded-full',
        )}
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        sizeClasses,
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground',
        FALLBACK_TEXT_CLASSES[size],
      )}
    >
      {firstGraphemes(fallbackLabel, 2).toUpperCase()}
    </div>
  )
}
