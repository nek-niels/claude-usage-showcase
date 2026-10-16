import type { PlanSummary, RereadRow } from '../lib/aggregate'
import { useI18n } from '../i18n'
import { RereadChart } from './RereadChart'
import { TokenBreakdown } from './TokenBreakdown'
import '../styles/inside.css'

/**
 * The cache: a two-column spread. The lead runs the headline, the re-read share and the token bar across the
 * page, then sets the kind table in the wide column; the re-read line sits beside it in the narrow one.
 */
export function CacheSpread({ plans, rereadRows }: { plans: PlanSummary[]; rereadRows: RereadRow[] }) {
  const { t, fmtTokens } = useI18n()
  const all = plans.reduce((a, p) => a + p.totalTokens, 0)
  return (
    <section id="cache" className="inside cache" data-sc-act="flow" aria-labelledby="cache-title">
      <header className="cache-head">
        <h2 id="cache-title" className="inside-head inside-head--lead">
          {t.tokens.title(fmtTokens(all))}
        </h2>
        <p className="inside-standfirst">{t.tokens.lede}</p>
      </header>
      <TokenBreakdown plans={plans} />
      {rereadRows.length > 0 && <RereadChart rows={rereadRows} plans={plans} />}
    </section>
  )
}
