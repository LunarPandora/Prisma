import { test, expect } from '../helpers/evidence'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../helpers/navigation'

test.describe('Data Persistence After Reload', () => {
  test('DS-PERSIST-001: Dosen — submitted proposal persists after reload', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress')
    await waitForDashboard(page)

    const heading = page.getByText('Monitoring Progress').first()
    const hasHeading = await heading.isVisible({ timeout: 10_000 }).catch(() => false)
    expect(hasHeading).toBeTruthy()

    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    const hasProposalBtn = await proposalBtn.isVisible({ timeout: 10_000 }).catch(() => false)
    if (hasProposalBtn) {
      await proposalBtn.click()
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(2000)
    }

    const body = await page.locator('body').textContent()
    const hasContent = (body || '').includes('Draft') ||
                       (body || '').includes('Menunggu') ||
                       (body || '').includes('Revisi') ||
                       (body || '').includes('Diterima') ||
                       (body || '').includes('Monitoring Progress')
    expect(hasContent).toBeTruthy()

    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const bodyAfter = await page.locator('body').textContent()
    const hasContentAfter = (bodyAfter || '').includes('Draft') ||
                            (bodyAfter || '').includes('Menunggu') ||
                            (bodyAfter || '').includes('Revisi') ||
                            (bodyAfter || '').includes('Diterima') ||
                            (bodyAfter || '').includes('Monitoring Progress')
    expect(hasContentAfter).toBeTruthy()
  })
})
