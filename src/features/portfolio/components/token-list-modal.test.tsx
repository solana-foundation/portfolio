import { address } from '@solana/kit'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createNativeAssetId, createSplAssetId } from '../asset-identity'
import { SPL_TOKEN_PROGRAM_ID } from '../solana-constants'
import type { PortfolioAsset } from '../types'
import { TokenListModal } from './token-list-modal'

const USDC_MINT = address('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

const SOL: PortfolioAsset = {
  kind: 'native',
  id: createNativeAssetId(),
  symbol: 'SOL',
  name: 'Solana',
  imageUrl: 'https://example.com/sol.png',
  rawBalance: 2_000_000_000n,
  decimals: 9,
}

const USDC: PortfolioAsset = {
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

describe('TokenListModal', () => {
  it('renders nothing when closed', () => {
    render(
      <TokenListModal open={false} onOpenChange={() => {}} items={[SOL]} />,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the default title and a derived count subtitle when open', () => {
    render(<TokenListModal open onOpenChange={() => {}} items={[SOL, USDC]} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'All your tokens' }),
    ).toBeInTheDocument()
    expect(screen.getByText('2 detected')).toBeInTheDocument()
  })

  it('renders one row per item with name and symbol visible', () => {
    render(<TokenListModal open onOpenChange={() => {}} items={[SOL, USDC]} />)
    const rows = screen.getAllByRole('listitem')
    expect(rows).toHaveLength(2)
    expect(within(rows[0]!).getByText('Solana')).toBeInTheDocument()
    expect(within(rows[0]!).getByText('SOL')).toBeInTheDocument()
    expect(within(rows[1]!).getByText('USD Coin')).toBeInTheDocument()
    expect(within(rows[1]!).getByText('USDC')).toBeInTheDocument()
  })

  it('renders the formatted balance on each row', () => {
    render(<TokenListModal open onOpenChange={() => {}} items={[SOL, USDC]} />)
    const rows = screen.getAllByRole('listitem')
    // SOL: 2_000_000_000n / 10^9 = "2"
    expect(within(rows[0]!).getByText('2')).toBeInTheDocument()
    // USDC: 1_500_000n / 10^6 = "1.5"
    expect(within(rows[1]!).getByText('1.5')).toBeInTheDocument()
  })

  it('reserves a present-but-empty USD slot in each row right cluster', () => {
    render(<TokenListModal open onOpenChange={() => {}} items={[SOL, USDC]} />)
    const rows = screen.getAllByRole('listitem')
    for (const row of rows) {
      const slot = row.querySelector('[data-slot="usd-value"]')
      expect(slot).not.toBeNull()
      expect((slot as HTMLElement).textContent).toBe('')
    }
  })

  it('omits rounded-full on the native SOL icon so the bundled brand mark is not corner-clipped', () => {
    render(<TokenListModal open onOpenChange={() => {}} items={[SOL]} />)
    const row = screen.getAllByRole('listitem')[0]!
    const img = row.querySelector('img')
    expect(img).not.toBeNull()
    expect(img?.className).not.toContain('rounded-full')
  })

  it('uses an explicit "Solana" alt on the native SOL icon', () => {
    render(<TokenListModal open onOpenChange={() => {}} items={[SOL]} />)
    expect(screen.getByAltText('Solana')).toBeInTheDocument()
  })

  it('keeps rounded-full on SPL token icons', () => {
    render(<TokenListModal open onOpenChange={() => {}} items={[USDC]} />)
    const row = screen.getAllByRole('listitem')[0]!
    const img = row.querySelector('img')
    expect(img).not.toBeNull()
    expect(img?.className).toContain('rounded-full')
  })

  it('renders SPL token icons as presentational since name and symbol are both visible nearby', () => {
    render(<TokenListModal open onOpenChange={() => {}} items={[USDC]} />)
    const row = screen.getAllByRole('listitem')[0]!
    const img = row.querySelector('img')
    expect(img?.getAttribute('alt')).toBe('')
    expect(img?.getAttribute('aria-hidden')).toBe('true')
  })

  it('strips bidi-override characters from the rendered name', () => {
    const RTL = '\u202E'
    const bidiNameAsset: PortfolioAsset = {
      ...USDC,
      name: `Safe${RTL}BidiToken`,
    }
    render(
      <TokenListModal open onOpenChange={() => {}} items={[bidiNameAsset]} />,
    )
    expect(document.body.textContent ?? '').not.toContain(RTL)
    expect(screen.getByText('SafeBidiToken')).toBeInTheDocument()
  })

  it('strips bidi-override characters from the rendered symbol', () => {
    const RTL = '\u202E'
    const bidiSymbolAsset: PortfolioAsset = {
      ...USDC,
      symbol: `B${RTL}IDI`,
    }
    render(
      <TokenListModal open onOpenChange={() => {}} items={[bidiSymbolAsset]} />,
    )
    expect(document.body.textContent ?? '').not.toContain(RTL)
    expect(screen.getByText('BIDI')).toBeInTheDocument()
  })

  it('renders the balance with locale grouping for large amounts', () => {
    const largeAsset: PortfolioAsset = {
      ...USDC,
      // 1,234,567 USDC -> 1234567_000_000 raw at 6 decimals.
      rawBalance: 1_234_567_000_000n,
    }
    render(<TokenListModal open onOpenChange={() => {}} items={[largeAsset]} />)
    const row = screen.getAllByRole('listitem')[0]!
    // Match digits with any locale grouping mark; locks the use of
    // formatTokenAmount over formatBalance (the latter would render
    // "1234567" with no grouping mark).
    expect(within(row).getByText(/1\D234\D567/)).toBeInTheDocument()
  })

  it('falls back to the truncated mint when both name and symbol sanitize to empty', () => {
    const RTL = '\u202E'
    const erasedSpl: PortfolioAsset = {
      ...USDC,
      symbol: RTL,
      name: RTL,
    }
    render(<TokenListModal open onOpenChange={() => {}} items={[erasedSpl]} />)
    const row = screen.getAllByRole('listitem')[0]!
    // Truncated form of EPjFWdd5...EGGkZwyTDt1v.
    expect(within(row).getAllByText('EPjF...Dt1v').length).toBeGreaterThan(0)
    expect(document.body.textContent ?? '').not.toContain(RTL)
  })

  it('falls back to "SOL" for native when both name and symbol sanitize to empty', () => {
    const RTL = '\u202E'
    const erasedNative: PortfolioAsset = {
      ...SOL,
      symbol: RTL,
      name: RTL,
    }
    render(
      <TokenListModal open onOpenChange={() => {}} items={[erasedNative]} />,
    )
    const row = screen.getAllByRole('listitem')[0]!
    expect(within(row).getAllByText('SOL').length).toBeGreaterThan(0)
    expect(document.body.textContent ?? '').not.toContain(RTL)
  })
})
