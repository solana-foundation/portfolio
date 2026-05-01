import { address } from '@solana/kit'
import { describe, expect, it } from 'vitest'
import {
  createNativeAssetId,
  createSplAssetId,
  isSolanaNativeMint,
  parseTokenProgramId,
} from './asset-identity'
import {
  SPL_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  WRAPPED_SOL_MINT,
  WRAPPED_SOL_MINT_2022,
} from './solana-constants'

const USDC_MINT = address('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

describe('parseTokenProgramId', () => {
  it('returns SPL_TOKEN_PROGRAM_ID for the original Token Program address', () => {
    expect(parseTokenProgramId(SPL_TOKEN_PROGRAM_ID)).toBe(SPL_TOKEN_PROGRAM_ID)
  })

  it('returns TOKEN_2022_PROGRAM_ID for the Token-2022 address', () => {
    expect(parseTokenProgramId(TOKEN_2022_PROGRAM_ID)).toBe(
      TOKEN_2022_PROGRAM_ID,
    )
  })

  it('returns null for an arbitrary base58 string that is not a known program', () => {
    expect(
      parseTokenProgramId('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    ).toBeNull()
  })

  it('returns null for undefined input', () => {
    expect(parseTokenProgramId(undefined)).toBeNull()
  })

  it('returns null for an empty string', () => {
    expect(parseTokenProgramId('')).toBeNull()
  })
})

describe('isSolanaNativeMint', () => {
  it('returns true for the original Token Program with WRAPPED_SOL_MINT', () => {
    expect(isSolanaNativeMint(SPL_TOKEN_PROGRAM_ID, WRAPPED_SOL_MINT)).toBe(
      true,
    )
  })

  it('returns true for Token-2022 with WRAPPED_SOL_MINT_2022', () => {
    expect(
      isSolanaNativeMint(TOKEN_2022_PROGRAM_ID, WRAPPED_SOL_MINT_2022),
    ).toBe(true)
  })

  it('returns false for the original Token Program with WRAPPED_SOL_MINT_2022', () => {
    expect(
      isSolanaNativeMint(SPL_TOKEN_PROGRAM_ID, WRAPPED_SOL_MINT_2022),
    ).toBe(false)
  })

  it('returns false for Token-2022 with WRAPPED_SOL_MINT', () => {
    expect(isSolanaNativeMint(TOKEN_2022_PROGRAM_ID, WRAPPED_SOL_MINT)).toBe(
      false,
    )
  })

  it('returns false for the original Token Program with an arbitrary non-SOL mint', () => {
    expect(isSolanaNativeMint(SPL_TOKEN_PROGRAM_ID, USDC_MINT)).toBe(false)
  })

  it('returns false for Token-2022 with an arbitrary non-SOL mint', () => {
    expect(isSolanaNativeMint(TOKEN_2022_PROGRAM_ID, USDC_MINT)).toBe(false)
  })
})

describe('createNativeAssetId', () => {
  it("returns the literal 'native:SOL'", () => {
    expect(createNativeAssetId()).toBe('native:SOL')
  })
})

describe('createSplAssetId', () => {
  it('returns spl-token:<program>:<mint> for the SPL Token Program + USDC mint', () => {
    expect(createSplAssetId(SPL_TOKEN_PROGRAM_ID, USDC_MINT)).toBe(
      `spl-token:${SPL_TOKEN_PROGRAM_ID}:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`,
    )
  })

  it('produces distinct ids for the same mint under the two different token programs', () => {
    const splId = createSplAssetId(SPL_TOKEN_PROGRAM_ID, USDC_MINT)
    const token2022Id = createSplAssetId(TOKEN_2022_PROGRAM_ID, USDC_MINT)
    expect(splId).not.toBe(token2022Id)
  })
})
