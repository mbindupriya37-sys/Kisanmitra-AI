import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { resolveApiBaseUrl } from './apiBaseUrl.js'

describe('API base URL resolution', () => {
  it('adds /api when configured with only the Render host', () => {
    assert.equal(
      resolveApiBaseUrl('https://kisanmitra-ai-backened.onrender.com', false),
      'https://kisanmitra-ai-backened.onrender.com/api',
    )
  })

  it('preserves an explicitly configured /api path and removes trailing slashes', () => {
    assert.equal(
      resolveApiBaseUrl('https://kisanmitra-ai-backened.onrender.com/api/', false),
      'https://kisanmitra-ai-backened.onrender.com/api',
    )
  })

  it('defaults to localhost for development and Render for production', () => {
    assert.equal(resolveApiBaseUrl('', true), 'http://localhost:8080/api')
    assert.equal(
      resolveApiBaseUrl(undefined, false),
      'https://kisanmitra-ai-backened.onrender.com/api',
    )
  })

  it('resolves registration and login endpoints under /api/auth', () => {
    const baseUrl = resolveApiBaseUrl('https://kisanmitra-ai-backened.onrender.com', false)

    assert.equal(new URL(`${baseUrl}/auth/register`).href,
      'https://kisanmitra-ai-backened.onrender.com/api/auth/register')
    assert.equal(new URL(`${baseUrl}/auth/login`).href,
      'https://kisanmitra-ai-backened.onrender.com/api/auth/login')
  })
})