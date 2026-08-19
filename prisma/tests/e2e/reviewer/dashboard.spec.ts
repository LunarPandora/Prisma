import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard } from '../helpers/navigation'

test.describe('Reviewer - Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)
    await page.waitForTimeout(3000)
  })

  test('RV-DASH-001: Reviewer dashboard loads successfully', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /Beranda/i }).first()
    await expect(heading).toBeVisible({ timeout: 10_000 })
  })

  test('RV-DASH-002: Review workload summary cards render', async ({ page }) => {
    await expect(page.getByText('Menunggu Review')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Sedang Dikerjakan')).toBeVisible({ timeout: 5_000 })
    await expect(page.getByText('Review Selesai')).toBeVisible({ timeout: 5_000 })
  })

  test('RV-DASH-003: Dashboard shows review queue section', async ({ page }) => {
    const queueSection = page.getByText('Antrian Review')
    await expect(queueSection.first()).toBeVisible({ timeout: 10_000 })
  })

  test('RV-DASH-004: Dashboard shows queue or empty state', async ({ page }) => {
    const hasQueue = await page.getByText('Antrian Review').first().isVisible().catch(() => false)
    const hasEmptyState = await page.getByText('Tidak ada review yang menunggu').isVisible().catch(() => false)
    expect(hasQueue || hasEmptyState).toBeTruthy()
  })
})

test.describe('Reviewer - Navigation', () => {
  test('RV-NAV-001: Reviewer sidebar has menu items', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)
    const sidebar = page.locator('#navbar-menu')
    const menuItems = sidebar.locator('[class*="cursor-pointer"]')
    const count = await menuItems.count()
    expect(count).toBeGreaterThan(0)
  })

  test('RV-NAV-002: Proposal review page is accessible', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=reviewproposal`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)
    const body = await page.locator('body').textContent()
    expect(body).toContain('Monitoring Proses Review')
  })

  test('RV-NAV-003: Review Laporan tab is accessible', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=reviewproposal`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const laporanTab = page.getByRole('button', { name: 'Review Laporan' })
    await expect(laporanTab).toBeVisible({ timeout: 10_000 })
    await laporanTab.click()
    await page.waitForTimeout(1000)
    const body = await page.locator('body').textContent()
    expect(body).toContain('Monitoring Proses Review')
  })
})
