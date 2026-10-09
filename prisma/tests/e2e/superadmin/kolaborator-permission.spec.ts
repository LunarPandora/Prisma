import { test, expect } from '../helpers/evidence'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../helpers/navigation'

const BACKEND = process.env.E2E_BACKEND_URL || 'http://localhost:8000'

async function apiGetWithCsrf(page: import('@playwright/test').Page, path: string) {
  return page.evaluate(async ({ backend, path }) => {
    const xsrf = document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))
    const token = xsrf ? decodeURIComponent(xsrf.split('=')[1]) : ''
    const res = await fetch(`${backend}/api${path}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'X-XSRF-TOKEN': token },
      credentials: 'include',
    })
    return { status: res.status, body: await res.json().catch(() => ({})) }
  }, { backend: BACKEND, path })
}

async function apiPostWithCsrf(page: import('@playwright/test').Page, path: string, body: Record<string, unknown>) {
  return page.evaluate(async ({ backend, path, body }) => {
    const xsrf = document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))
    const token = xsrf ? decodeURIComponent(xsrf.split('=')[1]) : ''
    const res = await fetch(`${backend}/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-XSRF-TOKEN': token },
      credentials: 'include',
      body: JSON.stringify(body),
    })
    return { status: res.status, body: await res.json().catch(() => ({})) }
  }, { backend: BACKEND, path, body })
}

async function apiDeleteWithCsrf(page: import('@playwright/test').Page, path: string) {
  return page.evaluate(async ({ backend, path }) => {
    const xsrf = document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))
    const token = xsrf ? decodeURIComponent(xsrf.split('=')[1]) : ''
    const res = await fetch(`${backend}/api${path}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json', 'X-XSRF-TOKEN': token },
      credentials: 'include',
    })
    return { status: res.status, body: await res.json().catch(() => ({})) }
  }, { backend: BACKEND, path })
}

test.describe('Superadmin - Kolaborator Permission Boundary', () => {
  test('SA-KOLAB-PERM-001: Superadmin does NOT see Kolaborator module in sidebar', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)

    const menu = page.locator('#navbar-menu')
    await expect(menu).toBeVisible()
    const kolabLink = page.locator('#navbar-menu a[href*="kolaborator"], #navbar-menu [data-key="kolaborator"]')
    await expect(kolabLink).not.toBeVisible()
  })

  test('SA-KOLAB-PERM-002: Superadmin cannot create Kolaborator via API', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)

    const response = await apiPostWithCsrf(page, '/kolaborator/add', {
      nama: 'Unauthorized',
      email: 'unauth@university.ac.id',
    })
    expect(response.status).toBe(403)
  })

  test('SA-KOLAB-PERM-003: Superadmin cannot update Kolaborator via API', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)

    const response = await apiPostWithCsrf(page, '/kolaborator/update', {
      kolab_id: 1,
      nama: 'Unauthorized Update',
    })
    expect(response.status).toBe(403)
  })

  test('SA-KOLAB-PERM-004: Superadmin cannot delete Kolaborator via API', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)

    const response = await apiDeleteWithCsrf(page, '/kolaborator/delete/1')
    expect(response.status).toBe(403)
  })
})
