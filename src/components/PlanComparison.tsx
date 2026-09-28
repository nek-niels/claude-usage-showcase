import type { PlanSummary } from '../lib/aggregate'
import { planColor } from '../lib/colors'
import { useI18n } from '../i18n'

interface Row {
  label: string
  value: (p: PlanSummary) => string
  /** Numeric value used for the change column; omitted rows show no change. */
  num?: (p: PlanSummary) => number
}

export function PlanComparison({ plans }: { plans: PlanSummary[] }) {
  const { t, fmtDate, fmtInt, fmtRatio, fmtTokens, fmtUsd } = useI18n()
  const c = t.compare
  const [a, b] = [plans[0], plans[plans.length - 1]]
  const rows: Row[] = [
    { label: c.price, value: (p) => c.perMonth(fmtUsd(p.plan.priceUsdPerMonth)) },
    { label: c.period, value: (p) => c.periodValue(fmtDate(p.from), fmtDate(p.to), p.calendarDays) },
    { label: c.activeDays, value: (p) => `${p.activeDays}` },
    { label: c.usage, value: (p) => fmtUsd(p.cost) },
    { label: c.usagePerDay, value: (p) => fmtUsd(p.costPerActiveDay), num: (p) => p.costPerActiveDay },
    { label: c.tokensPerDay, value: (p) => fmtTokens(p.tokensPerActiveDay), num: (p) => p.tokensPerActiveDay },
    { label: c.outputPerDay, value: (p) => fmtTokens(p.outputPerActiveDay), num: (p) => p.outputPerActiveDay },
    { label: c.reread, value: (p) => fmtInt(p.rereadPerOutput), num: (p) => p.rereadPerOutput },
    { label: c.periodCost, value: (p) => fmtUsd(p.proratedPrice, 2) },
    { label: c.perDollar, value: (p) => fmtUsd(p.valueMultiple, 2), num: (p) => p.valueMultiple },
  ]
  return (
    <section aria-labelledby="compare-title">
      <h2 id="compare-title">{c.title}</h2>
      <p className="lede">{c.lede(a.plan.name, b.plan.name)}</p>
      <div className="table-wrap">
        <table className="compare">
          <thead>
            <tr>
              <th scope="col"><span className="visually-hidden">{c.measure}</span></th>
              {plans.map((p) => (
                <th scope="col" key={p.plan.id}>
                  <span className="swatch" style={{ background: planColor(p.plan.id) }} />
                  {p.plan.name}
                </th>
              ))}
              <th scope="col">{c.change}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                {plans.map((p) => (
                  <td key={p.plan.id}>{r.value(p)}</td>
                ))}
                <td className="change">{r.num ? fmtRatio(r.num(b) / r.num(a)) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
