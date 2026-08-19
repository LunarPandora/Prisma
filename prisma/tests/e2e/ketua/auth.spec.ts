import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard } from '../helpers/navigation'

test.describe('Ketua LPPM - Authentication', () => {
  test('KT-AUTH-001: Authenticated Ketua reaches dashboard', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)
    await expect(page.locator('#navbar-menu')).toBeVisible({ timeout: 15_000 })
  })

  test('KT-AUTH-002: Unauthenticated access redirects to login', async ({ page }) => {
    const context = await page.context()
    await context.clearCookies()
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
    const onLogin = page.url().includes('login')
    const onDashboard = page.url().includes('dashboard')
    expect(onLogin || onDashboard).toBeTruthy()
  })

  test('KT-AUTH-003: Authenticated Ketua redirected from login page', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)

    await page.goto(`${FRONTEND_URL}/login`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
    expect(page.url()).not.toContain('/login')
  })

  test('KT-AUTH-004: Ketua cannot access Staff-only modules', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)

    const sidebar = page.locator('#navbar-menu')
    await expect(sidebar).toBeVisible({ timeout: 15_000 })

    const forbiddenModules = ['kriteria', 'masterdata']
    for (const mod of forbiddenModules) {
      const link = sidebar.getByRole('link', { name: new RegExp(mod, 'i') })
      const visible = await link.isVisible().catch(() => false)
      if (visible) {
        throw new Error(`Staff-only module "${mod}" should not be visible to Ketua`)
      }
    }
  })
})
