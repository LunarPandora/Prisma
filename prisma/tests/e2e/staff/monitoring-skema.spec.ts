import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../helpers/navigation'

test.describe('Staff LPPM Monitoring - Skema Selection', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToModule(page, 'staffmonitoringprogress')
    await waitForDashboard(page)
  })

  test('ST-SKEMA-001: Monitoring Progress page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Monitoring Progress' })).toBeVisible()
    await expect(page.getByText('Pantau progres proposal')).toBeVisible()
  })

  test('ST-SKEMA-002: Skema cards are displayed', async ({ page }) => {
    await expect(page.locator('[data-highlight]').first()).toBeVisible({ timeout: 15_000 })
  })

  test('ST-SKEMA-003: Search input is functional', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Cari nama skema atau tahun ajaran...')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('Penelitian')
    await page.waitForTimeout(500)
    const cards = page.locator('[data-highlight]')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('ST-SKEMA-004: Clicking Proposal button navigates to proposal monitoring', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Use .first() because text appears in both breadcrumb and heading
    await expect(page.getByText('Monitoring Progress Proposal').first()).toBeVisible({ timeout: 10_000 })
  })

  test('ST-SKEMA-005: Clicking Laporan button navigates to laporan monitoring', async ({ page }) => {
    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByText('Laporan Penelitian')).toBeVisible({ timeout: 10_000 })
  })

  test('ST-SKEMA-006: Breadcrumb back navigation works', async ({ page }) => {
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Click the first "Monitoring Progress" text (breadcrumb)
    await page.getByText('Monitoring Progress').first().click()
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByText('Pantau progres proposal')).toBeVisible()
  })
})
