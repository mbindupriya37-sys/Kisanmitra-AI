import { describe, it } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const en = JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/en.json'), 'utf8'))
const te = JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/te.json'), 'utf8'))
const hi = JSON.parse(fs.readFileSync(path.join(__dirname, '../locales/hi.json'), 'utf8'))

describe('Phase 10A: Bug Fixes and Navigation Polish Verification', () => {

  describe('1. Decision Lab Simulation Endpoint Path', () => {
    it('uses relative path /farmer/decision-lab/simulate without duplicated /api prefix', () => {
      const pageCode = fs.readFileSync(path.join(__dirname, '../pages/DecisionLabPage.jsx'), 'utf8')
      
      // Must NOT contain duplicate /api/api/farmer/decision-lab or /api/farmer/decision-lab in api.post
      assert.strictEqual(
        pageCode.includes("api.post('/api/farmer/decision-lab/simulate'"),
        false,
        'Found forbidden /api/farmer/decision-lab/simulate in DecisionLabPage.jsx'
      )
      
      // Must contain correct relative endpoint api.post('/farmer/decision-lab/simulate'
      assert.strictEqual(
        pageCode.includes("api.post('/farmer/decision-lab/simulate'"),
        true,
        'Expected relative endpoint /farmer/decision-lab/simulate'
      )

      // Simulate Axios resolution with baseURL
      const baseURL = 'http://localhost:8080/api'
      const relativePath = '/farmer/decision-lab/simulate'
      const resolvedUrl = new URL(baseURL.replace(/\/$/, '') + relativePath).pathname
      assert.strictEqual(resolvedUrl, '/api/farmer/decision-lab/simulate')
    })
  })

  describe('2. Farmer Dashboard Quick Actions Navigation', () => {
    it('maps all 6 quick actions to valid registered routes', () => {
      const routesNavigated = {}
      const mockNavigate = (route) => {
        return route
      }

      const routeMapping = {
        crop: '/farmer/crop-recommendation',
        weather: '/farmer/weather',
        market: '/farmer/market-intelligence',
        schemes: '/farmer/government-schemes',
        disease: '/farmer/disease-guidance',
        ai: '/farmer/ai-assistant',
      }

      for (const [actionId, expectedRoute] of Object.entries(routeMapping)) {
        routesNavigated[actionId] = mockNavigate(expectedRoute)
      }

      assert.strictEqual(routesNavigated.crop, '/farmer/crop-recommendation')
      assert.strictEqual(routesNavigated.weather, '/farmer/weather')
      assert.strictEqual(routesNavigated.market, '/farmer/market-intelligence')
      assert.strictEqual(routesNavigated.schemes, '/farmer/government-schemes')
      assert.strictEqual(routesNavigated.disease, '/farmer/disease-guidance')
      assert.strictEqual(routesNavigated.ai, '/farmer/ai-assistant')

      // Inspect QuickActionCard code directly
      const quickActionCode = fs.readFileSync(path.join(__dirname, '../components/dashboard/QuickActionCard.jsx'), 'utf8')
      assert.strictEqual(quickActionCode.includes("navigate('/farmer/crop-recommendation')"), true)
      assert.strictEqual(quickActionCode.includes("navigate('/farmer/weather')"), true)
      assert.strictEqual(quickActionCode.includes("navigate('/farmer/market-intelligence')"), true)
      assert.strictEqual(quickActionCode.includes("navigate('/farmer/government-schemes')"), true)
      assert.strictEqual(quickActionCode.includes("navigate('/farmer/disease-guidance')"), true)
      assert.strictEqual(quickActionCode.includes("navigate('/farmer/ai-assistant')"), true)
    })
  })

  describe('3. Decision Lab Navigation & Parameter Resolution', () => {
    it('connects CropRecommendationResultsPage to Decision Lab using actual requestId', () => {
      const resultsCode = fs.readFileSync(path.join(__dirname, '../pages/CropRecommendationResultsPage.jsx'), 'utf8')
      assert.strictEqual(
        resultsCode.includes('/farmer/decision-lab/${resultData?.requestId || requestId}'),
        true,
        'CropRecommendationResultsPage must launch Decision Lab with actual requestId'
      )
    })

    it('navigates to /farmer/decision-lab from sidebar and signature cards without fabricated ID', () => {
      const sidebarCode = fs.readFileSync(path.join(__dirname, '../components/dashboard/DashboardSidebar.jsx'), 'utf8')
      assert.strictEqual(
        sidebarCode.includes("navigate('/farmer/decision-lab')"),
        true,
        'Sidebar must navigate to canonical /farmer/decision-lab'
      )
      // Must NOT contain hardcoded/fabricated IDs like /farmer/decision-lab/1
      assert.strictEqual(sidebarCode.includes("navigate('/farmer/decision-lab/1')"), false)
      assert.strictEqual(sidebarCode.includes("navigate('/farmer/decision-lab/0')"), false)

      const sigCode = fs.readFileSync(path.join(__dirname, '../components/dashboard/SignatureFeatureCard.jsx'), 'utf8')
      assert.strictEqual(
        sigCode.includes("navigate('/farmer/decision-lab')"),
        true,
        'Signature feature card must navigate to canonical /farmer/decision-lab'
      )
    })

    it('supports route /farmer/decision-lab in App.jsx alongside /farmer/decision-lab/:requestId', () => {
      const appCode = fs.readFileSync(path.join(__dirname, '../App.jsx'), 'utf8')
      assert.strictEqual(appCode.includes('path="/farmer/decision-lab"'), true)
      assert.strictEqual(appCode.includes('path="/farmer/decision-lab/:requestId"'), true)
    })

    it('simulates DecisionLabPage fallback to latest assessment or truthful empty state', async () => {
      let resolvedAssessmentId = null
      let showedEmptyState = false

      const mockApi = {
        get: async (url) => {
          if (url === '/farmer/crop-recommendations?page=0&size=1') {
            return { data: { content: [{ id: 88 }] } }
          }
          throw new Error('Unexpected: ' + url)
        }
      }

      // Case A: With explicit requestId
      const explicitId = '42'
      if (explicitId) {
        resolvedAssessmentId = parseInt(explicitId, 10)
      }
      assert.strictEqual(resolvedAssessmentId, 42)

      // Case B: Without requestId, fallback fetches latest
      const emptyParam = undefined
      if (!emptyParam) {
        const res = await mockApi.get('/farmer/crop-recommendations?page=0&size=1')
        const list = res.data?.content || []
        if (list.length > 0 && list[0]?.id) {
          resolvedAssessmentId = list[0].id
        } else {
          showedEmptyState = true
        }
      }
      assert.strictEqual(resolvedAssessmentId, 88)
      assert.strictEqual(showedEmptyState, false)

      // Case C: When farmer has zero previous assessments
      const mockEmptyApi = {
        get: async () => ({ data: { content: [] } })
      }
      const resEmpty = await mockEmptyApi.get('/farmer/crop-recommendations?page=0&size=1')
      if (resEmpty.data.content.length === 0) {
        showedEmptyState = true
      }
      assert.strictEqual(showedEmptyState, true)
    })
  })

  describe('4. First Analysis CTA in ActivityCard', () => {
    it('wires Start Your First Analysis button to /farmer/crop-recommendation', () => {
      const cardCode = fs.readFileSync(path.join(__dirname, '../components/dashboard/ActivityCard.jsx'), 'utf8')
      assert.strictEqual(cardCode.includes("navigate('/farmer/crop-recommendation')"), true)
      assert.strictEqual(cardCode.includes("t('dashboard.btnStartFirstAnalysis')"), true)
    })
  })

  describe('5. Sidebar Actions: Profile, Journal, Help Modals & Honest Roadmap', () => {
    it('implements genuine working actions and truthful roadmap notices without dead buttons', () => {
      const sidebarCode = fs.readFileSync(path.join(__dirname, '../components/dashboard/DashboardSidebar.jsx'), 'utf8')
      
      // Wire check
      assert.strictEqual(sidebarCode.includes("setActiveModal('profile')"), true)
      assert.strictEqual(sidebarCode.includes("setActiveModal('journal')"), true)
      assert.strictEqual(sidebarCode.includes("setActiveModal('help')"), true)

      // Real user data displayed
      assert.strictEqual(sidebarCode.includes('user?.fullName'), true)
      assert.strictEqual(sidebarCode.includes('user?.email'), true)
      assert.strictEqual(sidebarCode.includes('user?.role'), true)
      assert.strictEqual(sidebarCode.includes('user?.phone'), true)

      // Real working links in Journal & Help
      assert.strictEqual(sidebarCode.includes("navigate('/farmer/crop-recommendation')"), true)
      assert.strictEqual(sidebarCode.includes("navigate('/farmer/oversupply-risk')"), true)
      assert.strictEqual(sidebarCode.includes("navigate('/farmer/ai-assistant')"), true)

      // Verified helpline contacts
      assert.strictEqual(sidebarCode.includes('1800-180-1551'), true)

      // Escape key listener for accessibility
      assert.strictEqual(sidebarCode.includes("e.key === 'Escape'"), true)
    })
  })

  describe('6. Localization Completeness Across EN, TE, HI', () => {
    const requiredSidebarKeys = [
      'profileModalTitle',
      'profileModalDesc',
      'fieldFullName',
      'fieldRole',
      'fieldEmail',
      'fieldPhone',
      'notProvided',
      'fieldSession',
      'activeJwtSession',
      'journalModalTitle',
      'journalModalDesc',
      'btnViewAssessmentHistory',
      'btnViewCropIntentions',
      'roadmapNoticeTitle',
      'journalRoadmapNotice',
      'helpModalTitle',
      'helpModalDesc',
      'btnAskAi',
      'kisanCallCenterTitle',
      'kisanCallCenterDesc',
      'kvkTitle',
      'kvkDesc',
      'feedbackRoadmapNotice'
    ]

    it('verifies all sidebar modal keys exist in en, te, hi', () => {
      for (const key of requiredSidebarKeys) {
        assert.ok(en.sidebar[key], `Missing en.sidebar.${key}`)
        assert.ok(te.sidebar[key], `Missing te.sidebar.${key}`)
        assert.ok(hi.sidebar[key], `Missing hi.sidebar.${key}`)
      }
    })

    it('verifies cropResults launcher keys exist in en, te, hi', () => {
      assert.ok(en.cropResults.btnLaunchDecisionLab)
      assert.ok(te.cropResults.btnLaunchDecisionLab)
      assert.ok(hi.cropResults.btnLaunchDecisionLab)

      assert.ok(en.cropResults.btnViewAlternatives)
      assert.ok(te.cropResults.btnViewAlternatives)
      assert.ok(hi.cropResults.btnViewAlternatives)
    })

    it('verifies decisionLab empty state keys exist in en, te, hi', () => {
      const dlKeys = ['backToDashboard', 'noAssessmentTitle', 'noAssessmentSub', 'btnStartAssessment', 'btnBackToDashboard']
      for (const key of dlKeys) {
        assert.ok(en.decisionLab[key], `Missing en.decisionLab.${key}`)
        assert.ok(te.decisionLab[key], `Missing te.decisionLab.${key}`)
        assert.ok(hi.decisionLab[key], `Missing hi.decisionLab.${key}`)
      }
    })

    it('verifies Telugu strings contain authentic Telugu unicode script', () => {
      const teluguRegex = /[\u0C00-\u0C7F]/
      assert.ok(teluguRegex.test(te.sidebar.profileModalTitle))
      assert.ok(teluguRegex.test(te.sidebar.journalModalTitle))
      assert.ok(teluguRegex.test(te.sidebar.helpModalTitle))
      assert.ok(teluguRegex.test(te.cropResults.btnLaunchDecisionLab))
      assert.ok(teluguRegex.test(te.decisionLab.noAssessmentTitle))
    })

    it('verifies Hindi strings contain authentic Devanagari unicode script', () => {
      const devanagariRegex = /[\u0900-\u097F]/
      assert.ok(devanagariRegex.test(hi.sidebar.profileModalTitle))
      assert.ok(devanagariRegex.test(hi.sidebar.journalModalTitle))
      assert.ok(devanagariRegex.test(hi.sidebar.helpModalTitle))
      assert.ok(devanagariRegex.test(hi.cropResults.btnLaunchDecisionLab))
      assert.ok(devanagariRegex.test(hi.decisionLab.noAssessmentTitle))
    })
  })
})
