import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  validatePinCode,
  lookupPinCode,
  reconcilePostalLocation,
  POSTAL_SOURCE_INFO
} from './postalService.js'

describe('Postal PIN Code Validation Tests', () => {
  it('should accept valid 6-digit Indian PIN codes', () => {
    assert.strictEqual(validatePinCode('522001').isValid, true)
    assert.strictEqual(validatePinCode('422001').isValid, true)
    assert.strictEqual(validatePinCode('110001').isValid, true)
    assert.strictEqual(validatePinCode('500001').isValid, true)
  })

  it('should reject empty or null PIN codes', () => {
    assert.strictEqual(validatePinCode('').isValid, false)
    assert.strictEqual(validatePinCode(null).isValid, false)
    assert.strictEqual(validatePinCode(undefined).isValid, false)
  })

  it('should reject PIN codes starting with 0', () => {
    const res = validatePinCode('012345')
    assert.strictEqual(res.isValid, false)
    assert.match(res.error, /cannot begin with 0/)
  })

  it('should reject non-numeric PIN codes', () => {
    const res = validatePinCode('52200A')
    assert.strictEqual(res.isValid, false)
    assert.match(res.error, /only numbers/)
  })

  it('should reject PIN codes with fewer than 6 digits', () => {
    const res = validatePinCode('52200')
    assert.strictEqual(res.isValid, false)
    assert.match(res.error, /exactly 6 digits/)
  })

  it('should reject PIN codes with more than 6 digits', () => {
    const res = validatePinCode('5220011')
    assert.strictEqual(res.isValid, false)
    assert.match(res.error, /exactly 6 digits/)
  })
})

describe('Postal PIN Code Lookup Tests', () => {
  it('should resolve bundled PIN code 522001 (Guntur) with multiple post offices', async () => {
    const res = await lookupPinCode('522001')
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.state, 'Andhra Pradesh')
    assert.strictEqual(res.district, 'Guntur')
    assert.ok(res.postOffices.length > 1, '522001 should have multiple post offices')
    assert.ok(res.postOffices.some((po) => po.name === 'Guntur H.O'))
  })

  it('should resolve bundled PIN code 522201 (Tenali) accurately', async () => {
    const res = await lookupPinCode('522201')
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.state, 'Andhra Pradesh')
    assert.strictEqual(res.district, 'Guntur')
    assert.ok(res.postOffices.some((po) => po.name === 'Tenali H.O'))
  })

  it('should resolve bundled PIN code 422001 (Nashik, Maharashtra)', async () => {
    const res = await lookupPinCode('422001')
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.state, 'Maharashtra')
    assert.strictEqual(res.district, 'Nashik')
    assert.ok(res.postOffices.length >= 2)
  })

  it('should resolve bundled PIN code 141001 (Ludhiana, Punjab)', async () => {
    const res = await lookupPinCode('141001')
    assert.strictEqual(res.success, true)
    assert.strictEqual(res.state, 'Punjab')
    assert.strictEqual(res.district, 'Ludhiana')
  })

  it('should fail gracefully in cacheOnly mode for unbundled PIN code', async () => {
    const res = await lookupPinCode('999999', { cacheOnly: true })
    assert.strictEqual(res.success, false)
    assert.ok(res.error.length > 0)
    assert.strictEqual(res.postOffices.length, 0)
  })

  it('should provide clear source attribution and metadata', () => {
    assert.ok(POSTAL_SOURCE_INFO.sourceName.includes('Department of Posts'))
    assert.strictEqual(POSTAL_SOURCE_INFO.sourceUrl, 'https://api.postalpincode.in')
  })
})

describe('Postal Location Reconciliation Tests', () => {
  it('should reconcile valid state and district with taluk locality match', () => {
    const po = {
      name: 'Tenali H.O',
      branchType: 'Head Post Office',
      block: 'Tenali',
      district: 'Guntur',
      state: 'Andhra Pradesh'
    }
    const res = reconcilePostalLocation('Andhra Pradesh', 'Guntur', po)
    assert.strictEqual(res.state, 'Andhra Pradesh')
    assert.strictEqual(res.district, 'Guntur')
    assert.strictEqual(res.locality, 'Tenali')
    assert.strictEqual(res.isCustomLocality, false)
  })

  it('should mark unindexed revenue village as custom locality', () => {
    const po = {
      name: 'Guntur Medical College S.O',
      branchType: 'Sub Post Office',
      block: 'Guntur',
      district: 'Guntur',
      state: 'Andhra Pradesh'
    }
    const res = reconcilePostalLocation('Andhra Pradesh', 'Guntur', po)
    assert.strictEqual(res.state, 'Andhra Pradesh')
    assert.strictEqual(res.district, 'Guntur')
    assert.strictEqual(res.isCustomLocality, true)
    assert.strictEqual(res.locality, 'Guntur Medical College S.O')
  })

  it('should reconcile state aliases such as Orissa to Odisha', () => {
    const res = reconcilePostalLocation('Orissa', 'Puri')
    assert.strictEqual(res.state, 'Odisha')
    assert.strictEqual(res.district, 'Puri')
  })
})
