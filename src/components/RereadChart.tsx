import type { CSSProperties } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import type { PlanSummary, RereadRow } from '../lib/aggregate'
import { planColor } from '../lib/colors'
import { useI18n } from '../i18n'
import { DAY_PACE_MS, useReveal } from '../lib/motion'
import { Legend } from './Legend'

interface Props {
  rows: RereadRow[]
  plans: PlanSummary[]
}

interface DotProps {
  cx?: number
  cy?: number
  payload?: RereadRow
}

/** Each day's dot wears its plan's colour, with a 2px surface ring. */
function PlanDot({ cx, cy, payload }: DotProps) {
  if (cx == null || cy == null || !payload) return null
  return <circle cx={cx} cy={cy} r={5} fill={planColor(payload.plan)} stroke="var(--surface)" strokeWidth={2} />
}

export function RereadChart({ rows, plans }: Props) {
  const { t, fmtDate, fmtInt } = useI18n()
  const planName = (id: string) => plans.find((p) => p.plan.id === id)?.plan.name ?? id
  const last = plans[plans.length - 1]
  const firstAfter = rows.find((r) => r.date >= last.from)
  const lastRow = rows[rows.length - 1]
  const [a, b] = [plans[0], last]
  // One left-to-right sweep draws the line and its dots; the plan band opens as the sweep reaches it.
  const upgradeIndex = firstAfter ? rows.indexOf(firstAfter) : rows.length - 1
  const sweepMs = (rows.length - 1) * DAY_PACE_MS
  const [ref, reveal] = useReveal<HTMLDivElement>(sweepMs)
  const timing = {
    '--sweep': `${sweepMs}ms`,
    '--band-delay': `${upgradeIndex * DAY_PACE_MS}ms`,
    '--band-sweep': `${(rows.length - 1 - upgradeIndex) * DAY_PACE_MS}ms`,
  } as CSSProperties

  function DayTooltip({ active, payload, label }: TooltipContentProps) {
    if (!active || !payload?.length) return null
    const row = payload[0].payload as RereadRow
    return (
      <div className="tooltip">
        <p className="tooltip-title">{fmtDate(String(label), { weekday: 'short', month: 'short', day: 'numeric' })}</p>
        <p className="tooltip-total">
          <span>
            <span className="swatch" style={{ background: planColor(row.plan) }} />
            {planName(row.plan)}
          </span>
          <span className="num">{t.reread.perToken(fmtInt(row.ratio))}</span>
        </p>
      </div>
    )
  }

  return (
    <section aria-labelledby="reread-title">
      <h2 id="reread-title">{t.reread.title}</h2>
      <p className="lede">{t.reread.lede(fmtInt(a.rereadPerOutput), a.plan.name, fmtInt(b.rereadPerOutput), b.plan.name)}</p>
      <Legend items={plans.map((p) => ({ label: p.plan.name, color: planColor(p.plan.id) }))} />
      <div ref={ref} className="chart reread-chart" data-reveal={reveal} style={{ height: 300, ...timing }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 28, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--grid)" />
            {firstAfter && (
              <ReferenceArea
                className="plan-band"
                x1={firstAfter.date}
                x2={lastRow.date}
                fill="var(--plan-max5x)"
                fillOpacity={0.08}
                label={{
                  value: t.daily.onPlan(last.plan.name),
                  position: 'insideTopLeft',
                  fill: 'var(--text-secondary)',
                  fontSize: 12,
                  dy: -22,
                }}
              />
            )}
            <XAxis
              dataKey="date"
              tickFormatter={(d: string) => fmtDate(d)}
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--axis)' }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={16}
              padding={{ left: 12, right: 12 }}
            />
            <YAxis
              tickFormatter={fmtInt}
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={DayTooltip} cursor={{ stroke: 'var(--axis)' }} />
            <Line
              className="reread-line"
              dataKey="ratio"
              stroke="var(--muted)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              dot={<PlanDot />}
              activeDot={<PlanDot />}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <details className="data-table">
        <summary>{t.showNumbers}</summary>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">{t.daily.date}</th>
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
    </section>
  )
}
