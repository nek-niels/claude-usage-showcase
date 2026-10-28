import { useState, type CSSProperties, type PointerEvent } from 'react'
import type { Plan } from '../config/plans'
import type { ChartScale, ChronicleDay, Story } from '../lib/chronicle'
import { modelColor } from '../lib/colors'
import { TOKEN_KINDS, tokenTotal } from '../lib/tokenKinds'
import { useI18n } from '../i18n'

/** What a bar measures: API-equivalent cost stacked by model, or tokens stacked by kind. */
export type Unit = 'cost' | 'tokens'

interface Props {
  days: ChronicleDay[]
  story: Story
  /** The axis for the unit on show; the story's own scale is the cost one. */
  scale: ChartScale
  unit: Unit
  plans: Plan[]
  /** Index of the last printed day. */
  shown: number
}

interface Part {
  key: string
  label: string
  value: number
  color: string
}

/** One day's bar in the unit on show: its total and its parts, bottom of the stack first. */
function useBars(unit: Unit) {
  const { t, fmtUsd, fmtTokens } = useI18n()
  const total = (d: ChronicleDay) => (unit === 'cost' ? d.cost : tokenTotal(d.tokens))
  const parts = (d: ChronicleDay): Part[] =>
    unit === 'cost'
      ? d.segments.map((seg) => ({ key: seg.model, label: seg.model, value: seg.cost, color: modelColor(seg.model) }))
      : TOKEN_KINDS.map((k) => ({ key: k.kind, label: t.tokens[k.kind], value: d.tokens[k.key], color: k.fill })).filter(
          (p) => p.value > 0,
        )
  const fmt = (n: number, digits?: number) => (unit === 'cost' ? fmtUsd(n, digits) : fmtTokens(n))
  return { total, parts, fmt }
}

/** Days print in date order; a Monday gets a date on the axis. Danish and English both start the week there. */
const isMonday = (iso: string) => new Date(`${iso}T00:00:00Z`).getUTCDay() === 1

/**
 * The record as a finance-page column chart: one slot per calendar day, stacked by model. Bars are drawn
 * against the full-period axis and the whole bar layer is stretched by `--zoom` while the first plan's axis
 * still holds, so the zoom-out at the peak is one transform on one layer, not a re-layout of every bar.
 */
