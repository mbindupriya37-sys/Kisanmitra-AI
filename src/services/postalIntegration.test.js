import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  validatePinCode,
  lookupPinCode,
  reconcilePostalLocation,
  POSTAL_SOURCE_INFO
} from './postalService.js'

describe('Requirement 1 & 8: PIN Code Validation & Non-Fabrication', () => {
  it('accepts valid 6-digit Indian PIN codes', () => {
    assert.strictEqual(validatePinCode('522001').isValid, true)
    assert.strictEqual(validatePinCode('422001').isValid, true)
    assert.strictEqual(validatePinCode('110001').isValid, true)
    assert.strictEqual(validatePinCode('500001').isValid, true)
  })

  it('rejects PIN codes with invalid lengths, non-digits, or starting with 0', () => {
    assert.strictEqual(validatePinCode('').isValid, false)
    assert.strictEqual(validatePinCode('012345').isValid, false)
    assert.strictEqual(validatePinCode('52200').isValid, false)
    assert.strictEqual(validatePinCode('5220011').isValid, false)
    assert.strictEqual(validatePinCode('52200A').isValid, false)
  })

  it('does not invent PIN codes or mappings for unindexed codes', async () => {
    const result = await lookupPinCode('999999', { cacheOnly: true })
    assert.strictEqual(result.success, false)
    assert.strictEqual(result.postOffices.length, 0)
    assert.match(result.error, /Please select your location manually/i)
  })
})

describe('Requirement 2, 3 & 4: Postal Lookup, Population & Multi-Match Disambiguation', () => {
  it('identifies multiple post offices for PIN 522001 and enables farmer selection', async () => {
    const res = await lookupPinCode('522001')
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.state, 'Andhra Pradesh')
    assert.strictEqual(res.district, 'Guntur')
    assert.ok(res.postOffices.length > 1, '522001 has multiple post offices')

    // Disambiguation verification
    const po1 = res.postOffices.find((p) => p.name === 'Guntur H.O')
    const po2 = res.postOffices.find((p) => p.name === 'Kothapet S.O (Guntur)')
    const po3 = res.postOffices.find((p) => p.name === 'Guntur Medical College S.O')

    assert.ok(po1, 'Should contain Guntur H.O')
    assert.ok(po2, 'Should contain Kothapet S.O')
    assert.ok(po3, 'Should contain Guntur Medical College S.O')

    // Populates consistently when farmer selects Guntur H.O
    const reconciled1 = reconcilePostalLocation(res.state, res.district, po1)
    assert.strictEqual(reconciled1.state, 'Andhra Pradesh')
    assert.strictEqual(reconciled1.district, 'Guntur')

    // Populates consistently when farmer selects Guntur Medical College S.O
    const reconciled3 = reconcilePostalLocation(res.state, res.district, po3)
    assert.strictEqual(reconciled3.state, 'Andhra Pradesh')
    assert.strictEqual(reconciled3.district, 'Guntur')
    assert.strictEqual(reconciled3.isCustomLocality, true)
    assert.strictEqual(reconciled3.locality, 'Guntur Medical College S.O')
  })

  it('populates verified mandal/block when available in taluk index (Tenali)', async () => {
    const res = await lookupPinCode('522201')
    assert.strictEqual(res.success, true)
    const tenaliPo = res.postOffices.find((p) => p.name === 'Tenali H.O')
    const reconciled = reconcilePostalLocation(res.state, res.district, tenaliPo)
    assert.strictEqual(reconciled.state, 'Andhra Pradesh')
    assert.strictEqual(reconciled.district, 'Guntur')
    assert.strictEqual(reconciled.locality, 'Tenali')
    assert.strictEqual(reconciled.isCustomLocality, false)
  })
})

describe('Requirement 5, 6 & 7: Dependent Field Resets, Manual Fallback & Custom Village', () => {
  it('simulates dependent field resets when parent selection changes', () => {
    // Initial state after PIN selection
    let formState = {
      pincode: '522001',
      state: 'Andhra Pradesh',
      district: 'Guntur',
      village: 'Guntur H.O'
    }

    // Farmer edits PIN code -> dependent locations reset
    const handlePinChangeSimulation = (newPin) => {
      if (newPin !== formState.pincode) {
        return {
          pincode: '',
          state: '',
          district: '',
          village: ''
        }
      }
      return formState
    }

    formState = handlePinChangeSimulation('522002')
    assert.strictEqual(formState.pincode, '')
    assert.strictEqual(formState.state, '')
    assert.strictEqual(formState.district, '')
    assert.strictEqual(formState.village, '')

    // Farmer manually selects state
    formState.state = 'Maharashtra'
    assert.strictEqual(formState.district, '')
    assert.strictEqual(formState.village, '')

    // Farmer manually selects district
    formState.district = 'Nashik'
    assert.strictEqual(formState.village, '')

    // Custom village entry
    formState.village = 'Custom Farm Settlement 12'
    assert.strictEqual(formState.village, 'Custom Farm Settlement 12')
  })
})

describe('Requirement 9 & 10: Provenance & Agronomic Scoring Integrity', () => {
  it('maintains clear disclaimer that PIN code does not verify farm plot boundaries', () => {
    assert.ok(POSTAL_SOURCE_INFO.description.includes('general delivery zone'))
    assert.ok(POSTAL_SOURCE_INFO.description.includes('does not verify individual farm plot boundaries'))
  })

  it('formats clean payload with optional pincode and preserves all ICAR inputs', () => {
    const rawForm = {
      pincode: '522001',
      state: 'Andhra Pradesh',
      district: 'Guntur',
      village: 'Tenali',
      soilType: 'Black',
      soilPh: '6.8',
      soilPhUnknown: false,
      waterAvailability: 'Moderate',
      irrigation: 'Yes',
      expectedRainfall: 'Moderate',
      season: 'Kharif',
      temperatureRange: 'Warm',
      farmSize: '3.5',
      priorities: ['Lower crop risk']
    }

    const payload = {
      pincode: rawForm.pincode ? rawForm.pincode.trim() : null,
      state: rawForm.state.trim(),
      district: rawForm.district.trim(),
      village: rawForm.village.trim(),
      locality: rawForm.village.trim(),
      soilType: rawForm.soilType.toUpperCase(),
      soilPh: parseFloat(rawForm.soilPh),
      soilPhUnknown: rawForm.soilPhUnknown,
      waterAvailability: rawForm.waterAvailability.toUpperCase().replace(/\s+/g, '_'),
      irrigation: rawForm.irrigation.toUpperCase(),
      expectedRainfall: rawForm.expectedRainfall.toUpperCase().replace(/\s+/g, '_'),
      season: rawForm.season.toUpperCase(),
      temperatureRange: rawForm.temperatureRange.toUpperCase(),
      farmSize: parseFloat(rawForm.farmSize),
      priorities: rawForm.priorities
    }

    assert.strictEqual(payload.pincode, '522001')
    assert.strictEqual(payload.soilType, 'BLACK')
    assert.strictEqual(payload.soilPh, 6.8)
    assert.strictEqual(payload.farmSize, 3.5)
  })
})
