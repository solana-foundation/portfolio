import { describe, expect, it } from 'vitest'
import { formatBalance } from '@/features/portfolio'

describe('formatBalance', () => {
  it('converts lamports to SOL with fractional part', () => {
    expect(formatBalance(1_500_000_000n, 9)).toBe('1.5')
  })

  it('converts USDC smallest units to whole number', () => {
    expect(formatBalance(50_000_000n, 6)).toBe('50')
  })

  it('returns "0" for zero balance', () => {
    expect(formatBalance(0n, 9)).toBe('0')
  })

  it('handles the smallest possible fractional amount', () => {
    expect(formatBalance(1n, 9)).toBe('0.000000001')
  })

  it('does not include trailing zeros', () => {
    // 1.5 SOL, not "1.500000000"
    const result = formatBalance(1_500_000_000n, 9)
    expect(result).toBe('1.5')
    expect(result).not.toMatch(/0$/)
  })

  it('handles decimals = 0 by returning the raw number as string', () => {
    expect(formatBalance(42n, 0)).toBe('42')
  })

  it('handles a whole number balance with no fractional part', () => {
    // Exactly 1 SOL
    expect(formatBalance(1_000_000_000n, 9)).toBe('1')
  })

  it('handles large balances correctly', () => {
    // 1,000,000 SOL
    expect(formatBalance(1_000_000_000_000_000n, 9)).toBe('1000000')
  })

  it('handles fractional-only amounts (less than 1 whole unit)', () => {
    // 0.5 SOL
    expect(formatBalance(500_000_000n, 9)).toBe('0.5')
  })

  it('handles USDC fractional amounts', () => {
    // 0.01 USDC
    expect(formatBalance(10_000n, 6)).toBe('0.01')
  })

  it('returns a string type', () => {
    const result = formatBalance(100n, 2)
    expect(typeof result).toBe('string')
  })
})
