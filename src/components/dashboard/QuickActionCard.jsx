import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import cropImg from '../../assets/card-crop-recommendation.png'
import weatherImg from '../../assets/card-weather-climate.png'
import marketImg from '../../assets/card-market-intelligence.png'
import schemeImg from '../../assets/card-government-schemes.png'
import diseaseImg from '../../assets/card-disease-guidance.png'
import aiImg from '../../assets/card-ai-assistant.png'

function QuickActionCard() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const actions = [
    {
      id: 'crop',
      title: t('dashboard.qaCropTitle'),
      desc: t('dashboard.qaCropDesc'),
      icon: '🌱',
      image: cropImg,
    },
    {
      id: 'weather',
      title: t('dashboard.qaWeatherTitle'),
      desc: t('dashboard.qaWeatherDesc'),
      icon: '☁️',
      image: weatherImg,
    },
    {
      id: 'market',
      title: t('dashboard.qaMarketTitle'),
      desc: t('dashboard.qaMarketDesc'),
      icon: '📈',
      image: marketImg,
    },
    {
      id: 'schemes',
      title: t('dashboard.qaSchemesTitle'),
      desc: t('dashboard.qaSchemesDesc'),
      icon: '📋',
      image: schemeImg,
    },
    {
      id: 'disease',
      title: t('dashboard.qaDiseaseTitle'),
      desc: t('dashboard.qaDiseaseDesc'),
      icon: '🍃',
      image: diseaseImg,
    },
    {
      id: 'ai',
      title: t('dashboard.qaAiTitle'),
      desc: t('dashboard.qaAiDesc'),
      icon: '🤖',
      image: aiImg,
    },
  ]

  const handleLaunch = (id) => {
    switch (id) {
      case 'crop':
        navigate('/farmer/crop-recommendation')
        break
      case 'weather':
        navigate('/farmer/weather')
        break
      case 'market':
        navigate('/farmer/market-intelligence')
        break
      case 'schemes':
        navigate('/farmer/government-schemes')
        break
      case 'disease':
        navigate('/farmer/disease-guidance')
        break
      case 'ai':
        navigate('/farmer/ai-assistant')
        break
      default:
        break
    }
  }

  return (
    <div className="section-block">
      <div className="section-header-row">
        <div>
          <h3 className="section-heading-title">{t('dashboard.quickActionsTitle')}</h3>
          <p className="section-heading-sub">{t('dashboard.quickActionsSub')}</p>
        </div>
      </div>

      <div className="quick-actions-grid">
        {actions.map((action) => (
          <div key={action.id} className="quick-action-card">
            <div className="action-image-box">
              <img src={action.image} alt={action.title} className="action-thumb" />
              <div className="action-icon-floating">{action.icon}</div>
            </div>
            <div className="action-content">
              <h4 className="action-title">{action.title}</h4>
              <p className="action-desc">{action.desc}</p>
              <button 
                className="action-btn"
                onClick={() => handleLaunch(action.id)}
              >
                {t('dashboard.btnLaunchModule')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuickActionCard
