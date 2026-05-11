import { address } from '@solana/kit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  dasEmptyResponse,
  dasGetAssetsByOwnerResponse,
  dasNativeAndWrappedSolResponse,
  dasZeroNativeBalanceResponse,
  emptyMetadataItem,
  fungibleAssetItem,
  fungibleMissingTokenProgramItem,
  fungibleTokenItem,
  fungibleTokenNonImageMime,
  fungibleUnknownTokenProgramItem,
  nativeBalanceFixture,
  unknownTokenItem,
} from '@/features/portfolio/__fixtures__/das-get-assets-by-owner'
import {
  createSplAssetId,
  isSolanaNativeMint,
} from '@/features/portfolio/asset-identity'
import type { DasAsset, DasAssetList } from '@/features/portfolio/das-types'
import { normalizeDasResponse } from '@/features/portfolio/normalize'
import { SPL_TOKEN_PROGRAM_ID } from '@/features/portfolio/solana-constants'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

/**
 * Build a minimal FungibleToken DasAsset. When `token_info` is supplied, the
 * SPL Token Program id is merged in by default so callers don't have to
 * thread it through every fixture; tests that need a different (or absent)
 * `token_program` should overwrite it explicitly.
 */
function makeValidToken(
  overrides: Partial<DasAsset> & { id: string },
): DasAsset {
  const { token_info, ...rest } = overrides
  return {
    interface: 'FungibleToken',
    ownership: { owner: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV' },
    ...rest,
    ...(token_info !== undefined && {
      token_info: {
        token_program: SPL_TOKEN_PROGRAM_ID,
        ...token_info,
      },
    }),
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
      expect(sol.id).toBe('native:SOL')
      expect(sol.symbol).toBe('SOL')
      expect(sol.name).toBe('Solana')
      expect(sol.decimals).toBe(9)
      expect(sol.kind).toBe('native')
      expect(sol.rawBalance).toBe(nativeBalanceFixture.lamports)
    })

    it('passes lamports bigint through to rawBalance', () => {
      const response = makeResponse([], {
        nativeBalance: { lamports: 999n, price_per_sol: 0, total_price: 0 },
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

    it('sets imageUrl for native SOL to the bundled brand mark', () => {
      const response = makeResponse([], {
        nativeBalance: nativeBalanceFixture,
      })

      const result = normalizeDasResponse(response)

      const sol = result.items[0]!
      // Vite resolves static asset imports to either a filename-based URL
      // (production: hashed `…native-sol-<hash>.svg`) or an inlined
      // `data:image/svg+xml,…` URL (test/dev when small enough). Accept both.
      expect(sol.imageUrl).toBeTruthy()
      expect(sol.imageUrl).toMatch(/native-sol|svg/i)
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
        token_info: { balance: 1n, decimals: 0 },
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
        token_info: { balance: 1n, decimals: 0 },
        ownership: { owner: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV' },
      }
      const response = makeResponse([programmableNft])

      const result = normalizeDasResponse(response)

      expect(result.items).toHaveLength(0)
    })

    it('skips tokens where token_info.balance is missing', () => {
      const noBalance: DasAsset = makeValidToken({
        id: '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj',
        content: { metadata: { name: 'Lido Staked SOL', symbol: 'stSOL' } },
        token_info: { decimals: 9 },
      })
      const response = makeResponse([noBalance])

      const result = normalizeDasResponse(response)

      expect(result.items).toHaveLength(0)
      expect(result.total).toBe(0)
    })

    it('skips tokens where token_info.balance is zero (emptied account)', () => {
      const zeroBalance: DasAsset = makeValidToken({
        id: '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj',
        content: { metadata: { name: 'Lido Staked SOL', symbol: 'stSOL' } },
        token_info: { balance: 0n, decimals: 9 },
      })
      const response = makeResponse([zeroBalance])

      const result = normalizeDasResponse(response)

      expect(result.items).toHaveLength(0)
      expect(result.total).toBe(0)
    })

    it('skips tokens where token_info is entirely absent', () => {
      const noTokenInfo: DasAsset = makeValidToken({
        id: '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj',
      })
      const response = makeResponse([noTokenInfo])

      const result = normalizeDasResponse(response)

      expect(result.items).toHaveLength(0)
    })

    it('passes token_info.balance bigint through to rawBalance', () => {
      const token: DasAsset = makeValidToken({
        id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        token_info: { balance: 123_456_789n, decimals: 6 },
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
        const token: DasAsset = makeValidToken({
          id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          content: { metadata: { symbol: 'MetadataSymbol' } },
          token_info: { symbol: 'TokenInfoSymbol', balance: 1n, decimals: 0 },
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

    describe('decimals', () => {
      it('uses token_info.decimals when available', () => {
        const response = makeResponse([fungibleTokenItem as DasAsset])

        const result = normalizeDasResponse(response)

        expect(result.items[0]!.decimals).toBe(6)
      })

      it('falls back to 0 when token_info.decimals is absent', () => {
        const token: DasAsset = makeValidToken({
          id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          token_info: { balance: 100n },
        })
        const response = makeResponse([token])

        const result = normalizeDasResponse(response)

        expect(result.items[0]!.decimals).toBe(0)
      })
    })
  })

  // -----------------------------------------------------------------------
  // Image cascade
  // -----------------------------------------------------------------------
  describe('image cascade', () => {
    it('prefers cdn_uri of the first files[] entry whose mime starts with image/', () => {
      const response = makeResponse([fungibleTokenItem as DasAsset])

      const result = normalizeDasResponse(response)

      expect(result.items[0]!.imageUrl).toBe(
        'https://cdn.helius-rpc.com/cdn-cgi/image//https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      )
    })

    it('skips files[] entries with non-image mime and falls through to links.image', () => {
      const response: DasAssetList = {
        total: 1,
        limit: 1000,
        page: 1,
        items: [fungibleTokenNonImageMime as DasAsset],
      }

      const result = normalizeDasResponse(response)

      expect(result.items[0]!.imageUrl).toBe(
        'https://example.invalid/blob/icon.png',
      )
    })

    it('treats files[] entries with absent mime as non-image and skips them', () => {
      const token: DasAsset = makeValidToken({
        id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        content: {
          files: [
            {
              uri: 'https://example.com/no-mime.png',
              cdn_uri: 'https://cdn.example.com/no-mime.png',
            },
          ],
        },
        token_info: { balance: 1n, decimals: 0 },
      })
      const response = makeResponse([token])

      const result = normalizeDasResponse(response)

      expect(result.items[0]!.imageUrl).toBeNull()
    })

    it('falls through to links.image when files is absent', () => {
      const token: DasAsset = makeValidToken({
        id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        content: {
          links: { image: 'https://example.com/logo.png' },
        },
        token_info: { balance: 1n, decimals: 0 },
      })
      const response = makeResponse([token])

      const result = normalizeDasResponse(response)

      expect(result.items[0]!.imageUrl).toBe('https://example.com/logo.png')
    })

    it('falls through to image-mime files[].uri when cdn_uri is absent', () => {
      const token: DasAsset = makeValidToken({
        id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        content: {
          files: [
            { uri: 'https://example.com/fallback.png', mime: 'image/png' },
          ],
        },
        token_info: { balance: 1n, decimals: 0 },
      })
      const response = makeResponse([token])

      const result = normalizeDasResponse(response)

      expect(result.items[0]!.imageUrl).toBe('https://example.com/fallback.png')
    })

    it('prefers any image-mime cdn_uri over links.image, even if files[0] lacks cdn_uri', () => {
      // Metaplex permits multiple files; the cascade should consider every
      // image-mime entry's cdn_uri before falling to links.image.
      const token: DasAsset = makeValidToken({
        id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        content: {
          files: [
            { uri: 'https://example.com/raw-first.png', mime: 'image/png' },
            {
              uri: 'https://example.com/raw-second.png',
              cdn_uri: 'https://cdn.example.com/cdn-second.png',
              mime: 'image/png',
            },
          ],
          links: { image: 'https://example.com/links-image.png' },
        },
        token_info: { balance: 1n, decimals: 0 },
      })
      const response = makeResponse([token])

      const result = normalizeDasResponse(response)

      expect(result.items[0]!.imageUrl).toBe(
        'https://cdn.example.com/cdn-second.png',
      )
    })

    it('falls back to a later image-mime files[].uri when earlier image-mime entries have neither uri nor cdn_uri', () => {
      const token: DasAsset = makeValidToken({
        id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        content: {
          files: [
            { mime: 'image/png' },
            { uri: 'https://example.com/second.png', mime: 'image/png' },
          ],
        },
        token_info: { balance: 1n, decimals: 0 },
      })
      const response = makeResponse([token])

      const result = normalizeDasResponse(response)

      expect(result.items[0]!.imageUrl).toBe('https://example.com/second.png')
    })

    it('resolves to null when content is undefined', () => {
      const response = makeResponse([unknownTokenItem as DasAsset])

      const result = normalizeDasResponse(response)

      expect(result.items[0]!.imageUrl).toBeNull()
    })

    it('resolves to null when content has neither files nor links', () => {
      const response = makeResponse([fungibleAssetItem as DasAsset])

      const result = normalizeDasResponse(response)

      expect(result.items[0]!.imageUrl).toBeNull()
    })

    it('resolves to null when files and links are present but empty', () => {
      const response = makeResponse([emptyMetadataItem as DasAsset])

      const result = normalizeDasResponse(response)

      expect(result.items[0]!.imageUrl).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // Error handling
  // -----------------------------------------------------------------------
  describe('error handling', () => {
    it('handles token with content explicitly set to null', () => {
      const token: DasAsset = makeValidToken({
        id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        content: null,
        token_info: { balance: 500n, decimals: 2 },
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

      const invalid: DasAsset = makeValidToken({
        id: '!!not-valid-base58!!',
        token_info: { balance: 100n, decimals: 0 },
      })
      const valid: DasAsset = makeValidToken({
        id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        token_info: { balance: 200n, decimals: 6 },
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
            token_info: { balance: 1n, decimals: 0 },
          },
        ],
      } as DasAssetList

      expect(() => normalizeDasResponse(malformed)).not.toThrow()
    })

    it('returns valid PortfolioAssetList structure even when all assets fail', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const response = makeResponse([
        makeValidToken({
          id: '!!invalid1!!',
          token_info: { balance: 1n, decimals: 0 },
        }),
        makeValidToken({
          id: '!!invalid2!!',
          token_info: { balance: 2n, decimals: 0 },
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

      // 1 native + 6 fungibles = 7; NFT and no-balance items filter out.
      expect(result.total).toBe(7)
      expect(result.items).toHaveLength(7)
    })

    it('places native SOL first, followed by SPL tokens in original DAS order', () => {
      const result = normalizeDasResponse(
        dasGetAssetsByOwnerResponse as DasAssetList,
      )

      expect(result.items[0]!.kind).toBe('native')
      expect(result.items[0]!.id).toBe('native:SOL')

      // SPL tokens follow in their original fixture order: USDC, mSOL, unknown
      const usdc = result.items[1]!
      const msol = result.items[2]!
      const unknown = result.items[3]!
      if (
        usdc.kind !== 'spl-token' ||
        msol.kind !== 'spl-token' ||
        unknown.kind !== 'spl-token'
      ) {
        throw new Error('expected spl-token assets in tail of result.items')
      }
      expect(usdc.mint).toBe('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
      expect(msol.mint).toBe('mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So')
      expect(unknown.mint).toBe('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263')
    })

    it('total reflects actual count after filtering, not the DAS total', () => {
      // DAS response says total: 8 but only 6 SPL tokens pass + 1 native = 7
      const result = normalizeDasResponse(
        dasGetAssetsByOwnerResponse as DasAssetList,
      )

      expect(dasGetAssetsByOwnerResponse.total).toBe(8)
      expect(result.total).toBe(7)
      expect(result.total).toBe(result.items.length)
    })

    it('preserves SPL token order after filtering (no re-sorting)', () => {
      const tokenA: DasAsset = makeValidToken({
        id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        token_info: { balance: 1n, decimals: 0, symbol: 'A' },
      })
      const nft: DasAsset = {
        interface: 'V1_NFT',
        id: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
        ownership: { owner: 'test' },
      }
      const tokenB: DasAsset = makeValidToken({
        id: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
        token_info: { balance: 2n, decimals: 0, symbol: 'B' },
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
      expect(unknown.rawBalance).toBe(9_314_309_076_870_502_293n)
      expect(unknown.decimals).toBe(5)
      expect(unknown.imageUrl).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // Asset identity
  // -----------------------------------------------------------------------
  describe('asset identity', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('builds the native row with id "native:SOL" and no mint or tokenProgram', () => {
      const response = makeResponse([], { nativeBalance: nativeBalanceFixture })

      const result = normalizeDasResponse(response)

      const sol = result.items[0]!
      expect(sol.kind).toBe('native')
      expect(sol.id).toBe('native:SOL')
      expect('mint' in sol).toBe(false)
      expect('tokenProgram' in sol).toBe(false)
    })

    it('builds the SPL row with the helper-derived id and validated tokenProgram', () => {
      const response = makeResponse([fungibleTokenItem as DasAsset])

      const result = normalizeDasResponse(response)

      const usdc = result.items[0]!
      if (usdc.kind !== 'spl-token') {
        throw new Error('expected spl-token asset')
      }
      expect(usdc.tokenProgram).toBe(SPL_TOKEN_PROGRAM_ID)
      expect(usdc.id).toBe(
        createSplAssetId(SPL_TOKEN_PROGRAM_ID, address(fungibleTokenItem.id)),
      )
    })

    it('lets isSolanaNativeMint classify the wSOL row after narrowing', () => {
      const result = normalizeDasResponse(
        dasNativeAndWrappedSolResponse as DasAssetList,
      )

      const wsol = result.items[1]!
      if (wsol.kind !== 'spl-token') {
        throw new Error('expected spl-token wSOL row')
      }
      expect(isSolanaNativeMint(wsol.tokenProgram, wsol.mint)).toBe(true)
    })

    it('produces distinct ids for native SOL and wSOL on the collision response (native first)', () => {
      const result = normalizeDasResponse(
        dasNativeAndWrappedSolResponse as DasAssetList,
      )

      expect(result.items).toHaveLength(2)
      expect(result.items[0]!.kind).toBe('native')
      expect(result.items[1]!.kind).toBe('spl-token')
      expect(result.items[0]!.id).not.toBe(result.items[1]!.id)
    })

    it('warns and skips a positive-balance fungible whose token_program is missing', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const response = makeResponse([
        fungibleMissingTokenProgramItem as DasAsset,
      ])

      const result = normalizeDasResponse(response)

      expect(result.items).toHaveLength(0)
      expect(warnSpy).toHaveBeenCalledTimes(1)
      const [message] = warnSpy.mock.calls[0]!
      expect(String(message)).toContain(fungibleMissingTokenProgramItem.id)
    })

    it('warns and skips a positive-balance fungible whose token_program is unsupported', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const response = makeResponse([
        fungibleUnknownTokenProgramItem as DasAsset,
      ])

      const result = normalizeDasResponse(response)

      expect(result.items).toHaveLength(0)
      expect(warnSpy).toHaveBeenCalledTimes(1)
      const [message] = warnSpy.mock.calls[0]!
      expect(String(message)).toContain(fungibleUnknownTokenProgramItem.id)
    })
  })
})
