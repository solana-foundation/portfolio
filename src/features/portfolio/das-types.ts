/**
 * Raw DAS (Digital Asset Standard) API response types.
 * Used at the fetch boundary; downstream code should use PortfolioAsset.
 * Through this plugin's parse + response-transformer chain, integer-valued
 * fields materialize as `bigint` unless explicitly allowlisted to stay
 * `number`.
 */

// ---------------------------------------------------------------------------
// Native balance
// ---------------------------------------------------------------------------

export type NativeBalanceInfo = {
  lamports: bigint
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
  /** Token balance in smallest unit (bigint for precision above MAX_SAFE_INTEGER). */
  balance?: bigint
  symbol?: string
  price_info?: {
    price_per_token?: number
    total_price?: number
    currency?: string
  }
  mint_authority?: string
  supply?: bigint
  token_program?: string
  associated_token_address?: string
  freeze_authority?: string
}

// ---------------------------------------------------------------------------
// Asset
// ---------------------------------------------------------------------------

// Live DAS responses include additional numeric fields we do not model yet.
// If we type them later, keep integer counters as `bigint` (for example
// compression.seq, compression.leaf_id, royalty.basis_points, creators[].share,
// supply.print_*, and token_info.token_accounts[].balance). `royalty.percent`
// remains `number`.
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

// `last_indexed_slot` also present in live responses but not modeled yet.
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

// TODO: DAS also accepts `sortBy`, `before`, `after`, `cursor`, and
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
