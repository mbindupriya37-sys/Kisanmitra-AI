import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useLanguage } from '../context/LanguageContext'
import LanguageSelector from '../components/LanguageSelector'
import './WeatherClimate.css'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
]

const SAMPLE_CROPS = [
  { id: 1, name: 'Rice' },
  { id: 2, name: 'Wheat' },
  { id: 3, name: 'Maize' },
  { id: 4, name: 'Cotton' },
  { id: 5, name: 'Chickpea' },
  { id: 6, name: 'Pigeon Pea' },
  { id: 7, name: 'Groundnut' }
]

function WeatherClimatePage() {
  const { t } = useLanguage()

  const [selectedState, setSelectedState] = useState('Andhra Pradesh')
  const [selectedDistrict, setSelectedDistrict] = useState('Guntur')
  const [selectedCropId, setSelectedCropId] = useState('')

  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastRefreshed, setLastRefreshed] = useState(null)

  const getCropDisplayName = (cropName) => {
    if (!cropName) return ''
    return t(`crops.${cropName}`, cropName)
  }

  const fetchWeather = (state = selectedState, district = selectedDistrict, cropId = selectedCropId) => {
    if (!state || !district) return
    setLoading(true)
    setError('')

    const params = new URLSearchParams()
    if (state) params.append('state', state)
    if (district) params.append('district', district)
    if (cropId) params.append('cropId', cropId)

    api.get(`/farmer/weather/current?${params.toString()}`)
      .then((res) => {
        setWeatherData(res.data)
        setLastRefreshed(new Date().toLocaleTimeString())
      })
      .catch((err) => {
        const msg = err.response?.data?.message || t('weather.errRetrieve', 'Unable to retrieve weather insights. Please try again.')
        setError(msg)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchWeather('Andhra Pradesh', 'Guntur', '')
  }, [])

  const handleFormSubmit = (e) => {
    e.preventDefault()
    fetchWeather(selectedState, selectedDistrict, selectedCropId)
  }

  const handleCropChange = (e) => {
    const val = e.target.value
    setSelectedCropId(val)
    fetchWeather(selectedState, selectedDistrict, val)
  }

  const getWeatherIcon = (code) => {
    if (code === 0) return '☀️'
    if (code === 1 || code === 2) return '⛅'
    if (code === 3) return '☁️'
    if (code >= 51 && code <= 65) return '🌧️'
    if (code >= 80 && code <= 82) return '🌦️'
    if (code >= 95) return '⛈️'
    return '🌤️'
  }

  const getRiskBadgeClass = (level) => {
    switch (level) {
      case 'HIGH': return 'risk-badge high'
      case 'MODERATE': return 'risk-badge moderate'
      default: return 'risk-badge low'
    }
  }

  return (
    <div className="weather-page-container">
      {/* Top Header / Nav */}
      <nav className="weather-nav">
        <Link to="/farmer/dashboard" className="weather-logo">
          <span className="logo-icon">🌤️</span>
          <span>{t('weather.logoTitle', 'KisanMitra AI — Weather & Climate')}</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LanguageSelector id="weather-language-select" />
          <Link to="/farmer/dashboard" className="back-link">
            {t('weather.backToDashboard', '← Back to Dashboard')}
          </Link>
        </div>
      </nav>

      <main className="weather-content">
        {/* Hero Banner */}
        <section className="weather-hero">
          <div className="hero-badge">
            <span>{t('weather.badgeDecisionSupport', '🌦️ Decision-Support Module')}</span>
          </div>
          <h1>{t('weather.heroTitle', 'Weather & Climate Intelligence')}</h1>
          <p className="hero-subtitle">
            {t('weather.heroSubtitle', 'Understand upcoming weather conditions, rain, temperature thresholds, and farming considerations before planning field activities.')}
          </p>
          <div className="hero-disclaimer">
            <span className="disclaimer-icon">⚠️</span>
            <span>
              {t('weather.heroDisclaimer', 'Weather forecasts are estimates derived from numerical meteorological models and may change. Use them as general decision-support information, not guaranteed outcomes.')}
            </span>
          </div>
        </section>

        {/* Location Selector Card */}
        <section className="weather-card location-card">
          <h2 className="card-title">
            <span>{t('weather.locationCardTitle', '📍 Select Farming Location')}</span>
          </h2>
          <form onSubmit={handleFormSubmit} className="location-form">
            <div className="form-group">
              <label>{t('weather.stateLabel', 'State / Union Territory')}</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="weather-select"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t('weather.districtLabel', 'District')}</label>
              <input
                type="text"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                placeholder={t('weather.districtPlaceholder', 'Enter district (e.g. Guntur)')}
                className="weather-input"
                required
              />
            </div>

            <div className="form-group form-actions-inline">
              <button type="submit" disabled={loading} className="btn-get-weather">
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>{t('weather.btnChecking', 'Checking Weather...')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('weather.btnCheck', '🔍 Check Weather')}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Error Alert */}
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => fetchWeather()} className="btn-retry">{t('weather.btnRetry', 'Retry')}</button>
          </div>
        )}

        {/* Skeleton / Loading */}
        {loading && !weatherData && (
          <div className="weather-loading-skeleton">
            <div className="skeleton-box hero-skel"></div>
            <div className="skeleton-box cards-skel"></div>
          </div>
        )}

        {/* Main Weather Intelligence View */}
        {weatherData && (
          <>
            {/* Location & Refresh Bar */}
            <div className="weather-status-bar">
              <div className="status-location">
                <span className="loc-pin">📍</span>
                <span className="loc-text">{weatherData.location?.regionName}</span>
                {lastRefreshed && (
                  <span className="updated-badge">{t('weather.updatedAt', 'Updated at {time}').replace('{time}', lastRefreshed)}</span>
                )}
              </div>
              <button
                onClick={() => fetchWeather()}
                disabled={loading}
                className="btn-refresh-weather"
              >
                {t('weather.btnRefresh', '🔄 Refresh Weather')}
              </button>
            </div>

            {/* Current Weather Card */}
            {weatherData.current && (
              <section className="weather-card current-weather-card">
                <div className="current-header">
                  <span className="card-label">{t('weather.currentObsTitle', 'Current Observation')}</span>
                  <span className="obs-time">{weatherData.current.observationTime}</span>
                </div>

                <div className="current-main">
                  <div className="temp-block">
                    <span className="weather-icon-large">
                      {getWeatherIcon(weatherData.current.weatherCode)}
                    </span>
                    <div>
                      <div className="temp-val">{weatherData.current.temperature?.toFixed(1)}°C</div>
                      <div className="feels-like">{t('weather.feelsLike', 'Feels like {temp}°C').replace('{temp}', weatherData.current.feelsLike?.toFixed(1))}</div>
                    </div>
                  </div>

                  <div className="condition-tag">
                    {weatherData.current.weatherCondition}
                  </div>
                </div>

                <div className="current-metrics-grid">
                  <div className="metric-item">
                    <span className="m-icon">💧</span>
                    <div>
                      <div className="m-label">{t('weather.metricHumidity', 'Humidity')}</div>
                      <div className="m-val">{weatherData.current.humidity}%</div>
                    </div>
                  </div>

                  <div className="metric-item">
                    <span className="m-icon">🌧️</span>
                    <div>
                      <div className="m-label">{t('weather.metricPrecipitation', 'Precipitation')}</div>
                      <div className="m-val">{weatherData.current.rainfall} mm</div>
                    </div>
                  </div>

                  <div className="metric-item">
                    <span className="m-icon">💨</span>
                    <div>
                      <div className="m-label">{t('weather.metricWindSpeed', 'Wind Speed')}</div>
                      <div className="m-val">{weatherData.current.windSpeed} km/h</div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Weather Risk Indicators */}
            {weatherData.risks && weatherData.risks.length > 0 && (
              <section className="weather-card">
                <h2 className="card-title">
                  <span>{t('weather.risksTitle', '🛡️ Weather Risk Indicators')}</span>
                </h2>
                <p className="card-desc">
                  {t('weather.risksDesc', 'Deterministic weather warnings based on configured rainfall, thermal, and wind safety thresholds.')}
                </p>

                <div className="risks-grid">
                  {weatherData.risks.map((risk, idx) => (
                    <div key={idx} className="risk-item-card">
                      <div className="risk-card-top">
                        <span className="risk-title">{risk.title}</span>
                        <span className={getRiskBadgeClass(risk.level)}>{t(`riskLevels.${risk.level}`, risk.level)}</span>
                      </div>
                      <p className="risk-reason">{risk.reason}</p>
                      <span className="risk-timeframe">⏰ {risk.timeframe}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 7-Day Weather Outlook */}
            {weatherData.forecast && weatherData.forecast.length > 0 && (
              <section className="weather-card">
                <h2 className="card-title">
                  <span>{t('weather.forecastTitle', '📅 7-Day Weather Outlook')}</span>
                </h2>
                <p className="card-desc">
                  {t('weather.forecastDesc', 'Daily forecast summary for minimum/maximum temperature and precipitation probability.')}
                </p>

                <div className="forecast-grid">
                  {weatherData.forecast.map((f, idx) => (
                    <div key={idx} className="forecast-day-card">
                      <div className="f-day">{f.dayOfWeek}</div>
                      <div className="f-date">{f.date}</div>
                      <div className="f-icon">{getWeatherIcon(f.weatherCode)}</div>
                      <div className="f-condition">{f.weatherCondition}</div>

                      <div className="f-temp">
                        <span className="t-max">{f.maxTemperature != null ? Math.round(f.maxTemperature) : '--'}°</span>
                        <span className="t-sep">/</span>
                        <span className="t-min">{f.minTemperature != null ? Math.round(f.minTemperature) : '--'}°C</span>
                      </div>

                      {f.precipitationProbability != null && (
                        <div className="f-rain-prob">
                          💧 {f.precipitationProbability}%
                          {f.precipitationSum > 0 && <span> ({f.precipitationSum} mm)</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Farming Considerations */}
            {weatherData.considerations && weatherData.considerations.length > 0 && (
              <section className="weather-card">
                <h2 className="card-title">
                  <span>{t('weather.considerationsTitle', '🌾 Operational Farming Considerations')}</span>
                </h2>
                <p className="card-desc">
                  {t('weather.considerationsDesc', 'General operational insights derived from evaluated weather conditions.')}
                </p>

                <div className="considerations-grid">
                  {weatherData.considerations.map((c, idx) => (
                    <div key={idx} className="consideration-card">
                      <div className="c-header">
                        <span className="c-icon">{c.icon}</span>
                        <span className="c-title">{c.title}</span>
                      </div>
                      <p className="c-advice">{c.advice}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Optional Crop Weather Context */}
            <section className="weather-card crop-context-card">
              <div className="crop-context-header">
                <div>
                  <h2 className="card-title">{t('weather.cropContextTitle', '🌱 Crop Weather Compatibility Context')}</h2>
                  <p className="card-desc">{t('weather.cropContextDesc', 'Select a crop to evaluate current weather against verified requirements.')}</p>
                </div>
                <select
                  value={selectedCropId}
                  onChange={handleCropChange}
                  className="weather-select crop-select-inline"
                >
                  <option value="">{t('weather.selectCropPlaceholder', '-- Select Crop --')}</option>
                  {SAMPLE_CROPS.map((c) => (
                    <option key={c.id} value={c.id}>{getCropDisplayName(c.name)}</option>
                  ))}
                </select>
              </div>

              {weatherData.cropContext && (
                <div className="crop-context-content">
                  {weatherData.cropContext.available ? (
                    <div className="crop-context-box available">
                      <div className="ctx-status">
                        <span className="status-tag suitable">{weatherData.cropContext.compatibilityStatus}</span>
                        <span className="crop-heading">{t('weather.cropHeadingContext', '{cropName} Context').replace('{cropName}', getCropDisplayName(weatherData.cropContext.cropName))}</span>
                      </div>
                      <p className="ctx-summary">{weatherData.cropContext.summary}</p>
                      {weatherData.cropContext.details && (
                        <ul className="ctx-details">
                          {weatherData.cropContext.details.map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <div className="crop-context-box unavailable">
                      <span className="unavail-icon">ℹ️</span>
                      <span>{weatherData.cropContext.summary}</span>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Source Attribution Footer */}
            <div className="weather-source-attribution">
              <span>{weatherData.sourceAttribution}</span>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default WeatherClimatePage
