import { describe, expect, it } from 'vitest'
import { formatters } from './format'

// Intl separates numbers from units with a no-break space; normalise it so expectations stay readable.
const plain = (s: string) => s.replace(/[  ]/g, ' ')

describe('formatters', () => {
  const en = formatters('en-US')
  const da = formatters('da-DK')

  it('formats USD with a leading $ in English and a trailing $ in Danish', () => {
    expect(en.fmtUsd(1234)).toBe('$1,234')
    expect(en.fmtUsd(12.5, 2)).toBe('$12.50')
    expect(en.fmtUsd(12_345)).toBe('$12.3K')
    expect(plain(da.fmtUsd(1234))).toBe('1.234 $')
    expect(plain(da.fmtUsd(12.5, 2))).toBe('12,50 $')
    expect(plain(da.fmtUsd(12_345))).toBe('12.345 $')
  })

  it('formats token counts compactly, except Danish counts under a million', () => {
    expect(en.fmtTokens(1_234_567)).toBe('1.2M')
    expect(en.fmtTokens(2_300_000_000)).toBe('2.3B')
    expect(en.fmtTokens(537_482)).toBe('537.5K')
    expect(da.fmtTokens(537_482)).toBe('537.482')
    expect(plain(da.fmtTokens(1_234_567))).toBe('1,2 mio.')
    expect(plain(da.fmtTokens(2_300_000_000))).toBe('2,3 mia.')
  })

  it('formats ratios, percentages and integers', () => {
    expect(en.fmtRatio(2.345)).toBe('2.3×')
    expect(da.fmtRatio(2.345)).toBe('2,3×')
    expect(en.fmtPct(0.456)).toBe('46%')
    expect(en.fmtPct(0.0042)).toBe('0.4%')
    expect(plain(da.fmtPct(0.456))).toBe('46 %')
    expect(plain(da.fmtPct(0.0042))).toBe('0,4 %')
    expect(en.fmtInt(1234.4)).toBe('1,234')
    expect(da.fmtInt(1234.4)).toBe('1.234')
  })

  it('formats dates in the locale, always in UTC', () => {
    expect(en.fmtDate('2026-09-23')).toBe('Sep 23')
    expect(da.fmtDate('2026-09-23')).toBe('23. sep.')
    expect(en.fmtDate('2026-09-23', { weekday: 'short', month: 'short', day: 'numeric' })).toBe('Wed, Sep 23')
    expect(da.fmtDate('2026-09-23', { weekday: 'short', month: 'short', day: 'numeric' })).toBe('ons. 23. sep.')
  })
})
