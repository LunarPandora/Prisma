import { test, expect } from '../helpers/evidence'
import { FRONTEND_URL } from '../helpers/navigation'

test.describe('Reviewer - Authentication', () => {
  test('RV-AUTH-001: Valid Reviewer login succeeds (dashboard loads)', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
    await expect(page.locator('#navbar-menu')).toBeVisible({ timeout: 15_000 })
  })

  test('RV-AUTH-002: Authenticated Reviewer cannot return to login page', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
    await expect(page.locator('#navbar-menu')).toBeVisible({ timeout: 15_000 })

    await page.goto(`${FRONTEND_URL}/login`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
    const url = page.url()
    expect(url).toContain('dashboard')
  })

  test('RV-AUTH-003: Reviewer cannot access Staff-only modules', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
    await expect(page.locator('#navbar-menu')).toBeVisible({ timeout: 15_000 })

    const sidebar = page.locator('#navbar-menu')
    const sidebarText = await sidebar.textContent()
    const hasStaffModules = sidebarText?.includes('Pengajuan') && sidebarText?.includes('Kelola')
    expect(hasStaffModules).toBeFalsy()
  })
})
