import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type RefObject,
} from 'react'
import type { PlanSummary } from '../lib/aggregate'
import { planColor } from '../lib/colors'
import type { LedgerDay } from '../lib/ledger'
import { jumpToDay, usePlayhead, type Playhead } from '../lib/playhead'
import { useI18n } from '../i18n'
import type { Dict } from '../i18n/en'
import '../styles/front.css'

/** The story index, in page order: section id and its label key. */
const STORIES = [
  ['front', 'front'],
  ['record', 'record'],
  ['average-day', 'averageDay'],
  ['cache', 'cache'],
  ['closing', 'closing'],
] as const satisfies readonly (readonly [string, keyof Dict['tape']['stories']])[]

type StoryId = (typeof STORIES)[number][0]
type Phase = Playhead['phase']

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/** The longest strings a slot can ever show, so the slot keeps one width for the whole calendar. */
function widest(values: string[]): string[] {
  const max = Math.max(...values.map((v) => v.length))
  return [...new Set(values.filter((v) => v.length === max))].slice(0, 3)
}

/**
 * One figure on the tape. Its width is held by the widest value it will ever show, and a changed value
 * drops in like a split-flap card (CSS, ~120ms, none under reduced motion). The first value never flaps.
 */
function Fig({ value, sizers, className = '' }: { value: string; sizers: string[]; className?: string }) {
  const settled = useRef(false)
  useEffect(() => {
    settled.current = true
  }, [])
  return (
    <span className={`tape-fig ${className}`}>
      {sizers.map((s) => (
        <span key={s} className="tape-sizer" aria-hidden="true">
          {s}
        </span>
      ))}
      <span key={value} className="tape-live" data-flap={settled.current || undefined}>
        {value}
      </span>
    </span>
  )
}

/**
 * Listens to the playhead, which the chronicle writes on every scroll frame. Only this null component
 * re-renders per frame: the fractional position goes straight into a CSS variable for the strip's marker,
 * and the tape itself only hears about it when the rounded day or the phase changes.
 */
function PlayheadBridge({
  last,
  stripRef,
  onChange,
}: {
  last: number
  stripRef: RefObject<HTMLDivElement | null>
  onChange: (index: number, phase: Phase) => void
}) {
  const { day, phase } = usePlayhead()
  const pos = phase === 'after' ? last : clamp(day, 0, last)
  const index = Math.round(pos)
  useLayoutEffect(() => {
    stripRef.current?.style.setProperty('--ph', pos.toFixed(3))
  }, [pos, stripRef])
  useEffect(() => onChange(index, phase), [index, phase, onChange])
  return null
}

/** One tick per calendar day, height = that day's usage, coloured by plan; a dot on days off. Each one jumps. */
const TickStrip = memo(function TickStrip({
  days,
  current,
  labels,
  groupLabel,
  stripRef,
}: {
  days: LedgerDay[]
  current: number
  labels: string[]
  groupLabel: string
  stripRef: RefObject<HTMLDivElement | null>
}) {
  const max = Math.max(...days.map((d) => d.cost), 1)

  // One tab stop for the whole strip; arrow keys walk the days, Enter jumps.
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const buttons = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('.tape-tick')]
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement)
    if (at < 0) return
    const to =
      e.key === 'ArrowRight' ? at + 1 : e.key === 'ArrowLeft' ? at - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : null
    if (to === null) return
    e.preventDefault()
    buttons[clamp(to, 0, buttons.length - 1)].focus()
  }

  return (
    <div
      ref={stripRef}
      className="tape-ticks"
      role="group"
      aria-label={groupLabel}
      onKeyDown={onKeyDown}
      style={{ '--n': days.length } as CSSProperties}
    >
      {days.map((d, i) => (
        <button
          key={d.date}
          type="button"
          className="tape-tick"
          tabIndex={i === current ? 0 : -1}
          data-off={!d.active || undefined}
          data-future={i > current || undefined}
          aria-current={i === current ? 'date' : undefined}
          aria-label={labels[i]}
          title={labels[i]}
          onClick={() => jumpToDay(i)}
          style={{ '--h': d.cost / max, '--c': planColor(d.plan) } as CSSProperties}
        >
          <span className="tape-tick-mark" />
        </button>
      ))}
      <span className="tape-marker" aria-hidden="true" />
    </div>
  )
})

/** Which story the reader is in: the one crossing a line a third of the way down the viewport. */
function useCurrentStory(): StoryId {
  const [story, setStory] = useState<StoryId>('front')
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setStory(e.target.id as StoryId)
      },
      { rootMargin: '-34% 0px -65% 0px' },
    )
    // Stories mount with the page; look them up after the first paint.
    const id = requestAnimationFrame(() => {
      for (const [sid] of STORIES) {
        const el = document.getElementById(sid)
        if (el) io.observe(el)
      }
    })
    return () => {
      cancelAnimationFrame(id)
      io.disconnect()
    }
  }, [])
  return story
}

/**
 * The dateline tape, the page's signature move. Scroll position is a date: the tape shows the day the
 * chronicle is on, the plan in force, that day's usage, the running API-equivalent total, the subscription
 * paid to date and the multiple between them. Before the chronicle it reads the first day; after it, the
 * closing figures.
 */
