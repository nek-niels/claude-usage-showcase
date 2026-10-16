import { useLayoutEffect, useState, type CSSProperties } from 'react'
import type { PlanSummary, RereadRow } from '../lib/aggregate'
import { planColor } from '../lib/colors'
import { useI18n } from '../i18n'
import { useReveal } from '../lib/motion'

interface Props {
  rows: RereadRow[]
  plans: PlanSummary[]
}

/** The line is drawn through time at one pace; each plan's segment starts where the previous one ended. */
const DRAW_MS = 1300
const HEIGHT = 230
const PAD = { top: 14, right: 64, bottom: 26, left: 34 }

/** A round step that gives three to five gridlines from zero. */
function niceStep(max: number) {
  const raw = max / 4
  const mag = 10 ** Math.floor(Math.log10(raw))
  const n = raw / mag
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag
}

/**
 * Cache-read tokens per output token, per day, as a slim line in plan colours. Averages are labelled at the
 * ends of their plan's stretch rather than in a legend. The numbers behind it sit in a table under the chart.
 */
export function RereadChart({ rows, plans }: Props) {
  const { t, fmtDate, fmtInt } = useI18n()
  const [ref, reveal] = useReveal<HTMLDivElement>(DRAW_MS + 500)
  const [width, setWidth] = useState(420)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])

  const planName = (id: string) => plans.find((p) => p.plan.id === id)?.plan.name ?? id
  const [a, b] = [plans[0], plans[plans.length - 1]]

  const t0 = Date.parse(rows[0].date)
  const t1 = Date.parse(rows[rows.length - 1].date)
  const plotW = Math.max(1, width - PAD.left - PAD.right)
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const step = niceStep(Math.max(...rows.map((r) => r.ratio)))
  const yMax = Math.ceil(Math.max(...rows.map((r) => r.ratio)) / step) * step
  const ticks = Array.from({ length: Math.round(yMax / step) + 1 }, (_, i) => i * step)
  const x = (date: string) => PAD.left + ((Date.parse(date) - t0) / Math.max(1, t1 - t0)) * plotW
  const y = (v: number) => PAD.top + plotH - (v / yMax) * plotH
  const xRight = PAD.left + plotW

  // One stretch per plan; every stretch after the first starts on the previous plan's last day so the line is unbroken.
  const segments = plans
    .map((p) => ({ summary: p, days: rows.filter((r) => r.plan === p.plan.id) }))
    .filter((s) => s.days.length > 0)
    .map((s, i, all) => {
      const prev = i > 0 ? all[i - 1].days[all[i - 1].days.length - 1] : undefined
      const points = prev ? [prev, ...s.days] : s.days
      const x0 = x(points[0].date)
      const x1 = x(points[points.length - 1].date)
      return {
        ...s,
        isLast: i === all.length - 1,
        d: points.map((r, j) => `${j ? 'L' : 'M'}${x(r.date).toFixed(1)},${y(r.ratio).toFixed(1)}`).join(''),
        timing: {
          '--draw-delay': `${((x0 - PAD.left) / plotW) * DRAW_MS}ms`,
          '--draw-ms': `${Math.max(1, ((x1 - x0) / plotW) * DRAW_MS)}ms`,
        } as CSSProperties,
      }
    })

  const dateTicks = [rows[0].date, segments[segments.length - 1].days[0].date, rows[rows.length - 1].date].filter(
    (d, i, all) => all.indexOf(d) === i,
  )

  return (
    <div className="cache-side">
      <h3 id="reread-title" className="inside-subhead">
        {t.reread.title}
      </h3>
      <p className="inside-note">{t.reread.lede}</p>

      <div ref={ref} className="rr" data-reveal={reveal} style={{ '--draw-total': `${DRAW_MS}ms` } as CSSProperties}>
        <svg
          width={width}
          height={HEIGHT}
          viewBox={`0 0 ${width} ${HEIGHT}`}
          role="img"
          aria-labelledby="reread-title"
          aria-describedby="reread-desc"
        >
          <desc id="reread-desc">
            {t.reread.chartLabel(fmtInt(a.rereadPerOutput), a.plan.name, fmtInt(b.rereadPerOutput), b.plan.name)}
          </desc>

          {ticks.map((v) => (
            <g key={v} className="rr-grid">
              <line x1={PAD.left} x2={xRight} y1={y(v)} y2={y(v)} className={v === 0 ? 'rr-baseline' : undefined} />
              <text x={PAD.left - 6} y={y(v)} dy="0.32em" textAnchor="end">
                {fmtInt(v)}
              </text>
            </g>
          ))}

          {dateTicks.map((d, i) => (
            <text
              key={d}
              className="rr-date"
              x={x(d)}
              y={HEIGHT - 6}
              textAnchor={i === 0 ? 'start' : i === dateTicks.length - 1 ? 'end' : 'middle'}
            >
              {fmtDate(d)}
            </text>
          ))}

          {segments.map((s) => {
            const avg = s.summary.rereadPerOutput
            const first = x(s.days[0].date)
            const last = x(s.days[s.days.length - 1].date)
            const end = s.days[s.days.length - 1]
            return (
              <g key={s.summary.plan.id}>
                <line
                  className="rr-avg"
                  x1={first}
                  x2={s.isLast ? xRight : last}
                  y1={y(avg)}
                  y2={y(avg)}
                  style={{ stroke: planColor(s.summary.plan.id) }}
                />
                <path
                  className="rr-line"
                  d={s.d}
                  pathLength={1}
                  style={{ stroke: planColor(s.summary.plan.id), ...s.timing }}
                />
                <circle
                  className="rr-end"
                  cx={x(end.date)}
                  cy={y(end.ratio)}
                  r={3}
                  style={{ fill: planColor(s.summary.plan.id) }}
                />
                {s.isLast ? (
                  // The current plan's average sits in the right margin, level with its rule.
                  <text className="rr-label" x={xRight + 8} y={y(avg)}>
                    <tspan x={xRight + 8} dy="-0.25em" className="rr-label-plan">
                      {s.summary.plan.name}
                    </tspan>
                    <tspan x={xRight + 8} dy="1.2em">
                      {t.reread.avg(fmtInt(avg))}
                    </tspan>
                  </text>
                ) : (
                  <text className="rr-label" x={last} y={y(avg) - 7} textAnchor="end">
                    <tspan className="rr-label-plan">{s.summary.plan.name}</tspan> {t.reread.avg(fmtInt(avg))}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <details className="data-table inside-numbers">
        <summary>{t.showNumbers}</summary>
        <div className="inside-numbers-wrap">
          <table className="inside-table">
            <thead>
              <tr>
                <th scope="col">{t.reread.date}</th>
                <th scope="col">{t.reread.plan}</th>
                <th scope="col">{t.reread.column}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.date}>
                  <th scope="row">{fmtDate(r.date, { weekday: 'short', month: 'short', day: 'numeric' })}</th>
                  <td>{planName(r.plan)}</td>
                  <td>{fmtInt(r.ratio)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
