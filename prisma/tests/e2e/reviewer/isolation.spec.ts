import { test, expect } from '../helpers/evidence'
import { FRONTEND_URL } from '../helpers/navigation'

test.describe('Reviewer - Isolation & Permissions', () => {
  test('RV-ISO-001: Reviewer cannot access staff monitoring page', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const body = await page.locator('body').textContent()
    const hasStaffContent = (body || '').includes('Monitoring Progress Pengajuan')
    expect(hasStaffContent).toBeFalsy()
  })

  test('RV-PERM-001: Reviewer does not see reviewer assignment controls', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=reviewproposal`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const body = await page.locator('body').textContent()
    const hasAssignmentControls = (body || '').includes('Penugasan Reviewer') || (body || '').includes('Tugaskan Reviewer')
    expect(hasAssignmentControls).toBeFalsy()
  })

  test('RV-AUTHZ-001: Reviewer cannot access Ketua authorization controls', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=reviewproposal`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const body = await page.locator('body').textContent()
    const hasAuthControls = (body || '').includes('Permintaan Otorisasi') || (body || '').includes('Setujui') || (body || '').includes('Tolak pengajuan')
    expect(hasAuthControls).toBeFalsy()
  })

  test('RV-NOTIF-001: Reviewer notification bell is visible', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)

    const sidebar = page.locator('#navbar-menu')
    await expect(sidebar).toBeVisible({ timeout: 10_000 })

    const bellArea = sidebar.locator('[class*="notification"], [class*="bell"], svg').last()
    const visible = await bellArea.isVisible().catch(() => false)
    expect(visible).toBeTruthy()
  })
})
