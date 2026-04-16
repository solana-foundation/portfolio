import type { Address } from '@solana/kit'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { PortfolioAsset } from '../types'
import { TokenRow } from './token-row'

const BASE_ASSET: PortfolioAsset = {
  mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' as Address,
  symbol: 'USDC',
  name: 'USD Coin',
  imageUrl: 'https://example.com/usdc.png',
  rawBalance: 1_500_000n,
  decimals: 6,
  kind: 'spl-token',
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

  it('renders the name as secondary text', () => {
    renderRow(BASE_ASSET)
    expect(screen.getByText('USD Coin')).toBeInTheDocument()
  })

  it('renders the icon image when imageUrl is non-null', () => {
    renderRow(BASE_ASSET)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'https://example.com/usdc.png')
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
})
