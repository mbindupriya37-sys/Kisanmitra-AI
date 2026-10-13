import React from 'react'
import { LanguageContext } from '../context/LanguageContext'
import {
  initialErrorBoundaryState,
  deriveErrorBoundaryState,
  resetErrorBoundaryState,
  sanitizeErrorForLogging,
} from './errorBoundaryModel.js'
import './ErrorBoundary.css'

/**
 * Reusable React Error Boundary for KisanMitra AI.
 * Catches render-time JavaScript exceptions in child component trees,
 * prevents blank-screen application failures, and provides a polished,
 * multilingual (EN / TE / HI) agricultural recovery UI.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { ...initialErrorBoundaryState }
  }

  static getDerivedStateFromError(error) {
    return deriveErrorBoundaryState(error)
  }

  componentDidCatch(error, errorInfo) {
    const safeInfo = sanitizeErrorForLogging(error)
    if (typeof console !== 'undefined' && console.error) {
      console.error(
        'KisanMitra AI Error Boundary caught a rendering error:',
        safeInfo.name,
        errorInfo?.componentStack?.slice(0, 300) || ''
      )
    }

    if (typeof this.props.onError === 'function') {
      try {
        this.props.onError(error, errorInfo)
      } catch (err) {
        console.warn('Error in ErrorBoundary onError callback:', err)
      }
    }
  }

  handleReset = () => {
    if (typeof this.props.onReset === 'function') {
      try {
        this.props.onReset()
      } catch (err) {
        console.warn('Error in ErrorBoundary onReset callback:', err)
      }
    }
    this.setState(resetErrorBoundaryState())
  }

  handleNavigate = (path) => {
    if (typeof window !== 'undefined' && window.location) {
      window.location.href = path
    }
  }

  renderFallbackUI(t) {
    const badgeText = t('errorBoundary.badge', 'Decision Support Safeguard')
    const titleText = t('errorBoundary.title', 'Something went wrong in this section')
    const subtitleText = t(
      'errorBoundary.subtitle',
      'An unexpected rendering error occurred. Your agricultural records and farmer profile are safe.'
    )
    const adviceText = t(
      'errorBoundary.recoveryAdvice',
      'You can try reloading this section or return to the main dashboard to continue your farming decisions.'
    )
    const retryText = t('errorBoundary.retryButton', 'Try Again')
    const dashboardText = t('errorBoundary.dashboardButton', 'Go to Dashboard')
    const homeText = t('errorBoundary.homeButton', 'Go to Home')
    const helpNote = t(
      'errorBoundary.helpNote',
      'If this continues, contact your local Krishi Vigyan Kendra (KVK) or platform support.'
    )

    return (
      <div className="error-boundary-container" role="alert" aria-live="assertive">
        <div className="error-boundary-card">
          <div className="error-boundary-icon-wrapper" aria-hidden="true">
            🌱
          </div>
          <div>
            <span className="error-boundary-badge">{badgeText}</span>
          </div>
          <h2 className="error-boundary-title">{titleText}</h2>
          <p className="error-boundary-subtitle">{subtitleText}</p>
          <p className="error-boundary-advice">{adviceText}</p>

          <div className="error-boundary-actions">
            <button
              type="button"
              id="error-boundary-retry-btn"
              className="error-boundary-btn-retry"
              onClick={this.handleReset}
            >
              🔄 {retryText}
            </button>
            <button
              type="button"
              id="error-boundary-dashboard-btn"
              className="error-boundary-btn-nav"
              onClick={() => this.handleNavigate('/farmer/dashboard')}
            >
              📊 {dashboardText}
            </button>
            <button
              type="button"
              id="error-boundary-home-btn"
              className="error-boundary-btn-nav"
              onClick={() => this.handleNavigate('/')}
            >
              🏠 {homeText}
            </button>
          </div>

          <div className="error-boundary-footer">
            <span>ℹ️ {helpNote}</span>
          </div>
        </div>
      </div>
    )
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback({ error: this.state.error, resetError: this.handleReset })
          : this.props.fallback
      }

      return (
        <LanguageContext.Consumer>
          {(langContext) => {
            const t = langContext?.t || ((k, fallback) => fallback || k)
            return this.renderFallbackUI(t)
          }}
        </LanguageContext.Consumer>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
