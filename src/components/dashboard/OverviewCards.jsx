import { useLanguage } from '../../context/LanguageContext'

function OverviewCards() {
  const { t } = useLanguage()

  const cards = [
    {
      id: 'crop',
      title: t('dashboard.overviewCropTitle'),
      icon: '🌾',
      status: t('dashboard.overviewCropStatus'),
      detail: t('dashboard.overviewCropDetail'),
      badgeClass: 'badge-green',
    },
    {
      id: 'weather',
      title: t('dashboard.overviewWeatherTitle'),
      icon: '☁️',
      status: t('dashboard.overviewWeatherStatus'),
      detail: t('dashboard.overviewWeatherDetail'),
      badgeClass: 'badge-blue',
    },
    {
      id: 'market',
      title: t('dashboard.overviewMarketTitle'),
      icon: '📈',
      status: t('dashboard.overviewMarketStatus'),
      detail: t('dashboard.overviewMarketDetail'),
      badgeClass: 'badge-purple',
    },
    {
      id: 'risk',
      title: t('dashboard.overviewRiskTitle'),
      icon: '🛡️',
      status: t('dashboard.overviewRiskStatus'),
      detail: t('dashboard.overviewRiskDetail'),
      badgeClass: 'badge-orange',
    },
  ]

  return (
    <div className="overview-cards-grid">
      {cards.map((card) => (
        <div key={card.id} className="overview-card">
          <div className="overview-card-header">
            <div className="overview-icon-box">{card.icon}</div>
            <span className={`overview-status-badge ${card.badgeClass}`}>
              {card.status}
            </span>
          </div>
          <h3 className="overview-title">{card.title}</h3>
          <p className="overview-detail">{card.detail}</p>
        </div>
      ))}
    </div>
  )
}

export default OverviewCards
