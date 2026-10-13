import { createContext, useContext, useState } from 'react'
import {
  STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  getValidLanguage,
  translate,
} from './languageConfig'

export { SUPPORTED_LANGUAGES, getValidLanguage }

export const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return getValidLanguage(stored)
    } catch {
      return 'en'
    }
  })

  const setLanguage = (newLang) => {
    const valid = getValidLanguage(newLang)
    setLanguageState(valid)
    try {
      localStorage.setItem(STORAGE_KEY, valid)
    } catch (err) {
      console.warn('Could not persist language preference:', err)
    }
  }

  const t = (keyPath, defaultFallback = '') => {
    return translate(language, keyPath, defaultFallback)
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
