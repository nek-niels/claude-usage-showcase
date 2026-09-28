import type { PlanSummary } from '../lib/aggregate'
import { useI18n } from '../i18n'

export function Methodology({ plans, total }: { plans: PlanSummary[]; total: number }) {
  const { t, fmtUsd } = useI18n()
  const last = plans[plans.length - 1]
  return (
    <footer className="method" aria-labelledby="method-title">
      <h2 id="method-title">{t.method.title}</h2>
      <ul>
        <li>
          {t.method.sourceBefore}
          <a href="https://github.com/ryoppippi/ccusage">ccusage</a>
          {t.method.sourceAfter(fmtUsd(total))}
        </li>
        <li>{t.method.apiEquivalent}</li>
        <li>{t.method.sample(last.plan.name, last.activeDays)}</li>
        <li>{t.method.prorate}</li>
      </ul>
    </footer>
  )
}
