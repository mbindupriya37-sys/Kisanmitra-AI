import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import LanguageSelector from './LanguageSelector'

function Navbar({ isDarkMode, onToggleDarkMode }) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="navbar">
      <div className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <div className="brand-icon">🌾</div>
        <div>
          <h1>{t('app.name', 'KisanMitra AI')}</h1>
          <span>{t('app.tagline', 'Smart • Sustainable • Informed Farming')}</span>
        </div>
      </div>

      <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <a href="#home" onClick={() => setMobileMenuOpen(false)}>{t('nav.home', 'Home')}</a>
        <a href="#features" onClick={() => setMobileMenuOpen(false)}>{t('nav.features', 'Features')}</a>
        <a href="#about" onClick={() => setMobileMenuOpen(false)}>{t('nav.about', 'About')}</a>
        <a href="#schemes" onClick={() => setMobileMenuOpen(false)}>{t('nav.schemes', 'Schemes')}</a>
        <a href="#faqs" onClick={() => setMobileMenuOpen(false)}>{t('nav.faqs', 'FAQs')}</a>
      </nav>

      <div className="nav-actions">
        <LanguageSelector id="navbar-language-select" />
        <button
          className="theme-toggle-btn"
          onClick={onToggleDarkMode}
          title={isDarkMode ? t('nav.switchToLight', 'Switch to Light Mode') : t('nav.switchToDark', 'Switch to Dark Mode')}
          aria-label={t('nav.toggleTheme', 'Toggle Theme')}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>

        <button className="nav-login" onClick={() => navigate('/login')}>
          {t('nav.login', 'Login')}
        </button>

        <button className="nav-register" onClick={() => navigate('/register')}>
          {t('nav.register', 'Get Started')}
        </button>

        <button
          className="hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={t('nav.toggleMobileNav', 'Toggle Mobile Navigation')}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  )
}

export default Navbar
