import { describe, expect, it } from 'vitest'
import { PLANS } from '../config/plans'
import { daysBetween, summarizePlans } from './aggregate'
import { ledger } from './ledger'
import { usage } from './usage'

const days = ledger(PLANS, usage.daily)
const dates = usage.daily.map((d) => d.date).sort()

describe('ledger', () => {
  it('has one row per calendar day, days off included', () => {
    expect(days.length).toBe(daysBetween(dates[0], dates[dates.length - 1]))
    expect(days.filter((d) => d.active).length).toBe(usage.daily.length)
    expect(days.filter((d) => !d.active).every((d) => d.cost === 0)).toBe(true)
  })

  it('ends on the export totals and the summed prorated prices', () => {
    const last = days[days.length - 1]
    expect(last.cumCost).toBeCloseTo(usage.totals.totalCost, 6)
    const paid = summarizePlans(PLANS, usage.daily).reduce((a, s) => a + s.proratedPrice, 0)
    expect(last.cumPaid).toBeCloseTo(paid, 6)
  })

  it('switches plan on the plan start date', () => {
    expect(days.find((d) => d.date === '2026-09-22')?.plan).toBe('pro')
    expect(days.find((d) => d.date === '2026-09-23')?.plan).toBe('max5x')
  })
})
