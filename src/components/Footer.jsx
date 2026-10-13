import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

function Footer() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="brand-icon">🌾</div>
            <div>
              <h2 className="footer-title">{t('app.name')}</h2>
              <span>{t('app.tagline')}</span>
            </div>
          </div>
          <p className="footer-tagline">
            {t('landing.footerTagline')}
          </p>
        </div>

        <div className="footer-links-group">
          <div className="footer-col">
            <h4>{t('landing.footerColPlatform')}</h4>
            <a href="#home">{t('nav.home')}</a>
            <a href="#features">{t('nav.features')}</a>
            <a href="#how-it-works">{t('landing.howItWorksHeading')}</a>
            <a href="#signature-features">{t('landing.footerLinkCoreAi')}</a>
          </div>

          <div className="footer-col">
            <h4>{t('landing.footerColQuickLinks')}</h4>
            <a href="#schemes">{t('nav.schemes')}</a>
            <a href="#about">{t('landing.footerLinkAbout')}</a>
            <span onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>{t('nav.login')}</span>
            <span onClick={() => navigate('/register')} style={{ cursor: 'pointer' }}>{t('nav.register')}</span>
          </div>

          <div className="footer-col">
            <h4>{t('landing.footerColAcademic')}</h4>
            <p>{t('landing.footerAcademicLine1')}</p>
            <p>{t('landing.footerAcademicLine2')}</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>{t('landing.footerCopyright')}</p>
        <div className="footer-legal">
          <span>{t('landing.footerPrivacy')}</span>
          <span>{t('landing.footerTerms')}</span>
          <span>{t('landing.footerDisclaimer')}</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
