import { address } from '@solana/kit'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  fungibleTokenBidiName,
  fungibleTokenLongName,
} from '../__fixtures__/das-get-assets-by-owner'
import { createSplAssetId } from '../asset-identity'
import type { DasAssetList } from '../das-types'
import { normalizeDasResponse } from '../normalize'
import { SPL_TOKEN_PROGRAM_ID } from '../solana-constants'
import type { PortfolioAsset } from '../types'
import { TokenIdentity } from './token-identity'

function normalizeSingle(rawItem: unknown): PortfolioAsset {
  const list = {
    items: [rawItem],
    total: 1,
    limit: 1000,
    page: 1,
  } as DasAssetList
  const result = normalizeDasResponse(list)
  const asset = result.items[0]
  if (!asset) throw new Error('Fixture failed to normalize')
  return asset
}

const USDC_MINT = address('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

const usdcAsset: PortfolioAsset = {
  kind: 'spl-token',
  id: createSplAssetId(SPL_TOKEN_PROGRAM_ID, USDC_MINT),
  mint: USDC_MINT,
  tokenProgram: SPL_TOKEN_PROGRAM_ID,
  symbol: 'USDC',
  name: 'USD Coin',
  imageUrl: 'https://example.com/usdc.png',
  rawBalance: 1_500_000n,
  decimals: 6,
}

const RTL_OVERRIDE = '\u202E'

describe('TokenIdentity', () => {
  it('renders an <img> with the resolved imageUrl when the asset has one', () => {
    render(<TokenIdentity asset={usdcAsset} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/usdc.png')
  })

  it('renders the initials fallback (two-character uppercase symbol) when imageUrl is null', () => {
    render(<TokenIdentity asset={{ ...usdcAsset, imageUrl: null }} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('US')).toBeInTheDocument()
  })

  it('falls back to initials when the <img> fires an error event at runtime', () => {
    render(<TokenIdentity asset={usdcAsset} />)
    const img = screen.getByRole('img')
    fireEvent.error(img)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('US')).toBeInTheDocument()
  })

  it('resets the error state when imageUrl changes to a new source', () => {
    const { rerender } = render(<TokenIdentity asset={usdcAsset} />)
    fireEvent.error(screen.getByRole('img'))
    expect(screen.queryByRole('img')).not.toBeInTheDocument()

    const swappedAsset = {
      ...usdcAsset,
      imageUrl: 'https://example.com/v2.png',
    }
    rerender(<TokenIdentity asset={swappedAsset} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/v2.png')
  })

  it('renders the symbol as the only visible identity text (no name line)', () => {
    render(<TokenIdentity asset={usdcAsset} />)
    expect(screen.getByText('USDC')).toBeInTheDocument()
    expect(screen.queryByText('USD Coin')).not.toBeInTheDocument()
  })

  it('sanitizes the rendered symbol', () => {
    const bidiSymbolAsset: PortfolioAsset = {
      ...usdcAsset,
      symbol: `B${RTL_OVERRIDE}IDI`,
      name: 'BidiSymbol Token',
    }
    render(<TokenIdentity asset={bidiSymbolAsset} />)
    expect(screen.getByText('BIDI')).toBeInTheDocument()
    expect(document.body.textContent ?? '').not.toContain(RTL_OVERRIDE)
  })

  it('sanitizes the alt text on the image', () => {
    const bidiNameAsset: PortfolioAsset = {
      ...usdcAsset,
      name: `Safe${RTL_OVERRIDE}BidiToken`,
    }
    render(<TokenIdentity asset={bidiNameAsset} />)
    expect(screen.getByAltText('SafeBidiToken')).toBeInTheDocument()
  })

  it('passes the bidi-name fixture through normalize cleanly into alt text', () => {
    // Integration check against the canonical bidi-name DAS fixture: the
    // override must not survive normalization → render.
    const asset = normalizeSingle(fungibleTokenBidiName)
    const renderedAsset: PortfolioAsset = {
      ...asset,
      imageUrl: 'https://example.com/bidi.png',
    }
    render(<TokenIdentity asset={renderedAsset} />)
    expect(document.body.textContent ?? '').not.toContain(RTL_OVERRIDE)
    const img = screen.getByRole('img')
    expect(img.getAttribute('alt')).not.toContain(RTL_OVERRIDE)
  })

  it('caps the visible symbol at the display max-length with a trailing ellipsis', () => {
    const longSymbolAsset: PortfolioAsset = {
      ...usdcAsset,
      symbol: 'A'.repeat(30),
      name: 'Long Symbol Token',
    }
    render(<TokenIdentity asset={longSymbolAsset} />)
    const symbolEl = screen.getByText(/^A+…$/)
    expect(symbolEl.textContent?.length).toBeLessThanOrEqual(20)
  })

  it('caps the alt text at the name display cap with a trailing ellipsis', () => {
    const asset = normalizeSingle(fungibleTokenLongName)
    const renderedAsset: PortfolioAsset = {
      ...asset,
      imageUrl: 'https://example.com/long.png',
    }
    render(<TokenIdentity asset={renderedAsset} />)
    const img = screen.getByRole('img')
    const alt = img.getAttribute('alt') ?? ''
    expect(alt.length).toBeLessThanOrEqual(60)
    expect(alt).toMatch(/…$/)
  })

  it('uses the sanitized name as alt text when imageUrl is present', () => {
    render(<TokenIdentity asset={usdcAsset} />)
    expect(screen.getByAltText('USD Coin')).toBeInTheDocument()
  })

  it('always uses "Solana" as alt text for native SOL, regardless of asset.name', () => {
    const nativeAsset: PortfolioAsset = {
      kind: 'native',
      id: 'native:SOL',
      symbol: 'SOL',
      // Deliberately not 'Solana' to lock the contract to the component, not
      // the normalizer convention.
      name: 'Native SOL Token',
      imageUrl: '/native-sol.svg',
      rawBalance: 2_500_000_000n,
      decimals: 9,
    }
    render(<TokenIdentity asset={nativeAsset} />)
    expect(screen.getByAltText('Solana')).toBeInTheDocument()
  })

  it('hides the image presentationally when name === symbol (collapse case)', () => {
    const truncated = 'DezX...B263'
    const collapsedAsset: PortfolioAsset = {
      ...usdcAsset,
      symbol: truncated,
      name: truncated,
    }
    render(<TokenIdentity asset={collapsedAsset} />)
    // alt="" makes <img> presentationally hidden — RTL exposes it via
    // role 'presentation' (or 'none'), not 'img'.
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    const presentational = screen.getByRole('presentation', { hidden: true })
    expect(presentational.tagName).toBe('IMG')
    expect(presentational).toHaveAttribute('alt', '')
    expect(presentational).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders no verified badge in the DOM when verified is omitted or false', () => {
    const { container, rerender } = render(<TokenIdentity asset={usdcAsset} />)
    expect(screen.queryByLabelText('Verified token')).toBeNull()
    expect(container.querySelector('[data-slot="verified-badge"]')).toBeNull()

    rerender(<TokenIdentity asset={usdcAsset} verified={false} />)
    expect(screen.queryByLabelText('Verified token')).toBeNull()
    expect(container.querySelector('[data-slot="verified-badge"]')).toBeNull()
  })

  it('renders the verified badge slot when verified is true', () => {
    render(<TokenIdentity asset={usdcAsset} verified={true} />)
    const badge = screen.getByLabelText('Verified token')
    expect(badge).toHaveAttribute('data-slot', 'verified-badge')
  })

  it('falls back to the name in the symbol slot when the symbol is empty', () => {
    const emptySymbolAsset: PortfolioAsset = { ...usdcAsset, symbol: '' }
    render(<TokenIdentity asset={emptySymbolAsset} />)
    expect(screen.getByText('USD Coin')).toBeInTheDocument()
  })

  it('falls back to the name when the symbol is composed entirely of stripped characters', () => {
    const bidiOnlySymbolAsset: PortfolioAsset = {
      ...usdcAsset,
      symbol: RTL_OVERRIDE,
    }
    render(<TokenIdentity asset={bidiOnlySymbolAsset} />)
    expect(screen.getByText('USD Coin')).toBeInTheDocument()
    expect(document.body.textContent ?? '').not.toContain(RTL_OVERRIDE)
  })

  it('falls back to the name for the initials block when symbol is empty and imageUrl is null', () => {
    const emptySymbolNoImage: PortfolioAsset = {
      ...usdcAsset,
      symbol: '',
      imageUrl: null,
    }
    render(<TokenIdentity asset={emptySymbolNoImage} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('US')).toBeInTheDocument()
  })

  it('falls back to the truncated mint when both symbol and name sanitize to empty', () => {
    const erasedAsset: PortfolioAsset = {
      ...usdcAsset,
      symbol: RTL_OVERRIDE,
      name: RTL_OVERRIDE,
    }
    render(<TokenIdentity asset={erasedAsset} />)
    expect(screen.getByText('EPjF...Dt1v')).toBeInTheDocument()
  })

  it('falls back to "SOL" for native when both symbol and name sanitize to empty', () => {
    const erasedNative: PortfolioAsset = {
      kind: 'native',
      id: 'native:SOL',
      symbol: '',
      name: '',
      imageUrl: null,
      rawBalance: 1n,
      decimals: 9,
    }
    render(<TokenIdentity asset={erasedNative} />)
    expect(screen.getByText('SOL')).toBeInTheDocument()
  })

  it('applies object-contain so non-square brand marks are not stretched', () => {
    render(<TokenIdentity asset={usdcAsset} />)
    expect(screen.getByRole('img').className).toContain('object-contain')
  })

  it('keeps rounded-full on SPL token icons so DAS-served circular logos fill the box', () => {
    render(<TokenIdentity asset={usdcAsset} />)
    expect(screen.getByRole('img').className).toContain('rounded-full')
  })

  it('omits rounded-full for native SOL so the wide brand mark is not corner-clipped', () => {
    const nativeAsset: PortfolioAsset = {
      kind: 'native',
      id: 'native:SOL',
      symbol: 'SOL',
      name: 'Solana',
      imageUrl: '/native-sol.svg',
      rawBalance: 1n,
      decimals: 9,
    }
    render(<TokenIdentity asset={nativeAsset} />)
    expect(screen.getByRole('img').className).not.toContain('rounded-full')
  })

  it('uses grapheme-aware truncation for the initials fallback', () => {
    const emojiAsset: PortfolioAsset = {
      ...usdcAsset,
      symbol: '🚀tkn',
      imageUrl: null,
    }
    render(<TokenIdentity asset={emojiAsset} />)
    // '🚀' is one grapheme that spans two UTF-16 code units; firstGraphemes
    // returns the rocket plus 't', then toUpperCase uppercases the latin
    // letter.
    expect(screen.getByText('🚀T')).toBeInTheDocument()
  })
})
