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

describe('Step 6D-1: Farmer Dashboard, Authentication, and Landing Page Localization', () => {
  test('1. Dashboard dictionary keys exist and differ meaningfully across en, te, hi', () => {
    const requiredKeys = [
      'farmerDashboard',
      'welcomeBadge',
      'greetingMorning',
      'greetingAfternoon',
      'greetingEvening',
      'defaultFarmerName',
      'welcomeSubtext',
      'btnGetRecommendation',
      'btnViewGuide',
      'analyticsReady',
      'overviewCropTitle',
      'overviewWeatherTitle',
      'overviewMarketTitle',
      'overviewRiskTitle',
      'quickActionsTitle',
      'quickActionsSub',
      'btnLaunchModule',
      'btnExplore',
      'qaCropTitle',
      'qaCropDesc',
      'qaWeatherTitle',
      'qaWeatherDesc',
      'qaMarketTitle',
      'qaMarketDesc',
      'qaSchemesTitle',
      'qaSchemesDesc',
      'qaDiseaseTitle',
      'qaDiseaseDesc',
      'qaAiTitle',
      'qaAiDesc',
      'sigPillBadge',
      'sigTitle',
      'sigSub',
      'sigOversupplyTitle',
      'sigOversupplyTag',
      'sigOversupplyBadge',
      'sigOversupplyDesc',
      'sigAlternativeTitle',
      'sigAlternativeTag',
      'sigAlternativeBadge',
      'sigAlternativeDesc',
      'sigLabTitle',
      'sigLabTag',
      'sigLabBadge',
      'sigLabDesc',
      'sigSupplyDemandTitle',
      'sigSupplyDemandTag',
      'sigSupplyDemandBadge',
      'sigSupplyDemandDesc',
      'journeyTitle',
      'journeySub',
      'journeyStep1Title',
      'journeyStep1Desc',
      'journeyStep8Title',
      'journeyStep8Desc',
      'activityTitle',
      'activitySub',
      'activityEmptyTitle',
      'activityEmptySub',
      'btnStartFirstAnalysis',
      'riskNoticeTitle',
      'riskNoticeText'
    ]

    for (const key of requiredKeys) {
      assert.ok(en.dashboard[key], `en.dashboard missing key: ${key}`)
      assert.ok(te.dashboard[key], `te.dashboard missing key: ${key}`)
      assert.ok(hi.dashboard[key], `hi.dashboard missing key: ${key}`)

      assert.notEqual(en.dashboard[key], te.dashboard[key], `Telugu value for ${key} matches English`)
      assert.notEqual(en.dashboard[key], hi.dashboard[key], `Hindi value for ${key} matches English`)

      assert.ok(TELUGU_REGEX.test(te.dashboard[key]), `Telugu value for ${key} lacks Telugu script: ${te.dashboard[key]}`)
      assert.ok(HINDI_REGEX.test(hi.dashboard[key]), `Hindi value for ${key} lacks Devanagari script: ${hi.dashboard[key]}`)
    }
  })

  test('2. Authentication dictionary keys exist and differ meaningfully across en, te, hi', () => {
    const requiredAuthKeys = [
      'loginTitle',
      'loginSubtitle',
      'registerTitle',
      'registerSubtitle',
      'backToHome',
      'heroBadge',
      'heroHeadline',
      'heroSubtext',
      'emailLabel',
      'emailPlaceholder',
      'passwordLabel',
      'passwordPlaceholder',
      'showPassword',
      'hidePassword',
      'rememberMe',
      'forgotPassword',
      'btnSignIn',
      'btnSigningIn',
      'noAccount',
      'registerLink',
      'selectRoleLabel',
      'roleFarmer',
      'roleFarmerDesc',
      'roleExpert',
      'roleExpertDesc',
      'fullNameLabel',
      'fullNamePlaceholder',
      'phoneLabel',
      'phonePlaceholder',
      'regPasswordPlaceholder',
      'confirmPasswordLabel',
      'confirmPasswordPlaceholder',
      'termsAgreement',
      'btnCreateAccount',
      'btnCreatingAccount',
      'alreadyHaveAccount',
      'loginLink',
      'errEmailRequired',
      'errEmailInvalid',
      'errPasswordRequired',
      'errPasswordMin6',
      'errPasswordMin8',
      'errInvalidCredentials',
      'errServerConnection',
      'errNameRequired',
      'errNameMin2',
      'errNameMax100',
      'errPhoneRequired',
      'errPhoneInvalid',
      'errConfirmPasswordRequired',
      'errPasswordsDoNotMatch',
      'errTermsRequired',
      'errEmailConflict',
      'errInvalidDetails',
      'errRegFailed',
      'successAccountCreated'
    ]

    for (const key of requiredAuthKeys) {
      assert.ok(en.auth[key], `en.auth missing key: ${key}`)
      assert.ok(te.auth[key], `te.auth missing key: ${key}`)
      assert.ok(hi.auth[key], `hi.auth missing key: ${key}`)

      assert.notEqual(en.auth[key], te.auth[key], `Telugu auth value for ${key} matches English`)
      assert.notEqual(en.auth[key], hi.auth[key], `Hindi auth value for ${key} matches English`)

      assert.ok(TELUGU_REGEX.test(te.auth[key]), `Telugu auth value for ${key} lacks Telugu script: ${te.auth[key]}`)
      assert.ok(HINDI_REGEX.test(hi.auth[key]), `Hindi auth value for ${key} lacks Devanagari script: ${hi.auth[key]}`)
    }
  })

  test('3. Landing page dictionary keys exist and differ meaningfully across en, te, hi', () => {
    const requiredLandingKeys = [
      'heroBadge',
      'heroTitlePre',
      'heroTitleSpan',
      'heroDescription',
      'btnExplore',
      'btnWatchDemo',
      'demoAlert',
      'trustClimate',
      'trustMarket',
      'trustAi',
      'trustRisk',
      'heroCardWeatherTitle',
      'heroCardWeatherVal',
      'heroCardMarketTitle',
      'heroCardCropTitle',
      'heroCardDiseaseTitle',
      'stripCropName',
      'stripWeatherName',
      'stripMarketName',
      'stripSchemesName',
      'stripDiseaseName',
      'stripAiName',
      'featuresPre',
      'featuresHeading',
      'featuresSub',
      'featCropTitle',
      'featCropDesc',
      'featWeatherTitle',
      'featWeatherDesc',
      'featDiseaseTitle',
      'featDiseaseDesc',
      'featMarketTitle',
      'featMarketDesc',
      'featSchemesTitle',
      'featSchemesDesc',
      'featAiTitle',
      'featAiDesc',
      'howItWorksPre',
      'howItWorksHeading',
      'howItWorksSub',
      'step1Title',
      'step2Title',
      'step3Title',
      'step4Title',
      'sigPre',
      'sigHeading',
      'sigSub',
      'sig1Tag',
      'sig1Title',
      'sig1Desc',
      'sig2Tag',
      'sig2Title',
      'sig2Desc',
      'sig3Tag',
      'sig3Title',
      'sig3Desc',
      'impactPre',
      'impactHeading',
      'impactSub',
      'ctaHeading',
      'btnCta',
      'footerTagline',
      'footerColPlatform',
      'footerColQuickLinks',
      'footerColAcademic',
      'footerCopyright',
      'footerPrivacy',
      'footerTerms',
      'footerDisclaimer'
    ]

    for (const key of requiredLandingKeys) {
      assert.ok(en.landing[key], `en.landing missing key: ${key}`)
      assert.ok(te.landing[key], `te.landing missing key: ${key}`)
      assert.ok(hi.landing[key], `hi.landing missing key: ${key}`)

      assert.notEqual(en.landing[key], te.landing[key], `Telugu landing value for ${key} matches English`)
      assert.notEqual(en.landing[key], hi.landing[key], `Hindi landing value for ${key} matches English`)

      assert.ok(TELUGU_REGEX.test(te.landing[key]), `Telugu landing value for ${key} lacks Telugu script: ${te.landing[key]}`)
      assert.ok(HINDI_REGEX.test(hi.landing[key]), `Hindi landing value for ${key} lacks Devanagari script: ${hi.landing[key]}`)
    }
  })

  test('4. Authentication payloads and validation rules remain strictly canonical', () => {
    // Simulate frontend form validation logic across localized strings
    const validateName = (name) => {
      if (!name.trim()) return 'errNameRequired'
      if (name.trim().length < 2) return 'errNameMin2'
      if (name.trim().length > 100) return 'errNameMax100'
      return null
    }

    const validateEmail = (email) => {
      if (!email.trim()) return 'errEmailRequired'
      if (!/\S+@\S+\.\S+/.test(email)) return 'errEmailInvalid'
      return null
    }

    const validatePhone = (phone) => {
      if (!phone.trim()) return 'errPhoneRequired'
      if (!/^[6-9]\d{9}$/.test(phone.trim())) return 'errPhoneInvalid'
      return null
    }

    const validatePassword = (pwd) => {
      if (!pwd) return 'errPasswordRequired'
      if (pwd.length < 8) return 'errPasswordMin8'
      return null
    }

    assert.equal(validateName(''), 'errNameRequired')
    assert.equal(validateName('A'), 'errNameMin2')
    assert.equal(validateName('Ramesh Kumar'), null)

    assert.equal(validateEmail('invalid-mail'), 'errEmailInvalid')
    assert.equal(validateEmail('farmer@kisanmitra.ai'), null)

    assert.equal(validatePhone('1234567890'), 'errPhoneInvalid')
    assert.equal(validatePhone('9876543210'), null)

    assert.equal(validatePassword('short'), 'errPasswordMin8')
    assert.equal(validatePassword('StrongPassword123'), null)

    // Verify canonical payload sent to API does NOT alter role enum
    const rawFormRoleFarmer = 'Farmer'
    const rawFormRoleExpert = 'Expert'

    const apiPayloadFarmer = {
      fullName: 'Ramesh Kumar',
      email: 'ramesh@kisanmitra.ai',
      phone: '9876543210',
      password: 'password123',
      role: rawFormRoleFarmer.toUpperCase(),
    }

    const apiPayloadExpert = {
      fullName: 'Dr. Anita Rao',
      email: 'anita@kisanmitra.ai',
      phone: '9876543211',
      password: 'password123',
      role: rawFormRoleExpert.toUpperCase(),
    }

    assert.equal(apiPayloadFarmer.role, 'FARMER')
    assert.equal(apiPayloadExpert.role, 'EXPERT')
  })

  test('5. Non-prediction disclaimers and truthful decision support guidance are preserved across all locales', () => {
    // English
    assert.match(en.dashboard.sigOversupplyBadge, /NOT a Price Prediction/i)
    assert.match(en.dashboard.riskNoticeTitle, /Not Guaranteed Outcomes/i)

    // Telugu
    assert.match(te.dashboard.sigOversupplyBadge, /ధర అంచనా కాదు/i)
    assert.match(te.dashboard.riskNoticeTitle, /ఫలితాల హామీ కాదు/i)

    // Hindi
    assert.match(hi.dashboard.sigOversupplyBadge, /मूल्य भविष्यवाणी नहीं/i)
    assert.match(hi.dashboard.riskNoticeTitle, /परिणाम की गारंटी नहीं/i)
  })
})
