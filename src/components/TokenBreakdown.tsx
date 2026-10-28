import type { CSSProperties } from 'react'
import type { PlanSummary } from '../lib/aggregate'
import { useI18n } from '../i18n'
import { useReveal } from '../lib/motion'
import { TOKEN_KINDS } from '../lib/tokenKinds'
import { CountUp } from './CountUp'

/** The bar starts at zero by construction, so the scale only marks the quarters. */
const SCALE = [0.25, 0.5, 0.75, 1]

/** The wipe and the count share one duration, so the number climbs as the edge crosses the bar. */
const WIPE_MS = 1400

/**
 * The lead of the cache spread: the re-read share as a large figure, one 100% bar of every token by kind that is
 * wiped in left to right once, and the kinds as a broadsheet table. Returns grid items for CacheSpread's grid.
 */
export function TokenBreakdown({ plans }: { plans: PlanSummary[] }) {
  const { t, fmtPct, fmtTokens } = useI18n()
  const all = plans.reduce((a, p) => a + p.totalTokens, 0)
  const totals = TOKEN_KINDS.map((k) => ({ ...k, total: plans.reduce((a, p) => a + p.tokens[k.key], 0) }))
  const cacheShare = totals[0].total / all
  const [ref, reveal] = useReveal<HTMLDivElement>(WIPE_MS + 400)
  // A share too small to show at one decimal reads as "<0.1%", never as a false 0.0%.
  const share = (n: number) => (n > 0 && n < 0.001 ? `<${fmtPct(0.001)}` : fmtPct(n))

  return (
    <>
      <div ref={ref} className="cache-share" data-reveal={reveal} style={{ '--wipe': `${WIPE_MS}ms` } as CSSProperties}>
        <p className="cache-figure">
          <span className="cache-figure-num">
            <CountUp value={cacheShare} format={fmtPct} state={reveal} duration={WIPE_MS} />
          </span>
          <span className="cache-figure-caption">{t.tokens.shareCaption}</span>
        </p>

        <figure className="cache-barfig" aria-label={t.tokens.barLabel(fmtPct(cacheShare))}>
          <div className="cache-rest" style={{ '--from': cacheShare } as CSSProperties} aria-hidden="true">
            <span>{t.tokens.rest(fmtPct(1 - cacheShare))}</span>
          </div>
          <div className="cache-bar" aria-hidden="true">
            {totals.map((k) => (
              <span
                key={k.key}
                className="cache-seg"
                // Grow factors under 1 would leave free space unfilled, so shares are scaled up.
                style={{ flexGrow: (k.total / all) * 1000, background: k.fill }}
                data-kind={k.kind}
              >
                {k.kind === 'cacheRead' && <span className="cache-seg-label">{t.tokens.cacheRead}</span>}
              </span>
            ))}
          </div>
          <div className="cache-scale" aria-hidden="true">
            {SCALE.map((s) => (
              <span key={s} style={{ '--at': s } as CSSProperties}>
                {fmtPct(s)}
              </span>
            ))}
          </div>
        </figure>
      </div>

      <div className="cache-table">
        <table className="inside-table">
          <thead>
            <tr>
              <th scope="col">{t.tokens.kind}</th>
              {plans.map((p) => (
                <th scope="col" key={p.plan.id}>
                  {p.plan.name}
                </th>
              ))}
              <th scope="col">{t.tokens.shareOfAll}</th>
            </tr>
          </thead>
          <tbody>
            {totals.map((k) => (
              <tr key={k.key}>
                <th scope="row">
                  <span className="kind-name">
                    <span className="kind-key" style={{ background: k.fill }} aria-hidden="true" />
                    {t.tokens[k.kind]}
                  </span>
                  <span className="kind-note">{t.tokens[`${k.kind}Note`]}</span>
                </th>
                {plans.map((p) => (
                  <td key={p.plan.id}>{fmtTokens(p.tokens[k.key])}</td>
                ))}
                <td className="kind-share">{share(k.total / all)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
