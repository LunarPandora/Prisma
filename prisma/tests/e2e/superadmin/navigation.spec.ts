import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../helpers/navigation'

test.describe('Superadmin Navigation & Permission Boundaries', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)
  })

  test('SA-NAV-001: Sidebar menu is visible for Superadmin', async ({ page }) => {
    const menu = page.locator('#navbar-menu')
    await expect(menu).toBeVisible()
    // Verify logout section is present (proves full sidebar loaded)
    await expect(page.locator('#logout-section')).toBeVisible()
  })

  test('SA-NAV-002: User management module is accessible', async ({ page }) => {
    await navigateToModule(page, 'users')
    await waitForDashboard(page)

    await expect(page.getByRole('heading', { name: 'Daftar Pengguna' })).toBeVisible({ timeout: 15_000 })
  })

  test('SA-NAV-003: Prodi management module is accessible', async ({ page }) => {
    await navigateToModule(page, 'prodi')
    await waitForDashboard(page)

    await expect(page.getByRole('heading', { name: 'Prodi' })).toBeVisible({ timeout: 15_000 })
  })

  test('SA-NAV-004: Mahasiswa management module is accessible', async ({ page }) => {
    await navigateToModule(page, 'mahasiswa')
    await waitForDashboard(page)

    await expect(page.getByRole('heading', { name: 'Daftar Mahasiswa' })).toBeVisible({ timeout: 15_000 })
  })

  test('SA-NAV-005: Settings module is accessible', async ({ page }) => {
    await navigateToModule(page, 'pengaturan')
    await waitForDashboard(page)

    await expect(page.getByText(/Pengaturan|Pengaturan Umum/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test('SA-PERM-001: Superadmin does NOT see Dosen/Reviewer/Ketua operational workflows', async ({ page }) => {
    const menu = page.locator('#navbar-menu')
    await expect(menu).toBeVisible()
    // Verify Kolaborator is not visible — owned by Staff LPPM
    // Check if the menu contains "Daftar Kolaborator" text (it should not)
    const kolabLink = page.locator('#navbar-menu a[href*="kolaborator"], #navbar-menu [data-key="kolaborator"]')
    await expect(kolabLink).not.toBeVisible()
  })
})
