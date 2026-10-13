import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert'
import enDict from '../locales/en.json' with { type: 'json' }
import teDict from '../locales/te.json' with { type: 'json' }
import hiDict from '../locales/hi.json' with { type: 'json' }
import {
  STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  getValidLanguage,
  resolveNestedKey,
  translate,
} from '../context/languageConfig.js'

// In-memory localStorage mock for node test runner
class LocalStorageMock {
  constructor() {
    this.store = {}
  }
  getItem(key) {
    return this.store[key] || null
  }
  setItem(key, value) {
    this.store[key] = String(value)
  }
  removeItem(key) {
    delete this.store[key]
  }
  clear() {
    this.store = {}
  }
}

const mockStorage = new LocalStorageMock()
globalThis.localStorage = mockStorage

describe('Multilingual Foundation — Language Management & Dictionaries', () => {

  beforeEach(() => {
    mockStorage.clear()
  })

  test('1. English is default when storage is empty or undefined', () => {
    assert.strictEqual(mockStorage.getItem(STORAGE_KEY), null)
    const initialLang = getValidLanguage(mockStorage.getItem(STORAGE_KEY))
    assert.strictEqual(initialLang, 'en')
  })

  test('2. Allows valid Telugu selection and persists to localStorage', () => {
    const lang = getValidLanguage('te')
    assert.strictEqual(lang, 'te')
    mockStorage.setItem(STORAGE_KEY, lang)
    assert.strictEqual(mockStorage.getItem(STORAGE_KEY), 'te')
  })

  test('3. Allows valid Hindi selection and persists to localStorage', () => {
    const lang = getValidLanguage('hi')
    assert.strictEqual(lang, 'hi')
    mockStorage.setItem(STORAGE_KEY, lang)
    assert.strictEqual(mockStorage.getItem(STORAGE_KEY), 'hi')
  })

  test('4. Falls back to English on invalid, unsupported, or corrupted language codes', () => {
    assert.strictEqual(getValidLanguage('fr'), 'en')
    assert.strictEqual(getValidLanguage('es'), 'en')
    assert.strictEqual(getValidLanguage('zh'), 'en')
    assert.strictEqual(getValidLanguage(''), 'en')
    assert.strictEqual(getValidLanguage(null), 'en')
    assert.strictEqual(getValidLanguage(undefined), 'en')
    assert.strictEqual(getValidLanguage('INVALID_LANG_CODE'), 'en')
  })

  test('5. Preserves saved language from localStorage across re-initialization', () => {
    mockStorage.setItem(STORAGE_KEY, 'te')
    const rehydrated = getValidLanguage(mockStorage.getItem(STORAGE_KEY))
    assert.strictEqual(rehydrated, 'te')

    mockStorage.setItem(STORAGE_KEY, 'hi')
    const rehydratedHi = getValidLanguage(mockStorage.getItem(STORAGE_KEY))
    assert.strictEqual(rehydratedHi, 'hi')
  })

  test('6. Verifies translation dictionaries contain non-empty common keys across en, te, hi', () => {
    const testKeys = [
      'app.name',
      'app.tagline',
      'nav.home',
      'nav.features',
      'nav.about',
      'nav.schemes',
      'nav.faqs',
      'nav.dashboard',
      'nav.login',
      'nav.register',
      'nav.logout',
      'nav.switchToLight',
      'nav.switchToDark',
      'nav.toggleTheme',
      'nav.toggleMobileNav',
      'common.language',
      'common.save',
      'common.cancel',
      'common.submit',
      'common.loading',
      'common.error',
      'common.networkError'
    ]

    for (const key of testKeys) {
      const enVal = resolveNestedKey(enDict, key)
      const teVal = resolveNestedKey(teDict, key)
      const hiVal = resolveNestedKey(hiDict, key)

      assert.ok(enVal && enVal.trim().length > 0, `Missing EN key: ${key}`)
      assert.ok(teVal && teVal.trim().length > 0, `Missing TE key: ${key}`)
      assert.ok(hiVal && hiVal.trim().length > 0, `Missing HI key: ${key}`)
    }
  })

  test('7. Verifies Telugu values contain genuine Telugu script characters', () => {
    const teluguRegex = /[\u0C00-\u0C7F]/
    assert.ok(teluguRegex.test(teDict.app.name), 'Telugu app name must contain Telugu script')
    assert.ok(teluguRegex.test(teDict.nav.dashboard), 'Telugu dashboard must contain Telugu script')
    assert.ok(teluguRegex.test(teDict.common.save), 'Telugu save must contain Telugu script')
    assert.strictEqual(teDict.common.save, 'సేవ్ చేయండి')
    assert.strictEqual(teDict.common.cancel, 'రద్దు చేయండి')
    assert.strictEqual(teDict.common.submit, 'సమర్పించండి')
  })

  test('8. Verifies Hindi values contain genuine Devanagari script characters', () => {
    const devanagariRegex = /[\u0900-\u097F]/
    assert.ok(devanagariRegex.test(hiDict.app.name), 'Hindi app name must contain Devanagari script')
    assert.ok(devanagariRegex.test(hiDict.nav.dashboard), 'Hindi dashboard must contain Devanagari script')
    assert.ok(devanagariRegex.test(hiDict.common.save), 'Hindi save must contain Devanagari script')
    assert.strictEqual(hiDict.common.save, 'सहेजें')
    assert.strictEqual(hiDict.common.cancel, 'रद्द करें')
    assert.strictEqual(hiDict.common.submit, 'जमा करें')
  })

  test('9. Missing translation key in foreign locale falls back cleanly to English', () => {
    const teVal = translate('te', 'common.save')
    assert.strictEqual(teVal, 'సేవ్ చేయండి')

    const fallbackVal = translate('fr', 'common.save')
    assert.strictEqual(fallbackVal, 'Save')

    const nonExistent = translate('te', 'unknown.section.label', 'Default Text')
    assert.strictEqual(nonExistent, 'Default Text')

    const nonExistentKeyOnly = translate('te', 'unknown.key.only')
    assert.strictEqual(nonExistentKeyOnly, 'unknown.key.only')
  })

  test('10. Supported languages contract and accessibility labels', () => {
    assert.strictEqual(SUPPORTED_LANGUAGES.length, 3)
    const codes = SUPPORTED_LANGUAGES.map(l => l.code)
    assert.deepStrictEqual(codes, ['en', 'te', 'hi'])

    const nativeLabels = SUPPORTED_LANGUAGES.map(l => l.nativeName)
    assert.deepStrictEqual(nativeLabels, ['English', 'తెలుగు', 'हिन्दी'])
  })

  test('11. Shared Navbar labels localize cleanly across en, te, hi', () => {
    const navKeys = [
      'nav.home',
      'nav.features',
      'nav.about',
      'nav.schemes',
      'nav.faqs',
      'nav.login',
      'nav.register',
      'nav.switchToLight',
      'nav.switchToDark',
      'nav.toggleTheme',
      'nav.toggleMobileNav'
    ]

    for (const k of navKeys) {
      const enVal = translate('en', k)
      const teVal = translate('te', k)
      const hiVal = translate('hi', k)

      assert.ok(enVal && enVal.length > 0, `Missing EN for ${k}`)
      assert.ok(teVal && teVal.length > 0, `Missing TE for ${k}`)
      assert.ok(hiVal && hiVal.length > 0, `Missing HI for ${k}`)
      assert.notStrictEqual(teVal, enVal, `Telugu translation should differ from English for ${k}`)
      assert.notStrictEqual(hiVal, enVal, `Hindi translation should differ from English for ${k}`)
    }
  })

  test('12. Shared DashboardHeader labels localize cleanly across en, te, hi', () => {
    const headerKeys = [
      'dashboard.farmerDashboard',
      'dashboard.subtitle',
      'dashboard.searchPlaceholder',
      'dashboard.notifications',
      'dashboard.openSidebar',
      'common.farmerRole'
    ]

    for (const k of headerKeys) {
      const enVal = translate('en', k)
      const teVal = translate('te', k)
      const hiVal = translate('hi', k)

      assert.ok(enVal && enVal.length > 0, `Missing EN for ${k}`)
      assert.ok(teVal && teVal.length > 0, `Missing TE for ${k}`)
      assert.ok(hiVal && hiVal.length > 0, `Missing HI for ${k}`)
      assert.notStrictEqual(teVal, enVal, `Telugu translation should differ from English for ${k}`)
      assert.notStrictEqual(hiVal, enVal, `Hindi translation should differ from English for ${k}`)
    }
  })

  test('13. Shared DashboardSidebar groups, nav items, and sign out localize cleanly across en, te, hi', () => {
    const sidebarKeys = [
      'sidebar.subtitle',
      'sidebar.closeSidebar',
      'sidebar.groupMain',
      'sidebar.groupFeatures',
      'sidebar.groupAccount',
      'sidebar.dashboard',
      'sidebar.cropRecommendation',
      'sidebar.weatherClimate',
      'sidebar.marketIntelligence',
      'sidebar.governmentSchemes',
      'sidebar.diseaseGuidance',
      'sidebar.aiAssistant',
      'sidebar.oversupplyRisk',
      'sidebar.alternativeCrops',
      'sidebar.decisionLab',
      'sidebar.supplyDemand',
      'sidebar.myProfile',
      'sidebar.myDecisions',
      'sidebar.helpFeedback',
      'sidebar.signOut'
    ]

    for (const k of sidebarKeys) {
      const enVal = translate('en', k)
      const teVal = translate('te', k)
      const hiVal = translate('hi', k)

      assert.ok(enVal && enVal.length > 0, `Missing EN for ${k}`)
      assert.ok(teVal && teVal.length > 0, `Missing TE for ${k}`)
      assert.ok(hiVal && hiVal.length > 0, `Missing HI for ${k}`)
      assert.notStrictEqual(teVal, enVal, `Telugu translation should differ from English for ${k}`)
      assert.notStrictEqual(hiVal, enVal, `Hindi translation should differ from English for ${k}`)
    }
  })
})
