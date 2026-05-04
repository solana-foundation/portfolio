/**
 * Populated `getAssetsByOwner` responses: the realistic mixed-type capture and
 * the synthetic native-vs-wrapped-SOL collision used by the route-level
 * duplicate-key assertion.
 */
import {
  fungibleTokenBidiName,
  fungibleTokenLongName,
  impersonatorItem,
} from '../items/edge-cases'
import {
  fungibleAssetItem,
  fungibleTokenItem,
  nftItem,
  noBalanceItem,
  unknownTokenItem,
} from '../items/fungible-tokens'
import { nativeBalanceFixture } from '../items/native'
import { FIXTURE_OWNER } from '../items/owner'

/**
 * Realistic `getAssetsByOwner` response with mixed asset types and native
 * balance. Includes the impersonator and the bidi / long-name sanitization
 * cases so route-level tests exercise them through the rendered table. The
 * non-image-mime defensive case stays out of this response and is consumed as
 * a standalone export by targeted unit tests.
 */
export const dasGetAssetsByOwnerResponse = {
  total: 8,
  limit: 1000,
  page: 1,
  items: [
    fungibleTokenItem,
    fungibleAssetItem,
    nftItem,
    unknownTokenItem,
    noBalanceItem,
    fungibleTokenBidiName,
    fungibleTokenLongName,
    impersonatorItem,
  ],
  nativeBalance: nativeBalanceFixture,
}

/**
 * Synthetic display fixture exercising the native + wSOL collision: the
 * wallet holds both native SOL and the wrapped-SOL SPL token, which share
 * the canonical `So11...112` mint and (per Metaplex convention) the symbol
 * 'SOL'. Visual disambiguation in the route-level test is by row count and
 * a duplicate-key spy, not by distinct symbol text.
 */
export const dasNativeAndWrappedSolResponse = {
  total: 1,
  limit: 1000,
  page: 1,
  items: [
    {
      interface: 'FungibleToken',
      id: 'So11111111111111111111111111111111111111112',
      content: {
        metadata: {
          name: 'Wrapped SOL',
          symbol: 'SOL',
        },
      },
      ownership: {
        owner: FIXTURE_OWNER,
      },
      token_info: {
        symbol: 'SOL',
        balance: 1_500_000_000n,
        decimals: 9,
        token_program: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      },
    },
  ],
  nativeBalance: {
    lamports: 2_000_000_000n,
    price_per_sol: 82.0,
    total_price: 164.0,
  },
}
