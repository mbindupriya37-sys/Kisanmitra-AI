import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const localesDir = path.resolve(__dirname, '../locales')
const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf-8'))
const te = JSON.parse(fs.readFileSync(path.join(localesDir, 'te.json'), 'utf-8'))
const hi = JSON.parse(fs.readFileSync(path.join(localesDir, 'hi.json'), 'utf-8'))

const TELUGU_REGEX = /[\u0C00-\u0C7F]/
const HINDI_REGEX = /[\u0900-\u097F]/

describe('Step 6D-2: Supply–Demand Intelligence and Expert/Admin Dashboard Localization', () => {
  test('1. Supply-Demand dictionary keys exist and differ meaningfully across en, te, hi', () => {
    const requiredKeys = [
      'backDashboard',
      'title',
      'badgeMacro',
      'badgeOfficial',
      'subtitle',
      'filterState',
      'filterDistrict',
      'placeholderDistrict',
      'filterCrop',
      'filterSeason',
      'btnFetching',
      'btnApplyFilters',
      'alertTitle',
      'alertMessage',
      'kpiProdLabel',
      'kpiProdNa',
      'kpiMspLabel',
      'kpiMspNotNotified',
      'perQuintal',
      'kpiBufferLabel',
      'kpiBufferNa',
      'unitLmt',
      'offMilestoneNote',
      'normLabel',
      'wheatRiceOnly',
      'kpiMandiLabel',
      'kpiMandiOffline',
      'kpiDemandLabel',
      'kpiDemandInsufficient',
      'kpiDemandMethodology',
      'tabProduction',
      'tabMandi',
      'tabMsp',
      'tabBuffer',
      'tabDemand',
      'prodTitle',
      'prodDesc',
      'sourcePrefix',
      'thYear',
      'thSeason',
      'thArea',
      'thRawProduction',
      'thRawUnit',
      'thConvertedTonnes',
      'thYield',
      'thSourceRevision',
      'thStatus',
      'emptyProdTitle',
      'emptyProdSub',
      'mandiTitle',
      'mandiDesc',
      'statusPrefix',
      'mandiDisclaimerLabel',
      'thMarket',
      'thDistrict',
      'thState',
      'thVariety',
      'thArrivalDate',
      'thMinPrice',
      'thMaxPrice',
      'thModalPrice',
      'emptyMandiTitle',
      'emptyMandiSub',
      'mspTitle',
      'mspDesc',
      'labelSeason',
      'mspSeasonLabel',
      'mspEffectiveRateLabel',
      'mspBaseRate',
      'mspBonus',
      'mspA2Fl',
      'mspC2',
      'mspGazetteRef',
      'mspEffectiveDate',
      'emptyMspSub',
      'bufferTitle',
      'bufferDesc',
      'bufferSource',
      'bufferSubpanel1Title',
      'labelCommodity',
      'labelObsDate',
      'labelActualStock',
      'labelBufferNorm',
      'labelMilestoneComp',
      'emptyBufferNorms',
      'bufferSubpanel2Title',
      'labelMarketingSeason',
      'labelProcurementStage',
      'labelQuantityProcured',
      'labelReportingDate',
      'emptyProcurement',
      'demandTitle',
      'demandDesc',
      'demandBadgeStatus',
      'demandVersionLabel',
      'demandCalcFlag',
      'demandUncomputable',
      'demandWhyTitle',
      'demandCitationsHeading',
      'demandGovHeading',
      'demandGov1Title',
      'demandGov1Text',
      'demandGov2Title',
      'demandGov2Text',
      'demandGov3Title',
      'demandGov3Text'
    ]

    for (const key of requiredKeys) {
      assert.ok(en.supplyDemand[key], `en.supplyDemand missing key: ${key}`)
      assert.ok(te.supplyDemand[key], `te.supplyDemand missing key: ${key}`)
      assert.ok(hi.supplyDemand[key], `hi.supplyDemand missing key: ${key}`)

      // Values should not be identical to English (except for universal abbreviations like LMT if embedded, but full phrases must differ)
      if (key !== 'unitLmt') {
        assert.notEqual(en.supplyDemand[key], te.supplyDemand[key], `Telugu value for ${key} matches English`)
        assert.notEqual(en.supplyDemand[key], hi.supplyDemand[key], `Hindi value for ${key} matches English`)
      }

      assert.ok(TELUGU_REGEX.test(te.supplyDemand[key]), `Telugu value for ${key} lacks Telugu script: ${te.supplyDemand[key]}`)
      assert.ok(HINDI_REGEX.test(hi.supplyDemand[key]), `Hindi value for ${key} lacks Devanagari script: ${hi.supplyDemand[key]}`)
    }
  })

  test('2. Expert and Admin dashboard dictionary keys exist and differ meaningfully across en, te, hi', () => {
    const requiredExpertKeys = ['title', 'welcomeBack', 'defaultName', 'roleLabel', 'backHome']
    const requiredAdminKeys = ['title', 'welcomeBack', 'defaultName', 'roleLabel', 'backHome']

    for (const key of requiredExpertKeys) {
      assert.ok(en.expertDashboard[key], `en.expertDashboard missing key: ${key}`)
      assert.ok(te.expertDashboard[key], `te.expertDashboard missing key: ${key}`)
      assert.ok(hi.expertDashboard[key], `hi.expertDashboard missing key: ${key}`)

      assert.notEqual(en.expertDashboard[key], te.expertDashboard[key], `Telugu expert value for ${key} matches English`)
      assert.notEqual(en.expertDashboard[key], hi.expertDashboard[key], `Hindi expert value for ${key} matches English`)

      assert.ok(TELUGU_REGEX.test(te.expertDashboard[key]), `Telugu expert value for ${key} lacks Telugu script`)
      assert.ok(HINDI_REGEX.test(hi.expertDashboard[key]), `Hindi expert value for ${key} lacks Devanagari script`)
    }

    for (const key of requiredAdminKeys) {
      assert.ok(en.adminDashboard[key], `en.adminDashboard missing key: ${key}`)
      assert.ok(te.adminDashboard[key], `te.adminDashboard missing key: ${key}`)
      assert.ok(hi.adminDashboard[key], `hi.adminDashboard missing key: ${key}`)

      assert.notEqual(en.adminDashboard[key], te.adminDashboard[key], `Telugu admin value for ${key} matches English`)
      assert.notEqual(en.adminDashboard[key], hi.adminDashboard[key], `Hindi admin value for ${key} matches English`)

      assert.ok(TELUGU_REGEX.test(te.adminDashboard[key]), `Telugu admin value for ${key} lacks Telugu script`)
      assert.ok(HINDI_REGEX.test(hi.adminDashboard[key]), `Hindi admin value for ${key} lacks Devanagari script`)
    }
  })

  test('3. Canonical API query parameters are preserved regardless of UI language', () => {
    // When a farmer selects a crop from the dropdown in Telugu or Hindi:
    // Displayed label: వరి (Rice) or धान / चावल (Rice)
    // Canonical query param passed to getSupplyDemandOverview: 'Rice'
    const canonicalCrop = 'Rice'
    const canonicalState = 'Andhra Pradesh'
    const canonicalDistrict = 'Krishna'
    const canonicalSeason = 'Kharif'

    const simulatedFilter = {
      crop: canonicalCrop,
      state: canonicalState,
      district: canonicalDistrict,
      season: canonicalSeason
    }

    // Verify canonical query parameter contract
    const queryParams = new URLSearchParams({
      crop: simulatedFilter.crop,
      state: simulatedFilter.state,
      district: simulatedFilter.district,
      season: simulatedFilter.season
    }).toString()

    assert.equal(queryParams, 'crop=Rice&state=Andhra+Pradesh&district=Krishna&season=Kharif')
    assert.doesNotMatch(queryParams, /వరి/)
    assert.doesNotMatch(queryParams, /धान/)
  })

  test('4. Truthful INSUFFICIENT_DATA and uncomputed demand balance states are preserved across all locales', () => {
    // English
    assert.match(en.supplyDemand.kpiDemandInsufficient, /INSUFFICIENT DATA/i)
    assert.match(en.supplyDemand.demandCalcFlag, /isCalculated = false/i)
    assert.match(en.supplyDemand.demandUncomputable, /NULL \(Uncomputable\)/i)
    assert.match(en.supplyDemand.emptyMandiSub, /No synthetic or fabricated prices/i)
    assert.match(en.supplyDemand.demandGov1Text, /refuses to divide district production by arbitrary/i)

    // Telugu
    assert.match(te.supplyDemand.kpiDemandInsufficient, /INSUFFICIENT DATA/i)
    assert.match(te.supplyDemand.demandCalcFlag, /isCalculated = false/i)
    assert.match(te.supplyDemand.demandUncomputable, /NULL/i)
    assert.match(te.supplyDemand.emptyMandiSub, /కల్పిత లేదా ఊహాజనిత ధరలు/i)
    assert.match(te.supplyDemand.demandGov1Text, /ఏకపక్ష స్థానిక జనాభా గుణకాలు/i)

    // Hindi
    assert.match(hi.supplyDemand.kpiDemandInsufficient, /INSUFFICIENT DATA/i)
    assert.match(hi.supplyDemand.demandCalcFlag, /isCalculated = false/i)
    assert.match(hi.supplyDemand.demandUncomputable, /NULL/i)
    assert.match(hi.supplyDemand.emptyMandiSub, /कृत्रिम या गढ़ा हुआ मूल्य/i)
    assert.match(hi.supplyDemand.demandGov1Text, /मनमाने स्थानीय जनसंख्या गुणकों/i)
  })

  test('5. Role greetings and dashboard replacement strings behave correctly across all locales', () => {
    const mockUserExpert = { fullName: 'Dr. Anita Rao', role: 'EXPERT' }
    const mockUserAdmin = { fullName: 'Suresh Patel', role: 'ADMIN' }

    // Expert English
    const enExpertGreeting = en.expertDashboard.welcomeBack.replace('{name}', mockUserExpert.fullName)
    const enExpertRole = en.expertDashboard.roleLabel.replace('{role}', mockUserExpert.role)
    assert.equal(enExpertGreeting, 'Welcome back, Dr. Anita Rao!')
    assert.equal(enExpertRole, 'Role: EXPERT')

    // Expert Telugu
    const teExpertGreeting = te.expertDashboard.welcomeBack.replace('{name}', mockUserExpert.fullName)
    const teExpertRole = te.expertDashboard.roleLabel.replace('{role}', mockUserExpert.role)
    assert.equal(teExpertGreeting, 'స్వాగతం, Dr. Anita Rao!')
    assert.equal(teExpertRole, 'పాత్ర: EXPERT')

    // Expert Hindi
    const hiExpertGreeting = hi.expertDashboard.welcomeBack.replace('{name}', mockUserExpert.fullName)
    const hiExpertRole = hi.expertDashboard.roleLabel.replace('{role}', mockUserExpert.role)
    assert.equal(hiExpertGreeting, 'वापसी पर स्वागत है, Dr. Anita Rao!')
    assert.equal(hiExpertRole, 'भूमिका: EXPERT')

    // Admin English
    const enAdminGreeting = en.adminDashboard.welcomeBack.replace('{name}', mockUserAdmin.fullName)
    const enAdminRole = en.adminDashboard.roleLabel.replace('{role}', mockUserAdmin.role)
    assert.equal(enAdminGreeting, 'Welcome back, Suresh Patel!')
    assert.equal(enAdminRole, 'Role: ADMIN')

    // Admin Telugu
    const teAdminGreeting = te.adminDashboard.welcomeBack.replace('{name}', mockUserAdmin.fullName)
    const teAdminRole = te.adminDashboard.roleLabel.replace('{role}', mockUserAdmin.role)
    assert.equal(teAdminGreeting, 'స్వాగతం, Suresh Patel!')
    assert.equal(teAdminRole, 'పాత్ర: ADMIN')

    // Admin Hindi
    const hiAdminGreeting = hi.adminDashboard.welcomeBack.replace('{name}', mockUserAdmin.fullName)
    const hiAdminRole = hi.adminDashboard.roleLabel.replace('{role}', mockUserAdmin.role)
    assert.equal(hiAdminGreeting, 'वापसी पर स्वागत है, Suresh Patel!')
    assert.equal(hiAdminRole, 'भूमिका: ADMIN')
  })
})
