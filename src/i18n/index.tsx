import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { formatters, type Formatters } from '../lib/format'
import { da } from './da'
import { en, type Dict } from './en'

export type Lang = 'en' | 'da'

export const LANGS: Lang[] = ['en', 'da']
export const DICTS: Record<Lang, Dict> = { en, da }
const FORMATS: Record<Lang, Formatters> = { en: formatters('en-US'), da: formatters('da-DK') }

function initialLang(): Lang {
  const stored = localStorage.getItem('lang')
  if (stored === 'en' || stored === 'da') return stored
  return navigator.language.toLowerCase().startsWith('da') ? 'da' : 'en'
}

type I18n = Formatters & { lang: Lang; setLang: (lang: Lang) => void; t: Dict }

const I18nContext = createContext<I18n | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = DICTS[lang].title
    localStorage.setItem('lang', lang)
  }, [lang])

  const value = useMemo(() => ({ ...FORMATS[lang], lang, setLang, t: DICTS[lang] }), [lang])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

/** The current language's copy (`t`) and number/date formatters. */
export function useI18n(): I18n {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <LanguageProvider>')
  return ctx
}
