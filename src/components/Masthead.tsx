import type { Theme } from '../App'
import type { PlanSummary } from '../lib/aggregate'
import type { LedgerDay } from '../lib/ledger'
import { useI18n } from '../i18n'
import { LanguageSwitch } from './LanguageSwitch'
import { Tape } from './Tape'
import '../styles/front.css'

/**
 * The nameplate, its two ears and the double rule, then the tape. They are siblings rather than one block so
 * the tape can stick for the whole page: a sticky element only sticks inside its parent, and the parent here
 * is the page column.
 */
export function Masthead({
  plans,
  days,
  theme,
  onToggleTheme,
}: {
  plans: PlanSummary[]
  days: LedgerDay[]
  theme: Theme
  onToggleTheme: () => void
}) {
  const { t, fmtDate } = useI18n()
  const last = days[days.length - 1]

  return (
    <>
      <header className="mast">
        <div className="mast-ear mast-ear--edition">
          <span className="mast-subject">{t.topbar.subject}</span>
          {last && (
            <span className="mast-edition">
              <span className="mast-edition-long">
                {t.topbar.edition(fmtDate(last.date, { day: 'numeric', month: 'long', year: 'numeric' }))}
              </span>
              <span className="mast-edition-short">
                {t.topbar.edition(fmtDate(last.date, { day: 'numeric', month: 'short', year: 'numeric' }))}
              </span>
            </span>
          )}
        </div>
        <p className="mast-name">{t.topbar.brand}</p>
        <div className="mast-ear mast-ear--controls">
          <LanguageSwitch />
          <button type="button" className="mast-toggle switch-button" onClick={onToggleTheme}>
            {theme === 'dark' ? t.topbar.toLight : t.topbar.toDark}
          </button>
        </div>
      </header>
      <Tape plans={plans} days={days} />
    </>
  )
}
