import type { Plan, PlanId } from '../config/plans'
import type { DailyUsage, TokenCounts } from './usage'

const DAY_MS = 86_400_000
const DAYS_PER_MONTH = 30

export interface PlanSummary {
  plan: Plan
  /** Inclusive calendar range the plan covers within the data. */
  from: string
  to: string
  calendarDays: number
  activeDays: number
  cost: number
  totalTokens: number
  tokens: TokenCounts
  costPerActiveDay: number
  tokensPerActiveDay: number
  outputPerActiveDay: number
  /** Cache-read tokens per output token: how much context is re-read for each token Claude writes. */
  rereadPerOutput: number
  /** Subscription price for the calendar days covered. */
  proratedPrice: number
  /** API-equivalent cost divided by prorated subscription price. */
  valueMultiple: number
  /** Cost per model, largest first. */
  modelMix: { model: string; cost: number; share: number }[]
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS) + 1
}

function addDays(date: string, n: number): string {
  return new Date(Date.parse(date) + n * DAY_MS).toISOString().slice(0, 10)
}

export function assignPlan(plans: Plan[], date: string): PlanId {
  let current = plans[0]
  for (const plan of plans) if (plan.start <= date) current = plan
  return current.id
}

export function proratedPrice(plan: Plan, calendarDays: number): number {
  return (plan.priceUsdPerMonth * calendarDays) / DAYS_PER_MONTH
}

const MODEL_NAMES: Record<string, string> = {
  'claude-opus-5-5': 'Opus 5.5',
  'claude-opus-5': 'Opus 5',
  'claude-sonnet-5': 'Sonnet 5',
  'claude-haiku-4-5-20251001': 'Haiku 4.5',
}

export function prettyModel(id: string): string {
  if (MODEL_NAMES[id]) return MODEL_NAMES[id]
  const m = id.match(/^claude-([a-z]+)-(\d+)(?:-(\d+))?/)
  if (!m) return id
  const family = m[1][0].toUpperCase() + m[1].slice(1)
  return m[3] && m[3].length <= 2 ? `${family} ${m[2]}.${m[3]}` : `${family} ${m[2]}`
}

export function summarizePlans(plans: Plan[], daily: DailyUsage[]): PlanSummary[] {
  const sorted = [...daily].sort((a, b) => a.date.localeCompare(b.date))
  const lastDate = sorted[sorted.length - 1].date

  return plans.flatMap((plan, i) => {
    const next = plans[i + 1]
    const from = plan.start
    const to = next ? addDays(next.start, -1) : lastDate
    const days = sorted.filter((d) => assignPlan(plans, d.date) === plan.id)
    if (days.length === 0) return []

    const sum = (f: (d: DailyUsage) => number) => days.reduce((a, d) => a + f(d), 0)
    const cost = sum((d) => d.totalCost)
    const totalTokens = sum((d) => d.totalTokens)
    const calendarDays = daysBetween(from, to)
    const price = proratedPrice(plan, calendarDays)

    const byModel = new Map<string, number>()
    for (const d of days)
      for (const b of d.modelBreakdowns)
        byModel.set(prettyModel(b.modelName), (byModel.get(prettyModel(b.modelName)) ?? 0) + b.cost)

    return [
      {
        plan,
        from,
        to,
        calendarDays,
        activeDays: days.length,
        cost,
        totalTokens,
        tokens: {
          inputTokens: sum((d) => d.inputTokens),
          outputTokens: sum((d) => d.outputTokens),
          cacheCreationTokens: sum((d) => d.cacheCreationTokens),
          cacheReadTokens: sum((d) => d.cacheReadTokens),
        },
        costPerActiveDay: cost / days.length,
        tokensPerActiveDay: totalTokens / days.length,
        outputPerActiveDay: sum((d) => d.outputTokens) / days.length,
        rereadPerOutput: sum((d) => d.cacheReadTokens) / sum((d) => d.outputTokens),
        proratedPrice: price,
        valueMultiple: cost / price,
        modelMix: [...byModel]
          .map(([model, c]) => ({ model, cost: c, share: c / cost }))
          .sort((a, b) => b.cost - a.cost),
      },
    ]
  })
}

export interface DailyRow {
  date: string
  plan: PlanId
  total: number
  /** Cost per pretty model name. */
  [model: string]: number | string
}

export function dailySeries(plans: Plan[], daily: DailyUsage[]): { rows: DailyRow[]; models: string[] } {
  const models = new Set<string>()
  const rows = [...daily]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => {
      const row: DailyRow = { date: d.date, plan: assignPlan(plans, d.date), total: d.totalCost }
      for (const b of d.modelBreakdowns) {
        const name = prettyModel(b.modelName)
        models.add(name)
        row[name] = ((row[name] as number | undefined) ?? 0) + b.cost
      }
      return row
    })
  return { rows, models: sortModels([...models]) }
}

export interface RereadRow {
  date: string
  plan: PlanId
  ratio: number
}

export function rereadSeries(plans: Plan[], daily: DailyUsage[]): RereadRow[] {
  return [...daily]
    .filter((d) => d.outputTokens > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({ date: d.date, plan: assignPlan(plans, d.date), ratio: d.cacheReadTokens / d.outputTokens }))
}

/** Stable model order for colour assignment: by first appearance in a fixed list, unknowns last. */
const MODEL_ORDER = ['Sonnet 5', 'Opus 5', 'Opus 5.5', 'Haiku 4.5']
export function sortModels(models: string[]): string[] {
  const rank = (m: string) => (MODEL_ORDER.indexOf(m) + 1 || 99)
  return [...models].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
}
