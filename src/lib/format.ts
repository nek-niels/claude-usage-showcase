export type Locale = 'en-US' | 'da-DK'

/** Number and date formatters for one locale. Amounts are always USD; only the notation follows the locale. */
export function formatters(locale: Locale) {
  const compact = new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 })
  const oneDecimal = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  const int = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 })
  // Danish compact notation writes thousands as "t", which reads like tonnes ("537,5 t"), so Danish keeps
  // amounts whole and only compacts token counts from a million ("mio.") up.
  const isEnglish = locale === 'en-US'

  const fmtUsd = (n: number, digits = 0) =>
    isEnglish && n >= 10_000
      ? `$${compact.format(n)}`
      : new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: 'USD',
          currencyDisplay: 'narrowSymbol',
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        }).format(n)

  const fmtPct = (n: number) => {
    const digits = n < 0.01 ? 1 : 0
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(n)
  }

  return {
    fmtUsd,
    fmtTokens: (n: number) => (isEnglish || n >= 1_000_000 ? compact.format(n) : int.format(Math.round(n))),
    fmtRatio: (n: number) => `${oneDecimal.format(n)}×`,
    fmtPct,
    fmtInt: (n: number) => int.format(Math.round(n)),
    fmtDate: (iso: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }) =>
      new Date(`${iso}T00:00:00Z`).toLocaleDateString(locale, { ...opts, timeZone: 'UTC' }),
  }
}

export type Formatters = ReturnType<typeof formatters>
