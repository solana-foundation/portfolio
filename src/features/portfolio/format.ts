/**
 * Formats a raw token balance into a human-readable decimal string.
 *
 * - Divides `rawBalance` by `10^decimals` and returns the decimal string
 * - No trailing zeros beyond what's significant
 * - Returns `"0"` for zero balance
 * - Handles decimals = 0 by returning the raw number as string
 */
export function formatBalance(rawBalance: bigint, decimals: number): string {
  if (rawBalance === 0n) {
    return '0'
  }

  if (decimals === 0) {
    return rawBalance.toString()
  }

  const divisor = 10n ** BigInt(decimals)
  const wholePart = rawBalance / divisor
  const fractionalPart = rawBalance % divisor

  if (fractionalPart === 0n) {
    return wholePart.toString()
  }

  // Pad fractional part with leading zeros to match `decimals` length
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
  // Remove trailing zeros
  const trimmed = fractionalStr.replace(/0+$/, '')

  return `${wholePart.toString()}.${trimmed}`
}
