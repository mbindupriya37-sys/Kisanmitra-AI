import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import LanguageSelector from '../components/LanguageSelector'
import { getSupplyDemandOverview } from '../services/supplyDemandService'
import './CropSupplyDemand.css'

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
]

const CROPS = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Chickpea', 'Pigeon Pea', 'Groundnut']
const SEASONS = ['Kharif', 'Rabi', 'Zaid']

function CropSupplyDemandPage() {
  const { t } = useLanguage()
  const [filter, setFilter] = useState({
    state: 'Andhra Pradesh',
    district: 'Krishna',
    crop: 'Rice',
    season: 'Kharif',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [activeTab, setActiveTab] = useState('production')

  const fetchOverview = async (currentFilter) => {
    setLoading(true)
    setError('')
    try {
      const res = await getSupplyDemandOverview(
        currentFilter.crop,
        currentFilter.state,
        currentFilter.district,
        currentFilter.season
      )
      setData(res)
    } catch (err) {
      console.error('Failed to load supply-demand data:', err)
      setError(t('supplyDemand.alertMessage', 'Unable to load official supply-demand data. Please check network connectivity.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview(filter)
  }, [])

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    fetchOverview(filter)
  }

  return (
    <div className="supply-demand-page">
      {/* Top Banner Navigation */}
      <header className="supply-demand-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          <div className="header-breadcrumbs" style={{ marginBottom: 0 }}>
            <Link to="/farmer/dashboard" className="breadcrumb-link">{t('supplyDemand.backDashboard', '← Dashboard')}</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{t('supplyDemand.title', 'Crop Supply–Demand Intelligence')}</span>
          </div>
          <LanguageSelector id="supply-demand-language-select" />
        </div>
        <div className="header-title-row">
          <div>
            <div className="header-badges">
              <span className="badge badge-accent">{t('supplyDemand.badgeMacro', '🌐 MACRO DECISION INTELLIGENCE')}</span>
              <span className="badge badge-neutral">{t('supplyDemand.badgeOfficial', 'OFFICIAL SOURCES ONLY • ZERO FABRICATION')}</span>
            </div>
            <h1 className="header-title">{t('supplyDemand.title', 'Crop Supply–Demand Intelligence')}</h1>
            <p className="header-subtitle">
              {t('supplyDemand.subtitle', 'Verified historical production, statutory MSP gazettes, central pool buffer stocks, and procurement benchmarks')}
            </p>
          </div>
        </div>
      </header>

      {/* Filter Toolbar */}
      <div className="filter-card">
        <form onSubmit={handleFilterSubmit} className="filter-form">
          <div className="filter-group">
            <label htmlFor="state-select">{t('supplyDemand.filterState', 'State')}</label>
            <select
              id="state-select"
              value={filter.state}
              onChange={(e) => setFilter({ ...filter, state: e.target.value })}
            >
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="district-input">{t('supplyDemand.filterDistrict', 'District')}</label>
            <input
              id="district-input"
              type="text"
              value={filter.district}
              onChange={(e) => setFilter({ ...filter, district: e.target.value })}
              placeholder={t('supplyDemand.placeholderDistrict', 'Enter district name')}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="crop-select">{t('supplyDemand.filterCrop', 'Crop')}</label>
            <select
              id="crop-select"
              value={filter.crop}
              onChange={(e) => setFilter({ ...filter, crop: e.target.value })}
            >
              {CROPS.map((c) => (
                <option key={c} value={c}>{t(`crops.${c}`, c)}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="season-select">{t('supplyDemand.filterSeason', 'Season')}</label>
            <select
              id="season-select"
              value={filter.season}
              onChange={(e) => setFilter({ ...filter, season: e.target.value })}
            >
              {SEASONS.map((s) => (
                <option key={s} value={s}>{t(`seasons.${s.toUpperCase()}`, s)}</option>
              ))}
            </select>
          </div>

          <div className="filter-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t('supplyDemand.btnFetching', 'Fetching Official Data...') : t('supplyDemand.btnApplyFilters', 'Apply Filters')}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="alert-card alert-error">
          <span className="alert-icon">⚠️</span>
          <div>
            <h4>{t('supplyDemand.alertTitle', 'Data Fetch Notice')}</h4>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Summary KPI Ribbon */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">{t('supplyDemand.kpiProdLabel', '5-Yr Avg District Production')}</span>
          <div className="kpi-value">
            {data?.historicalProduction?.fiveYearAverageProductionTonnes
              ? `${Number(data.historicalProduction.fiveYearAverageProductionTonnes).toLocaleString()} MT`
              : t('supplyDemand.kpiProdNa', 'N/A (No Reports)')}
          </div>
          <span className="kpi-subtext">
            {data?.historicalProduction?.boundaryVintage || 'STANDARD_LGD_2024'}
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">{t('supplyDemand.kpiMspLabel', 'Statutory CCEA MSP Rate')}</span>
          <div className="kpi-value">
            {data?.mspNotification?.effectiveMspInrPerQuintal
              ? `₹${Number(data.mspNotification.effectiveMspInrPerQuintal).toLocaleString()} ${t('supplyDemand.perQuintal', '/q')}`
              : t('supplyDemand.kpiMspNotNotified', 'Not Notified')}
          </div>
          <span className={`kpi-badge ${data?.mspNotification?.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
            {data?.mspNotification?.status || 'UNAVAILABLE'}
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">{t('supplyDemand.kpiBufferLabel', 'Central Pool Actual Stock')}</span>
          <div className="kpi-value">
            {data?.bufferStocks?.actualCentralPoolLmt
              ? `${data.bufferStocks.actualCentralPoolLmt} ${t('supplyDemand.unitLmt', 'LMT')}`
              : t('supplyDemand.kpiBufferNa', 'N/A')}
          </div>
          <span className="kpi-subtext">
            {data?.bufferStocks?.comparisonStatus === 'PERIOD_MISMATCH_NO_COMPARISON'
              ? t('supplyDemand.offMilestoneNote', 'Off-Milestone (No Subtraction)')
              : (data?.bufferStocks?.totalBufferNormLmt ? `${t('supplyDemand.normLabel', 'Norm:')} ${data.bufferStocks.totalBufferNormLmt} ${t('supplyDemand.unitLmt', 'LMT')}` : t('supplyDemand.wheatRiceOnly', 'Wheat/Rice Only'))}
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">{t('supplyDemand.kpiMandiLabel', 'Mandi Price Feed')}</span>
          <div className="kpi-value">
            {data?.mandiPrices?.availabilityStatus === 'LIVE_CONFIRMED' && data?.mandiPrices?.observations?.length > 0
              ? `₹${data.mandiPrices.observations[0].modalPriceInrPerQuintal || '—'} ${t('supplyDemand.perQuintal', '/q')}`
              : t('supplyDemand.kpiMandiOffline', 'Offline / Unconfirmed')}
          </div>
          <span className={`kpi-badge ${data?.mandiPrices?.availabilityStatus === 'LIVE_CONFIRMED' ? 'badge-success' : 'badge-offline'}`}>
            {data?.mandiPrices?.availabilityStatus || 'UNCONFIRMED_OR_OFFLINE'}
          </span>
        </div>

        <div className="kpi-card kpi-card-demand">
          <span className="kpi-label">{t('supplyDemand.kpiDemandLabel', 'Regional Demand Balance')}</span>
          <div className="kpi-value kpi-demand-insufficient">{t('supplyDemand.kpiDemandInsufficient', 'INSUFFICIENT DATA')}</div>
          <span className="kpi-subtext">{t('supplyDemand.kpiDemandMethodology', 'Methodology: IN_DEMAND_V1 (Survey Based)')}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tabs-bar">
        <button
          className={`tab-btn ${activeTab === 'production' ? 'active' : ''}`}
          onClick={() => setActiveTab('production')}
        >
          {t('supplyDemand.tabProduction', '🌾 Historical Production (DES)')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'mandi' ? 'active' : ''}`}
          onClick={() => setActiveTab('mandi')}
        >
          {t('supplyDemand.tabMandi', '📈 Mandi Wholesale Prices')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'msp' ? 'active' : ''}`}
          onClick={() => setActiveTab('msp')}
        >
          {t('supplyDemand.tabMsp', '⚖️ MSP Gazette Notifications')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'buffer' ? 'active' : ''}`}
          onClick={() => setActiveTab('buffer')}
        >
          {t('supplyDemand.tabBuffer', '🏛️ Buffer Stocks & Procurement')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'demand' ? 'active' : ''}`}
          onClick={() => setActiveTab('demand')}
        >
          {t('supplyDemand.tabDemand', '🔍 Demand Balance Methodology')}
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="tab-content-area">
        {/* TAB 1: PRODUCTION */}
        {activeTab === 'production' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3>{t('supplyDemand.prodTitle', 'District-Level Historical Crop Production')}</h3>
                <p className="panel-desc">
                  {t('supplyDemand.prodDesc', 'Official historical data published by the Directorate of Economics and Statistics (DES), Ministry of Agriculture & Farmers Welfare.')}
                </p>
              </div>
              <span className="provenance-pill">
                {t('supplyDemand.sourcePrefix', 'Source:')} {data?.historicalProduction?.provenance?.sourceOrganization || 'DES_MoAFW'}
              </span>
            </div>

            {data?.historicalProduction?.boundaryNotice && (
              <div className="notice-banner">
                ℹ️ {data.historicalProduction.boundaryNotice}
              </div>
            )}

            {data?.historicalProduction?.observations?.length > 0 ? (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('supplyDemand.thYear', 'Year')}</th>
                      <th>{t('supplyDemand.thSeason', 'Season')}</th>
                      <th>{t('supplyDemand.thArea', 'Area (Ha)')}</th>
                      <th>{t('supplyDemand.thRawProduction', 'Raw Production')}</th>
                      <th>{t('supplyDemand.thRawUnit', 'Raw Unit')}</th>
                      <th>{t('supplyDemand.thConvertedTonnes', 'Converted Tonnes')}</th>
                      <th>{t('supplyDemand.thYield', 'Yield (kg/Ha)')}</th>
                      <th>{t('supplyDemand.thSourceRevision', 'Source Revision')}</th>
                      <th>{t('supplyDemand.thStatus', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.historicalProduction.observations.map((obs, idx) => (
                      <tr key={idx}>
                        <td>{obs.agriculturalYear}</td>
                        <td>{obs.season}</td>
                        <td>{obs.areaHectares ? Number(obs.areaHectares).toLocaleString() : '—'}</td>
                        <td>{obs.rawProductionValue ? Number(obs.rawProductionValue).toLocaleString() : 'NA'}</td>
                        <td><span className="unit-badge">{obs.rawUnit}</span></td>
                        <td>{obs.productionTonnes ? Number(obs.productionTonnes).toLocaleString() : '—'}</td>
                        <td>{obs.yieldKgPerHa ? Number(obs.yieldKgPerHa).toLocaleString() : '—'}</td>
                        <td><span className="revision-tag">{obs.sourceRevision}</span></td>
                        <td>
                          <span className={`status-pill status-${obs.dataStatus.toLowerCase()}`}>
                            {obs.dataStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>
                  {t('supplyDemand.emptyProdTitle', 'No verified production observations found for {crop} in {district}, {state}.')
                    .replace('{crop}', t(`crops.${filter.crop}`, filter.crop))
                    .replace('{district}', filter.district)
                    .replace('{state}', filter.state)}
                </p>
                <span className="empty-sub">{t('supplyDemand.emptyProdSub', 'Official data tables are maintained empty until verified datasets are approved for ingestion.')}</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MANDI PRICES */}
        {activeTab === 'mandi' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3>{t('supplyDemand.mandiTitle', 'Wholesale Mandi Prices (AGMARKNET)')}</h3>
                <p className="panel-desc">
                  {t('supplyDemand.mandiDesc', 'Source-backed daily wholesale price observations from agricultural produce market committees.')}
                </p>
              </div>
              <span className={`status-badge ${data?.mandiPrices?.availabilityStatus === 'LIVE_CONFIRMED' ? 'live' : 'offline'}`}>
                {t('supplyDemand.statusPrefix', 'Status:')} {data?.mandiPrices?.availabilityStatus || 'UNCONFIRMED_OR_OFFLINE'}
              </span>
            </div>

            <div className="disclaimer-callout">
              <strong>{t('supplyDemand.mandiDisclaimerLabel', 'Mandatory Source Limitation:')}</strong> {data?.mandiPrices?.disclaimer}
            </div>

            {data?.mandiPrices?.observations?.length > 0 ? (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('supplyDemand.thMarket', 'Mandi Market')}</th>
                      <th>{t('supplyDemand.thDistrict', 'District')}</th>
                      <th>{t('supplyDemand.thState', 'State')}</th>
                      <th>{t('supplyDemand.thVariety', 'Variety')}</th>
                      <th>{t('supplyDemand.thArrivalDate', 'Arrival Date')}</th>
                      <th>{t('supplyDemand.thMinPrice', 'Min Price (₹/q)')}</th>
                      <th>{t('supplyDemand.thMaxPrice', 'Max Price (₹/q)')}</th>
                      <th>{t('supplyDemand.thModalPrice', 'Modal Price (₹/q)')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.mandiPrices.observations.map((m, idx) => (
                      <tr key={idx}>
                        <td>{m.marketName}</td>
                        <td>{m.district}</td>
                        <td>{m.state}</td>
                        <td>{m.variety}</td>
                        <td>{m.arrivalDate || '—'}</td>
                        <td>{m.minPriceInrPerQuintal ? `₹${m.minPriceInrPerQuintal}` : '—'}</td>
                        <td>{m.maxPriceInrPerQuintal ? `₹${m.maxPriceInrPerQuintal}` : '—'}</td>
                        <td className="highlight-price">{m.modalPriceInrPerQuintal ? `₹${m.modalPriceInrPerQuintal}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>{t('supplyDemand.emptyMandiTitle', 'Live AGMARKNET provider is currently unconfirmed or offline from this environment.')}</p>
                <span className="empty-sub">{t('supplyDemand.emptyMandiSub', 'No synthetic or fabricated prices are substituted in KisanMitra AI.')}</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MSP NOTIFICATIONS */}
        {activeTab === 'msp' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3>{t('supplyDemand.mspTitle', 'Minimum Support Price (MSP) Gazette Notifications')}</h3>
                <p className="panel-desc">
                  {t('supplyDemand.mspDesc', 'Statutory price supports notified by the Cabinet Committee on Economic Affairs (CCEA), Government of India.')}
                </p>
              </div>
              <span className="provenance-pill">
                {t('supplyDemand.sourcePrefix', 'Source:')} {data?.mspNotification?.provenance?.sourceOrganization || 'CCEA_GOI'}
              </span>
            </div>

            {data?.mspNotification?.status === 'ACTIVE' ? (
              <div className="msp-details-card">
                <div className="msp-hero-row">
                  <div>
                    <span className="msp-commodity-title">{data.mspNotification.commodityName} ({data.mspNotification.commodityVariety})</span>
                    <span className="msp-season-tag">{t('supplyDemand.labelSeason', 'Season:')} {data.mspNotification.marketingSeasonType} {data.mspNotification.seasonYear}</span>
                  </div>
                  <div className="msp-rate-box">
                    <span className="msp-rate-label">{t('supplyDemand.mspEffectiveRateLabel', 'Effective MSP')}</span>
                    <span className="msp-rate-val">₹{Number(data.mspNotification.effectiveMspInrPerQuintal).toLocaleString()} {t('supplyDemand.perQuintal', '/q')}</span>
                  </div>
                </div>

                <div className="msp-cost-grid">
                  <div className="cost-item">
                    <span className="cost-label">{t('supplyDemand.mspBaseRate', 'Base MSP')}</span>
                    <span className="cost-val">₹{data.mspNotification.mspInrPerQuintal || '—'} {t('supplyDemand.perQuintal', '/q')}</span>
                  </div>
                  <div className="cost-item">
                    <span className="cost-label">{t('supplyDemand.mspBonus', 'Bonus Notified')}</span>
                    <span className="cost-val">₹{data.mspNotification.bonusInrPerQuintal || '0.00'} {t('supplyDemand.perQuintal', '/q')}</span>
                  </div>
                  <div className="cost-item">
                    <span className="cost-label">{t('supplyDemand.mspA2Fl', 'A2 + FL Cost (CACP)')}</span>
                    <span className="cost-val">₹{data.mspNotification.costA2FlInrPerQuintal || '—'} {t('supplyDemand.perQuintal', '/q')}</span>
                  </div>
                  <div className="cost-item">
                    <span className="cost-label">{t('supplyDemand.mspC2', 'Comprehensive Cost (C2)')}</span>
                    <span className="cost-val">₹{data.mspNotification.costC2InrPerQuintal || '—'} {t('supplyDemand.perQuintal', '/q')}</span>
                  </div>
                </div>

                <div className="msp-footer">
                  <span>{t('supplyDemand.mspGazetteRef', 'Gazette Reference:')} <strong>{data.mspNotification.gazetteNotificationRef}</strong></span>
                  <span>{t('supplyDemand.mspEffectiveDate', 'Effective Date:')} <strong>{data.mspNotification.effectiveDate}</strong></span>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>{t('supplyDemand.statusPrefix', 'Status:')} <strong>{data?.mspNotification?.status || 'MISSING_NOTIFICATION'}</strong></p>
                <p className="empty-sub">{data?.mspNotification?.statusExplanation || t('supplyDemand.emptyMspSub', 'No active MSP gazette record found for this season.')}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BUFFER STOCKS & PROCUREMENT */}
        {activeTab === 'buffer' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3>{t('supplyDemand.bufferTitle', 'Public Foodgrain Buffer Stocks & Central Pool Procurement')}</h3>
                <p className="panel-desc">
                  {t('supplyDemand.bufferDesc', 'Official stock positions and cumulative procurement figures maintained by Food Corporation of India (FCI) / DFPD.')}
                </p>
              </div>
              <span className="provenance-pill">{t('supplyDemand.bufferSource', 'Source: DFPD / FCI')}</span>
            </div>

            <div className="buffer-procurement-grid">
              {/* Buffer Stocks Block */}
              <div className="subpanel-card">
                <h4>{t('supplyDemand.bufferSubpanel1Title', 'Central Pool Foodgrain Stocks (LMT)')}</h4>
                {data?.bufferStocks?.commodity ? (
                  <div className="subpanel-body">
                    <div className="data-row">
                      <span>{t('supplyDemand.labelCommodity', 'Commodity:')}</span>
                      <strong>{data.bufferStocks.commodity}</strong>
                    </div>
                    <div className="data-row">
                      <span>{t('supplyDemand.labelObsDate', 'Stock Observation Date:')}</span>
                      <strong>{data.bufferStocks.observationDate || '—'}</strong>
                    </div>
                    <div className="data-row">
                      <span>{t('supplyDemand.labelActualStock', 'Actual Central Pool Stock:')}</span>
                      <strong className="text-primary">{data.bufferStocks.actualCentralPoolLmt} {t('supplyDemand.unitLmt', 'LMT')}</strong>
                    </div>
                    <div className="data-row">
                      <span>{t('supplyDemand.labelBufferNorm', 'Quarterly Buffer Norm:')}</span>
                      <strong>{data.bufferStocks.totalBufferNormLmt ? `${data.bufferStocks.totalBufferNormLmt} ${t('supplyDemand.unitLmt', 'LMT')}` : '—'}</strong>
                    </div>
                    <div className="data-row">
                      <span>{t('supplyDemand.labelMilestoneComp', 'Milestone Comparison:')}</span>
                      <span className={`status-pill status-${data.bufferStocks.comparisonStatus === 'EXACT_MILESTONE_MATCHED' ? 'verified' : 'stale'}`}>
                        {data.bufferStocks.comparisonStatus}
                      </span>
                    </div>

                    {data.bufferStocks.explanatoryNote && (
                      <p className="footnote-note">
                        ⚠️ {data.bufferStocks.explanatoryNote}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="empty-sub">{t('supplyDemand.emptyBufferNorms', 'Buffer norms apply specifically to Wheat and Rice under NFSA mandates.')}</p>
                )}
              </div>

              {/* Procurement Block */}
              <div className="subpanel-card">
                <h4>{t('supplyDemand.bufferSubpanel2Title', 'Progressive Cumulative Procurement')}</h4>
                {data?.publicProcurement?.commodity ? (
                  <div className="subpanel-body">
                    <div className="data-row">
                      <span>{t('supplyDemand.labelCommodity', 'Commodity:')}</span>
                      <strong>{data.publicProcurement.commodity}</strong>
                    </div>
                    <div className="data-row">
                      <span>{t('supplyDemand.labelMarketingSeason', 'Marketing Season:')}</span>
                      <strong>{data.publicProcurement.marketingSeasonType} {data.publicProcurement.marketingSeasonYear}</strong>
                    </div>
                    <div className="data-row">
                      <span>{t('supplyDemand.labelProcurementStage', 'Procurement Stage:')}</span>
                      <span className="status-pill status-verified">{data.publicProcurement.procurementStage}</span>
                    </div>
                    <div className="data-row">
                      <span>{t('supplyDemand.labelQuantityProcured', 'Quantity Procured:')}</span>
                      <strong className="text-success">{data.publicProcurement.progressiveQuantityLmt} {t('supplyDemand.unitLmt', 'LMT')}</strong>
                    </div>
                    <div className="data-row">
                      <span>{t('supplyDemand.labelReportingDate', 'Reporting As-Of Date:')}</span>
                      <strong>{data.publicProcurement.reportingAsOfDate || '—'}</strong>
                    </div>
                  </div>
                ) : (
                  <p className="empty-sub">{t('supplyDemand.emptyProcurement', 'Central procurement operations apply to Central Pool commodities (Rice/Wheat).')}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DEMAND METHODOLOGY */}
        {activeTab === 'demand' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3>{t('supplyDemand.demandTitle', 'Regional Demand Balance Methodology & Status')}</h3>
                <p className="panel-desc">
                  {t('supplyDemand.demandDesc', 'Econometric analysis of consumer demand availability in official Indian agricultural statistics.')}
                </p>
              </div>
              <span className="badge badge-warning">{t('supplyDemand.demandBadgeStatus', 'STATUS: INSUFFICIENT DATA')}</span>
            </div>

            <div className="methodology-card">
              <div className="methodology-badge-row">
                <span className="pill-outline">{t('supplyDemand.demandVersionLabel', 'Version:')} {data?.regionalDemandBalance?.methodologyVersion || 'IN_DEMAND_V1'}</span>
                <span className="pill-outline">{t('supplyDemand.demandCalcFlag', 'Calculation Flag: isCalculated = false')}</span>
                <span className="pill-outline">{t('supplyDemand.demandUncomputable', 'Surplus/Deficit: NULL (Uncomputable)')}</span>
              </div>

              <h4 className="methodology-title">{t('supplyDemand.demandWhyTitle', 'Why does KisanMitra AI report INSUFFICIENT_DATA for demand balance?')}</h4>
              <p className="methodology-text">
                {data?.regionalDemandBalance?.rationale}
              </p>

              <div className="citation-box">
                <h5>{t('supplyDemand.demandCitationsHeading', 'Official Statistical Citations:')}</h5>
                <p>{data?.regionalDemandBalance?.officialCitations}</p>
              </div>

              <div className="governance-box">
                <h5>{t('supplyDemand.demandGovHeading', 'Algorithmic Governance Mandate:')}</h5>
                <ul>
                  <li><strong>{t('supplyDemand.demandGov1Title', 'Zero Synthetic Ratios:')}</strong> {t('supplyDemand.demandGov1Text', 'KisanMitra AI refuses to divide district production by arbitrary local population multipliers or fabricated consumption quotas.')}</li>
                  <li><strong>{t('supplyDemand.demandGov2Title', 'No Arbitrary Thresholds:')}</strong> {t('supplyDemand.demandGov2Text', 'We do not apply heuristic surplus (+15%) or shortage (-10%) triggers without empirical backing.')}</li>
                  <li><strong>{t('supplyDemand.demandGov3Title', 'Farmer Intentions Isolated:')}</strong> {t('supplyDemand.demandGov3Text', 'Voluntary farmer cropping intention signals remain in the dedicated Oversupply Risk module as micro-signals and are not conflated with macro national demand.')}</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CropSupplyDemandPage
