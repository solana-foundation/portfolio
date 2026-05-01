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
})
