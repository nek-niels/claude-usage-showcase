import type { CSSProperties } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
  type TooltipContentProps,
} from 'recharts'
import type { DailyRow, PlanSummary } from '../lib/aggregate'
import { modelColor } from '../lib/colors'
import { useI18n } from '../i18n'
import { DAY_PACE_MS, useReveal } from '../lib/motion'
import { Legend } from './Legend'

/** The days rise one after another, so the entrance replays the period in date order. */
const RISE_MS = 480

interface Props {
  rows: DailyRow[]
  models: string[]
  plans: PlanSummary[]
}

/**
 * A stacked segment with a 2px surface gap above it; only the top segment gets the 4px rounded end.
 * Every segment of a day scales from the shared baseline, so the whole column rises as one.
 */
function StackSegment({ fill, isTop, index, background, ...box }: BarShapeProps & { isTop: boolean }) {
  const [x, y, width, height] = [box.x, box.y, box.width, box.height].map((v) => Number(v ?? 0))
  const h = isTop ? height : height - 2
  if (h <= 0 || width <= 0) return null
  const top = isTop ? y : y + 2
  const r = isTop ? Math.min(4, h, width / 2) : 0
  const d = `M${x},${top + h} V${top + r} Q${x},${top} ${x + r},${top} H${x + width - r} Q${x + width},${top} ${x + width},${top + r} V${top + h} Z`
  const baseline = background ? Number(background.y ?? 0) + background.height : top + h
  return (
    <path
      className="stack-seg"
      d={d}
      fill={fill}
      style={{ transformOrigin: `${x}px ${baseline}px`, '--i': index } as CSSProperties}
    />
  )
}

function DayTooltip({ active, payload, label }: TooltipContentProps) {
  const { t, fmtDate, fmtUsd } = useI18n()
  if (!active || !payload?.length) return null
  const row = payload[0].payload as DailyRow
  return (
    <div className="tooltip">
      <p className="tooltip-title">{fmtDate(String(label), { weekday: 'short', month: 'short', day: 'numeric' })}</p>
      <ul>
        {[...payload].reverse().map((p) =>
          p.value ? (
            <li key={String(p.dataKey)}>
              <span className="swatch" style={{ background: p.color }} />
              <span>{String(p.dataKey)}</span>
              <span className="num">{fmtUsd(p.value as number, 2)}</span>
            </li>
          ) : null,
        )}
      </ul>
      <p className="tooltip-total">
        <span>{t.daily.total}</span>
        <span className="num">{fmtUsd(row.total, 2)}</span>
      </p>
    </div>
  )
}

export function DailyChart({ rows, models, plans }: Props) {
  const { t, fmtDate, fmtUsd } = useI18n()
  const upgrade = plans[plans.length - 1]
  const firstAfter = rows.find((r) => r.date >= upgrade.from)
  const lastRow = rows[rows.length - 1]
  const upgradeIndex = firstAfter ? rows.indexOf(firstAfter) : rows.length
  const [ref, reveal] = useReveal<HTMLDivElement>((rows.length - 1) * DAY_PACE_MS + RISE_MS)
  const timing = {
    '--stagger': `${DAY_PACE_MS}ms`,
    '--rise': `${RISE_MS}ms`,
    // The plan band opens as the sweep reaches the first day on the new plan, at the same pace.
    '--band-delay': `${upgradeIndex * DAY_PACE_MS}ms`,
    '--band-sweep': `${(rows.length - upgradeIndex) * DAY_PACE_MS}ms`,
  } as CSSProperties

  return (
    <section aria-labelledby="daily-title">
      <h2 id="daily-title">{t.daily.title}</h2>
      <p className="lede">{t.daily.lede}</p>
      <Legend items={models.map((m) => ({ label: m, color: modelColor(m) }))} />
      <div ref={ref} className="chart daily-chart" data-reveal={reveal} style={{ height: 340, ...timing }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 28, right: 8, bottom: 0, left: 0 }} barCategoryGap="22%">
            <CartesianGrid vertical={false} stroke="var(--grid)" />
            {firstAfter && (
              <ReferenceArea
                className="plan-band"
                x1={firstAfter.date}
                x2={lastRow.date}
                fill="var(--plan-max5x)"
                fillOpacity={0.08}
                label={{
                  value: t.daily.onPlan(upgrade.plan.name),
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
            />
            <YAxis
              tickFormatter={(v: number) => fmtUsd(v)}
              tick={{ fill: 'var(--muted)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={(props: TooltipContentProps) => <DayTooltip {...props} />} cursor={{ fill: 'var(--hover)' }} />
            {models.map((m, i) => (
              <Bar
                key={m}
                dataKey={m}
                stackId="cost"
                fill={modelColor(m)}
                maxBarSize={24}
                shape={(props: BarShapeProps) => (
                  <StackSegment {...props} isTop={models.slice(i + 1).every((later) => !(props.payload as DailyRow | undefined)?.[later])} />
                )}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <details className="data-table">
        <summary>{t.showNumbers}</summary>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">{t.daily.date}</th>
                {models.map((m) => (
                  <th scope="col" key={m}>{m}</th>
                ))}
                <th scope="col">{t.daily.total}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.date}>
                  <th scope="row">{fmtDate(r.date, { weekday: 'short', month: 'short', day: 'numeric' })}</th>
                  {models.map((m) => (
                    <td key={m}>{r[m] ? fmtUsd(r[m] as number, 2) : '–'}</td>
                  ))}
                  <td>{fmtUsd(r.total, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  )
}
