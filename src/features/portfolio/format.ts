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

// C0 controls excluding TAB/LF/CR (those collapse to a regular space below),
// plus DEL + C1, bidi-override block (U+202A-U+202E), bidi-isolate block
// (U+2066-U+2069). Stripping these is the function's explicit job.
// biome-ignore-start lint/suspicious/noControlCharactersInRegex: removing C0/C1 controls is the point
const STRIP_PATTERN =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g
// biome-ignore-end lint/suspicious/noControlCharactersInRegex: removing C0/C1 controls is the point
const WHITESPACE_RUN = /\s+/g
const ELLIPSIS = '…'

// Grapheme segmenter so emoji and combining sequences count as one
// user-visible character when capping length. Lazy because constructing the
// segmenter is mildly expensive and most tests don't truncate.
let graphemeSegmenter: Intl.Segmenter | null = null
function getGraphemeSegmenter(): Intl.Segmenter {
  if (graphemeSegmenter === null) {
    graphemeSegmenter = new Intl.Segmenter(undefined, {
      granularity: 'grapheme',
    })
  }
  return graphemeSegmenter
}

/**
 * Display-time hygiene for token names and symbols. Strips control and bidi
 * characters, collapses whitespace runs, trims, then truncates with a
 * trailing horizontal ellipsis. `maxLength` is the cap on the rendered
 * output in user-visible characters (graphemes), ellipsis included; a
 * 20-char cap produces at most 20 graphemes. `maxLength <= 0` returns an
 * empty string. Homoglyph / NFKC normalization is out of scope — printable
 * confusables (U+00B7 middle-dot, etc.) are preserved so the app tells the
 * truth about what's on chain. Impersonator defense belongs to a
 * trust-source pass.
 */
export function sanitizeDisplayText(
  value: string,
  options?: { maxLength?: number },
): string {
  const cleaned = value
    .replace(STRIP_PATTERN, '')
    .replace(WHITESPACE_RUN, ' ')
    .trim()
  const maxLength = options?.maxLength
  if (maxLength === undefined) return cleaned
  if (maxLength <= 0) return ''
  const graphemes = Array.from(
    getGraphemeSegmenter().segment(cleaned),
    (s) => s.segment,
  )
  if (graphemes.length <= maxLength) return cleaned
  return graphemes.slice(0, maxLength - 1).join('') + ELLIPSIS
}

const MAX_FRACTIONAL_DIGITS = 4
const TRAILING_ZEROS = /0+$/

type LocaleFormatters = {
  whole: Intl.NumberFormat
  decimalSeparator: string
  fractionalByDigits: Map<number, Intl.NumberFormat>
}

// Module-level cache: Intl.NumberFormat construction is expensive and
// formatTokenAmount runs once per row on every render.
const formattersByLocale = new Map<string, LocaleFormatters>()

function getLocaleFormatters(locale: string | undefined): LocaleFormatters {
  const key = locale ?? ''
  let bundle = formattersByLocale.get(key)
  if (bundle) return bundle
  const whole = new Intl.NumberFormat(locale, {
    useGrouping: true,
    maximumFractionDigits: 0,
  })
  const decimalSeparator =
    new Intl.NumberFormat(locale)
      .formatToParts(1.1)
      .find((p) => p.type === 'decimal')?.value ?? '.'
  bundle = {
    whole,
    decimalSeparator,
    fractionalByDigits: new Map<number, Intl.NumberFormat>(),
  }
  formattersByLocale.set(key, bundle)
  return bundle
}

function getFractionalFormatter(
  bundle: LocaleFormatters,
  digits: number,
  locale: string | undefined,
): Intl.NumberFormat {
  let formatter = bundle.fractionalByDigits.get(digits)
  if (formatter) return formatter
  formatter = new Intl.NumberFormat(locale, {
    useGrouping: false,
    minimumIntegerDigits: digits,
    maximumFractionDigits: 0,
  })
  bundle.fractionalByDigits.set(digits, formatter)
  return formatter
}

/**
 * Formats a raw token balance as a grouped decimal string. Truncates (does
 * NOT round) the fractional part to four digits, then strips trailing
 * zeros. Integer grouping, decimal separator, and digit script all come
 * from the supplied locale (defaults to the runtime browser locale);
 * tests pin `en-US` for deterministic assertions.
 *
 * Sub-precision dust (e.g. `formatTokenAmount(1n, 9)`) truncates to `"0"`.
 * Richer dust UX is the dust-handling pass's responsibility, not this
 * function's.
 */
export function formatTokenAmount(
  rawBalance: bigint,
  decimals: number,
  locale?: string,
): string {
  if (rawBalance === 0n) {
    return '0'
  }

  const bundle = getLocaleFormatters(locale)

  if (decimals === 0) {
    return bundle.whole.format(rawBalance)
  }

  const divisor = 10n ** BigInt(decimals)
  const wholePart = rawBalance / divisor
  const fractionalPart = rawBalance % divisor
  const wholeFormatted = bundle.whole.format(wholePart)

  if (fractionalPart === 0n) {
    return wholeFormatted
  }

  const fractionalPadded = fractionalPart.toString().padStart(decimals, '0')
  const truncated = fractionalPadded
    .slice(0, MAX_FRACTIONAL_DIGITS)
    .replace(TRAILING_ZEROS, '')

  if (truncated === '') {
    return wholeFormatted
  }

  const fractionalLocalized = getFractionalFormatter(
    bundle,
    truncated.length,
    locale,
  ).format(BigInt(truncated))

  return `${wholeFormatted}${bundle.decimalSeparator}${fractionalLocalized}`
}

// Issue #6 — USD value, percent change, and price formatters belong here as siblings to formatTokenAmount.
