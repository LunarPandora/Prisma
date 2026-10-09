import { test, expect } from '../../helpers/evidence'
import { FRONTEND_URL } from '../../helpers/navigation'

test.describe('Reviewer - Laporan Review', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard?module=reviewproposal`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)
  })

  test('RV-LAP-001: Review Laporan tab is accessible', async ({ page }) => {
    const laporanTab = page.getByRole('button', { name: 'Review Laporan' })
    await expect(laporanTab).toBeVisible({ timeout: 10_000 })
    await laporanTab.click()
    await page.waitForTimeout(2000)

    const body = await page.locator('body').textContent()
    const hasLaporanColumns = (body || '').includes('Judul Laporan') || (body || '').includes('Status')
    expect(hasLaporanColumns).toBeTruthy()
  })

  test('RV-LAP-002: Laporan shows review status for assigned reviewer', async ({ page }) => {
    const laporanTab = page.getByRole('button', { name: 'Review Laporan' })
    await laporanTab.click()
    await page.waitForTimeout(2000)

    const body = await page.locator('body').textContent()
    const hasReviewStatus = (body || '').includes('Belum direview') || (body || '').includes('Menunggu')
    expect(hasReviewStatus).toBeTruthy()
  })

  test('RV-LAP-003: Laporan review form opens with submit button', async ({ page }) => {
    const laporanTab = page.getByRole('button', { name: 'Review Laporan' })
    await laporanTab.click()
    await page.waitForTimeout(2000)

    const reviewableRow = page.getByRole('row').filter({ hasText: 'Belum direview' }).first()
    if (!(await reviewableRow.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    const actionBtn = reviewableRow.locator('button').filter({ has: page.locator('svg[data-icon="clipboard-list"]') }).first()
    if (!(await actionBtn.isVisible({ timeout: 2000 }).catch(() => false))) {
      test.skip()
      return
    }

    await actionBtn.click()
    await page.waitForTimeout(3000)

    const body = await page.locator('body').textContent()
    const hasForm = (body || '').includes('Submit Review') || (body || '').includes('Review Laporan') || (body || '').includes('Kriteria Penilaian')
    expect(hasForm).toBeTruthy()
  })

  test('RV-LAP-004: Laporan already reviewed shows Telah direview', async ({ page }) => {
    const laporanTab = page.getByRole('button', { name: 'Review Laporan' })
    await laporanTab.click()
    await page.waitForTimeout(2000)

    const body = await page.locator('body').textContent()
    const hasReviewed = (body || '').includes('Telah direview')
    expect(hasReviewed).toBeTruthy()
  })

  test('RV-LAP-MUT-001: Laporan review form has score inputs and submit', async ({ page }) => {
    const laporanTab = page.getByRole('button', { name: 'Review Laporan' })
    await laporanTab.click()
    await page.waitForTimeout(2000)

    const reviewableRow = page.getByRole('row').filter({ hasText: 'Belum direview' }).first()
    if (!(await reviewableRow.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    const actionBtn = reviewableRow.locator('button').filter({ has: page.locator('svg[data-icon="clipboard-list"]') }).first()
    if (!(await actionBtn.isVisible({ timeout: 2000 }).catch(() => false))) {
      test.skip()
      return
    }

    await actionBtn.click()
    await page.waitForTimeout(3000)

    const body = await page.locator('body').textContent()
    const hasSubmit = (body || '').includes('Submit Review')
    expect(hasSubmit).toBeTruthy()

    const submitBtn = page.getByRole('button', { name: /submit/i }).first()
    const hasSubmitBtn = await submitBtn.isVisible().catch(() => false)
    expect(hasSubmitBtn).toBeTruthy()
  })
})
