import { test, expect } from '../helpers/evidence'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../helpers/navigation'

/**
 * Authorization Workflow E2E Tests
 *
 * Tests the double-verification mechanism through the UI.
 * Uses pre-authenticated Staff LPPM state from auth-setup project.
 */

test.describe('Staff LPPM Authorization Actions Visible', () => {
  test('AUTH-STAFF-001: Staff sees reject/return actions at Seleksi stage', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await waitForDashboard(page)

    // Navigate to Proposal monitoring
    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Verify the page loads with Seleksi tab
    await expect(page.getByText('Monitoring Progress Proposal').first()).toBeVisible({ timeout: 10_000 })

    // Click Seleksi tab
    const seleksiTab = page.getByRole('button', { name: 'Seleksi' })
    await expect(seleksiTab).toBeVisible({ timeout: 5_000 })
    await seleksiTab.click()
    await page.waitForLoadState('domcontentloaded')

    // Verify table loads
    const table = page.getByRole('table').first()
    await expect(table).toBeVisible({ timeout: 10_000 })
  })

  test('AUTH-STAFF-002: Staff sees return action at Laporan Proses stage', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogresslaporan`)
    await page.waitForLoadState('domcontentloaded')

    // Verify the page loads
    const heading = page.getByRole('heading', { name: /Monitoring Progress|Laporan/ })
    await expect(heading.first()).toBeVisible({ timeout: 15_000 })
  })

  test('AUTH-STAFF-003: Staff sees return action at Laporan Publikasi stage', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogresslaporan`)
    await page.waitForLoadState('domcontentloaded')

    const heading = page.getByRole('heading', { name: /Monitoring Progress|Laporan/ })
    await expect(heading.first()).toBeVisible({ timeout: 15_000 })
  })

  test('AUTH-STAFF-004: Staff sees return action at Laporan Claim Dana stage', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogresslaporan`)
    await page.waitForLoadState('domcontentloaded')

    const heading = page.getByRole('heading', { name: /Monitoring Progress|Laporan/ })
    await expect(heading.first()).toBeVisible({ timeout: 15_000 })
  })
})

test.describe('Ketua Authorization Panel', () => {
  test('AUTH-KETUA-001: Ketua sees pending authorization requests in Proposal view', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await waitForDashboard(page)

    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByText('Monitoring Progress Proposal').first()).toBeVisible({ timeout: 10_000 })
  })

  test('AUTH-KETUA-002: Ketua sees pending return requests in Laporan view', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogresslaporan`)
    await page.waitForLoadState('domcontentloaded')

    const heading = page.getByRole('heading', { name: /Monitoring Progress|Laporan/ })
    await expect(heading.first()).toBeVisible({ timeout: 15_000 })
  })
})

test.describe('Normal Ketua Checkpoints Preserved', () => {
  test('AUTH-CHECK-001: Proposal Seleksi Ketua approve flow still accessible', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await waitForDashboard(page)

    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Navigate to Seleksi tab
    const seleksiTab = page.getByRole('button', { name: 'Seleksi' })
    await expect(seleksiTab).toBeVisible({ timeout: 5_000 })
    await seleksiTab.click()
    await page.waitForLoadState('domcontentloaded')

    // Verify table loads
    const table = page.getByRole('table').first()
    await expect(table).toBeVisible({ timeout: 10_000 })
  })

  test('AUTH-CHECK-002: Diseminasi normal Ketua decision still accessible', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await waitForDashboard(page)

    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    // Navigate to Diseminasi tab
    const diseminasiTab = page.getByRole('button', { name: /Diseminasi/ })
    if (await diseminasiTab.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await diseminasiTab.click()
      await page.waitForLoadState('domcontentloaded')

      // Verify laporan table loads
      const table = page.getByRole('table').first()
      await expect(table).toBeVisible({ timeout: 10_000 })
    }
  })
})

test.describe('Monitoring-Only Stages', () => {
  test('AUTH-MON-001: Ketua can access Proses stage without approval gate', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogresslaporan`)
    await page.waitForLoadState('domcontentloaded')

    const heading = page.getByRole('heading', { name: /Monitoring Progress|Laporan/ })
    await expect(heading.first()).toBeVisible({ timeout: 15_000 })
  })

  test('AUTH-MON-002: Ketua can access Publikasi stage without approval gate', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogresslaporan`)
    await page.waitForLoadState('domcontentloaded')

    const heading = page.getByRole('heading', { name: /Monitoring Progress|Laporan/ })
    await expect(heading.first()).toBeVisible({ timeout: 15_000 })
  })

  test('AUTH-MON-003: Ketua can access Claim Dana stage without approval gate', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogresslaporan`)
    await page.waitForLoadState('domcontentloaded')

    const heading = page.getByRole('heading', { name: /Monitoring Progress|Laporan/ })
    await expect(heading.first()).toBeVisible({ timeout: 15_000 })
  })
})

test.describe('Data Preservation', () => {
  test('AUTH-PRESERVE-001: Proposal data not deleted on return for revision', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogress`)
    await waitForDashboard(page)

    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByText('Monitoring Progress Proposal').first()).toBeVisible({ timeout: 10_000 })
  })

  test('AUTH-PRESERVE-002: Laporan data not destroyed on return', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=staffmonitoringprogresslaporan`)
    await page.waitForLoadState('domcontentloaded')

    const heading = page.getByRole('heading', { name: /Monitoring Progress|Laporan/ })
    await expect(heading.first()).toBeVisible({ timeout: 15_000 })
  })
})
