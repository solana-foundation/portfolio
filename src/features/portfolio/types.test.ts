import type { Address } from '@solana/kit'
import { describe, expect, it } from 'vitest'
import type { PortfolioAsset, PortfolioAssetList } from '@/features/portfolio'

describe('PortfolioAsset', () => {
  it('can be constructed as a native SOL asset', () => {
    const asset: PortfolioAsset = {
      mint: 'So11111111111111111111111111111111111111112' as Address,
      symbol: 'SOL',
      name: 'Solana',
      imageUrl: 'https://example.com/sol.png',
      rawBalance: 2_500_000_000n,
      decimals: 9,
      kind: 'native',
    }

    expect(asset.mint).toBe('So11111111111111111111111111111111111111112')
    expect(asset.symbol).toBe('SOL')
    expect(asset.name).toBe('Solana')
    expect(asset.imageUrl).toBe('https://example.com/sol.png')
    expect(asset.rawBalance).toBe(2_500_000_000n)
    expect(asset.decimals).toBe(9)
    expect(asset.kind).toBe('native')
  })

  it('can be constructed as an SPL token with an image URL', () => {
    const asset: PortfolioAsset = {
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' as Address,
      symbol: 'USDC',
      name: 'USD Coin',
      imageUrl: 'https://example.com/usdc.png',
      rawBalance: 50_000_000n,
      decimals: 6,
      kind: 'spl-token',
    }

    expect(asset.kind).toBe('spl-token')
    expect(asset.symbol).toBe('USDC')
    expect(asset.decimals).toBe(6)
    expect(asset.imageUrl).toBe('https://example.com/usdc.png')
  })

  it('can be constructed as an SPL token with null imageUrl', () => {
    const asset: PortfolioAsset = {
      mint: '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj' as Address,
      symbol: 'stSOL',
      name: 'Lido Staked SOL',
      imageUrl: null,
      rawBalance: 1_000_000_000n,
      decimals: 9,
      kind: 'spl-token',
    }

    expect(asset.imageUrl).toBeNull()
    expect(asset.kind).toBe('spl-token')
  })

  it('holds bigint rawBalance without precision loss', () => {
    const largeBalance = 999_999_999_999_999_999n
    const asset: PortfolioAsset = {
      mint: 'So11111111111111111111111111111111111111112' as Address,
      symbol: 'SOL',
      name: 'Solana',
      imageUrl: null,
      rawBalance: largeBalance,
      decimals: 9,
      kind: 'native',
    }

    expect(asset.rawBalance).toBe(999_999_999_999_999_999n)
  })
})

describe('PortfolioAssetList', () => {
  it('can be constructed with an empty items array and total 0', () => {
    const list: PortfolioAssetList = {
      items: [],
      total: 0,
    }

    expect(list.items).toEqual([])
    expect(list.total).toBe(0)
  })

  it('can be constructed with multiple assets', () => {
    const sol: PortfolioAsset = {
      mint: 'So11111111111111111111111111111111111111112' as Address,
      symbol: 'SOL',
      name: 'Solana',
      imageUrl: null,
      rawBalance: 1_000_000_000n,
      decimals: 9,
      kind: 'native',
    }

    const usdc: PortfolioAsset = {
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' as Address,
      symbol: 'USDC',
      name: 'USD Coin',
      imageUrl: 'https://example.com/usdc.png',
      rawBalance: 100_000_000n,
      decimals: 6,
      kind: 'spl-token',
    }

    const list: PortfolioAssetList = {
      items: [sol, usdc],
      total: 2,
    }

    expect(list.items).toHaveLength(2)
    expect(list.total).toBe(2)
    expect(list.items[0]?.kind).toBe('native')
    expect(list.items[1]?.kind).toBe('spl-token')
  })
})
