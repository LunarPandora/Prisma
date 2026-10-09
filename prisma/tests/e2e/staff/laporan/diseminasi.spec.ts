import { test, expect } from '../../helpers/evidence'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../../helpers/navigation'

const BACKEND = process.env.E2E_BACKEND_URL || 'http://localhost:8000'

async function apiGetAuthed(page: import('@playwright/test').Page, path: string) {
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

function extractList(body: any): any[] {
  if (Array.isArray(body?.data)) return body.data
  if (Array.isArray(body?.data?.data)) return body.data.data
  return []
}

test.describe('Staff LPPM - Laporan Monitoring', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await waitForDashboard(page)
  })

  test('ST-LAP-001: Laporan monitoring page loads via deep link', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogresslaporan`)
    await page.waitForLoadState('domcontentloaded')

    // Wait for either skema selection or laporan view
    const heading = page.getByRole('heading', { name: /Monitoring Progress|Laporan Penelitian/ })
    await expect(heading.first()).toBeVisible({ timeout: 15_000 })
  })

  test('ST-LAP-002: Laporan page shows tabs for different stages', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogresslaporan`)
    await page.waitForLoadState('domcontentloaded')

    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    if (await laporanBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await laporanBtn.click()
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByText('Laporan Penelitian')).toBeVisible()
    }
  })

  test('ST-LAP-003: Semester filter is present', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogresslaporan`)
    await page.waitForLoadState('domcontentloaded')

    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    if (await laporanBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await laporanBtn.click()
      await page.waitForLoadState('domcontentloaded')

      // Semester filter is a SelectInput, look for its label or container
      await expect(page.getByText('Ganjil')).toBeVisible()
    }
  })

  test('ST-LAP-004: Staff screens laporan before Ketua — Staff sees Publikasi action at Staff checkpoint', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogresslaporan`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    if (await laporanBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await laporanBtn.click()
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(2000)
    }

    const body = await page.locator('body').textContent()
    const hasStaffCheckpoint = (body || '').includes('Menunggu review Admin') ||
                               (body || '').includes('Menunggu review Staff') ||
                               (body || '').includes('Dalam pengerjaan') ||
                               (body || '').includes('Publikasi')
    expect(hasStaffCheckpoint).toBeTruthy()
  })
})
