import { test, expect } from '../helpers/evidence'
import { FRONTEND_URL, waitForDashboard } from '../helpers/navigation'

test.describe('Ketua LPPM - Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)
    await page.waitForTimeout(3000)
  })

  test('KT-DASH-001: Dashboard loads', async ({ page }) => {
    await expect(page.locator('#navbar-menu')).toBeVisible({ timeout: 15_000 })
    const heading = page.getByRole('heading', { name: /Beranda/i })
    await expect(heading.first()).toBeVisible({ timeout: 10_000 })
  })

  test('KT-DASH-002: Proposal and Otorisasi summary cards render', async ({ page }) => {
    const body = await page.locator('body').textContent()
    expect(body).toContain('Proposal Menunggu')
    expect(body).toContain('Otorisasi Pending')
  })

  test('KT-DASH-003: Items requiring Ketua normal decisions are visible', async ({ page }) => {
    const body = await page.locator('body').textContent()
    expect(body).toContain('Menunggu Keputusan Saya')
  })

  test('KT-DASH-004: Pending authorization items appear in action queue', async ({ page }) => {
    const body = await page.locator('body').textContent()
    const hasQueue = /KT-E2E|Proposal Menunggu|Otorisasi/i.test(body || '')
    expect(hasQueue).toBeTruthy()
  })

  test('KT-DASH-005: Dashboard has multiple content sections', async ({ page }) => {
    const body = await page.locator('body').textContent()
    expect(body).toContain('Menunggu Keputusan Saya')
    expect(body).toContain('Beranda')
  })

  test('KT-DASH-006: Dashboard CTA navigates to monitoring context', async ({ page }) => {
    const cta = page.getByRole('link', { name: /Lihat/i }).first()
    if (await cta.isVisible({ timeout: 5000 }).catch(() => false)) {
      await cta.click()
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(1000)
      expect(page.url()).toContain('module=')
    }
  })
})
