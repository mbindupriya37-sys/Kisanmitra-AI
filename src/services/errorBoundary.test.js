import { test, describe } from 'node:test'
import assert from 'node:assert'
import enDict from '../locales/en.json' with { type: 'json' }
import teDict from '../locales/te.json' with { type: 'json' }
import hiDict from '../locales/hi.json' with { type: 'json' }
import { translate, resolveNestedKey } from '../context/languageConfig.js'
import {
  initialErrorBoundaryState,
  deriveErrorBoundaryState,
  resetErrorBoundaryState,
  sanitizeErrorForLogging,
} from '../components/errorBoundaryModel.js'

describe('React Error Boundary & Safeguard Verification', () => {

  test('1. ErrorBoundary state machine: deriveErrorBoundaryState captures errors and transitions to hasError: true', () => {
    const errorInstance = new Error('Test agricultural rendering failure')
    const derivedState = deriveErrorBoundaryState(errorInstance)

    assert.strictEqual(derivedState.hasError, true)
    assert.strictEqual(derivedState.error, errorInstance)
  })

  test('2. ErrorBoundary initial state provides normal rendering without error', () => {
    assert.strictEqual(initialErrorBoundaryState.hasError, false)
    assert.strictEqual(initialErrorBoundaryState.error, null)
  })

  test('3. resetErrorBoundaryState recovers back to normal state', () => {
    const resetState = resetErrorBoundaryState()

    assert.strictEqual(resetState.hasError, false)
    assert.strictEqual(resetState.error, null)
  })

  test('4. sanitizeErrorForLogging strictly strips sensitive messages and stack traces', () => {
    const secretError = new Error('Database password failed at jdbc:mysql://root:secret@localhost')
    const sanitized = sanitizeErrorForLogging(secretError)

    assert.strictEqual(sanitized.name, 'Error')
    assert.strictEqual(sanitized.message.includes('secret'), false, 'Sanitized error must never leak secrets')
    assert.strictEqual(sanitized.message.includes('password'), false, 'Sanitized error must never leak credentials')
    assert.strictEqual(sanitized.message, 'An unexpected rendering error occurred.')

    const nullSanitized = sanitizeErrorForLogging(null)
    assert.strictEqual(nullSanitized.name, 'UnknownError')
  })

  test('5. Localization keys for Error Boundary exist and are non-empty across EN, TE, and HI', () => {
    const expectedKeys = [
      'errorBoundary.badge',
      'errorBoundary.title',
      'errorBoundary.subtitle',
      'errorBoundary.recoveryAdvice',
      'errorBoundary.retryButton',
      'errorBoundary.dashboardButton',
      'errorBoundary.homeButton',
      'errorBoundary.helpNote'
    ]

    for (const key of expectedKeys) {
      const enVal = resolveNestedKey(enDict, key)
      const teVal = resolveNestedKey(teDict, key)
      const hiVal = resolveNestedKey(hiDict, key)

      assert.ok(enVal && enVal.trim().length > 0, `Missing EN key: ${key}`)
      assert.ok(teVal && teVal.trim().length > 0, `Missing TE key: ${key}`)
      assert.ok(hiVal && hiVal.trim().length > 0, `Missing HI key: ${key}`)

      assert.notStrictEqual(teVal, enVal, `Telugu key ${key} should differ from English`)
      assert.notStrictEqual(hiVal, enVal, `Hindi key ${key} should differ from English`)
    }
  })

  test('6. Telugu error boundary translations contain authentic Telugu script characters', () => {
    const teluguRegex = /[\u0C00-\u0C7F]/
    assert.ok(teluguRegex.test(teDict.errorBoundary.badge), 'Telugu badge must contain Telugu script')
    assert.ok(teluguRegex.test(teDict.errorBoundary.title), 'Telugu title must contain Telugu script')
    assert.ok(teluguRegex.test(teDict.errorBoundary.subtitle), 'Telugu subtitle must contain Telugu script')
    assert.ok(teluguRegex.test(teDict.errorBoundary.retryButton), 'Telugu retry must contain Telugu script')
    assert.ok(teluguRegex.test(teDict.errorBoundary.dashboardButton), 'Telugu dashboard must contain Telugu script')
  })

  test('7. Hindi error boundary translations contain authentic Devanagari script characters', () => {
    const devanagariRegex = /[\u0900-\u097F]/
    assert.ok(devanagariRegex.test(hiDict.errorBoundary.badge), 'Hindi badge must contain Devanagari script')
    assert.ok(devanagariRegex.test(hiDict.errorBoundary.title), 'Hindi title must contain Devanagari script')
    assert.ok(devanagariRegex.test(hiDict.errorBoundary.subtitle), 'Hindi subtitle must contain Devanagari script')
    assert.ok(devanagariRegex.test(hiDict.errorBoundary.retryButton), 'Hindi retry must contain Devanagari script')
    assert.ok(devanagariRegex.test(hiDict.errorBoundary.dashboardButton), 'Hindi dashboard must contain Devanagari script')
  })

  test('8. Translation helper resolves all Error Boundary keys across all 3 languages', () => {
    const languages = ['en', 'te', 'hi']
    for (const lang of languages) {
      const title = translate(lang, 'errorBoundary.title')
      const retry = translate(lang, 'errorBoundary.retryButton')
      const dash = translate(lang, 'errorBoundary.dashboardButton')

      assert.ok(title && title.length > 0)
      assert.ok(retry && retry.length > 0)
      assert.ok(dash && dash.length > 0)
    }
  })
})
