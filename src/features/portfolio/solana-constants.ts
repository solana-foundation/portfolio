import { address } from '@solana/kit'
import type { TokenProgramId } from './types'

// Wrapped-native-SOL mint under the original SPL Token Program.
// Source: solana-program/token interface/src/native_mint.rs declare_id!.
export const WRAPPED_SOL_MINT = address(
  'So11111111111111111111111111111111111111112',
)

// Wrapped-native-SOL mint under Token-2022 / Token Extension Program.
// Source: solana-program/token-2022 interface/src/native_mint.rs declare_id!.
export const WRAPPED_SOL_MINT_2022 = address(
  '9pan9bMn5HatX4EJdBwg9VgCa7Uz5HL8N1m5D3NdXejP',
)

// Original SPL Token Program address.
// Source: solana-program/token interface/src/lib.rs declare_id!.
export const SPL_TOKEN_PROGRAM_ID =
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' satisfies TokenProgramId

// Token-2022 / Token Extension Program address.
// Source: solana-program/token-2022 interface/src/lib.rs declare_id!.
export const TOKEN_2022_PROGRAM_ID =
  'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' satisfies TokenProgramId
