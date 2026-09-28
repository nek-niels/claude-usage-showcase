import type { PlanSummary } from '../lib/aggregate'
import { planColor } from '../lib/colors'
import { useI18n } from '../i18n'

export function PerDayComparison({ plans }: { plans: PlanSummary[] }) {
  const { t, fmtRatio, fmtTokens, fmtUsd } = useI18n()
  const [a, b] = [plans[0], plans[plans.length - 1]]
  const metrics = [
    { title: t.perDay.usage, get: (p: PlanSummary) => p.costPerActiveDay, fmt: (n: number) => fmtUsd(n) },
    { title: t.perDay.tokens, get: (p: PlanSummary) => p.tokensPerActiveDay, fmt: fmtTokens },
    { title: t.perDay.output, get: (p: PlanSummary) => p.outputPerActiveDay, fmt: fmtTokens },
  ]
  return (
    <section aria-labelledby="perday-title">
      <h2 id="perday-title">{t.perDay.title}</h2>
      <p className="lede">{t.perDay.lede(a.plan.name, a.activeDays, b.plan.name, b.activeDays)}</p>
      <div className="multiples">
        {metrics.map((m) => {
          const top = Math.max(...plans.map(m.get))
          return (
            <figure key={m.title} className="multiple">
              <figcaption>
                <span>{m.title}</span>
                <span className="ratio">{fmtRatio(m.get(b) / m.get(a))}</span>
              </figcaption>
              {plans.map((p) => (
                <div className="mini-row" key={p.plan.id}>
                  <span className="mini-label">{p.plan.name}</span>
                  <div className="mini-track">
                    <div
                      className="mini-bar"
                      style={{ width: `${(m.get(p) / top) * 100}%`, background: planColor(p.plan.id) }}
                    />
                  </div>
                  <span className="mini-value">{m.fmt(m.get(p))}</span>
                </div>
              ))}
            </figure>
          )
        })}
      </div>
    </section>
  )
}
