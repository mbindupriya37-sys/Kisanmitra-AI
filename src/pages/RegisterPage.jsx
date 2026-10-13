import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import LanguageSelector from '../components/LanguageSelector'
import heroBg from '../assets/hero-agriculture.png'
import './Auth.css'

function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'Farmer',
    termsAccepted: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const validateField = (name, value, currentFormData = formData) => {
    let error = ''

    if (name === 'fullName') {
      if (!value.trim()) {
        error = t('auth.errNameRequired')
      } else if (value.trim().length < 2) {
        error = t('auth.errNameMin2')
      } else if (value.trim().length > 100) {
        error = t('auth.errNameMax100')
      }
    } else if (name === 'email') {
      if (!value.trim()) {
        error = t('auth.errEmailRequired')
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        error = t('auth.errEmailInvalid')
      }
    } else if (name === 'phone') {
      if (!value.trim()) {
        error = t('auth.errPhoneRequired')
      } else if (!/^[6-9]\d{9}$/.test(value.trim())) {
        error = t('auth.errPhoneInvalid')
      }
    } else if (name === 'password') {
      if (!value) {
        error = t('auth.errPasswordRequired')
      } else if (value.length < 8) {
        error = t('auth.errPasswordMin8')
      }
    } else if (name === 'confirmPassword') {
      if (!value) {
        error = t('auth.errConfirmPasswordRequired')
      } else if (value !== currentFormData.password) {
        error = t('auth.errPasswordsDoNotMatch')
      }
    } else if (name === 'termsAccepted') {
      if (!value) {
        error = t('auth.errTermsRequired')
      }
    }

    return error
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value

    const updatedFormData = { ...formData, [name]: val }
    setFormData(updatedFormData)
    setApiError('')
    setSuccessMessage('')

    if (touched[name]) {
      const fieldError = validateField(name, val, updatedFormData)
      setErrors((prev) => ({ ...prev, [name]: fieldError }))
    }

    if (name === 'password' && touched.confirmPassword) {
      const confirmErr = validateField('confirmPassword', formData.confirmPassword, updatedFormData)
      setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }))
    }
  }

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    setTouched((prev) => ({ ...prev, [name]: true }))
    const fieldError = validateField(name, val, formData)
    setErrors((prev) => ({ ...prev, [name]: fieldError }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const nameErr = validateField('fullName', formData.fullName)
    const emailErr = validateField('email', formData.email)
    const phoneErr = validateField('phone', formData.phone)
    const passwordErr = validateField('password', formData.password)
    const confirmPasswordErr = validateField('confirmPassword', formData.confirmPassword)
    const termsErr = validateField('termsAccepted', formData.termsAccepted)

    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      termsAccepted: true,
    })

    const newErrors = {
      fullName: nameErr,
      email: emailErr,
      phone: phoneErr,
      password: passwordErr,
      confirmPassword: confirmPasswordErr,
      termsAccepted: termsErr,
    }

    setErrors(newErrors)

    const hasErrors = Object.values(newErrors).some((err) => Boolean(err))

    if (!hasErrors) {
      setLoading(true)
      setApiError('')
      setSuccessMessage('')

      try {
        const payload = {
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          role: formData.role.toUpperCase(),
        }

        const res = await api.post('/auth/register', payload)
        const data = res.data

        setSuccessMessage(t('auth.successAccountCreated'))

        if (data && data.token) {
          login(data, data.token)
        }

        setTimeout(() => {
          if (data && data.role === 'FARMER') {
            navigate('/farmer/dashboard')
          } else if (data && data.role === 'EXPERT') {
            navigate('/expert/dashboard')
          } else {
            navigate('/farmer/dashboard')
          }
        }, 1200)
      } catch (err) {
        if (err.response) {
          if (err.response.status === 409) {
            setApiError(t('auth.errEmailConflict'))
          } else if (err.response.status === 400) {
            if (err.response.data?.errors) {
              const backendFieldErrors = err.response.data.errors
              setErrors((prev) => ({ ...prev, ...backendFieldErrors }))
              setApiError(t('auth.errInvalidDetails'))
            } else {
              setApiError(err.response.data?.message || t('auth.errInvalidDetails'))
            }
          } else {
            setApiError(err.response.data?.message || t('auth.errRegFailed'))
          }
        } else if (err.request) {
          setApiError(t('auth.errServerConnection'))
        } else {
          setApiError(err.message || t('auth.errRegFailed'))
        }
      } finally {
        setLoading(false)
      }
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
        <LanguageSelector id="register-language-select" />
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

        {/* 2. Heading */}
        <h1 className="auth-title">{t('auth.registerTitle')}</h1>
        <p className="auth-subtitle">
          {t('auth.registerSubtitle')}
        </p>

        {apiError && (
          <div
            className="api-error-alert"
            style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              border: '1px solid #fca5a5',
            }}
          >
            {apiError}
          </div>
        )}

        {successMessage && (
          <div
            className="api-success-alert"
            style={{
              backgroundColor: '#ecfdf5',
              color: '#059669',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              border: '1px solid #a7f3d0',
              fontWeight: 600,
            }}
          >
            ✓ {successMessage}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* 9. Role Selection */}
          <div className="form-group">
            <label className="form-label">{t('auth.selectRoleLabel')}</label>
            <div className="role-selector">
              <label
                className={`role-card ${formData.role === 'Farmer' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="role"
                  value="Farmer"
                  checked={formData.role === 'Farmer'}
                  onChange={handleChange}
                />
                <div>
                  <div className="role-title">{t('auth.roleFarmer')}</div>
                  <div className="role-desc">{t('auth.roleFarmerDesc')}</div>
                </div>
              </label>

              <label
                className={`role-card ${formData.role === 'Expert' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="role"
                  value="Expert"
                  checked={formData.role === 'Expert'}
                  onChange={handleChange}
                />
                <div>
                  <div className="role-title">{t('auth.roleExpert')}</div>
                  <div className="role-desc">{t('auth.roleExpertDesc')}</div>
                </div>
              </label>
            </div>
          </div>

          {/* 3. Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">
              {t('auth.fullNameLabel')}
            </label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t('auth.fullNamePlaceholder')}
              className={`form-input ${errors.fullName ? 'has-error' : ''}`}
            />
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>

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
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* 5. Phone Number */}
          <div className="form-group">
            <label className="form-label" htmlFor="phone">
              {t('auth.phoneLabel')}
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t('auth.phonePlaceholder')}
              maxLength={10}
              className={`form-input ${errors.phone ? 'has-error' : ''}`}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          {/* 6 & 8. Password + Show/Hide */}
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
                placeholder={t('auth.regPasswordPlaceholder')}
                className={`form-input ${errors.password ? 'has-error' : ''}`}
              />
              <button
                type="button"
                className="toggle-pwd-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* 7 & 8. Confirm Password + Show/Hide */}
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              {t('auth.confirmPasswordLabel')}
            </label>
            <div className="input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                className={`form-input ${errors.confirmPassword ? 'has-error' : ''}`}
              />
              <button
                type="button"
                className="toggle-pwd-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          {/* 10. Terms Checkbox */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {t('auth.termsAgreement')}
            </label>
            {errors.termsAccepted && (
              <span className="error-text">{errors.termsAccepted}</span>
            )}
          </div>

          {/* 11. Create Account Button */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
            style={loading ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
          >
            {loading ? t('auth.btnCreatingAccount') : t('auth.btnCreateAccount')}
          </button>
        </form>

        {/* 12. Login Link */}
        <div className="auth-footer-text">
          {t('auth.alreadyHaveAccount')} <Link to="/login">{t('auth.loginLink')}</Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
