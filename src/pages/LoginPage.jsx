import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import LanguageSelector from '../components/LanguageSelector'
import heroBg from '../assets/hero-agriculture.png'
import './Auth.css'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const validateField = (name, value) => {
    let error = ''
    if (name === 'email') {
      if (!value.trim()) {
        error = t('auth.errEmailRequired')
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        error = t('auth.errEmailInvalid')
      }
    } else if (name === 'password') {
      if (!value) {
        error = t('auth.errPasswordRequired')
      } else if (value.length < 6) {
        error = t('auth.errPasswordMin6')
      }
    }
    return error
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    setFormData((prev) => ({ ...prev, [name]: val }))
    setApiError('')

    if (touched[name]) {
      const fieldError = validateField(name, val)
      setErrors((prev) => ({ ...prev, [name]: fieldError }))
    }
  }

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    setTouched((prev) => ({ ...prev, [name]: true }))
    const fieldError = validateField(name, val)
    setErrors((prev) => ({ ...prev, [name]: fieldError }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const emailErr = validateField('email', formData.email)
    const passwordErr = validateField('password', formData.password)

    setTouched({ email: true, password: true })
    setErrors({ email: emailErr, password: passwordErr })

    if (!emailErr && !passwordErr) {
      setLoading(true)
      setApiError('')

      api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      })
      .then((res) => {
        const data = res.data
        const token = data.token

        // Call AuthContext login to persist token, safe user, and update React state
        login(data, token)

        const role = data.role
        if (role === 'FARMER') {
          navigate('/farmer/dashboard')
        } else if (role === 'EXPERT') {
          navigate('/expert/dashboard')
        } else if (role === 'ADMIN') {
          navigate('/admin/dashboard')
        } else {
          navigate('/')
        }
      })
      .catch((err) => {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setApiError(t('auth.errInvalidCredentials'))
        } else {
          setApiError(t('auth.errServerConnection'))
        }
      })
      .finally(() => {
        setLoading(false)
      })
    }
  }

  return (
    <div 
      className="auth-page"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(14, 38, 20, 0.78) 0%, rgba(7, 22, 12, 0.70) 100%), url(${heroBg})`
      }}
    >
      <div className="auth-header-nav">
        <Link to="/" className="back-home-link">
          {t('auth.backToHome')}
        </Link>
        <LanguageSelector id="login-language-select" />
      </div>

      <div className="auth-container">
        <div className="auth-hero-content">
          <div className="hero-badge">{t('auth.heroBadge')}</div>
          <h1 className="hero-headline">{t('auth.heroHeadline')}</h1>
          <p className="hero-subtext">
            {t('auth.heroSubtext')}
          </p>
        </div>

        <div className="auth-card">
        {/* 1. Branding */}
        <div className="auth-brand">
          <div className="auth-brand-icon">🌾</div>
          <div>
            <h2 className="auth-brand-title">{t('app.name')}</h2>
            <span className="auth-brand-sub">{t('app.tagline')}</span>
          </div>
        </div>

        {/* 2 & 3. Headings */}
        <h1 className="auth-title">{t('auth.loginTitle')}</h1>
        <p className="auth-subtitle">
          {t('auth.loginSubtitle')}
        </p>

        {apiError && (
          <div className="api-error-alert" style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            border: '1px solid #fca5a5'
          }}>
            {apiError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* 4. Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              {t('auth.emailLabel')}
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t('auth.emailPlaceholder')}
              className={`form-input ${errors.email ? 'has-error' : ''}`}
              disabled={loading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* 5 & 6. Password + Show/Hide */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              {t('auth.passwordLabel')}
            </label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t('auth.passwordPlaceholder')}
                className={`form-input ${errors.password ? 'has-error' : ''}`}
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-pwd-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* 7 & 8. Remember me + Forgot Password */}
          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={loading}
              />
              {t('auth.rememberMe')}
            </label>

            <a
              href="#forgot"
              className="forgot-link"
              onClick={(e) => {
                e.preventDefault()
                alert('Password reset functionality will be available soon.')
              }}
            >
              {t('auth.forgotPassword')}
            </a>
          </div>

          {/* 9. Login Button */}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? t('auth.btnSigningIn') : t('auth.btnSignIn')}
          </button>
        </form>

        {/* 10. Register Link */}
        <div className="auth-footer-text">
          {t('auth.noAccount')} <Link to="/register">{t('auth.registerLink')}</Link>
        </div>
      </div>
    </div>
  </div>
)
}

export default LoginPage
