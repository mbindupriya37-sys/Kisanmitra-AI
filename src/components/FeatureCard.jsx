import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

function FeatureCard({ image, icon, title, description, actionText }) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const resolvedActionText = actionText || t('landing.btnExplore')

  return (
    <article className="feature-card-item">
      <div className="card-image-wrapper">
        <img src={image} alt={title} className="card-top-image" />
        <span className="card-icon-badge">{icon}</span>
      </div>

      <div className="card-content">
        <h3>{title}</h3>
        <p>{description}</p>
        <button className="card-action-btn" onClick={() => navigate('/register')}>
          {resolvedActionText}
        </button>
      </div>
    </article>
  )
}

export default FeatureCard
