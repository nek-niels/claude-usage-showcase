import { chartScale, type ChartScale, type ChronicleDay, type Story } from './chronicle'
import { modelColor } from './colors'
import type { Formatters } from './format'
import { TOKEN_KINDS, tokenTotal, type TokenKind } from './tokenKinds'
import type { TokenCounts } from './usage'

/** What the record measures a day in: API-equivalent cost by model, or tokens by kind. */
export type Unit = 'cost' | 'tokens'
export const UNITS: Unit[] = ['cost', 'tokens']

/**
 * One stacked part of a day's bar: a model's cost or a kind's tokens. `K` names the parts a unit can have: token
 * fields are known, so a misspelt one fails to compile; model names come from the data, so cost keys are strings.
 */
export interface Part<K extends string = string> {
  key: K
  label: string
  color: string
  value: number
}

/** Everything the record needs to draw, read and tabulate a day in one unit. */
export interface Measure<K extends string = string> {
  unit: Unit
  /** Every part the unit can stack, bottom first: the legend and the table's columns. */
  series: Omit<Part<K>, 'value'>[]
  scale: ChartScale
  total: (d: ChronicleDay) => number
  /** Every part in the series for the day, 0 where it has none: one row of the table. */
  cells: (d: ChronicleDay) => Part<K>[]
  /** The day's parts with a value, bottom of the stack first. */
  parts: (d: ChronicleDay) => Part<K>[]
  /** `digits` applies to amounts only; token counts are always compact. */
  fmt: (n: number, digits?: number) => string
}

/** How one language writes the parts: its number formats, and its name for each token kind. */
export type Wording = Pick<Formatters, 'fmtUsd' | 'fmtTokens'> & { kindNames: Record<TokenKind, string> }

/** Both units in one wording. Cost reads the story's own scale; tokens get theirs, with the same switch day. */
export function measures(
  { fmtUsd, fmtTokens, kindNames }: Wording,
  days: ChronicleDay[],
  models: string[],
  s: Story,
): { cost: Measure; tokens: Measure<keyof TokenCounts> } {
  const build = <K extends string>({
    value,
    ...m
  }: Omit<Measure<K>, 'cells' | 'parts'> & { value: (d: ChronicleDay, key: K) => number }): Measure<K> => {
    const cells = (d: ChronicleDay) => m.series.map((p) => ({ ...p, value: value(d, p.key) }))
    return { ...m, cells, parts: (d) => cells(d).filter((p) => p.value > 0) }
  }

  return {
    cost: build({
      unit: 'cost',
      series: models.map((m) => ({ key: m, label: m, color: modelColor(m) })),
      scale: s,
      total: (d) => d.cost,
      value: (d, model) => d.segments.find((seg) => seg.model === model)?.cost ?? 0,
      fmt: (n, digits) => fmtUsd(n, digits),
    }),
    tokens: build({
      unit: 'tokens',
      series: TOKEN_KINDS.map((k) => ({ key: k.key, label: kindNames[k.kind], color: k.fill })),
      scale: chartScale(days.map((d) => tokenTotal(d.tokens)), s.switchIdx),
      total: (d) => tokenTotal(d.tokens),
      value: (d, key) => d.tokens[key],
      fmt: (n) => fmtTokens(n),
    }),
  }
}
