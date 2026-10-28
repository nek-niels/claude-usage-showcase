import type { Plan, PlanId } from '../config/plans'
import { assignPlan, proratedPrice } from './aggregate'
import type { DailyUsage, TokenCounts } from './usage'

const DAY_MS = 86_400_000

/** One calendar day of the running ledger, days off included. */
export interface LedgerDay {
  date: string
  plan: PlanId
  /** Whether Claude Code was used that day. */
  active: boolean
  /** API-equivalent usage that day, 0 on days off. */
  cost: number
  /** Tokens by kind that day, all 0 on days off. */
  tokens: TokenCounts
  /** API-equivalent usage from the first day up to and including this one. */
  cumCost: number
  /** Subscription paid from the first day up to and including this one, prorated per calendar day. */
  cumPaid: number
}

/** Every calendar day from the first to the last day in the data, with running totals. */
export function ledger(plans: Plan[], daily: DailyUsage[]): LedgerDay[] {
  const byDate = new Map(daily.map((d) => [d.date, d]))
  const dates = [...byDate.keys()].sort()
  if (dates.length === 0) return []
  const first = Date.parse(dates[0])
  const last = Date.parse(dates[dates.length - 1])

  const days: LedgerDay[] = []
  let cumCost = 0
  let cumPaid = 0
  for (let t = first; t <= last; t += DAY_MS) {
    const date = new Date(t).toISOString().slice(0, 10)
    const plan = assignPlan(plans, date)
    const row = byDate.get(date)
    const cost = row?.totalCost ?? 0
    const tokens = {
      inputTokens: row?.inputTokens ?? 0,
      outputTokens: row?.outputTokens ?? 0,
      cacheCreationTokens: row?.cacheCreationTokens ?? 0,
      cacheReadTokens: row?.cacheReadTokens ?? 0,
    }
    cumCost += cost
    cumPaid += proratedPrice(plans.find((p) => p.id === plan)!, 1)
    days.push({ date, plan, active: !!row, cost, tokens, cumCost, cumPaid })
  }
  return days
}
