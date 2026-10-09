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

async function apiPutWithCsrf(page: import('@playwright/test').Page, path: string) {
  return page.evaluate(async ({ backend, path }) => {
    const xsrf = document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))
    const token = xsrf ? decodeURIComponent(xsrf.split('=')[1]) : ''
    const res = await fetch(`${backend}/api${path}`, {
      method: 'PUT',
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

test.describe('Superadmin - Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)
  })

  test('SA-NOTIF-001: Notification API endpoint returns data', async ({ page }) => {
    const response = await apiGetWithCsrf(page, '/notifications/')
    expect(response.status).toBe(200)
    expect(response.body.data).toBeDefined()
    expect(response.body.data.notifications).toBeDefined()
  })

  test('SA-NOTIF-002: Unread notification count endpoint works', async ({ page }) => {
    const response = await apiGetWithCsrf(page, '/notifications/unread-count')
    expect(response.status).toBe(200)
    expect(response.body.data).toHaveProperty('count')
  })

  test('SA-NOTIF-MUT-001: Mark notification as read', async ({ page }) => {
    const notifs = await apiGetWithCsrf(page, '/notifications/')
    const notifications = notifs.body.data?.notifications || []
    const unreadNotif = notifications.find((n: { is_read: boolean }) => !n.is_read)

    if (unreadNotif) {
      const markReadResponse = await apiPutWithCsrf(page, `/notifications/${unreadNotif.notification_id}/read`)
      expect(markReadResponse.status).toBe(200)
    }
  })

  test('SA-PERM-API-001: Superadmin cannot perform Staff operational mutations', async ({ page }) => {
    const response = await apiPostWithCsrf(page, '/proposal/update', {
      proposal_id: 1,
      action: 'staff_approve',
    })
    expect(response.status).toBe(403)
  })
})
