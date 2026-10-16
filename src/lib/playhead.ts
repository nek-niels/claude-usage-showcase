import { useSyncExternalStore } from 'react'

/**
 * The scroll playhead: which calendar day the reader is on. The chronicle writes it as it scrolls;
 * the tape reads it. `day` is a fractional index into `ledger()`, 0 before the chronicle and the
 * last index after it.
 */
export interface Playhead {
  day: number
  phase: 'before' | 'chronicle' | 'after'
}

let current: Playhead = { day: 0, phase: 'before' }
const listeners = new Set<() => void>()

export function setPlayhead(next: Playhead) {
  if (next.day === current.day && next.phase === current.phase) return
  current = next
  listeners.forEach((l) => l())
}

export function usePlayhead(): Playhead {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => current,
  )
}

/** The chronicle registers how to scroll to a given day index; the tape calls it. */
let jump: ((day: number) => void) | null = null
export function registerJump(fn: ((day: number) => void) | null) {
  jump = fn
}
export function jumpToDay(day: number) {
  jump?.(day)
}
