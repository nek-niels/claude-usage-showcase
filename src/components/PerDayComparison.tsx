import type { CSSProperties } from 'react'
import type { PlanSummary } from '../lib/aggregate'
import { planColor } from '../lib/colors'
import { useI18n } from '../i18n'
import { useReveal } from '../lib/motion'
import { CountUp } from './CountUp'

const FIGURE_STAGGER_MS = 80
const ROW_STAGGER_MS = 100
const FILL_MS = 700

export function PerDayComparison({ plans }: { plans: PlanSummary[] }) {
  const { t, fmtRatio, fmtTokens, fmtUsd } = useI18n()
  const [a, b] = [plans[0], plans[plans.length - 1]]
  const metrics = [
    { title: t.perDay.usage, get: (p: PlanSummary) => p.costPerActiveDay, fmt: (n: number) => fmtUsd(n) },
    { title: t.perDay.tokens, get: (p: PlanSummary) => p.tokensPerActiveDay, fmt: fmtTokens },
    { title: t.perDay.output, get: (p: PlanSummary) => p.outputPerActiveDay, fmt: fmtTokens },
  ]
  const [ref, reveal] = useReveal<HTMLDivElement>(
    FILL_MS + FIGURE_STAGGER_MS * metrics.length + ROW_STAGGER_MS * plans.length,
  )
  return (
    <section aria-labelledby="perday-title">
      <h2 id="perday-title">{t.perDay.title}</h2>
      <p className="lede">{t.perDay.lede(a.plan.name, a.activeDays, b.plan.name, b.activeDays)}</p>
      <div ref={ref} className="multiples" data-reveal={reveal}>
        {metrics.map((m, i) => {
          const top = Math.max(...plans.map(m.get))
          const figureDelay = i * FIGURE_STAGGER_MS
          // The ratio counts up from 1.0×, "the same as before", while the second bar fills.
          const ratioDelay = figureDelay + ROW_STAGGER_MS * (plans.length - 1)
          return (
            <figure key={m.title} className="multiple">
              <figcaption>
                <span>{m.title}</span>
                <span className="ratio">
                  <CountUp value={m.get(b) / m.get(a)} from={1} format={fmtRatio} state={reveal} delay={ratioDelay} duration={FILL_MS} />
                </span>
              </figcaption>
              {plans.map((p, j) => {
                const delay = figureDelay + j * ROW_STAGGER_MS
                return (
                  <div className="mini-row" key={p.plan.id} style={{ '--delay': `${delay}ms` } as CSSProperties}>
                    <span className="mini-label">{p.plan.name}</span>
                    <div className="mini-track">
                      <div
                        className="mini-bar"
                        style={{ width: `${(m.get(p) / top) * 100}%`, background: planColor(p.plan.id) }}
                      />
                    </div>
                    <span className="mini-value">
                      <CountUp value={m.get(p)} format={m.fmt} state={reveal} delay={delay} duration={FILL_MS} />
                    </span>
                  </div>
                )
              })}
            </figure>
          )
        })}
      </div>
    </section>
  )
}
