import { useEffect, useRef, type CSSProperties, type RefObject } from 'react'
import type { PlanSummary } from '../lib/aggregate'
import { planColor } from '../lib/colors'
import type { LedgerDay } from '../lib/ledger'
import { useI18n } from '../i18n'
import { prefersReducedMotion, useReveal } from '../lib/motion'
import { CountUp } from './CountUp'
import '../styles/front.css'

/** Each plan's bar starts this much after the one above it. */
const STAGGER_MS = 120
const FILL_MS = 800

/** A round axis step that gives the chart three or four gridlines. */
function axisStep(top: number): number {
  const raw = top / 3.5
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].find((s) => s * mag >= raw) ?? 10
  return step * mag
}

/**
 * Writes how far the front page has scrolled (px) to `--front-y`, once per frame and only while it is on
 * screen. CSS turns that into the planes' different rates; nothing re-renders.
 */
function useFrontDepth(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    let raf = 0
    let written = -1
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      if (r.bottom < -200) return
      const y = Math.max(0, Math.min(scrollY, scrollY + r.bottom))
      const rounded = Math.round(y * 2) / 2
      if (rounded === written) return
      written = rounded
      el.style.setProperty('--front-y', `${rounded}px`)
      el.style.setProperty('--front-p', (rounded / Math.max(1, r.height)).toFixed(4))
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    addEventListener('scroll', schedule, { passive: true })
    addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', schedule)
      removeEventListener('resize', schedule)
    }
  }, [ref])
}

/**
 * The front page. Three planes: the ratio printed enormous at the back in a low ink tone, the headline and
 * deck at reading speed in front of it, and the chart of the day. On scroll the numeral recedes more slowly
 * than the page and the chart rides slightly ahead, so the front page separates into depth as it leaves.
 */
export function Hero({ plans, days }: { plans: PlanSummary[]; days: LedgerDay[] }) {
  const { t, fmtDate, fmtPct, fmtRatio, fmtUsd } = useI18n()
  const first = plans[0]
  const last = plans[plans.length - 1]
  const ratio = last.costPerActiveDay / first.costPerActiveDay
  const top = Math.max(...plans.map((p) => p.costPerActiveDay))
  const step = axisStep(top)
  const axisMax = Math.ceil(top / step) * step
  const ticks = Array.from({ length: Math.round(axisMax / step) + 1 }, (_, i) => i * step)
  const lead = last.modelMix[0]
  const activeDays = days.filter((d) => d.active).length
  const sectionRef = useRef<HTMLElement>(null)
  const [chartRef, reveal] = useReveal<HTMLElement>(FILL_MS + STAGGER_MS * plans.length)
  useFrontDepth(sectionRef)

  return (
    <section ref={sectionRef} id="front" data-sc-act="flow" className="front" aria-labelledby="front-headline">
      <div className="front-numeral front-plane" aria-hidden="true">
        <span>{fmtRatio(ratio)}</span>
      </div>

      <p className="front-dateline">
        {t.hero.kicker(
          fmtDate(first.from, { day: 'numeric', month: 'long' }),
          fmtDate(last.to, { day: 'numeric', month: 'long', year: 'numeric' }),
          activeDays,
          days.length,
        )}
      </p>
      <h1 id="front-headline" className="front-headline">
        {t.hero.headline(last.plan.name, fmtRatio(ratio), first.plan.name)}
      </h1>

      <div className="front-columns">
        <p className="front-deck">{t.hero.sub(last.plan.name, fmtPct(lead.share), lead.model)}</p>

        <figure
          ref={chartRef}
          className="front-chart front-plane"
          data-reveal={reveal}
          aria-label={t.hero.barsLabel}
          style={{ '--rows': plans.length } as CSSProperties}
        >
          <div className="front-chart-head">
            <span className="front-chart-title">{t.hero.chartTitle}</span>
            <span className="front-chart-unit">{t.hero.chartUnit}</span>
          </div>
          <div className="front-chart-plot">
            <div className="front-chart-grid" aria-hidden="true">
              {ticks.map((v) => (
                <span key={v} style={{ '--x': v / axisMax } as CSSProperties}>
                  <i>{fmtUsd(v)}</i>
                </span>
              ))}
            </div>
            {plans.map((p, i) => (
              <div className="front-chart-row" key={p.plan.id} style={{ '--delay': `${i * STAGGER_MS}ms`, '--r': i + 2 } as CSSProperties}>
                <span className="front-chart-plan">{p.plan.name}</span>
                <span className="front-chart-track">
                  <span
                    className="front-chart-bar"
                    style={{ width: `${(p.costPerActiveDay / axisMax) * 100}%`, background: planColor(p.plan.id) }}
                  />
                </span>
                <span className="front-chart-value">
                  <CountUp value={p.costPerActiveDay} format={(n) => fmtUsd(n)} state={reveal} delay={i * STAGGER_MS} duration={FILL_MS} />
                </span>
              </div>
            ))}
          </div>
          <figcaption className="front-chart-note">
            {t.hero.caption(first.plan.name, first.activeDays, last.plan.name, last.activeDays)}
          </figcaption>
          <p className="front-chart-source">{t.hero.source}</p>
        </figure>
      </div>
    </section>
  )
}
