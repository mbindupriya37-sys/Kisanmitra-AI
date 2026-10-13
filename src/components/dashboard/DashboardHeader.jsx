import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import LanguageSelector from '../LanguageSelector'

function DashboardHeader({ setMobileOpen }) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const farmerName = user?.fullName || t('common.farmer', 'Farmer')

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button 
          className="mobile-menu-btn" 
          onClick={() => setMobileOpen(true)}
          aria-label={t('dashboard.openSidebar', 'Open sidebar menu')}
        >
          ☰
        </button>
        <div className="header-title-wrapper">
          <h1 className="header-page-title">{t('dashboard.farmerDashboard', 'Farmer Dashboard')}</h1>
          <span className="header-page-subtitle">{t('dashboard.subtitle', 'Agricultural Decision Support Workspace')}</span>
        </div>
      </div>

      <div className="header-right">
        {/* Language Selector */}
        <LanguageSelector id="dashboard-language-select" />

        {/* Search Input */}
        <div className="header-search">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder={t('dashboard.searchPlaceholder', 'Search crops, schemes, advisors...')} 
            className="search-input"
          />
        </div>

        {/* Notifications */}
        <button className="icon-action-btn" aria-label={t('dashboard.notifications', 'Notifications')}>
          🔔
          <span className="notification-badge"></span>
        </button>

        {/* Profile Card */}
        <div className="user-profile-badge">
          <div className="avatar-circle">
            {farmerName.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <span className="user-name">{farmerName}</span>
            <span className="role-tag">{t('common.farmerRole', 'Farmer')}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
