import { type Address, address } from '@solana/kit'
import { describe, expect, expectTypeOf, it } from 'vitest'
import {
  createNativeAssetId,
  createSplAssetId,
} from '@/features/portfolio/asset-identity'
import { SPL_TOKEN_PROGRAM_ID } from '@/features/portfolio/solana-constants'
import type {
  NativePortfolioAsset,
  PortfolioAsset,
  PortfolioAssetList,
  SplPortfolioAsset,
} from '@/features/portfolio/types'

const USDC_MINT: Address = address(
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
)

describe('NativePortfolioAsset', () => {
  it('constructs without a mint and exposes the shared base fields', () => {
    const asset: NativePortfolioAsset = {
      kind: 'native',
      id: createNativeAssetId(),
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9,
      rawBalance: 2_500_000_000n,
      imageUrl: null,
    }

    expect(asset.kind).toBe('native')
    expect(asset.id).toBe('native:SOL')
    expect(asset.symbol).toBe('SOL')
    expect(asset.name).toBe('Solana')
    expect(asset.decimals).toBe(9)
    expect(asset.rawBalance).toBe(2_500_000_000n)
    expect(asset.imageUrl).toBeNull()
    expect('mint' in asset).toBe(false)
    expect('tokenProgram' in asset).toBe(false)
  })
})

describe('SplPortfolioAsset', () => {
  it('constructs with mint and tokenProgram alongside the base fields', () => {
    const asset: SplPortfolioAsset = {
      kind: 'spl-token',
      id: createSplAssetId(SPL_TOKEN_PROGRAM_ID, USDC_MINT),
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      rawBalance: 50_000_000n,
      imageUrl: 'https://example.com/usdc.png',
      mint: USDC_MINT,
      tokenProgram: SPL_TOKEN_PROGRAM_ID,
    }

    expect(asset.kind).toBe('spl-token')
    expect(asset.mint).toBe(USDC_MINT)
    expect(asset.tokenProgram).toBe(SPL_TOKEN_PROGRAM_ID)
    expect(asset.id).toBe(
      `spl-token:${SPL_TOKEN_PROGRAM_ID}:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`,
    )
  })

  it('accepts null imageUrl', () => {
    const asset: SplPortfolioAsset = {
      kind: 'spl-token',
      id: createSplAssetId(SPL_TOKEN_PROGRAM_ID, USDC_MINT),
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      rawBalance: 50_000_000n,
      imageUrl: null,
      mint: USDC_MINT,
      tokenProgram: SPL_TOKEN_PROGRAM_ID,
    }

    expect(asset.imageUrl).toBeNull()
  })
})

describe('PortfolioAsset (union)', () => {
  it('narrows mint to Address inside the spl-token branch', () => {
    expectTypeOf<PortfolioAsset>().toMatchTypeOf<{
      kind: 'native' | 'spl-token'
    }>()

    function _readSplMint(asset: PortfolioAsset): Address | null {
      if (asset.kind !== 'spl-token') return null
      expectTypeOf(asset.mint).toEqualTypeOf<Address>()
      expectTypeOf(asset.tokenProgram).toEqualTypeOf<
        SplPortfolioAsset['tokenProgram']
      >()
      return asset.mint
    }
    expect(_readSplMint).toBeTypeOf('function')
  })

  it('preserves bigint rawBalance without precision loss', () => {
    const largeBalance = 999_999_999_999_999_999n
    const asset: PortfolioAsset = {
      kind: 'native',
      id: createNativeAssetId(),
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9,
      rawBalance: largeBalance,
      imageUrl: null,
    }

    expect(asset.rawBalance).toBe(999_999_999_999_999_999n)
  })
})

function _typeOnlyChecksForNativeBranch(native: NativePortfolioAsset) {
  // @ts-expect-error - mint is `?: never` on the native branch
  native.mint = USDC_MINT
  // @ts-expect-error - tokenProgram is `?: never` on the native branch
  native.tokenProgram = SPL_TOKEN_PROGRAM_ID
}

describe('PortfolioAssetList', () => {
  it('can be constructed with an empty items array and total 0', () => {
    const list: PortfolioAssetList = { items: [], total: 0 }

    expect(list.items).toEqual([])
    expect(list.total).toBe(0)
  })

  it('can be constructed with mixed native and spl-token items', () => {
    const sol: NativePortfolioAsset = {
      kind: 'native',
      id: createNativeAssetId(),
      symbol: 'SOL',
      name: 'Solana',
      decimals: 9,
      rawBalance: 1_000_000_000n,
      imageUrl: null,
    }

    const usdc: SplPortfolioAsset = {
      kind: 'spl-token',
      id: createSplAssetId(SPL_TOKEN_PROGRAM_ID, USDC_MINT),
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      rawBalance: 100_000_000n,
      imageUrl: 'https://example.com/usdc.png',
      mint: USDC_MINT,
      tokenProgram: SPL_TOKEN_PROGRAM_ID,
    }

    const list: PortfolioAssetList = { items: [sol, usdc], total: 2 }

    expect(list.items).toHaveLength(2)
    expect(list.total).toBe(2)
    expect(list.items[0]?.kind).toBe('native')
    expect(list.items[1]?.kind).toBe('spl-token')
  })
})
