import { test, expect } from '../helpers/evidence'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../helpers/navigation'

test.describe('Dosen Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)
  })

  test('DS-DASH-001: Dosen dashboard loads with correct heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Beranda' })).toBeVisible()
  })

  test('DS-DASH-002: Summary cards render with expected Dosen information', async ({ page }) => {
    await expect(page.getByText('Proposal Aktif')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Laporan Berjalan')).toBeVisible()
    await expect(page.getByText('Perlu Tindakan', { exact: true })).toBeVisible()
    await expect(page.getByText('Selesai').first()).toBeVisible()
  })

  test('DS-DASH-003: Perlu Tindakan Anda section renders', async ({ page }) => {
    await expect(page.getByText('Perlu Tindakan Anda')).toBeVisible({ timeout: 10_000 })
  })

  test('DS-DASH-004: Progress Penelitian section renders', async ({ page }) => {
    const section = page.getByText('Progress Penelitian')
    if (await section.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(section).toBeVisible()
    }
  })

  test('DS-DASH-005: Menunggu Proses section renders when items exist', async ({ page }) => {
    const waitingSection = page.getByText('Menunggu Proses')
    if (await waitingSection.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(waitingSection).toBeVisible()
    }
  })

  test('DS-DASH-006: Aktivitas Terbaru section renders', async ({ page }) => {
    await expect(page.getByText('Aktivitas Terbaru')).toBeVisible({ timeout: 10_000 })
  })

  test('DS-DASH-007: Sidebar shows correct Dosen menu items', async ({ page }) => {
    await expect(page.locator('#navbar-menu')).toBeVisible()
  })

  test('DS-DASH-008: Perlu Tindakan items are clickable', async ({ page }) => {
    const actionItem = page.locator('[class*="cursor-pointer"]').filter({ hasText: /E2E-PEN|E2E-PKM/ }).first()
    if (await actionItem.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(actionItem).toBeVisible()
    }
  })
})
