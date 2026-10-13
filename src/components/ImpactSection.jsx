import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

function ImpactSection() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  // Project-oriented truthful statistics
  const statsData = [
    {
      id: 'crops',
      number: t('landing.statCropsNumber'),
      label: t('landing.statCropsLabel'),
      detail: t('landing.statCropsDetail'),
    },
    {
      id: 'weather',
      number: t('landing.statWeatherNumber'),
      label: t('landing.statWeatherLabel'),
      detail: t('landing.statWeatherDetail'),
    },
    {
      id: 'schemes',
      number: t('landing.statSchemesNumber'),
      label: t('landing.statSchemesLabel'),
      detail: t('landing.statSchemesDetail'),
    },
    {
      id: 'ai',
      number: t('landing.statAiNumber'),
      label: t('landing.statAiLabel'),
      detail: t('landing.statAiDetail'),
    },
  ]

  return (
    <section className="impact-section">
      <div className="impact-overlay">
        <div className="impact-container">
          <div className="impact-header">
            <span>{t('landing.impactPre')}</span>
            <h2>{t('landing.impactHeading')}</h2>
            <p>
              {t('landing.impactSub')}
            </p>
          </div>

          <div className="stats-grid">
            {statsData.map((stat) => (
              <div key={stat.id} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-detail">{stat.detail}</div>
              </div>
            ))}
          </div>

          <div className="impact-cta-box">
            <h3>{t('landing.ctaHeading')}</h3>
            <p>{t('landing.ctaSub')}</p>
            <button className="primary-button" onClick={() => navigate('/register')}>
              {t('landing.btnCta')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ImpactSection