export function Tape({ plans, days }: { plans: PlanSummary[]; days: LedgerDay[] }) {
  const { t, lang, fmtDate, fmtUsd, fmtRatio } = useI18n()
  const last = days.length - 1
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('before')
  const [open, setOpen] = useState(false)
  const stripRef = useRef<HTMLDivElement>(null)
  const story = useCurrentStory()

  const onChange = useCallback((i: number, p: Phase) => {
    setIndex(i)
    setPhase(p)
  }, [])

  // Every string the tape can show, per day, formatted once per language.
  const cols = useMemo(() => {
    const name = (id: string) => plans.find((p) => p.plan.id === id)?.plan.name ?? id
    const col = (f: (d: LedgerDay, i: number) => string) => days.map(f)
    const c = {
      date: col((d) => fmtDate(d.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })),
      dateShort: col((d) => fmtDate(d.date, { weekday: 'short', day: 'numeric', month: 'short' })),
      dayOf: col((_, i) => t.tape.dayOf(i + 1, days.length)),
      plan: col((d) => name(d.plan)),
      usage: col((d) => (d.active ? fmtUsd(d.cost) : t.tape.noSession)),
      total: col((d) => fmtUsd(d.cumCost)),
      paid: col((d) => fmtUsd(d.cumPaid)),
      multiple: col((d) => fmtRatio(d.cumPaid > 0 ? d.cumCost / d.cumPaid : 0)),
    }
    const tick = col((d, i) => t.tape.tickLabel(fmtDate(d.date, { weekday: 'long', day: 'numeric', month: 'long' }), c.usage[i]))
    return {
      ...c,
      tick,
      w: Object.fromEntries(Object.entries(c).map(([k, v]) => [k, widest(v)])) as Record<keyof typeof c, string[]>,
    }
  }, [days, plans, lang])

  // Escape closes the phone index.
  useEffect(() => {
    if (!open) return
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [open])

  if (days.length === 0) return null
  const i = clamp(index, 0, last)
  const d = days[i]
  const closing = phase === 'after'
  const state = closing ? t.tape.closing : cols.dayOf[i]
  const stateSizers = widest([...cols.w.dayOf, t.tape.closing])

  const storyIndex = (where: 'bar' | 'panel') => (
    <ol className={`tape-index tape-index--${where}`}>
      {STORIES.map(([id, key]) => (
        <li key={id}>
          <a href={`#${id}`} aria-current={story === id ? 'location' : undefined} onClick={() => setOpen(false)}>
            {t.tape.stories[key]}
          </a>
        </li>
      ))}
    </ol>
  )

  return (
    <nav className="tape" aria-label={t.tape.label} data-phase={phase} data-open={open || undefined}>
      <PlayheadBridge last={last} stripRef={stripRef} onChange={onChange} />
      <div className="tape-row tape-row--figures">
        <span className="tape-cell tape-cell--date">
          <Fig className="tape-date-long" value={cols.date[i]} sizers={cols.w.date} />
          <Fig className="tape-date-short" value={cols.dateShort[i]} sizers={cols.w.dateShort} />
        </span>
        <span className="tape-cell tape-cell--state" data-closing={closing || undefined}>
          <Fig value={state} sizers={stateSizers} />
        </span>
        <span className="tape-cell tape-cell--plan">
          <span className="visually-hidden">{t.tape.plan} </span>
          <span className="tape-swatch" style={{ background: planColor(d.plan) }} aria-hidden="true" />
          <Fig value={cols.plan[i]} sizers={cols.w.plan} />
        </span>
        <span className="tape-cell tape-cell--day" data-off={!d.active || undefined}>
          <span className="tape-label">{t.tape.day}</span>
          <Fig value={cols.usage[i]} sizers={cols.w.usage} />
        </span>
        <span className="tape-cell tape-cell--total">
          <span className="tape-label">
            <span className="tape-label-long">{t.tape.total}</span>
            <span className="tape-label-short" aria-hidden="true">{t.tape.totalShort}</span>
          </span>
          <Fig value={cols.total[i]} sizers={cols.w.total} />
        </span>
        <span className="tape-cell tape-cell--paid">
          <span className="tape-label">{t.tape.paid}</span>
          <Fig value={cols.paid[i]} sizers={cols.w.paid} />
        </span>
        <span className="tape-cell tape-cell--multiple">
          <span className="tape-label">{t.tape.multiple}</span>
          <Fig value={cols.multiple[i]} sizers={cols.w.multiple} />
        </span>
        <button
          type="button"
          className="tape-more"
          aria-expanded={open}
          aria-controls="tape-panel"
          onClick={() => setOpen((o) => !o)}
        >
          {t.tape.menu}
        </button>
      </div>

      <div className="tape-row tape-row--index">
        {storyIndex('bar')}
        <TickStrip days={days} current={i} labels={cols.tick} groupLabel={t.tape.ticks} stripRef={stripRef} />
      </div>

      <div id="tape-panel" className="tape-panel" hidden={!open}>
        <dl className="tape-panel-figures">
          <div>
            <dt>{t.tape.day}</dt>
            <dd>{cols.usage[i]}</dd>
          </div>
          <div>
            <dt>{t.tape.paid}</dt>
            <dd>{cols.paid[i]}</dd>
          </div>
          <div>
            <dt>{t.tape.plan}</dt>
            <dd>{cols.plan[i]}</dd>
          </div>
          <div>
            <dt className="visually-hidden">{t.tape.dayOfLabel}</dt>
            <dd>{state}</dd>
          </div>
        </dl>
        {storyIndex('panel')}
      </div>
    </nav>
  )
}
