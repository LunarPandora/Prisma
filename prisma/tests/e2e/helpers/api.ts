import { type APIRequestContext, expect } from '@playwright/test'

const BACKEND_URL = process.env.E2E_BACKEND_URL || 'http://localhost:8000'

/**
 * Make an authenticated API request using session cookies.
 * Requires the browser context to have valid session cookies.
 */
export async function apiGet(
  request: APIRequestContext,
  path: string,
  options?: { params?: Record<string, string> }
) {
  const url = new URL(`${BACKEND_URL}/api${path}`)
  if (options?.params) {
    Object.entries(options.params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  const response = await request.get(url.toString())
  return response
}

/**
 * POST to a backend API endpoint.
 */
export async function apiPost(
  request: APIRequestContext,
  path: string,
  data?: Record<string, unknown>
) {
  const response = await request.post(`${BACKEND_URL}/api${path}`, {
    data,
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  })
  return response
}

/**
 * Assert API response is successful.
 */
export async function expectApiSuccess(response: Awaited<ReturnType<typeof apiGet>>) {
  expect(response.ok()).toBeTruthy()
  return response.json()
}
