import { describe, expect, it } from 'vitest'
import {
  firstGraphemes,
  formatBalance,
  formatTokenAmount,
  sanitizeDisplayText,
} from '@/features/portfolio'
import { unknownTokenItem } from '@/features/portfolio/__fixtures__/das-get-assets-by-owner'

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

describe('sanitizeDisplayText', () => {
  it('returns an empty string unchanged', () => {
    expect(sanitizeDisplayText('')).toBe('')
  })

  it('returns ordinary text unchanged', () => {
    expect(sanitizeDisplayText('USDC')).toBe('USDC')
  })

  it('strips C0 control characters (U+0000-U+001F)', () => {
    expect(sanitizeDisplayText('Safe\u0001Text')).toBe('SafeText')
    expect(sanitizeDisplayText('Safe\u001FText')).toBe('SafeText')
    expect(sanitizeDisplayText('Safe\u0007Text')).toBe('SafeText')
  })

  it('strips DEL and C1 control characters (U+007F-U+009F)', () => {
    expect(sanitizeDisplayText('Safe\u007FText')).toBe('SafeText')
    expect(sanitizeDisplayText('Safe\u0080Text')).toBe('SafeText')
    expect(sanitizeDisplayText('Safe\u009FText')).toBe('SafeText')
  })

  it('strips bidi override characters in the U+202A-U+202E block', () => {
    expect(sanitizeDisplayText('Safe\u202EBidi')).toBe('SafeBidi')
    expect(sanitizeDisplayText('Safe\u202ABidi')).toBe('SafeBidi')
  })

  it('strips bidi isolate characters in the U+2066-U+2069 block', () => {
    expect(sanitizeDisplayText('Safe\u2066Bidi')).toBe('SafeBidi')
    expect(sanitizeDisplayText('Safe\u2069Bidi')).toBe('SafeBidi')
  })

  it('collapses runs of whitespace (newlines, tabs, spaces) to a single space', () => {
    expect(sanitizeDisplayText('foo\n\nbar')).toBe('foo bar')
    expect(sanitizeDisplayText('foo\t\tbar')).toBe('foo bar')
    expect(sanitizeDisplayText('foo   bar')).toBe('foo bar')
    expect(sanitizeDisplayText('foo \r\n\tbar')).toBe('foo bar')
  })

  it('trims leading and trailing whitespace after collapse', () => {
    expect(sanitizeDisplayText('   foo   ')).toBe('foo')
    expect(sanitizeDisplayText('\t\nfoo\n\t')).toBe('foo')
  })

  it('truncates to a maxLength total length (ellipsis included)', () => {
    // maxLength = 4 → output is at most 4 characters: 3 content chars + …
    const result = sanitizeDisplayText('abcdef', { maxLength: 4 })
    expect(result).toBe('abc…')
    expect(result.length).toBe(4)
  })

  it('does not truncate when length is at or below maxLength', () => {
    expect(sanitizeDisplayText('abcd', { maxLength: 4 })).toBe('abcd')
    expect(sanitizeDisplayText('abc', { maxLength: 4 })).toBe('abc')
  })

  it('counts emoji as a single grapheme when truncating', () => {
    // '💎abc' is 4 graphemes (the diamond is one grapheme that spans two
    // UTF-16 code units). maxLength is the grapheme cap including the
    // ellipsis, so 4 graphemes capped to 3 → diamond + 'a' + '…'.
    expect(sanitizeDisplayText('💎abc', { maxLength: 3 })).toBe('💎a…')
    expect(sanitizeDisplayText('💎a', { maxLength: 3 })).toBe('💎a')
  })

  it('returns "" when maxLength is 0 or negative (cap honored)', () => {
    expect(sanitizeDisplayText('abc', { maxLength: 0 })).toBe('')
    expect(sanitizeDisplayText('abc', { maxLength: -1 })).toBe('')
  })

  it('preserves the Unicode middle-dot U+00B7 (impersonator stays honest)', () => {
    expect(sanitizeDisplayText('Solana·')).toBe('Solana·')
  })

  it('preserves non-Latin scripts (Cyrillic, Japanese)', () => {
    expect(sanitizeDisplayText('Бонк')).toBe('Бонк')
    expect(sanitizeDisplayText('ボンク')).toBe('ボンク')
  })
})

