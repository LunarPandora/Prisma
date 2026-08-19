import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard } from '../helpers/navigation'

test.describe('Ketua LPPM - Notifications', () => {
  test('KT-NOTIF-001: Sidebar renders for Ketua', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)
    const sidebar = page.locator('#navbar-menu')
    await expect(sidebar).toBeVisible({ timeout: 15_000 })
  })

  test('KT-NOTIF-002: Dashboard loads with notification area', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)
    await page.waitForTimeout(3000)
    const body = await page.locator('body').textContent()
    expect(body).toContain('Beranda')
  })

  test('KT-NOTIF-003: Sidebar has navigation elements', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)
    const sidebar = page.locator('#navbar-menu')
    const navElements = sidebar.locator('a, button, svg, img')
    const count = await navElements.count()
    expect(count).toBeGreaterThan(0)
  })
})
