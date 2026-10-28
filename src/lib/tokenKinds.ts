import type { TokenCounts } from './usage'

export type TokenKind = 'cacheRead' | 'cacheCreation' | 'output' | 'input'

/** Stacking and table order. The ink fades up the stack; what Claude wrote is the one kind in colour (see --kind-*). */
export const TOKEN_KINDS: { key: keyof TokenCounts; kind: TokenKind; fill: string }[] = [
  { key: 'cacheReadTokens', kind: 'cacheRead', fill: 'var(--kind-cache-read)' },
  { key: 'cacheCreationTokens', kind: 'cacheCreation', fill: 'var(--kind-cache-creation)' },
  { key: 'outputTokens', kind: 'output', fill: 'var(--kind-output)' },
  { key: 'inputTokens', kind: 'input', fill: 'var(--kind-input)' },
]

export const tokenTotal = (t: TokenCounts) => TOKEN_KINDS.reduce((a, k) => a + t[k.key], 0)

/** Just the token counts of a row, kind by kind; all 0 without one (a day off). */
export const tokenCounts = (row?: TokenCounts): TokenCounts =>
  Object.fromEntries(TOKEN_KINDS.map((k) => [k.key, row?.[k.key] ?? 0])) as Record<keyof TokenCounts, number>