describe('formatTokenAmount', () => {
  it('returns "0" for zero balance', () => {
    expect(formatTokenAmount(0n, 6, 'en-US')).toBe('0')
  })

  it('groups thousands when decimals = 0', () => {
    expect(formatTokenAmount(1_000_000n, 0, 'en-US')).toBe('1,000,000')
  })

  it('truncates the fractional part to 4 digits without rounding', () => {
    // 123.456789 → truncated to 4 fractional digits = "123.4567"
    expect(formatTokenAmount(123_456_789n, 6, 'en-US')).toBe('123.4567')
  })

  it('still truncates (does not round) at the boundary', () => {
    // 123.456799 → truncated to "123.4567", NOT rounded to "123.4568"
    expect(formatTokenAmount(123_456_799n, 6, 'en-US')).toBe('123.4567')
  })

  it('strips trailing zeros from the fractional part', () => {
    expect(formatTokenAmount(2_500_000n, 6, 'en-US')).toBe('2.5')
  })

  it('drops the decimal point when the fractional part collapses to zero', () => {
    expect(formatTokenAmount(1_000_000n, 6, 'en-US')).toBe('1')
  })

  it('groups the integer part for large fractional balances', () => {
    // 1,234.5678
    expect(formatTokenAmount(1_234_567_800n, 6, 'en-US')).toBe('1,234.5678')
  })

  it('handles bigints beyond Number.MAX_SAFE_INTEGER without precision loss', () => {
    const result = formatTokenAmount(
      unknownTokenItem.token_info.balance,
      5,
      'en-US',
    )
    // 9,314,309,076,870,502,293 lamports / 10^5 = 93,143,090,768,705.02293
    // → integer part grouped, fractional truncated to 4 digits then trailing zero stripped
    expect(result).toBe('93,143,090,768,705.0229')
  })

  it('runs without throwing when locale is omitted (browser default)', () => {
    expect(() => formatTokenAmount(123_456_789n, 6)).not.toThrow()
  })

  it('uses the locale-specific decimal separator (de-DE: comma decimal, period grouping)', () => {
    // 1,234.5678 in en-US becomes 1.234,5678 in de-DE
    expect(formatTokenAmount(1_234_567_800n, 6, 'de-DE')).toBe('1.234,5678')
  })

  it('localizes both integer and fractional digit scripts (ar-EG: Eastern Arabic)', () => {
    // ar-EG uses Eastern Arabic numerals plus U+066C ARABIC THOUSANDS
    // SEPARATOR and U+066B ARABIC DECIMAL SEPARATOR. Locks that the
    // fractional digits get the same digit script as the integer part —
    // a regression target if the implementation ever falls back to ASCII
    // fractional digits.
    expect(formatTokenAmount(1_234_567_800n, 6, 'ar-EG')).toBe('١٬٢٣٤٫٥٦٧٨')
  })

  it('returns "0" for sub-precision dust (truncates the fractional part to four digits before stripping zeros)', () => {
    // 1n with decimals 9 = 0.000000001 → truncated to 4 fractional digits =
    // "0.0000" → trailing zeros stripped → "0". Locked here so the dust
    // outcome is intentional; richer dust UX (e.g. "<0.0001") is owned by
    // the dust-handling pass.
    expect(formatTokenAmount(1n, 9, 'en-US')).toBe('0')
  })
})

describe('firstGraphemes', () => {
  it('returns the first N ASCII characters', () => {
    expect(firstGraphemes('USDC', 2)).toBe('US')
  })

  it('counts in graphemes, not UTF-16 code units', () => {
    // '🚀' is one grapheme that spans two UTF-16 code units, so
    // '🚀TKN'.slice(0, 2) returns the rocket alone. firstGraphemes counts
    // in graphemes and returns the rocket plus 'T'.
    expect(firstGraphemes('🚀TKN', 2)).toBe('🚀T')
  })

  it('returns the empty string for count <= 0', () => {
    expect(firstGraphemes('USDC', 0)).toBe('')
    expect(firstGraphemes('USDC', -1)).toBe('')
  })

  it('returns the whole string when count exceeds the grapheme count', () => {
    expect(firstGraphemes('US', 10)).toBe('US')
  })

  it('returns the empty string for empty input', () => {
    expect(firstGraphemes('', 5)).toBe('')
  })
})
