const LOCAL_API_BASE_URL = 'http://localhost:8080/api'
const PRODUCTION_API_BASE_URL = 'https://kisanmitra-ai-backened.onrender.com/api'

export function resolveApiBaseUrl(configuredBaseUrl, isDevelopment) {
  const candidate = configuredBaseUrl?.trim()
    || (isDevelopment ? LOCAL_API_BASE_URL : PRODUCTION_API_BASE_URL)
  const normalized = candidate.replace(/\/+$/, '')

  return normalized.endsWith('/api') ? normalized : `${normalized}/api`
}