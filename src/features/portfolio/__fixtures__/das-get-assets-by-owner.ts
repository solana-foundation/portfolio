/**
 * DAS `getAssetsByOwner` fixtures. Mixed-source:
 * - `fungibleTokenItem` (USDC) and `impersonatorItem` are live-transcribed
 *   from Helius mainnet, including their cdn_uri image URLs.
 * - The remaining fixtures are synthetic. Mints range from real-on-chain
 *   (mSoLzYC… is Marinade mSOL, DezXAZ8z… is BONK) to invented
 *   (`GmAxym41…`, `D4U95uqc…`, `4ohXkT61…`, etc.); URLs are
 *   `example.invalid` where present; balances and metadata are chosen to
 *   exercise specific code paths, not from chain.
 *
 * Image-cascade branch: `fungibleTokenItem` (USDC) and `impersonatorItem`
 * both land in the image-mime `cdn_uri` branch. Integration parity
 * assertions depend on both rows resolving through the same branch.
 *
 * To refresh live items, query Helius getAssetsByOwner on mainnet
 * 5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9 and devnet
 * BoTsCAFmRe35ghBXN18kBz6AdmEJYXwMzDUwZXr4Pa9R, plus getAsset on USDC
 * (EPjFWdd5...), mainnet PYUSD (2b1kV6Dk...), and `Solana·`
 * (JEDuhcjUgxtnpD48Cfcs3FKokRAN6y81GFRvVQiVEaLs).
 *
 * The fixture data lives under `items/` and `responses/`; this file is the
 * stable barrel callers import.
 */
export {
  emptyMetadataItem,
  fungibleMissingTokenProgramItem,
  fungibleTokenBidiName,
  fungibleTokenLongName,
  fungibleTokenNonImageMime,
  fungibleUnknownTokenProgramItem,
  impersonatorItem,
} from './items/edge-cases'
export {
  fungibleAssetItem,
  fungibleTokenItem,
  nftItem,
  noBalanceItem,
  unknownTokenItem,
} from './items/fungible-tokens'
export { nativeBalanceFixture } from './items/native'
export { FIXTURE_OWNER } from './items/owner'
export {
  dasEmptyResponse,
  dasZeroNativeBalanceResponse,
} from './responses/empty'
export {
  dasGetAssetsByOwnerResponse,
  dasNativeAndWrappedSolResponse,
} from './responses/populated'
