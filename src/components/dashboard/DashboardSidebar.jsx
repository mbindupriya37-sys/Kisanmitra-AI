import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useNavigate } from 'react-router-dom'

function DashboardSidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [activeItem, setActiveItem] = useState('dashboard')
  const [activeModal, setActiveModal] = useState(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModal(null)
      }
    }
    if (activeModal) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeModal])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNavClick = (id) => {
    setActiveItem(id)
    if (setMobileOpen) setMobileOpen(false)
    if (id === 'dashboard') {
      navigate('/farmer/dashboard')
    } else if (id === 'crop') {
      navigate('/farmer/crop-recommendation')
    } else if (id === 'alternative') {
      navigate('/farmer/crop-recommendation/alternatives')
    } else if (id === 'oversupply') {
      navigate('/farmer/oversupply-risk')
    } else if (id === 'decision-lab') {
      navigate('/farmer/decision-lab')
    } else if (id === 'supply-demand') {
      navigate('/farmer/supply-demand')
    } else if (id === 'weather') {
      navigate('/farmer/weather')
    } else if (id === 'market') {
      navigate('/farmer/market-intelligence')
    } else if (id === 'schemes') {
      navigate('/farmer/government-schemes')
    } else if (id === 'disease') {
      navigate('/farmer/disease-guidance')
    } else if (id === 'ai-assistant') {
      navigate('/farmer/ai-assistant')
    } else if (id === 'profile') {
      setActiveModal('profile')
    } else if (id === 'journal') {
      setActiveModal('journal')
    } else if (id === 'help') {
      setActiveModal('help')
    }
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`dashboard-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo">🌾</div>
          <div className="brand-text">
            <h2 className="brand-title">{t('app.name', 'KisanMitra AI')}</h2>
            <span className="brand-subtitle">{t('sidebar.subtitle', 'Farmer Decision Support')}</span>
          </div>
          {setMobileOpen && (
            <button 
              className="sidebar-close-btn" 
              onClick={() => setMobileOpen(false)}
              aria-label={t('sidebar.closeSidebar', 'Close sidebar')}
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="sidebar-nav-wrapper">
          {/* Main Navigation */}
          <div className="nav-group">
            <div className="nav-group-title">{t('sidebar.groupMain', 'MAIN NAVIGATION')}</div>
            <button 
              className={`nav-item ${activeItem === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNavClick('dashboard')}
            >
              <span className="nav-icon">📊</span>
              <span>{t('sidebar.dashboard', 'Dashboard')}</span>
            </button>
            <button 
              className={`nav-item ${activeItem === 'crop' ? 'active' : ''}`}
              onClick={() => handleNavClick('crop')}
            >
              <span className="nav-icon">🌱</span>
              <span>{t('sidebar.cropRecommendation', 'Crop Recommendation')}</span>
            </button>
            <button 
              className={`nav-item ${activeItem === 'weather' ? 'active' : ''}`}
              onClick={() => handleNavClick('weather')}
            >
              <span className="nav-icon">☁️</span>
              <span>{t('sidebar.weatherClimate', 'Weather & Climate')}</span>
            </button>
            <button 
              className={`nav-item ${activeItem === 'market' ? 'active' : ''}`}
              onClick={() => handleNavClick('market')}
            >
              <span className="nav-icon">📈</span>
              <span>{t('sidebar.marketIntelligence', 'Market Intelligence')}</span>
            </button>
            <button 
              className={`nav-item ${activeItem === 'schemes' ? 'active' : ''}`}
              onClick={() => handleNavClick('schemes')}
            >
              <span className="nav-icon">📋</span>
              <span>{t('sidebar.governmentSchemes', 'Government Schemes')}</span>
            </button>
            <button 
              className={`nav-item ${activeItem === 'disease' ? 'active' : ''}`}
              onClick={() => handleNavClick('disease')}
            >
              <span className="nav-icon">🍃</span>
              <span>{t('sidebar.diseaseGuidance', 'Disease Guidance')}</span>
            </button>
            <button 
              className={`nav-item ${activeItem === 'ai-assistant' ? 'active' : ''}`}
              onClick={() => handleNavClick('ai-assistant')}
            >
              <span className="nav-icon">🤖</span>
              <span>{t('sidebar.aiAssistant', 'AI Assistant')}</span>
            </button>
          </div>

          {/* Signature Features */}
          <div className="nav-group">
            <div className="nav-group-title">{t('sidebar.groupFeatures', 'SIGNATURE FEATURES')}</div>
            <button 
              className={`nav-item ${activeItem === 'oversupply' ? 'active' : ''}`}
              onClick={() => handleNavClick('oversupply')}
            >
              <span className="nav-icon">🚨</span>
              <span>{t('sidebar.oversupplyRisk', 'Oversupply Risk')}</span>
            </button>
            <button 
              className={`nav-item ${activeItem === 'alternative' ? 'active' : ''}`}
              onClick={() => handleNavClick('alternative')}
            >
              <span className="nav-icon">🔄</span>
              <span>{t('sidebar.alternativeCrops', 'Alternative Crops')}</span>
            </button>
            <button 
              className={`nav-item ${activeItem === 'decision-lab' ? 'active' : ''}`}
              onClick={() => handleNavClick('decision-lab')}
            >
              <span className="nav-icon">🧪</span>
              <span>{t('sidebar.decisionLab', 'Decision Lab')}</span>
            </button>
            <button 
              className={`nav-item ${activeItem === 'supply-demand' ? 'active' : ''}`}
              onClick={() => handleNavClick('supply-demand')}
            >
              <span className="nav-icon">🌐</span>
              <span>{t('sidebar.supplyDemand', 'Supply–Demand Intel')}</span>
            </button>
          </div>

          {/* Account & Support */}
          <div className="nav-group">
            <div className="nav-group-title">{t('sidebar.groupAccount', 'ACCOUNT & SUPPORT')}</div>
            <button 
              className={`nav-item ${activeItem === 'profile' ? 'active' : ''}`}
              onClick={() => handleNavClick('profile')}
            >
              <span className="nav-icon">👤</span>
              <span>{t('sidebar.myProfile', 'My Profile')}</span>
            </button>
            <button 
              className={`nav-item ${activeItem === 'journal' ? 'active' : ''}`}
              onClick={() => handleNavClick('journal')}
            >
              <span className="nav-icon">📖</span>
              <span>{t('sidebar.myDecisions', 'My Decisions / Journal')}</span>
            </button>
            <button 
              className={`nav-item ${activeItem === 'help' ? 'active' : ''}`}
              onClick={() => handleNavClick('help')}
            >
              <span className="nav-icon">❓</span>
              <span>{t('sidebar.helpFeedback', 'Help & Feedback')}</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span>{t('sidebar.signOut', 'Sign Out')}</span>
          </button>
        </div>
      </aside>

      {/* Modal Dialog for Account & Support items */}
      {activeModal && (
        <div 
          className="sidebar-modal-backdrop"
          onClick={() => setActiveModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="sidebar-modal-card" 
            onClick={(e) => e.stopPropagation()}
          >
            {activeModal === 'profile' && (
              <>
                <div className="sidebar-modal-header">
                  <h3 className="sidebar-modal-title">
                    <span>👤</span> {t('sidebar.profileModalTitle', 'Farmer Profile')}
                  </h3>
                  <button 
                    className="sidebar-modal-close-btn"
                    onClick={() => setActiveModal(null)}
                    aria-label={t('common.close', 'Close')}
                  >
                    ✕
                  </button>
                </div>
                <div className="sidebar-modal-body">
                  <p className="sidebar-modal-desc">
                    {t('sidebar.profileModalDesc', 'Verified farmer registration credentials currently authenticated in this active session:')}
                  </p>
                  <div className="sidebar-modal-profile-grid">
                    <div className="sidebar-modal-field">
                      <span className="sidebar-modal-label">{t('sidebar.fieldFullName', 'Full Name')}</span>
                      <span className="sidebar-modal-val">{user?.fullName || t('common.farmer', 'Farmer')}</span>
                    </div>
                    <div className="sidebar-modal-field">
                      <span className="sidebar-modal-label">{t('sidebar.fieldRole', 'Role')}</span>
                      <span className="sidebar-modal-val">{user?.role || 'FARMER'}</span>
                    </div>
                    <div className="sidebar-modal-field">
                      <span className="sidebar-modal-label">{t('sidebar.fieldEmail', 'Email Address')}</span>
                      <span className="sidebar-modal-val">{user?.email || 'N/A'}</span>
                    </div>
                    <div className="sidebar-modal-field">
                      <span className="sidebar-modal-label">{t('sidebar.fieldPhone', 'Phone Number')}</span>
                      <span className="sidebar-modal-val">{user?.phone || t('sidebar.notProvided', 'Not provided')}</span>
                    </div>
                    <div className="sidebar-modal-field" style={{ gridColumn: 'span 2' }}>
                      <span className="sidebar-modal-label">{t('sidebar.fieldSession', 'Session Security')}</span>
                      <span className="sidebar-modal-val" style={{ color: '#2e7d32' }}>
                        🔒 {t('sidebar.activeJwtSession', 'Active JWT Bearer Session')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="sidebar-modal-footer">
                  <button 
                    className="sidebar-modal-btn-close"
                    onClick={() => setActiveModal(null)}
                  >
                    {t('common.close', 'Close')}
                  </button>
                </div>
              </>
            )}

            {activeModal === 'journal' && (
              <>
                <div className="sidebar-modal-header">
                  <h3 className="sidebar-modal-title">
                    <span>📖</span> {t('sidebar.journalModalTitle', 'My Decisions & Farm Journal')}
                  </h3>
                  <button 
                    className="sidebar-modal-close-btn"
                    onClick={() => setActiveModal(null)}
                    aria-label={t('common.close', 'Close')}
                  >
                    ✕
                  </button>
                </div>
                <div className="sidebar-modal-body">
                  <p className="sidebar-modal-desc">
                    {t('sidebar.journalModalDesc', 'Your farm assessment records and seasonal crop planning decisions are logged in active modules:')}
                  </p>
                  <div className="sidebar-modal-actions-list">
                    <button 
                      className="sidebar-modal-action-btn"
                      onClick={() => {
                        setActiveModal(null)
                        navigate('/farmer/crop-recommendation')
                      }}
                    >
                      <span>🌾 {t('sidebar.btnViewAssessmentHistory', 'Crop Recommendation Assessment History')}</span>
                      <span>→</span>
                    </button>
                    <button 
                      className="sidebar-modal-action-btn"
                      onClick={() => {
                        setActiveModal(null)
                        navigate('/farmer/oversupply-risk')
                      }}
                    >
                      <span>🚨 {t('sidebar.btnViewCropIntentions', 'Planned Crop Intentions & Risk Records')}</span>
                      <span>→</span>
                    </button>
                  </div>
                  <div className="sidebar-modal-roadmap-box">
                    <span className="sidebar-modal-roadmap-icon">ℹ️</span>
                    <p className="sidebar-modal-roadmap-text">
                      <strong>{t('sidebar.roadmapNoticeTitle', 'Roadmap Feature')}:</strong>{' '}
                      {t('sidebar.journalRoadmapNotice', 'Dedicated multi-season decision journal exporting and historical trend analytics are scheduled for an upcoming platform release.')}
                    </p>
                  </div>
                </div>
                <div className="sidebar-modal-footer">
                  <button 
                    className="sidebar-modal-btn-close"
                    onClick={() => setActiveModal(null)}
                  >
                    {t('common.close', 'Close')}
                  </button>
                </div>
              </>
            )}

            {activeModal === 'help' && (
              <>
                <div className="sidebar-modal-header">
                  <h3 className="sidebar-modal-title">
                    <span>❓</span> {t('sidebar.helpModalTitle', 'Help & Agricultural Support')}
                  </h3>
                  <button 
                    className="sidebar-modal-close-btn"
                    onClick={() => setActiveModal(null)}
                    aria-label={t('common.close', 'Close')}
                  >
                    ✕
                  </button>
                </div>
                <div className="sidebar-modal-body">
                  <p className="sidebar-modal-desc">
                    {t('sidebar.helpModalDesc', 'Need agricultural advice or experiencing technical issues? Use the verified channels below:')}
                  </p>
                  <div className="sidebar-modal-actions-list">
                    <button 
                      className="sidebar-modal-action-btn"
                      onClick={() => {
                        setActiveModal(null)
                        navigate('/farmer/ai-assistant')
                      }}
                    >
                      <span>🤖 {t('sidebar.btnAskAi', 'Consult KisanMitra AI Assistant (24/7 ICAR Grounded)')}</span>
                      <span>→</span>
                    </button>
                  </div>
                  <div className="sidebar-modal-contact-card">
                    <h5 className="sidebar-modal-contact-title">
                      📞 {t('sidebar.kisanCallCenterTitle', 'Kisan Call Centre (Toll-Free)')}: 1800-180-1551
                    </h5>
                    <p className="sidebar-modal-contact-detail">
                      {t('sidebar.kisanCallCenterDesc', 'Official Ministry of Agriculture helpline providing free telephone agronomy advisories in regional Indian languages.')}
                    </p>
                  </div>
                  <div className="sidebar-modal-contact-card">
                    <h5 className="sidebar-modal-contact-title">
                      🏛️ {t('sidebar.kvkTitle', 'District Krishi Vigyan Kendra (KVK)')}
                    </h5>
                    <p className="sidebar-modal-contact-detail">
                      {t('sidebar.kvkDesc', 'Visit your nearest ICAR district center for certified soil testing, physical disease samples, and seed distribution.')}
                    </p>
                  </div>
                  <div className="sidebar-modal-roadmap-box">
                    <span className="sidebar-modal-roadmap-icon">ℹ️</span>
                    <p className="sidebar-modal-roadmap-text">
                      <strong>{t('sidebar.roadmapNoticeTitle', 'Roadmap Feature')}:</strong>{' '}
                      {t('sidebar.feedbackRoadmapNotice', 'Integrated feedback ticketing is scheduled on the product roadmap. For immediate agricultural queries, please consult the AI Assistant or your district KVK.')}
                    </p>
                  </div>
                </div>
                <div className="sidebar-modal-footer">
                  <button 
                    className="sidebar-modal-btn-close"
                    onClick={() => setActiveModal(null)}
                  >
                    {t('common.close', 'Close')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default DashboardSidebar
