import type { Address } from '@solana/kit'
import {
  SPL_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  WRAPPED_SOL_MINT,
  WRAPPED_SOL_MINT_2022,
} from './solana-constants'
import type { PortfolioAssetId, TokenProgramId } from './types'

export function parseTokenProgramId(
  value: string | undefined,
): TokenProgramId | null {
  if (value === SPL_TOKEN_PROGRAM_ID) return SPL_TOKEN_PROGRAM_ID
  if (value === TOKEN_2022_PROGRAM_ID) return TOKEN_2022_PROGRAM_ID
  return null
}

export function isSolanaNativeMint(
  tokenProgram: TokenProgramId,
  mint: Address,
): boolean {
  return tokenProgram === SPL_TOKEN_PROGRAM_ID
    ? mint === WRAPPED_SOL_MINT
    : mint === WRAPPED_SOL_MINT_2022
}

export function createNativeAssetId(): PortfolioAssetId {
  return 'native:SOL'
}

export function createSplAssetId(
  tokenProgram: TokenProgramId,
  mint: Address,
): PortfolioAssetId {
  return `spl-token:${tokenProgram}:${mint}`
}
