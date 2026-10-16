import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { PLANS } from '../config/plans'
import type { DailyRow, PlanSummary } from '../lib/aggregate'
import { chapterAt, chapterRanges, chronicleDays, dayWeights, scrollMap, story, type ChapterId } from '../lib/chronicle'
import { modelColor } from '../lib/colors'
import type { LedgerDay } from '../lib/ledger'
import { registerJump, setPlayhead } from '../lib/playhead'
import { useI18n } from '../i18n'
import { DailyChart } from './DailyChart'
import { Legend } from './Legend'
import { ModelMix } from './ModelMix'
import '../styles/chronicle.css'

interface Props {
  rows: DailyRow[]
  models: string[]
  plans: PlanSummary[]
  days: LedgerDay[]
}

const REDUCED = '(prefers-reduced-motion: reduce)'

/** True when the chronicle should lie flat and finished: reduced motion, or the page is being printed. */
function useStill() {
  const [reduced, setReduced] = useState(() => matchMedia(REDUCED).matches)
  const [printing, setPrinting] = useState(false)
  useEffect(() => {
    const mq = matchMedia(REDUCED)
    const onChange = () => setReduced(mq.matches)
    const before = () => setPrinting(true)
    const after = () => setPrinting(false)
    mq.addEventListener('change', onChange)
    addEventListener('beforeprint', before)
    addEventListener('afterprint', after)
    return () => {
      mq.removeEventListener('change', onChange)
      removeEventListener('beforeprint', before)
      removeEventListener('afterprint', after)
    }
  }, [])
  return reduced || printing
}

/** The sticky stage's offset below the tape, read from the stage itself so it follows whatever the tape is. */
function tapeOffset(stage: HTMLElement) {
  const top = parseFloat(getComputedStyle(stage).top)
  if (Number.isFinite(top)) return top
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tape-h')) || 0
}

/**
 * "The record": a tall wrapper with a sticky stage. Scroll through the wrapper is the calendar; each day
 * owns a slice of it (the switch dwells), the chart prints day by day under the reader's hand, and the
 * tape follows through the playhead store. Reduced motion and print lay it flat and fully printed.
 */
export function Chronicle({ rows, models, plans, days }: Props) {
  const { t, fmtUsd, fmtDate, fmtPct } = useI18n()
  const cdays = useMemo(() => chronicleDays(days, rows, models), [days, rows, models])
  const s = useMemo(() => story(PLANS, days), [days])
  const map = useMemo(() => scrollMap(dayWeights(s, days.length)), [s, days.length])
  const last = days.length - 1
  const still = useStill()
  const [day, setDay] = useState(0)
  const shown = still ? last : day
  const wrapRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const stage = stageRef.current
    if (!wrap || !stage) return
    let raf = 0

    const measure = () => {
      raf = 0
      const rect = wrap.getBoundingClientRect()
      if (still) {
        // Flat and finished: the tape reads the first day until the record is in view, then the last.
        const reached = rect.top < innerHeight * 0.5
        setPlayhead(reached ? { day: last, phase: 'after' } : { day: 0, phase: 'before' })
        return
      }
      const travel = Math.max(1, rect.height - stage.offsetHeight)
      const p = (tapeOffset(stage) - rect.top) / travel
      const d = map.dayAt(p)
      setPlayhead({ day: Math.round(d * 100) / 100, phase: p <= 0 ? 'before' : p >= 1 ? 'after' : 'chronicle' })
      setDay(Math.floor(d))
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    measure()
    addEventListener('scroll', schedule, { passive: true })
    addEventListener('resize', schedule)

    registerJump((target) => {
      const rect = wrap.getBoundingClientRect()
      const top = rect.top + scrollY - tapeOffset(stage)
      if (still) return scrollTo({ top, behavior: 'auto' })
      const travel = Math.max(1, rect.height - stage.offsetHeight)
      // Land a third of the way into the day's slice, so the day is printed and the tape reads it.
      scrollTo({ top: top + map.progressAt(target + 0.34) * travel + 1, behavior: 'smooth' })
    })

    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', schedule)
      removeEventListener('resize', schedule)
      registerJump(null)
    }
  }, [still, map, last])

  const base = plans[0]
  const upgrade = plans[1]
  const switchDate = days[s.switchIdx]?.date
  const record = fmtUsd(s.record.cost)
  const top = (p: PlanSummary | undefined) => p?.modelMix[0]

  const copy: Record<ChapterId, { kicker?: string; headline: string; body: string; note?: ReactNode }> = {
    pro: {
      headline: t.chronicle.pro.headline(base.plan.name),
      body: t.chronicle.pro.body(base.plan.name, base.activeDays, fmtUsd(base.costPerActiveDay)),
      note: top(base) && (
        <>
          <i className="swatch" style={{ background: modelColor(top(base)!.model) }} />
          {t.chronicle.pro.note(top(base)!.model, fmtPct(top(base)!.share))}
        </>
      ),
    },
    lull: {
      headline: t.chronicle.lull.headline,
      body: t.chronicle.lull.body(base.plan.name, record, fmtDate(days[s.record.idx].date, { day: 'numeric', month: 'long' })),
    },
    switch: {
      kicker: switchDate && t.chronicle.switch.kicker(fmtDate(switchDate, { day: 'numeric', month: 'long' })),
      headline: t.chronicle.switch.headline(upgrade?.plan.name ?? PLANS[1].name),
      body: t.chronicle.switch.body(base.plan.name, record),
    },
    max: {
      headline: t.chronicle.max.headline(upgrade?.plan.name ?? PLANS[1].name),
      body: upgrade
        ? t.chronicle.max.body(top(upgrade)!.model, fmtPct(top(upgrade)!.share), fmtUsd(upgrade.costPerActiveDay))
        : '',
    },
  }
  const chapters = chapterRanges(s, days.length)
  const active = chapterAt(s, shown)

  return (
    <section id="record" data-sc-act="pin" className="record" data-still={still} aria-labelledby="record-title">
      <div className="rc-wrap" ref={wrapRef}>
        {/* The verification harness reads this to tell a printing chart from dead scroll. */}
        <div className="rc-stage" ref={stageRef} data-sc-stage data-sc-verify-state={`day ${shown} ${active}`}>
          <header className="rc-head">
            <h2 id="record-title" className="rc-label">
              {t.daily.title}
            </h2>
            <Legend items={models.map((m) => ({ label: m, color: modelColor(m) }))} />
          </header>

          <div className="rc-copy">
            {chapters.map(({ id }) => {
              const c = copy[id]
              const on = still || id === active
              return (
                <article key={id} className="rc-chapter" data-chapter={id} data-on={on} aria-hidden={!on}>
                  {c.kicker && <p className="rc-kicker">{c.kicker}</p>}
                  <h3 className="rc-headline">{c.headline}</h3>
                  <p className="rc-body">{c.body}</p>
                  {c.note && <p className="rc-note">{c.note}</p>}
                </article>
              )
            })}
          </div>

          <DailyChart days={cdays} story={s} plans={PLANS} shown={shown} />
          <ModelMix days={cdays} plans={plans} shown={shown} />
        </div>
      </div>

      <details className="data-table rc-numbers">
        <summary>{t.showNumbers}</summary>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">{t.daily.date}</th>
                {models.map((m) => (
                  <th scope="col" key={m}>
                    {m}
                  </th>
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
