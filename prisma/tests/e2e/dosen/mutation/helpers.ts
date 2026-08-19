import { type Page, type Locator, expect } from '@playwright/test'
import { FRONTEND_URL, BACKEND_URL, waitForDashboard, navigateToModule } from '../helpers/navigation'

/**
 * Select a value from the custom SelectInput component.
 * Clicks the input to open the dropdown, types to filter, then clicks the matching option.
 */
export async function selectInputValue(page: Page, inputPlaceholder: string, optionText: string) {
  const input = page.getByPlaceholder(inputPlaceholder)
  await expect(input).toBeVisible({ timeout: 10_000 })
  await input.click()

  // Wait for dropdown to appear
  await page.waitForTimeout(500)

  // Type to filter
  await input.fill(optionText)
  await page.waitForTimeout(500)

  // Click the matching option
  const option = page.locator('div').filter({ hasText: optionText }).getByText(optionText, { exact: true }).first()
  await expect(option).toBeVisible({ timeout: 5_000 })
  await option.click()
}

/**
 * Fill a TextInput by placeholder.
 */
export async function fillInput(page: Page, placeholder: string, value: string) {
  const input = page.getByPlaceholder(placeholder)
  await expect(input).toBeVisible({ timeout: 10_000 })
  await input.clear()
  await input.fill(value)
}

/**
 * Navigate to Dosen Monitoring Progress > Proposal monitoring page.
 */
export async function navigateToProposalMonitoring(page: Page) {
  await navigateToModule(page, 'dosenmonitoringprogress')
  await waitForDashboard(page)

  // Click "Lihat Proposal" on the first skema card
  const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
  await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
  await proposalBtn.click()
  await page.waitForLoadState('domcontentloaded')
}

/**
 * Navigate to Dosen Monitoring Progress > Laporan monitoring page.
 */
export async function navigateToLaporanMonitoring(page: Page) {
  await navigateToModule(page, 'dosenmonitoringprogress')
  await waitForDashboard(page)

  // Click "Lihat Laporan" on the first skema card
  const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
  await expect(laporanBtn).toBeVisible({ timeout: 15_000 })
  await laporanBtn.click()
  await page.waitForLoadState('domcontentloaded')
}

/**
 * Click the "Ajukan Proposal" header button.
 */
export async function clickAjukanProposal(page: Page) {
  const btn = page.getByRole('button', { name: /Ajukan Proposal/ }).first()
  await expect(btn).toBeVisible({ timeout: 10_000 })
  await btn.click()
  await page.waitForTimeout(500) // modal animation
}

/**
 * Wait for a toast success message to appear.
 */
export async function waitForSuccessToast(page: Page) {
  const toast = page.locator('.fixed.bottom-6.right-6 > div').first()
  await expect(toast).toBeVisible({ timeout: 15_000 })
  return toast
}
