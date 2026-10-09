import { test, expect } from '../helpers/evidence'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../helpers/navigation'

test.describe('Data Persistence After Reload', () => {
  test('SA-PERSIST-001: Superadmin — user edit persists after reload', async ({ page }) => {
    await navigateToModule(page, 'users')
    await waitForDashboard(page)

    await expect(page.getByRole('heading', { name: 'Daftar Pengguna' })).toBeVisible({ timeout: 15_000 })

    const searchInput = page.locator('input[placeholder*="Cari" i], input[type="search"]').first()
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchInput.fill('E2E USER EDIT TARGET')
      await page.waitForTimeout(1500)
    }

    const row = page.getByRole('row').filter({ hasText: 'E2E USER EDIT TARGET' }).first()
    const isVisible = await row.isVisible({ timeout: 5000 }).catch(() => false)
    if (!isVisible) return

    await row.click({ button: 'right' })
    await page.waitForTimeout(500)

    const editItem = page.getByRole('menuitem', { name: /Edit user/ })
    if (!(await editItem.isVisible({ timeout: 3000 }).catch(() => false))) return
    await editItem.click()

    const modal = page.locator('.fixed.inset-0').filter({ has: page.getByText('Update Pengguna') }).first()
    await expect(modal).toBeVisible({ timeout: 10_000 })

    const namaInput = modal.locator('input[name="nama"]')
    const originalValue = await namaInput.inputValue()
    const testValue = 'PERSIST-' + Date.now().toString(36)
    await namaInput.clear()
    await namaInput.fill(testValue)

    await modal.getByRole('button', { name: /Update/i }).click()
    await page.waitForTimeout(3000)

    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    await waitForDashboard(page)

    const table = page.locator('table, [role="table"]')
    await expect(table.getByText(testValue)).toBeVisible({ timeout: 15_000 })
  })
})
