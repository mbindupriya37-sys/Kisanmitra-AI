import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { useLanguage } from '../context/LanguageContext'
import LanguageSelector from '../components/LanguageSelector'
import cropHeroImg from '../assets/card-crop-recommendation.png'
import './CropRecommendationResults.css'

function CropRecommendationResultsPage() {
  const { requestId } = useParams()
  const { t } = useLanguage()

  const [loading, setLoading] = useState(true)
  const [errorStatus, setErrorStatus] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [resultData, setResultData] = useState(null)
  const [expandedCropId, setExpandedCropId] = useState(null)
  const [showScoreExplanation, setShowScoreExplanation] = useState(false)

  const fetchResults = () => {
    setLoading(true)
    setErrorStatus(null)
    setErrorMessage('')

    api.get(`/farmer/crop-recommendations/${requestId}/results`)
      .then((res) => {
        setResultData(res.data)
        if (res.data && res.data.recommendations && res.data.recommendations.length > 0) {
          // Auto expand the top recommendation by default
          setExpandedCropId(res.data.recommendations[0].crop?.id || null)
        }
      })
      .catch((err) => {
        const status = err.response?.status || 500
        const msg = err.response?.data?.message || 'Unable to load recommendation results. Please try again.'
        setErrorStatus(status)
        setErrorMessage(msg)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchResults()
  }, [requestId])

  const toggleExpand = (cropId) => {
    setExpandedCropId((prev) => (prev === cropId ? null : cropId))
  }

  const getCropDisplayName = (name) => {
    if (!name) return ''
    return t(`crops.${name}`, name)
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
        return { symbol: '✓', label: 'MATCH', cssClass: 'factor-status-match' }
      case 'PARTIAL':
        return { symbol: '◐', label: 'PARTIAL', cssClass: 'factor-status-partial' }
      case 'MISMATCH':
        return { symbol: '!', label: 'MISMATCH', cssClass: 'factor-status-mismatch' }
      case 'NOT_EVALUATED':
      default:
        return { symbol: '—', label: 'NOT EVALUATED', cssClass: 'factor-status-not-evaluated' }
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

  const calculateDataCoverage = (recommendations) => {
    if (!recommendations || recommendations.length === 0) {
      return {
        evaluatedCount: 0,
        totalCount: 0,
        unEvaluatedCount: 0,
        level: 'LIMITED',
        labelKey: 'cropResults.coverageLimited',
        defaultLabel: 'LIMITED DATA COVERAGE',
        cssClass: 'coverage-limited',
        ratio: 0
      }
    }

    const sampleFactors = recommendations[0].factors || []
    const totalCount = sampleFactors.length
    const evaluatedCount = sampleFactors.filter((f) => f.status !== 'NOT_EVALUATED').length
    const unEvaluatedCount = sampleFactors.filter((f) => f.status === 'NOT_EVALUATED').length
    const ratio = totalCount > 0 ? evaluatedCount / totalCount : 0

    let level = 'LIMITED'
    let labelKey = 'cropResults.coverageLimited'
    let defaultLabel = 'LIMITED DATA COVERAGE'
    let cssClass = 'coverage-limited'

    if (ratio >= 0.85) {
      level = 'HIGH'
      labelKey = 'cropResults.coverageHigh'
      defaultLabel = 'HIGH DATA COVERAGE'
      cssClass = 'coverage-high'
    } else if (ratio >= 0.50) {
      level = 'PARTIAL'
      labelKey = 'cropResults.coveragePartial'
      defaultLabel = 'PARTIAL DATA COVERAGE'
      cssClass = 'coverage-partial'
    }

    return { evaluatedCount, totalCount, unEvaluatedCount, ratio, level, labelKey, defaultLabel, cssClass }
  }

  const getWhyThisCropSummary = (factors) => {
    if (!factors || factors.length === 0) {
      return { matches: [], partials: [], mismatches: [], unevaluated: [] }
    }
    return {
      matches: factors.filter((f) => f.status === 'MATCH'),
      partials: factors.filter((f) => f.status === 'PARTIAL'),
      mismatches: factors.filter((f) => f.status === 'MISMATCH'),
      unevaluated: factors.filter((f) => f.status === 'NOT_EVALUATED'),
    }
  }

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="results-page-layout">
        <div className="results-container">
          <div className="nav-header-row">
            <Link to="/farmer/crop-recommendation" className="back-link">
              {t('cropResults.backToAssessment', '← Back to Assessment')}
            </Link>
            <LanguageSelector id="crop-results-loading-lang-select" />
          </div>
          <div className="loading-state-card">
            <div className="loading-spinner">🌱</div>
            <h3 className="loading-title">
              {t('cropResults.loadingTitle', 'Analyzing Farm Assessment #{requestId}...').replace('{requestId}', requestId)}
            </h3>
            <p className="loading-sub">
              {t('cropResults.loadingSubtitle', 'Evaluating your soil, pH, water availability, season, and rainfall conditions against ICAR verified crop requirements.')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // --- ERROR STATES ---
  if (errorStatus) {
    return (
      <div className="results-page-layout">
        <div className="results-container">
          <div className="nav-header-row">
            <Link to="/farmer/crop-recommendation" className="back-link">
              {t('cropResults.backToAssessment', '← Back to Assessment')}
            </Link>
            <LanguageSelector id="crop-results-error-lang-select" />
          </div>

          <div className="error-state-card">
            <div className="error-icon">
              {errorStatus === 403 ? '🔒' : errorStatus === 404 ? '🔍' : '⚠️'}
            </div>

            <h3 className="error-title">
              {errorStatus === 403
                ? t('cropResults.accessDenied', 'Access Denied (403)')
                : errorStatus === 404
                ? t('cropResults.notFound', 'Assessment Request Not Found (404)')
                : t('cropResults.genericError', 'Unable to Load Recommendation Results')}
            </h3>

            <p className="error-sub">{errorMessage}</p>

            <div className="error-actions">
              {errorStatus !== 403 && (
                <button onClick={fetchResults} className="btn-retry">
                  {t('cropResults.retryAnalysis', '🔄 Retry Analysis')}
                </button>
              )}
              <Link to="/farmer/crop-recommendation" className="btn-secondary">
                {t('cropResults.backToAssessments', '📋 Back to Assessments')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const recommendations = resultData?.recommendations || []
  const topCrop = recommendations.length > 0 ? recommendations[0] : null
  const coverage = calculateDataCoverage(recommendations)
  const hasNotEvaluatedFactors = coverage.unEvaluatedCount > 0

  return (
    <div className="results-page-layout">
      <div className="results-container">
        {/* Navigation Bar */}
        <div className="nav-header-row">
          <Link to="/farmer/crop-recommendation" className="back-link">
            {t('cropResults.backToHistory', '← Back to Assessment History')}
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <LanguageSelector id="crop-results-language-select" />
            <span className="nav-breadcrumb">
              {t('cropResults.breadcrumb', 'Dashboard / Crop Recommendation / Assessment #{requestId}').replace('{requestId}', requestId)}
            </span>
          </div>
        </div>

        {/* HERO SECTION */}
        <div className="hero-results-card">
          <div className="hero-text-content">
            <div className="hero-badge-row">
              <span className="badge-chip">
                {t('cropResults.assessmentBadge', '🌾 Assessment #{requestId}').replace('{requestId}', resultData?.requestId || requestId)}
              </span>
              <span className="badge-chip chip-success">
                {t('cropResults.statusBadge', 'Status: {status}').replace('{status}', resultData?.status || 'COMPLETED')}
              </span>
              <span className="badge-chip chip-info">
                {t('cropResults.evaluatedCropsBadge', '{count} Evaluated Crops').replace('{count}', recommendations.length)}
              </span>
              <span className={`badge-chip ${coverage.cssClass}`}>
                🛡️ {t(coverage.labelKey, coverage.defaultLabel)}
              </span>
            </div>

            <h1 className="hero-main-title">{t('cropResults.heroTitle', 'Your Crop Recommendation Results')}</h1>

            <p className="hero-description">
              {t('cropResults.heroDescription', "Explore agricultural crops ranked against your farm's soil, water availability, rainfall, season, and temperature conditions using verified ICAR agronomic rules.")}
            </p>

            <div className="hero-trust-bar">
              <span>{t('cropResults.deterministicTrust', '🛡️ Deterministic Agronomic Decision Support')}</span>
              <span>•</span>
              <span>{t('cropResults.traceableTrust', '📌 Traceable ICAR Attribution')}</span>
            </div>

            {/* Preserved Farm Location & Input Context */}
            {(resultData?.state || resultData?.district || resultData?.pincode) && (
              <div className="hero-location-banner">
                <span className="hero-location-icon">📍</span>
                <span className="hero-location-text">
                  <strong>{t('cropResults.farmLocationLabel', 'Farm Location:')}</strong>{' '}
                  {resultData?.village ? `${resultData.village}, ` : ''}
                  {resultData?.district ? `${resultData.district}, ` : ''}
                  {resultData?.state}
                  {resultData?.pincode ? ` (PIN: ${resultData.pincode})` : ''}
                </span>
                {resultData?.soilType && (
                  <span className="hero-farm-subtext">
                    • {t('cropResults.farmSoil', 'Soil:')} <strong>{resultData.soilType}</strong> • {t('cropResults.farmSeason', 'Season:')} <strong>{resultData.season}</strong> • {t('cropResults.farmSize', 'Farm Size:')} <strong>{resultData.farmSize} Acres</strong>
                  </span>
                )}
              </div>
            )}

            {/* Signature Feature Launchers (Decision Lab & Alternative Crops) */}
            <div className="hero-feature-actions" style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
              <Link
                to={`/farmer/decision-lab/${resultData?.requestId || requestId}`}
                className="btn-launch-decision-lab"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: '#ffffff',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                  transition: 'all 0.2s ease'
                }}
              >
                🧪 {t('cropResults.btnLaunchDecisionLab', 'Simulate in Decision Lab (What-If)')} →
              </Link>
              <Link
                to={`/farmer/crop-recommendation/alternatives/${resultData?.requestId || requestId}`}
                className="btn-launch-alternatives"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease'
                }}
              >
                🔄 {t('cropResults.btnViewAlternatives', 'Explore Better Alternatives')} →
              </Link>
            </div>
          </div>

          <div className="hero-image-panel">
            <img src={cropHeroImg} alt="Healthy Crop Field" className="hero-crop-img" />
            <div className="hero-img-overlay"></div>
          </div>
        </div>

        {/* DATA AVAILABILITY & TRUST COVERAGE PANEL */}
        <div className="data-trust-panel">
          <div className="trust-coverage-header">
            <div className="trust-coverage-left">
              <span className={`coverage-badge ${coverage.cssClass}`}>
                🛡️ {t(coverage.labelKey, coverage.defaultLabel)}
              </span>
              <span className="coverage-sub-text">
                {t('cropResults.coverageNote', 'This indicates how much verified suitability information was available for this assessment. It is not a guarantee of crop success.')}
              </span>
            </div>
            <button
              type="button"
              className="btn-score-info-toggle"
              onClick={() => setShowScoreExplanation(!showScoreExplanation)}
              aria-expanded={showScoreExplanation}
            >
              {showScoreExplanation
                ? t('cropResults.toggleScoreFormulaHide', '💡 Hide Score Formula')
                : t('cropResults.toggleScoreFormulaShow', '💡 How the score works')}
            </button>
          </div>

          {/* Data Availability Stats */}
          <div className="data-availability-grid">
            <div className="avail-stat-box">
              <span className="avail-stat-num">{coverage.evaluatedCount} / {coverage.totalCount}</span>
              <span className="avail-stat-label">{t('cropResults.statVerifiedEvaluated', 'Verified Factors Evaluated')}</span>
            </div>
            <div className="avail-stat-box">
              <span className="avail-stat-num">{coverage.unEvaluatedCount}</span>
              <span className="avail-stat-label">{t('cropResults.statRequiringData', 'Factors Requiring More Data')}</span>
            </div>
            <div className="avail-stat-msg">
              {coverage.unEvaluatedCount === 0 ? (
                <span>{t('cropResults.allFactorsEvaluatedMsg', '✅ All available suitability factors were evaluated against verified crop requirement rules.')}</span>
              ) : (
                <span>{t('cropResults.someFactorsMissingMsg', '⚠️ Some suitability factors could not be evaluated because verified crop requirement data was unavailable.')}</span>
              )}
            </div>
          </div>

          {/* SCORE EXPLANATION COLLAPSIBLE */}
          {showScoreExplanation && (
            <div className="score-explanation-drawer">
              <h5 className="score-exp-title">{t('cropResults.scoreExpTitle', '📊 How the Suitability Score is Calculated')}</h5>
              <ul className="score-exp-list">
                <li>{t('cropResults.scoreExp1', 'Weighted Factor Scoring: Each agronomic factor (soil type, pH, water availability, rainfall, season, temperature, irrigation, risk) is assigned an agronomic weight based on verified ICAR crop requirements.')}</li>
                <li>{t('cropResults.scoreExp2', 'Missing Data Normalization: Unevaluated factors (where verified crop requirement data is unavailable) contribute zero raw score and their max weights are excluded from the normalization denominator. This ensures missing data does not artificially inflate or unfairly penalize a crop\'s score.')}</li>
                <li>{t('cropResults.scoreExp3', 'Farmer Priority Adjustments: If you selected specific farming priorities (e.g. lower water, shorter period), minor score adjustments refine the relative ranking without overriding baseline suitability.')}</li>
                <li>{t('cropResults.scoreExp4', '0–100 Normalized Scale: Final scores are scaled from 0 to 100 as an agronomic suitability indicator.')}</li>
                <li>{t('cropResults.scoreExp5', 'Decision-Support Indicator: The overall score reflects comparative compatibility with your supplied farm conditions. It is a decision-support metric, not a yield or financial guarantee.')}</li>
              </ul>
            </div>
          )}
        </div>

        {/* MISSING DATA NOTICE BANNER */}
        {hasNotEvaluatedFactors && (
          <div className="notice-banner-info">
            <span className="notice-icon">ℹ️</span>
            <div>
              <h4 className="notice-title">{t('cropResults.missingDataTitle', 'Missing Data Evaluation Notice')}</h4>
              <p className="notice-text">
                {t('cropResults.missingDataText', 'Some suitability factors could not be evaluated because verified crop requirement data was unavailable. Un-evaluated factors contribute zero raw score and are excluded from score normalization to preserve evaluation integrity.')}
              </p>
            </div>
          </div>
        )}

        {/* NO CROPS FOUND STATE */}
        {recommendations.length === 0 ? (
          <div className="empty-results-card">
            <div className="empty-icon">🌱</div>
            <h3>{t('cropResults.noCropsTitle', 'No crop recommendations available')}</h3>
            <p>
              {t('cropResults.noCropsText', 'Verified crop requirement data is currently unavailable for your selected criteria in our agronomic knowledge base. KisanMitra AI does not fabricate crop suitability scores. Please consult your local Krishi Vigyan Kendra (KVK) or district agricultural extension officer for localized guidance.')}
            </p>
          </div>
        ) : (
          <>
            {/* SECTION: TOP RECOMMENDATION SPOTLIGHT */}
            {topCrop && (
              <div className="spotlight-card">
                <div className="spotlight-header">
                  <div className="spotlight-tag">{t('cropResults.topRankedBadge', '🏆 TOP RANKED RECOMMENDATION')}</div>
                  <div className="spotlight-sub-tag">{t('cropResults.basedOnIcar', 'Based on available verified ICAR crop knowledge')}</div>
                </div>

                <div className="spotlight-body">
                  {/* Left Column: Crop Info & Suitability */}
                  <div className="spotlight-main-info">
                    <div className="spotlight-title-row">
                      <span className="spotlight-emoji">{getCropEmoji(topCrop.crop?.name)}</span>
                      <div>
                        <h2 className="spotlight-crop-name">{getCropDisplayName(topCrop.crop?.name)}</h2>
                        <span className="spotlight-scientific-name">{topCrop.crop?.scientificName}</span>
                      </div>
                    </div>

                    <p className="spotlight-desc">{topCrop.crop?.description}</p>

                    <div className="spotlight-badges">
                      <span className={`suitability-badge ${getSuitabilityBadgeClass(topCrop.suitability)}`}>
                        {t('cropResults.suitabilityLabel', '{level} SUITABILITY').replace('{level}', topCrop.suitability)}
                      </span>
                      {topCrop.riskLevel && (
                        <span className={`risk-badge ${getRiskBadgeClass(topCrop.riskLevel)}`}>
                          🛡️ {t('cropResults.riskLabel', '{level} RISK').replace('{level}', topCrop.riskLevel)}
                        </span>
                      )}
                    </div>

                    {/* WHY THIS CROP? SPOTLIGHT */}
                    {(() => {
                      const whySummary = getWhyThisCropSummary(topCrop.factors)
                      return (
                        <div className="why-this-crop-card">
                          <h4 className="why-crop-title">{t('cropResults.whyThisCrop', '💡 WHY THIS CROP?')}</h4>
                          <p className="why-crop-summary">{topCrop.explanation}</p>
                          <div className="why-crop-highlights">
                            {whySummary.matches.map((f, idx) => (
                              <div key={idx} className="why-chip why-match">
                                <span className="why-chip-icon">✓</span>
                                <span><strong>{f.factorName}:</strong> {f.explanation}</span>
                              </div>
                            ))}
                            {whySummary.partials.map((f, idx) => (
                              <div key={idx} className="why-chip why-partial">
                                <span className="why-chip-icon">◐</span>
                                <span><strong>{f.factorName}:</strong> {f.explanation}</span>
                              </div>
                            ))}
                            {whySummary.mismatches.map((f, idx) => (
                              <div key={idx} className="why-chip why-mismatch">
                                <span className="why-chip-icon">!</span>
                                <span><strong>{f.factorName}:</strong> {f.explanation}</span>
                              </div>
                            ))}
                            {whySummary.unevaluated.map((f, idx) => (
                              <div key={idx} className="why-chip why-unevaluated">
                                <span className="why-chip-icon">—</span>
                                <span><strong>{f.factorName}:</strong> {f.explanation}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  {/* Right Column: Score Progress Counter */}
                  <div className="spotlight-score-panel">
                    <div className="score-ring-container">
                      <svg className="score-ring-svg" viewBox="0 0 120 120">
                        <circle className="ring-bg" cx="60" cy="60" r="50" />
                        <circle
                          className="ring-progress"
                          cx="60"
                          cy="60"
                          r="50"
                          style={{
                            strokeDasharray: 314,
                            strokeDashoffset: 314 - (314 * (topCrop.overallScore || 0)) / 100,
                          }}
                        />
                      </svg>
                      <div className="score-ring-text">
                        <span className="score-number">{topCrop.overallScore}</span>
                        <span className="score-max">/ 100</span>
                      </div>
                    </div>

                    <div className="score-label">{t('cropResults.overallScoreLabel', 'Overall Suitability Score')}</div>
                  </div>
                </div>

                {/* FACTOR TRANSPARENCY inside Spotlight */}
                <div className="spotlight-factors-section">
                  <h4 className="factors-heading">{t('cropResults.factorsBreakdown', 'Agronomic Factors Breakdown')}</h4>
                  <div className="factors-grid">
                    {topCrop.factors?.map((f, idx) => {
                      const statusInfo = getFactorStatusSymbol(f.status)
                      return (
                        <div key={idx} className="factor-chip-card">
                          <div className="factor-chip-header">
                            <span className="factor-name">{f.factorName}</span>
                            <span className={`factor-symbol ${statusInfo.cssClass}`}>
                              {statusInfo.symbol} {statusInfo.label} ({f.score?.toFixed(1) || 0} / {f.maxWeight?.toFixed(1) || 0})
                            </span>
                          </div>
                          <div className="factor-score-bar-bg">
                            <div
                              className={`factor-score-bar-fill ${statusInfo.cssClass}`}
                              style={{ width: `${(f.score / f.maxWeight) * 100}%` }}
                            ></div>
                          </div>
                          <p className="factor-exp-text">{f.explanation}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* SOURCE TRANSPARENCY for Top Crop */}
                <div className="spotlight-source-footer">
                  <div className="source-info-left">
                    <span>
                      {t('cropResults.knowledgeSource', 'Knowledge Source:')} <strong>{topCrop.source?.name || t('cropResults.sourceUnavailable', 'Source organization unavailable')}</strong>
                    </span>
                    <span> • {t('cropResults.lastUpdated', 'Last Updated:')} {topCrop.source?.updatedDate || t('cropResults.dateUnavailable', 'Date unavailable')}</span>
                  </div>
                  {topCrop.source?.url ? (
                    <a
                      href={topCrop.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-link-btn"
                    >
                      {t('cropResults.viewOfficialDoc', '🌐 View Official Source Document ↗')}
                    </a>
                  ) : (
                    <span className="source-unavailable-tag">{t('cropResults.sourceLinkUnavailable', 'Source link unavailable')}</span>
                  )}
                </div>
              </div>
            )}

            {/* SECTION: ALL RANKED RECOMMENDATIONS LIST */}
            <div className="all-recommendations-section">
              <div className="section-header-row">
                <div>
                  <h3 className="section-h3-title">{t('cropResults.allRankedTitle', 'All Ranked Recommendations')}</h3>
                  <p className="section-sub-title">{t('cropResults.allRankedSubtitle', 'Full list of evaluated crops sorted by agronomic suitability score')}</p>
                </div>
              </div>

              <div className="recommendations-list">
                {recommendations.map((item, index) => {
                  const isExpanded = expandedCropId === item.crop?.id
                  const isTop = index === 0

                  return (
                    <div
                      key={item.crop?.id || index}
                      className={`rec-item-card ${isTop ? 'rec-top-card' : ''}`}
                    >
                      {/* Card Header Row */}
                      <div className="rec-card-main-row" onClick={() => toggleExpand(item.crop?.id)}>
                        <div className="rec-rank-box">
                          <span className="rank-num">#{String(index + 1).padStart(2, '0')}</span>
                        </div>

                        <div className="rec-crop-info">
                          <div className="rec-crop-title-wrap">
                            <span className="crop-icon">{getCropEmoji(item.crop?.name)}</span>
                            <h4 className="rec-crop-name">{getCropDisplayName(item.crop?.name)}</h4>
                            <span className="rec-sci-name">({item.crop?.scientificName})</span>
                          </div>
                          <p className="rec-short-desc">{item.crop?.description}</p>
                        </div>

                        <div className="rec-badges-wrap">
                          <span className={`suitability-badge ${getSuitabilityBadgeClass(item.suitability)}`}>
                            {item.suitability}
                          </span>
                          {item.riskLevel && (
                            <span className={`risk-badge ${getRiskBadgeClass(item.riskLevel)}`}>
                              {item.riskLevel} RISK
                            </span>
                          )}
                        </div>

                        <div className="rec-score-box">
                          <div className="rec-score-value">{item.overallScore}</div>
                          <div className="rec-score-sub">{t('cropResults.outOfHundred', 'out of 100')}</div>
                        </div>

                        <button className="btn-expand-toggle" aria-label={t('common.toggleDetails', 'Toggle details')}>
                          {isExpanded ? '▲' : '▼'}
                        </button>
                      </div>

                      {/* Expandable Details Drawer */}
                      {isExpanded && (
                        <div className="rec-details-drawer">
                          {/* WHY THIS CROP? DRAWER */}
                          {(() => {
                            const itemWhy = getWhyThisCropSummary(item.factors)
                            return (
                              <div className="why-this-crop-card">
                                <h5 className="why-crop-title">{t('cropResults.whyThisCrop', '💡 WHY THIS CROP?')}</h5>
                                <p className="why-crop-summary">{item.explanation}</p>
                                <div className="why-crop-highlights">
                                  {itemWhy.matches.map((f, idx) => (
                                    <div key={idx} className="why-chip why-match">
                                      <span className="why-chip-icon">✓</span>
                                      <span><strong>{f.factorName}:</strong> {f.explanation}</span>
                                    </div>
                                  ))}
                                  {itemWhy.partials.map((f, idx) => (
                                    <div key={idx} className="why-chip why-partial">
                                      <span className="why-chip-icon">◐</span>
                                      <span><strong>{f.factorName}:</strong> {f.explanation}</span>
                                    </div>
                                  ))}
                                  {itemWhy.mismatches.map((f, idx) => (
                                    <div key={idx} className="why-chip why-mismatch">
                                      <span className="why-chip-icon">!</span>
                                      <span><strong>{f.factorName}:</strong> {f.explanation}</span>
                                    </div>
                                  ))}
                                  {itemWhy.unevaluated.map((f, idx) => (
                                    <div key={idx} className="why-chip why-unevaluated">
                                      <span className="why-chip-icon">—</span>
                                      <span><strong>{f.factorName}:</strong> {f.explanation}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })()}

                          {/* Extra Agronomic Attributes */}
                          <div className="drawer-attributes-grid">
                            {item.waterRequirement && (
                              <div className="attr-box">
                                <span className="attr-icon">💧</span>
                                <div>
                                  <span className="attr-label">{t('cropResults.waterReq', 'Water Requirement')}</span>
                                  <p className="attr-val">{item.waterRequirement}</p>
                                </div>
                              </div>
                            )}

                            {item.growingPeriod && (
                              <div className="attr-box">
                                <span className="attr-icon">⏳</span>
                                <div>
                                  <span className="attr-label">{t('cropResults.growingDuration', 'Growing Duration')}</span>
                                  <p className="attr-val">{item.growingPeriod}</p>
                                </div>
                              </div>
                            )}

                            {item.sustainabilityNotes && (
                              <div className="attr-box">
                                <span className="attr-icon">🌿</span>
                                <div>
                                  <span className="attr-label">{t('cropResults.sustainabilityPractice', 'Sustainability Practice')}</span>
                                  <p className="attr-val">{item.sustainabilityNotes}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* FACTOR TRANSPARENCY GRID */}
                          <div className="drawer-factors-wrapper">
                            <h5 className="factors-sub-heading">{t('cropResults.factorsTransparency', 'Agronomic Factors Transparency:')}</h5>
                            <div className="factors-grid-compact">
                              {item.factors?.map((f, fIdx) => {
                                const stInfo = getFactorStatusSymbol(f.status)
                                return (
                                  <div key={fIdx} className="compact-factor-card">
                                    <div className="compact-factor-top">
                                      <span className="c-factor-name">{f.factorName}</span>
                                      <span className={`c-factor-badge ${stInfo.cssClass}`}>
                                        {stInfo.symbol} {stInfo.label} ({f.score?.toFixed(1) || 0} / {f.maxWeight?.toFixed(1) || 0})
                                      </span>
                                    </div>
                                    <p className="c-factor-exp">{f.explanation}</p>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {/* SOURCE ATTRIBUTION FOOTER */}
                          <div className="drawer-source-footer">
                            <div className="source-info">
                              <span>
                                {t('cropResults.knowledgeSource', 'Knowledge Source:')} <strong>{item.source?.name || t('cropResults.sourceUnavailable', 'Source organization unavailable')}</strong>
                              </span>
                              <span> • {t('cropResults.lastUpdated', 'Last Updated:')} {item.source?.updatedDate || t('cropResults.dateUnavailable', 'Date unavailable')}</span>
                            </div>
                            {item.source?.url ? (
                              <a
                                href={item.source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="source-url-link"
                              >
                                {t('cropResults.viewSourceDoc', '🌐 View Source Document ↗')}
                              </a>
                            ) : (
                              <span className="source-unavailable-tag">{t('cropResults.sourceLinkUnavailable', 'Source link unavailable')}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* IMPORTANT RECOMMENDATION LIMITATIONS PANEL */}
        <div className="limitations-panel">
          <div className="limitations-header">
            <span className="limitations-icon">⚠️</span>
            <h4 className="limitations-title">{t('cropResults.limitationsTitle', 'Important Decision Limitations')}</h4>
          </div>
          <ul className="limitations-list">
            <li>{t('cropResults.limitationsPoint1', 'Recommendations depend directly on the specific farm conditions supplied in your assessment.')}</li>
            <li>{t('cropResults.limitationsPoint2', 'Suitability scores are computed strictly from available verified ICAR crop requirement profiles.')}</li>
            <li>{t('cropResults.limitationsPoint3', 'Factors with missing verified requirement data are excluded from evaluation rather than guessed.')}</li>
            <li>{t('cropResults.limitationsPoint4', 'These indicators do not guarantee crop yield, profit margins, or market prices.')}</li>
            <li>{t('cropResults.limitationsPoint5', 'Real-world farming outcomes are influenced by local micro-climates, sudden weather fluctuations, pest/disease pressures, and market supply dynamics.')}</li>
            <li>{t('cropResults.limitationsPoint6', 'Always consult local agricultural extension officers or district agronomic experts before making major capital investments.')}</li>
          </ul>
        </div>

        {/* AGRICULTURAL DECISION SUPPORT DISCLAIMER */}
        <div className="disclaimer-panel">
          <div className="disclaimer-icon">🛡️</div>
          <div>
            <h4 className="disclaimer-title">{t('cropResults.disclaimerTitle', 'Agricultural Decision-Support Disclaimer')}</h4>
            <p className="disclaimer-text">
              {resultData?.disclaimer ||
                t('cropResults.defaultDisclaimer', 'These recommendations are decision-support indicators based on your supplied conditions and available verified crop knowledge. They do not guarantee yield, profit, weather conditions, or farming success. Consider local agricultural expert guidance before making high-cost decisions.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CropRecommendationResultsPage
