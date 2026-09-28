export type PlanId = 'pro' | 'max5x'

export interface Plan {
  id: PlanId
  name: string
  priceUsdPerMonth: number
  /** First day on this plan (inclusive, YYYY-MM-DD). */
  start: string
}

/** Ordered by start date. A plan runs until the day before the next plan starts. */
export const PLANS: Plan[] = [
  { id: 'pro', name: 'Pro', priceUsdPerMonth: 20, start: '2026-08-24' },
  { id: 'max5x', name: 'Max 5x', priceUsdPerMonth: 100, start: '2026-09-23' },
]
