import { address } from '@solana/kit'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createSplAssetId } from '../asset-identity'
import { SPL_TOKEN_PROGRAM_ID } from '../solana-constants'
import type { SplPortfolioAsset } from '../types'
import { TokenTable } from './token-table'
import { TokenTableSkeleton } from './token-table-skeleton'

function makeAsset(
  overrides: Partial<SplPortfolioAsset> = {},
): SplPortfolioAsset {
  const mint =
    overrides.mint ?? address('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
  return {
    kind: 'spl-token',
    id: createSplAssetId(SPL_TOKEN_PROGRAM_ID, mint),
    mint,
    tokenProgram: SPL_TOKEN_PROGRAM_ID,
    symbol: 'USDC',
    name: 'USD Coin',
    imageUrl: 'https://example.com/usdc.png',
    rawBalance: 1_000_000n,
    decimals: 6,
    ...overrides,
  }
}

const HEADERS = ['Asset', 'Balance', 'Price/24h', 'Value']

describe('TokenTable', () => {
  it('renders four column headers (Asset / Balance / Price/24h / Value)', () => {
    render(<TokenTable assets={[]} />)
    for (const label of HEADERS) {
      expect(
        screen.getByRole('columnheader', { name: new RegExp(label, 'i') }),
      ).toBeInTheDocument()
    }
    const allHeaders = screen.getAllByRole('columnheader')
    expect(allHeaders).toHaveLength(HEADERS.length)
  })

  it('renders a sort-indicator slot inside each column header', () => {
    render(<TokenTable assets={[]} />)
    const headers = screen.getAllByRole('columnheader')
    expect(headers).toHaveLength(HEADERS.length)
    for (const header of headers) {
      const slot = header.querySelector('[data-slot="sort-indicator"]')
      expect(slot).not.toBeNull()
    }
  })

  it('locks the outer container chrome (background, border, rounded-medium, overflow-clip)', () => {
    render(<TokenTable assets={[]} />)
    const outer = document.querySelector('[data-slot="token-table"]')
    expect(outer).not.toBeNull()
    const className = (outer as HTMLElement).className
    expect(className).toContain('bg-background')
    expect(className).toContain('border')
    expect(className).toContain('border-border')
    expect(className).toContain('rounded-medium')
    expect(className).toContain('overflow-clip')
  })

  it('lifts the header row background to bg-card', () => {
    render(<TokenTable assets={[]} />)
    const headerRowGroup = screen.getAllByRole('rowgroup')[0] as HTMLElement
    const headerRow = within(headerRowGroup).getByRole('row')
    expect(headerRow.className).toContain('bg-card')
  })

  it('neutralizes the shadcn TableHead h-10 default on header cells', () => {
    render(<TokenTable assets={[]} />)
    const headers = screen.getAllByRole('columnheader')
    expect(headers).toHaveLength(HEADERS.length)
    for (const header of headers) {
      expect(header.className).toContain('h-auto')
    }
  })

  it('renders N body rows given N assets', () => {
    const assets = [
      makeAsset({
        mint: address('So11111111111111111111111111111111111111112'),
        symbol: 'SOL',
        name: 'Solana',
      }),
      makeAsset({
        mint: address('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        symbol: 'USDC',
        name: 'USD Coin',
      }),
      makeAsset({
        mint: address('7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj'),
        symbol: 'STSOL',
        name: 'Lido Staked SOL',
      }),
    ]

    render(<TokenTable assets={assets} />)

    const rowgroups = screen.getAllByRole('rowgroup')
    const bodyRows = within(rowgroups[1] as HTMLElement).getAllByRole('row')
    expect(bodyRows).toHaveLength(3)
  })

  it('neutralizes shadcn body-row divider and hover background', () => {
    const assets = [
      makeAsset({
        mint: address('So11111111111111111111111111111111111111112'),
        symbol: 'SOL',
        name: 'Solana',
      }),
    ]

    render(<TokenTable assets={assets} />)

    const rowgroups = screen.getAllByRole('rowgroup')
    const bodyRow = within(rowgroups[1] as HTMLElement).getByRole('row')
    const className = bodyRow.className
    expect(className).toContain('border-b-0')
    expect(className).toContain('hover:bg-transparent')
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

  it('renders the four column headers in the skeleton', () => {
    render(<TokenTableSkeleton />)
    for (const label of HEADERS) {
      expect(
        screen.getByRole('columnheader', { name: new RegExp(label, 'i') }),
      ).toBeInTheDocument()
    }
  })

  it('reuses the redesigned outer container chrome', () => {
    render(<TokenTableSkeleton />)
    const outer = document.querySelector('[data-slot="token-table"]')
    expect(outer).not.toBeNull()
    const className = (outer as HTMLElement).className
    expect(className).toContain('bg-background')
    expect(className).toContain('rounded-medium')
    expect(className).toContain('overflow-clip')
  })

  it('neutralizes the shadcn TableHead h-10 default on skeleton header cells', () => {
    render(<TokenTableSkeleton />)
    const headers = screen.getAllByRole('columnheader')
    expect(headers).toHaveLength(HEADERS.length)
    for (const header of headers) {
      expect(header.className).toContain('h-auto')
    }
  })

  it('mirrors the live row icon sizing on skeleton rows (size-4 lg:size-5)', () => {
    render(<TokenTableSkeleton />)
    const skeletons = document.querySelectorAll('[data-slot="skeleton"]')
    const iconSkeleton = Array.from(skeletons).find((node) =>
      node.className.includes('rounded-full'),
    )
    expect(iconSkeleton).toBeDefined()
    const className = (iconSkeleton as HTMLElement).className
    expect(className).toContain('size-4')
    expect(className).toContain('lg:size-5')
  })
})
