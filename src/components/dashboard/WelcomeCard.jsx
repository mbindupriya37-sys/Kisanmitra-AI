import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import cropImg from '../../assets/card-crop-recommendation.png'

function WelcomeCard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const farmerName = user?.fullName || t('dashboard.defaultFarmerName')

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t('dashboard.greetingMorning')
    if (hour < 17) return t('dashboard.greetingAfternoon')
    return t('dashboard.greetingEvening')
  }

  return (
    <div className="welcome-card">
      <div className="welcome-content">
        <div className="welcome-badge">
          <span>{t('dashboard.welcomeBadge')}</span>
        </div>
        <h2 className="welcome-heading">
          {getGreeting()}, <span className="highlight-name">{farmerName}</span>
        </h2>
        <p className="welcome-subtext">
          {t('dashboard.welcomeSubtext')}
        </p>
        <div className="welcome-actions">
          <button 
            className="primary-dash-btn"
            onClick={() => navigate('/farmer/crop-recommendation')}
          >
            {t('dashboard.btnGetRecommendation')}
          </button>
          <button className="secondary-dash-btn">
            {t('dashboard.btnViewGuide')}
          </button>
        </div>
      </div>

      <div className="welcome-visual">
        <div className="visual-frame">
          <img src={cropImg} alt="Crop Recommendation Preview" className="welcome-img" />
          <div className="visual-glass-tag">
            <span className="dot"></span> {t('dashboard.analyticsReady')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeCard
