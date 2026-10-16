import type { CSSProperties } from 'react'
import type { PlanSummary } from '../lib/aggregate'
import type { LedgerDay } from '../lib/ledger'
import { useI18n } from '../i18n'
import { useReveal } from '../lib/motion'
import { CountUp } from './CountUp'
import { Methodology } from './Methodology'
import { PlanComparison } from './PlanComparison'
import '../styles/close.css'

/** The closing figures tick for this long, the multiple a beat after the two amounts it is made of. */
const COUNT_MS = 1400
const STAGGER_MS = 80
const MULTIPLE_DELAY_MS = 2 * STAGGER_MS + 120

/**
 * The closing bell: the verdict, the closing ledger, the plans side by side, and the colophon. The ledger
 * reads the last ledger day, the same row the tape stops on, so the tape and the ledger land on one set of
 * figures. `total` is the export's own grand total; it equals the last day's running total and is unused.
 */
export function ClosingBell({ plans, days }: { plans: PlanSummary[]; days: LedgerDay[]; total: number }) {
  const { t, fmtDate, fmtRatio, fmtUsd } = useI18n()
  const [ref, reveal] = useReveal<HTMLDivElement>(MULTIPLE_DELAY_MS + COUNT_MS + 200)
  const first = days[0]
  const last = days[days.length - 1]
  if (!first || !last) return null

  const c = t.close
  const longDate = { day: 'numeric', month: 'short', year: 'numeric' } as const
  const from = fmtDate(first.date)
  const to = fmtDate(last.date, longDate)
  const multiple = last.cumPaid > 0 ? last.cumCost / last.cumPaid : 0
  const base = plans[0]
  const upgrade = plans[plans.length - 1]

  const figures = [
    { key: 'usage', label: c.usage, note: c.usageNote, value: last.cumCost, format: (n: number) => fmtUsd(n) },
    {
      key: 'paid',
      label: c.paid,
      note: c.paidNote(base.plan.name, upgrade.plan.name),
      value: last.cumPaid,
      // Whole dollars, as on the tape: both read the same ledger row and print it the same way.
      format: (n: number) => fmtUsd(n),
    },
    { key: 'multiple', label: c.multiple, note: c.multipleNote, value: multiple, format: fmtRatio },
  ]

  return (
    <section id="closing" data-sc-act="flow" className="close" aria-labelledby="close-title">
      <h2 id="close-title" className="close-headline">
        {c.headline(upgrade.plan.name)}
      </h2>
      <p className="close-standfirst">{c.standfirst(fmtDate(last.date, longDate), days.length)}</p>

      <div ref={ref} className="close-ledger" data-reveal={reveal}>
        <p className="close-ledger-head">
          <span>{c.ledgerTitle}</span>
          <span>{c.ledgerRange(from, to)}</span>
        </p>
        <dl className="close-figures">
          {figures.map((f, i) => (
            <div
              key={f.key}
              className={`close-figure close-figure--${f.key}`}
              style={{ '--i': i } as CSSProperties}
            >
              <dt>{f.label}</dt>
              <dd className="close-value">
                <CountUp
                  value={f.value}
                  format={f.format}
                  state={reveal}
                  delay={f.key === 'multiple' ? MULTIPLE_DELAY_MS : i * STAGGER_MS}
                  duration={COUNT_MS}
                />
              </dd>
              <dd className="close-note">{f.note}</dd>
            </div>
          ))}
        </dl>
      </div>

      <PlanComparison plans={plans} />
      <Methodology plans={plans} total={last.cumCost} from={first.date} to={last.date} />
    </section>
  )
}
