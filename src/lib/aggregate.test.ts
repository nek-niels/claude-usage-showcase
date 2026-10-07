import { describe, expect, it } from 'vitest'
import { PLANS } from '../config/plans'
import { usage } from './usage'
import { assignPlan, dailySeries, prettyModel, proratedPrice, rereadSeries, summarizePlans } from './aggregate'

const summaries = summarizePlans(PLANS, usage.daily)

describe('summarizePlans', () => {
  it('plan totals add up to the export totals', () => {
    const sum = (f: (s: (typeof summaries)[number]) => number) => summaries.reduce((a, s) => a + f(s), 0)
    expect(sum((s) => s.cost)).toBeCloseTo(usage.totals.totalCost, 6)
    expect(sum((s) => s.totalTokens)).toBe(usage.totals.totalTokens)
    expect(sum((s) => s.tokens.outputTokens)).toBe(usage.totals.outputTokens)
    expect(sum((s) => s.tokens.cacheReadTokens)).toBe(usage.totals.cacheReadTokens)
    expect(sum((s) => s.activeDays)).toBe(usage.daily.length)
  })

  it('splits Pro and Max 5x at 2026-09-23', () => {
    const [pro, max] = summaries
    expect(pro.plan.id).toBe('pro')
    expect(pro).toMatchObject({ from: '2026-08-24', to: '2026-09-22', calendarDays: 30, activeDays: 22 })
    expect(max).toMatchObject({ from: '2026-09-23', to: '2026-10-07', calendarDays: 15, activeDays: 11 })
  })

  it('model mix shares sum to 1', () => {
    for (const s of summaries) expect(s.modelMix.reduce((a, m) => a + m.share, 0)).toBeCloseTo(1, 9)
  })
})

describe('assignPlan', () => {
  it('uses the latest plan whose start is on or before the date', () => {
    expect(assignPlan(PLANS, '2026-09-22')).toBe('pro')
    expect(assignPlan(PLANS, '2026-09-23')).toBe('max5x')
    expect(assignPlan(PLANS, '2026-12-01')).toBe('max5x')
  })
})

describe('proratedPrice', () => {
  it('prorates on a 30-day month', () => {
    expect(proratedPrice(PLANS[0], 30)).toBe(20)
    expect(proratedPrice(PLANS[1], 6)).toBe(20)
  })
})

describe('prettyModel', () => {
  it('names known and unknown models', () => {
    expect(prettyModel('claude-opus-5-5')).toBe('Opus 5.5')
    expect(prettyModel('claude-haiku-4-5-20251001')).toBe('Haiku 4.5')
    expect(prettyModel('claude-sonnet-6')).toBe('Sonnet 6')
  })
})

describe('dailySeries', () => {
  it('keeps per-model cost for each day', () => {
    const { rows, models } = dailySeries(PLANS, usage.daily)
    expect(models).toEqual(['Sonnet 5', 'Opus 5', 'Opus 5.5', 'Haiku 4.5', 'Sonnet 5.5'])
    const sep25 = rows.find((r) => r.date === '2026-09-25')!
    expect(sep25.total).toBeCloseTo(100.85, 2)
    expect(sep25.plan).toBe('max5x')
  })
})

describe('re-read ratio', () => {
  it('divides cache reads by output tokens, per plan and per day', () => {
    const [pro, max] = summaries
    expect(pro.rereadPerOutput).toBeCloseTo(144, 0)
    expect(max.rereadPerOutput).toBeCloseTo(181, 0)
    const rows = rereadSeries(PLANS, usage.daily)
    expect(rows).toHaveLength(usage.daily.length)
    expect(rows.find((r) => r.date === '2026-09-24')!.ratio).toBeCloseTo(167401013 / 866569, 6)
  })
})
