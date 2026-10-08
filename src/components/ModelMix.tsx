import type { CSSProperties } from 'react'
import type { PlanSummary } from '../lib/aggregate'
import { sortModels } from '../lib/aggregate'
import { modelColor } from '../lib/colors'
import { useI18n } from '../i18n'
import { useReveal } from '../lib/motion'
import { Legend } from './Legend'

const LABEL_MIN_SHARE = 0.05
const ROW_STAGGER_MS = 140
const SWEEP_MS = 700
/** Labels settle in once most of their bar has opened. */
const LABEL_DELAY_MS = 350
const LABEL_MS = 300

export function ModelMix({ plans }: { plans: PlanSummary[] }) {
  const { t, fmtPct, fmtUsd } = useI18n()
  const models = sortModels([...new Set(plans.flatMap((p) => p.modelMix.map((m) => m.model)))])
  const [ref, reveal] = useReveal<HTMLDivElement>(
    ROW_STAGGER_MS * (plans.length - 1) + Math.max(SWEEP_MS, LABEL_DELAY_MS + LABEL_MS),
  )
  return (
    <section aria-labelledby="mix-title">
      <h2 id="mix-title">{t.mix.title}</h2>
      <p className="lede">{t.mix.lede}</p>
      <Legend items={models.map((m) => ({ label: m, color: modelColor(m) }))} />
      <div ref={ref} className="mix" data-reveal={reveal}>
        {plans.map((p, i) => {
          const segments = models
            .map((m) => p.modelMix.find((x) => x.model === m))
            .filter((x): x is NonNullable<typeof x> => !!x)
          const small = segments.filter((s) => s.share < LABEL_MIN_SHARE)
          return (
            <div
              className="mix-row"
              key={p.plan.id}
              style={{ '--delay': `${i * ROW_STAGGER_MS}ms`, '--label-delay': `${i * ROW_STAGGER_MS + LABEL_DELAY_MS}ms` } as CSSProperties}
            >
              <span className="mix-plan">{p.plan.name}</span>
              <div
                className="mix-bar"
                role="img"
                aria-label={segments.map((s) => `${s.model} ${fmtPct(s.share)}`).join(', ')}
              >
                {segments.map((s) => (
                  <div
                    key={s.model}
                    className="mix-seg"
                    style={{ flexGrow: s.share, background: modelColor(s.model) }}
                    title={`${s.model}: ${fmtPct(s.share)} (${fmtUsd(s.cost, 2)})`}
                  />
                ))}
              </div>
              <ul className="mix-labels">
                {segments
                  .filter((s) => s.share >= LABEL_MIN_SHARE)
                  .map((s) => (
                    <li key={s.model}>
                      <span className="swatch" style={{ background: modelColor(s.model) }} />
                      {s.model} <strong>{fmtPct(s.share)}</strong>
                    </li>
                  ))}
                {small.length > 0 && (
                  <li className="muted">
                    {t.mix.other} {fmtPct(small.reduce((x, s) => x + s.share, 0))}
                  </li>
                )}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
