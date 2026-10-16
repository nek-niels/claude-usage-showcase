import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { PLANS } from './config/plans'
import { dailySeries, rereadSeries, summarizePlans } from './lib/aggregate'
import { ledger } from './lib/ledger'
import { usage } from './lib/usage'
import { Masthead } from './components/Masthead'
import { Hero } from './components/Hero'
import { Chronicle } from './components/Chronicle'
import { PerDayComparison } from './components/PerDayComparison'
import { CacheSpread } from './components/CacheSpread'
import { ClosingBell } from './components/ClosingBell'
import { prefersReducedMotion } from './lib/motion'

const plans = summarizePlans(PLANS, usage.daily)
const { rows, models } = dailySeries(PLANS, usage.daily)
const rereadRows = rereadSeries(PLANS, usage.daily)
const days = ledger(PLANS, usage.daily)

export type Theme = 'light' | 'dark'

function initialTheme(): Theme {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * One broadsheet edition. The tape in the masthead carries the dateline of the day being read: the
 * chronicle drives it through the calendar (see lib/playhead), and every other story sits before or after.
 * Story ids are the tape's index: front, record, average-day, cache, closing.
 */
export default function App() {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  // Crossfade the whole page between themes where the browser can, instead of every colour snapping at once.
  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    if (!document.startViewTransition || prefersReducedMotion()) return setTheme(next)
    document.startViewTransition(() => {
      flushSync(() => setTheme(next))
      document.documentElement.dataset.theme = next
    })
  }

  return (
    <div className="page">
      <Masthead plans={plans} days={days} theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Hero plans={plans} days={days} />
        <Chronicle rows={rows} models={models} plans={plans} days={days} />
        <PerDayComparison plans={plans} />
        <CacheSpread plans={plans} rereadRows={rereadRows} />
        <ClosingBell plans={plans} days={days} total={usage.totals.totalCost} />
      </main>
    </div>
  )
}
