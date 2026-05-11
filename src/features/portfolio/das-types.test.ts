import { describe, expect, it } from 'vitest'
import {
  dasEmptyResponse,
  dasGetAssetsByOwnerResponse,
  dasZeroNativeBalanceResponse,
  emptyMetadataItem,
  fungibleTokenItem,
  nativeBalanceFixture,
  nftItem,
  unknownTokenItem,
} from '@/features/portfolio/__fixtures__/das-get-assets-by-owner'
import type {
  DasApiMethod,
  DasAsset,
  DasAssetContent,
  DasAssetList,
  DasGetAssetsByOwnerParams,
  NativeBalanceInfo,
} from '@/features/portfolio/das-types'

describe('DasAssetList', () => {
  it('accepts the full dasGetAssetsByOwnerResponse fixture', () => {
    const list: DasAssetList = dasGetAssetsByOwnerResponse

    expect(list.total).toBe(8)
    expect(list.limit).toBe(1000)
    expect(list.page).toBe(1)
    expect(list.items).toHaveLength(8)
    expect(list.nativeBalance).toBeDefined()
  })

  it('accepts the empty response fixture', () => {
    const list: DasAssetList = dasEmptyResponse

    expect(list.total).toBe(0)
    expect(list.items).toHaveLength(0)
    expect(list.nativeBalance).toBeUndefined()
  })

  it('accepts a response with zero native balance', () => {
    const list: DasAssetList = dasZeroNativeBalanceResponse

    expect(list.nativeBalance).toBeDefined()
    expect(list.nativeBalance?.lamports).toBe(0n)
  })
})

describe('NativeBalanceInfo', () => {
  it('accepts the nativeBalance fixture', () => {
    const nb: NativeBalanceInfo = nativeBalanceFixture

    expect(nb.lamports).toBe(2_500_000_000n)
    expect(nb.price_per_sol).toBeCloseTo(82.004, 2)
    expect(nb.total_price).toBeCloseTo(205.011, 2)
  })

  it('uses price_per_sol (not solPrice) and total_price (not totalPrice)', () => {
    const nb: NativeBalanceInfo = nativeBalanceFixture

    expect('price_per_sol' in nb).toBe(true)
    expect('total_price' in nb).toBe(true)
  })
})

describe('DasAsset', () => {
  it('accepts an asset with absent content (undefined)', () => {
    const asset: DasAsset = unknownTokenItem

    expect(asset.content).toBeUndefined()
    expect(asset.id).toBe('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263')
    expect(asset.interface).toBe('FungibleToken')
    expect(asset.ownership.owner).toBeDefined()
  })

  it('accepts an asset with content explicitly set to null', () => {
    const asset: DasAsset = {
      id: 'SomeMintAddress111111111111111111111111111111',
      interface: 'FungibleToken',
      content: null,
      ownership: { owner: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV' },
    }

    expect(asset.content).toBeNull()
  })

  it('accepts an asset with content present but inner objects empty', () => {
    const asset: DasAsset = emptyMetadataItem

    expect(asset.content).toBeDefined()
    expect(asset.content).not.toBeNull()
    // All the fallback-chain lookups return undefined without throwing.
    expect(asset.content?.metadata?.name).toBeUndefined()
    expect(asset.content?.metadata?.symbol).toBeUndefined()
    expect(asset.content?.links?.image).toBeUndefined()
    expect(asset.content?.files?.[0]?.uri).toBeUndefined()
  })

  it('accepts an asset without token_info', () => {
    const asset: DasAsset = nftItem

    expect(asset.token_info).toBeUndefined()
    expect(asset.interface).toBe('V1_NFT')
  })

  it('accepts an asset with full token_info including price_info', () => {
    const asset: DasAsset = fungibleTokenItem

    expect(asset.token_info).toBeDefined()
    expect(asset.token_info?.symbol).toBe('USDC')
    expect(asset.token_info?.decimals).toBe(6)
    expect(asset.token_info?.balance).toBe(50_000_000n)
    expect(asset.token_info?.price_info?.price_per_token).toBeCloseTo(
      0.99989,
      4,
    )
    expect(asset.token_info?.price_info?.total_price).toBeCloseTo(49.9945, 4)
    expect(asset.token_info?.price_info?.currency).toBe('USDC')
    expect(asset.token_info?.mint_authority).toBeDefined()
    expect(asset.token_info?.freeze_authority).toBeDefined()
    expect(asset.token_info?.supply).toBeDefined()
    expect(asset.token_info?.token_program).toBeDefined()
    expect(asset.token_info?.associated_token_address).toBeDefined()
  })
})

describe('DasAssetContent', () => {
  it('supports cdn_uri in files and external_url in links', () => {
    const content: DasAssetContent = {
      metadata: { name: 'Test Token', symbol: 'TST' },
      links: {
        image: 'https://example.com/img.png',
        external_url: 'https://example.com',
      },
      files: [
        {
          uri: 'https://example.com/img.png',
          cdn_uri: 'https://cdn.example.com/img.png',
          mime: 'image/png',
        },
      ],
    }

    expect(content.links?.external_url).toBe('https://example.com')
    expect(content.files?.[0]?.cdn_uri).toBe('https://cdn.example.com/img.png')
  })

  it('allows all metadata fields to be optional', () => {
    const content: DasAssetContent = {}

    expect(content.metadata).toBeUndefined()
    expect(content.links).toBeUndefined()
    expect(content.files).toBeUndefined()
  })
})

describe('DasGetAssetsByOwnerParams', () => {
  it('can be constructed with only required fields', () => {
    const params: DasGetAssetsByOwnerParams = {
      ownerAddress: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
      page: 1,
    }

    expect(params.ownerAddress).toBe(
      '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
    )
    expect(params.page).toBe(1)
    expect(params.limit).toBeUndefined()
    expect(params.displayOptions).toBeUndefined()
  })

  it('can be constructed with all optional fields', () => {
    const params: DasGetAssetsByOwnerParams = {
      ownerAddress: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV',
      page: 1,
      limit: 1000,
      displayOptions: {
        showFungible: true,
        showNativeBalance: true,
      },
    }

    expect(params.limit).toBe(1000)
    expect(params.displayOptions?.showFungible).toBe(true)
    expect(params.displayOptions?.showNativeBalance).toBe(true)
  })
})

describe('DasApiMethod', () => {
  it('defines getAssetsByOwner in the method map', () => {
    // Verify the type exists and has the expected method shape
    // by constructing a conforming object
    const methods: DasApiMethod = {
      getAssetsByOwner: (_params: DasGetAssetsByOwnerParams): DasAssetList => ({
        total: 0,
        limit: 1000,
        page: 1,
        items: [],
      }),
    }

    const result = methods.getAssetsByOwner({
      ownerAddress: 'test',
      page: 1,
    })
    expect(result.total).toBe(0)
    expect(result.items).toEqual([])
  })
})
