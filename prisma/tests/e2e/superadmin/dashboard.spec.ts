import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard } from '../helpers/navigation'

test.describe('Superadmin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)
  })

  test('SA-DASH-001: Dashboard loads with correct heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Beranda' })).toBeVisible()
    await expect(page.getByText('Overview sistem PRISMA')).toBeVisible()
  })

  test('SA-DASH-002: Summary cards render with correct labels', async ({ page }) => {
    await expect(page.getByText('Total Pengguna')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Total Skema')).toBeVisible()
    await expect(page.getByText('Total Proposal')).toBeVisible()
    await expect(page.getByText('Laporan Aktif')).toBeVisible()
  })

  test('SA-DASH-003: Sidebar shows Superadmin menu with logout section', async ({ page }) => {
    await expect(page.locator('#navbar-menu')).toBeVisible()
    await expect(page.locator('#logout-section')).toBeVisible()
  })
})
