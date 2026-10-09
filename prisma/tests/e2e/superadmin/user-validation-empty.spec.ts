import { test, expect, captureApiEvidence } from '../helpers/evidence'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../helpers/navigation'

const BACKEND = process.env.E2E_BACKEND_URL || 'http://localhost:8000'

async function apiPostWithCsrf(page: import('@playwright/test').Page, path: string, body: Record<string, unknown>) {
  return page.evaluate(async ({ backend, path, body }) => {
    const xsrf = document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))
    const token = xsrf ? decodeURIComponent(xsrf.split('=')[1]) : ''
    const res = await fetch(`${backend}/api${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-XSRF-TOKEN': token,
      },
      credentials: 'include',
      body: JSON.stringify(body),
    })
    return { status: res.status, body: await res.json().catch(() => ({})) }
  }, { backend: BACKEND, path, body })
}

test.describe('Superadmin — Empty Required Fields Validation', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToModule(page, 'users')
    await waitForDashboard(page)
  })

  test('SA-USER-VAL-004: Create user with nama/email/password empty returns 422', async ({ page }) => {
    const response = await apiPostWithCsrf(page, '/users/add', {
      nama: '',
      email: '',
      password: '',
      role: 'Staff LPPM',
      status: 'Aktif',
    })
    await captureApiEvidence(page, 'SA-USER-VAL-004', 'POST', '/users/add', {
      nama: '', email: '', password: '', role: 'Staff LPPM', status: 'Aktif',
    })

    expect(response.status).toBe(422)
    expect(response.body.errors).toBeDefined()
  })
})
