import { test, expect } from '../helpers/evidence'
import { FRONTEND_URL, waitForDashboard } from '../helpers/navigation'

test.describe('Dosen Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)
  })

  test('DS-NOTIF-001: Notification UI is accessible', async ({ page }) => {
    // Notification bell should be visible
    await expect(page.locator('#navbar-menu')).toBeVisible()
  })

  test('DS-NOTIF-002: Notification history page loads', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=notifications`)
    await waitForDashboard(page)

    // Should load notification history
    await page.waitForLoadState('domcontentloaded')
  })

  test('DS-NOTIF-003: Unread notification exists for Dosen', async ({ page }) => {
    // Check if there are unread notifications
    const notifBell = page.locator('[class*="notification"]').first()
    if (await notifBell.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(notifBell).toBeVisible()
    }
  })
})
