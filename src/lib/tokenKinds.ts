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
