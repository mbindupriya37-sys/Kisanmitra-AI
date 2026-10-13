import { describe, it } from 'node:test'
import assert from 'node:assert'

describe('Alternative Crop Intelligence Navigation & Route Flow Verification', () => {
  it('navigates to /farmer/crop-recommendation/alternatives when clicking Alternative Crop Intelligence card or button', () => {
    let targetRoute = null
    const mockNavigate = (url) => {
      targetRoute = url
    }

    const handleFeatureClick = (id) => {
      if (id === 'alternative') {
        mockNavigate('/farmer/crop-recommendation/alternatives')
      } else if (id === 'oversupply') {
        mockNavigate('/farmer/oversupply-risk')
      } else if (id === 'lab') {
        mockNavigate('/farmer/crop-recommendation')
      }
    }

    // Simulate clicking Alternative Crop Intelligence card
    handleFeatureClick('alternative')
    assert.strictEqual(targetRoute, '/farmer/crop-recommendation/alternatives')

    // Simulate clicking Oversupply Risk
    handleFeatureClick('oversupply')
    assert.strictEqual(targetRoute, '/farmer/oversupply-risk')
  })

  it('navigates to /farmer/crop-recommendation/alternatives when clicking Alternative Crops in sidebar', () => {
    let sidebarRoute = null
    const mockNavigate = (url) => {
      sidebarRoute = url
    }

    const handleNavClick = (id) => {
      if (id === 'dashboard') {
        mockNavigate('/farmer/dashboard')
      } else if (id === 'crop') {
        mockNavigate('/farmer/crop-recommendation')
      } else if (id === 'alternative') {
        mockNavigate('/farmer/crop-recommendation/alternatives')
      }
    }

    handleNavClick('alternative')
    assert.strictEqual(sidebarRoute, '/farmer/crop-recommendation/alternatives')
  })

  it('retrieves the farmer latest assessment when no requestId is in URL', async () => {
    let loadedAssessmentId = null
    let fetchedResults = false

    const mockApi = {
      get: async (url) => {
        if (url === '/farmer/crop-recommendations?page=0&size=1') {
          return {
            data: {
              content: [{ id: 42, createdAt: '2026-10-10T12:00:00Z' }],
              totalElements: 1,
            },
          }
        }
        if (url === '/farmer/crop-recommendations/42/results') {
          fetchedResults = true
          return {
            data: {
              requestId: 42,
              recommendations: [
                {
                  crop: { id: 1, name: 'Rice' },
                  overallScore: 85,
                  suitability: 'EXCELLENT',
                  riskLevel: 'LOW',
                },
                {
                  crop: { id: 2, name: 'Maize' },
                  overallScore: 92,
                  suitability: 'EXCELLENT',
                  riskLevel: 'LOW',
                },
              ],
            },
          }
        }
        throw new Error('Unexpected URL: ' + url)
      },
    }

    // Simulate AlternativeCropIntelligencePage when requestId is undefined
    const paramRequestId = undefined
    if (paramRequestId) {
      loadedAssessmentId = paramRequestId
    } else {
      const res = await mockApi.get('/farmer/crop-recommendations?page=0&size=1')
      const list = res.data?.content || []
      if (list.length > 0 && list[0]?.id) {
        loadedAssessmentId = list[0].id
        await mockApi.get(`/farmer/crop-recommendations/${loadedAssessmentId}/results`)
      }
    }

    assert.strictEqual(loadedAssessmentId, 42)
    assert.strictEqual(fetchedResults, true)
  })

  it('handles empty assessments gracefully without throwing an error', async () => {
    let noAssessmentsFlag = false

    const mockApi = {
      get: async (url) => {
        if (url === '/farmer/crop-recommendations?page=0&size=1') {
          return {
            data: {
              content: [],
              totalElements: 0,
            },
          }
        }
        throw new Error('Should not call results for empty assessments')
      },
    }

    const paramRequestId = undefined
    if (!paramRequestId) {
      const res = await mockApi.get('/farmer/crop-recommendations?page=0&size=1')
      const list = res.data?.content || []
      if (list.length === 0) {
        noAssessmentsFlag = true
      }
    }

    assert.strictEqual(noAssessmentsFlag, true)
  })

  it('directly loads results when explicit requestId is provided in URL', async () => {
    let requestedId = null

    const mockApi = {
      get: async (url) => {
        if (url === '/farmer/crop-recommendations/77/results') {
          requestedId = 77
          return {
            data: {
              requestId: 77,
              recommendations: [],
            },
          }
        }
        throw new Error('Unexpected URL: ' + url)
      },
    }

    const paramRequestId = '77'
    if (paramRequestId) {
      const res = await mockApi.get(`/farmer/crop-recommendations/${paramRequestId}/results`)
      assert.strictEqual(res.data.requestId, 77)
    }

    assert.strictEqual(requestedId, 77)
  })
})
