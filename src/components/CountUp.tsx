import { useCountUp, type RevealState } from '../lib/motion'

interface Props {
  value: number
  format: (n: number) => string
  state: RevealState
  from?: number
  delay?: number
  duration?: number
}

/** The final value reserves the width, so nothing beside the number shifts while it counts. */
export function CountUp({ value, format, state, ...timing }: Props) {
  const shown = useCountUp(value, state, timing)
  return (
    <span className="count">
      <span className="count-sizer" aria-hidden="true">{format(value)}</span>
      <span className="count-live">{format(shown)}</span>
    </span>
  )
}
