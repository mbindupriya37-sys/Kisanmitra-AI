import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import HeroInfoCard from './HeroInfoCard'
import heroBgImage from '../assets/hero-agriculture.png'

function HeroSection() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  // Demonstration / mock data structure for hero floating cards
  const heroCardsData = [
    {
      id: 'weather',
      icon: '🌦️',
      title: t('landing.heroCardWeatherTitle'),
      value: t('landing.heroCardWeatherVal'),
      detail: t('landing.heroCardWeatherDetail'),
      badgeText: t('landing.heroCardWeatherBadge'),
      badgeColor: 'green',
    },
    {
      id: 'market',
      icon: '📈',
      title: t('landing.heroCardMarketTitle'),
      value: t('landing.heroCardMarketVal'),
      detail: t('landing.heroCardMarketDetail'),
      badgeText: '+12%',
      badgeColor: 'green',
    },
    {
      id: 'crop',
      icon: '🌾',
      title: t('landing.heroCardCropTitle'),
      value: t('landing.heroCardCropVal'),
      detail: t('landing.heroCardCropDetail'),
      badgeText: t('landing.heroCardCropBadge'),
      badgeColor: 'green',
    },
    {
      id: 'disease',
      icon: '🛡️',
      title: t('landing.heroCardDiseaseTitle'),
      value: t('landing.heroCardDiseaseVal'),
      detail: t('landing.heroCardDiseaseDetail'),
      badgeText: t('landing.heroCardDiseaseBadge'),
      badgeColor: 'orange',
    },
  ]

  return (
    <section id="home" className="hero-section">
      <div className="hero-content">
        <div className="badge">
          {t('landing.heroBadge')}
        </div>

        <h2>
          {t('landing.heroTitlePre')}
          <span> {t('landing.heroTitleSpan')}</span>
        </h2>

        <p>
          {t('landing.heroDescription')}
        </p>

        <div className="hero-actions">
          <button className="primary-button" onClick={() => navigate('/register')}>
            {t('landing.btnExplore')}
          </button>

          <button
            className="secondary-button"
            onClick={() => alert(t('landing.demoAlert'))}
          >
            {t('landing.btnWatchDemo')}
          </button>
        </div>

        <div className="trust-points">
          <div>
            <strong>🌦️</strong>
            <span>{t('landing.trustClimate')}</span>
          </div>

          <div>
            <strong>📊</strong>
            <span>{t('landing.trustMarket')}</span>
          </div>

          <div>
            <strong>🤖</strong>
            <span>{t('landing.trustAi')}</span>
          </div>

          <div>
            <strong>🛡️</strong>
            <span>{t('landing.trustRisk')}</span>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-visual-frame">
          <img
            src={heroBgImage}
            alt="KisanMitra AI Farmer Field Backdrop"
            className="hero-backdrop-img"
          />

          <div className="hero-glass-overlay">
            <div className="hero-cards-grid">
              {heroCardsData.map((card) => (
                <HeroInfoCard key={card.id} {...card} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
