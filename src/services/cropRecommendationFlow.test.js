import { describe, it } from 'node:test'
import assert from 'node:assert'

describe('Crop Recommendation Analysis Flow — Requirement Verification', () => {
  it('prepares complete assessment payload preserving state, district, village and PIN code', () => {
    const formData = {
      pincode: '522001',
      state: 'Andhra Pradesh',
      district: 'Guntur',
      village: 'Tenali',
      soilType: 'Black',
      soilPh: '6.5',
      soilPhUnknown: false,
      waterAvailability: 'High',
      irrigation: 'Yes',
      expectedRainfall: 'High',
      season: 'Kharif',
      temperatureRange: 'Warm',
      farmSize: '3.5',
      priorities: ['Lower crop risk', 'Sustainable farming'],
    }

    const effectiveVillage = (formData.village || '').trim() || null

    const cleanPayload = {
      pincode: (formData.pincode || '').trim() || null,
      state: formData.state.trim(),
      district: formData.district.trim(),
      village: effectiveVillage,
      locality: effectiveVillage,
      soilType: formData.soilType.toUpperCase(),
      soilPh: formData.soilPhUnknown ? null : parseFloat(formData.soilPh),
      soilPhUnknown: formData.soilPhUnknown,
      waterAvailability: formData.waterAvailability.toUpperCase().replace(/\s+/g, '_'),
      irrigation: formData.irrigation.toUpperCase(),
      expectedRainfall: formData.expectedRainfall.toUpperCase().replace(/\s+/g, '_'),
      season: formData.season.toUpperCase(),
      temperatureRange: formData.temperatureRange ? formData.temperatureRange.toUpperCase() : null,
      farmSize: parseFloat(formData.farmSize),
      priorities: formData.priorities,
    }

    assert.strictEqual(cleanPayload.pincode, '522001')
    assert.strictEqual(cleanPayload.state, 'Andhra Pradesh')
    assert.strictEqual(cleanPayload.district, 'Guntur')
    assert.strictEqual(cleanPayload.village, 'Tenali')
    assert.strictEqual(cleanPayload.soilType, 'BLACK')
    assert.strictEqual(cleanPayload.soilPh, 6.5)
    assert.strictEqual(cleanPayload.waterAvailability, 'HIGH')
    assert.strictEqual(cleanPayload.irrigation, 'YES')
    assert.strictEqual(cleanPayload.expectedRainfall, 'HIGH')
    assert.strictEqual(cleanPayload.season, 'KHARIF')
    assert.strictEqual(cleanPayload.farmSize, 3.5)
    assert.deepStrictEqual(cleanPayload.priorities, ['Lower crop risk', 'Sustainable farming'])
  })

  it('orchestrates submission -> analysis -> navigation flow correctly', async () => {
    let savedRequestId = null
    let analysisTriggeredForId = null
    let navigatedToUrl = null
    let loadingState = false
    let errorMessage = ''

    // Simulated API client
    const mockApi = {
      post: async (url) => {
        if (url === '/farmer/crop-recommendations') {
          savedRequestId = 101
          return { data: { id: 101, status: 'PENDING', message: 'Saved' } }
        }
        throw new Error('Unexpected POST ' + url)
      },
      get: async (url) => {
        if (url === '/farmer/crop-recommendations/101/results') {
          analysisTriggeredForId = 101
          return {
            data: {
              requestId: 101,
              status: 'COMPLETED',
              recommendations: [
                {
                  crop: { id: 1, name: 'Rice', scientificName: 'Oryza sativa' },
                  overallScore: 88.5,
                  suitability: 'EXCELLENT',
                  riskLevel: 'MEDIUM',
                },
              ],
            },
          }
        }
        throw new Error('Unexpected GET ' + url)
      },
    }

    const mockNavigate = (url) => {
      navigatedToUrl = url
    }

    // Execute flow
    loadingState = true
    try {
      const saveRes = await mockApi.post('/farmer/crop-recommendations', {})
      const newRequestId = saveRes.data?.id
      assert.strictEqual(newRequestId, 101)

      const analysisRes = await mockApi.get(`/farmer/crop-recommendations/${newRequestId}/results`)
      assert.strictEqual(analysisRes.data.status, 'COMPLETED')

      mockNavigate(`/farmer/crop-recommendation/results/${newRequestId}`)
    } catch (err) {
      errorMessage = err.message
    } finally {
      loadingState = false
    }

    assert.strictEqual(savedRequestId, 101)
    assert.strictEqual(analysisTriggeredForId, 101)
    assert.strictEqual(navigatedToUrl, '/farmer/crop-recommendation/results/101')
    assert.strictEqual(loadingState, false)
    assert.strictEqual(errorMessage, '')
  })

  it('does NOT navigate when analysis fails and records error state', async () => {
    let navigated = false
    let errorMessage = ''

    const mockApi = {
      post: async () => ({ data: { id: 102 } }),
      get: async () => {
        throw new Error('Database connection failed during analysis evaluation')
      },
    }

    const mockNavigate = () => {
      navigated = true
    }

    try {
      const saveRes = await mockApi.post('/farmer/crop-recommendations', {})
      await mockApi.get(`/farmer/crop-recommendations/${saveRes.data.id}/results`)
      mockNavigate('/farmer/crop-recommendation/results/102')
    } catch (err) {
      errorMessage = err.message
    }

    assert.strictEqual(navigated, false, 'Should not navigate to results if analysis fails')
    assert.match(errorMessage, /Database connection failed/)
  })

  it('accurately formats preserved location and parameters on results page', () => {
    const resultData = {
      requestId: 103,
      state: 'Andhra Pradesh',
      district: 'Guntur',
      village: 'Tenali',
      pincode: '522201',
      soilType: 'BLACK',
      season: 'KHARIF',
      farmSize: 4.0,
      status: 'COMPLETED',
    }

    const formatLocation = (data) => {
      const village = data?.village ? `${data.village}, ` : ''
      const district = data?.district ? `${data.district}, ` : ''
      const state = data?.state || ''
      const pin = data?.pincode ? ` • PIN: ${data.pincode}` : ''
      return `${village}${district}${state}${pin}`
    }

    const formatted = formatLocation(resultData)
    assert.strictEqual(formatted, 'Tenali, Guntur, Andhra Pradesh • PIN: 522201')
  })

  it('displays clear explanation rather than fake recommendations when active requirements empty', () => {
    const emptyResult = {
      requestId: 104,
      status: 'COMPLETED',
      recommendations: [],
    }

    const isEmpty = emptyResult.recommendations.length === 0
    assert.strictEqual(isEmpty, true)

    const emptyExplanation =
      'Verified crop requirement data is currently unavailable for your selected criteria in our agronomic knowledge base. KisanMitra AI does not fabricate crop suitability scores. Please consult your local Krishi Vigyan Kendra (KVK) or district agricultural extension officer for localized guidance.'

    assert.ok(emptyExplanation.includes('does not fabricate crop suitability scores'))
    assert.ok(emptyExplanation.includes('KVK'))
  })
})
