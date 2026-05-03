import { address } from '@solana/kit'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createNativeAssetId, createSplAssetId } from '../asset-identity'
import { SPL_TOKEN_PROGRAM_ID } from '../solana-constants'
import type { PortfolioAsset } from '../types'
import { TokenIcon } from './token-icon'

const USDC_MINT = address('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

const splAsset: PortfolioAsset = {
  kind: 'spl-token',
  id: createSplAssetId(SPL_TOKEN_PROGRAM_ID, USDC_MINT),
  mint: USDC_MINT,
  tokenProgram: SPL_TOKEN_PROGRAM_ID,
  symbol: 'USDC',
  name: 'USD Coin',
  imageUrl: 'https://example.com/usdc.png',
  rawBalance: 1n,
  decimals: 6,
}

const nativeAsset: PortfolioAsset = {
  kind: 'native',
  id: createNativeAssetId(),
  symbol: 'SOL',
  name: 'Solana',
  imageUrl: '/native-sol.svg',
  rawBalance: 1n,
  decimals: 9,
}

describe('TokenIcon', () => {
  it('renders <img> with the asset imageUrl when present', () => {
    render(
      <TokenIcon
        asset={splAsset}
        alt="USD Coin"
        fallbackLabel="USDC"
        size="sm"
      />,
    )
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://example.com/usdc.png',
    )
  })

  it('keeps rounded-full on SPL token icons', () => {
    render(
      <TokenIcon
        asset={splAsset}
        alt="USD Coin"
        fallbackLabel="USDC"
        size="sm"
      />,
    )
    expect(screen.getByRole('img').className).toContain('rounded-full')
  })

  it('omits rounded-full for native SOL so the wide brand mark is not corner-clipped', () => {
    render(
      <TokenIcon
        asset={nativeAsset}
        alt="Solana"
        fallbackLabel="SOL"
        size="sm"
      />,
    )
    expect(screen.getByRole('img').className).not.toContain('rounded-full')
  })

  it('applies object-contain so non-square brand marks are not stretched', () => {
    render(
      <TokenIcon
        asset={nativeAsset}
        alt="Solana"
        fallbackLabel="SOL"
        size="sm"
      />,
    )
    expect(screen.getByRole('img').className).toContain('object-contain')
  })

  it('uses the consumer-provided alt text', () => {
    render(
      <TokenIcon
        asset={splAsset}
        alt="My label"
        fallbackLabel="USDC"
        size="sm"
      />,
    )
    expect(screen.getByAltText('My label')).toBeInTheDocument()
  })

  it('marks the image as aria-hidden when alt is the empty string', () => {
    render(<TokenIcon asset={splAsset} alt="" fallbackLabel="USDC" size="sm" />)
    const presentational = screen.getByRole('presentation', { hidden: true })
    expect(presentational.tagName).toBe('IMG')
    expect(presentational).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders the initials fallback (uppercased) when imageUrl is null', () => {
    render(
      <TokenIcon
        asset={{ ...splAsset, imageUrl: null }}
        alt=""
        fallbackLabel="usdc"
        size="sm"
      />,
    )
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('US')).toBeInTheDocument()
  })

  it('falls back to initials when the runtime image fires an error event', () => {
    render(
      <TokenIcon
        asset={splAsset}
        alt="USD Coin"
        fallbackLabel="USDC"
        size="sm"
      />,
    )
    fireEvent.error(screen.getByRole('img'))
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('US')).toBeInTheDocument()
  })

  it('resets the error state when imageUrl changes to a new source', () => {
    const { rerender } = render(
      <TokenIcon
        asset={splAsset}
        alt="USD Coin"
        fallbackLabel="USDC"
        size="sm"
      />,
    )
    fireEvent.error(screen.getByRole('img'))
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    rerender(
      <TokenIcon
        asset={{ ...splAsset, imageUrl: 'https://example.com/v2.png' }}
        alt="USD Coin"
        fallbackLabel="USDC"
        size="sm"
      />,
    )
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://example.com/v2.png',
    )
  })

  it('size="sm" renders at size-4 with lg:size-5', () => {
    render(
      <TokenIcon
        asset={splAsset}
        alt="USD Coin"
        fallbackLabel="USDC"
        size="sm"
      />,
    )
    const cls = screen.getByRole('img').className
    expect(cls).toContain('size-4')
    expect(cls).toContain('lg:size-5')
  })

  it('size="md" renders at size-8', () => {
    render(
      <TokenIcon
        asset={splAsset}
        alt="USD Coin"
        fallbackLabel="USDC"
        size="md"
      />,
    )
    expect(screen.getByRole('img').className).toContain('size-8')
  })

  it('uses grapheme-aware truncation for the initials fallback', () => {
    render(
      <TokenIcon
        asset={{ ...splAsset, imageUrl: null }}
        alt=""
        fallbackLabel="🚀tkn"
        size="sm"
      />,
    )
    expect(screen.getByText('🚀T')).toBeInTheDocument()
  })
})
