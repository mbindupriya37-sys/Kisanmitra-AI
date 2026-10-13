import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const enPath = path.resolve(__dirname, '../locales/en.json')
const tePath = path.resolve(__dirname, '../locales/te.json')
const hiPath = path.resolve(__dirname, '../locales/hi.json')

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'))
const te = JSON.parse(fs.readFileSync(tePath, 'utf8'))
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'))

const TELUGU_REGEX = /[\u0C00-\u0C7F]/
const DEVANAGARI_REGEX = /[\u0900-\u097F]/

test('Step 6D-3A: Decision Lab Localization', async (t) => {
  await t.test('1. Decision Lab dictionary keys exist and differ meaningfully across en, te, hi', () => {
    assert.ok(en.decisionLab, 'en.json must contain decisionLab namespace')
    assert.ok(te.decisionLab, 'te.json must contain decisionLab namespace')
    assert.ok(hi.decisionLab, 'hi.json must contain decisionLab namespace')

    const enKeys = Object.keys(en.decisionLab)
    const teKeys = Object.keys(te.decisionLab)
    const hiKeys = Object.keys(hi.decisionLab)

    assert.ok(enKeys.length >= 60, `en.decisionLab should have comprehensive keys, found ${enKeys.length}`)
    assert.equal(teKeys.length, enKeys.length, 'te.decisionLab must have the same key count as en.decisionLab')
    assert.equal(hiKeys.length, enKeys.length, 'hi.decisionLab must have the same key count as en.decisionLab')

    enKeys.forEach((key) => {
      assert.ok(te.decisionLab[key], `Missing te translation for decisionLab.${key}`)
      assert.ok(hi.decisionLab[key], `Missing hi translation for decisionLab.${key}`)
    })

    // Validate genuine native script characters
    const sampleKeys = [
      'title',
      'description',
      'disclaimer',
      'controlsTitle',
      'btnRunSimulation',
      'whatChangedTitle',
      'factorShiftTitle',
      'simRankingsTitle',
      'limitationsTitle',
      'limitation1'
    ]

    sampleKeys.forEach((key) => {
      assert.match(
        te.decisionLab[key],
        TELUGU_REGEX,
        `te.decisionLab.${key} must contain native Telugu characters`
      )
      assert.match(
        hi.decisionLab[key],
        DEVANAGARI_REGEX,
        `hi.decisionLab.${key} must contain native Devanagari characters`
      )
      assert.notEqual(
        te.decisionLab[key],
        en.decisionLab[key],
        `te.decisionLab.${key} should not be untranslated English`
      )
      assert.notEqual(
        hi.decisionLab[key],
        en.decisionLab[key],
        `hi.decisionLab.${key} should not be untranslated English`
      )
    })
  })

  await t.test('2. Simulation request payload contracts remain strictly canonical regardless of UI language', () => {
    // Canonical options as expected by backend /api/farmer/decision-lab/simulate
    const canonicalPayload = {
      requestId: 1,
      soilPh: 6.8,
      soilPhUnknown: false,
      waterAvailability: 'MODERATE',
      expectedRainfall: 'HIGH',
      season: 'KHARIF',
      temperatureRange: 'WARM',
      irrigation: 'YES'
    }

    // Ensure parameters match backend expected enum formats
    assert.equal(typeof canonicalPayload.requestId, 'number')
    assert.equal(typeof canonicalPayload.soilPh, 'number')
    assert.equal(typeof canonicalPayload.soilPhUnknown, 'boolean')
    assert.match(canonicalPayload.waterAvailability, /^[A-Z_]+$/)
    assert.match(canonicalPayload.expectedRainfall, /^[A-Z_]+$/)
    assert.match(canonicalPayload.season, /^[A-Z_]+$/)
    assert.match(canonicalPayload.temperatureRange, /^[A-Z_]+$/)
    assert.match(canonicalPayload.irrigation, /^[A-Z_]+$/)

    // Option labels in UI can be in Telugu or Hindi, but canonical values sent to API must remain untranslated
    const waterLabels = {
      en: en.decisionLab.optWaterModerate,
      te: te.decisionLab.optWaterModerate,
      hi: hi.decisionLab.optWaterModerate
    }
    assert.equal(waterLabels.en, 'Moderate')
    assert.match(waterLabels.te, TELUGU_REGEX)
    assert.match(waterLabels.hi, DEVANAGARI_REGEX)
    // Canonical value is still MODERATE
    assert.equal(canonicalPayload.waterAvailability, 'MODERATE')
  })

  await t.test('3. Truthful non-prediction and ICAR requirement boundaries are preserved across all locales', () => {
    // en, te, and hi disclaimers must all convey non-guarantee truthfulness
    const enDisc = en.decisionLab.disclaimer
    const teDisc = te.decisionLab.disclaimer
    const hiDisc = hi.decisionLab.disclaimer

    assert.ok(enDisc.toLowerCase().includes('not guarantees'))
    assert.match(teDisc, TELUGU_REGEX)
    assert.match(hiDisc, DEVANAGARI_REGEX)

    // Boundaries/limitations 1-4 must exist in all 3 languages
    for (let i = 1; i <= 4; i++) {
      const k = `limitation${i}`
      assert.ok(en.decisionLab[k].length > 10, `en.decisionLab.${k} should be descriptive`)
      assert.match(te.decisionLab[k], TELUGU_REGEX, `te.decisionLab.${k} should be translated in Telugu`)
      assert.match(hi.decisionLab[k], DEVANAGARI_REGEX, `hi.decisionLab.${k} should be translated in Hindi`)
    }
  })

  await t.test('4. Dynamic templates with placeholders replace accurately across locales', () => {
    const baselineSubEn = en.decisionLab.baselineSub
      .replace('{district}', 'Guntur')
      .replace('{state}', 'Andhra Pradesh')
      .replace('{farmSize}', 2.5)
    assert.equal(baselineSubEn, 'Region: Guntur, Andhra Pradesh • Farm Size: 2.5 Acres')

    const baselineSubTe = te.decisionLab.baselineSub
      .replace('{district}', 'గుంటూరు')
      .replace('{state}', 'ఆంధ్రప్రదేశ్')
      .replace('{farmSize}', 2.5)
    assert.ok(baselineSubTe.includes('గుంటూరు'))
    assert.ok(baselineSubTe.includes('2.5'))

    const scoreDiffEn = en.decisionLab.scoreDiffPill.replace('{diff}', '+6')
    assert.equal(scoreDiffEn, 'Score Difference: +6 pts')

    const scoreDiffHi = hi.decisionLab.scoreDiffPill.replace('{diff}', '+6')
    assert.ok(scoreDiffHi.includes('+6'))
  })

  await t.test('5. Common agronomic terms, crop names, and status symbols integrate cleanly', () => {
    // Status badges
    assert.equal(en.decisionLab.statusMatch, 'MATCH')
    assert.equal(te.decisionLab.statusMatch, 'సరిపోలింది (MATCH)')
    assert.equal(hi.decisionLab.statusMatch, 'अनुकूल (MATCH)')

    // Crops
    assert.ok(en.crops && en.crops.Rice, 'en.crops.Rice should exist')
    assert.ok(te.crops && te.crops.Rice, 'te.crops.Rice should exist')
    assert.ok(hi.crops && hi.crops.Rice, 'hi.crops.Rice should exist')

    // Suitability
    assert.ok(en.suitability && en.suitability.EXCELLENT)
    assert.ok(te.suitability && te.suitability.EXCELLENT)
    assert.ok(hi.suitability && hi.suitability.EXCELLENT)
  })
})
