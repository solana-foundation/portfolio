import { address } from '@solana/kit'
import type { DasAsset, DasAssetList } from '@/features/portfolio/das-types'
import type {
  PortfolioAsset,
  PortfolioAssetList,
} from '@/features/portfolio/types'

const SOL_MINT = 'So11111111111111111111111111111111111111112'
const FUNGIBLE_INTERFACES = new Set(['FungibleToken', 'FungibleAsset'])

/** Truncate a base58 address to `XXXX...YYYY` for display fallbacks. */
function truncateAddress(value: string): string {
  if (value.length <= 8) return value
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

/** Normalize a single SPL fungible asset. Throws on invalid address; caller catches. */
function normalizeSplAsset(asset: DasAsset): PortfolioAsset | null {
  if (!FUNGIBLE_INTERFACES.has(asset.interface)) return null

  const tokenInfo = asset.token_info
  if (!tokenInfo || tokenInfo.balance == null || tokenInfo.balance === 0)
    return null

  // Validates base58; throws if invalid.
  const mint = address(asset.id)
  const truncated = truncateAddress(asset.id)

  const content = asset.content ?? undefined
  const metadata = content?.metadata
  const links = content?.links
  const files = content?.files

  const symbol = tokenInfo.symbol ?? metadata?.symbol ?? truncated
  const name = metadata?.name ?? truncated
  const imageUrl = links?.image ?? files?.[0]?.uri ?? null
  const decimals = tokenInfo.decimals ?? 0

  return {
    mint,
    symbol,
    name,
    imageUrl,
    rawBalance: BigInt(tokenInfo.balance),
    decimals,
    kind: 'spl-token',
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
  if (nativeBalance && nativeBalance.lamports > 0) {
    try {
      items.push({
        mint: address(SOL_MINT),
        symbol: 'SOL',
        name: 'Solana',
        imageUrl: null,
        rawBalance: BigInt(nativeBalance.lamports),
        decimals: 9,
        kind: 'native',
      })
    } catch (err) {
      console.warn('Failed to normalize native SOL balance', err)
    }
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
