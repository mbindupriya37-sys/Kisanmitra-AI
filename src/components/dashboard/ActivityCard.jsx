import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'

function ActivityCard() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  return (
    <div className="section-block">
      <div className="section-header-row">
        <div>
          <h3 className="section-heading-title">{t('dashboard.activityTitle')}</h3>
          <p className="section-heading-sub">{t('dashboard.activitySub')}</p>
        </div>
      </div>

      <div className="empty-activity-card">
        <div className="empty-activity-icon">📖</div>
        <h4 className="empty-activity-title">{t('dashboard.activityEmptyTitle')}</h4>
        <p className="empty-activity-sub">
          {t('dashboard.activityEmptySub')}
        </p>
        <button 
          className="primary-dash-btn empty-cta-btn"
          onClick={() => navigate('/farmer/crop-recommendation')}
        >
          {t('dashboard.btnStartFirstAnalysis')}
        </button>
      </div>
    </div>
  )
}

export default ActivityCard
