import type { CSSProperties } from 'react'
import type { PlanSummary } from '../lib/aggregate'
import { planColor } from '../lib/colors'
import { useI18n } from '../i18n'
import { useReveal } from '../lib/motion'
import { CountUp } from './CountUp'

/** Each plan's bar starts this much after the one above it. */
const STAGGER_MS = 120
const FILL_MS = 800

export function Hero({ plans }: { plans: PlanSummary[] }) {
  const { t, fmtDate, fmtPct, fmtRatio, fmtUsd } = useI18n()
  const first = plans[0]
  const last = plans[plans.length - 1]
  const ratio = last.costPerActiveDay / first.costPerActiveDay
  const top = Math.max(...plans.map((p) => p.costPerActiveDay))
  const lead = last.modelMix[0]
  const [ref, reveal] = useReveal<HTMLElement>(FILL_MS + STAGGER_MS * plans.length)

  return (
    <header className="hero">
      <p className="hero-kicker">
        {t.hero.kicker(fmtDate(first.from), fmtDate(last.to, { month: 'short', day: 'numeric', year: 'numeric' }))}
      </p>
      <h1>{t.hero.headline(last.plan.name, fmtRatio(ratio), first.plan.name)}</h1>
      <p className="hero-sub">{t.hero.sub(last.plan.name, fmtPct(lead.share), lead.model)}</p>

      <figure ref={ref} className="hero-bars" data-reveal={reveal} aria-label={t.hero.barsLabel}>
        {plans.map((p, i) => (
          <div className="hero-row" key={p.plan.id} style={{ '--delay': `${i * STAGGER_MS}ms` } as CSSProperties}>
            <span className="hero-plan">{p.plan.name}</span>
            <div className="hero-track">
              <div
                className="hero-bar"
                style={{ width: `${(p.costPerActiveDay / top) * 100}%`, background: planColor(p.plan.id) }}
              />
            </div>
            <span className="hero-value">
              <CountUp value={p.costPerActiveDay} format={(n) => fmtUsd(n)} state={reveal} delay={i * STAGGER_MS} duration={FILL_MS} />{' '}
              <small>{t.hero.perActiveDay}</small>
            </span>
          </div>
        ))}
        <figcaption>{t.hero.caption(first.plan.name, first.activeDays, last.plan.name, last.activeDays)}</figcaption>
      </figure>
    </header>
  )
}
