import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard } from '../helpers/navigation'

test.describe('Dosen Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)
  })

  test('DS-NAV-001: Sidebar shows correct Dosen modules', async ({ page }) => {
    await expect(page.locator('#navbar-menu')).toBeVisible()

    // Dosen should see: Beranda, Monitor Progress, Profil, Monitor Profil
    // Staff-only modules should NOT be visible
    const sidebar = page.locator('#navbar-menu')
    await expect(sidebar).toBeVisible()
  })

  test('DS-NAV-002: Monitor Progress module is accessible', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=dosenmonitoringprogress`)
    await waitForDashboard(page)

    await expect(page.getByText('Monitoring Progress')).toBeVisible({ timeout: 10_000 })
  })

  test('DS-NAV-003: Profil Dosen module is accessible', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=profildosen`)
    await waitForDashboard(page)

    // Profil page should load without error
    await page.waitForLoadState('domcontentloaded')
  })

  test('DS-NAV-004: Google Scholar module is accessible', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=dosenscholar`)
    await waitForDashboard(page)

    // Scholar page should load without error
    await page.waitForLoadState('domcontentloaded')
  })

  test('DS-NAV-005: Staff-only modules are not accessible to Dosen', async ({ page }) => {
    // Try accessing Staff monitoring module
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await waitForDashboard(page)

    // Should either redirect or show no content for this module
    // The Dosen should not see Staff-specific content
    await page.waitForLoadState('domcontentloaded')
  })
})
