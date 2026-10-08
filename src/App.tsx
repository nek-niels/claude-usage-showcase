import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { PLANS } from './config/plans'
import { dailySeries, rereadSeries, summarizePlans } from './lib/aggregate'
import { usage } from './lib/usage'
import { Hero } from './components/Hero'
import { PlanComparison } from './components/PlanComparison'
import { PerDayComparison } from './components/PerDayComparison'
import { DailyChart } from './components/DailyChart'
import { ModelMix } from './components/ModelMix'
import { TokenBreakdown } from './components/TokenBreakdown'
import { RereadChart } from './components/RereadChart'
import { Methodology } from './components/Methodology'
import { LanguageSwitch } from './components/LanguageSwitch'
import { useI18n } from './i18n'
import { prefersReducedMotion } from './lib/motion'

const plans = summarizePlans(PLANS, usage.daily)
const { rows, models } = dailySeries(PLANS, usage.daily)
const rereadRows = rereadSeries(PLANS, usage.daily)

type Theme = 'light' | 'dark'

function initialTheme(): Theme {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const { t } = useI18n()

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
      <nav className="topbar">
        <span className="brand">{t.topbar.brand}</span>
        <div className="topbar-controls">
          <LanguageSwitch />
          <button type="button" className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? t.topbar.toLight : t.topbar.toDark}
          </button>
        </div>
      </nav>
      <main>
        <Hero plans={plans} />
        <PerDayComparison plans={plans} />
        <DailyChart rows={rows} models={models} plans={plans} />
        <ModelMix plans={plans} />
        <PlanComparison plans={plans} />
        <TokenBreakdown plans={plans} />
        <RereadChart rows={rereadRows} plans={plans} />
      </main>
      <Methodology plans={plans} total={usage.totals.totalCost} />
    </div>
  )
}
