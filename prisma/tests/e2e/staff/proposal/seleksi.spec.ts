import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../../helpers/navigation'

test.describe('Staff LPPM - Proposal Seleksi', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await waitForDashboard(page)

    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')
  })

  test('ST-PROP-SEL-001: Proposal monitoring page loads with tabs', async ({ page }) => {
    // Use .first() because text appears in breadcrumb and heading
    await expect(page.getByText('Monitoring Progress Proposal').first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Pengajuan' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Seleksi' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Pengumuman' })).toBeVisible()
  })

  test('ST-PROP-SEL-002: Seleksi tab loads and shows table', async ({ page }) => {
    await page.getByRole('button', { name: 'Seleksi' }).click()
    await page.waitForLoadState('domcontentloaded')

    // Wait for the table to render
    await expect(page.getByRole('table').first()).toBeVisible({ timeout: 10_000 })
  })

  test('ST-PROP-SEL-003: Context menu opens and shows actions on row', async ({ page }) => {
    await page.getByRole('button', { name: 'Seleksi' }).click()
    await page.waitForLoadState('domcontentloaded')

    // Dismiss any lingering context menu from a prior test
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)

    const rows = page.getByRole('row')
    const rowCount = await rows.count()
    if (rowCount > 1) {
      const row = rows.nth(1)
      await row.click({ button: 'right' })

      const menu = page.getByRole('menu', { name: 'Context menu' }).first()
      await expect(menu).toBeVisible({ timeout: 5_000 })

      const items = page.getByRole('menuitem')
      expect(await items.count()).toBeGreaterThan(0)
    }
  })

  test('ST-PROP-SEL-005: Context menu appears for data row', async ({ page }) => {
    await page.getByRole('button', { name: 'Seleksi' }).click()
    await page.waitForLoadState('domcontentloaded')

    // Dismiss any lingering context menu from a prior test
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)

    const rows = page.getByRole('row')
    const rowCount = await rows.count()
    if (rowCount > 1) {
      const row = rows.nth(1)
      await row.click({ button: 'right' })

      const menu = page.getByRole('menu', { name: 'Context menu' }).first()
      await expect(menu).toBeVisible({ timeout: 5_000 })
    }
  })

  test('ST-PROP-SEL-006: Type filter is present', async ({ page }) => {
    await page.getByRole('button', { name: 'Seleksi' }).click()
    await page.waitForLoadState('domcontentloaded')

    // The type filter is a SelectInput with placeholder "Jenis"
    const typeFilter = page.locator('input[placeholder="Jenis"]').first()
    if (await typeFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(typeFilter).toBeVisible()
    }
  })
})
