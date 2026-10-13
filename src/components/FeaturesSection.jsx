import { useLanguage } from '../context/LanguageContext'
import FeatureCard from './FeatureCard'

import imgCrop from '../assets/card-crop-recommendation.png'
import imgWeather from '../assets/card-weather-climate.png'
import imgDisease from '../assets/card-disease-guidance.png'
import imgMarket from '../assets/card-market-intelligence.png'
import imgSchemes from '../assets/card-government-schemes.png'
import imgAI from '../assets/card-ai-assistant.png'

function FeaturesSection() {
  const { t } = useLanguage()

  const featuresList = [
    {
      id: 'crop',
      title: t('landing.featCropTitle'),
      icon: '🌱',
      image: imgCrop,
      description: t('landing.featCropDesc'),
      actionText: t('landing.btnExplore'),
    },
    {
      id: 'weather',
      title: t('landing.featWeatherTitle'),
      icon: '🌦️',
      image: imgWeather,
      description: t('landing.featWeatherDesc'),
      actionText: t('landing.btnExplore'),
    },
    {
      id: 'disease',
      title: t('landing.featDiseaseTitle'),
      icon: '🦠',
      image: imgDisease,
      description: t('landing.featDiseaseDesc'),
      actionText: t('landing.btnExplore'),
    },
    {
      id: 'market',
      title: t('landing.featMarketTitle'),
      icon: '📈',
      image: imgMarket,
      description: t('landing.featMarketDesc'),
      actionText: t('landing.btnExplore'),
    },
    {
      id: 'schemes',
      title: t('landing.featSchemesTitle'),
      icon: '🏛️',
      image: imgSchemes,
      description: t('landing.featSchemesDesc'),
      actionText: t('landing.btnExplore'),
    },
    {
      id: 'ai',
      title: t('landing.featAiTitle'),
      icon: '🤖',
      image: imgAI,
      description: t('landing.featAiDesc'),
      actionText: t('landing.btnExplore'),
    },
  ]

  return (
    <section id="features" className="features-section">
      <div className="section-heading">
        <span>{t('landing.featuresPre')}</span>
        <h2>{t('landing.featuresHeading')}</h2>
        <p>
          {t('landing.featuresSub')}
        </p>
      </div>

      <div className="feature-grid-responsive">
        {featuresList.map((feat) => (
          <FeatureCard key={feat.id} {...feat} />
        ))}
      </div>
    </section>
  )
}

export default FeaturesSection
