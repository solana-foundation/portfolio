import { address } from '@solana/kit'
import { render, screen, within } from '@testing-library/react'
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
  it('renders identity text through TokenIdentity', () => {
    renderRow(BASE_ASSET)
    expect(screen.getByText('USDC')).toBeInTheDocument()
  })

  it('does not retain the old empty verified-badge placeholder', () => {
    const { container } = renderRow(BASE_ASSET)
    const badges = container.querySelectorAll('[data-slot="verified-badge"]')
    expect(badges).toHaveLength(0)
  })

  it('does not render a verified badge by default', () => {
    renderRow(BASE_ASSET)
    expect(screen.queryByLabelText('Verified token')).toBeNull()
  })

  it('renders the formatted token amount with grouping and fractional precision', () => {
    const asset: PortfolioAsset = {
      ...BASE_ASSET,
      // 1234567.891234 — exercises both grouping and fractional truncation.
      rawBalance: 1_234_567_891_234n,
      decimals: 6,
    }
    renderRow(asset)
    const row = screen.getByRole('row')
    // Match digits with any locale grouping/decimal mark; truncated to 4 frac.
    const balanceText = within(row).getByText(/\b1\D?234\D?567\D?8912\b/)
    expect(balanceText).toBeInTheDocument()
  })

  it('renders four cells (Asset, Balance, Price/24h, Value)', () => {
    renderRow(BASE_ASSET)
    expect(screen.getAllByRole('cell')).toHaveLength(4)
  })
})
