import { useEffect, useRef, useState } from 'react'

/**
 * Where an entrance is: `pending` until the element scrolls into view, `in` while its entrance plays, and
 * `done` once it has finished. CSS keys the hidden start state and the keyframes off this, so after `done`
 * nothing is animating and re-renders (language switch, tooltips) cannot replay the entrance.
 */
export type RevealState = 'pending' | 'in' | 'done'

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/** Both time-series charts replay the period at this pace, so a day takes as long in one as in the other. */
export const DAY_PACE_MS = 22

/** Strong ease-out, the JS twin of `--ease-out` in styles.css. */
export const easeOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))

/** Plays an entrance once, when half of the element is on screen. `totalMs` covers the longest delay plus duration. */
export function useReveal<T extends Element>(totalMs: number) {
  const ref = useRef<T>(null)
  const [state, setState] = useState<RevealState>(() =>
    typeof IntersectionObserver === 'undefined' ? 'done' : 'pending',
  )

  useEffect(() => {
    const el = ref.current
    if (state !== 'pending' || !el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        setState('in')
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    // A printout shows every figure finished, including the ones never scrolled to.
    const finish = () => setState('done')
    addEventListener('beforeprint', finish)
    return () => {
      io.disconnect()
      removeEventListener('beforeprint', finish)
    }
  }, [state])

  useEffect(() => {
    if (state !== 'in') return
    const id = setTimeout(() => setState('done'), totalMs)
    return () => clearTimeout(id)
  }, [state, totalMs])

  return [ref, state] as const
}

/** A number that counts from `from` to `value` while its reveal plays. */
export function useCountUp(value: number, state: RevealState, { from = 0, delay = 0, duration = 800 } = {}) {
  const [shown, setShown] = useState(state === 'done' ? value : from)

  useEffect(() => {
    if (state === 'done' || prefersReducedMotion()) return setShown(value)
    if (state === 'pending') return setShown(from)
    let raf = 0
    const start = performance.now() + delay
    const tick = (now: number) => {
      const t = Math.max(0, (now - start) / duration)
      setShown(from + (value - from) * easeOut(t))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [state, value, from, delay, duration])

  return shown
}
