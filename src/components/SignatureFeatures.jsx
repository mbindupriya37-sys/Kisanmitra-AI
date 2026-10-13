import { useLanguage } from '../context/LanguageContext'

function SignatureFeatures() {
  const { t } = useLanguage()

  const signatures = [
    {
      icon: '🧠',
      tag: t('landing.sig1Tag'),
      title: t('landing.sig1Title'),
      desc: t('landing.sig1Desc'),
    },
    {
      icon: '📊',
      tag: t('landing.sig2Tag'),
      title: t('landing.sig2Title'),
      desc: t('landing.sig2Desc'),
    },
    {
      icon: '🛡️',
      tag: t('landing.sig3Tag'),
      title: t('landing.sig3Title'),
      desc: t('landing.sig3Desc'),
    },
  ]

  return (
    <section id="signature-features" className="signature-section">
      <div className="section-heading">
        <span>{t('landing.sigPre')}</span>
        <h2>{t('landing.sigHeading')}</h2>
        <p>{t('landing.sigSub')}</p>
      </div>

      <div className="signature-grid">
        {signatures.map((sig, idx) => (
          <div key={idx} className="signature-card">
            <div className="signature-icon-box">{sig.icon}</div>
            <span className="signature-tag">{sig.tag}</span>
            <h3>{sig.title}</h3>
            <p>{sig.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default SignatureFeatures
