import { address } from '@solana/kit'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createSplAssetId } from '../asset-identity'
import { SPL_TOKEN_PROGRAM_ID } from '../solana-constants'
import type { PortfolioAsset } from '../types'
import { TokenRow } from './token-row'

const USDC_MINT = address('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

const BASE_ASSET: PortfolioAsset = {
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

function renderRow(asset: PortfolioAsset) {
  return render(
    <table>
      <tbody>
        <TokenRow asset={asset} />
      </tbody>
    </table>,
  )
}

describe('TokenRow', () => {
  it('renders the symbol as primary text', () => {
    renderRow(BASE_ASSET)
    expect(screen.getByText('USDC')).toBeInTheDocument()
  })

  it('does not render the asset name in the row', () => {
    renderRow(BASE_ASSET)
    expect(screen.queryByText('USD Coin')).not.toBeInTheDocument()
  })

  it('renders the icon image at responsive sizes when imageUrl is non-null', () => {
    renderRow(BASE_ASSET)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/usdc.png')
    expect(img.className).toContain('size-4')
    expect(img.className).toContain('lg:size-5')
  })

  it('renders a text fallback when imageUrl is null', () => {
    renderRow({ ...BASE_ASSET, imageUrl: null })
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('US')).toBeInTheDocument()
  })

  it('renders the formatted balance', () => {
    renderRow(BASE_ASSET)
    // 1_500_000 / 10^6 = 1.5
    expect(screen.getByText('1.5')).toBeInTheDocument()
  })

  it('reserves a verified-badge slot inside the asset cell', () => {
    const { container } = renderRow(BASE_ASSET)
    const slot = container.querySelector('[data-slot="verified-badge"]')
    expect(slot).not.toBeNull()
    expect(slot?.children).toHaveLength(0)
  })

  it('renders four cells (Asset, Balance, Price/24h, Value)', () => {
    renderRow(BASE_ASSET)
    const cells = screen.getAllByRole('cell')
    expect(cells).toHaveLength(4)
  })

  it('leaves the Price/24h and Value cells empty', () => {
    renderRow(BASE_ASSET)
    const cells = screen.getAllByRole('cell')
    expect(cells[2]?.textContent).toBe('')
    expect(cells[3]?.textContent).toBe('')
  })

  it('applies the row padding spec to the TableRow', () => {
    renderRow(BASE_ASSET)
    const row = screen.getByRole('row')
    expect(row.className).toContain('px-5')
    expect(row.className).toContain('py-4')
  })

  it('renders the balance cell with numeric typography and tabular-nums', () => {
    renderRow(BASE_ASSET)
    const balanceCell = screen.getByText('1.5').closest('td')
    expect(balanceCell?.className).toContain('font-numeric')
    expect(balanceCell?.className).toContain('tabular-nums')
  })
})
