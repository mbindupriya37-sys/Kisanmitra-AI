import { useLanguage } from '../context/LanguageContext'

function HowItWorks() {
  const { t } = useLanguage()

  const steps = [
    {
      number: '01',
      icon: '📝',
      title: t('landing.step1Title'),
      description: t('landing.step1Desc'),
    },
    {
      number: '02',
      icon: '⚡',
      title: t('landing.step2Title'),
      description: t('landing.step2Desc'),
    },
    {
      number: '03',
      icon: '🤖',
      title: t('landing.step3Title'),
      description: t('landing.step3Desc'),
    },
    {
      number: '04',
      icon: '🎯',
      title: t('landing.step4Title'),
      description: t('landing.step4Desc'),
    },
  ]

  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="section-heading">
        <span>{t('landing.howItWorksPre')}</span>
        <h2>{t('landing.howItWorksHeading')}</h2>
        <p>{t('landing.howItWorksSub')}</p>
      </div>

      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={step.number} className="step-card">
            <div className="step-header">
              <span className="step-number">{step.number}</span>
              <span className="step-icon">{step.icon}</span>
            </div>

            <h3>{step.title}</h3>
            <p>{step.description}</p>

            {index < steps.length - 1 && <div className="step-connector-arrow">➔</div>}
          </div>
        ))}
      </div>
    </section>
  )
}

export default HowItWorks
