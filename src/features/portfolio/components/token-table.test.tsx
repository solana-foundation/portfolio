import type { Address } from '@solana/kit'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { PortfolioAsset } from '../types'
import { TokenTable } from './token-table'
import { TokenTableSkeleton } from './token-table-skeleton'

function makeAsset(overrides: Partial<PortfolioAsset> = {}): PortfolioAsset {
  return {
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' as Address,
    symbol: 'USDC',
    name: 'USD Coin',
    imageUrl: 'https://example.com/usdc.png',
    rawBalance: 1_000_000n,
    decimals: 6,
    kind: 'spl-token',
    ...overrides,
  }
}

describe('TokenTable', () => {
  it('renders a header row with "Token" and "Balance" column names', () => {
    render(<TokenTable assets={[]} />)
    expect(
      screen.getByRole('columnheader', { name: 'Token' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Balance' }),
    ).toBeInTheDocument()
  })

  it('renders N body rows given N assets', () => {
    const assets = [
      makeAsset({
        mint: 'So11111111111111111111111111111111111111112' as Address,
        symbol: 'SOL',
        name: 'Solana',
      }),
      makeAsset({
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' as Address,
        symbol: 'USDC',
        name: 'USD Coin',
      }),
      makeAsset({
        mint: '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj' as Address,
        symbol: 'STSOL',
        name: 'Lido Staked SOL',
      }),
    ]

    render(<TokenTable assets={assets} />)

    const rowgroups = screen.getAllByRole('rowgroup')
    const bodyRows = within(rowgroups[1] as HTMLElement).getAllByRole('row')
    expect(bodyRows).toHaveLength(3)
  })

  it('renders nothing in tbody when assets is empty', () => {
    render(<TokenTable assets={[]} />)
    // The only row should be the header row
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(1)
  })
})

describe('TokenTableSkeleton', () => {
  it('renders 5 placeholder rows', () => {
    render(<TokenTableSkeleton />)
    const rowgroups = screen.getAllByRole('rowgroup')
    const bodyRows = within(rowgroups[1] as HTMLElement).getAllByRole('row')
    expect(bodyRows).toHaveLength(5)
  })
})
