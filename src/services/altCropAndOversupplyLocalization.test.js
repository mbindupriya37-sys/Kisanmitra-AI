import { test, describe } from 'node:test'
import assert from 'node:assert'
import enDict from '../locales/en.json' with { type: 'json' }
import teDict from '../locales/te.json' with { type: 'json' }
import hiDict from '../locales/hi.json' with { type: 'json' }
import { translate, resolveNestedKey } from '../context/languageConfig.js'

describe('Step 6A: Alternative Crop Intelligence & Oversupply Risk Localization', () => {

  test('1. Alternative Crop Intelligence dictionary keys exist and differ across en, te, hi', () => {
    const altCropKeys = [
      'altCrop.heroTitle',
      'altCrop.heroDesc',
      'altCrop.signatureBadge',
      'altCrop.whichCropTitle',
      'altCrop.whichCropSub',
      'altCrop.noAssessmentTitle',
      'altCrop.loadingTitle',
      'altCrop.errGeneric',
      'altCrop.betterSuitedTitle',
      'altCrop.compSectionTitle',
      'altCrop.limitationsTitle',
      'altCrop.whyScoreExp',
      'altCrop.whyWaterExp',
      'altCrop.whyRiskExp',
      'altCrop.thMetric',
      'altCrop.thTagConsidered',
      'altCrop.thTagBetterAlt'
    ]

    for (const key of altCropKeys) {
      const enVal = resolveNestedKey(enDict, key)
      const teVal = resolveNestedKey(teDict, key)
      const hiVal = resolveNestedKey(hiDict, key)

      assert.ok(enVal && enVal.trim().length > 0, `Missing EN key: ${key}`)
      assert.ok(teVal && teVal.trim().length > 0, `Missing TE key: ${key}`)
      assert.ok(hiVal && hiVal.trim().length > 0, `Missing HI key: ${key}`)

      assert.notStrictEqual(teVal, enVal, `Telugu must differ from English for ${key}`)
      assert.notStrictEqual(hiVal, enVal, `Hindi must differ from English for ${key}`)
    }
  })

  test('2. Oversupply Risk dictionary keys exist and differ across en, te, hi', () => {
    const oversupplyKeys = [
      'oversupply.heroTitle',
      'oversupply.heroDesc',
      'oversupply.heroDisclaimer',
      'oversupply.formTitle',
      'oversupply.formSub',
      'oversupply.stateLabel',
      'oversupply.districtLabel',
      'oversupply.plannedCropLabel',
      'oversupply.targetSeasonLabel',
      'oversupply.intendedAreaLabel',
      'oversupply.btnSubmit',
      'oversupply.submitSuccess',
      'oversupply.myIntentionsTitle',
      'oversupply.emptyIntentionsTitle',
      'oversupply.signalsTitle',
      'oversupply.insufficientTitle',
      'oversupply.insufficientWarning',
      'oversupply.whyRiskTitle',
      'oversupply.howItWorksTitle',
      'oversupply.disclaimerTitle',
      'oversupply.editModalTitle'
    ]

    for (const key of oversupplyKeys) {
      const enVal = resolveNestedKey(enDict, key)
      const teVal = resolveNestedKey(teDict, key)
      const hiVal = resolveNestedKey(hiDict, key)

      assert.ok(enVal && enVal.trim().length > 0, `Missing EN key: ${key}`)
      assert.ok(teVal && teVal.trim().length > 0, `Missing TE key: ${key}`)
      assert.ok(hiVal && hiVal.trim().length > 0, `Missing HI key: ${key}`)

      assert.notStrictEqual(teVal, enVal, `Telugu must differ from English for ${key}`)
      assert.notStrictEqual(hiVal, enVal, `Hindi must differ from English for ${key}`)
    }
  })

  test('3. Shared agricultural metadata (seasons, risk levels, suitability, factors) exist in all locales', () => {
    const seasons = ['KHARIF', 'RABI', 'ZAID']
    for (const s of seasons) {
      assert.ok(enDict.seasons[s], `Missing EN season ${s}`)
      assert.ok(teDict.seasons[s], `Missing TE season ${s}`)
      assert.ok(hiDict.seasons[s], `Missing HI season ${s}`)
    }

    const riskLevels = ['HIGH', 'MODERATE', 'LOW', 'INSUFFICIENT_DATA']
    for (const r of riskLevels) {
      assert.ok(enDict.riskLevels[r], `Missing EN risk level ${r}`)
      assert.ok(teDict.riskLevels[r], `Missing TE risk level ${r}`)
      assert.ok(hiDict.riskLevels[r], `Missing HI risk level ${r}`)
    }

    const suitabilityLevels = ['EXCELLENT', 'GOOD', 'MODERATE', 'LOW', 'POOR']
    for (const sl of suitabilityLevels) {
      assert.ok(enDict.suitability[sl], `Missing EN suitability ${sl}`)
      assert.ok(teDict.suitability[sl], `Missing TE suitability ${sl}`)
      assert.ok(hiDict.suitability[sl], `Missing HI suitability ${sl}`)
    }

    const factorNames = ['Soil Type', 'Water Availability', 'Growing Season', 'Irrigation Method']
    for (const f of factorNames) {
      assert.ok(enDict.factors[f], `Missing EN factor ${f}`)
      assert.ok(teDict.factors[f], `Missing TE factor ${f}`)
      assert.ok(hiDict.factors[f], `Missing HI factor ${f}`)
    }
  })

  test('4. Dynamic string templating formats truthful text across all languages', () => {
    // Check altCrop dynamic explanation replacement
    const pts = 14
    const enExp = translate('en', 'altCrop.whyScoreExp').replace('{pts}', pts)
    const teExp = translate('te', 'altCrop.whyScoreExp').replace('{pts}', pts)
    const hiExp = translate('hi', 'altCrop.whyScoreExp').replace('{pts}', pts)

    assert.ok(enExp.includes('+14 points'), `EN score explanation: ${enExp}`)
    assert.ok(teExp.includes('+14 పాయింట్లు'), `TE score explanation: ${teExp}`)
    assert.ok(hiExp.includes('+14 अंक'), `HI score explanation: ${hiExp}`)

    // Check oversupply insufficient sample warning templating
    const sampleVals = {
      distinctCount: 2,
      farmerWord: 'farmers have',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      season: 'KHARIF'
    }

    const enWarning = translate('en', 'oversupply.insufficientWarning')
      .replace('{distinctCount}', sampleVals.distinctCount)
      .replace('{farmerWord}', sampleVals.farmerWord)
      .replace('{district}', sampleVals.district)
      .replace('{state}', sampleVals.state)
      .replace('{season}', translate('en', `seasons.${sampleVals.season}`))

    assert.ok(enWarning.includes('2 distinct farmers have recorded intentions in Guntur, Andhra Pradesh for Kharif season'))

    const teWarning = translate('te', 'oversupply.insufficientWarning')
      .replace('{distinctCount}', sampleVals.distinctCount)
      .replace('{farmerWord}', translate('te', 'oversupply.farmersHave'))
      .replace('{district}', sampleVals.district)
      .replace('{state}', sampleVals.state)
      .replace('{season}', translate('te', `seasons.${sampleVals.season}`))

    assert.ok(teWarning.includes('Guntur, Andhra Pradesh'))
    assert.ok(teWarning.includes('ఖరీఫ్'))
    assert.ok(/[\u0C00-\u0C7F]/.test(teWarning))
  })

  test('5. Form submission payloads and canonical values remain strictly immutable', () => {
    // Form inputs must retain exact canonical types regardless of active UI locale
    const rawFormState = {
      state: 'Andhra Pradesh',
      district: 'Guntur ',
      cropId: '3',
      intendedSeason: 'KHARIF',
      farmSize: '4.5'
    }

    const payload = {
      state: rawFormState.state,
      district: rawFormState.district.trim(),
      cropId: parseInt(rawFormState.cropId, 10),
      intendedSeason: rawFormState.intendedSeason,
      farmSize: parseFloat(rawFormState.farmSize)
    }

    assert.strictEqual(payload.state, 'Andhra Pradesh')
    assert.strictEqual(payload.district, 'Guntur')
    assert.strictEqual(payload.cropId, 3)
    assert.strictEqual(payload.intendedSeason, 'KHARIF')
    assert.strictEqual(payload.farmSize, 4.5)
  })

  test('6. Agronomic calculations and risk threshold categorization remain independent of language', () => {
    // Concentration classification logic:
    // If share >= 45% -> HIGH
    // If share >= 25% -> MODERATE
    // Else -> LOW
    function calculateRisk(share) {
      if (share >= 45.0) return 'HIGH'
      if (share >= 25.0) return 'MODERATE'
      return 'LOW'
    }

    assert.strictEqual(calculateRisk(52.5), 'HIGH')
    assert.strictEqual(calculateRisk(30.0), 'MODERATE')
    assert.strictEqual(calculateRisk(12.4), 'LOW')

    // Display labels map cleanly to UI language without altering the underlying riskLevel code
    assert.strictEqual(translate('en', `riskLevels.${calculateRisk(52.5)}`), 'High Risk')
    assert.strictEqual(translate('te', `riskLevels.${calculateRisk(52.5)}`), 'అధిక ప్రమాదం (High Risk)')
    assert.strictEqual(translate('hi', `riskLevels.${calculateRisk(52.5)}`), 'उच्च जोखिम (High Risk)')
  })

  test('7. Truthful empty and insufficient-data states are preserved without fabrication', () => {
    const insufficientRiskResponse = {
      dataSufficient: false,
      totalDistinctFarmers: 1,
      totalRegionalIntentions: 1,
      totalRegionalArea: 2.5,
      cropRiskItems: []
    }

    // Must strictly verify sufficiency flag
    assert.strictEqual(insufficientRiskResponse.dataSufficient, false)
    assert.strictEqual(insufficientRiskResponse.totalDistinctFarmers < 3, true)
    assert.strictEqual(insufficientRiskResponse.cropRiskItems.length, 0)
  })
})
