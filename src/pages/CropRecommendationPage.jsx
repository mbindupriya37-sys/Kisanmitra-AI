import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useLanguage } from '../context/LanguageContext'
import LanguageSelector from '../components/LanguageSelector'
import {
  getStates,
  getDistrictsByState,
  getLocalitiesByDistrict,
  LOCATION_SOURCE_INFO
} from '../data/indiaLocations'
import {
  validatePinCode,
  lookupPinCode,
  reconcilePostalLocation,
  POSTAL_SOURCE_INFO
} from '../services/postalService'
import './CropRecommendation.css'

const SOIL_TYPE_OPTIONS = [
  { value: 'Alluvial', key: 'cropRec.soilAlluvial', defaultLabel: 'Alluvial' },
  { value: 'Black', key: 'cropRec.soilBlack', defaultLabel: 'Black' },
  { value: 'Red', key: 'cropRec.soilRed', defaultLabel: 'Red' },
  { value: 'Laterite', key: 'cropRec.soilLaterite', defaultLabel: 'Laterite' },
  { value: 'Sandy', key: 'cropRec.soilSandy', defaultLabel: 'Sandy' },
  { value: 'Loamy', key: 'cropRec.soilLoamy', defaultLabel: 'Loamy' },
  { value: 'Clay', key: 'cropRec.soilClay', defaultLabel: 'Clay' },
  { value: 'Other', key: 'cropRec.soilOther', defaultLabel: 'Other' },
  { value: 'Unknown', key: 'cropRec.soilUnknown', defaultLabel: 'Unknown' },
]

const WATER_AVAILABILITY_OPTIONS = [
  { value: 'Very Low', key: 'cropRec.waterVeryLow', defaultLabel: 'Very Low' },
  { value: 'Low', key: 'cropRec.waterLow', defaultLabel: 'Low' },
  { value: 'Moderate', key: 'cropRec.waterModerate', defaultLabel: 'Moderate' },
  { value: 'High', key: 'cropRec.waterHigh', defaultLabel: 'High' },
  { value: 'Very High', key: 'cropRec.waterVeryHigh', defaultLabel: 'Very High' },
]

const IRRIGATION_OPTIONS_LIST = [
  { value: 'Yes', key: 'cropRec.irrigationYes', defaultLabel: 'Yes' },
  { value: 'No', key: 'cropRec.irrigationNo', defaultLabel: 'No' },
  { value: 'Seasonal', key: 'cropRec.irrigationSeasonal', defaultLabel: 'Seasonal' },
]

const RAINFALL_OPTIONS_LIST = [
  { value: 'Very Low', key: 'cropRec.waterVeryLow', defaultLabel: 'Very Low' },
  { value: 'Low', key: 'cropRec.waterLow', defaultLabel: 'Low' },
  { value: 'Moderate', key: 'cropRec.waterModerate', defaultLabel: 'Moderate' },
  { value: 'High', key: 'cropRec.waterHigh', defaultLabel: 'High' },
  { value: 'Very High', key: 'cropRec.waterVeryHigh', defaultLabel: 'Very High' },
]

const SEASON_OPTIONS_LIST = [
  { value: 'Kharif', key: 'cropRec.seasonKharif', defaultLabel: 'Kharif' },
  { value: 'Rabi', key: 'cropRec.seasonRabi', defaultLabel: 'Rabi' },
  { value: 'Zaid', key: 'cropRec.seasonZaid', defaultLabel: 'Zaid' },
]

const TEMP_OPTIONS_LIST = [
  { value: 'Cool', key: 'cropRec.tempCool', defaultLabel: 'Cool' },
  { value: 'Moderate', key: 'cropRec.tempModerate', defaultLabel: 'Moderate' },
  { value: 'Warm', key: 'cropRec.tempWarm', defaultLabel: 'Warm' },
  { value: 'Hot', key: 'cropRec.tempHot', defaultLabel: 'Hot' },
]

const FARMER_PRIORITIES = [
  { id: 'water', label: 'Lower water requirement', key: 'cropRec.priorityWater', icon: '💧' },
  { id: 'climate', label: 'Better climate suitability', key: 'cropRec.priorityClimate', icon: '🌤️' },
  { id: 'market', label: 'Market opportunity', key: 'cropRec.priorityMarket', icon: '📈' },
  { id: 'risk', label: 'Lower crop risk', key: 'cropRec.priorityRisk', icon: '🛡️' },
  { id: 'period', label: 'Shorter growing period', key: 'cropRec.priorityPeriod', icon: '⚡' },
  { id: 'sustainable', label: 'Sustainable farming', key: 'cropRec.prioritySustainable', icon: '🌿' },
]

function CropRecommendationPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    pincode: '',
    state: '',
    district: '',
    village: '',
    soilType: '',
    soilPh: '',
    soilPhUnknown: false,
    waterAvailability: '',
    irrigation: '',
    expectedRainfall: '',
    season: '',
    temperatureRange: '',
    farmSize: '',
    priorities: [],
  })

  // PIN-Code Assisted Lookup States
  const [pincodeInput, setPincodeInput] = useState('')
  const [postalLoading, setPostalLoading] = useState(false)
  const [postalError, setPostalError] = useState('')
  const [postalSuccess, setPostalSuccess] = useState('')
  const [postalResult, setPostalResult] = useState(null)
  const [selectedPostOfficeName, setSelectedPostOfficeName] = useState('')

  // Location UI States
  const [customVillage, setCustomVillage] = useState('')
  const [isCustomVillage, setIsCustomVillage] = useState(false)
  const [districtLoading, setDistrictLoading] = useState(false)
  const [localityLoading, setLocalityLoading] = useState(false)

  const [errors, setErrors] = useState({})
  const [submittedData, setSubmittedData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [apiError, setApiError] = useState('')

  // History Pagination State
  const [historyPage, setHistoryPage] = useState(0)
  const [historyData, setHistoryData] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState('')

  // Derived location lists
  const availableDistricts = formData.state ? getDistrictsByState(formData.state) : []
  const availableLocalities = (formData.state && formData.district)
    ? getLocalitiesByDistrict(formData.state, formData.district)
    : []

  const fetchHistory = (pageNum = 0) => {
    setHistoryLoading(true)
    setHistoryError('')
    api.get(`/farmer/crop-recommendations?page=${pageNum}&size=5`)
      .then((res) => {
        setHistoryData(res.data)
        setHistoryPage(pageNum)
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Unable to load assessment history.'
        setHistoryError(msg)
      })
      .finally(() => {
        setHistoryLoading(false)
      })
  }

  useEffect(() => {
    fetchHistory(0)
  }, [])

  // Helper to apply a selected post office and populate State -> District -> Village
  const applyPostOffice = (po, postalData) => {
    const reconciled = reconcilePostalLocation(postalData.state, postalData.district, po)

    setFormData((prev) => ({
      ...prev,
      pincode: postalData.pincode,
      state: reconciled.state || '',
      district: reconciled.district || '',
      village: reconciled.locality || '',
    }))

    if (reconciled.isCustomLocality) {
      setIsCustomVillage(true)
      setCustomVillage(reconciled.locality || '')
    } else {
      setIsCustomVillage(false)
      setCustomVillage('')
    }

    setSelectedPostOfficeName(po.name)
    setErrors((prev) => ({ ...prev, state: '', district: '', village: '' }))
    setSuccessMessage('')
    setApiError('')
  }

  // PIN-Code Handlers with Dependent Resets
  const handlePincodeChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 6)
    setPincodeInput(rawVal)

    // Clear previous lookup results and messages when user edits PIN
    if (postalResult || postalError || postalSuccess) {
      setPostalResult(null)
      setSelectedPostOfficeName('')
      setPostalError('')
      setPostalSuccess('')
    }
    // Dependent reset: If the form has PIN-derived location, reset dependent selections
    if (formData.pincode && rawVal !== formData.pincode) {
      setFormData((prev) => ({
        ...prev,
        pincode: '',
        state: '',
        district: '',
        village: '',
      }))
      setIsCustomVillage(false)
      setCustomVillage('')
    }
  }

  const handleClearPin = () => {
    setPincodeInput('')
    setPostalResult(null)
    setSelectedPostOfficeName('')
    setPostalError('')
    setPostalSuccess('')
    setFormData((prev) => ({
      ...prev,
      pincode: '',
      state: '',
      district: '',
      village: '',
    }))
    setIsCustomVillage(false)
    setCustomVillage('')
  }

  const handlePincodeLookup = async () => {
    const validation = validatePinCode(pincodeInput)
    if (!validation.isValid) {
      setPostalError(validation.error)
      setPostalResult(null)
      setSelectedPostOfficeName('')
      setPostalSuccess('')
      return
    }

    setPostalLoading(true)
    setPostalError('')
    setPostalSuccess('')
    setPostalResult(null)
    setSelectedPostOfficeName('')

    try {
      const res = await lookupPinCode(pincodeInput)
      if (!res.success) {
        setPostalError(res.error || 'No postal records found. Please select your location manually below.')
        return
      }

      setPostalResult(res)
      if (res.postOffices.length === 1) {
        // Single post office match - apply directly
        applyPostOffice(res.postOffices[0], res)
        setPostalSuccess(`Location verified: ${res.postOffices[0].name}, ${res.district}, ${res.state} (${res.source})`)
      } else {
        // Multiple post offices - require explicit farmer selection instead of guessing
        setPostalSuccess(`Found ${res.postOffices.length} post offices in ${res.district}, ${res.state}. Please choose your post office below:`)
      }
    } catch {
      setPostalError('Unable to connect to postal directory. Please select your location manually below.')
    } finally {
      setPostalLoading(false)
    }
  }

  const handleSelectPostOffice = (po) => {
    if (!postalResult) return
    applyPostOffice(po, postalResult)
    setPostalSuccess(`Selected: ${po.name}, ${postalResult.district}, ${postalResult.state}`)
  }

  // Location Handlers with Dependent Resets
  const handleStateChange = (e) => {
    const nextState = e.target.value
    setDistrictLoading(true)
    setFormData((prev) => ({
      ...prev,
      pincode: (postalResult?.state === nextState) ? prev.pincode : '',
      state: nextState,
      district: '',
      village: '',
    }))
    if (postalResult && postalResult.state !== nextState) {
      setPincodeInput('')
      setPostalResult(null)
      setSelectedPostOfficeName('')
      setPostalSuccess('')
      setPostalError('')
    }
    setIsCustomVillage(false)
    setCustomVillage('')
    if (errors.state) setErrors((prev) => ({ ...prev, state: '' }))
    if (errors.district) setErrors((prev) => ({ ...prev, district: '' }))
    if (errors.village) setErrors((prev) => ({ ...prev, village: '' }))
    setSuccessMessage('')
    setApiError('')
    setTimeout(() => setDistrictLoading(false), 50)
  }

  const handleDistrictChange = (e) => {
    const nextDistrict = e.target.value
    setLocalityLoading(true)
    setFormData((prev) => ({
      ...prev,
      pincode: (postalResult?.district === nextDistrict) ? prev.pincode : '',
      district: nextDistrict,
      village: '',
    }))
    if (postalResult && postalResult.district !== nextDistrict) {
      setSelectedPostOfficeName('')
    }
    setIsCustomVillage(false)
    setCustomVillage('')
    if (errors.district) setErrors((prev) => ({ ...prev, district: '' }))
    if (errors.village) setErrors((prev) => ({ ...prev, village: '' }))
    setSuccessMessage('')
    setApiError('')
    setTimeout(() => setLocalityLoading(false), 50)
  }

  const handleLocalitySelect = (e) => {
    const val = e.target.value
    if (val === '__OTHER__') {
      setIsCustomVillage(true)
      setFormData((prev) => ({ ...prev, village: customVillage }))
    } else {
      setIsCustomVillage(false)
      setCustomVillage('')
      setFormData((prev) => ({ ...prev, village: val }))
    }
    if (errors.village) setErrors((prev) => ({ ...prev, village: '' }))
    setSuccessMessage('')
    setApiError('')
  }

  const handleCustomVillageInput = (e) => {
    const val = e.target.value
    setCustomVillage(val)
    setFormData((prev) => ({ ...prev, village: val }))
    if (errors.village) setErrors((prev) => ({ ...prev, village: '' }))
    setSuccessMessage('')
    setApiError('')
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    setFormData((prev) => ({ ...prev, [name]: val }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
    setSuccessMessage('')
    setApiError('')
  }

  const handlePriorityToggle = (label) => {
    setFormData((prev) => {
      const exists = prev.priorities.includes(label)
      const updated = exists 
        ? prev.priorities.filter((p) => p !== label)
        : [...prev.priorities, label]
      return { ...prev, priorities: updated }
    })
    setSuccessMessage('')
    setApiError('')
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.state) newErrors.state = t('cropRec.errStateRequired', 'State is required')
    if (!formData.district || !formData.district.trim()) newErrors.district = t('cropRec.errDistrictRequired', 'District is required')
    if (isCustomVillage && customVillage.length > 150) {
      newErrors.village = t('cropRec.errVillageLength', 'Village name cannot exceed 150 characters')
    }
    if (!formData.soilType) newErrors.soilType = t('cropRec.errSoilTypeRequired', 'Soil type is required')

    if (!formData.soilPhUnknown) {
      if (!formData.soilPh) {
        newErrors.soilPh = t('cropRec.errSoilPhRequired', 'Soil pH is required unless "I don\'t know" is selected')
      } else {
        const phNum = parseFloat(formData.soilPh)
        if (isNaN(phNum) || phNum < 4.0 || phNum > 9.5) {
          newErrors.soilPh = t('cropRec.errSoilPhRange', 'Soil pH must be between 4.0 and 9.5')
        }
      }
    }

    if (!formData.waterAvailability) newErrors.waterAvailability = t('cropRec.errWaterRequired', 'Water availability is required')
    if (!formData.irrigation) newErrors.irrigation = t('cropRec.errIrrigationRequired', 'Irrigation status is required')
    if (!formData.expectedRainfall) newErrors.expectedRainfall = t('cropRec.errRainfallRequired', 'Expected rainfall is required')
    if (!formData.season) newErrors.season = t('cropRec.errSeasonRequired', 'Season is required')
    if (!formData.farmSize) {
      newErrors.farmSize = t('cropRec.errFarmSizeRequired', 'Farm size is required')
    } else {
      const sizeNum = parseFloat(formData.farmSize)
      if (isNaN(sizeNum) || sizeNum <= 0) {
        newErrors.farmSize = t('cropRec.errFarmSizePositive', 'Farm size must be a positive number (> 0)')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      setLoading(true)
      setSuccessMessage('')
      setApiError('')

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

      setLoading(true)
      setSuccessMessage(t('cropRec.savingMsg', 'Saving farm assessment details...'))
      setApiError('')

      api.post('/farmer/crop-recommendations', cleanPayload)
        .then((saveRes) => {
          const newRequestId = saveRes.data?.id
          if (!newRequestId) {
            throw new Error('Assessment saved, but valid request ID was not returned.')
          }
          setSubmittedData(saveRes.data)
          setSuccessMessage(t('cropRec.runningAnalysisMsg', 'Running agronomic recommendation analysis against verified ICAR requirements...'))

          // Execute recommendation analysis endpoint
          return api.get(`/farmer/crop-recommendations/${newRequestId}/results`)
            .then(() => {
              setSuccessMessage(t('cropRec.analysisCompleteMsg', 'Analysis complete! Redirecting to recommendation results...'))
              // Navigate only when analysis succeeds
              navigate(`/farmer/crop-recommendation/results/${newRequestId}`)
            })
        })
        .catch((err) => {
          const msg = err.response?.data?.message || err.message || 'Unable to complete crop recommendation analysis. Please try again.'
          setApiError(msg)
          setSuccessMessage('')
          fetchHistory(0)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }

  return (
    <div className="crop-rec-layout">
      <div className="crop-rec-container">
        {/* Navigation Bar */}
        <div className="crop-nav-bar">
          <Link to="/farmer/dashboard" className="back-dash-btn">
            {t('cropRec.backToDashboard', '← Back to Dashboard')}
          </Link>
          <LanguageSelector id="crop-rec-language-select" />
        </div>

        {/* Page Header */}
        <div className="page-header-banner">
          <div>
            <div className="header-banner-badge">{t('cropRec.badge', '🌾 Farm Decision Analysis')}</div>
            <h1 className="header-banner-title">{t('cropRec.title', 'Crop Recommendation')}</h1>
            <p className="header-banner-sub">
              {t('cropRec.subtitle', 'Evaluate which crops may suit your farming conditions before making a decision.')}
            </p>
            <div className="header-risk-note">
              <span>⚠️</span>
              <span>{t('cropRec.riskNote', 'KisanMitra AI provides decision support based on the information provided. Local conditions can vary.')}</span>
            </div>
          </div>
          <div className="header-banner-icon">🌱</div>
        </div>

        {/* Main Input Form */}
        <form className="crop-form-card" onSubmit={handleSubmit} noValidate>
          {/* SECTION A — LOCATION */}
          <div className="form-section">
            <div className="section-title-wrapper">
              <span className="section-icon">📍</span>
              <h3 className="section-h3">{t('cropRec.sectionA', 'Section A — Location & Region')}</h3>
            </div>
            <p className="field-explanation">
              {t('cropRec.sectionAExplanation', 'Location records your farm jurisdiction for regional context (weather and market records). Agronomic recommendation evaluates physical soil, pH, water, rainfall, and season conditions against verified ICAR requirements.')}
            </p>

            {/* PIN-Code Assisted Location Selection */}
            <div className="pincode-card-box">
              <div className="pincode-header-row">
                <span className="pincode-title">
                  {t('cropRec.pinAssistedTitle', '📮 PIN-Code Assisted Location Selection')}
                </span>
                <span className="pincode-badge">{t('cropRec.pinBadge', 'India Post Directory')}</span>
              </div>
              <p className="field-explanation" style={{ margin: 0 }}>
                {t('cropRec.pinExplanation', 'Enter your 6-digit postal PIN code to automatically find and populate your State, District, and Post Office. You can also select manually using the dropdowns below.')}
              </p>

              <div className="pincode-input-row">
                <div className="pincode-input-group">
                  <input
                    type="text"
                    id="pincode-input"
                    name="pincodeInput"
                    value={pincodeInput}
                    onChange={handlePincodeChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handlePincodeLookup()
                      }
                    }}
                    placeholder={t('cropRec.pinPlaceholder', 'e.g. 522001')}
                    maxLength={6}
                    className="field-input"
                    disabled={postalLoading}
                    aria-label={t('cropRec.pinAriaLabel', 'Six digit Indian PIN Code')}
                  />
                </div>
                <button
                  type="button"
                  id="pincode-lookup-btn"
                  className="btn-lookup-pin"
                  onClick={handlePincodeLookup}
                  disabled={postalLoading || pincodeInput.trim().length !== 6}
                >
                  {postalLoading ? t('cropRec.pinSearchingBtn', '⏳ Searching...') : t('cropRec.pinFindBtn', '🔍 Find Location')}
                </button>
                {(pincodeInput || postalResult || postalError) && (
                  <button
                    type="button"
                    id="pincode-clear-btn"
                    className="btn-clear-pin"
                    onClick={handleClearPin}
                    disabled={postalLoading}
                  >
                    {t('cropRec.pinClearBtn', 'Clear')}
                  </button>
                )}
              </div>

              {/* Status Messages */}
              {postalLoading && (
                <div className="postal-status-msg info">
                  <span>⏳</span>
                  <span>{t('cropRec.pinLookingUpMsg', 'Looking up PIN code {pin} in Department of Posts directory...').replace('{pin}', pincodeInput)}</span>
                </div>
              )}
              {postalError && (
                <div className="postal-status-msg error" id="pincode-error-msg">
                  <span>⚠️</span>
                  <span>{postalError}</span>
                </div>
              )}
              {postalSuccess && (
                <div className="postal-status-msg success" id="pincode-success-msg">
                  <span>✅</span>
                  <span>{postalSuccess}</span>
                </div>
              )}

              {/* Multiple Matches Disambiguation Picker */}
              {postalResult && postalResult.postOffices && postalResult.postOffices.length > 1 && (
                <div className="post-office-picker">
                  <div className="post-office-picker-title">
                    <span>{t('cropRec.pinSelectPostOffice', '🏢 Select your Post Office ({count} matches found):').replace('{count}', postalResult.postOffices.length)}</span>
                  </div>
                  <div className="post-office-grid">
                    {postalResult.postOffices.map((po, idx) => {
                      const isSelected = selectedPostOfficeName === po.name
                      return (
                        <button
                          key={idx}
                          type="button"
                          className={`post-office-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectPostOffice(po)}
                        >
                          <span className="po-name">{po.name}</span>
                          <div className="po-meta">
                            <span className="po-badge">{po.branchType}</span>
                            {po.block && <span className="po-badge">Mandal: {po.block}</span>}
                            <span className="po-badge">{po.deliveryStatus}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="form-grid-3">
              {/* State */}
              <div className="form-control-group">
                <label className="field-label">{t('cropRec.stateLabel', 'State / Union Territory')} <span className="required-star">*</span></label>
                <select
                  name="state"
                  id="state-select"
                  value={formData.state}
                  onChange={handleStateChange}
                  className={`field-select ${errors.state ? 'has-error' : ''}`}
                >
                  <option value="">{t('cropRec.selectState', 'Select State / UT')}</option>
                  {getStates().map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                {errors.state && <span className="field-error-text">{errors.state}</span>}
              </div>

              {/* District */}
              <div className="form-control-group">
                <label className="field-label">{t('cropRec.districtLabel', 'District')} <span className="required-star">*</span></label>
                <select
                  name="district"
                  id="district-select"
                  value={formData.district}
                  onChange={handleDistrictChange}
                  disabled={!formData.state || districtLoading}
                  className={`field-select ${errors.district ? 'has-error' : ''}`}
                >
                  {!formData.state ? (
                    <option value="">{t('cropRec.selectStateFirst', 'Select a state first')}</option>
                  ) : districtLoading ? (
                    <option value="">{t('cropRec.loadingDistricts', '⏳ Loading districts...')}</option>
                  ) : availableDistricts.length === 0 ? (
                    <option value="">{t('cropRec.noDistrictsFound', 'No districts found for this state')}</option>
                  ) : (
                    <>
                      <option value="">{t('cropRec.selectDistrict', 'Select District ({count} available)').replace('{count}', availableDistricts.length)}</option>
                      {availableDistricts.map((dist) => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </>
                  )}
                </select>
                {errors.district && <span className="field-error-text">{errors.district}</span>}
              </div>

              {/* Village / City / Sub-district */}
              <div className="form-control-group">
                <label className="field-label">{t('cropRec.villageLabel', 'Village / City / Town')}</label>
                <select
                  name="villageSelect"
                  id="village-select"
                  value={isCustomVillage ? '__OTHER__' : (formData.village || '')}
                  onChange={handleLocalitySelect}
                  disabled={!formData.district || localityLoading}
                  className={`field-select ${errors.village ? 'has-error' : ''}`}
                >
                  {!formData.district ? (
                    <option value="">{t('cropRec.selectDistrictFirst', 'Select a district first')}</option>
                  ) : localityLoading ? (
                    <option value="">{t('cropRec.loadingLocalities', '⏳ Loading localities...')}</option>
                  ) : (
                    <>
                      <option value="">{t('cropRec.selectSubDistrict', 'Select Sub-district / Town ({count} indexed)').replace('{count}', availableLocalities.length)}</option>
                      {availableLocalities.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                      <option value="__OTHER__">{t('cropRec.otherVillageOption', '✍️ Other (Enter custom village / locality)')}</option>
                    </>
                  )}
                </select>

                {/* Custom Village Text Input */}
                {(isCustomVillage || (formData.district && availableLocalities.length === 0)) && (
                  <div className="custom-village-input-wrap">
                    <input
                      type="text"
                      name="customVillage"
                      id="custom-village-input"
                      value={customVillage}
                      onChange={handleCustomVillageInput}
                      placeholder={t('cropRec.customVillagePlaceholder', 'Enter your revenue village or local settlement name')}
                      className={`field-input ${errors.village ? 'has-error' : ''}`}
                      maxLength={150}
                    />
                  </div>
                )}
                {errors.village && <span className="field-error-text">{errors.village}</span>}
              </div>

              {/* Data Provenance & Limitation Notice */}
              <div className="location-meta-note">
                <span className="location-meta-note-icon">ℹ️</span>
                <div>
                  <strong>{t('cropRec.postalScopeTitle', 'Postal & Administrative Scope:')}</strong> {t('cropRec.postalScopeNote', `Postal data is sourced from ${POSTAL_SOURCE_INFO.sourceName}; administrative divisions from ${LOCATION_SOURCE_INFO.sourceName}. Note that a postal PIN code represents a postal delivery area and does not verify exact farm plot boundaries or individual soil chemistry. ICAR agronomic suitability scores are calculated from your soil type, pH, water, rainfall, and season conditions.`)}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B — SOIL INFORMATION */}
          <div className="form-section">
            <div className="section-title-wrapper">
              <span className="section-icon">🪨</span>
              <h3 className="section-h3">{t('cropRec.sectionB', 'Section B — Soil Information')}</h3>
            </div>

            <div className="form-grid-2">
              {/* Soil Type */}
              <div className="form-control-group">
                <label className="field-label">{t('cropRec.soilTypeLabel', 'Soil Type')} <span className="required-star">*</span></label>
                <select
                  name="soilType"
                  value={formData.soilType}
                  onChange={handleChange}
                  className={`field-select ${errors.soilType ? 'has-error' : ''}`}
                >
                  <option value="">{t('cropRec.selectSoilType', 'Select Soil Type')}</option>
                  {SOIL_TYPE_OPTIONS.map((st) => (
                    <option key={st.value} value={st.value}>{t(st.key, st.defaultLabel)}</option>
                  ))}
                </select>
                <p className="field-explanation">{t('cropRec.soilTypeExplanation', 'Soil type affects water retention, drainage and root development.')}</p>
                {errors.soilType && <span className="field-error-text">{errors.soilType}</span>}
              </div>

              {/* Soil pH */}
              <div className="form-control-group">
                <label className="field-label">{t('cropRec.soilPhLabel', 'Soil pH (4.0 – 9.5)')}</label>
                <input
                  type="number"
                  step="0.1"
                  min="4.0"
                  max="9.5"
                  name="soilPh"
                  value={formData.soilPh}
                  onChange={handleChange}
                  placeholder={t('cropRec.soilPhPlaceholder', 'e.g. 6.5')}
                  disabled={formData.soilPhUnknown}
                  className={`field-input ${errors.soilPh ? 'has-error' : ''}`}
                />
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    name="soilPhUnknown"
                    checked={formData.soilPhUnknown}
                    onChange={handleChange}
                  />
                  {t('cropRec.soilPhUnknown', "I don't know my soil pH")}
                </label>
                <p className="field-explanation">{t('cropRec.soilPhExplanation', 'Soil pH indicates whether soil is acidic, neutral, or alkaline.')}</p>
                {errors.soilPh && <span className="field-error-text">{errors.soilPh}</span>}
              </div>
            </div>
          </div>

          {/* SECTION C — WATER & IRRIGATION */}
          <div className="form-section">
            <div className="section-title-wrapper">
              <span className="section-icon">💧</span>
              <h3 className="section-h3">{t('cropRec.sectionC', 'Section C — Water & Irrigation')}</h3>
            </div>

            <div className="form-grid-2">
              {/* Water Availability */}
              <div className="form-control-group">
                <label className="field-label">{t('cropRec.waterAvailabilityLabel', 'Water Availability')} <span className="required-star">*</span></label>
                <select
                  name="waterAvailability"
                  value={formData.waterAvailability}
                  onChange={handleChange}
                  className={`field-select ${errors.waterAvailability ? 'has-error' : ''}`}
                >
                  <option value="">{t('cropRec.selectWaterAvailability', 'Select Availability')}</option>
                  {WATER_AVAILABILITY_OPTIONS.map((w) => (
                    <option key={w.value} value={w.value}>{t(w.key, w.defaultLabel)}</option>
                  ))}
                </select>
                <p className="field-explanation">{t('cropRec.waterExplanation', 'Consider reliable water supply throughout the growing period.')}</p>
                {errors.waterAvailability && <span className="field-error-text">{errors.waterAvailability}</span>}
              </div>

              {/* Irrigation Available */}
              <div className="form-control-group">
                <label className="field-label">{t('cropRec.irrigationLabel', 'Irrigation Available?')} <span className="required-star">*</span></label>
                <select
                  name="irrigation"
                  value={formData.irrigation}
                  onChange={handleChange}
                  className={`field-select ${errors.irrigation ? 'has-error' : ''}`}
                >
                  <option value="">{t('cropRec.selectIrrigation', 'Select Irrigation Status')}</option>
                  {IRRIGATION_OPTIONS_LIST.map((i) => (
                    <option key={i.value} value={i.value}>{t(i.key, i.defaultLabel)}</option>
                  ))}
                </select>
                {errors.irrigation && <span className="field-error-text">{errors.irrigation}</span>}
              </div>
            </div>
          </div>

          {/* SECTION D — CLIMATE & RAINFALL */}
          <div className="form-section">
            <div className="section-title-wrapper">
              <span className="section-icon">🌦️</span>
              <h3 className="section-h3">{t('cropRec.sectionD', 'Section D — Climate & Season')}</h3>
            </div>

            <div className="form-grid-3">
              {/* Expected Rainfall */}
              <div className="form-control-group">
                <label className="field-label">{t('cropRec.rainfallLabel', 'Expected Rainfall')} <span className="required-star">*</span></label>
                <select
                  name="expectedRainfall"
                  value={formData.expectedRainfall}
                  onChange={handleChange}
                  className={`field-select ${errors.expectedRainfall ? 'has-error' : ''}`}
                >
                  <option value="">{t('cropRec.selectRainfall', 'Select Expected Rainfall')}</option>
                  {RAINFALL_OPTIONS_LIST.map((r) => (
                    <option key={r.value} value={r.value}>{t(r.key, r.defaultLabel)}</option>
                  ))}
                </select>
                <p className="field-explanation">{t('cropRec.rainfallExplanation', 'Choose expected rainfall level during your target crop season.')}</p>
                {errors.expectedRainfall && <span className="field-error-text">{errors.expectedRainfall}</span>}
              </div>

              {/* Season */}
              <div className="form-control-group">
                <label className="field-label">{t('cropRec.seasonLabel', 'Target Season')} <span className="required-star">*</span></label>
                <select
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  className={`field-select ${errors.season ? 'has-error' : ''}`}
                >
                  <option value="">{t('cropRec.selectSeason', 'Select Season')}</option>
                  {SEASON_OPTIONS_LIST.map((s) => (
                    <option key={s.value} value={s.value}>{t(s.key, s.defaultLabel)}</option>
                  ))}
                </select>
                {errors.season && <span className="field-error-text">{errors.season}</span>}
              </div>

              {/* Temperature Range */}
              <div className="form-control-group">
                <label className="field-label">{t('cropRec.tempLabel', 'Temperature Range')}</label>
                <select
                  name="temperatureRange"
                  value={formData.temperatureRange}
                  onChange={handleChange}
                  className="field-select"
                >
                  <option value="">{t('cropRec.selectTemp', 'Select Temperature')}</option>
                  {TEMP_OPTIONS_LIST.map((tmp) => (
                    <option key={tmp.value} value={tmp.value}>{t(tmp.key, tmp.defaultLabel)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION E — FARM SIZE */}
          <div className="form-section">
            <div className="section-title-wrapper">
              <span className="section-icon">📐</span>
              <h3 className="section-h3">{t('cropRec.sectionE', 'Section E — Land Details')}</h3>
            </div>

            <div className="form-grid-2">
              <div className="form-control-group">
                <label className="field-label">{t('cropRec.farmSizeLabel', 'Farm Size (in Acres)')} <span className="required-star">*</span></label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  name="farmSize"
                  value={formData.farmSize}
                  onChange={handleChange}
                  placeholder={t('cropRec.farmSizePlaceholder', 'e.g. 2.5')}
                  className={`field-input ${errors.farmSize ? 'has-error' : ''}`}
                />
                <p className="field-explanation">{t('cropRec.farmSizeExplanation', 'Farm size helps calculate scale and land allocation.')}</p>
                {errors.farmSize && <span className="field-error-text">{errors.farmSize}</span>}
              </div>
            </div>
          </div>

          {/* SECTION F — FARMER PRIORITIES */}
          <div className="form-section">
            <div className="section-title-wrapper">
              <span className="section-icon">🎯</span>
              <h3 className="section-h3">{t('cropRec.sectionF', 'Section F — What matters most to you?')}</h3>
            </div>
            <p className="field-explanation">{t('cropRec.prioritiesExplanation', 'Select one or more priorities to tailor your decision criteria.')}</p>

            <div className="priorities-grid">
              {FARMER_PRIORITIES.map((p) => {
                const isSelected = formData.priorities.includes(p.label)
                return (
                  <div
                    key={p.id}
                    className={`priority-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handlePriorityToggle(p.label)}
                  >
                    <span className="priority-icon">{p.icon}</span>
                    <span>{t(p.key, p.label)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* TRUST & RISK NOTICE CARD */}
          <div className="trust-info-card">
            <div className="trust-info-icon">🛡️</div>
            <div>
              <h4 className="trust-info-title">{t('cropRec.trustTitle', 'Before you decide')}</h4>
              <ul className="trust-info-list">
                <li>{t('cropRec.trustPoint1', 'Crop suitability depends on multiple factors including soil, climate, and water.')}</li>
                <li>{t('cropRec.trustPoint2', 'Weather and market conditions can change dynamically.')}</li>
                <li>{t('cropRec.trustPoint3', 'Recommendations are decision support, not guarantees of profit or yield.')}</li>
                <li>{t('cropRec.trustPoint4', 'Consult a local agricultural expert for high-risk seasonal decisions.')}</li>
              </ul>
            </div>
          </div>

          {/* SUBMIT BUTTON & NOTICE */}
          <div className="form-submit-wrapper">
            <button type="submit" className="submit-farm-btn" disabled={loading}>
              {loading ? t('cropRec.submittingBtn', '⏳ Submitting...') : t('cropRec.submitBtn', '🌱 Analyze My Farm')}
            </button>

            {successMessage && (
              <div className="notice-dev-banner" style={{ background: '#eafaf1', borderColor: '#a3e4d7', color: '#196f3d' }}>
                <span>✅</span>
                <span>{successMessage}</span>
              </div>
            )}

            {apiError && (
              <div className="notice-dev-banner" style={{ background: '#fdedec', borderColor: '#f5b7b1', color: '#922b21' }}>
                <span>⚠️</span>
                <span>{apiError}</span>
              </div>
            )}
          </div>
        </form>

        {/* ASSESSMENT HISTORY SECTION */}
        <div className="history-section-card">
          <div className="history-header">
            <div>
              <h3 className="history-title">{t('cropRec.historyTitle', '📜 Assessment History')}</h3>
              <p className="history-sub">{t('cropRec.historySubtitle', 'Your previously submitted crop recommendation requests')}</p>
            </div>
            <button className="back-dash-btn" onClick={() => fetchHistory(historyPage)} disabled={historyLoading}>
              {t('cropRec.historyRefresh', '🔄 Refresh')}
            </button>
          </div>

          {historyLoading ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#647067' }}>
              <span>{t('cropRec.historyLoading', '⏳ Loading assessment history...')}</span>
            </div>
          ) : historyError ? (
            <div className="notice-dev-banner" style={{ background: '#fdedec', borderColor: '#f5b7b1', color: '#922b21' }}>
              <span>⚠️</span>
              <span>{historyError}</span>
            </div>
          ) : !historyData || !historyData.content || historyData.content.length === 0 ? (
            <div className="empty-results-card" style={{ padding: '32px' }}>
              <div className="empty-results-icon">🌾</div>
              <h4 className="empty-results-title">{t('cropRec.historyEmptyTitle', 'No crop assessments yet')}</h4>
              <p className="empty-results-sub">{t('cropRec.historyEmptySubtitle', 'Submit your first assessment form above to begin building your farm decision history.')}</p>
            </div>
          ) : (
            <>
              <div className="history-list">
                {historyData.content.map((item) => (
                  <div key={item.id} className="history-item-card">
                    <div className="history-item-top">
                      <div className="history-location">
                        📍 {item.village ? `${item.village}, ` : ''}{item.district}, {item.state}{item.pincode ? ` (PIN: ${item.pincode})` : ''}
                      </div>
                      <span className="history-status-badge">
                        ⏳ {item.status || 'PENDING'}
                      </span>
                    </div>

                    <div className="history-details-grid">
                      <div className="history-detail-cell">
                        <span className="history-detail-label">{t('cropRec.historySoilPh', 'Soil & pH')}</span>
                        <span className="history-detail-val">
                          {item.soilType} {item.soilPhUnknown ? '(pH Unknown)' : `(pH ${item.soilPh})`}
                        </span>
                      </div>
                      <div className="history-detail-cell">
                        <span className="history-detail-label">{t('cropRec.historySeason', 'Season')}</span>
                        <span className="history-detail-val">{item.season}</span>
                      </div>
                      <div className="history-detail-cell">
                        <span className="history-detail-label">{t('cropRec.historyWaterIrrigation', 'Water & Irrigation')}</span>
                        <span className="history-detail-val">{item.waterAvailability} • Irrigation: {item.irrigation}</span>
                      </div>
                      <div className="history-detail-cell">
                        <span className="history-detail-label">{t('cropRec.historyFarmSize', 'Farm Size')}</span>
                        <span className="history-detail-val">{item.farmSize} {t('cropRec.historyAcres', 'Acres')}</span>
                      </div>
                    </div>

                    <div className="history-item-footer">
                      <div className="history-priorities-tags">
                        {item.priorities && item.priorities.length > 0 ? (
                          item.priorities.map((p, idx) => (
                            <span key={idx} className="history-priority-tag">🎯 {p}</span>
                          ))
                        ) : (
                          <span style={{ fontSize: '11px', color: '#999' }}>{t('cropRec.historyNoPriorities', 'No priorities selected')}</span>
                        )}
                      </div>
                      <div className="history-item-actions">
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          {t('cropRec.historySubmittedOn', 'Submitted on')} {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}
                        </span>
                        <Link
                          to={`/farmer/crop-recommendation/results/${item.id}`}
                          className="history-view-results-btn"
                        >
                          {t('cropRec.historyViewResults', 'View Recommendations →')}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION CONTROLS */}
              <div className="history-pagination">
                <button
                  className="pagination-btn"
                  onClick={() => fetchHistory(historyPage - 1)}
                  disabled={historyData.first || historyLoading}
                >
                  {t('cropRec.historyPrev', '← Previous')}
                </button>
                <span className="pagination-info">
                  {t('cropRec.historyPageInfo', 'Page {page} of {total} (Total: {elements})')
                    .replace('{page}', historyData.page + 1)
                    .replace('{total}', historyData.totalPages || 1)
                    .replace('{elements}', historyData.totalElements)}
                </span>
                <button
                  className="pagination-btn"
                  onClick={() => fetchHistory(historyPage + 1)}
                  disabled={historyData.last || historyLoading}
                >
                  {t('cropRec.historyNext', 'Next →')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CropRecommendationPage
