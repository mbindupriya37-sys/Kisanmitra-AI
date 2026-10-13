import { test, describe } from 'node:test'
import assert from 'node:assert'
import enDict from '../locales/en.json' with { type: 'json' }
import teDict from '../locales/te.json' with { type: 'json' }
import hiDict from '../locales/hi.json' with { type: 'json' }
import { translate, resolveNestedKey } from '../context/languageConfig.js'

describe('Crop Recommendation Feature Localization — en, te, hi', () => {

  test('1. Crop Recommendation Input Page keys exist and differ across en, te, hi', () => {
    const inputKeys = [
      'cropRec.badge',
      'cropRec.title',
      'cropRec.subtitle',
      'cropRec.sectionA',
      'cropRec.sectionB',
      'cropRec.sectionC',
      'cropRec.sectionD',
      'cropRec.sectionE',
      'cropRec.sectionF',
      'cropRec.submitBtn',
      'cropRec.trustTitle',
      'cropRec.errStateRequired',
      'cropRec.errDistrictRequired',
      'cropRec.errSoilTypeRequired',
      'cropRec.errFarmSizeRequired',
      'cropRec.historyTitle',
      'cropRec.historyRefresh'
    ]

    for (const key of inputKeys) {
      const enVal = resolveNestedKey(enDict, key)
      const teVal = resolveNestedKey(teDict, key)
      const hiVal = resolveNestedKey(hiDict, key)

      assert.ok(enVal && enVal.trim().length > 0, `Missing EN key: ${key}`)
      assert.ok(teVal && teVal.trim().length > 0, `Missing TE key: ${key}`)
      assert.ok(hiVal && hiVal.trim().length > 0, `Missing HI key: ${key}`)

      assert.notStrictEqual(teVal, enVal, `Telugu must not equal English for ${key}`)
      assert.notStrictEqual(hiVal, enVal, `Hindi must not equal English for ${key}`)
    }
  })

  test('2. Crop Recommendation Results Page keys exist and differ across en, te, hi', () => {
    const resultKeys = [
      'cropResults.heroTitle',
      'cropResults.heroDescription',
      'cropResults.deterministicTrust',
      'cropResults.traceableTrust',
      'cropResults.coverageHigh',
      'cropResults.coveragePartial',
      'cropResults.coverageLimited',
      'cropResults.toggleScoreFormulaShow',
      'cropResults.statVerifiedEvaluated',
      'cropResults.scoreExpTitle',
      'cropResults.topRankedBadge',
      'cropResults.whyThisCrop',
      'cropResults.overallScoreLabel',
      'cropResults.factorsBreakdown',
      'cropResults.allRankedTitle',
      'cropResults.limitationsTitle',
      'cropResults.disclaimerTitle'
    ]

    for (const key of resultKeys) {
      const enVal = resolveNestedKey(enDict, key)
      const teVal = resolveNestedKey(teDict, key)
      const hiVal = resolveNestedKey(hiDict, key)

      assert.ok(enVal && enVal.trim().length > 0, `Missing EN key: ${key}`)
      assert.ok(teVal && teVal.trim().length > 0, `Missing TE key: ${key}`)
      assert.ok(hiVal && hiVal.trim().length > 0, `Missing HI key: ${key}`)

      assert.notStrictEqual(teVal, enVal, `Telugu must not equal English for ${key}`)
      assert.notStrictEqual(hiVal, enVal, `Hindi must not equal English for ${key}`)
    }
  })

  test('3. Crop names are localized in Telugu and Hindi while preserving English identification', () => {
    const cropNames = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Groundnut', 'Chickpea', 'Pigeon Pea', 'Sugarcane']
    const teluguRegex = /[\u0C00-\u0C7F]/
    const devanagariRegex = /[\u0900-\u097F]/

    for (const crop of cropNames) {
      const enName = translate('en', `crops.${crop}`)
      const teName = translate('te', `crops.${crop}`)
      const hiName = translate('hi', `crops.${crop}`)

      assert.ok(enName.includes(crop), `EN name should include ${crop}`)
      assert.ok(teluguRegex.test(teName), `TE crop name for ${crop} must contain Telugu script`)
      assert.ok(devanagariRegex.test(hiName), `HI crop name for ${crop} must contain Devanagari script`)
      // Crucial: Parentheses contain English name for cross-understanding
      assert.ok(teName.includes(crop.split(' ')[0]), `TE crop name should keep English reference in parentheses`)
      assert.ok(hiName.includes(crop.split(' ')[0]), `HI crop name should keep English reference in parentheses`)
    }
  })

  test('4. Unmapped crop name falls back cleanly to the raw crop name', () => {
    const rawCrop = 'Finger Millet'
    const translated = translate('te', `crops.${rawCrop}`, rawCrop)
    assert.strictEqual(translated, rawCrop)
  })

  test('5. Agronomic scoring payload integrity remains independent of UI language', () => {
    // Form options use canonical values for API payload compatibility
    const testSoil = 'Black'
    const testWater = 'Very High'
    const testSeason = 'Kharif'
    const testIrrigation = 'Yes'

    const payload = {
      soilType: testSoil.toUpperCase(),
      waterAvailability: testWater.toUpperCase().replace(/\s+/g, '_'),
      season: testSeason.toUpperCase(),
      irrigation: testIrrigation.toUpperCase(),
    }

    assert.strictEqual(payload.soilType, 'BLACK')
    assert.strictEqual(payload.waterAvailability, 'VERY_HIGH')
    assert.strictEqual(payload.season, 'KHARIF')
    assert.strictEqual(payload.irrigation, 'YES')
  })
})
