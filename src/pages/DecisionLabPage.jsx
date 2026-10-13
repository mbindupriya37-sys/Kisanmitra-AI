import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import LanguageSelector from '../components/LanguageSelector'
import api from '../services/api'
import labHeroImg from '../assets/card-ai-assistant.png'
import './DecisionLab.css'

const WATER_AVAILABILITY_OPTIONS = ['VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH']
const RAINFALL_OPTIONS = ['VERY_LOW', 'LOW', 'MODERATE', 'HIGH', 'VERY_HIGH']
const SEASON_OPTIONS = ['KHARIF', 'RABI', 'ZAID']
const TEMP_OPTIONS = ['COOL', 'MODERATE', 'WARM', 'HOT']
const IRRIGATION_OPTIONS = ['YES', 'NO', 'SEASONAL']

function DecisionLabPage() {
  const { requestId } = useParams()
  const { t } = useLanguage()

  // State Management
  const [initialLoading, setInitialLoading] = useState(true)
  const [errorStatus, setErrorStatus] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeRequestId, setActiveRequestId] = useState(requestId || null)
  const [noAssessments, setNoAssessments] = useState(false)

  // Original & Simulation Response Data
  const [labData, setLabData] = useState(null)
  const [simulating, setSimulating] = useState(false)
  const [simulationError, setSimulationError] = useState('')

  // Controls State
  const [simForm, setSimForm] = useState({
    soilPh: 6.5,
    soilPhUnknown: false,
    waterAvailability: 'MODERATE',
    expectedRainfall: 'MODERATE',
    season: 'KHARIF',
    temperatureRange: 'WARM',
    irrigation: 'YES',
  })

  // Original Baseline State for Reset
  const [originalForm, setOriginalForm] = useState(null)

  // Expandable list items
  const [expandedCropId, setExpandedCropId] = useState(null)

  const getWaterOptionLabel = (opt) => {
    switch (opt) {
      case 'VERY_LOW': return t('decisionLab.optWaterVeryLow', 'Very Low')
      case 'LOW': return t('decisionLab.optWaterLow', 'Low')
      case 'MODERATE': return t('decisionLab.optWaterModerate', 'Moderate')
      case 'HIGH': return t('decisionLab.optWaterHigh', 'High')
      case 'VERY_HIGH': return t('decisionLab.optWaterVeryHigh', 'Very High')
      default: return opt.replace('_', ' ')
    }
  }

  const getRainfallOptionLabel = (opt) => {
    switch (opt) {
      case 'VERY_LOW': return t('decisionLab.optRainVeryLow', 'Very Low')
      case 'LOW': return t('decisionLab.optRainLow', 'Low')
      case 'MODERATE': return t('decisionLab.optRainModerate', 'Moderate')
      case 'HIGH': return t('decisionLab.optRainHigh', 'High')
      case 'VERY_HIGH': return t('decisionLab.optRainVeryHigh', 'Very High')
      default: return opt.replace('_', ' ')
    }
  }

  const getTempOptionLabel = (opt) => {
    switch (opt) {
      case 'COOL': return t('decisionLab.optTempCool', 'Cool')
      case 'MODERATE': return t('decisionLab.optTempModerate', 'Moderate')
      case 'WARM': return t('decisionLab.optTempWarm', 'Warm')
      case 'HOT': return t('decisionLab.optTempHot', 'Hot')
      default: return opt
    }
  }

  const getIrrigationOptionLabel = (opt) => {
    switch (opt) {
      case 'YES': return t('decisionLab.optIrrigYes', 'Yes (Available)')
      case 'NO': return t('decisionLab.optIrrigNo', 'No (Rainfed)')
      case 'SEASONAL': return t('decisionLab.optIrrigSeasonal', 'Seasonal Only')
      default: return opt
    }
  }

  const getSeasonOptionLabel = (opt) => {
    return t(`seasons.${opt}`, opt)
  }

  const loadLabDataForId = (idToLoad) => {
    setInitialLoading(true)
    setErrorStatus(null)
    setErrorMessage('')
    setActiveRequestId(idToLoad)

    const defaultPayload = {
      requestId: parseInt(idToLoad, 10),
      soilPh: 6.5,
      soilPhUnknown: false,
      waterAvailability: 'MODERATE',
      expectedRainfall: 'MODERATE',
      season: 'KHARIF',
      temperatureRange: 'WARM',
      irrigation: 'YES',
    }

    api.post('/farmer/decision-lab/simulate', defaultPayload)
      .then((res) => {
        const data = res.data
        setLabData(data)

        if (data && data.originalConditions) {
          const orig = data.originalConditions
          const baseForm = {
            soilPh: orig.soilPh !== null ? orig.soilPh : 6.5,
            soilPhUnknown: Boolean(orig.soilPhUnknown),
            waterAvailability: orig.waterAvailability || 'MODERATE',
            expectedRainfall: orig.expectedRainfall || 'MODERATE',
            season: orig.season || 'KHARIF',
            temperatureRange: orig.temperatureRange || 'WARM',
            irrigation: orig.irrigation || 'YES',
          }
          setOriginalForm(baseForm)
          setSimForm(baseForm)
          runSimulationWithParams(baseForm, idToLoad)
        }
      })
      .catch((err) => {
        const status = err.response?.status || 500
        const msg = err.response?.data?.message || 'Unable to initialize Decision Lab. Please check assessment ID.'
        setErrorStatus(status)
        setErrorMessage(msg)
      })
      .finally(() => {
        setInitialLoading(false)
      })
  }

  // Fetch initial simulation (which returns original assessment and default baseline simulation)
  const fetchInitialLabData = () => {
    if (requestId) {
      loadLabDataForId(requestId)
    } else {
      setInitialLoading(true)
      setErrorStatus(null)
      setErrorMessage('')
      setNoAssessments(false)

      api.get('/farmer/crop-recommendations?page=0&size=1')
        .then((res) => {
          const list = res.data?.content || []
          if (list.length > 0 && list[0]?.id) {
            loadLabDataForId(list[0].id)
          } else {
            setNoAssessments(true)
            setInitialLoading(false)
          }
        })
        .catch((err) => {
          const status = err.response?.status || 500
          const msg = err.response?.data?.message || 'Unable to retrieve crop assessment history.'
          setErrorStatus(status)
          setErrorMessage(msg)
          setInitialLoading(false)
        })
    }
  }

  const runSimulationWithParams = (paramsToUse, targetRequestId = null) => {
    setSimulating(true)
    setSimulationError('')

    const resolvedId = targetRequestId || activeRequestId || requestId
    const payload = {
      requestId: parseInt(resolvedId, 10),
      soilPh: paramsToUse.soilPhUnknown ? null : parseFloat(paramsToUse.soilPh),
      soilPhUnknown: paramsToUse.soilPhUnknown,
      waterAvailability: paramsToUse.waterAvailability,
      expectedRainfall: paramsToUse.expectedRainfall,
      season: paramsToUse.season,
      temperatureRange: paramsToUse.temperatureRange || null,
      irrigation: paramsToUse.irrigation,
    }

    api.post('/farmer/decision-lab/simulate', payload)
      .then((res) => {
        setLabData(res.data)
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Unable to execute what-if simulation.'
        setSimulationError(msg)
      })
      .finally(() => {
        setSimulating(false)
      })
  }

  useEffect(() => {
    fetchInitialLabData()
  }, [requestId])

  const handleControlChange = (name, value) => {
    setSimForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRunSimulation = (e) => {
    if (e) e.preventDefault()
    runSimulationWithParams(simForm)
  }

  const handleResetToOriginal = () => {
    if (originalForm) {
      setSimForm(originalForm)
      runSimulationWithParams(originalForm)
    }
  }

  const toggleCropExpand = (cropId) => {
    setExpandedCropId((prev) => (prev === cropId ? null : cropId))
  }

  const getSuitabilityBadgeClass = (category) => {
    switch (category?.toUpperCase()) {
      case 'EXCELLENT':
        return 'badge-excellent'
      case 'GOOD':
        return 'badge-good'
      case 'MODERATE':
        return 'badge-moderate'
      case 'LOW':
        return 'badge-low'
      case 'POOR':
        return 'badge-poor'
      default:
        return 'badge-neutral'
    }
  }

  const getRiskBadgeClass = (riskLevel) => {
    switch (riskLevel?.toUpperCase()) {
      case 'LOW':
        return 'risk-low'
      case 'MEDIUM':
      case 'MODERATE':
        return 'risk-medium'
      case 'HIGH':
        return 'risk-high'
      default:
        return 'risk-neutral'
    }
  }

  const getFactorStatusSymbol = (status) => {
    switch (status?.toUpperCase()) {
      case 'MATCH':
        return { symbol: '✓', label: t('decisionLab.statusMatch', 'MATCH'), cssClass: 'factor-status-match' }
      case 'PARTIAL':
        return { symbol: '◐', label: t('decisionLab.statusPartial', 'PARTIAL'), cssClass: 'factor-status-partial' }
      case 'MISMATCH':
        return { symbol: '!', label: t('decisionLab.statusMismatch', 'MISMATCH'), cssClass: 'factor-status-mismatch' }
      case 'NOT_EVALUATED':
      default:
        return { symbol: '—', label: t('decisionLab.statusNotEvaluated', 'NOT EVALUATED'), cssClass: 'factor-status-not-evaluated' }
    }
  }

  const getCropEmoji = (cropName) => {
    const name = (cropName || '').toLowerCase()
    if (name.includes('rice')) return '🌾'
    if (name.includes('wheat')) return '🌾'
    if (name.includes('maize') || name.includes('corn')) return '🌽'
    if (name.includes('cotton')) return '☁️'
    if (name.includes('groundnut') || name.includes('peanut')) return '🥜'
    if (name.includes('chickpea') || name.includes('gram')) return '🫘'
    if (name.includes('pigeon') || name.includes('arhar') || name.includes('tur')) return '🫛'
    return '🌱'
  }

  // --- NO ASSESSMENTS FOUND STATE ---
  if (noAssessments) {
    return (
      <div className="lab-page-layout">
        <div className="lab-container">
          <div className="nav-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/farmer/dashboard" className="back-link">
              {t('decisionLab.backToDashboard', '← Back to Farmer Dashboard')}
            </Link>
            <LanguageSelector id="decision-lab-empty-language-select" />
          </div>

          <div className="empty-results-card" style={{ background: '#14351b', padding: '48px 32px', borderRadius: '20px', textAlign: 'center', marginTop: '32px', border: '1px solid #287b3d' }}>
            <div className="empty-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>🌱</div>
            <h3 className="empty-title" style={{ color: '#ffffff', fontSize: '22px', margin: '0 0 12px', fontWeight: 800 }}>
              {t('decisionLab.noAssessmentTitle', 'No Farm Assessment Found')}
            </h3>
            <p className="empty-sub" style={{ color: '#92bfa7', margin: '0 auto 24px', maxWidth: '560px', fontSize: '15px', lineHeight: 1.6 }}>
              {t('decisionLab.noAssessmentSub', 'Decision Lab simulates what-if scenarios (soil pH, expected rainfall, water availability, season, and irrigation) against an existing farm assessment. Please run a crop assessment first to establish your baseline farm conditions.')}
            </p>
            <div className="error-actions" style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <Link to="/farmer/crop-recommendation" className="btn-retry" style={{ textDecoration: 'none', background: '#287b3d', color: '#ffffff', padding: '12px 24px', borderRadius: '10px', fontWeight: 700 }}>
                {t('decisionLab.btnStartAssessment', '🌱 Start Farm Assessment')}
              </Link>
              <Link to="/farmer/dashboard" className="btn-secondary" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.1)', color: '#ffffff', padding: '12px 24px', borderRadius: '10px', fontWeight: 600 }}>
                {t('decisionLab.btnBackToDashboard', '📊 Back to Dashboard')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentDisplayId = labData?.requestId || activeRequestId || requestId

  // --- INITIAL LOADING STATE ---
  if (initialLoading) {
    return (
      <div className="lab-page-layout">
        <div className="lab-container">
          <div className="nav-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/farmer/crop-recommendation" className="back-link">
              {t('decisionLab.backToAssessments', '← Back to Assessments')}
            </Link>
            <LanguageSelector id="decision-lab-loading-language-select" />
          </div>
          <div className="loading-state-card">
            <div className="loading-spinner">🧪</div>
            <h3 className="loading-title">{t('decisionLab.loadingTitle', 'Initializing KisanMitra Decision Lab...')}</h3>
            <p className="loading-sub">
              {t('decisionLab.loadingSub', 'Loading original assessment conditions and active ICAR crop requirement profiles for request #{id}.').replace('{id}', currentDisplayId || '')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // --- ERROR STATES ---
  if (errorStatus) {
    return (
      <div className="lab-page-layout">
        <div className="lab-container">
          <div className="nav-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/farmer/crop-recommendation" className="back-link">
              {t('decisionLab.backToAssessments', '← Back to Assessments')}
            </Link>
            <LanguageSelector id="decision-lab-error-language-select" />
          </div>

          <div className="error-state-card">
            <div className="error-icon">
              {errorStatus === 403 ? '🔒' : errorStatus === 404 ? '🔍' : '⚠️'}
            </div>

            <h3 className="error-title">
              {errorStatus === 403
                ? t('decisionLab.errAccessDenied', 'Access Denied (403)')
                : errorStatus === 404
                ? t('decisionLab.errNotFound', 'Assessment Request Not Found (404)')
                : t('decisionLab.errLoadFailed', 'Unable to Load Decision Lab')}
            </h3>

            <p className="error-sub">{errorMessage}</p>

            <div className="error-actions">
              {errorStatus !== 403 && (
                <button onClick={fetchInitialLabData} className="btn-retry">
                  {t('decisionLab.btnRetry', '🔄 Retry Loading')}
                </button>
              )}
              <Link to="/farmer/crop-recommendation" className="btn-secondary">
                {t('decisionLab.btnBackToAssessments', '📋 Back to Assessments')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const origCond = labData?.originalConditions
  const comparison = labData?.comparison
  const origResults = labData?.originalResults?.recommendations || []
  const simResults = labData?.simulatedResults?.recommendations || []
  const origTop = origResults.length > 0 ? origResults[0] : null
  const simTop = simResults.length > 0 ? simResults[0] : null

  return (
    <div className="lab-page-layout">
      <div className="lab-container">
        {/* Navigation Bar */}
        <div className="nav-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={currentDisplayId ? `/farmer/crop-recommendation/results/${currentDisplayId}` : '/farmer/crop-recommendation'} className="back-link">
              {t('decisionLab.backToResults', '← Back to Recommendation Results')}
            </Link>
            <span className="nav-breadcrumb">
              {t('decisionLab.breadcrumbDashboard', 'Dashboard')} / {t('decisionLab.breadcrumbCropRec', 'Crop Recommendation')}{currentDisplayId ? ` / ${t('decisionLab.breadcrumbAssessment', 'Assessment #{id}').replace('{id}', currentDisplayId)}` : ''} / {t('decisionLab.breadcrumbCurrent', 'Decision Lab')}
            </span>
          </div>
          <LanguageSelector id="decision-lab-nav-language-select" />
        </div>

        {/* 1. HERO SECTION */}
        <div className="hero-lab-card">
          <div className="hero-text-content">
            <div className="hero-badge-row">
              <span className="badge-chip chip-feature">{t('decisionLab.badgeFeature', '🧪 Signature Feature #3: Decision Lab')}</span>
              <span className="badge-chip">{t('decisionLab.badgeAssessment', '🌾 Assessment #{id}').replace('{id}', currentDisplayId || '')}</span>
              <span className="badge-chip chip-info">{t('decisionLab.badgeSimulator', '⚡ Real-Time What-If Simulator')}</span>
            </div>

            <h1 className="hero-main-title">{t('decisionLab.title', 'KisanMitra Decision Lab')}</h1>

            <p className="hero-description">
              {t('decisionLab.description', 'Explore how changing farm conditions (soil pH, water availability, rainfall, season, temperature, irrigation) can affect crop suitability indicators before making a cultivation decision.')}
            </p>

            {/* Disclaimer Banner */}
            <div className="hero-disclaimer-banner">
              <span className="disclaimer-icon">ℹ️</span>
              <span>{t('decisionLab.disclaimer', 'Simulations are indicators based on available verified crop knowledge and selected parameters. They are not guarantees of yield, profit, or market outcome.')}</span>
            </div>
          </div>

          <div className="hero-image-panel">
            <img src={labHeroImg} alt="Technology & Agriculture Simulation" className="hero-crop-img" />
            <div className="hero-img-overlay"></div>
          </div>
        </div>

        {/* 2. ORIGINAL ASSESSMENT SUMMARY CARD */}
        {origCond && (
          <div className="original-summary-card">
            <div className="summary-card-header">
              <span className="card-header-icon">📍</span>
              <div>
                <h3 className="card-header-title">{t('decisionLab.baselineTitle', 'Original Assessment Baseline')}</h3>
                <p className="card-header-sub">
                  {t('decisionLab.baselineSub', 'Region: {district}, {state} • Farm Size: {farmSize} Acres')
                    .replace('{district}', origCond.district || '')
                    .replace('{state}', origCond.state || '')
                    .replace('{farmSize}', origCond.farmSize != null ? origCond.farmSize : '')}
                </p>
              </div>
            </div>

            <div className="baseline-params-grid">
              <div className="param-box">
                <span className="param-label">{t('decisionLab.labelSoilType', 'Soil Type')}</span>
                <span className="param-val">{origCond.soilType || 'N/A'}</span>
              </div>
              <div className="param-box">
                <span className="param-label">{t('decisionLab.labelSoilPh', 'Soil pH')}</span>
                <span className="param-val">
                  {origCond.soilPhUnknown ? t('decisionLab.valUnknownNotSet', 'Unknown (Not set)') : origCond.soilPh != null ? origCond.soilPh : 'N/A'}
                </span>
              </div>
              <div className="param-box">
                <span className="param-label">{t('decisionLab.labelWaterAvailability', 'Water Availability')}</span>
                <span className="param-val">{origCond.waterAvailability ? getWaterOptionLabel(origCond.waterAvailability) : 'N/A'}</span>
              </div>
              <div className="param-box">
                <span className="param-label">{t('decisionLab.labelExpectedRainfall', 'Expected Rainfall')}</span>
                <span className="param-val">{origCond.expectedRainfall ? getRainfallOptionLabel(origCond.expectedRainfall) : 'N/A'}</span>
              </div>
              <div className="param-box">
                <span className="param-label">{t('decisionLab.labelTargetSeason', 'Target Season')}</span>
                <span className="param-val">{origCond.season ? getSeasonOptionLabel(origCond.season) : 'N/A'}</span>
              </div>
              <div className="param-box">
                <span className="param-label">{t('decisionLab.labelTemperatureRange', 'Temperature Range')}</span>
                <span className="param-val">{origCond.temperatureRange ? getTempOptionLabel(origCond.temperatureRange) : 'N/A'}</span>
              </div>
              <div className="param-box">
                <span className="param-label">{t('decisionLab.labelIrrigationStatus', 'Irrigation Status')}</span>
                <span className="param-val">{origCond.irrigation ? getIrrigationOptionLabel(origCond.irrigation) : 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. WHAT-IF CONTROLS SECTION */}
        <div className="controls-card-container">
          <div className="controls-header">
            <span className="card-header-icon">🎛️</span>
            <div>
              <h2 className="card-header-title">{t('decisionLab.controlsTitle', 'Change Farm Conditions (What-If Parameters)')}</h2>
              <p className="card-header-sub">
                {t('decisionLab.controlsSub', 'Modify one or more environmental variables below and run the simulation to see how crop suitability responds.')}
              </p>
            </div>
          </div>

          <form onSubmit={handleRunSimulation} className="controls-form">
            <div className="controls-grid">
              {/* Soil pH Control */}
              <div className="control-box">
                <div className="control-label-row">
                  <label className="ctrl-label">{t('decisionLab.ctrlSoilPh', '🧪 Soil pH Range (4.0 – 9.5)')}</label>
                  <span className="ctrl-val-badge">
                    {simForm.soilPhUnknown ? t('decisionLab.valUnknown', 'Unknown') : simForm.soilPh}
                  </span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="9.5"
                  step="0.1"
                  value={simForm.soilPh}
                  disabled={simForm.soilPhUnknown}
                  onChange={(e) => handleControlChange('soilPh', parseFloat(e.target.value))}
                  className="ctrl-slider"
                />
                <label className="checkbox-inline">
                  <input
                    type="checkbox"
                    checked={simForm.soilPhUnknown}
                    onChange={(e) => handleControlChange('soilPhUnknown', e.target.checked)}
                  />
                  {t('decisionLab.chkUnknownPh', "I don't know my soil pH")}
                </label>
              </div>

              {/* Water Availability Control */}
              <div className="control-box">
                <label className="ctrl-label">{t('decisionLab.ctrlWaterAvailability', '💧 Water Availability')}</label>
                <select
                  value={simForm.waterAvailability}
                  onChange={(e) => handleControlChange('waterAvailability', e.target.value)}
                  className="ctrl-select"
                >
                  {WATER_AVAILABILITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{getWaterOptionLabel(opt)}</option>
                  ))}
                </select>
              </div>

              {/* Expected Rainfall Control */}
              <div className="control-box">
                <label className="ctrl-label">{t('decisionLab.ctrlExpectedRainfall', '🌧️ Expected Rainfall')}</label>
                <select
                  value={simForm.expectedRainfall}
                  onChange={(e) => handleControlChange('expectedRainfall', e.target.value)}
                  className="ctrl-select"
                >
                  {RAINFALL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{getRainfallOptionLabel(opt)}</option>
                  ))}
                </select>
              </div>

              {/* Target Season Control */}
              <div className="control-box">
                <label className="ctrl-label">{t('decisionLab.ctrlTargetSeason', '🗓️ Target Season')}</label>
                <select
                  value={simForm.season}
                  onChange={(e) => handleControlChange('season', e.target.value)}
                  className="ctrl-select"
                >
                  {SEASON_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{getSeasonOptionLabel(opt)}</option>
                  ))}
                </select>
              </div>

              {/* Temperature Range Control */}
              <div className="control-box">
                <label className="ctrl-label">{t('decisionLab.ctrlTemperatureRange', '🌡️ Temperature Range')}</label>
                <select
                  value={simForm.temperatureRange}
                  onChange={(e) => handleControlChange('temperatureRange', e.target.value)}
                  className="ctrl-select"
                >
                  {TEMP_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{getTempOptionLabel(opt)}</option>
                  ))}
                </select>
              </div>

              {/* Irrigation Control */}
              <div className="control-box">
                <label className="ctrl-label">{t('decisionLab.ctrlIrrigation', '🚰 Irrigation Available?')}</label>
                <select
                  value={simForm.irrigation}
                  onChange={(e) => handleControlChange('irrigation', e.target.value)}
                  className="ctrl-select"
                >
                  {IRRIGATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{getIrrigationOptionLabel(opt)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="controls-actions-row">
              <button type="submit" className="btn-run-simulation" disabled={simulating}>
                {simulating ? t('decisionLab.btnRunning', '⏳ Running Simulation...') : t('decisionLab.btnRunSimulation', '🧪 Run What-If Simulation')}
              </button>

              <button type="button" className="btn-reset-params" onClick={handleResetToOriginal} disabled={simulating}>
                {t('decisionLab.btnReset', '🔄 Reset to Original')}
              </button>
            </div>

            {simulationError && (
              <div className="feedback-banner banner-error">
                <span>⚠️</span>
                <span>{simulationError}</span>
              </div>
            )}
          </form>
        </div>

        {/* 5. BEFORE VS AFTER COMPARISON CARDS */}
        {origTop && simTop && (
          <div className="before-after-container">
            <div className="ba-cards-grid">
              {/* ORIGINAL ASSESSMENT CARD */}
              <div className="ba-card ba-original-card">
                <div className="ba-card-tag tag-original">{t('decisionLab.tagOriginalAssessment', 'ORIGINAL ASSESSMENT')}</div>
                <div className="ba-crop-header">
                  <span className="ba-emoji">{getCropEmoji(origTop.crop?.name)}</span>
                  <div>
                    <h3 className="ba-crop-name">{t(`crops.${origTop.crop?.name}`, origTop.crop?.name)}</h3>
                    <span className="ba-sci-name">{origTop.crop?.scientificName}</span>
                  </div>
                </div>

                <div className="ba-badges">
                  <span className={`suitability-badge ${getSuitabilityBadgeClass(origTop.suitability)}`}>
                    {t(`suitability.${origTop.suitability}`, origTop.suitability)} {t('decisionLab.suitabilitySuffix', 'SUITABILITY')}
                  </span>
                  {origTop.riskLevel && (
                    <span className={`risk-badge ${getRiskBadgeClass(origTop.riskLevel)}`}>
                      🛡️ {t(`riskLevels.${origTop.riskLevel}`, origTop.riskLevel)} {t('decisionLab.riskSuffix', 'RISK')}
                    </span>
                  )}
                </div>

                <div className="ba-score-box">
                  <span className="ba-score-num">{origTop.overallScore}</span>
                  <span className="ba-score-sub">{t('decisionLab.outOf100', 'out of 100')}</span>
                </div>
              </div>

              {/* SIMULATED SCENARIO CARD */}
              <div className={`ba-card ba-simulated-card ${comparison?.topCropChanged ? 'crop-changed-glow' : ''}`}>
                <div className="ba-card-tag tag-simulated">{t('decisionLab.tagSimulatedScenario', 'SIMULATED SCENARIO')}</div>
                <div className="ba-crop-header">
                  <span className="ba-emoji">{getCropEmoji(simTop.crop?.name)}</span>
                  <div>
                    <h3 className="ba-crop-name">{t(`crops.${simTop.crop?.name}`, simTop.crop?.name)}</h3>
                    <span className="ba-sci-name">{simTop.crop?.scientificName}</span>
                  </div>
                </div>

                <div className="ba-badges">
                  <span className={`suitability-badge ${getSuitabilityBadgeClass(simTop.suitability)}`}>
                    {t(`suitability.${simTop.suitability}`, simTop.suitability)} {t('decisionLab.suitabilitySuffix', 'SUITABILITY')}
                  </span>
                  {simTop.riskLevel && (
                    <span className={`risk-badge ${getRiskBadgeClass(simTop.riskLevel)}`}>
                      🛡️ {t(`riskLevels.${simTop.riskLevel}`, simTop.riskLevel)} {t('decisionLab.riskSuffix', 'RISK')}
                    </span>
                  )}
                </div>

                <div className="ba-score-box">
                  <span className="ba-score-num sim-score-color">{simTop.overallScore}</span>
                  <span className="ba-score-sub">{t('decisionLab.outOf100', 'out of 100')}</span>
                </div>
              </div>
            </div>

            {/* 6. DECISION CHANGE SUMMARY */}
            {comparison && (
              <div className="decision-change-panel">
                <div className="dc-header">
                  <span className="dc-icon">📊</span>
                  <h4 className="dc-title">{t('decisionLab.whatChangedTitle', 'What Changed in this Simulation?')}</h4>
                </div>

                <p className="dc-summary-text">{comparison.summaryExplanation}</p>

                <div className="dc-pills-row">
                  <span className={`dc-pill ${comparison.scoreDifference > 0 ? 'pill-positive' : comparison.scoreDifference < 0 ? 'pill-negative' : 'pill-neutral'}`}>
                    {t('decisionLab.scoreDiffPill', 'Score Difference: {diff} pts')
                      .replace('{diff}', comparison.scoreDifference > 0 ? `+${comparison.scoreDifference}` : comparison.scoreDifference)}
                  </span>

                  <span className={`dc-pill ${comparison.topCropChanged ? 'pill-warning' : 'pill-info'}`}>
                    {comparison.topCropChanged
                      ? t('decisionLab.topCropChanged', '⚠️ Top-Ranked Crop Changed')
                      : t('decisionLab.topCropUnchanged', '✓ Top-Ranked Crop Remained Unchanged')}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. FACTOR-BY-FACTOR COMPARISON TABLE */}
        {comparison && comparison.topCropFactorComparisons && comparison.topCropFactorComparisons.length > 0 && (
          <div className="factor-comparison-section">
            <div className="section-title-box">
              <span className="section-icon">⚖️</span>
              <div>
                <h2 className="section-title">{t('decisionLab.factorShiftTitle', 'Factor-by-Factor Evaluation Shift')}</h2>
                <p className="section-sub">
                  {t('decisionLab.factorShiftSub', 'Comparing how individual agronomic factors shifted for top crop ({crop}) between original and simulated conditions.')
                    .replace('{crop}', t(`crops.${origTop?.crop?.name}`, origTop?.crop?.name || ''))}
                </p>
              </div>
            </div>

            <div className="comp-table-container">
              <table className="comp-table">
                <thead>
                  <tr>
                    <th>{t('decisionLab.thAgronomicFactor', 'Agronomic Factor')}</th>
                    <th>{t('decisionLab.thOriginalStatus', 'Original Status')}</th>
                    <th>{t('decisionLab.thSimulatedStatus', 'Simulated Status')}</th>
                    <th>{t('decisionLab.thImpactResult', 'Impact / Result')}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.topCropFactorComparisons.map((fc, idx) => {
                    const origSt = getFactorStatusSymbol(fc.originalStatus)
                    const simSt = getFactorStatusSymbol(fc.simulatedStatus)

                    return (
                      <tr key={idx} className={fc.statusChanged ? 'row-changed' : ''}>
                        <td><strong>{fc.factorName}</strong></td>
                        <td>
                          <span className={`factor-symbol ${origSt.cssClass}`}>
                            {origSt.symbol} {origSt.label} ({fc.originalScore?.toFixed(1)})
                          </span>
                        </td>
                        <td>
                          <span className={`factor-symbol ${simSt.cssClass}`}>
                            {simSt.symbol} {simSt.label} ({fc.simulatedScore?.toFixed(1)})
                          </span>
                        </td>
                        <td>
                          <span className={`impact-pill ${fc.impact === 'Improved' ? 'impact-improved' : fc.impact === 'Degraded' ? 'impact-degraded' : 'impact-unchanged'}`}>
                            {fc.impact === 'Improved'
                              ? t('decisionLab.impactImproved', '📈 Improved')
                              : fc.impact === 'Degraded'
                              ? t('decisionLab.impactDegraded', '📉 Degraded')
                              : t('decisionLab.impactUnchanged', '➖ Unchanged')}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. SIMULATED CROP RANKINGS LIST */}
        {simResults.length > 0 && (
          <div className="sim-rankings-section">
            <div className="section-title-box">
              <span className="section-icon">🏆</span>
              <div>
                <h2 className="section-title">{t('decisionLab.simRankingsTitle', 'Simulated Crop Rankings')}</h2>
                <p className="section-sub">
                  {t('decisionLab.simRankingsSub', 'All active crops re-evaluated and ranked under your simulated what-if parameters.')}
                </p>
              </div>
            </div>

            <div className="sim-rankings-list">
              {simResults.map((item, index) => {
                const isExpanded = expandedCropId === item.crop?.id
                const isTop = index === 0

                return (
                  <div
                    key={item.crop?.id || index}
                    className={`sim-crop-card ${isTop ? 'sim-top-card' : ''}`}
                  >
                    <div className="sim-card-main-row" onClick={() => toggleCropExpand(item.crop?.id)}>
                      <div className="sim-rank-box">
                        <span className="rank-num">#{String(index + 1).padStart(2, '0')}</span>
                      </div>

                      <div className="sim-crop-info">
                        <div className="sim-title-wrap">
                          <span className="crop-emoji">{getCropEmoji(item.crop?.name)}</span>
                          <h4 className="sim-crop-name">{t(`crops.${item.crop?.name}`, item.crop?.name)}</h4>
                          <span className="sim-sci-name">({item.crop?.scientificName})</span>
                        </div>
                        <p className="sim-short-desc">{item.crop?.description}</p>
                      </div>

                      <div className="sim-badges-wrap">
                        <span className={`suitability-badge ${getSuitabilityBadgeClass(item.suitability)}`}>
                          {t(`suitability.${item.suitability}`, item.suitability)}
                        </span>
                        {item.riskLevel && (
                          <span className={`risk-badge ${getRiskBadgeClass(item.riskLevel)}`}>
                            {t(`riskLevels.${item.riskLevel}`, item.riskLevel)} {t('decisionLab.riskSuffix', 'RISK')}
                          </span>
                        )}
                      </div>

                      <div className="sim-score-box">
                        <div className="sim-score-value">{item.overallScore}</div>
                        <div className="sim-score-sub">{t('decisionLab.outOf100', 'out of 100')}</div>
                      </div>

                      <button className="btn-expand-toggle" aria-label={t('common.toggleDetails', 'Toggle details')}>
                        {isExpanded ? '▲' : '▼'}
                      </button>
                    </div>

                    {/* Expandable Details Drawer */}
                    {isExpanded && (
                      <div className="sim-details-drawer">
                        <div className="drawer-explanation">
                          <strong>{t('decisionLab.simRationalePrefix', 'Simulated Rationale:')}</strong> {item.explanation}
                        </div>

                        <div className="drawer-attributes-grid">
                          {item.waterRequirement && (
                            <div className="attr-box">
                              <span className="attr-icon">💧</span>
                              <div>
                                <span className="attr-label">{t('decisionLab.labelWaterReq', 'Water Requirement')}</span>
                                <p className="attr-val">{item.waterRequirement}</p>
                              </div>
                            </div>
                          )}
                          {item.growingPeriod && (
                            <div className="attr-box">
                              <span className="attr-icon">⏳</span>
                              <div>
                                <span className="attr-label">{t('decisionLab.labelGrowingDuration', 'Growing Duration')}</span>
                                <p className="attr-val">{item.growingPeriod}</p>
                              </div>
                            </div>
                          )}
                          {item.sustainabilityNotes && (
                            <div className="attr-box">
                              <span className="attr-icon">🌿</span>
                              <div>
                                <span className="attr-label">{t('decisionLab.labelSustainabilityNote', 'Sustainability Note')}</span>
                                <p className="attr-val">{item.sustainabilityNotes}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Source Attribution */}
                        {item.source && (
                          <div className="drawer-source-footer">
                            <div className="source-info">
                              <span>{t('decisionLab.sourcePrefix', '📌 Source:')} <strong>{item.source.name}</strong></span>
                              {item.source.updatedDate && <span> {t('decisionLab.datePrefix', '• Date:')} {item.source.updatedDate}</span>}
                            </div>
                            {item.source.url && (
                              <a
                                href={item.source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="source-url-link"
                              >
                                {t('decisionLab.officialDocLink', '🌐 Official ICAR Document ↗')}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 10. "BEFORE YOU DECIDE" LIMITATIONS PANEL */}
        <div className="limitations-panel">
          <div className="limitations-header">
            <span className="limitations-icon">⚠️</span>
            <h4 className="limitations-title">{t('decisionLab.limitationsTitle', 'Before You Decide — What-If Boundaries')}</h4>
          </div>
          <ul className="limitations-list">
            <li>{t('decisionLab.limitation1', 'What-If simulations rely strictly on verified ICAR crop requirement profiles and your selected parameters.')}</li>
            <li>{t('decisionLab.limitation2', 'Real farm conditions may vary due to micro-climates, localized soil depth, pest outbreaks, and unpredicted rainfall.')}</li>
            <li>{t('decisionLab.limitation3', 'Simulated scores indicate agronomic compatibility changes, not market prices, yield predictions, or financial returns.')}</li>
            <li>{t('decisionLab.limitation4', 'Always consult a local agricultural extension officer or district agronomic expert before making major farm investments.')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DecisionLabPage
