import { describe, expect, it } from 'vitest'
import { PLANS } from '../config/plans'
import { dailySeries } from './aggregate'
import { chapterAt, chapterRanges, chronicleDays, dayWeights, mixToDate, niceScale, scrollMap, story } from './chronicle'
import { ledger } from './ledger'
import { usage } from './usage'

const days = ledger(PLANS, usage.daily)
const { rows, models } = dailySeries(PLANS, usage.daily)
const s = story(PLANS, days)
const n = days.length
const weights = dayWeights(s, n)
const map = scrollMap(weights)

describe('niceScale', () => {
  it('rounds up to a step that divides the axis evenly', () => {
    expect(niceScale(68)).toMatchObject({ max: 80, step: 20, ticks: [0, 20, 40, 60, 80] })
    expect(niceScale(150).max).toBe(160)
    expect(niceScale(100).max).toBe(100)
    expect(niceScale(151).max).toBeGreaterThanOrEqual(151)
    expect(niceScale(0.4).max).toBeGreaterThanOrEqual(0.4)
  })
})

describe('story', () => {
  it('finds the switch on the upgraded plan start date', () => {
    expect(days[s.switchIdx].date).toBe(PLANS[1].start)
    expect(days[s.switchIdx - 1].plan).toBe(PLANS[0].id)
  })

  it('takes the record from the first plan only, and rescales once a bar no longer fits', () => {
    const pro = days.filter((d) => d.plan === PLANS[0].id)
    expect(s.record.cost).toBe(Math.max(...pro.map((d) => d.cost)))
    expect(s.before.max).toBeGreaterThanOrEqual(s.record.cost)
    expect(s.rescaleIdx).toBeGreaterThanOrEqual(s.switchIdx)
    expect(days[s.rescaleIdx].cost).toBeGreaterThan(s.before.max)
    expect(days.slice(0, s.rescaleIdx).every((d) => d.cost <= s.before.max)).toBe(true)
    expect(s.after.max).toBeGreaterThanOrEqual(Math.max(...days.map((d) => d.cost)))
  })
})

describe('chapters', () => {
  it('run pro, lull, switch, max in order and cover every day once', () => {
    const ranges = chapterRanges(s, n)
    expect(ranges.map((r) => r.id)).toEqual(['pro', 'lull', 'switch', 'max'])
    expect(ranges[0].from).toBe(0)
    expect(ranges[ranges.length - 1].to).toBe(n - 1)
    ranges.slice(1).forEach((r, i) => expect(r.from).toBe(ranges[i].to + 1))
    for (const r of ranges) {
      expect(chapterAt(s, r.from)).toBe(r.id)
      expect(chapterAt(s, r.to + 0.99)).toBe(r.id)
    }
  })

  it('puts the quiet stretch right before the switch and the dwell on and after it', () => {
    expect(chapterAt(s, s.switchIdx - 1)).toBe('lull')
    expect(chapterAt(s, s.switchIdx)).toBe('switch')
    expect(s.dwellEnd).toBeGreaterThanOrEqual(s.rescaleIdx)
    expect(s.dwellEnd - s.switchIdx).toBeGreaterThanOrEqual(3)
  })
})

describe('scroll map', () => {
  it('covers the first to the last day across 0..1', () => {
    expect(map.dayAt(0)).toBe(0)
    expect(map.dayAt(1)).toBe(n - 1)
    expect(map.dayAt(-1)).toBe(0)
    expect(map.dayAt(2)).toBe(n - 1)
  })

  it('is monotonic', () => {
    let prev = -1
    for (let p = 0; p <= 1; p += 0.001) {
      const d = map.dayAt(p)
      expect(d).toBeGreaterThanOrEqual(prev)
      prev = d
    }
  })

  it('gives the switch region more scroll per day than an ordinary day', () => {
    const per = (i: number) => map.progressAt(i + 1) - map.progressAt(i)
    expect(per(s.switchIdx)).toBeCloseTo(per(1) * 2.5, 6)
    expect(per(s.switchIdx + 2)).toBeGreaterThan(per(1) * 2)
  })

  it('round-trips a day to its scroll position', () => {
    for (let i = 0; i < n; i++) expect(Math.floor(map.dayAt(map.progressAt(i + 0.3)))).toBe(i)
  })
})

describe('mixToDate', () => {
  it('sums to one per plan and only counts days up to the playhead', () => {
    const cd = chronicleDays(days, rows, models)
    const pro = mixToDate(cd, 'pro', n - 1)
    expect(pro.shares.reduce((a, x) => a + x.share, 0)).toBeCloseTo(1, 9)
    expect(mixToDate(cd, 'max5x', s.switchIdx - 1).total).toBe(0)
    expect(mixToDate(cd, 'max5x', n - 1).total).toBeCloseTo(
      days.filter((d) => d.plan === 'max5x').reduce((a, d) => a + d.cost, 0),
      6,
    )
  })
})
