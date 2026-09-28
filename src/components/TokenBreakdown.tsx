import type { PlanSummary } from '../lib/aggregate'
import type { TokenCounts } from '../lib/usage'
import { useI18n } from '../i18n'

type Kind = 'cacheRead' | 'cacheCreation' | 'output' | 'input'

const KINDS: { key: keyof TokenCounts; kind: Kind }[] = [
  { key: 'cacheReadTokens', kind: 'cacheRead' },
  { key: 'cacheCreationTokens', kind: 'cacheCreation' },
  { key: 'outputTokens', kind: 'output' },
  { key: 'inputTokens', kind: 'input' },
]

export function TokenBreakdown({ plans }: { plans: PlanSummary[] }) {
  const { t, fmtPct, fmtTokens } = useI18n()
  const all = plans.reduce((a, p) => a + p.totalTokens, 0)
  const cacheShare = plans.reduce((a, p) => a + p.tokens.cacheReadTokens, 0) / all
  return (
    <section aria-labelledby="tokens-title">
      <h2 id="tokens-title">{t.tokens.title(fmtTokens(all))}</h2>
      <p className="lede">{t.tokens.lede(fmtPct(cacheShare))}</p>
      <div className="table-wrap">
        <table className="tokens">
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
            {KINDS.map((k) => {
              const total = plans.reduce((a, p) => a + p.tokens[k.key], 0)
              return (
                <tr key={k.key}>
                  <th scope="row">
                    {t.tokens[k.kind]}
                    <span className="row-note">{t.tokens[`${k.kind}Note`]}</span>
                  </th>
                  {plans.map((p) => (
                    <td key={p.plan.id}>{fmtTokens(p.tokens[k.key])}</td>
                  ))}
                  <td>{fmtPct(total / all)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