export function DailyChart({ days, story: s, scale: sc, unit, plans, shown }: Props) {
  const { t, fmtDate } = useI18n()
  const { total, parts, fmt } = useBars(unit)
  const n = days.length
  const zoomed = sc.rescaleIdx >= 0 && shown >= sc.rescaleIdx
  const scale = zoomed ? sc.after : sc.before
  const tickValues = [...new Set([...sc.before.ticks, ...sc.after.ticks])].sort((a, b) => a - b)
  const base = plans[0]
  const upgrade = plans[1]
  const mondays = days.map((d, i) => ({ d, i })).filter(({ d }) => isMonday(d.date))
  const [hover, setHover] = useState<number | null>(null)
  // Only a printed day can be read; the pointer ahead of the playhead is over blank paper.
  const peek = hover !== null && hover <= shown ? hover : null

  const track = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const i = Math.floor(((e.clientX - rect.left) / rect.width) * n)
    setHover(i >= 0 && i < n ? i : null)
  }

  return (
    <figure className="rc-chart" data-zoomed={zoomed} data-unit={unit}>
      <figcaption className="visually-hidden">{unit === 'cost' ? t.daily.lede : t.daily.ledeTokens}</figcaption>
      <div
        // A change of unit redraws the plot outright, rather than gliding the ticks between unrelated scales.
        key={unit}
        className="rc-plot"
        style={{ '--ymax': scale.max, '--zoom': zoomed ? 1 : sc.after.max / sc.before.max } as CSSProperties}
        onPointerMove={track}
        onPointerDown={track}
        onPointerLeave={() => setHover(null)}
      >
        {tickValues.map((v) => (
          <div key={v} className="rc-tick" data-on={scale.ticks.includes(v)} style={{ '--v': v } as CSSProperties} aria-hidden="true">
            <span>{fmt(v)}</span>
          </div>
        ))}

        <div className="rc-bars" aria-hidden="true">
          {days.map((d, i) => (
            <div
              key={d.date}
              className="rc-slot"
              data-plan={d.plan}
              data-past={upgrade && d.plan === base.id && shown >= s.switchIdx}
              data-peek={i === peek}
            >
              {d.active && (
                <div className="rc-bar" data-printed={i <= shown} style={{ height: `${(total(d) / sc.after.max) * 100}%` }}>
                  {parts(d).map((p) => (
                    <div key={p.key} className="rc-seg" style={{ flexGrow: p.value / total(d), background: p.color }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="rc-offs" aria-hidden="true">
          {days.map((d, i) => (
            <div key={d.date} className="rc-off-slot">
              {!d.active && <span className="rc-off" data-printed={i <= shown} />}
            </div>
          ))}
        </div>

        {s.switchIdx < n && (
          <div
            className="rc-stop"
            data-on={shown >= s.switchIdx}
            style={{ '--x': s.switchIdx / n } as CSSProperties}
            aria-hidden="true"
          >
            <span>
              {t.chronicle.stopPress} {fmtDate(days[s.switchIdx].date)}
            </span>
          </div>
        )}

        <div
          className="rc-ref"
          data-on={shown >= sc.record.idx}
          style={{ '--v': sc.record.value } as CSSProperties}
          aria-hidden="true"
        >
          <span>{t.chronicle.record(base.name, fmt(sc.record.value))}</span>
        </div>

        {peek !== null && <div className="rc-peek" style={{ '--x': peek / n, '--w': 1 / n } as CSSProperties} aria-hidden="true" />}
        {peek !== null && <DayCard day={days[peek]} at={(peek + 0.5) / n} plans={plans} unit={unit} />}

        {sc.rescaleIdx >= 0 && (
          <p className="rc-zoom" data-on={zoomed} aria-hidden="true">
            {t.chronicle.zoomed(fmt(sc.before.max), fmt(sc.after.max))}
          </p>
        )}
      </div>

      <div className="rc-x" aria-hidden="true">
        {mondays.map(({ d, i }, k) => (
          <span
            key={d.date}
            data-alt={k % 2 === 1}
            data-end={i / n > 0.9}
            style={{ '--x': i / n } as CSSProperties}
          >
            {fmtDate(d.date)}
          </span>
        ))}
      </div>
    </figure>
  )
}

/** The hovered day, part by part, top of the stack first, the way the bar reads. */
function DayCard({ day, at, plans, unit }: { day: ChronicleDay; at: number; plans: Plan[]; unit: Unit }) {
  const { t, fmtDate } = useI18n()
  const { total, parts, fmt } = useBars(unit)
  const plan = plans.find((p) => p.id === day.plan)
  return (
    <div className="rc-card" data-flip={at > 0.6} style={{ '--x': at } as CSSProperties} aria-hidden="true">
      <p className="rc-card-date">{fmtDate(day.date, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
      {plan && <p className="rc-card-plan">{t.daily.onPlan(plan.name)}</p>}
      {day.active ? (
        <>
          <ul>
            {parts(day)
              .reverse()
              .map((p) => (
                <li key={p.key}>
                  <i className="swatch" style={{ background: p.color }} />
                  <span>{p.label}</span>
                  <span className="num">{fmt(p.value, 2)}</span>
                </li>
              ))}
          </ul>
          <p className="rc-card-total">
            <span>{t.daily.total}</span>
            <span className="num">{fmt(total(day), 2)}</span>
          </p>
        </>
      ) : (
        <p className="rc-card-off">{t.daily.noSession}</p>
      )}
    </div>
  )
}
