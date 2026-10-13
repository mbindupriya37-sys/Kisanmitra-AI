import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useLanguage } from '../context/LanguageContext'
import LanguageSelector from '../components/LanguageSelector'
import oversupplyHeroImg from '../assets/card-weather-climate.png'
import './OversupplyRisk.css'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
]

const SEASONS = ['KHARIF', 'RABI', 'ZAID']

function OversupplyRiskPage() {
  const { t } = useLanguage()

  // Form State
  const [formData, setFormData] = useState({
    state: 'Andhra Pradesh',
    district: '',
    cropId: '',
    intendedSeason: 'KHARIF',
    farmSize: '',
  })

  // Regional Filter State
  const [filter, setFilter] = useState({
    state: 'Andhra Pradesh',
    district: 'Guntur',
    season: 'KHARIF',
  })

  // Data States
  const [activeCrops, setActiveCrops] = useState([])
  const [cropsLoading, setCropsLoading] = useState(true)

  const [formErrors, setFormErrors] = useState({})
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState('')
  const [formApiError, setFormApiError] = useState('')

  // Intention History Pagination State
  const [historyPage, setHistoryPage] = useState(0)
  const [historyData, setHistoryData] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState('')

  // Regional Risk Signals State
  const [riskData, setRiskData] = useState(null)
  const [riskLoading, setRiskLoading] = useState(false)
  const [riskError, setRiskError] = useState('')
  const [selectedCropItem, setSelectedCropItem] = useState(null)

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null)
  const [editFormData, setEditFormData] = useState({
    state: '',
    district: '',
    cropId: '',
    intendedSeason: 'KHARIF',
    farmSize: '',
  })
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState('')

  const getCropDisplayName = (cropName) => {
    if (!cropName) return ''
    return t(`crops.${cropName}`, cropName)
  }

  // Fetch active crops list for dropdown selection
  useEffect(() => {
    setCropsLoading(true)
    api.get('/farmer/crops')
      .then((res) => {
        setActiveCrops(res.data || [])
        if (res.data && res.data.length > 0) {
          setFormData((prev) => ({ ...prev, cropId: String(res.data[0].id) }))
        }
      })
      .catch((err) => {
        console.error('Unable to fetch crops:', err)
      })
      .finally(() => {
        setCropsLoading(false)
      })
  }, [])

  // Fetch farmer's own intention records
  const fetchMyIntentions = (pageNum = 0) => {
    setHistoryLoading(true)
    setHistoryError('')
    api.get(`/farmer/crop-intentions?page=${pageNum}&size=5`)
      .then((res) => {
        setHistoryData(res.data)
        setHistoryPage(pageNum)
      })
      .catch((err) => {
        const msg = err.response?.data?.message || t('oversupply.errLoadIntentions', 'Unable to load your recorded intentions.')
        setHistoryError(msg)
      })
      .finally(() => {
        setHistoryLoading(false)
      })
  }

  // Fetch regional oversupply risk signals
  const fetchOversupplyRisk = (st = filter.state, dist = filter.district, se = filter.season) => {
    setRiskLoading(true)
    setRiskError('')
    const params = new URLSearchParams()
    if (st) params.append('state', st)
    if (dist) params.append('district', dist)
    if (se) params.append('season', se)

    api.get(`/farmer/oversupply-risk?${params.toString()}`)
      .then((res) => {
        setResultRiskData(res.data)
      })
      .catch((err) => {
        const msg = err.response?.data?.message || t('oversupply.errGenericSignals', 'Unable to fetch regional oversupply signals.')
        setRiskError(msg)
      })
      .finally(() => {
        setRiskLoading(false)
      })
  }

  const setResultRiskData = (data) => {
    setRiskData(data)
    if (data && data.cropRiskItems && data.cropRiskItems.length > 0) {
      setSelectedCropItem(data.cropRiskItems[0])
    } else {
      setSelectedCropItem(null)
    }
  }

  useEffect(() => {
    fetchMyIntentions(0)
    fetchOversupplyRisk(filter.state, filter.district, filter.season)
  }, [])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }))
    }
    setFormSuccess('')
    setFormApiError('')
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.state) errors.state = t('oversupply.errStateRequired', 'State is required')
    if (!formData.district.trim()) errors.district = t('oversupply.errDistrictRequired', 'District is required')
    if (!formData.cropId) errors.cropId = t('oversupply.errCropRequired', 'Crop selection is required')
    if (!formData.intendedSeason) errors.intendedSeason = t('oversupply.errSeasonRequired', 'Target season is required')
    if (!formData.farmSize) {
      errors.farmSize = t('oversupply.errFarmSizeRequired', 'Farm size is required')
    } else {
      const sizeNum = parseFloat(formData.farmSize)
      if (isNaN(sizeNum) || sizeNum <= 0) {
        errors.farmSize = t('oversupply.errFarmSizePositive', 'Farm size must be a positive number (> 0)')
      }
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (formSubmitting) return
    if (!validateForm()) return

    setFormSubmitting(true)
    setFormSuccess('')
    setFormApiError('')

    const payload = {
      state: formData.state,
      district: formData.district.trim(),
      cropId: parseInt(formData.cropId, 10),
      intendedSeason: formData.intendedSeason,
      farmSize: parseFloat(formData.farmSize),
    }

    api.post('/farmer/crop-intentions', payload)
      .then(() => {
        setFormSuccess(t('oversupply.submitSuccess', 'Your crop intention has been recorded successfully. Thank you for contributing to regional oversupply risk visibility!'))
        setFormData((prev) => ({ ...prev, farmSize: '' }))
        fetchMyIntentions(0)
        // Refresh risk signals for the submitted region
        setFilter({
          state: payload.state,
          district: payload.district,
          season: payload.intendedSeason,
        })
        fetchOversupplyRisk(payload.state, payload.district, payload.intendedSeason)
      })
      .catch((err) => {
        const msg = err.response?.data?.message || t('oversupply.submitErrorDefault', 'Unable to record crop intention. Please try again.')
        setFormSuccess('')
        setFormApiError(msg)
      })
      .finally(() => {
        setFormSubmitting(false)
      })
  }

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    fetchOversupplyRisk(filter.state, filter.district, filter.season)
  }

  const handleDeleteIntention = (id) => {
    if (!window.confirm(t('oversupply.confirmDelete', 'Are you sure you want to delete this recorded crop intention?'))) return

    api.delete(`/farmer/crop-intentions/${id}`)
      .then(() => {
        fetchMyIntentions(historyPage)
        fetchOversupplyRisk(filter.state, filter.district, filter.season)
      })
      .catch((err) => {
        alert(err.response?.data?.message || t('oversupply.errDeleteFailed', 'Unable to delete intention record.'))
      })
  }

  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setEditFormData({
      state: item.state || 'Andhra Pradesh',
      district: item.district || '',
      cropId: item.crop?.id ? String(item.crop.id) : '',
      intendedSeason: item.intendedSeason || 'KHARIF',
      farmSize: item.farmSize ? String(item.farmSize) : '',
    })
    setEditError('')
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    if (editSubmitting) return
    if (!editingItem) return

    setEditSubmitting(true)
    setEditError('')

    const payload = {
      state: editFormData.state,
      district: editFormData.district.trim(),
      cropId: parseInt(editFormData.cropId, 10),
      intendedSeason: editFormData.intendedSeason,
      farmSize: parseFloat(editFormData.farmSize),
    }

    api.put(`/farmer/crop-intentions/${editingItem.id}`, payload)
      .then(() => {
        setEditingItem(null)
        fetchMyIntentions(historyPage)
        fetchOversupplyRisk(filter.state, filter.district, filter.season)
      })
      .catch((err) => {
        const msg = err.response?.data?.message || t('oversupply.errUpdateFailed', 'Unable to update intention record.')
        setEditError(msg)
      })
      .finally(() => {
        setEditSubmitting(false)
      })
  }

  const getRiskBadgeClass = (level) => {
    switch (level?.toUpperCase()) {
      case 'HIGH':
        return 'risk-badge-high'
      case 'MODERATE':
      case 'MEDIUM':
        return 'risk-badge-moderate'
      case 'LOW':
        return 'risk-badge-low'
      case 'INSUFFICIENT_DATA':
      default:
        return 'risk-badge-insufficient'
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

  return (
    <div className="risk-page-layout">
      <div className="risk-container">
        {/* Navigation Bar */}
        <div className="nav-header-row">
          <Link to="/farmer/dashboard" className="back-link">
            {t('oversupply.backToDashboard', '← Back to Dashboard')}
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <LanguageSelector id="oversupply-language-select" />
            <span className="nav-breadcrumb">
              {t('oversupply.breadcrumb', 'Dashboard / Farmer Intention & Oversupply Risk')}
            </span>
          </div>
        </div>

        {/* 1. HERO SECTION */}
        <div className="hero-risk-card">
          <div className="hero-text-content">
            <div className="hero-badge-row">
              <span className="badge-chip chip-feature">{t('oversupply.badgeSignature', '🌾 Signature Feature: Oversupply Risk')}</span>
              <span className="badge-chip chip-info">{t('oversupply.badgeVoluntary', '🛡️ Voluntary Farmer Intentions')}</span>
              <span className="badge-chip">{t('oversupply.badgeRegional', '📌 Regional Concentration Signals')}</span>
            </div>

            <h1 className="hero-main-title">{t('oversupply.heroTitle', 'Farmer Intention & Oversupply Risk')}</h1>

            <p className="hero-description">
              {t('oversupply.heroDesc', 'Understand how recorded farmer intentions are distributed across crops in your region to make more informed cultivation decisions.')}
            </p>

            {/* Prominent Disclaimer Note */}
            <div className="hero-disclaimer-banner">
              <span className="disclaimer-icon">ℹ️</span>
              <span>{t('oversupply.heroDisclaimer', 'Intention data is an indicator of planned cultivation, not confirmed production or a guaranteed market forecast.')}</span>
            </div>
          </div>

          <div className="hero-image-panel">
            <img src={oversupplyHeroImg} alt="Harvest & Crop Fields" className="hero-crop-img" />
            <div className="hero-img-overlay"></div>
          </div>
        </div>

        {/* 2. RECORD YOUR CROP INTENTION FORM */}
        <div className="form-card-container">
          <div className="card-header-banner">
            <span className="card-header-icon">🌱</span>
            <div>
              <h2 className="card-header-title">{t('oversupply.formTitle', 'Record Your Intended Crop')}</h2>
              <p className="card-header-sub">
                {t('oversupply.formSub', 'Voluntarily share your planned crop cultivation for an upcoming season to help build regional oversupply risk visibility.')}
              </p>
            </div>
          </div>

          <form className="intention-form" onSubmit={handleFormSubmit} noValidate>
            <div className="form-grid-3">
              {/* State */}
              <div className="form-group">
                <label className="field-label">{t('oversupply.stateLabel', 'State')} <span className="req-star">*</span></label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleFormChange}
                  className={`field-select ${formErrors.state ? 'has-error' : ''}`}
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                {formErrors.state && <span className="field-error">{formErrors.state}</span>}
              </div>

              {/* District */}
              <div className="form-group">
                <label className="field-label">{t('oversupply.districtLabel', 'District')} <span className="req-star">*</span></label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleFormChange}
                  placeholder={t('oversupply.districtPlaceholder', 'e.g. Guntur, Nashik, Ludhiana')}
                  className={`field-input ${formErrors.district ? 'has-error' : ''}`}
                />
                {formErrors.district && <span className="field-error">{formErrors.district}</span>}
              </div>

              {/* Crop */}
              <div className="form-group">
                <label className="field-label">{t('oversupply.plannedCropLabel', 'Planned Crop')} <span className="req-star">*</span></label>
                <select
                  name="cropId"
                  value={formData.cropId}
                  onChange={handleFormChange}
                  disabled={cropsLoading}
                  className={`field-select ${formErrors.cropId ? 'has-error' : ''}`}
                >
                  {cropsLoading ? (
                    <option value="">{t('oversupply.loadingCrops', 'Loading crops...')}</option>
                  ) : (
                    activeCrops.map((c) => (
                      <option key={c.id} value={c.id}>{getCropDisplayName(c.name)} ({c.scientificName})</option>
                    ))
                  )}
                </select>
                {formErrors.cropId && <span className="field-error">{formErrors.cropId}</span>}
              </div>

              {/* Intended Season */}
              <div className="form-group">
                <label className="field-label">{t('oversupply.targetSeasonLabel', 'Target Season')} <span className="req-star">*</span></label>
                <select
                  name="intendedSeason"
                  value={formData.intendedSeason}
                  onChange={handleFormChange}
                  className={`field-select ${formErrors.intendedSeason ? 'has-error' : ''}`}
                >
                  {SEASONS.map((s) => (
                    <option key={s} value={s}>{t(`seasons.${s}`, s)}</option>
                  ))}
                </select>
                {formErrors.intendedSeason && <span className="field-error">{formErrors.intendedSeason}</span>}
              </div>

              {/* Farm Size */}
              <div className="form-group">
                <label className="field-label">{t('oversupply.intendedAreaLabel', 'Intended Area (in Acres)')} <span className="req-star">*</span></label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  name="farmSize"
                  value={formData.farmSize}
                  onChange={handleFormChange}
                  placeholder={t('oversupply.areaPlaceholder', 'e.g. 3.5')}
                  className={`field-input ${formErrors.farmSize ? 'has-error' : ''}`}
                />
                {formErrors.farmSize && <span className="field-error">{formErrors.farmSize}</span>}
              </div>
            </div>

            {/* Form Action & Feedback */}
            <div className="form-submit-row">
              <button type="submit" className="btn-submit-intention" disabled={formSubmitting}>
                {formSubmitting ? t('oversupply.btnSaving', '⏳ Saving Intention...') : t('oversupply.btnSubmit', '🌱 Submit Crop Intention')}
              </button>

              {formSuccess && (
                <div className="feedback-banner banner-success">
                  <span>✅</span>
                  <span>{formSuccess}</span>
                </div>
              )}

              {formApiError && (
                <div className="feedback-banner banner-error">
                  <span>⚠️</span>
                  <span>{formApiError}</span>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* 3. MY RECORDED INTENTIONS */}
        <div className="card-container">
          <div className="card-header-banner">
            <span className="card-header-icon">📜</span>
            <div style={{ flex: 1 }}>
              <h3 className="card-header-title">{t('oversupply.myIntentionsTitle', 'My Recorded Intentions')}</h3>
              <p className="card-header-sub">{t('oversupply.myIntentionsSub', 'Your voluntarily submitted crop cultivation plans')}</p>
            </div>
            <button className="btn-refresh" onClick={() => fetchMyIntentions(historyPage)} disabled={historyLoading}>
              {t('oversupply.btnRefresh', '🔄 Refresh')}
            </button>
          </div>

          {historyLoading ? (
            <div className="loading-state-inline">
              <span>{t('oversupply.loadingIntentions', '⏳ Loading your intention records...')}</span>
            </div>
          ) : historyError ? (
            <div className="feedback-banner banner-error">
              <span>⚠️</span>
              <span>{historyError}</span>
            </div>
          ) : !historyData || !historyData.content || historyData.content.length === 0 ? (
            <div className="empty-state-box">
              <div className="empty-icon">🌾</div>
              <h4>{t('oversupply.emptyIntentionsTitle', 'No crop intentions recorded yet')}</h4>
              <p>{t('oversupply.emptyIntentionsSub', 'Submit your planned cultivation in the form above to start building your intention records.')}</p>
            </div>
          ) : (
            <>
              <div className="history-grid">
                {historyData.content.map((item) => (
                  <div key={item.id} className="history-card">
                    <div className="history-card-top">
                      <div className="history-crop-title">
                        <span className="history-emoji">{getCropEmoji(item.crop?.name)}</span>
                        <div>
                          <h4 className="h-crop-name">{getCropDisplayName(item.crop?.name)}</h4>
                          <span className="h-sci-name">{item.crop?.scientificName}</span>
                        </div>
                      </div>
                      <span className="season-badge">{t(`seasons.${item.intendedSeason}`, item.intendedSeason)}</span>
                    </div>

                    <div className="history-card-meta">
                      <div className="meta-cell">
                        <span className="meta-label">{t('oversupply.regionLabel', 'Region')}</span>
                        <span className="meta-val">📍 {item.district}, {item.state}</span>
                      </div>
                      <div className="meta-cell">
                        <span className="meta-label">{t('oversupply.intendedAreaCardLabel', 'Intended Area')}</span>
                        <span className="meta-val">📐 {item.farmSize} {t('oversupply.acresSuffix', 'Acres')}</span>
                      </div>
                    </div>

                    <div className="history-card-footer">
                      <span className="recorded-date">
                        {t('oversupply.recordedOn', 'Recorded on')} {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                      </span>

                      <div className="action-btns-row">
                        <button className="btn-action-edit" onClick={() => handleOpenEdit(item)}>
                          {t('oversupply.btnEdit', '✏️ Edit')}
                        </button>
                        <button className="btn-action-delete" onClick={() => handleDeleteIntention(item.id)}>
                          {t('oversupply.btnDelete', '🗑️ Delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="pagination-row">
                <button
                  className="btn-page"
                  onClick={() => fetchMyIntentions(historyPage - 1)}
                  disabled={historyData.first || historyLoading}
                >
                  {t('oversupply.btnPrevious', '← Previous')}
                </button>
                <span className="page-info">
                  {t('oversupply.pageInfo', 'Page {page} of {totalPages} (Total: {totalElements})')
                    .replace('{page}', historyData.page + 1)
                    .replace('{totalPages}', historyData.totalPages || 1)
                    .replace('{totalElements}', historyData.totalElements)}
                </span>
                <button
                  className="btn-page"
                  onClick={() => fetchMyIntentions(historyPage + 1)}
                  disabled={historyData.last || historyLoading}
                >
                  {t('oversupply.btnNext', 'Next →')}
                </button>
              </div>
            </>
          )}
        </div>

        {/* 4. REGIONAL OVERSUPPLY RISK SIGNALS */}
        <div className="card-container">
          <div className="card-header-banner">
            <span className="card-header-icon">📊</span>
            <div>
              <h2 className="card-header-title">{t('oversupply.signalsTitle', 'Regional Crop Intention Signals')}</h2>
              <p className="card-header-sub">
                {t('oversupply.signalsSub', 'Explore aggregate farmer intention concentration for your target state, district, and season.')}
              </p>
            </div>
          </div>

          {/* Regional Filter Controls */}
          <form className="filter-bar-form" onSubmit={handleFilterSubmit}>
            <div className="filter-controls-grid">
              <div className="filter-group">
                <label className="filter-label">{t('oversupply.filterStateLabel', 'Filter State')}</label>
                <select
                  value={filter.state}
                  onChange={(e) => setFilter((prev) => ({ ...prev, state: e.target.value }))}
                  className="filter-select"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">{t('oversupply.filterDistrictLabel', 'Filter District')}</label>
                <input
                  type="text"
                  value={filter.district}
                  onChange={(e) => setFilter((prev) => ({ ...prev, district: e.target.value }))}
                  placeholder={t('oversupply.filterDistrictPlaceholder', 'e.g. Guntur')}
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">{t('oversupply.filterSeasonLabel', 'Filter Season')}</label>
                <select
                  value={filter.season}
                  onChange={(e) => setFilter((prev) => ({ ...prev, season: e.target.value }))}
                  className="filter-select"
                >
                  {SEASONS.map((s) => (
                    <option key={s} value={s}>{t(`seasons.${s}`, s)}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-filter-apply" disabled={riskLoading}>
                {riskLoading ? t('oversupply.btnChecking', '⏳ Checking...') : t('oversupply.btnCheckSignals', '🔍 Check Region Signals')}
              </button>
            </div>
          </form>

          {/* Risk Loading / Error States */}
          {riskLoading ? (
            <div className="loading-state-inline">
              <span>{t('oversupply.analyzingRegional', '⏳ Analyzing regional farmer intentions for {district}, {state}...').replace('{district}', filter.district).replace('{state}', filter.state)}</span>
            </div>
          ) : riskError ? (
            <div className="feedback-banner banner-error">
              <span>⚠️</span>
              <span>{riskError}</span>
            </div>
          ) : riskData && (
            <div className="risk-analytics-content">
              {/* Regional Summary Bar */}
              <div className="regional-summary-box">
                <div className="reg-stat-cell">
                  <span className="reg-stat-num">{riskData.totalDistinctFarmers ?? 0}</span>
                  <span className="reg-stat-label">{t('oversupply.statDistinctFarmers', 'Distinct Farmers')}</span>
                </div>
                <div className="reg-stat-cell">
                  <span className="reg-stat-num">{riskData.totalRegionalIntentions}</span>
                  <span className="reg-stat-label">{t('oversupply.statTotalIntentions', 'Total Regional Intentions')}</span>
                </div>
                <div className="reg-stat-cell">
                  <span className="reg-stat-num">{riskData.totalRegionalArea}</span>
                  <span className="reg-stat-label">{t('oversupply.statTotalArea', 'Total Intended Acres')}</span>
                </div>
                <div className="reg-summary-text">
                  <span>📌 {riskData.summaryMessage}</span>
                </div>
              </div>

              {/* Insufficient Data Banner */}
              {!riskData.dataSufficient && (
                <div className="notice-banner-warning">
                  <span className="warning-icon">⚠️</span>
                  <div>
                    <h4 className="warning-title">{t('oversupply.insufficientTitle', 'Insufficient Regional Sample Size')}</h4>
                    <p className="warning-text">
                      {t('oversupply.insufficientWarning', 'Currently {distinctCount} distinct {farmerWord} recorded intentions in {district}, {state} for {season} season. A minimum of 3 distinct reporting farmers is required to evaluate indicative oversupply risk reliably.')
                        .replace('{distinctCount}', riskData.totalDistinctFarmers ?? 0)
                        .replace('{farmerWord}', riskData.totalDistinctFarmers === 1 ? t('oversupply.farmerHas', 'farmer has') : t('oversupply.farmersHave', 'farmers have'))
                        .replace('{district}', riskData.district)
                        .replace('{state}', riskData.state)
                        .replace('{season}', t(`seasons.${riskData.season}`, riskData.season))}
                    </p>
                  </div>
                </div>
              )}

              {/* Crop Risk Cards Grid */}
              <div className="crop-risk-grid">
                {riskData.cropRiskItems?.map((item) => {
                  const isSelected = selectedCropItem?.cropId === item.cropId
                  return (
                    <div
                      key={item.cropId}
                      className={`crop-risk-card ${isSelected ? 'risk-card-selected' : ''}`}
                      onClick={() => setSelectedCropItem(item)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="risk-card-top">
                        <span className="risk-crop-emoji">{getCropEmoji(item.cropName)}</span>
                        <div>
                          <h4 className="risk-crop-name">{getCropDisplayName(item.cropName)}</h4>
                          <span className="risk-crop-sci">{item.scientificName}</span>
                        </div>
                      </div>

                      <div className="risk-card-badge-row">
                        <span className={`risk-badge-pill ${getRiskBadgeClass(item.riskLevel)}`}>
                          🛡️ {t(`riskLevels.${item.riskLevel}`, item.riskLabel)}
                        </span>
                      </div>

                      <div className="risk-metrics-grid">
                        <div className="risk-metric">
                          <span className="rm-val">{item.farmerIntentionCount}</span>
                          <span className="rm-label">{t('oversupply.metricIntentions', 'Intentions')}</span>
                        </div>
                        <div className="risk-metric">
                          <span className="rm-val">{item.intendedArea}</span>
                          <span className="rm-label">{t('oversupply.metricAcres', 'Acres')}</span>
                        </div>
                        <div className="risk-metric">
                          <span className="rm-val">{item.intentionShare}%</span>
                          <span className="rm-label">{t('oversupply.metricShare', 'Intention Share')}</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="risk-share-bar-bg">
                        <div
                          className={`risk-share-bar-fill ${getRiskBadgeClass(item.riskLevel)}`}
                          style={{ width: `${Math.min(100, item.intentionShare)}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 5. RISK EXPLANATION BOX */}
              {selectedCropItem && (
                <div className="why-risk-explanation-panel">
                  <h4 className="why-risk-title">
                    {t('oversupply.whyRiskTitle', '💡 Why is {cropName} showing as {riskLabel}?')
                      .replace('{cropName}', getCropDisplayName(selectedCropItem.cropName))
                      .replace('{riskLabel}', t(`riskLevels.${selectedCropItem.riskLevel}`, selectedCropItem.riskLabel))}
                  </h4>
                  <p className="why-risk-text">{selectedCropItem.explanation}</p>
                  <div className="why-risk-metrics">
                    <span>
                      {t('oversupply.whyRiskMetricIntentions', '📊 Intention Count: {count} out of {total} regional intentions')
                        .replace('{count}', selectedCropItem.farmerIntentionCount)
                        .replace('{total}', riskData.totalRegionalIntentions)}
                    </span>
                    <span>
                      {t('oversupply.whyRiskMetricArea', ' • 📐 Intended Area: {area} Acres ({share}% of regional total)')
                        .replace('{area}', selectedCropItem.intendedArea)
                        .replace('{share}', selectedCropItem.areaShare)}
                    </span>
                  </div>
                  <div className="why-risk-note">
                    <span>{t('oversupply.whyRiskNote', 'ℹ️ Note: This is an aggregated indicator based on recorded voluntary farmer intentions, not a guaranteed production forecast or market price prediction.')}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 6. TRANSPARENCY PANEL: HOW THIS INDICATOR WORKS */}
        <div className="card-container">
          <div className="card-header-banner">
            <span className="card-header-icon">⚙️</span>
            <div>
              <h3 className="card-header-title">{t('oversupply.howItWorksTitle', 'How This Indicator Works')}</h3>
              <p className="card-header-sub">{t('oversupply.howItWorksSub', 'Transparent software indicator logic behind farmer intention signals')}</p>
            </div>
          </div>

          <div className="transparency-steps-grid">
            <div className="step-card">
              <span className="step-num">01</span>
              <h5 className="step-title">{t('oversupply.step1Title', 'Voluntary Intentions')}</h5>
              <p className="step-text">{t('oversupply.step1Text', 'Farmers voluntarily record their intended crop and farm size for an upcoming season.')}</p>
            </div>
            <div className="step-card">
              <span className="step-num">02</span>
              <h5 className="step-title">{t('oversupply.step2Title', 'Regional Aggregation')}</h5>
              <p className="step-text">{t('oversupply.step2Text', 'KisanMitra aggregates intentions by State, District, and Season without exposing individual farmer privacy.')}</p>
            </div>
            <div className="step-card">
              <span className="step-num">03</span>
              <h5 className="step-title">{t('oversupply.step3Title', 'Concentration Calculation')}</h5>
              <p className="step-text">{t('oversupply.step3Text', 'The system calculates crop share (%) of total recorded regional intentions and intended farm area.')}</p>
            </div>
            <div className="step-card">
              <span className="step-num">04</span>
              <h5 className="step-title">{t('oversupply.step4Title', 'Risk Signal Classification')}</h5>
              <p className="step-text">{t('oversupply.step4Text', 'Higher concentration (e.g. ≥ 45%) signals potential oversupply risk if planned cultivation materializes.')}</p>
            </div>
            <div className="step-card">
              <span className="step-num">05</span>
              <h5 className="step-title">{t('oversupply.step5Title', 'Data Sufficiency Rule')}</h5>
              <p className="step-text">{t('oversupply.step5Text', 'If sample size is insufficient (fewer than 3 distinct reporting farmers), the system flags INSUFFICIENT DATA rather than guessing.')}</p>
            </div>
            <div className="step-card">
              <span className="step-num">06</span>
              <h5 className="step-title">{t('oversupply.step6Title', 'No Price Prediction')}</h5>
              <p className="step-text">{t('oversupply.step6Text', 'The indicator does NOT predict future market prices or guarantee yields. It is a decision-support signal.')}</p>
            </div>
          </div>
        </div>

        {/* 7. DECISION-SUPPORT NOTICE */}
        <div className="decision-support-panel">
          <div className="ds-icon">🛡️</div>
          <div>
            <h4 className="ds-title">{t('oversupply.disclaimerTitle', 'Agricultural Decision-Support Disclaimer')}</h4>
            <p className="ds-text">
              {t('oversupply.disclaimerText', 'Important: This indicator should not be treated as a guaranteed prediction of crop prices, demand, yield, or profit. Consider local agricultural conditions and consult an agricultural extension professional when making major cultivation decisions.')}
            </p>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{t('oversupply.editModalTitle', '✏️ Edit Recorded Intention #{id}').replace('{id}', editingItem.id)}</h3>
              <button className="btn-modal-close" onClick={() => setEditingItem(null)}>✕</button>
            </div>

            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label className="field-label">{t('oversupply.stateLabel', 'State')}</label>
                <select
                  value={editFormData.state}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, state: e.target.value }))}
                  className="field-select"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="field-label">{t('oversupply.districtLabel', 'District')}</label>
                <input
                  type="text"
                  value={editFormData.district}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, district: e.target.value }))}
                  className="field-input"
                />
              </div>

              <div className="form-group">
                <label className="field-label">{t('oversupply.plannedCropLabel', 'Crop')}</label>
                <select
                  value={editFormData.cropId}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, cropId: e.target.value }))}
                  className="field-select"
                >
                  {activeCrops.map((c) => (
                    <option key={c.id} value={c.id}>{getCropDisplayName(c.name)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="field-label">{t('oversupply.targetSeasonLabel', 'Target Season')}</label>
                <select
                  value={editFormData.intendedSeason}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, intendedSeason: e.target.value }))}
                  className="field-select"
                >
                  {SEASONS.map((s) => (
                    <option key={s} value={s}>{t(`seasons.${s}`, s)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="field-label">{t('oversupply.intendedAreaLabel', 'Intended Area (Acres)')}</label>
                <input
                  type="number"
                  step="0.5"
                  value={editFormData.farmSize}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, farmSize: e.target.value }))}
                  className="field-input"
                />
              </div>

              {editError && (
                <div className="feedback-banner banner-error">
                  <span>⚠️</span>
                  <span>{editError}</span>
                </div>
              )}

              <div className="modal-actions">
                <button type="submit" className="btn-submit-intention" disabled={editSubmitting}>
                  {editSubmitting ? t('oversupply.btnUpdating', '⏳ Updating...') : t('oversupply.btnSaveChanges', '💾 Save Changes')}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setEditingItem(null)}>
                  {t('oversupply.btnCancel', 'Cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default OversupplyRiskPage
