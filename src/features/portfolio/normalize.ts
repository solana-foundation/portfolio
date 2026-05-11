import { address } from '@solana/kit'
import nativeSolIcon from '@/assets/native-sol.svg'
import {
  createNativeAssetId,
  createSplAssetId,
  parseTokenProgramId,
} from '@/features/portfolio/asset-identity'
import type {
  DasAsset,
  DasAssetContent,
  DasAssetList,
} from '@/features/portfolio/das-types'
import type {
  PortfolioAsset,
  PortfolioAssetList,
} from '@/features/portfolio/types'

const FUNGIBLE_INTERFACES = new Set(['FungibleToken', 'FungibleAsset'])

/** Truncate a base58 address to `XXXX...YYYY` for display fallbacks. */
function truncateAddress(value: string): string {
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

/**
 * Resolve the best image URL from a DAS asset's `content`. Cascade:
 *
 *   1. `files[]` entry with image-mime — `cdn_uri`
 *   2. `links.image`
 *   3. `files[]` entry with image-mime — `uri`
 *   4. `null`
 *
 * Files without a `mime` field are treated as non-image and skipped — the
 * stricter gate prevents `<img src="…video.mp4">`-style mis-rendering when
 * Metaplex non-image media slips into `files[]`. A future trust-source
 * override plugs in at this seam.
 */
function resolveImageUrl(content: DasAssetContent | undefined): string | null {
  const imageFiles = content?.files?.filter((f) => f.mime?.startsWith('image/'))
  return (
    imageFiles?.find((f) => f.cdn_uri)?.cdn_uri ??
    content?.links?.image ??
    imageFiles?.find((f) => f.uri)?.uri ??
    null
  )
}

/**
 * Normalize a single SPL fungible asset. Returns `null` for silent filter
 * conditions (non-fungible interface, missing or zero balance). Throws on
 * malformed input — invalid base58 mint or missing/unsupported
 * `token_program` — and the per-asset try/catch in `normalizeDasResponse`
 * warns and skips.
 */
function normalizeSplAsset(asset: DasAsset): PortfolioAsset | null {
  if (!FUNGIBLE_INTERFACES.has(asset.interface)) return null

  const tokenInfo = asset.token_info
  if (!tokenInfo || tokenInfo.balance == null || tokenInfo.balance === 0n)
    return null

  // Validates base58; throws if invalid.
  const mint = address(asset.id)
  const truncated = truncateAddress(asset.id)

  const tokenProgram = parseTokenProgramId(tokenInfo.token_program)
  if (tokenProgram === null) {
    throw new Error(
      `Asset ${asset.id} has missing or unsupported token_program`,
    )
  }

  const content = asset.content ?? undefined
  const metadata = content?.metadata

  const symbol = tokenInfo.symbol ?? metadata?.symbol ?? truncated
  const name = metadata?.name ?? truncated
  const imageUrl = resolveImageUrl(content)
  const decimals = tokenInfo.decimals ?? 0

  return {
    kind: 'spl-token',
    id: createSplAssetId(tokenProgram, mint),
    symbol,
    name,
    imageUrl,
    rawBalance: tokenInfo.balance,
    decimals,
    mint,
    tokenProgram,
  }
}

/**
 * Normalize a raw DAS `getAssetsByOwner` response into a PortfolioAssetList.
 *
 * - Native SOL (if `nativeBalance.lamports > 0`) is placed first.
 * - SPL tokens follow in the original DAS order, after filtering out NFTs and
 *   tokens without a balance.
 * - Per-asset failures are caught and logged; the function never throws.
 */
export function normalizeDasResponse(
  response: DasAssetList,
): PortfolioAssetList {
  const items: PortfolioAsset[] = []

  // Native SOL first.
  const nativeBalance = response.nativeBalance
  if (nativeBalance && nativeBalance.lamports > 0n) {
    items.push({
      kind: 'native',
      id: createNativeAssetId(),
      symbol: 'SOL',
      name: 'Solana',
      imageUrl: nativeSolIcon,
      rawBalance: nativeBalance.lamports,
      decimals: 9,
    })
  }

  // SPL tokens preserving original DAS order.
  for (const asset of response.items) {
    try {
      const normalized = normalizeSplAsset(asset)
      if (normalized) items.push(normalized)
    } catch (err) {
      console.warn(`Failed to normalize asset ${asset?.id}`, err)
    }
  }

  return { items, total: items.length }
}
