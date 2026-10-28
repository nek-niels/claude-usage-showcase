import { describe, expect, it } from 'vitest'
import { PLANS } from '../config/plans'
import { en } from '../i18n/en'
import { dailySeries } from './aggregate'
import { chronicleDays, story } from './chronicle'
import { formatters } from './format'
import { ledger } from './ledger'
import { measures, UNITS } from './measure'
import { TOKEN_KINDS } from './tokenKinds'
import { usage } from './usage'

const days = ledger(PLANS, usage.daily)
const { rows, models } = dailySeries(PLANS, usage.daily)
const cdays = chronicleDays(days, rows, models)
const s = story(PLANS, days)
const ms = measures({ ...formatters('en-US'), kindNames: en.tokens }, cdays, models, s)

describe('measures', () => {
  it('stack each active day into parts that sum to its total, and leave days off empty', () => {
    for (const u of UNITS)
      for (const d of cdays) {
        const parts = ms[u].parts(d)
        if (!d.active) expect(parts).toEqual([])
        else expect(parts.reduce((a, p) => a + p.value, 0)).toBeCloseTo(ms[u].total(d), 6)
      }
  })

  it('stack in series order, the order of the legend and the table', () => {
    expect(ms.cost.series.map((p) => p.key)).toEqual(models)
    expect(ms.tokens.series.map((p) => p.key)).toEqual(TOKEN_KINDS.map((k) => k.key))
    for (const u of UNITS)
      for (const d of cdays) {
        const keys = ms[u].series.map((p) => p.key)
        const order = ms[u].parts(d).map((p) => keys.indexOf(p.key))
        expect(order).toEqual([...order].sort((a, b) => a - b))
      }
  })

  it('give every day a cell per series part, 0 where the day has none of it', () => {
    const off = cdays.find((d) => !d.active)!
    for (const u of UNITS) {
      expect(ms[u].cells(off).map((c) => c.key)).toEqual(ms[u].series.map((p) => p.key))
      expect(ms[u].cells(off).every((c) => c.value === 0)).toBe(true)
    }
  })

  it('name token parts by their field, so a misspelt one does not compile', () => {
    // @ts-expect-error 'outputToken' is not a token field; `npm run build` type-checks this file.
    const typo: (typeof ms.tokens.series)[number]['key'] = 'outputToken'
    expect(ms.tokens.series.map((p) => p.key)).not.toContain(typo)
  })

  it('keep the story scale for cost, and give tokens their own with the same switch day', () => {
    expect(ms.cost.scale).toBe(s)
    expect(ms.tokens.scale.record.idx).toBeLessThan(s.switchIdx)
    expect(ms.tokens.scale.after.max).toBeGreaterThanOrEqual(Math.max(...cdays.map(ms.tokens.total)))
  })
})
