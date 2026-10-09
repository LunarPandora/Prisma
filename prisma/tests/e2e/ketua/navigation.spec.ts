import { test, expect } from '../helpers/evidence'
import { FRONTEND_URL, waitForDashboard } from '../helpers/navigation'

test.describe('Ketua LPPM - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)
    await page.waitForTimeout(3000)
  })

  test('KT-NAV-001: Sidebar shows navigation icons for Ketua', async ({ page }) => {
    const sidebar = page.locator('#navbar-menu')
    await expect(sidebar).toBeVisible({ timeout: 15_000 })
    const navIcons = sidebar.locator('svg, [class*="fa-"], img, a')
    const count = await navIcons.count()
    expect(count).toBeGreaterThan(0)
  })

  test('KT-NAV-002: Proposal monitoring is accessible', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)
    const body = await page.locator('body').textContent()
    const hasContent = /Monitoring|Skema|Proposal/i.test(body || '')
    expect(hasContent).toBeTruthy()
  })

  test('KT-NAV-003: Laporan monitoring is accessible', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogresslaporan`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)
    const body = await page.locator('body').textContent()
    const hasContent = /Monitoring|Laporan/i.test(body || '')
    expect(hasContent).toBeTruthy()
  })

  test('KT-NAV-004: Monitoring Progress page loads for Ketua', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)
    const body = await page.locator('body').textContent()
    expect(body).toContain('Monitoring Progress')
  })

  test('KT-NAV-005: Staff-only destructive actions not visible to Ketua', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)
    const body = await page.locator('body').textContent()
    const hasStaffAction = /Kembalikan dari Seleksi/i.test(body || '')
    expect(hasStaffAction).toBeFalsy()
  })

  test('KT-NAV-006: Superadmin modules not exposed to Ketua', async ({ page }) => {
    const body = await page.locator('body').textContent()
    const hasSuperadmin = /superadmin/i.test(body || '')
    expect(hasSuperadmin).toBeFalsy()
  })
})
