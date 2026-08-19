import { test, expect } from '@playwright/test'
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

test.describe('Superadmin - User Validation via API', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToModule(page, 'users')
    await waitForDashboard(page)
  })

  test('SA-USER-VAL-002: Invalid role value is rejected via API', async ({ page }) => {
    const response = await apiPostWithCsrf(page, '/users/add', {
      nama: 'Hacker User',
      email: 'hacker@itbss.ac.id',
      password: 'password123',
      role: 'Hacker',
      status: 'Aktif',
    })
    expect(response.status).toBe(422)
    expect(response.body.errors).toBeDefined()
  })

  test('SA-USER-VAL-003: Invalid status value is rejected via API', async ({ page }) => {
    const response = await apiPostWithCsrf(page, '/users/add', {
      nama: 'Invalid Status User',
      email: 'invalid.status@itbss.ac.id',
      password: 'password123',
      role: 'Dosen',
      status: 'UnknownStatus',
    })
    expect(response.status).toBe(422)
    expect(response.body.errors).toBeDefined()
  })

  test('SA-USER-ID-001: Both NIDN and NUPTK empty is rejected for Dosen', async ({ page }) => {
    const response = await apiPostWithCsrf(page, '/users/add', {
      nama: 'No ID User',
      email: 'no.id@itbss.ac.id',
      password: 'password123',
      role: 'Dosen',
      status: 'Aktif',
      gender: 'L',
    })
    expect(response.status).toBe(422)
    expect(response.body.errors).toBeDefined()
  })

  test('SA-USER-ID-002: NIDN provided without NUPTK is valid', async ({ page }) => {
    const response = await apiPostWithCsrf(page, '/users/add', {
      nama: 'NIDN Only User',
      email: 'nidn.only@itbss.ac.id',
      password: 'password123',
      role: 'Dosen',
      status: 'Aktif',
      gender: 'L',
      nidn: '60001',
    })
    expect(response.status).not.toBe(422)
  })

  test('SA-USER-ID-003: NUPTK provided without NIDN is valid', async ({ page }) => {
    const response = await apiPostWithCsrf(page, '/users/add', {
      nama: 'NUPTK Only User',
      email: 'nuptk.only@itbss.ac.id',
      password: 'password123',
      role: 'Dosen',
      status: 'Aktif',
      gender: 'P',
      nuptk: '66001',
    })
    expect(response.status).not.toBe(422)
  })

  test('SA-USER-ID-004: Duplicate NIDN is rejected', async ({ page }) => {
    const response = await apiPostWithCsrf(page, '/users/add', {
      nama: 'Duplicate NIDN User',
      email: 'dup.nidn@itbss.ac.id',
      password: 'password123',
      role: 'Dosen',
      status: 'Aktif',
      gender: 'L',
      nidn: '50005',
    })
    expect(response.status).toBe(422)
    expect(response.body.errors).toBeDefined()
  })

  test('SA-USER-ID-005: Duplicate NUPTK is rejected', async ({ page }) => {
    const response = await apiPostWithCsrf(page, '/users/add', {
      nama: 'Duplicate NUPTK User',
      email: 'dup.nuptk@itbss.ac.id',
      password: 'password123',
      role: 'Dosen',
      status: 'Aktif',
      gender: 'L',
      nuptk: '55006',
    })
    expect(response.status).toBe(422)
    expect(response.body.errors).toBeDefined()
  })
})
