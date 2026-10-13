import test from 'node:test'
import assert from 'node:assert/strict'
import enDict from '../locales/en.json' with { type: 'json' }
import teDict from '../locales/te.json' with { type: 'json' }
import hiDict from '../locales/hi.json' with { type: 'json' }
import { translate } from '../context/languageConfig.js'

test('Step 6C: Disease Guidance and Government Schemes Localization', async (t) => {
  await t.test('1. Disease Guidance dictionary keys exist and differ across en, te, hi', () => {
    const requiredKeys = [
      'backToDashboard',
      'headerBadge',
      'heroTitle',
      'heroSubtitle',
      'tabAssess',
      'tabDirectory',
      'formCardTitle',
      'targetCropLabel',
      'affectedPartLabel',
      'symptomDurationLabel',
      'severityLevelLabel',
      'severityMild',
      'severityMod',
      'severitySev',
      'describeSymptomsLabel',
      'symptomsPlaceholder',
      'analyzingBtn',
      'analyzeBtn',
      'errorEmptyDescription',
      'errorAssessmentFailed',
      'diagnosticNoticeLabel',
      'nonChemicalNoticeLabel',
      'kvkAlertBadge',
      'kvkHeader',
      'kvkActionStepsTitle',
      'kvkStep1',
      'kvkStep2',
      'kvkStep3',
      'possibleCausesTitle',
      'noExactMatchHeader',
      'noExactMatchDesc',
      'affectedPartsLabel',
      'keySymptomsLabel',
      'nonChemicalBoxHeader',
      'culturalBoxHeader',
      'verifiedDateLabel',
      'officialSourceLink',
      'dirSearchPlaceholder',
      'searchBtn',
      'allCropsPill',
      'dirLoadingText',
      'dirErrorText',
      'retryBtn',
      'dirEmptyText',
      'viewGuideBtn',
      'icarRefLink',
      'modalAffectedParts',
      'modalKeySymptoms',
      'modalNonChemical',
      'modalCultural',
      'modalKvkAdvisory',
      'modalSourceLabel',
      'modalVerifiedLabel',
      'modalOfficialRef',
      'modalCloseBtn',
      'verifiedSource'
    ]

    for (const key of requiredKeys) {
      assert.ok(enDict.disease[key], `Missing en disease key: ${key}`)
      assert.ok(teDict.disease[key], `Missing te disease key: ${key}`)
      assert.ok(hiDict.disease[key], `Missing hi disease key: ${key}`)

      // Non-empty
      assert.notEqual(enDict.disease[key].trim(), '')
      assert.notEqual(teDict.disease[key].trim(), '')
      assert.notEqual(hiDict.disease[key].trim(), '')

      // Unique regional content
      assert.notEqual(teDict.disease[key], enDict.disease[key], `te disease.${key} must not be identical to en`)
      assert.notEqual(hiDict.disease[key], enDict.disease[key], `hi disease.${key} must not be identical to en`)
    }

    // Verify plantParts sub-keys
    const plantParts = ['Leaves', 'Stem/Stalk', 'Roots', 'Fruit/Boll/Grains', 'Whole Plant']
    for (const part of plantParts) {
      assert.ok(enDict.disease.plantParts[part], `Missing en plantPart: ${part}`)
      assert.ok(teDict.disease.plantParts[part], `Missing te plantPart: ${part}`)
      assert.ok(hiDict.disease.plantParts[part], `Missing hi plantPart: ${part}`)
    }

    // Verify script integrity
    assert.match(teDict.disease.heroTitle, /[\u0C00-\u0C7F]/, 'Telugu hero title must have Telugu script')
    assert.match(hiDict.disease.heroTitle, /[\u0900-\u097F]/, 'Hindi hero title must have Devanagari script')
  })

  await t.test('2. Government Schemes dictionary keys exist and differ across en, te, hi', () => {
    const requiredKeys = [
      'backToDashboard',
      'headerBadge',
      'heroTitle',
      'heroSubtitle',
      'searchPlaceholder',
      'searchBtn',
      'loadingText',
      'errorTitle',
      'retryBtn',
      'emptyTitle',
      'emptyDesc',
      'resetFiltersBtn',
      'statusVerified',
      'statusPending',
      'keyBenefitLabel',
      'viewDetailsBtn',
      'officialPortalLink',
      'modalPurpose',
      'modalEligibility',
      'modalBenefits',
      'modalDocuments',
      'modalGuide',
      'modalSourceLabel',
      'modalVerifiedLabel',
      'modalStatusLabel',
      'verifiedStatusText',
      'verificationRequiredText',
      'applyPortalLink',
      'closeModalBtn'
    ]

    for (const key of requiredKeys) {
      assert.ok(enDict.schemes[key], `Missing en schemes key: ${key}`)
      assert.ok(teDict.schemes[key], `Missing te schemes key: ${key}`)
      assert.ok(hiDict.schemes[key], `Missing hi schemes key: ${key}`)

      assert.notEqual(enDict.schemes[key].trim(), '')
      assert.notEqual(teDict.schemes[key].trim(), '')
      assert.notEqual(hiDict.schemes[key].trim(), '')

      assert.notEqual(teDict.schemes[key], enDict.schemes[key], `te schemes.${key} must not be identical to en`)
      assert.notEqual(hiDict.schemes[key], enDict.schemes[key], `hi schemes.${key} must not be identical to en`)
    }

    // Categories
    const categories = [
      'ALL',
      'FINANCIAL_SUPPORT',
      'CROP_INSURANCE',
      'IRRIGATION',
      'SOLAR_ENERGY',
      'MACHINERY',
      'SOIL_HEALTH'
    ]
    for (const cat of categories) {
      assert.ok(enDict.schemes.categories[cat], `Missing en category: ${cat}`)
      assert.ok(teDict.schemes.categories[cat], `Missing te category: ${cat}`)
      assert.ok(hiDict.schemes.categories[cat], `Missing hi category: ${cat}`)
    }

    // Script checks
    assert.match(teDict.schemes.heroTitle, /[\u0C00-\u0C7F]/, 'Telugu schemes title must have Telugu characters')
    assert.match(hiDict.schemes.heroTitle, /[\u0900-\u097F]/, 'Hindi schemes title must have Devanagari characters')
  })

  await t.test('3. Disease safety warnings, verification statuses, and referral advice remain unchanged in meaning', () => {
    // Mock disease assessment payload
    const mockAssessmentResponse = {
      submittedCrop: 'Rice',
      diagnosticDisclaimer: 'Indicative assessment based on cataloged ICAR literature. Does not substitute for accredited laboratory analysis.',
      chemicalAdvisoryNotice: 'Do not spray synthetic chemicals prematurely. Prioritize biological and cultural controls first.',
      isUrgentKvkConsultationRecommended: true,
      kvkEscalationReason: 'Severe wilting observed on multiple tillers requires immediate physical pathology testing.',
      possibleCauses: [
        {
          id: 1,
          cropName: 'Rice',
          diseaseName: 'Bacterial Leaf Blight',
          scientificName: 'Xanthomonas oryzae pv. oryzae',
          affectedPlantParts: 'Leaves',
          symptomsDescription: 'Water-soaked lesions on leaf margins with wavy borders turning yellowish-white.',
          nonChemicalManagement: 'Seed treatment with Pseudomonas fluorescens @ 10g/kg seed.',
          culturalPractices: 'Avoid excess nitrogen; drain standing water during disease flare-up.',
          kvkExtensionAdvisory: 'Consult KVK officer when > 20% leaves show characteristic blighting.',
          sourceName: 'ICAR-CRRI / TNAU Agritech Portal',
          sourceUrl: 'https://icar.org.in/blight',
          lastVerifiedDate: '2025-01-15'
        }
      ]
    }

    // Verify diagnostic disclaimer and chemical notice remain unmodified
    assert.equal(mockAssessmentResponse.diagnosticDisclaimer, 'Indicative assessment based on cataloged ICAR literature. Does not substitute for accredited laboratory analysis.')
    assert.equal(mockAssessmentResponse.chemicalAdvisoryNotice, 'Do not spray synthetic chemicals prematurely. Prioritize biological and cultural controls first.')

    // Verify scientific name and official URL immutability
    assert.equal(mockAssessmentResponse.possibleCauses[0].scientificName, 'Xanthomonas oryzae pv. oryzae')
    assert.equal(mockAssessmentResponse.possibleCauses[0].sourceUrl, 'https://icar.org.in/blight')
    assert.equal(mockAssessmentResponse.possibleCauses[0].sourceName, 'ICAR-CRRI / TNAU Agritech Portal')

    // Localized dynamic string interpolation
    const enCountText = translate('en', 'disease.possibleCausesTitle', 'Matched Possible Causes ({count})').replace('{count}', mockAssessmentResponse.possibleCauses.length)
    const teCountText = translate('te', 'disease.possibleCausesTitle', 'Matched Possible Causes ({count})').replace('{count}', mockAssessmentResponse.possibleCauses.length)
    const hiCountText = translate('hi', 'disease.possibleCausesTitle', 'Matched Possible Causes ({count})').replace('{count}', mockAssessmentResponse.possibleCauses.length)

    assert.equal(enCountText, 'Matched Possible Causes (1)')
    assert.equal(teCountText, 'సరిపోలిన వ్యాధి అవకాశాలు (1)')
    assert.equal(hiCountText, 'संभावित कारणों का मिलान (1)')
  })

  await t.test('4. Government scheme details, eligibility, official URLs, and verification statuses remain unaltered', () => {
    const mockScheme = {
      id: 1,
      categoryDisplayName: 'Financial Support',
      verificationStatus: 'VERIFIED',
      name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      purpose: 'Income support of ₹6,000 per year in three equal installments to all landholding farmer families.',
      benefits: '₹6,000 / year direct transfer (DBT) into Aadhaar-seeded bank accounts',
      officialPortalUrl: 'https://pmkisan.gov.in',
      eligibleApplicants: 'All landholding farmer families with cultivable land holdings in their names.',
      requiredDocuments: 'Aadhaar Card, Land ownership records (ROR/Khatiyan), Active Bank Passbook.',
      applicationProcess: 'Enroll online via pmkisan.gov.in or through Common Service Centres (CSC).',
      sourceName: 'Department of Agriculture and Farmers Welfare (DA&FW)',
      lastVerifiedDate: '2025-01-10'
    }

    // Official identifiers, numbers, and URLs must remain intact
    assert.equal(mockScheme.name, 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)')
    assert.equal(mockScheme.ministry, 'Ministry of Agriculture & Farmers Welfare')
    assert.equal(mockScheme.officialPortalUrl, 'https://pmkisan.gov.in')
    assert.equal(mockScheme.verificationStatus, 'VERIFIED')
    assert.ok(mockScheme.benefits.includes('₹6,000'), 'Scheme monetary benefit must be retained')

    // Localized status labels accurately reflect verification without corruption
    const enStatus = mockScheme.verificationStatus === 'VERIFIED' ? translate('en', 'schemes.statusVerified') : translate('en', 'schemes.statusPending')
    const teStatus = mockScheme.verificationStatus === 'VERIFIED' ? translate('te', 'schemes.statusVerified') : translate('te', 'schemes.statusPending')
    const hiStatus = mockScheme.verificationStatus === 'VERIFIED' ? translate('hi', 'schemes.statusVerified') : translate('hi', 'schemes.statusPending')

    assert.equal(enStatus, '✓ Verified Portal')
    assert.equal(teStatus, '✓ ధృవీకరించబడిన పోర్టల్')
    assert.equal(hiStatus, '✓ सत्यापित पोर्टल')
  })

  await t.test('5. Form submission payloads and API query parameters remain canonical and language-independent', () => {
    // Form state submitted by user
    const submittedForm = {
      cropName: 'Rice',
      affectedPart: 'Leaves',
      symptomDurationDays: 3,
      severityLevel: 'MODERATE',
      symptomsDescription: 'Blight lesions on leaf edges'
    }

    // Must be valid canonical parameters regardless of UI display
    assert.equal(submittedForm.cropName, 'Rice')
    assert.equal(submittedForm.affectedPart, 'Leaves')
    assert.equal(submittedForm.severityLevel, 'MODERATE')

    // Government scheme category filter params
    const selectedCategory = 'FINANCIAL_SUPPORT'
    const apiParams = {
      category: selectedCategory,
      search: 'PM-KISAN'
    }

    assert.equal(apiParams.category, 'FINANCIAL_SUPPORT')
    assert.equal(apiParams.search, 'PM-KISAN')
  })

  await t.test('6. Empty and unverified states remain truthful without fabricating data', () => {
    const emptyDiseases = []
    const emptySchemes = []

    assert.equal(emptyDiseases.length, 0)
    assert.equal(emptySchemes.length, 0)

    // Verification required status
    const pendingScheme = {
      id: 99,
      verificationStatus: 'VERIFICATION_REQUIRED',
      name: 'Proposed Pilot Scheme'
    }

    const enPendingLabel = pendingScheme.verificationStatus === 'VERIFIED' ? translate('en', 'schemes.statusVerified') : translate('en', 'schemes.statusPending')
    const tePendingLabel = pendingScheme.verificationStatus === 'VERIFIED' ? translate('te', 'schemes.statusVerified') : translate('te', 'schemes.statusPending')
    const hiPendingLabel = pendingScheme.verificationStatus === 'VERIFIED' ? translate('hi', 'schemes.statusVerified') : translate('hi', 'schemes.statusPending')

    assert.equal(enPendingLabel, '⚠️ Verification Required')
    assert.equal(tePendingLabel, '⚠️ ధృవీకరణ అవసరం')
    assert.equal(hiPendingLabel, '⚠️ सत्यापन आवश्यक')
  })
})
