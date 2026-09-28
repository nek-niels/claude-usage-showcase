import type { ComponentType } from 'react'
import { LANGS, useI18n, type Lang } from '../i18n'

// Drawn as SVG because Windows does not render flag emoji.
function UnionJack() {
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <clipPath id="union-jack-clip">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#union-jack-clip)" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  )
}

function Dannebrog() {
  return (
    <svg viewBox="0 0 37 28" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="37" height="28" fill="#C8102E" />
      <path d="M12,0 h4 v28 h-4 z M0,12 h37 v4 h-37 z" fill="#fff" />
    </svg>
  )
}

const OPTIONS: Record<Lang, { name: string; Flag: ComponentType }> = {
  en: { name: 'English', Flag: UnionJack },
  da: { name: 'Dansk', Flag: Dannebrog },
}

export function LanguageSwitch() {
  const { lang, setLang, t } = useI18n()
  return (
    <div className="lang-switch" role="group" aria-label={t.topbar.language}>
      {LANGS.map((l) => {
        const { name, Flag } = OPTIONS[l]
        return (
          <button
            key={l}
            type="button"
            lang={l}
            aria-label={name}
            title={name}
            aria-pressed={lang === l}
            onClick={() => setLang(l)}
          >
            <Flag />
          </button>
        )
      })}
    </div>
  )
}
