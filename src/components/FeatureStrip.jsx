import { useLanguage } from '../context/LanguageContext'

function FeatureStrip() {
  const { t } = useLanguage()

  const stripItems = [
    {
      id: 'crop-rec',
      icon: '🌱',
      name: t('landing.stripCropName'),
      desc: t('landing.stripCropDesc'),
    },
    {
      id: 'weather',
      icon: '🌦️',
      name: t('landing.stripWeatherName'),
      desc: t('landing.stripWeatherDesc'),
    },
    {
      id: 'market',
      icon: '📈',
      name: t('landing.stripMarketName'),
      desc: t('landing.stripMarketDesc'),
    },
    {
      id: 'schemes',
      icon: '🏛️',
      name: t('landing.stripSchemesName'),
      desc: t('landing.stripSchemesDesc'),
    },
    {
      id: 'disease',
      icon: '🦠',
      name: t('landing.stripDiseaseName'),
      desc: t('landing.stripDiseaseDesc'),
    },
    {
      id: 'ai-assistant',
      icon: '🤖',
      name: t('landing.stripAiName'),
      desc: t('landing.stripAiDesc'),
    },
  ]

  const handleItemClick = () => {
    // Navigate or scroll smoothly to features section
    const el = document.getElementById('features')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="feature-strip-container">
      <div className="feature-strip">
        {stripItems.map((item) => (
          <div
            key={item.id}
            className="strip-item"
            onClick={handleItemClick}
            role="button"
            tabIndex={0}
          >
            <span className="strip-icon">{item.icon}</span>
            <div className="strip-text">
              <strong className="strip-name">{item.name}</strong>
              <small className="strip-desc">{item.desc}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FeatureStrip
