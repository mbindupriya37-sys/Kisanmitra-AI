import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import './GovernmentSchemesPage.css';

const CATEGORIES = [
  { key: 'ALL', label: 'All Schemes' },
  { key: 'FINANCIAL_SUPPORT', label: 'Financial Support' },
  { key: 'CROP_INSURANCE', label: 'Crop Insurance' },
  { key: 'IRRIGATION', label: 'Irrigation' },
  { key: 'SOLAR_ENERGY', label: 'Solar & Energy' },
  { key: 'MACHINERY', label: 'Machinery & Equipment' },
  { key: 'SOIL_HEALTH', label: 'Soil Health' }
];

export default function GovernmentSchemesPage() {
  const { t } = useLanguage();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeModalScheme, setActiveModalScheme] = useState(null);

  useEffect(() => {
    fetchSchemes();
  }, [selectedCategory]);

  const fetchSchemes = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedCategory !== 'ALL') {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await api.get('/schemes', { params });
      setSchemes(response.data || []);
    } catch (err) {
      console.error('Failed to fetch government schemes:', err);
      setError('Unable to load government schemes. Please verify backend service or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSchemes();
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchSchemes();
  };

  return (
    <div className="schemes-page">
      {/* Top Header */}
      <header className="schemes-header">
        <div className="schemes-header-container">
          <div className="schemes-logo-group">
            <Link to="/farmer/dashboard" className="back-link">
              {t('schemes.backToDashboard', '← Back to Dashboard')}
            </Link>
            <h1 className="schemes-brand">{t('app.name', 'KisanMitra AI')}</h1>
          </div>
          <div className="schemes-header-actions">
            <div className="schemes-header-badge">
              {t('schemes.headerBadge', '🏛️ Government Schemes Portal')}
            </div>
            <LanguageSelector id="schemes-language-select" />
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="schemes-hero">
        <div className="schemes-hero-container">
          <h2 className="schemes-hero-title">
            {t('schemes.heroTitle', 'Government Schemes & Welfare Intelligence')}
          </h2>
          <p className="schemes-hero-subtitle">
            {t('schemes.heroSubtitle', 'Explore verified official Indian agricultural schemes, subsidies, crop insurance, solar grants, and credit facilities with traceable source attribution.')}
          </p>

          {/* Search Bar */}
          <form className="schemes-search-box" onSubmit={handleSearchSubmit}>
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="schemes-search-input"
                placeholder={t('schemes.searchPlaceholder', 'Search schemes by name, keyword, or benefit (e.g. PM-KISAN, insurance, solar pump)...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="search-clear-btn" onClick={clearSearch}>
                  ✕
                </button>
              )}
            </div>
            <button type="submit" className="schemes-search-btn">
              {t('schemes.searchBtn', 'Search Schemes')}
            </button>
          </form>

          {/* Category Filter Pills */}
          <div className="schemes-category-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                className={`category-pill ${selectedCategory === cat.key ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.key)}
              >
                {t(`schemes.categories.${cat.key}`, cat.label)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="schemes-main">
        <div className="schemes-main-container">
          {loading ? (
            <div className="schemes-loading-state">
              <div className="spinner"></div>
              <p>{t('schemes.loadingText', 'Fetching verified government schemes data...')}</p>
            </div>
          ) : error ? (
            <div className="schemes-error-state">
              <div className="error-icon">⚠️</div>
              <h3>{t('schemes.errorTitle', 'Error Loading Schemes')}</h3>
              <p>{error}</p>
              <button className="retry-btn" onClick={fetchSchemes}>
                {t('schemes.retryBtn', 'Retry Fetching Schemes')}
              </button>
            </div>
          ) : schemes.length === 0 ? (
            <div className="schemes-empty-state">
              <div className="empty-icon">📜</div>
              <h3>{t('schemes.emptyTitle', 'No Schemes Found')}</h3>
              <p>{t('schemes.emptyDesc', 'No verified government schemes matched your search criteria.')}</p>
              <button className="clear-filter-btn" onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}>
                {t('schemes.resetFiltersBtn', 'Reset Filters')}
              </button>
            </div>
          ) : (
            <div className="schemes-grid">
              {schemes.map((scheme) => (
                <div key={scheme.id} className="scheme-card">
                  <div className="scheme-card-header">
                    <span className="category-tag">
                      {t(`schemes.categories.${scheme.categoryDisplayName}`, scheme.categoryDisplayName)}
                    </span>
                    <span className={`status-tag ${scheme.verificationStatus === 'VERIFIED' ? 'status-verified' : 'status-pending'}`}>
                      {scheme.verificationStatus === 'VERIFIED'
                        ? t('schemes.statusVerified', '✓ Verified Portal')
                        : t('schemes.statusPending', '⚠️ Verification Required')}
                    </span>
                  </div>

                  <h3 className="scheme-title">{scheme.name}</h3>
                  <div className="scheme-ministry">🏛️ {scheme.ministry}</div>

                  <p className="scheme-purpose-preview">{scheme.purpose}</p>

                  <div className="scheme-benefits-highlight">
                    <div className="benefits-label">{t('schemes.keyBenefitLabel', '💡 Key Benefit:')}</div>
                    <div className="benefits-text">{scheme.benefits}</div>
                  </div>

                  <div className="scheme-card-footer">
                    <button
                      className="btn-details"
                      onClick={() => setActiveModalScheme(scheme)}
                    >
                      {t('schemes.viewDetailsBtn', 'View Details & Eligibility')}
                    </button>
                    <a
                      href={scheme.officialPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-portal"
                    >
                      {t('schemes.officialPortalLink', 'Official Portal ↗')}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Scheme Details Modal */}
      {activeModalScheme && (
        <div className="modal-overlay" onClick={() => setActiveModalScheme(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="category-tag">
                  {t(`schemes.categories.${activeModalScheme.categoryDisplayName}`, activeModalScheme.categoryDisplayName)}
                </span>
                <h2>{activeModalScheme.name}</h2>
                <div className="modal-ministry">🏛️ {activeModalScheme.ministry}</div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setActiveModalScheme(null)}
                aria-label={t('common.close', 'Close')}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h4>{t('schemes.modalPurpose', '🎯 Purpose & Scheme Objective')}</h4>
                <p>{activeModalScheme.purpose}</p>
              </div>

              <div className="modal-section">
                <h4>{t('schemes.modalEligibility', '👤 Eligible Applicants')}</h4>
                <p>{activeModalScheme.eligibleApplicants}</p>
              </div>

              <div className="modal-section">
                <h4>{t('schemes.modalBenefits', '💰 Subsidies & Benefits')}</h4>
                <p>{activeModalScheme.benefits}</p>
              </div>

              <div className="modal-section">
                <h4>{t('schemes.modalDocuments', '📄 Required Documents')}</h4>
                <p>{activeModalScheme.requiredDocuments}</p>
              </div>

              <div className="modal-section">
                <h4>{t('schemes.modalGuide', '📝 Step-by-Step Application Guide')}</h4>
                <p>{activeModalScheme.applicationProcess}</p>
              </div>

              <div className="modal-provenance-box">
                <div className="provenance-item">
                  <span className="prov-label">{t('schemes.modalSourceLabel', 'Source Attribution:')}</span>
                  <span className="prov-value">{activeModalScheme.sourceName}</span>
                </div>
                <div className="provenance-item">
                  <span className="prov-label">{t('schemes.modalVerifiedLabel', 'Last Verified Date:')}</span>
                  <span className="prov-value">{activeModalScheme.lastVerifiedDate}</span>
                </div>
                <div className="provenance-item">
                  <span className="prov-label">{t('schemes.modalStatusLabel', 'Verification Status:')}</span>
                  <span className={`prov-value ${activeModalScheme.verificationStatus === 'VERIFIED' ? 'text-verified' : 'text-pending'}`}>
                    {activeModalScheme.verificationStatus === 'VERIFIED'
                      ? t('schemes.verifiedStatusText', 'VERIFIED')
                      : t('schemes.verificationRequiredText', 'VERIFICATION_REQUIRED')}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <a
                href={activeModalScheme.officialPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-portal-large"
              >
                {t('schemes.applyPortalLink', 'Apply on Official Government Portal ↗')}
              </a>
              <button className="btn-close-modal" onClick={() => setActiveModalScheme(null)}>
                {t('schemes.closeModalBtn', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
