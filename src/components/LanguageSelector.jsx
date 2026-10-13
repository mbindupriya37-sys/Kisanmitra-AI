import { useLanguage } from '../context/LanguageContext'
import './LanguageSelector.css'

export default function LanguageSelector({ id = 'language-selector', className = '' }) {
  const { language, setLanguage, supportedLanguages, t } = useLanguage()

  const handleChange = (e) => {
    setLanguage(e.target.value)
  }

  return (
    <div className={`language-selector-wrapper ${className}`}>
      <label htmlFor={id} className="language-selector-label sr-only">
        {t('common.selectLanguage', 'Select Language')}
      </label>
      <div className="language-selector-box">
        <span className="language-globe-icon" aria-hidden="true">🌐</span>
        <select
          id={id}
          value={language}
          onChange={handleChange}
          className="language-select-input"
          aria-label={t('common.selectLanguage', 'Select Language')}
        >
          {supportedLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
