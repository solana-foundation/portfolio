import type { Address } from '@solana/kit'

/**
 * Normalized asset model representing a token in the user's portfolio.
 */
export type PortfolioAsset = {
  /** Mint address */
  mint: Address
  /** Human-readable token symbol */
  symbol: string
  /** Human-readable token name */
  name: string
  /** Token logo URL, null if unavailable */
  imageUrl: string | null
  /** Balance in smallest unit (lamports for SOL) */
  rawBalance: bigint
  /** Token decimals */
  decimals: number
  /** Discriminator for native SOL vs SPL tokens */
  kind: 'native' | 'spl-token'
  // Issue #5 — metadata enrichment fields (e.g., coingecko ID, tags)
  // Issue #6 — pricing fields (e.g., usdPrice, usdValue)
  // Issue #9 — recent transaction history reference
}

/**
 * A list of portfolio assets with a total count.
 */
export type PortfolioAssetList = {
  items: PortfolioAsset[]
  total: number
}
