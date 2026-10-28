import type { Dict } from '../i18n/en'
import { chartScale, type ChartScale, type ChronicleDay, type Story } from './chronicle'
import { modelColor } from './colors'
import type { Formatters } from './format'
import { TOKEN_KINDS, tokenTotal } from './tokenKinds'

/** What the record measures a day in: API-equivalent cost by model, or tokens by kind. */
export type Unit = 'cost' | 'tokens'
export const UNITS: Unit[] = ['cost', 'tokens']

/** One stacked part of a day's bar: a model's cost or a kind's tokens. */
export interface Part {
  key: string
  label: string
  color: string
  value: number
}

/** Everything the record needs to draw, read and tabulate a day in one unit. */
export interface Measure {
  unit: Unit
  /** The unit's name on the switch. */
  label: string
  /** The chart's caption for screen readers. */
  lede: string
  /** Every part the unit can stack, bottom first: the legend and the table's columns. */
  series: Omit<Part, 'value'>[]
  scale: ChartScale
  total: (d: ChronicleDay) => number
  /** One part of the day, 0 if the day has none of it. */
  value: (d: ChronicleDay, key: string) => number
  /** The day's parts with a value, bottom of the stack first. */
  parts: (d: ChronicleDay) => Part[]
  /** `digits` applies to amounts only; token counts are always compact. */
  fmt: (n: number, digits?: number) => string
}

/** Both units for one language. Cost reads the story's own scale; tokens get theirs, with the same switch day. */
export function measures(
  { t, fmtUsd, fmtTokens }: { t: Dict } & Formatters,
  days: ChronicleDay[],
  models: string[],
  s: Story,
): Record<Unit, Measure> {
  const build = (m: Omit<Measure, 'parts'>): Measure => ({
    ...m,
    parts: (d) => m.series.map((p) => ({ ...p, value: m.value(d, p.key) })).filter((p) => p.value > 0),
  })

  return {
    cost: build({
      unit: 'cost',
      label: t.daily.unitCost,
      lede: t.daily.lede,
      series: models.map((m) => ({ key: m, label: m, color: modelColor(m) })),
      scale: s,
      total: (d) => d.cost,
      value: (d, model) => d.segments.find((seg) => seg.model === model)?.cost ?? 0,
      fmt: (n, digits) => fmtUsd(n, digits),
    }),
    tokens: build({
      unit: 'tokens',
      label: t.daily.unitTokens,
      lede: t.daily.ledeTokens,
      series: TOKEN_KINDS.map((k) => ({ key: k.key, label: t.tokens[k.kind], color: k.fill })),
      scale: chartScale(days.map((d) => tokenTotal(d.tokens)), s.switchIdx),
      total: (d) => tokenTotal(d.tokens),
      value: (d, key) => d.tokens[key as keyof ChronicleDay['tokens']],
      fmt: (n) => fmtTokens(n),
    }),
  }
}
