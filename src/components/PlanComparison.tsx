import type { CSSProperties } from 'react'
import type { PlanSummary } from '../lib/aggregate'
import { planColor } from '../lib/colors'
import { useI18n } from '../i18n'
import { useReveal } from '../lib/motion'

interface Row {
  label: string
  note?: string
  value: (p: PlanSummary) => string
  /** Numeric value used for the change column; omitted rows show no change. */
  num?: (p: PlanSummary) => number
}

const ROW_STAGGER_MS = 40
const ROW_IN_MS = 620

/**
 * The plans side by side as a closing-prices table. On a phone each row reflows into the measure on its
 * own line, then the plan values and the change beneath it, so nothing scrolls sideways.
 */
export function PlanComparison({ plans }: { plans: PlanSummary[] }) {
  const { t, fmtDate, fmtInt, fmtRatio, fmtTokens, fmtUsd } = useI18n()
  const c = t.compare
  const [a, b] = [plans[0], plans[plans.length - 1]]
  const rows: Row[] = [
    { label: c.price, value: (p) => c.perMonth(fmtUsd(p.plan.priceUsdPerMonth)) },
    { label: c.period, value: (p) => c.periodValue(fmtDate(p.from), fmtDate(p.to), p.calendarDays) },
    { label: c.activeDays, note: c.notes.activeDays, value: (p) => `${p.activeDays}` },
    { label: c.usage, note: c.notes.usage, value: (p) => fmtUsd(p.cost) },
    { label: c.usagePerDay, value: (p) => fmtUsd(p.costPerActiveDay), num: (p) => p.costPerActiveDay },
    { label: c.tokensPerDay, value: (p) => fmtTokens(p.tokensPerActiveDay), num: (p) => p.tokensPerActiveDay },
    { label: c.outputPerDay, value: (p) => fmtTokens(p.outputPerActiveDay), num: (p) => p.outputPerActiveDay },
    { label: c.reread, note: c.notes.reread, value: (p) => fmtInt(p.rereadPerOutput), num: (p) => p.rereadPerOutput },
    { label: c.periodCost, note: c.notes.periodCost, value: (p) => fmtUsd(p.proratedPrice, 2) },
    { label: c.perDollar, note: c.notes.perDollar, value: (p) => fmtUsd(p.valueMultiple, 2), num: (p) => p.valueMultiple },
  ]
  const [ref, reveal] = useReveal<HTMLHeadingElement>(ROW_IN_MS + ROW_STAGGER_MS * rows.length)

  // The verdict on value per dollar is read from the data, so it stays true as days are added.
  const ledeArgs = [a.plan.name, fmtUsd(a.valueMultiple, 2), b.plan.name, fmtUsd(b.valueMultiple, 2)] as const
  const ratio = fmtRatio(b.costPerActiveDay / a.costPerActiveDay)
  const lede =
    a.valueMultiple >= b.valueMultiple ? c.ledeBaseLeads(...ledeArgs, ratio) : c.ledeUpgradeLeads(...ledeArgs, ratio)

  return (
    <div className="prices" data-reveal={reveal}>
      <h3 ref={ref} id="compare-title" className="prices-title">
        {c.title}
      </h3>
      <p className="prices-lede">{lede}</p>
      <table className="prices-table" role="table" aria-labelledby="compare-title">
        <thead role="rowgroup">
          <tr role="row">
            <th scope="col" role="columnheader">
              {c.measure}
            </th>
            {plans.map((p) => (
              <th scope="col" role="columnheader" key={p.plan.id}>
                <span className="prices-swatch" style={{ background: planColor(p.plan.id) }} aria-hidden="true" />
                {p.plan.name}
              </th>
            ))}
            <th scope="col" role="columnheader">
              {c.change}
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          {rows.map((r, i) => (
            <tr role="row" key={r.label} style={{ '--i': i } as CSSProperties}>
              <th scope="row" role="rowheader">
                {r.label}
                {r.note && <span className="prices-note">{r.note}</span>}
              </th>
              {plans.map((p) => (
                <td role="cell" key={p.plan.id}>
                  <span className="prices-cell-label" aria-hidden="true">
                    {p.plan.name}
                  </span>
                  {r.value(p)}
                </td>
              ))}
              <td role="cell" className={r.num ? 'prices-change' : 'prices-change prices-change--none'}>
                {r.num && (
                  <>
                    <span className="prices-cell-label" aria-hidden="true">
                      {c.change}
                    </span>
                    {fmtRatio(r.num(b) / r.num(a))}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
