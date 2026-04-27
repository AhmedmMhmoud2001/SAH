import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from './translations.js'

const I18nContext = createContext(null)

function getInitialLang() {
  try {
    const stored = localStorage.getItem('sah_lang')
    if (stored === 'ar' || stored === 'en') return stored
  } catch {
    // ignore
  }
  return 'ar'
}

function interpolate(template, vars) {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, k) => {
    const v = vars[k]
    return v == null ? `{${k}}` : String(v)
  })
}

function getByPath(obj, path) {
  return path.split('.').reduce((acc, k) => (acc && acc[k] != null ? acc[k] : null), obj)
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang)

  useEffect(() => {
    try {
      localStorage.setItem('sah_lang', lang)
    } catch {
      // ignore
    }
    const dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
    document.documentElement.dir = dir
    document.body.dir = dir
  }, [lang])

  const api = useMemo(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr'
    const dict = translations[lang] ?? translations.ar

    function t(key, vars) {
      const raw = getByPath(dict, key) ?? getByPath(translations.ar, key) ?? key
      return typeof raw === 'string' ? interpolate(raw, vars) : String(raw)
    }

    return { lang, dir, setLang, t }
  }, [lang])

  return <I18nContext.Provider value={api}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    return { lang: 'ar', dir: 'rtl', setLang: () => {}, t: (k) => k }
  }
  return ctx
}

