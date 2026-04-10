import { describe, expect, it, vi } from 'vitest'
import {
  dasEmptyResponse,
  dasGetAssetsByOwnerResponse,
  dasZeroNativeBalanceResponse,
  emptyMetadataItem,
  fungibleAssetItem,
  fungibleTokenItem,
  nativeBalanceFixture,
  unknownTokenItem,
} from '@/features/portfolio/__fixtures__/das-get-assets-by-owner'
import type { DasAsset, DasAssetList } from '@/features/portfolio/das-types'
import { normalizeDasResponse } from '@/features/portfolio/normalize'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SOL_MINT = 'So11111111111111111111111111111111111111112'

/** Build a minimal DasAssetList for edge-case tests. */
function makeResponse(
  items: DasAsset[],
  overrides?: Partial<DasAssetList>,
): DasAssetList {
  return {
    total: items.length,
    limit: 1000,
    page: 1,
    items,
    ...overrides,
  }
}

/** Build a minimal FungibleToken DasAsset. */
function makeToken(overrides: Partial<DasAsset> & { id: string }): DasAsset {
  return {
    interface: 'FungibleToken',
    ownership: { owner: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV' },
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('normalizeDasResponse', () => {
  // -----------------------------------------------------------------------
  // Empty / edge cases
  // -----------------------------------------------------------------------
  describe('empty/edge cases', () => {
    it('returns empty list with total 0 for an empty response', () => {
      const result = normalizeDasResponse(dasEmptyResponse as DasAssetList)

      expect(result.items).toEqual([])
      expect(result.total).toBe(0)
    })

    it('returns empty list when response has zero native balance and no items', () => {
      const result = normalizeDasResponse(
        dasZeroNativeBalanceResponse as DasAssetList,
      )

      expect(result.items).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  // -----------------------------------------------------------------------
  // Native SOL
  // -----------------------------------------------------------------------
  describe('native SOL', () => {
    it('includes native SOL as first item when lamports > 0', () => {
      const response = makeResponse([], {
        nativeBalance: nativeBalanceFixture,
      })

      const result = normalizeDasResponse(response)

      expect(result.items).toHaveLength(1)
      expect(result.total).toBe(1)

      const sol = result.items[0]!
      expect(sol.mint).toBe(SOL_MINT)
      expect(sol.symbol).toBe('SOL')
      expect(sol.name).toBe('Solana')
      expect(sol.decimals).toBe(9)
      expect(sol.kind).toBe('native')
      expect(sol.rawBalance).toBe(BigInt(nativeBalanceFixture.lamports))
    })

    it('converts lamports to bigint for rawBalance', () => {
      const response = makeResponse([], {
        nativeBalance: { lamports: 999, price_per_sol: 0, total_price: 0 },
      })

      const result = normalizeDasResponse(response)
      expect(result.items[0]!.rawBalance).toBe(999n)
    })

    it('skips native SOL when lamports is 0', () => {
      const result = normalizeDasResponse(
        dasZeroNativeBalanceResponse as DasAssetList,
      )

      expect(result.items).toHaveLength(0)
    })

    it('skips native SOL when nativeBalance is absent', () => {
      const response = makeResponse([])

      const result = normalizeDasResponse(response)

      expect(result.items).toHaveLength(0)
    })
  })

  // -----------------------------------------------------------------------
  // SPL token filtering
  // -----------------------------------------------------------------------
  describe('SPL token filtering', () => {
    it('includes FungibleToken assets with full metadata', () => {
      const response = makeResponse([fungibleTokenItem as DasAsset])

      const result = normalizeDasResponse(response)

      expect(result.items).toHaveLength(1)
      const usdc = result.items[0]!
      expect(usdc.mint).toBe('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
      expect(usdc.symbol).toBe('USDC')
      expect(usdc.name).toBe('USD Coin')
      expect(usdc.rawBalance).toBe(50_000_000n)
      expect(usdc.decimals).toBe(6)
      expect(usdc.kind).toBe('spl-token')
    })

    it('includes FungibleAsset assets', () => {
      const response = makeResponse([fungibleAssetItem as DasAsset])

      const result = normalizeDasResponse(response)

      expect(result.items).toHaveLength(1)
      expect(result.items[0]!.mint).toBe(
        'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
      )
      expect(result.items[0]!.kind).toBe('spl-token')
    })

    it('filters out V1_NFT assets', () => {
      const nft: DasAsset = {
        interface: 'V1_NFT',
        id: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
        content: {
          metadata: { name: 'Mad Lads #1234', symbol: 'MAD' },
          links: { image: 'https://arweave.net/abc123' },
        },
        token_info: { balance: 1, decimals: 0 },
        ownership: { owner: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV' },
      }
      const response = makeResponse([nft])

      const result = normalizeDasResponse(response)

      expect(result.items).toHaveLength(0)
      expect(result.total).toBe(0)
    })

    it('filters out assets with other non-fungible interfaces', () => {
      const programmableNft: DasAsset = {
        interface: 'ProgrammableNFT',
        id: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
        token_info: { balance: 1, decimals: 0 },
        ownership: { owner: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV' },
      }
      const response = makeResponse([programmableNft])

      const result = normalizeDasResponse(response)

      expect(result.items).toHaveLength(0)
    })

    it('skips tokens where token_info.balance is missing', () => {
      const noBalance: DasAsset = makeToken({
        id: '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj',
        content: { metadata: { name: 'Lido Staked SOL', symbol: 'stSOL' } },
        token_info: { decimals: 9 },
      })
      const response = makeResponse([noBalance])

      const result = normalizeDasResponse(response)

      expect(result.items).toHaveLength(0)
      expect(result.total).toBe(0)
    })

    it('skips tokens where token_info is entirely absent', () => {
      const noTokenInfo: DasAsset = makeToken({
        id: '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj',
      })
      const response = makeResponse([noTokenInfo])

      const result = normalizeDasResponse(response)

      expect(result.items).toHaveLength(0)
    })

    it('converts token_info.balance to bigint for rawBalance', () => {
      const token: DasAsset = makeToken({
        id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        token_info: { balance: 123_456_789, decimals: 6 },
      })
      const response = makeResponse([token])

      const result = normalizeDasResponse(response)

      expect(result.items[0]!.rawBalance).toBe(123_456_789n)
    })
  })

  // -----------------------------------------------------------------------
  // Metadata fallback chains
  // -----------------------------------------------------------------------
  describe('metadata fallback chains', () => {
    describe('symbol', () => {
      it('prefers token_info.symbol over content.metadata.symbol', () => {
        const token: DasAsset = makeToken({
          id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          content: { metadata: { symbol: 'MetadataSymbol' } },
          token_info: { symbol: 'TokenInfoSymbol', balance: 1, decimals: 0 },
        })
        const response = makeResponse([token])

        const result = normalizeDasResponse(response)

        expect(result.items[0]!.symbol).toBe('TokenInfoSymbol')
      })

      it('falls back to content.metadata.symbol when token_info.symbol is absent', () => {
        const response = makeResponse([fungibleAssetItem as DasAsset])

        const result = normalizeDasResponse(response)

        // fungibleAssetItem has content.metadata.symbol = 'mSOL' but no token_info.symbol
        expect(result.items[0]!.symbol).toBe('mSOL')
      })

      it('falls back to truncated address when both symbols are absent', () => {
        const response = makeResponse([unknownTokenItem as DasAsset])

        const result = normalizeDasResponse(response)

        // id = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'
        // truncated: first 4 + '...' + last 4
        expect(result.items[0]!.symbol).toBe('DezX...B263')
      })
    })

    describe('name', () => {
      it('uses content.metadata.name when available', () => {
        const response = makeResponse([fungibleTokenItem as DasAsset])

        const result = normalizeDasResponse(response)

        expect(result.items[0]!.name).toBe('USD Coin')
      })

      it('falls back to truncated address when content.metadata.name is absent', () => {
        const response = makeResponse([unknownTokenItem as DasAsset])

        const result = normalizeDasResponse(response)

        expect(result.items[0]!.name).toBe('DezX...B263')
      })
    })

    describe('image', () => {
      it('uses content.links.image when available', () => {
        const response = makeResponse([fungibleTokenItem as DasAsset])

        const result = normalizeDasResponse(response)

        expect(result.items[0]!.imageUrl).toBe(
          'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
        )
      })

      it('falls back to files[0].uri when links.image is absent', () => {
        const token: DasAsset = makeToken({
          id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          content: {
            files: [{ uri: 'https://example.com/fallback.png' }],
          },
          token_info: { balance: 1, decimals: 0 },
        })
        const response = makeResponse([token])

        const result = normalizeDasResponse(response)

        expect(result.items[0]!.imageUrl).toBe(
          'https://example.com/fallback.png',
        )
      })

      it('returns null when neither links.image nor files are available', () => {
        const response = makeResponse([fungibleAssetItem as DasAsset])

        const result = normalizeDasResponse(response)

        // fungibleAssetItem has no links or files
        expect(result.items[0]!.imageUrl).toBeNull()
      })

      it('returns null when content is entirely absent', () => {
        const response = makeResponse([unknownTokenItem as DasAsset])

        const result = normalizeDasResponse(response)

        expect(result.items[0]!.imageUrl).toBeNull()
      })
    })

    describe('decimals', () => {
      it('uses token_info.decimals when available', () => {
        const response = makeResponse([fungibleTokenItem as DasAsset])

        const result = normalizeDasResponse(response)

        expect(result.items[0]!.decimals).toBe(6)
      })

      it('falls back to 0 when token_info.decimals is absent', () => {
        const token: DasAsset = makeToken({
          id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          token_info: { balance: 100 },
        })
        const response = makeResponse([token])

        const result = normalizeDasResponse(response)

        expect(result.items[0]!.decimals).toBe(0)
      })
    })
  })

  // -----------------------------------------------------------------------
  // Error handling
  // -----------------------------------------------------------------------
  describe('error handling', () => {
    it('handles token with content explicitly set to null', () => {
      const token: DasAsset = makeToken({
        id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        content: null,
        token_info: { balance: 500, decimals: 2 },
      })
      const response = makeResponse([token])

      const result = normalizeDasResponse(response)

      expect(result.items).toHaveLength(1)
      // Falls back to truncated address for symbol and name
      expect(result.items[0]!.symbol).toBe('EPjF...Dt1v')
      expect(result.items[0]!.name).toBe('EPjF...Dt1v')
      expect(result.items[0]!.imageUrl).toBeNull()
    })

    it('falls back to truncated address when content is present but inner objects are empty', () => {
      const response: DasAssetList = {
        total: 1,
        limit: 10,
        page: 1,
        items: [emptyMetadataItem],
      }
      const result = normalizeDasResponse(response)
      const token = result.items[0]!
      expect(token.symbol).toMatch(/^[A-Za-z0-9]{4}\.\.\.[A-Za-z0-9]{4}$/)
      expect(token.name).toMatch(/^[A-Za-z0-9]{4}\.\.\.[A-Za-z0-9]{4}$/)
      expect(token.imageUrl).toBeNull()
      expect(token.decimals).toBe(6)
      expect(token.rawBalance).toBe(1000n)
      expect(token.kind).toBe('spl-token')
    })

    it('skips assets with invalid base58 address and warns', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const invalid: DasAsset = makeToken({
        id: '!!not-valid-base58!!',
        token_info: { balance: 100, decimals: 0 },
      })
      const valid: DasAsset = makeToken({
        id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        token_info: { balance: 200, decimals: 6 },
      })
      const response = makeResponse([invalid, valid])

      const result = normalizeDasResponse(response)

      expect(result.items).toHaveLength(1)
      expect(result.items[0]!.mint).toBe(
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      )
      expect(warnSpy).toHaveBeenCalled()

      warnSpy.mockRestore()
    })

    it('never throws even with entirely malformed input', () => {
      const malformed = {
        total: 1,
        limit: 1000,
        page: 1,
        items: [
          {
            id: '!!bad!!',
            interface: 'FungibleToken',
            ownership: { owner: 'test' },
            token_info: { balance: 1, decimals: 0 },
          },
        ],
      } as DasAssetList

      expect(() => normalizeDasResponse(malformed)).not.toThrow()
    })

    it('returns valid PortfolioAssetList structure even when all assets fail', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const response = makeResponse([
        makeToken({
          id: '!!invalid1!!',
          token_info: { balance: 1, decimals: 0 },
        }),
        makeToken({
          id: '!!invalid2!!',
          token_info: { balance: 2, decimals: 0 },
        }),
      ])

      const result = normalizeDasResponse(response)

      expect(result).toHaveProperty('items')
      expect(result).toHaveProperty('total')
      expect(Array.isArray(result.items)).toBe(true)
      expect(result.total).toBe(0)

      warnSpy.mockRestore()
    })
  })

  // -----------------------------------------------------------------------
  // Full response / ordering
  // -----------------------------------------------------------------------
  describe('full response', () => {
    it('produces correct combined list from mixed fixture response', () => {
      const result = normalizeDasResponse(
        dasGetAssetsByOwnerResponse as DasAssetList,
      )

      // native SOL (lamports=2_500_000_000) + USDC + mSOL + unknown token = 4
      // NFT filtered, no-balance token filtered
      expect(result.total).toBe(4)
      expect(result.items).toHaveLength(4)
    })

    it('places native SOL first, followed by SPL tokens in original DAS order', () => {
      const result = normalizeDasResponse(
        dasGetAssetsByOwnerResponse as DasAssetList,
      )

      expect(result.items[0]!.kind).toBe('native')
      expect(result.items[0]!.mint).toBe(SOL_MINT)

      // SPL tokens follow in their original fixture order: USDC, mSOL, unknown
      expect(result.items[1]!.mint).toBe(
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      )
      expect(result.items[2]!.mint).toBe(
        'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
      )
      expect(result.items[3]!.mint).toBe(
        'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      )
    })

    it('total reflects actual count after filtering, not the DAS total', () => {
      // DAS response says total: 5 but only 3 SPL tokens pass + 1 native = 4
      const result = normalizeDasResponse(
        dasGetAssetsByOwnerResponse as DasAssetList,
      )

      expect(dasGetAssetsByOwnerResponse.total).toBe(5)
      expect(result.total).toBe(4)
      expect(result.total).toBe(result.items.length)
    })

    it('preserves SPL token order after filtering (no re-sorting)', () => {
      const tokenA: DasAsset = makeToken({
        id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        token_info: { balance: 1, decimals: 0, symbol: 'A' },
      })
      const nft: DasAsset = {
        interface: 'V1_NFT',
        id: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
        ownership: { owner: 'test' },
      }
      const tokenB: DasAsset = makeToken({
        id: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
        token_info: { balance: 2, decimals: 0, symbol: 'B' },
      })

      const response = makeResponse([tokenA, nft, tokenB])
      const result = normalizeDasResponse(response)

      expect(result.items).toHaveLength(2)
      expect(result.items[0]!.symbol).toBe('A')
      expect(result.items[1]!.symbol).toBe('B')
    })

    it('produces sensible output for each asset in the full fixture', () => {
      const result = normalizeDasResponse(
        dasGetAssetsByOwnerResponse as DasAssetList,
      )

      // Native SOL
      const sol = result.items[0]!
      expect(sol.symbol).toBe('SOL')
      expect(sol.rawBalance).toBe(2_500_000_000n)
      expect(sol.decimals).toBe(9)

      // USDC (full metadata)
      const usdc = result.items[1]!
      expect(usdc.symbol).toBe('USDC')
      expect(usdc.name).toBe('USD Coin')
      expect(usdc.rawBalance).toBe(50_000_000n)
      expect(usdc.decimals).toBe(6)
      expect(usdc.imageUrl).not.toBeNull()

      // mSOL (FungibleAsset, no token_info.symbol, falls back to metadata)
      const msol = result.items[2]!
      expect(msol.symbol).toBe('mSOL')
      expect(msol.name).toBe('Marinade staked SOL')
      expect(msol.rawBalance).toBe(3_500_000_000n)
      expect(msol.imageUrl).toBeNull()

      // Unknown token (no content, fallback to truncated address)
      const unknown = result.items[3]!
      expect(unknown.symbol).toBe('DezX...B263')
      expect(unknown.name).toBe('DezX...B263')
      expect(unknown.rawBalance).toBe(100_000_000n)
      expect(unknown.decimals).toBe(5)
      expect(unknown.imageUrl).toBeNull()
    })
  })
})
