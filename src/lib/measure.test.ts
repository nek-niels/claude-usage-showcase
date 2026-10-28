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
const ms = measures({ t: en, ...formatters('en-US') }, cdays, models, s)

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

  it('read 0 for a part a day does not have', () => {
    const off = cdays.find((d) => !d.active)!
    expect(ms.cost.value(off, models[0])).toBe(0)
    expect(ms.tokens.value(off, 'outputTokens')).toBe(0)
  })

  it('keep the story scale for cost, and give tokens their own with the same switch day', () => {
    expect(ms.cost.scale).toBe(s)
    expect(ms.tokens.scale.record.idx).toBeLessThan(s.switchIdx)
    expect(ms.tokens.scale.after.max).toBeGreaterThanOrEqual(Math.max(...cdays.map(ms.tokens.total)))
  })
})
