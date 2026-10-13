/**
 * ErrorBoundary State Model & Sanitization Utilities.
 * Pure JavaScript logic compatible with both Vite frontend builds and Node.js test runner.
 */

export const initialErrorBoundaryState = {
  hasError: false,
  error: null,
}

export const deriveErrorBoundaryState = (error) => ({
  hasError: true,
  error: error || new Error('Unknown rendering error'),
})

export const resetErrorBoundaryState = () => ({
  hasError: false,
  error: null,
})

export const sanitizeErrorForLogging = (error) => {
  if (!error) return { name: 'UnknownError', message: 'No details available' }
  return {
    name: error.name || 'Error',
    // Never expose raw stack traces, connection strings, or user secrets to logs
    message: 'An unexpected rendering error occurred.',
  }
}
