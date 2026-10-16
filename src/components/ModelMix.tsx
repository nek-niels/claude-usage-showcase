import type { CSSProperties } from 'react'
import type { PlanSummary } from '../lib/aggregate'
import { sortModels } from '../lib/aggregate'
import { mixToDate, type ChronicleDay } from '../lib/chronicle'
import { modelColor } from '../lib/colors'
import { useI18n } from '../i18n'

/** Below this share a model folds into "Other models" in the labels; its segment still shows. */
const LABEL_MIN_SHARE = 0.05

/**
 * The sidebar "model mix to date": one stacked bar per plan, counting only the days up to the playhead.
 * Every model the plan will ever use keeps a segment (zero-wide until it appears), so a share that grows
 * slides its neighbours instead of popping in. Segments are clipped, not resized, so only clip-path moves.
 */
export function ModelMix({ days, plans, shown }: { days: ChronicleDay[]; plans: PlanSummary[]; shown: number }) {
  const { t, fmtPct, fmtDate } = useI18n()
  const current = days[Math.min(shown, days.length - 1)]?.plan

  return (
    <div className="rc-mix">
      <h3 className="rc-label">{t.mix.title}</h3>
      {plans.map((p) => {
        const models = sortModels(p.modelMix.map((m) => m.model))
        const { total, shares } = mixToDate(days, p.plan.id, shown)
        const share = (m: string) => shares.find((s) => s.model === m)?.share ?? 0
        let x = 0
        const segments = models.map((m) => {
          const from = x
          x += share(m)
          return { model: m, from, to: x }
        })
        const ranked = [...shares].sort((a, b) => b.share - a.share)
        const labelled = ranked.filter((s) => s.share >= LABEL_MIN_SHARE)
        const other = ranked.filter((s) => s.share < LABEL_MIN_SHARE).reduce((a, s) => a + s.share, 0)
        return (
          <div className="rc-mixrow" key={p.plan.id} data-current={p.plan.id === current}>
            <span className="rc-mixplan">{p.plan.name}</span>
            <div
              className="rc-mixbar"
              role="img"
              aria-label={total ? labelled.map((s) => `${s.model} ${fmtPct(s.share)}`).join(', ') : t.mix.notYet(fmtDate(p.from))}
            >
              {segments.map((s) => (
                <div
                  key={s.model}
                  className="rc-mixseg"
                  style={{ '--from': s.from, '--to': s.to, background: modelColor(s.model) } as CSSProperties}
                />
              ))}
            </div>
            <p className="rc-mixlabels">
              {total === 0 ? (
                <span className="rc-mixwait">{t.mix.notYet(fmtDate(p.from))}</span>
              ) : (
                <>
                  {labelled.map((s) => (
                    <span key={s.model}>
                      <i className="swatch" style={{ background: modelColor(s.model) }} />
                      {s.model} <b>{fmtPct(s.share)}</b>
                    </span>
                  ))}
                  {other > 0.0005 && (
                    <span className="rc-mixother">
                      {t.mix.other} <b>{fmtPct(other)}</b>
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        )
      })}
    </div>
  )
}
