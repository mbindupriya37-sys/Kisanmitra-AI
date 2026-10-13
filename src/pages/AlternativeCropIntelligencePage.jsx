import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { useLanguage } from '../context/LanguageContext'
import LanguageSelector from '../components/LanguageSelector'
import altHeroImg from '../assets/card-market-intelligence.png'
import './AlternativeCropIntelligence.css'

function AlternativeCropIntelligencePage() {
  const { requestId } = useParams()
  const { t } = useLanguage()

  const [loading, setLoading] = useState(true)
  const [errorStatus, setErrorStatus] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [resultData, setResultData] = useState(null)
  const [activeRequestId, setActiveRequestId] = useState(requestId || null)
  const [noAssessments, setNoAssessments] = useState(false)

  const [selectedCropId, setSelectedCropId] = useState(null)
  const [comparedAltId, setComparedAltId] = useState(null)

  const getCropDisplayName = (cropName) => {
    if (!cropName) return ''
    return t(`crops.${cropName}`, cropName)
  }

  const getFactorDisplayName = (factorName) => {
    if (!factorName) return ''
    return t(`factors.${factorName}`, factorName)
  }

  const loadAssessmentResults = (targetId) => {
    setLoading(true)
    setErrorStatus(null)
    setErrorMessage('')

    api.get(`/farmer/crop-recommendations/${targetId}/results`)
      .then((res) => {
        setResultData(res.data)
        const recs = res.data?.recommendations || []
        if (recs.length > 0) {
          // If 2 or more crops exist, pre-select the 2nd crop or lowest score crop so alternatives exist by default
          if (recs.length >= 2) {
            setSelectedCropId(recs[recs.length - 1].crop?.id || recs[0].crop?.id)
            setComparedAltId(recs[0].crop?.id || null)
          } else {
            setSelectedCropId(recs[0].crop?.id || null)
          }
        }
      })
      .catch((err) => {
        const status = err.response?.status || 500
        const msg = err.response?.data?.message || t('altCrop.errGeneric', 'Unable to load crop assessment data for alternative intelligence.')
        setErrorStatus(status)
        setErrorMessage(msg)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const fetchResults = () => {
    setLoading(true)
    setErrorStatus(null)
    setErrorMessage('')
    setNoAssessments(false)

    if (requestId) {
      loadAssessmentResults(requestId)
    } else {
      // If opened from dashboard without explicit requestId, fetch farmer's latest assessment
      api.get('/farmer/crop-recommendations?page=0&size=1')
        .then((res) => {
          const list = res.data?.content || []
          if (list.length > 0 && list[0]?.id) {
            const latestId = list[0].id
            setActiveRequestId(latestId)
            loadAssessmentResults(latestId)
          } else {
            setNoAssessments(true)
            setLoading(false)
          }
        })
        .catch((err) => {
          const status = err.response?.status || 500
          const msg = err.response?.data?.message || t('altCrop.errGeneric', 'Unable to load crop assessment history.')
          setErrorStatus(status)
          setErrorMessage(msg)
          setLoading(false)
        })
    }
  }

  useEffect(() => {
    if (requestId) {
      setActiveRequestId(requestId)
    }
    fetchResults()
  }, [requestId])

  const recommendations = resultData?.recommendations || []

  // Find currently selected crop object
  const selectedCrop = recommendations.find((r) => r.crop?.id === selectedCropId) || (recommendations.length > 0 ? recommendations[0] : null)

  /**
   * STEP 7K PART 7 — ALTERNATIVE QUALITY FILTER
   * Filters meaningful alternatives with higher score or stronger factor matches.
   */
  const getMeaningfulAlternatives = (selCrop, allRecs) => {
    if (!selCrop || !allRecs) return []

    return allRecs
      .filter((item) => {
        if (item.crop?.id === selCrop.crop?.id) return false // exclude selected crop

        const scoreDiff = item.overallScore - selCrop.overallScore
        if (scoreDiff > 0) return true

        // If scores equal, check if item has strictly more MATCH factors
        if (scoreDiff === 0) {
          const itemMatches = (item.factors || []).filter((f) => f.status === 'MATCH').length
          const selMatches = (selCrop.factors || []).filter((f) => f.status === 'MATCH').length
          return itemMatches > selMatches
        }

        return false
      })
      .sort((a, b) => b.overallScore - a.overallScore)
  }

  const alternatives = getMeaningfulAlternatives(selectedCrop, recommendations)

  // Currently compared alternative object for side-by-side comparison table
  const comparedAltCrop = recommendations.find((r) => r.crop?.id === comparedAltId) || (alternatives.length > 0 ? alternatives[0] : null)

  // Update default compared alternative when selected crop changes
  const handleSelectCrop = (cropId) => {
    setSelectedCropId(cropId)
    const newSelCrop = recommendations.find((r) => r.crop?.id === cropId)
    const newAlts = getMeaningfulAlternatives(newSelCrop, recommendations)
    if (newAlts.length > 0) {
      setComparedAltId(newAlts[0].crop?.id)
    } else {
      setComparedAltId(null)
    }
  }

  /**
   * STEP 7K PART 5 — "WHY THIS ALTERNATIVE?" EXPLANATION ENGINE
   * Generates deterministic, data-supported explanations comparing alternative against selected crop.
   */
  const getWhyAlternativeExplanations = (selCrop, altCrop) => {
    if (!selCrop || !altCrop) return []

    const explanations = []
    const scoreDiff = altCrop.overallScore - selCrop.overallScore

    if (scoreDiff > 0) {
      explanations.push({
        type: 'score',
        icon: '⭐',
        text: t('altCrop.whyScoreExp', 'Higher overall agronomic suitability score (+{pts} points).').replace('{pts}', scoreDiff.toFixed(1)),
      })
    }

    const selectedFactorsMap = {}
    ;(selCrop.factors || []).forEach((f) => {
      if (f.factorName) selectedFactorsMap[f.factorName.toLowerCase()] = f
    })

    const altFactors = altCrop.factors || []

    altFactors.forEach((altF) => {
      const key = altF.factorName?.toLowerCase() || ''
      const selF = selectedFactorsMap[key]

      if (selF && altF.status === 'MATCH' && selF.status !== 'MATCH') {
        if (key.includes('water')) {
          explanations.push({ type: 'water', icon: '💧', text: t('altCrop.whyWaterExp', 'Stronger water suitability under your current farm assessment.') })
        } else if (key.includes('soil') && !key.includes('ph')) {
          explanations.push({ type: 'soil', icon: '🪨', text: t('altCrop.whySoilExp', 'Better soil type compatibility under assessed conditions.') })
        } else if (key.includes('ph')) {
          explanations.push({ type: 'ph', icon: '🧪', text: t('altCrop.whyPhExp', 'More optimal soil pH range alignment.') })
        } else if (key.includes('temp') || key.includes('temperature')) {
          explanations.push({ type: 'temp', icon: '🌡️', text: t('altCrop.whyTempExp', 'Better temperature compatibility under the assessed conditions.') })
        } else if (key.includes('rain') || key.includes('rainfall')) {
          explanations.push({ type: 'rainfall', icon: '🌧️', text: t('altCrop.whyRainfallExp', 'Better expected rainfall compatibility for your target season.') })
        } else if (key.includes('season')) {
          explanations.push({ type: 'season', icon: '🗓️', text: t('altCrop.whySeasonExp', 'More favorable seasonal growing conditions.') })
        } else if (key.includes('irrigation')) {
          explanations.push({ type: 'irrigation', icon: '🚰', text: t('altCrop.whyIrrigationExp', 'Better irrigation requirement alignment.') })
        }
      }
    })

    // Risk Level comparison
    const riskRank = { LOW: 3, MODERATE: 2, MEDIUM: 2, HIGH: 1 }
    const altRiskVal = riskRank[altCrop.riskLevel?.toUpperCase()] || 0
    const selRiskVal = riskRank[selCrop.riskLevel?.toUpperCase()] || 0

    if (altRiskVal > selRiskVal) {
      explanations.push({
        type: 'risk',
        icon: '🛡️',
        text: t('altCrop.whyRiskExp', 'Lower crop-risk classification ({altRisk} Risk vs {selRisk} Risk) in verified ICAR knowledge.')
          .replace('{altRisk}', t('riskLevels.' + altCrop.riskLevel, altCrop.riskLevel))
          .replace('{selRisk}', t('riskLevels.' + selCrop.riskLevel, selCrop.riskLevel)),
      })
    }

    // Factor match count comparison
    const altMatchesCount = altFactors.filter((f) => f.status === 'MATCH').length
    const selMatchesCount = (selCrop.factors || []).filter((f) => f.status === 'MATCH').length

    if (altMatchesCount > selMatchesCount && !explanations.some((e) => e.type === 'matches')) {
      explanations.push({
        type: 'matches',
        icon: '✓',
        text: t('altCrop.whyMatchesExp', 'More suitability factors matched ({altMatches} matched vs {selMatches} for selected crop).')
          .replace('{altMatches}', altMatchesCount)
          .replace('{selMatches}', selMatchesCount),
      })
    }

    if (explanations.length === 0 && scoreDiff > 0) {
      explanations.push({
        type: 'general',
        icon: '📈',
        text: t('altCrop.whyGeneralExp', 'Stronger overall agronomic compatibility derived from ICAR verified requirements.'),
      })
    }

    return explanations
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
        return { symbol: '✓', label: t('altCrop.factorMatch', 'MATCH'), cssClass: 'factor-status-match' }
      case 'PARTIAL':
        return { symbol: '◐', label: t('altCrop.factorPartial', 'PARTIAL'), cssClass: 'factor-status-partial' }
      case 'MISMATCH':
        return { symbol: '!', label: t('altCrop.factorMismatch', 'MISMATCH'), cssClass: 'factor-status-mismatch' }
      case 'NOT_EVALUATED':
      default:
        return { symbol: '—', label: t('altCrop.factorNotEvaluated', 'NOT EVALUATED'), cssClass: 'factor-status-not-evaluated' }
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

  const displayRequestId = resultData?.requestId || activeRequestId || requestId

  // --- NO ASSESSMENTS FOUND STATE ---
  if (noAssessments) {
    return (
      <div className="alt-page-layout">
        <div className="alt-container">
          <div className="nav-header-row">
            <Link to="/farmer/dashboard" className="back-link">
              {t('altCrop.backToFarmerDash', '← Back to Farmer Dashboard')}
            </Link>
            <LanguageSelector id="alt-crop-language-select" />
          </div>

          <div className="empty-results-card">
            <div className="empty-icon">🌱</div>
            <h3 className="empty-title" style={{ color: '#ffffff', fontSize: '20px', margin: '0 0 8px' }}>
              {t('altCrop.noAssessmentTitle', 'No Farm Assessment Found')}
            </h3>
            <p className="empty-sub" style={{ color: '#92bfa7', margin: '0 0 16px', maxWidth: '520px' }}>
              {t('altCrop.noAssessmentSub', 'Alternative Crop Intelligence compares suitable crops against your specific farm conditions. Please run a crop assessment first to evaluate your soil, water, and seasonal factors.')}
            </p>
            <div className="error-actions">
              <Link to="/farmer/crop-recommendation" className="btn-retry" style={{ textDecoration: 'none' }}>
                {t('altCrop.btnStartAssessment', '🌱 Start Farm Assessment')}
              </Link>
              <Link to="/farmer/dashboard" className="btn-secondary" style={{ textDecoration: 'none' }}>
                {t('altCrop.btnBackToDashboard', '📊 Back to Dashboard')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="alt-page-layout">
        <div className="alt-container">
          <div className="nav-header-row">
            <Link to="/farmer/crop-recommendation" className="back-link">
              {t('altCrop.backToAssessments', '← Back to Assessment History')}
            </Link>
            <LanguageSelector id="alt-crop-language-select" />
          </div>
          <div className="loading-state-card">
            <div className="loading-spinner">🌾</div>
            <h3 className="loading-title">{t('altCrop.loadingTitle', 'Loading alternative crop intelligence...')}</h3>
            <p className="loading-sub">
              {displayRequestId
                ? t('altCrop.loadingSubWithId', 'Analyzing evaluated crops for assessment #{id} to identify better-suited alternative crop options.').replace('{id}', displayRequestId)
                : t('altCrop.loadingSubDefault', 'Retrieving your latest farm assessment to evaluate better-suited alternative crop options.')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // --- ERROR STATES ---
  if (errorStatus) {
    return (
      <div className="alt-page-layout">
        <div className="alt-container">
          <div className="nav-header-row">
            <Link to="/farmer/crop-recommendation" className="back-link">
              {t('altCrop.backToAssessments', '← Back to Assessment History')}
            </Link>
            <LanguageSelector id="alt-crop-language-select" />
          </div>

          <div className="error-state-card">
            <div className="error-icon">
              {errorStatus === 403 ? '🔒' : errorStatus === 404 ? '🔍' : '⚠️'}
            </div>

            <h3 className="error-title">
              {errorStatus === 403
                ? t('altCrop.errAccessDenied', 'Access Denied (403)')
                : errorStatus === 404
                ? t('altCrop.errNotFound', 'Assessment Request Not Found (404)')
                : t('altCrop.errGeneric', 'Unable to Load Alternative Intelligence')}
            </h3>

            <p className="error-sub">{errorMessage}</p>

            <div className="error-actions">
              {errorStatus !== 403 && (
                <button onClick={fetchResults} className="btn-retry">
                  {t('altCrop.btnRetry', '🔄 Retry Analysis')}
                </button>
              )}
              <Link to="/farmer/crop-recommendation" className="btn-secondary">
                {t('altCrop.btnBackToAssessments', '📋 Back to Assessments')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="alt-page-layout">
      <div className="alt-container">
        {/* Navigation Header */}
        <div className="nav-header-row">
          <Link
            to={displayRequestId ? `/farmer/crop-recommendation/results/${displayRequestId}` : '/farmer/crop-recommendation'}
            className="back-link"
          >
            {displayRequestId ? t('altCrop.backToResults', '← Back to Recommendation Results') : t('altCrop.backToCropRec', '← Back to Crop Recommendations')}
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <LanguageSelector id="alt-crop-language-select" />
            <span className="nav-breadcrumb">
              {t('altCrop.breadcrumbDash', 'Dashboard')} / {t('altCrop.breadcrumbCropRec', 'Crop Recommendation')}{displayRequestId ? ` / ${t('altCrop.assessmentBadge', 'Assessment #{id}').replace('{id}', displayRequestId)}` : ''} / {t('altCrop.breadcrumbAltIntel', 'Alternative Intelligence')}
            </span>
          </div>
        </div>

        {/* 1. HERO SECTION */}
        <div className="hero-alt-card">
          <div className="hero-text-content">
            <div className="hero-badge-row">
              <span className="badge-chip">{t('altCrop.assessmentBadge', '🌾 Assessment #{id}').replace('{id}', displayRequestId || t('altCrop.latest', 'Latest'))}</span>
              <span className="badge-chip chip-feature">{t('altCrop.signatureBadge', 'Signature Feature: Alternative Crop Intelligence')}</span>
              <span className="badge-chip chip-info">{t('altCrop.verifiedCropsBadge', '{count} Verified Crops').replace('{count}', recommendations.length)}</span>
            </div>

            <h1 className="hero-main-title">{t('altCrop.heroTitle', 'Alternative Crop Intelligence')}</h1>

            <p className="hero-description">
              {t('altCrop.heroDesc', 'Compare your considered crop with other crops that may be better suited to the exact same farm conditions.')}
            </p>

            <div className="hero-trust-bar">
              <span>{t('altCrop.trustDecisionSupport', '🛡️ Agronomic Decision Support')}</span>
              <span>•</span>
              <span>{t('altCrop.trustIcar', '📌 Traceable ICAR Agronomic Requirements')}</span>
            </div>
          </div>

          <div className="hero-image-panel">
            <img src={altHeroImg} alt="Different Crop Fields" className="hero-crop-img" />
            <div className="hero-img-overlay"></div>
          </div>
        </div>

        {/* NO CROPS IN ASSESSMENT */}
        {recommendations.length === 0 ? (
          <div className="empty-results-card">
            <div className="empty-icon">🌱</div>
            <h3>{t('altCrop.noCropsTitle', 'No crop data available for this assessment')}</h3>
            <p>{t('altCrop.noCropsSub', 'Verified crop recommendations could not be found {requestPart}.').replace('{requestPart}', displayRequestId ? `for request #${displayRequestId}` : '')}</p>
          </div>
        ) : (
          <>
            {/* 2. CROP SELECTION SECTION */}
            <div className="selection-section">
              <div className="section-title-box">
                <span className="section-icon">🔍</span>
                <div>
                  <h2 className="section-title">{t('altCrop.whichCropTitle', 'Which crop are you considering?')}</h2>
                  <p className="section-sub">
                    {t('altCrop.whichCropSub', 'Select the crop you are planning or considering for your farm to explore better-suited alternatives.')}
                  </p>
                </div>
              </div>

              <div className="crop-selector-grid">
                {recommendations.map((item) => {
                  const isSelected = item.crop?.id === selectedCrop?.crop?.id
                  return (
                    <div
                      key={item.crop?.id}
                      className={`selector-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectCrop(item.crop?.id)}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                    >
                      <div className="selector-top">
                        <span className="selector-emoji">{getCropEmoji(item.crop?.name)}</span>
                        <div className="selector-crop-meta">
                          <h4 className="selector-crop-name">{getCropDisplayName(item.crop?.name)}</h4>
                          <span className="selector-sci-name">{item.crop?.scientificName}</span>
                        </div>
                      </div>

                      <div className="selector-badges">
                        <span className={`suitability-badge ${getSuitabilityBadgeClass(item.suitability)}`}>
                          {t(`suitability.${item.suitability}`, item.suitability)}
                        </span>
                        {item.riskLevel && (
                          <span className={`risk-badge ${getRiskBadgeClass(item.riskLevel)}`}>
                            {t('altCrop.riskBadge', '{level} RISK').replace('{level}', t(`riskLevels.${item.riskLevel}`, item.riskLevel))}
                          </span>
                        )}
                      </div>

                      <div className="selector-score">
                        <span className="sel-score-num">{item.overallScore}</span>
                        <span className="sel-score-max">/ 100</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 3. SELECTED CROP ANALYSIS CARD */}
            {selectedCrop && (
              <div className="selected-analysis-card">
                <div className="analysis-header">
                  <div className="analysis-tag">{t('altCrop.consideredCropTag', '📌 YOUR CONSIDERED CROP')}</div>
                  <div className="analysis-title-row">
                    <span className="analysis-emoji">{getCropEmoji(selectedCrop.crop?.name)}</span>
                    <div>
                      <h3 className="analysis-crop-name">{getCropDisplayName(selectedCrop.crop?.name)}</h3>
                      <span className="analysis-sci-name">{selectedCrop.crop?.scientificName}</span>
                    </div>
                  </div>
                </div>

                <div className="analysis-stats-row">
                  <div className="analysis-stat">
                    <span className="stat-label">{t('altCrop.scoreLabel', 'Suitability Score')}</span>
                    <span className="stat-val score-highlight">{selectedCrop.overallScore} / 100</span>
                  </div>
                  <div className="analysis-stat">
                    <span className="stat-label">{t('altCrop.categoryLabel', 'Suitability Category')}</span>
                    <span className={`suitability-badge ${getSuitabilityBadgeClass(selectedCrop.suitability)}`}>
                      {t(`suitability.${selectedCrop.suitability}`, selectedCrop.suitability)}
                    </span>
                  </div>
                  <div className="analysis-stat">
                    <span className="stat-label">{t('altCrop.cropRiskLabel', 'Crop Risk Level')}</span>
                    <span className={`risk-badge ${getRiskBadgeClass(selectedCrop.riskLevel)}`}>
                      {t('altCrop.riskBadgeWithShield', '🛡️ {level} RISK').replace('{level}', t(`riskLevels.${selectedCrop.riskLevel}`, selectedCrop.riskLevel || 'N/A'))}
                    </span>
                  </div>
                </div>

                <div className="analysis-explanation-box">
                  <strong>{t('altCrop.rationaleLabel', 'Assessment Rationale:')}</strong> {selectedCrop.explanation}
                </div>

                {/* Factor Breakdown Chips */}
                <div className="analysis-factors-wrap">
                  <h4 className="sub-section-h4">{t('altCrop.factorsStatusLabel', 'Factors Assessment Status:')}</h4>
                  <div className="analysis-factors-grid">
                    {selectedCrop.factors?.map((f, idx) => {
                      const stInfo = getFactorStatusSymbol(f.status)
                      return (
                        <div key={idx} className="analysis-factor-chip">
                          <span className="af-name">{getFactorDisplayName(f.factorName)}</span>
                          <span className={`af-badge ${stInfo.cssClass}`}>
                            {stInfo.symbol} {stInfo.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Attributes & Source */}
                <div className="analysis-footer-row">
                  <div className="attr-inline-group">
                    {selectedCrop.waterRequirement && (
                      <span>💧 <strong>{t('altCrop.attrWaterLabel', 'Water:')}</strong> {selectedCrop.waterRequirement}</span>
                    )}
                    {selectedCrop.growingPeriod && (
                      <span>⏳ <strong>{t('altCrop.attrDurationLabel', 'Duration:')}</strong> {selectedCrop.growingPeriod}</span>
                    )}
                  </div>

                  <div className="source-inline-info">
                    <span>📌 {t('altCrop.sourceLabel', 'Source:')} <strong>{selectedCrop.source?.name || t('altCrop.sourceOrgUnavailable', 'Source organization unavailable')}</strong></span>
                    {selectedCrop.source?.updatedDate && (
                      <span> • {t('altCrop.verifiedLabel', 'Verified:')} {selectedCrop.source.updatedDate}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4 & 5. BETTER-SUITED ALTERNATIVES SECTION */}
            <div className="alternatives-section">
              <div className="section-title-box">
                <span className="section-icon">🌟</span>
                <div>
                  <h2 className="section-title">{t('altCrop.betterSuitedTitle', 'Better-Suited Alternatives')}</h2>
                  <p className="section-sub">
                    {t('altCrop.betterSuitedSub', 'Verified crops evaluated under the same farm conditions that demonstrate higher overall suitability or stronger factor alignment.')}
                  </p>
                </div>
              </div>

              {alternatives.length === 0 ? (
                /* STEP 7K PART 7 — NO ALTERNATIVES HONEST MESSAGE */
                <div className="no-alternatives-card">
                  <div className="no-alt-icon">ℹ️</div>
                  <h4 className="no-alt-title">{t('altCrop.noAltTitle', 'No stronger verified alternative identified')}</h4>
                  <p className="no-alt-text">
                    {t('altCrop.noAltText', 'No stronger verified alternative was identified from the available crop knowledge for this assessment.')}
                  </p>
                  <p className="no-alt-sub">
                    {t('altCrop.noAltSub', 'This indicates that your selected crop ({cropName}) already ranks among the top agronomic options for the supplied soil, water, rainfall, and climate conditions in our verified database. This is a decision-support indicator and does not guarantee yield or financial outcome.').replace('{cropName}', getCropDisplayName(selectedCrop?.crop?.name))}
                  </p>
                </div>
              ) : (
                <div className="alternatives-list">
                  {alternatives.map((altItem, index) => {
                    const whyList = getWhyAlternativeExplanations(selectedCrop, altItem)
                    const isCompared = comparedAltCrop?.crop?.id === altItem.crop?.id

                    return (
                      <div
                        key={altItem.crop?.id || index}
                        className={`alt-card ${isCompared ? 'alt-compared' : ''}`}
                      >
                        <div className="alt-card-header">
                          <div className="alt-rank-badge">{t('altCrop.rankAltBadge', 'RANK #{rank} ALTERNATIVE').replace('{rank}', index + 1)}</div>
                          {isCompared && <span className="compared-tag">{t('altCrop.selectedInCompTable', 'Currently Selected in Comparison Table')}</span>}
                        </div>

                        <div className="alt-card-main">
                          {/* Left Column: Crop Details */}
                          <div className="alt-crop-details">
                            <div className="alt-title-row">
                              <span className="alt-emoji">{getCropEmoji(altItem.crop?.name)}</span>
                              <div>
                                <h3 className="alt-crop-name">{getCropDisplayName(altItem.crop?.name)}</h3>
                                <span className="alt-sci-name">{altItem.crop?.scientificName}</span>
                              </div>
                            </div>

                            <p className="alt-desc">{altItem.crop?.description}</p>

                            <div className="alt-badges-row">
                              <span className={`suitability-badge ${getSuitabilityBadgeClass(altItem.suitability)}`}>
                                {t('altCrop.suitabilityBadgeSuffix', '{suitability} SUITABILITY').replace('{suitability}', t(`suitability.${altItem.suitability}`, altItem.suitability))}
                              </span>
                              {altItem.riskLevel && (
                                <span className={`risk-badge ${getRiskBadgeClass(altItem.riskLevel)}`}>
                                  {t('altCrop.riskBadgeWithShield', '🛡️ {level} RISK').replace('{level}', t(`riskLevels.${altItem.riskLevel}`, altItem.riskLevel))}
                                </span>
                              )}
                            </div>

                            {/* STEP 7K PART 5 — WHY THIS ALTERNATIVE? EXPLANATIONS */}
                            <div className="why-alt-box">
                              <h4 className="why-alt-title">{t('altCrop.whyAlternativeHeader', '💡 WHY THIS ALTERNATIVE?')}</h4>
                              <div className="why-alt-bullets">
                                {whyList.map((exp, eIdx) => (
                                  <div key={eIdx} className="why-alt-bullet">
                                    <span className="why-bullet-icon">{exp.icon}</span>
                                    <span>{exp.text}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Score & Compare Action */}
                          <div className="alt-score-panel">
                            <div className="alt-score-circle">
                              <span className="alt-score-num">{altItem.overallScore}</span>
                              <span className="alt-score-sub">{t('altCrop.outOf100', 'out of 100')}</span>
                            </div>

                            {selectedCrop && (
                              <div className="score-diff-badge">
                                {t('altCrop.ptsHigherBadge', '+{pts} pts higher').replace('{pts}', (altItem.overallScore - selectedCrop.overallScore).toFixed(1))}
                              </div>
                            )}

                            <button
                              type="button"
                              className={`btn-compare-select ${isCompared ? 'active' : ''}`}
                              onClick={() => setComparedAltId(altItem.crop?.id)}
                            >
                              {isCompared ? t('altCrop.btnComparingBelow', '✓ Comparing Below') : t('altCrop.btnCompareVsSelected', '📊 Compare vs Selected')}
                            </button>
                          </div>
                        </div>

                        {/* Extra Attributes & Source */}
                        <div className="alt-card-footer">
                          <div className="alt-attr-group">
                            {altItem.waterRequirement && <span>💧 {altItem.waterRequirement}</span>}
                            {altItem.growingPeriod && <span>⏳ {altItem.growingPeriod}</span>}
                            {altItem.sustainabilityNotes && <span>🌿 {altItem.sustainabilityNotes}</span>}
                          </div>

                          <div className="alt-source-group">
                            <span>📌 {t('altCrop.sourceLabel', 'Source:')} <strong>{altItem.source?.name || t('altCrop.sourceOrgUnavailable', 'Source organization unavailable')}</strong></span>
                            {altItem.source?.updatedDate && <span> • {altItem.source.updatedDate}</span>}
                            {altItem.source?.url && (
                              <a
                                href={altItem.source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="alt-source-link"
                              >
                                {t('altCrop.viewSourceLink', '🌐 View Source ↗')}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 6. COMPARISON VIEW (Current Crop vs Alternative) */}
            {selectedCrop && comparedAltCrop && selectedCrop.crop?.id !== comparedAltCrop.crop?.id && (
              <div className="comparison-section">
                <div className="section-title-box">
                  <span className="section-icon">⚖️</span>
                  <div>
                    <h2 className="section-title">{t('altCrop.compSectionTitle', 'Current Crop vs Alternative Comparison')}</h2>
                    <p className="section-sub">
                      {t('altCrop.compSectionSub', 'Side-by-side factor evaluation comparing your considered crop ({selCrop}) with alternative option ({altCrop}).')
                        .replace('{selCrop}', getCropDisplayName(selectedCrop.crop?.name))
                        .replace('{altCrop}', getCropDisplayName(comparedAltCrop.crop?.name))}
                    </p>
                  </div>
                </div>

                <div className="comparison-table-container">
                  <table className="comparison-table">
                    <thead>
                      <tr>
                        <th>{t('altCrop.thMetric', 'Agronomic Metric / Factor')}</th>
                        <th>
                          <div className="th-crop-header">
                            <span className="th-emoji">{getCropEmoji(selectedCrop.crop?.name)}</span>
                            <div>
                              <div className="th-tag">{t('altCrop.thTagConsidered', 'CONSIDERED CROP')}</div>
                              <div className="th-title">{getCropDisplayName(selectedCrop.crop?.name)}</div>
                            </div>
                          </div>
                        </th>
                        <th>
                          <div className="th-crop-header th-alt-header">
                            <span className="th-emoji">{getCropEmoji(comparedAltCrop.crop?.name)}</span>
                            <div>
                              <div className="th-tag th-alt-tag">{t('altCrop.thTagBetterAlt', 'BETTER ALTERNATIVE')}</div>
                              <div className="th-title">{getCropDisplayName(comparedAltCrop.crop?.name)}</div>
                            </div>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Overall Score Row */}
                      <tr className="comp-highlight-row">
                        <td><strong>{t('altCrop.compOverallScore', 'Overall Suitability Score')}</strong></td>
                        <td>
                          <span className="comp-score">{selectedCrop.overallScore} / 100</span>
                        </td>
                        <td>
                          <span className="comp-score comp-score-alt">
                            {comparedAltCrop.overallScore} / 100
                            <span className="comp-diff-pill">
                              (+{(comparedAltCrop.overallScore - selectedCrop.overallScore).toFixed(1)})
                            </span>
                          </span>
                        </td>
                      </tr>

                      {/* Suitability Category */}
                      <tr>
                        <td><strong>{t('altCrop.compSuitabilityRating', 'Suitability Rating')}</strong></td>
                        <td>
                          <span className={`suitability-badge ${getSuitabilityBadgeClass(selectedCrop.suitability)}`}>
                            {t(`suitability.${selectedCrop.suitability}`, selectedCrop.suitability)}
                          </span>
                        </td>
                        <td>
                          <span className={`suitability-badge ${getSuitabilityBadgeClass(comparedAltCrop.suitability)}`}>
                            {t(`suitability.${comparedAltCrop.suitability}`, comparedAltCrop.suitability)}
                          </span>
                        </td>
                      </tr>

                      {/* Risk Level */}
                      <tr>
                        <td><strong>{t('altCrop.compCropRiskLevel', 'Crop Risk Level')}</strong></td>
                        <td>
                          <span className={`risk-badge ${getRiskBadgeClass(selectedCrop.riskLevel)}`}>
                            {t('altCrop.riskBadge', '{level} RISK').replace('{level}', t(`riskLevels.${selectedCrop.riskLevel}`, selectedCrop.riskLevel || 'N/A'))}
                          </span>
                        </td>
                        <td>
                          <span className={`risk-badge ${getRiskBadgeClass(comparedAltCrop.riskLevel)}`}>
                            {t('altCrop.riskBadge', '{level} RISK').replace('{level}', t(`riskLevels.${comparedAltCrop.riskLevel}`, comparedAltCrop.riskLevel || 'N/A'))}
                          </span>
                        </td>
                      </tr>

                      {/* Factor rows */}
                      {(selectedCrop.factors || []).map((selF, fIdx) => {
                        const altF = (comparedAltCrop.factors || []).find(
                          (f) => f.factorName?.toLowerCase() === selF.factorName?.toLowerCase()
                        ) || { status: 'NOT_EVALUATED', explanation: t('altCrop.notEvaluatedAltExp', 'Not evaluated for alternative crop') }

                        const selStatusInfo = getFactorStatusSymbol(selF.status)
                        const altStatusInfo = getFactorStatusSymbol(altF.status)

                        return (
                          <tr key={fIdx}>
                            <td>
                              <strong>{getFactorDisplayName(selF.factorName)}</strong>
                            </td>
                            <td>
                              <span className={`comp-status-chip ${selStatusInfo.cssClass}`}>
                                {selStatusInfo.symbol} {selStatusInfo.label}
                              </span>
                              <div className="comp-exp-text">{selF.explanation}</div>
                            </td>
                            <td>
                              <span className={`comp-status-chip ${altStatusInfo.cssClass}`}>
                                {altStatusInfo.symbol} {altStatusInfo.label}
                              </span>
                              <div className="comp-exp-text">{altF.explanation}</div>
                            </td>
                          </tr>
                        )
                      })}

                      {/* Water Requirement */}
                      <tr>
                        <td><strong>{t('altCrop.compWaterReq', 'Water Requirement')}</strong></td>
                        <td>{selectedCrop.waterRequirement || 'N/A'}</td>
                        <td>{comparedAltCrop.waterRequirement || 'N/A'}</td>
                      </tr>

                      {/* Growing Duration */}
                      <tr>
                        <td><strong>{t('altCrop.compGrowingDuration', 'Growing Duration')}</strong></td>
                        <td>{selectedCrop.growingPeriod || 'N/A'}</td>
                        <td>{comparedAltCrop.growingPeriod || 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 8. DATA LIMITATION NOTICE */}
            <div className="data-limitation-card">
              <div className="limitation-icon">⚠️</div>
              <div>
                <h4 className="limitation-title">{t('altCrop.limitationsTitle', 'Important Decision Limitations')}</h4>
                <p className="limitation-text">
                  {t('altCrop.limitationsText', 'Alternative suggestions are based only on the verified crop knowledge and farm conditions available in this assessment. Local micro-climate, pests, disease pressure, input availability, farmer experience, and other field conditions may affect the actual outcome. Always consult local agricultural extension officers or district agronomic experts before making major crop shifts.')}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AlternativeCropIntelligencePage
