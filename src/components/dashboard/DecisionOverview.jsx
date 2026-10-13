import { useLanguage } from '../../context/LanguageContext'

function DecisionOverview() {
  const { t } = useLanguage()

  const steps = [
    { num: 1, title: t('dashboard.journeyStep1Title'), desc: t('dashboard.journeyStep1Desc') },
    { num: 2, title: t('dashboard.journeyStep2Title'), desc: t('dashboard.journeyStep2Desc') },
    { num: 3, title: t('dashboard.journeyStep3Title'), desc: t('dashboard.journeyStep3Desc') },
    { num: 4, title: t('dashboard.journeyStep4Title'), desc: t('dashboard.journeyStep4Desc') },
    { num: 5, title: t('dashboard.journeyStep5Title'), desc: t('dashboard.journeyStep5Desc') },
    { num: 6, title: t('dashboard.journeyStep6Title'), desc: t('dashboard.journeyStep6Desc') },
    { num: 7, title: t('dashboard.journeyStep7Title'), desc: t('dashboard.journeyStep7Desc') },
    { num: 8, title: t('dashboard.journeyStep8Title'), desc: t('dashboard.journeyStep8Desc') },
  ]

  return (
    <div className="section-block">
      <div className="section-header-row">
        <div>
          <h3 className="section-heading-title">{t('dashboard.journeyTitle')}</h3>
          <p className="section-heading-sub">{t('dashboard.journeySub')}</p>
        </div>
      </div>

      <div className="journey-steps-grid">
        {steps.map((step) => (
          <div key={step.num} className="journey-step-card">
            <div className="step-badge-num">{step.num}</div>
            <h5 className="step-title">{step.title}</h5>
            <p className="step-desc">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DecisionOverview
