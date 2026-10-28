import type { Plan, PlanId } from '../config/plans'
import { sortModels, type DailyRow } from './aggregate'
import type { LedgerDay } from './ledger'

/** One calendar day of the chronicle chart: the ledger day plus its cost per model, in stacking order. */
export interface ChronicleDay extends LedgerDay {
  segments: { model: string; cost: number }[]
}

export function chronicleDays(days: LedgerDay[], rows: DailyRow[], models: string[]): ChronicleDay[] {
  const byDate = new Map(rows.map((r) => [r.date, r]))
  return days.map((d) => {
    const row = byDate.get(d.date)
    const segments = row
      ? models.filter((m) => typeof row[m] === 'number' && (row[m] as number) > 0).map((m) => ({ model: m, cost: row[m] as number }))
      : []
    return { ...d, segments }
  })
}

/** A round axis maximum at or above `value`, and the tick step that divides it into about `ticks` intervals. */
export function niceScale(value: number, ticks = 4): { max: number; step: number; ticks: number[] } {
  if (!(value > 0)) return { max: 1, step: 1, ticks: [0, 1] }
  const raw = value / ticks
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const step = [1, 2, 2.5, 4, 5, 10].map((f) => f * mag).find((s) => s >= raw)!
  const max = Math.ceil(value / step - 1e-9) * step
  const out: number[] = []
  for (let v = 0; v <= max + step / 2; v += step) out.push(Math.round(v * 1000) / 1000)
  return { max, step, ticks: out }
}

export type ChapterId = 'pro' | 'lull' | 'switch' | 'max'

/** Length of the quiet stretch before the switch, in calendar days. */
const LULL_DAYS = 7
/** The switch day and at least this many days after it get the slow dwell. */
const DWELL_AFTER = 3
/** The dwell never runs longer than this many days past the switch, however late the record falls. */
const DWELL_MAX = 7

/** The axis a chart of daily values needs: the first plan's record, its axis, and the axis for the whole period. */
export interface ChartScale {
  /** The highest daily value on the first plan, and the day it was set. */
  record: { value: number; idx: number }
  /** The axis while every bar fits under the first plan's scale, and the axis for the whole period. */
  before: ReturnType<typeof niceScale>
  after: ReturnType<typeof niceScale>
  /** The first day whose bar does not fit the first plan's axis, so the chart has to zoom out; -1 if never. */
  rescaleIdx: number
}

export function chartScale(values: number[], switchIdx: number): ChartScale {
  let record = { value: 0, idx: 0 }
  values.slice(0, switchIdx).forEach((v, idx) => {
    if (v > record.value) record = { value: v, idx }
  })
  const before = niceScale(record.value)
  const rescaleIdx = values.findIndex((v) => v > before.max)
  const after = rescaleIdx < 0 ? before : niceScale(Math.max(0, ...values))
  return { record, before, after, rescaleIdx }
}

export interface Story extends ChartScale {
  /** Index of the first day on the upgraded plan, or `days.length` if the data has not reached it. */
  switchIdx: number
  /** First day of the quiet stretch before the switch. */
  lullStart: number
  /** Last day of the peak dwell (inclusive). */
  dwellEnd: number
}

/** The beats of the chronicle, computed from the plans and the data so they move as usage.json grows. */
export function story(plans: Plan[], days: LedgerDay[]): Story {
  const upgrade = plans[1]
  const n = days.length
  const found = upgrade ? days.findIndex((d) => d.date >= upgrade.start) : -1
  const switchIdx = found < 0 ? n : found

  const scale = chartScale(days.map((d) => d.cost), switchIdx)
  const { rescaleIdx } = scale

  const lullStart = Math.max(1, switchIdx - LULL_DAYS)
  const dwellEnd = Math.min(n - 1, switchIdx + Math.max(DWELL_AFTER, Math.min(DWELL_MAX, rescaleIdx - switchIdx + 1)))
  return { switchIdx, lullStart, dwellEnd, ...scale }
}

export function chapterAt(s: Story, day: number): ChapterId {
  const i = Math.floor(day)
  if (i < s.lullStart) return 'pro'
  if (i < s.switchIdx) return 'lull'
  if (i <= s.dwellEnd) return 'switch'
  return 'max'
}

/** Inclusive day ranges of each chapter, in order; chapters the data has not reached are left out. */
export function chapterRanges(s: Story, n: number): { id: ChapterId; from: number; to: number }[] {
  const ranges: { id: ChapterId; from: number; to: number }[] = [
    { id: 'pro', from: 0, to: s.lullStart - 1 },
    { id: 'lull', from: s.lullStart, to: s.switchIdx - 1 },
    { id: 'switch', from: s.switchIdx, to: s.dwellEnd },
    { id: 'max', from: s.dwellEnd + 1, to: n - 1 },
  ]
  return ranges.map((r) => ({ ...r, to: Math.min(r.to, n - 1) })).filter((r) => r.from <= r.to)
}

/** Scroll weight per day: the quiet stretch slows a little, the switch dwells. */
export const LULL_WEIGHT = 1.3
export const DWELL_WEIGHT = 2.5
/** Days' worth of scroll at the end where the finished chart holds before the pin lets go. */
export const END_HOLD = 1.5

export function dayWeights(s: Story, n: number): number[] {
  return Array.from({ length: n }, (_, i) =>
    i >= s.switchIdx && i <= s.dwellEnd ? DWELL_WEIGHT : i >= s.lullStart && i < s.switchIdx ? LULL_WEIGHT : 1,
  )
}

/**
 * Maps pin progress (0 to 1) to a fractional day index and back. Each day owns a slice of the scroll in
 * proportion to its weight, so the mapping is monotonic and the first day is already printed at 0.
 */
export function scrollMap(weights: number[], endHold = END_HOLD) {
  const n = weights.length
  const cum = [0]
  for (const w of weights) cum.push(cum[cum.length - 1] + w)
  const total = cum[n] + endHold

  function dayAt(p: number): number {
    const u = Math.min(1, Math.max(0, p)) * total
    if (n === 0) return 0
    if (u >= cum[n]) return n - 1
    let i = 0
    while (i < n - 1 && cum[i + 1] <= u) i++
    return Math.min(n - 1, i + (u - cum[i]) / weights[i])
  }

  function progressAt(day: number): number {
    if (n === 0) return 0
    const i = Math.min(n - 1, Math.max(0, Math.floor(day)))
    const frac = Math.min(0.999, Math.max(0, day - i))
    return (cum[i] + frac * weights[i]) / total
  }

  return { dayAt, progressAt }
}

/** Share of each model in the cost of one plan's days up to and including `upTo`, in stacking order. */
export function mixToDate(days: ChronicleDay[], plan: PlanId, upTo: number) {
  const byModel = new Map<string, number>()
  let total = 0
  days.slice(0, Math.floor(upTo) + 1).forEach((d) => {
    if (d.plan !== plan) return
    for (const s of d.segments) {
      byModel.set(s.model, (byModel.get(s.model) ?? 0) + s.cost)
      total += s.cost
    }
  })
  const models = sortModels([...byModel.keys()])
  return { total, shares: models.map((model) => ({ model, share: total ? byModel.get(model)! / total : 0 })) }
}
