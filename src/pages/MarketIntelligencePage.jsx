import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useLanguage } from '../context/LanguageContext'
import LanguageSelector from '../components/LanguageSelector'
import './MarketIntelligence.css'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
]

const DEFAULT_CROPS = [
  'Rice', 'Wheat', 'Maize', 'Cotton', 'Chickpea', 'Pigeon Pea', 'Groundnut'
]

function MarketIntelligencePage() {
  const { t } = useLanguage()

  const [selectedCrop, setSelectedCrop] = useState('Rice')
  const [selectedState, setSelectedState] = useState('Andhra Pradesh')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedMarket, setSelectedMarket] = useState('')

  const [supportedCrops, setSupportedCrops] = useState(DEFAULT_CROPS)
  const [marketData, setMarketData] = useState(null)
  const [comparisonData, setComparisonData] = useState(null)
  const [trendData, setTrendData] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('prices') // 'prices', 'compare', 'trends'

  const getCropDisplayName = (cropName) => {
    if (!cropName) return ''
    return t(`crops.${cropName}`, cropName)
  }

  useEffect(() => {
    api.get('/farmer/market/crops')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setSupportedCrops(res.data)
        }
      })
      .catch((err) => {
        console.warn('Failed to load crop list, using default crop list:', err)
      })

    fetchMarketOverview('Rice', 'Andhra Pradesh', '', '')
  }, [])

  const fetchMarketOverview = (crop, state, district, market) => {
    setLoading(true)
    setError('')

    const params = new URLSearchParams()
    if (crop) params.append('crop', crop)
    if (state) params.append('state', state)
    if (district) params.append('district', district)
    if (market) params.append('market', market)

    const pricesPromise = api.get(`/farmer/market/prices?${params.toString()}`)
    const comparePromise = api.get(`/farmer/market/compare?crop=${crop}&state=${state || 'Andhra Pradesh'}`)
    const trendsPromise = api.get(`/farmer/market/trends?crop=${crop}&market=${market || ''}`)

    Promise.all([pricesPromise, comparePromise, trendsPromise])
      .then(([pricesRes, compareRes, trendsRes]) => {
        setMarketData(pricesRes.data)
        setComparisonData(compareRes.data)
        setTrendData(trendsRes.data)
      })
      .catch((err) => {
        const msg = err.response?.data?.message || t('market.errRetrieve', 'Unable to load market price intelligence. Please try again.')
        setError(msg)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchMarketOverview(selectedCrop, selectedState, selectedDistrict, selectedMarket)
  }

  const handleResetFilters = () => {
    setSelectedCrop('Rice')
    setSelectedState('Andhra Pradesh')
    setSelectedDistrict('')
    setSelectedMarket('')
    fetchMarketOverview('Rice', 'Andhra Pradesh', '', '')
  }

  const getFreshnessBadge = (status) => {
    if (status === 'LIVE') {
      return <span className="freshness-tag live">{t('market.tagLiveAgmarknet', '🟢 Live AGMARKNET')}</span>
    }
    return <span className="freshness-tag benchmark">{t('market.tagMandiBenchmark', '🏛️ Mandi Benchmark')}</span>
  }

  return (
    <div className="market-page-container">
      {/* Navigation */}
      <nav className="market-nav">
        <Link to="/farmer/dashboard" className="market-logo">
          <span className="logo-icon">📈</span>
          <span>{t('market.logoTitle', 'KisanMitra AI — Market Intelligence')}</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LanguageSelector id="market-language-select" />
          <Link to="/farmer/dashboard" className="back-link">
            {t('market.backToDashboard', '← Back to Dashboard')}
          </Link>
        </div>
      </nav>

      <main className="market-content">
        {/* Hero Section */}
        <section className="market-hero">
          <div className="hero-badge">
            <span>{t('market.badgeAgmarknet', '🏛️ AGMARKNET Mandi Price Intelligence')}</span>
          </div>
          <h1>{t('market.heroTitle', 'Market Intelligence & Mandi Prices')}</h1>
          <p className="hero-subtitle">
            {t('market.heroSubtitle', 'Explore reported agricultural mandi commodity prices, compare prices across nearby markets, and review dated price trends.')}
          </p>
          <div className="hero-disclaimer">
            <span className="disclaimer-icon">⚠️</span>
            <span>
              {t('market.heroDisclaimer', 'Market prices are dated mandi trading observations reported by official agricultural channels. They are decision-support indicators and do not constitute price predictions, guaranteed buyers, or profit commitments.')}
            </span>
          </div>
        </section>

        {/* Filter Controls Card */}
        <section className="market-card filter-card">
          <h2 className="card-title">
            <span>{t('market.filterTitle', '🔍 Filter Mandi Prices')}</span>
          </h2>
          <form onSubmit={handleSearchSubmit} className="filter-form">
            <div className="form-group">
              <label>{t('market.cropLabel', 'Crop / Commodity')}</label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="market-select"
              >
                {supportedCrops.map((c) => (
                  <option key={c} value={c}>{getCropDisplayName(c)}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t('market.stateLabel', 'State')}</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="market-select"
              >
                <option value="">{t('market.allStatesOption', 'All States')}</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t('market.districtLabel', 'District (Optional)')}</label>
              <input
                type="text"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                placeholder={t('market.districtPlaceholder', 'e.g. Guntur')}
                className="market-input"
              />
            </div>

            <div className="form-group">
              <label>{t('market.marketNameLabel', 'Mandi Market Name (Optional)')}</label>
              <input
                type="text"
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                placeholder={t('market.marketNamePlaceholder', 'e.g. Guntur Mandi')}
                className="market-input"
              />
            </div>

            <div className="filter-actions-row">
              <button type="submit" disabled={loading} className="btn-search-market">
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>{t('market.btnSearching', 'Searching...')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('market.btnSearch', '🔎 Search Prices')}</span>
                  </>
                )}
              </button>

              <button type="button" onClick={handleResetFilters} className="btn-reset-filters">
                {t('market.btnReset', '🔄 Reset')}
              </button>
            </div>
          </form>
        </section>

        {/* Error Alert */}
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => fetchMarketOverview(selectedCrop, selectedState, selectedDistrict, selectedMarket)} className="btn-retry">{t('market.btnRetry', 'Retry')}</button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !marketData && (
          <div className="market-loading-skeleton">
            <div className="skeleton-box skel-large"></div>
          </div>
        )}

        {/* Main Content Sections */}
        {marketData && (
          <>
            {/* Tab Navigation */}
            <div className="market-tabs-bar">
              <button
                className={`tab-btn ${activeTab === 'prices' ? 'active' : ''}`}
                onClick={() => setActiveTab('prices')}
              >
                {t('market.tabPrices', '📊 Mandi Price Results ({count})').replace('{count}', marketData.totalRecords || 0)}
              </button>

              <button
                className={`tab-btn ${activeTab === 'compare' ? 'active' : ''}`}
                onClick={() => setActiveTab('compare')}
              >
                {t('market.tabCompare', '⚖️ Regional Market Comparison')}
              </button>

              <button
                className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
                onClick={() => setActiveTab('trends')}
              >
                {t('market.tabTrends', '📈 Dated Price History')}
              </button>
            </div>

            {/* TAB 1: Mandi Price Results */}
            {activeTab === 'prices' && (
              <section className="market-card">
                <div className="section-header-row">
                  <div>
                    <h2 className="card-title">
                      <span>{t('market.pricesSectionTitle', '🌽 Reported Mandi Prices — {crop}').replace('{crop}', getCropDisplayName(marketData.selectedCrop))}</span>
                    </h2>
                    <p className="card-desc">
                      {t('market.pricesSectionDesc', 'Official mandi arrival records showing minimum, maximum, and modal wholesale prices in ₹/quintal.')}
                    </p>
                  </div>
                </div>

                {marketData.observations && marketData.observations.length > 0 ? (
                  <div className="table-responsive">
                    <table className="market-table">
                      <thead>
                        <tr>
                          <th>{t('market.thCrop', 'Crop')}</th>
                          <th>{t('market.thMarket', 'Market / Mandi')}</th>
                          <th>{t('market.thDistrictState', 'District & State')}</th>
                          <th>{t('market.thVariety', 'Variety')}</th>
                          <th>{t('market.thArrivalDate', 'Arrival Date')}</th>
                          <th>{t('market.thMinPrice', 'Min Price')}</th>
                          <th>{t('market.thMaxPrice', 'Max Price')}</th>
                          <th>{t('market.thModalPrice', 'Modal Price')}</th>
                          <th>{t('market.thFreshness', 'Freshness')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marketData.observations.map((obs) => (
                          <tr key={obs.id}>
                            <td className="crop-cell">{getCropDisplayName(obs.cropName)}</td>
                            <td className="market-cell">{obs.marketName}</td>
                            <td>{obs.district}, {obs.state}</td>
                            <td>{obs.variety || 'FAQ'}</td>
                            <td className="date-cell">{obs.observationDate}</td>
                            <td>₹{obs.minPrice?.toLocaleString() || '--'}</td>
                            <td>₹{obs.maxPrice?.toLocaleString() || '--'}</td>
                            <td className="modal-price-cell">
                              ₹{obs.modalPrice?.toLocaleString()} <span className="unit-sub">{t('market.perQuintal', '/quintal')}</span>
                            </td>
                            <td>{getFreshnessBadge(obs.freshnessStatus)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-market-state">
                    <span className="empty-icon">📂</span>
                    <h3>{t('market.emptyObsTitle', 'No Matching Mandi Observations')}</h3>
                    <p>{t('market.emptyObsDesc', 'No verified market records match your current filters ({crop}, {state}). Try broadening your search.').replace('{crop}', getCropDisplayName(selectedCrop)).replace('{state}', selectedState || t('market.allStatesOption', 'All States'))}</p>
                  </div>
                )}
              </section>
            )}

            {/* TAB 2: Regional Market Comparison */}
            {activeTab === 'compare' && comparisonData && (
              <section className="market-card">
                <h2 className="card-title">
                  <span>{t('market.compareTitle', '⚖️ Mandi Market Price Comparison')}</span>
                </h2>
                <p className="card-desc">
                  {comparisonData.summaryExplanation}
                </p>

                {comparisonData.comparisonItems && comparisonData.comparisonItems.length > 0 ? (
                  <div className="comparison-cards-grid">
                    {comparisonData.comparisonItems.map((item, idx) => (
                      <div
                        key={idx}
                        className={`compare-mandi-card ${item.isHighestPrice ? 'highest-price' : ''} ${item.isLowestPrice ? 'lowest-price' : ''}`}
                      >
                        <div className="mandi-header">
                          <span className="m-name">{item.marketName}</span>
                          {item.isHighestPrice && <span className="tag-price high">{t('market.tagPeakPrice', 'Peak Price')}</span>}
                          {item.isLowestPrice && <span className="tag-price low">{t('market.tagLowestPrice', 'Lowest Price')}</span>}
                        </div>

                        <div className="mandi-location">{item.district}, {item.state}</div>

                        <div className="mandi-modal-price">
                          <span className="p-num">₹{item.modalPrice?.toLocaleString()}</span>
                          <span className="p-unit">{t('market.perQuintal', '/quintal')}</span>
                        </div>

                        <div className="mandi-diff-row">
                          <span className="diff-label">{t('market.diffVsAverage', 'Diff vs Average (₹{avg}):').replace('{avg}', comparisonData.averageModalPrice?.toLocaleString())}</span>
                          <span className={`diff-val ${item.priceDifference >= 0 ? 'pos' : 'neg'}`}>
                            {item.priceDifference >= 0 ? `+₹${item.priceDifference}` : `-₹${Math.abs(item.priceDifference)}`} {t('market.perQuintal', '/quintal')}
                          </span>
                        </div>

                        <div className="mandi-footer">
                          <span>{t('market.dateLabel', 'Date: {date}').replace('{date}', item.observationDate)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-market-state">
                    <p>{t('market.emptyCompare', 'No comparable market price records found for comparison.')}</p>
                  </div>
                )}

                <div className="transport-warning-box">
                  <span className="warn-icon">💡</span>
                  <span>
                    <strong>{t('market.transportWarningBold', 'Market Choice Awareness:')}</strong> {t('market.transportWarningText', 'Selling at a market with the highest modal price does not guarantee highest net profit. Always calculate transportation expenses, APMC fees, loading charges, and produce quality grading prior to transit.')}
                  </span>
                </div>
              </section>
            )}

            {/* TAB 3: Dated Price History */}
            {activeTab === 'trends' && trendData && (
              <section className="market-card">
                <h2 className="card-title">
                  <span>{t('market.trendsTitle', '📈 Dated Mandi Price History — {crop}').replace('{crop}', getCropDisplayName(trendData.cropName))}</span>
                </h2>
                <p className="card-desc">
                  {trendData.explanation}
                </p>

                {trendData.trendPoints && trendData.trendPoints.length > 0 ? (
                  <div className="trend-points-grid">
                    {trendData.trendPoints.map((tp, idx) => (
                      <div key={idx} className="trend-point-card">
                        <div className="tp-date">{tp.date}</div>
                        <div className="tp-market">{tp.marketName}</div>
                        <div className="tp-price">₹{tp.modalPrice?.toLocaleString()}</div>
                        <div className="tp-unit">{tp.unit}</div>
                        <div className="tp-range">
                          {t('market.rangeLabel', 'Min: ₹{min} | Max: ₹{max}').replace('{min}', tp.minPrice).replace('{max}', tp.maxPrice)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-market-state">
                    <p>{t('market.emptyTrends', 'Insufficient dated historical observations to display price history for this market.')}</p>
                  </div>
                )}

                <div className="trend-note-box">
                  <span>ℹ️ <strong>{t('market.trendNoteBold', 'Note on History:')}</strong> {t('market.trendNoteText', 'Displayed trend points represent actual dated historical observations recorded by official mandis. They reflect past prices and do not forecast future market prices.')}</span>
                </div>
              </section>
            )}

            {/* Farmer Operational Considerations */}
            {marketData.considerations && marketData.considerations.length > 0 && (
              <section className="market-card">
                <h2 className="card-title">
                  <span>{t('market.considerationsTitle', '🌾 Operational Market Considerations')}</span>
                </h2>
                <p className="card-desc">
                  {t('market.considerationsDesc', 'Practical guidelines to review before choosing a target mandi market for your produce.')}
                </p>

                <div className="considerations-grid">
                  {marketData.considerations.map((c, idx) => (
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

            {/* Source Attribution Footer */}
            <div className="market-source-attribution">
              <span>{marketData.sourceAttribution}</span>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default MarketIntelligencePage
