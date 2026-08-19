import { test, expect } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard, navigateToModule, pickSelectOption } from '../helpers/navigation'

async function openAddProdiModal(page: import('@playwright/test').Page) {
  const heading = page.getByRole('heading', { name: 'Prodi' })
  await heading.click({ button: 'right' })
  await page.waitForTimeout(500)
  await page.getByRole('menuitem', { name: /Tambahkan prodi baru/ }).click()
}

async function openRowContextMenu(page: import('@playwright/test').Page, rowText: string) {
  const row = page.getByRole('row').filter({ hasText: rowText })
  await expect(row).toBeVisible({ timeout: 15_000 })
  await row.click({ button: 'right' })
  await page.waitForTimeout(500)
}

test.describe('Superadmin - Prodi Management', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToModule(page, 'prodi')
    await waitForDashboard(page)
  })

  test('SA-PRODI-001: Prodi table/page loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Prodi' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Berikut data prodi yang tersedia.')).toBeVisible()
    await expect(page.getByRole('row').first()).toBeVisible()
  })

  test('SA-PRODI-MUT-001: Create a valid Prodi', async ({ page }) => {
    await openAddProdiModal(page)

    const modal = page.locator('.fixed.inset-0').filter({ has: page.getByText(/Tambah Prodi Baru|Tambahkan/i) }).first()
    await expect(modal).toBeVisible({ timeout: 10_000 })

    await modal.locator('input[name="nama_prodi"]').fill('E2E PRODI CREATE')

    await pickSelectOption(page, 'Pilih kepala prodi', 'Ketua LPPM')

    await modal.getByRole('button', { name: /Tambahkan/i }).click()

    await page.waitForTimeout(3000)

    const table = page.locator('table, [role="table"]')
    await expect(table.getByText('E2E PRODI CREATE')).toBeVisible({ timeout: 15_000 })
  })

  test('SA-PRODI-MUT-002: Edit an existing Prodi', async ({ page }) => {
    await openRowContextMenu(page, 'E2E PRODI EDIT TARGET')

    await page.getByRole('menuitem', { name: /Edit prodi/ }).click()

    const modal = page.locator('.fixed.inset-0').filter({ has: page.getByText('Update Prodi') }).first()
    await expect(modal).toBeVisible({ timeout: 10_000 })

    const namaInput = modal.locator('input[name="nama_prodi"]')
    await namaInput.clear()
    await namaInput.fill('E2E PRODI EDIT UPDATED')

    await pickSelectOption(page, 'Pilih kepala prodi', 'Ketua LPPM')

    await modal.getByRole('button', { name: /Update/i }).click()

    await page.waitForTimeout(3000)

    const table = page.locator('table, [role="table"]')
    await expect(table.getByText('E2E PRODI EDIT UPDATED')).toBeVisible({ timeout: 15_000 })
  })

  test('SA-PRODI-MUT-003: Delete a disposable Prodi', async ({ page }) => {
    await openRowContextMenu(page, 'E2E PRODI DELETE TARGET')

    await page.getByRole('menuitem', { name: /Hapus prodi/ }).click()

    const hapusBtn = page.getByRole('button', { name: /^Hapus$/ })
    await expect(hapusBtn).toBeVisible({ timeout: 10_000 })
    await hapusBtn.click()

    await page.waitForTimeout(3000)

    const table = page.locator('table, [role="table"]')
    await expect(table.getByText('E2E PRODI DELETE TARGET')).not.toBeVisible({ timeout: 15_000 })
  })

  test('SA-PRODI-VAL-001: Prodi name is required', async ({ page }) => {
    await openAddProdiModal(page)

    const modal = page.locator('.fixed.inset-0').filter({ has: page.getByText(/Tambah Prodi Baru|Tambahkan/i) }).first()
    await expect(modal).toBeVisible({ timeout: 10_000 })

    await pickSelectOption(page, 'Pilih kepala prodi', 'Ketua LPPM')

    await modal.getByRole('button', { name: /Tambahkan/i }).click()

    await page.waitForTimeout(1000)

    const errorText = modal.locator('.text-red-500, [data-error], [aria-invalid="true"]')
    await expect(errorText.first()).toBeVisible({ timeout: 10_000 })

    await expect(modal).toBeVisible()
  })

  test('SA-PRODI-VAL-002: Duplicate Prodi name is rejected', async ({ page }) => {
    await openAddProdiModal(page)

    const modal = page.locator('.fixed.inset-0').filter({ has: page.getByText(/Tambah Prodi Baru|Tambahkan/i) }).first()
    await expect(modal).toBeVisible({ timeout: 10_000 })

    await modal.locator('input[name="nama_prodi"]').fill('Sistem Teknologi dan Informasi')

    await pickSelectOption(page, 'Pilih kepala prodi', 'Ketua LPPM')

    await modal.getByRole('button', { name: /Tambahkan/i }).click()

    await page.waitForTimeout(2000)

    const errorText = page.locator('.text-red-500').filter({ hasText: /already been taken|sudah digunakan/i }).first()
    await expect(errorText).toBeVisible({ timeout: 10_000 })

    await expect(modal).toBeVisible()
  })
})
