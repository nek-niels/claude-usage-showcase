import type { CSSProperties } from 'react'
import type { PlanSummary } from '../lib/aggregate'
import { planColor } from '../lib/colors'
import { useI18n } from '../i18n'
import { useReveal } from '../lib/motion'
import { CountUp } from './CountUp'
import '../styles/inside.css'

/** Columns arrive left to right, the second plan's row a beat after the first. */
const COLUMN_STAGGER_MS = 70
const ROW_STAGGER_MS = 120
const COUNT_MS = 1400

/**
 * An average day: the key figures box of a finance page, without the box. Three figure columns split by
 * vertical hairlines, each led by the multiple between the plans and backed by both plans' values and bars.
 */
export function PerDayComparison({ plans }: { plans: PlanSummary[] }) {
  const { t, fmtRatio, fmtTokens, fmtUsd } = useI18n()
  const [a, b] = [plans[0], plans[plans.length - 1]]
  const metrics = [
    { title: t.perDay.usage, get: (p: PlanSummary) => p.costPerActiveDay, fmt: (n: number) => fmtUsd(n) },
    { title: t.perDay.tokens, get: (p: PlanSummary) => p.tokensPerActiveDay, fmt: fmtTokens },
    { title: t.perDay.output, get: (p: PlanSummary) => p.outputPerActiveDay, fmt: fmtTokens },
  ]
  const [ref, reveal] = useReveal<HTMLDivElement>(
    COUNT_MS + COLUMN_STAGGER_MS * metrics.length + ROW_STAGGER_MS * plans.length,
  )

  return (
    <section id="average-day" className="inside avg-day" data-sc-act="flow" aria-labelledby="average-day-title">
      <p className="inside-kicker">{t.perDay.kicker}</p>
      <h2 id="average-day-title" className="inside-head">
        {t.perDay.title(a.plan.name, b.plan.name)}
      </h2>
      <p className="inside-standfirst">{t.perDay.lede(a.plan.name, a.activeDays, b.plan.name, b.activeDays)}</p>

      <div ref={ref} className="avg-figures" data-reveal={reveal}>
        {metrics.map((m, i) => {
          const top = Math.max(...plans.map(m.get))
          const columnDelay = i * COLUMN_STAGGER_MS
          return (
            <figure key={m.title} className="avg-col" style={{ '--delay': `${columnDelay}ms` } as CSSProperties}>
              <figcaption className="avg-label">{m.title}</figcaption>
              <p className="avg-ratio">
                {/* Counts up from 1.0×, "the same as before". */}
                <CountUp value={m.get(b) / m.get(a)} from={1} format={fmtRatio} state={reveal} delay={columnDelay} duration={COUNT_MS} />
              </p>
              <p className="avg-note">{t.perDay.ratioNote(b.plan.name, a.plan.name)}</p>
              <dl className="avg-rows">
                {plans.map((p, j) => {
                  const delay = columnDelay + j * ROW_STAGGER_MS
                  return (
                    <div className="avg-row" key={p.plan.id} style={{ '--delay': `${delay}ms` } as CSSProperties}>
                      <dt>{p.plan.name}</dt>
                      <dd className="avg-value">
                        <CountUp value={m.get(p)} format={m.fmt} state={reveal} delay={delay} duration={COUNT_MS} />
                      </dd>
                      <dd className="avg-track" aria-hidden="true">
                        <span
                          className="avg-bar"
                          style={{ width: `${(m.get(p) / top) * 100}%`, background: planColor(p.plan.id) }}
                        />
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </figure>
          )
        })}
      </div>
    </section>
  )
}
