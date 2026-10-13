import enTranslations from '../locales/en.json' with { type: 'json' }
import teTranslations from '../locales/te.json' with { type: 'json' }
import hiTranslations from '../locales/hi.json' with { type: 'json' }

export const STORAGE_KEY = 'kisanmitra_language'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'te', label: 'తెలుగు', nativeName: 'తెలుగు' },
  { code: 'hi', label: 'हिन्दी', nativeName: 'हिन्दी' },
]

export const DICTIONARIES = {
  en: enTranslations,
  te: teTranslations,
  hi: hiTranslations,
}

const VALID_CODES = new Set(['en', 'te', 'hi'])

export const getValidLanguage = (langCode) => {
  if (langCode && VALID_CODES.has(langCode)) {
    return langCode
  }
  return 'en'
}

export const resolveNestedKey = (obj, path) => {
  if (!obj || !path) return undefined
  const keys = path.split('.')
  let current = obj
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k]
    } else {
      return undefined
    }
  }
  return typeof current === 'string' ? current : undefined
}

export const translate = (lang, keyPath, defaultFallback = '') => {
  const currentDict = DICTIONARIES[lang] || DICTIONARIES.en
  const translated = resolveNestedKey(currentDict, keyPath)

  if (translated !== undefined && translated !== '') {
    return translated
  }

  const fallbackVal = resolveNestedKey(DICTIONARIES.en, keyPath)
  if (fallbackVal !== undefined && fallbackVal !== '') {
    return fallbackVal
  }

  return defaultFallback || keyPath
}
