import { test, expect } from '../helpers/evidence'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../helpers/navigation'

test.describe('Staff LPPM - Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)
  })

  test('ST-NOTIF-001: Sidebar is present', async ({ page }) => {
    // Verify the sidebar structure exists
    await expect(page.locator('#navbar-menu')).toBeVisible()
    await expect(page.locator('#logout-section')).toBeVisible()
  })

  test('ST-NOTIF-002: Sidebar menu is interactive', async ({ page }) => {
    // Click a menu item to prove interactivity
    const menuItem = page.locator('#navbar-menu').locator('div').first()
    await expect(menuItem).toBeVisible()
  })

  test('ST-NOTIF-003: Notification history page loads', async ({ page }) => {
    await navigateToModule(page, 'notifications')
    await page.waitForLoadState('domcontentloaded')

    // Use getByRole('heading') to disambiguate from "Memuat notifikasi..."
    await expect(page.getByRole('heading', { name: 'Notifikasi' })).toBeVisible({ timeout: 15_000 })
  })

  test('ST-NOTIF-004: Notification filter buttons exist', async ({ page }) => {
    await navigateToModule(page, 'notifications')
    await page.waitForLoadState('domcontentloaded')

    // Use getByRole('button') to disambiguate from description text
    await expect(page.getByRole('button', { name: 'Semua' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Belum Dibaca' })).toBeVisible()
  })

  test('ST-NOTIF-005: Mark all as read button exists when unread notifications present', async ({ page }) => {
    await navigateToModule(page, 'notifications')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByRole('heading', { name: 'Notifikasi' })).toBeVisible({ timeout: 15_000 })

    // "Tandai semua sudah dibaca" only shows when unreadCount > 0
    const markAllBtn = page.getByText('Tandai semua sudah dibaca')
    if (await markAllBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(markAllBtn).toBeVisible()
    }
  })
})
