import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'

function SignatureFeatureCard() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const features = [
    {
      id: 'oversupply',
      title: t('dashboard.sigOversupplyTitle'),
      tag: t('dashboard.sigOversupplyTag'),
      badgeText: t('dashboard.sigOversupplyBadge'),
      icon: '🚨',
      desc: t('dashboard.sigOversupplyDesc'),
    },
    {
      id: 'alternative',
      title: t('dashboard.sigAlternativeTitle'),
      tag: t('dashboard.sigAlternativeTag'),
      badgeText: t('dashboard.sigAlternativeBadge'),
      icon: '🔄',
      desc: t('dashboard.sigAlternativeDesc'),
    },
    {
      id: 'lab',
      title: t('dashboard.sigLabTitle'),
      tag: t('dashboard.sigLabTag'),
      badgeText: t('dashboard.sigLabBadge'),
      icon: '🧪',
      desc: t('dashboard.sigLabDesc'),
    },
    {
      id: 'supply-demand',
      title: t('dashboard.sigSupplyDemandTitle'),
      tag: t('dashboard.sigSupplyDemandTag'),
      badgeText: t('dashboard.sigSupplyDemandBadge'),
      icon: '🌐',
      desc: t('dashboard.sigSupplyDemandDesc'),
    },
  ]

  const handleFeatureClick = (id) => {
    if (id === 'alternative') {
      navigate('/farmer/crop-recommendation/alternatives')
    } else if (id === 'oversupply') {
      navigate('/farmer/oversupply-risk')
    } else if (id === 'lab') {
      navigate('/farmer/decision-lab')
    } else if (id === 'supply-demand') {
      navigate('/farmer/supply-demand')
    }
  }

  return (
    <div className="section-block signature-section-block">
      <div className="section-header-row">
        <div>
          <span className="signature-pill-badge">{t('dashboard.sigPillBadge')}</span>
          <h3 className="section-heading-title">{t('dashboard.sigTitle')}</h3>
          <p className="section-heading-sub">{t('dashboard.sigSub')}</p>
        </div>
      </div>

      <div className="signature-cards-grid">
        {features.map((feat) => (
          <div
            key={feat.id}
            className="signature-feature-card"
            onClick={() => handleFeatureClick(feat.id)}
            style={{ cursor: 'pointer' }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleFeatureClick(feat.id)
              }
            }}
          >
            <div className="sig-header">
              <div className="sig-icon-badge">{feat.icon}</div>
              <span className="sig-tag-pill">{feat.tag}</span>
            </div>
            <h4 className="sig-title">{feat.title}</h4>
            <p className="sig-desc">{feat.desc}</p>
            <div className="sig-footer">
              <span className="sig-disclaimer-badge">
                {feat.badgeText}
              </span>
              <button
                type="button"
                className="sig-action-link"
                onClick={(e) => {
                  e.stopPropagation()
                  handleFeatureClick(feat.id)
                }}
              >
                {t('dashboard.btnExplore')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SignatureFeatureCard
