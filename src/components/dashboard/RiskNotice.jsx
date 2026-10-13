import { useLanguage } from '../../context/LanguageContext'

function RiskNotice() {
  const { t } = useLanguage()

  return (
    <div className="risk-notice-panel">
      <div className="risk-notice-icon">🛡️</div>
      <div className="risk-notice-content">
        <h4 className="risk-notice-title">{t('dashboard.riskNoticeTitle')}</h4>
        <p className="risk-notice-text">
          {t('dashboard.riskNoticeText')}
        </p>
      </div>
    </div>
  )
}

export default RiskNotice
