/**
 * Raw Helius DAS (Digital Asset Standard) API response types.
 *
 * Used only at the fetch boundary. Downstream code should use PortfolioAsset.
 * Fields are modeled loosely (optional) to handle unexpected API responses.
 */

// ---------------------------------------------------------------------------
// Native balance
// ---------------------------------------------------------------------------

export type NativeBalanceInfo = {
  lamports: number
  price_per_sol: number
  total_price: number
}

// ---------------------------------------------------------------------------
// Asset content
// ---------------------------------------------------------------------------

export type DasAssetContent = {
  metadata?: {
    name?: string
    symbol?: string
    description?: string
    token_standard?: string
  }
  links?: {
    image?: string
    external_url?: string
  }
  files?: Array<{
    uri?: string
    cdn_uri?: string
    mime?: string
  }>
}

// ---------------------------------------------------------------------------
// Token info
// ---------------------------------------------------------------------------

export type DasTokenInfo = {
  decimals?: number
  /**
   * Token balance in smallest unit. Helius serializes this as a JSON `number`,
   * which silently loses precision for values above `Number.MAX_SAFE_INTEGER`
   * (2^53 − 1). Mainstream SPL tokens are unaffected; high-supply meme tokens
   * with extreme balances may be imprecise at the JSON parse boundary — before
   * any of our code runs. Mitigation options tracked for Issue #6 / #9.
   */
  balance?: number
  symbol?: string
  price_info?: {
    price_per_token?: number
    total_price?: number
    currency?: string
  }
  mint_authority?: string
  supply?: number
  token_program?: string
  associated_token_address?: string
  freeze_authority?: string
}

// ---------------------------------------------------------------------------
// Asset
// ---------------------------------------------------------------------------

export type DasAsset = {
  id: string
  interface: string
  content?: DasAssetContent | null
  token_info?: DasTokenInfo
  ownership: { owner: string }
}

// ---------------------------------------------------------------------------
// Asset list (getAssetsByOwner response)
// ---------------------------------------------------------------------------

// Note: live Helius `getAssetsByOwner` responses also include a top-level
// `last_indexed_slot: number` field. Not modeled here because no consumer
// reads it yet — TypeScript structural typing allows extra fields on
// non-literal assignments, so adding this later is non-breaking.
export type DasAssetList = {
  total: number
  limit: number
  page: number
  items: DasAsset[]
  nativeBalance?: NativeBalanceInfo
}

// ---------------------------------------------------------------------------
// RPC params
// ---------------------------------------------------------------------------

// TODO: Helius DAS also accepts `sortBy`, `before`, `after`, `cursor`, and
// `options`. Add them to this type when pagination or advanced filtering is
// needed (e.g. transaction history).
export type DasGetAssetsByOwnerParams = {
  ownerAddress: string
  page: number
  limit?: number
  displayOptions?: {
    showFungible?: boolean
    showNativeBalance?: boolean
  }
}

// ---------------------------------------------------------------------------
// RPC method map (for createJsonRpcApi<T>())
// ---------------------------------------------------------------------------

export type DasApiMethod = {
  getAssetsByOwner(params: DasGetAssetsByOwnerParams): DasAssetList
}
