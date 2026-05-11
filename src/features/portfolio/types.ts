import type { Address } from '@solana/kit'

/**
 * Stable React key for a portfolio asset row. Asset-level (token program +
 * mint, or `'native:SOL'`); owner- and token-account-agnostic — safe today
 * because queries are scoped per cluster and per owner.
 */
export type PortfolioAssetId = string

/**
 * The two SPL token program addresses recognized by the portfolio feature:
 * the original Token Program and Token-2022. The string-literal union is
 * hardcoded so `types.ts` has no value-level imports from feature modules;
 * `solana-constants.ts` asserts conformance via `satisfies TokenProgramId`.
 */
export type TokenProgramId =
  | 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
  | 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'

type PortfolioAssetBase = {
  id: PortfolioAssetId
  symbol: string
  name: string
  decimals: number
  rawBalance: bigint
  imageUrl: string | null
  // Issue #6 — row-level pricing fields such as usdPrice and usdValue belong here
  // Issue #9 — recent transaction history reference may belong here or move with the Asset/Holding split when token-account-level data lands
}

export type NativePortfolioAsset = PortfolioAssetBase & {
  kind: 'native'
  mint?: never
  tokenProgram?: never
}

export type SplPortfolioAsset = PortfolioAssetBase & {
  kind: 'spl-token'
  mint: Address
  tokenProgram: TokenProgramId
}

export type PortfolioAsset = NativePortfolioAsset | SplPortfolioAsset

export type PortfolioAssetList = {
  items: PortfolioAsset[]
  total: number
}
