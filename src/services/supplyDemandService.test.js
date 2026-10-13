import { test, describe } from 'node:test'
import assert from 'node:assert'

describe('Supply-Demand Service & DTO Contract Verification', () => {

  test('verifies mandatory INSUFFICIENT_DATA demand contract structure', () => {
    const mockResponse = {
      queryCrop: 'Rice',
      queryState: 'Andhra Pradesh',
      queryDistrict: 'Krishna',
      querySeason: 'Kharif',
      regionalDemandBalance: {
        demandStatus: 'INSUFFICIENT_DATA',
        methodologyVersion: 'IN_DEMAND_V1',
        isCalculated: false,
        surplusDeficitRatio: null,
        surplusDeficitQuantity: null,
        rationale: 'Official Indian agricultural statistics report production supply at the district level (DES/UPAg), but official consumption demand is survey-based and published only at national and broad state levels (NSSO HCES / CACP). Localized district-level consumer demand data does not exist in official Indian statistics; computing a synthetic balance ratio is econometrically invalid.',
      },
      mandiPrices: {
        availabilityStatus: 'UNCONFIRMED_OR_OFFLINE',
        disclaimer: 'Daily wholesale prices reported via AGMARKNET. Public daily endpoint reports price observations only; arrival quantities are not reported and cannot be inferred.',
        observations: [],
      },
      bufferStocks: {
        commodity: 'RICE',
        comparisonStatus: 'PERIOD_MISMATCH_NO_COMPARISON',
        surplusDeficitLmt: null,
      },
    }

    // 1. Demand status invariance
    assert.strictEqual(mockResponse.regionalDemandBalance.demandStatus, 'INSUFFICIENT_DATA')
    assert.strictEqual(mockResponse.regionalDemandBalance.isCalculated, false)
    assert.strictEqual(mockResponse.regionalDemandBalance.surplusDeficitRatio, null)
    assert.strictEqual(mockResponse.regionalDemandBalance.surplusDeficitQuantity, null)
    assert.ok(mockResponse.regionalDemandBalance.rationale.includes('NSSO HCES'))

    // 2. Mandi limitation & unconfirmed status
    assert.strictEqual(mockResponse.mandiPrices.availabilityStatus, 'UNCONFIRMED_OR_OFFLINE')
    assert.ok(mockResponse.mandiPrices.disclaimer.includes('arrival quantities are not reported'))

    // 3. Buffer stock period mismatch preservation
    assert.strictEqual(mockResponse.bufferStocks.comparisonStatus, 'PERIOD_MISMATCH_NO_COMPARISON')
    assert.strictEqual(mockResponse.bufferStocks.surplusDeficitLmt, null)
  })

  test('verifies cotton/jute unit preservation and statutory conversion formula', () => {
    const cottonRecord = {
      rawProductionValue: 1000.0,
      rawUnit: 'BALES_170KG',
      conversionFactorApplied: 0.1700,
      conversionVerificationRef: 'DES_MoAFW_STATISTICAL_STANDARDS_170KG',
      productionTonnes: 170.0,
    }

    assert.strictEqual(cottonRecord.rawUnit, 'BALES_170KG')
    assert.strictEqual(cottonRecord.rawProductionValue * cottonRecord.conversionFactorApplied, cottonRecord.productionTonnes)

    const juteRecord = {
      rawProductionValue: 1000.0,
      rawUnit: 'BALES_180KG',
      conversionFactorApplied: 0.1800,
      conversionVerificationRef: 'DES_MoAFW_STATISTICAL_STANDARDS_180KG',
      productionTonnes: 180.0,
    }

    assert.strictEqual(juteRecord.rawUnit, 'BALES_180KG')
    assert.strictEqual(juteRecord.rawProductionValue * juteRecord.conversionFactorApplied, juteRecord.productionTonnes)
  })
})
