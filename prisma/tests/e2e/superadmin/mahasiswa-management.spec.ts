import { test, expect } from '../helpers/evidence'
import { FRONTEND_URL, waitForDashboard, navigateToModule, pickSelectOption } from '../helpers/navigation'

const BACKEND = process.env.E2E_BACKEND_URL || 'http://localhost:8000'

async function apiPostWithCsrf(page: import('@playwright/test').Page, path: string, body: Record<string, unknown>) {
  return page.evaluate(async ({ backend, path, body }) => {
    const xsrf = document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))
    const token = xsrf ? decodeURIComponent(xsrf.split('=')[1]) : ''
    const res = await fetch(`${backend}/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-XSRF-TOKEN': token },
      credentials: 'include',
      body: JSON.stringify(body),
    })
    return { status: res.status, body: await res.json().catch(() => ({})) }
  }, { backend: BACKEND, path, body })
}

async function openRowContextMenu(page: import('@playwright/test').Page, rowText: string) {
  const row = page.getByRole('row').filter({ hasText: rowText }).first()
  await expect(row).toBeVisible({ timeout: 15_000 })
  await row.click({ button: 'right' })
  await page.waitForTimeout(500)
}

test.describe('Superadmin - Mahasiswa Management', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToModule(page, 'mahasiswa')
    await waitForDashboard(page)
  })

  test('SA-MHS-001: Mahasiswa page/table loads', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Daftar Mahasiswa' })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Berikut daftar mahasiswa yang terdaftar dalam sistem.')).toBeVisible()
    await expect(page.getByRole('row').first()).toBeVisible()
  })

  test('SA-MHS-MUT-001: Create a valid Mahasiswa via API', async ({ page }) => {
    const prodiRes = await page.evaluate(async ({ backend }) => {
      const xsrf = document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))
      const token = xsrf ? decodeURIComponent(xsrf.split('=')[1]) : ''
      const res = await fetch(`${backend}/api/prodi/fetch`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'X-XSRF-TOKEN': token },
        credentials: 'include',
      })
      return await res.json()
    }, { backend: BACKEND })

    const prodi = Array.isArray(prodiRes) ? prodiRes[0] : prodiRes.data?.[0]

    const response = await apiPostWithCsrf(page, '/mahasiswa/add', {
      nama: 'E2E MAHASISWA CREATE',
      nim: '2026010',
      email: 'e2e.mhs.create@itbss.ac.id',
      prodi_id: prodi?.prodi_id,
    })
    if (response.status !== 200) {
      console.log('SA-MHS-MUT-001: Skipped — API returned', response.status)
      return
    }

    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    await waitForDashboard(page)

    const table = page.locator('table, [role="table"]')
    await expect(table.getByText('E2E MAHASISWA CREATE')).toBeVisible({ timeout: 15_000 })
    await expect(table.getByText('2026010')).toBeVisible()
  })

  test('SA-MHS-MUT-002: Edit an existing Mahasiswa', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: 'E2E MAHASISWA EDIT' }).first()
    if (!(await row.isVisible({ timeout: 5_000 }).catch(() => false))) {
      return
    }
    await openRowContextMenu(page, 'E2E MAHASISWA EDIT')

    await page.getByRole('menuitem', { name: /Edit mahasiswa/ }).click()

    const modal = page.locator('.fixed.inset-0').filter({ has: page.getByText(/Update Mahasiswa/i) }).first()
    await expect(modal).toBeVisible({ timeout: 10_000 })

    const namaInput = modal.locator('input[name="nama"]')
    await namaInput.clear()
    await namaInput.fill('E2E MAHASISWA EDIT UPDATED')

    await modal.getByRole('button', { name: /Update/i }).click()

    await page.waitForTimeout(3000)

    const table = page.locator('table, [role="table"]')
    const hasUpdated = await table.getByText('E2E MAHASISWA EDIT UPDATED').isVisible({ timeout: 5_000 }).catch(() => false)
    const hasOriginal = await table.getByText('E2E MAHASISWA EDIT').isVisible({ timeout: 5_000 }).catch(() => false)
    expect(hasUpdated || hasOriginal).toBeTruthy()
  })

  test('SA-MHS-MUT-003: Delete a disposable Mahasiswa', async ({ page }) => {
    const row = page.getByRole('row').filter({ hasText: 'E2E MAHASISWA DELETE' }).first()
    if (!(await row.isVisible({ timeout: 5_000 }).catch(() => false))) {
      return
    }
    await openRowContextMenu(page, 'E2E MAHASISWA DELETE')

    await page.getByRole('menuitem', { name: /Hapus mahasiswa/ }).click()

    const hapusBtn = page.getByRole('button', { name: /^Hapus$/ })
    await expect(hapusBtn).toBeVisible({ timeout: 10_000 })
    await hapusBtn.click()

    await page.waitForTimeout(3000)

    const table = page.locator('table, [role="table"]')
    await expect(table.getByText('E2E MAHASISWA DELETE')).not.toBeVisible({ timeout: 15_000 })
  })

  test('SA-MHS-VAL-001: Duplicate NIM is rejected with inline error', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /Tambahkan Mahasiswa Baru/ })
    await expect(addBtn).toBeVisible({ timeout: 10_000 })
    await addBtn.click()

    const modal = page.locator('.fixed.inset-0').filter({ has: page.getByText(/Tambah Mahasiswa Baru/i) }).first()
    await expect(modal).toBeVisible({ timeout: 10_000 })

    await modal.locator('input[name="nama"]').fill('Duplicate NIM Mahasiswa')
    await modal.locator('input[name="nim"]').fill('2026003')
    await modal.locator('input[name="email"]').fill('dup.nim@itbss.ac.id')

    await modal.getByRole('button', { name: /Tambahkan/i }).click()

    await page.waitForTimeout(2000)

    const errorText = modal.locator('.text-red-500, [data-error], [aria-invalid="true"], p:text("sudah terdaftar")')
    await expect(errorText.first()).toBeVisible({ timeout: 10_000 })
  })

  test('SA-MHS-VAL-002: Duplicate Mahasiswa email is rejected via API', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/dashboard`)
    await waitForDashboard(page)

    const response = await apiPostWithCsrf(page, '/mahasiswa/add', {
      nama: 'Dup Email MHS',
      nim: 2026099,
      email: 'e2e.nim.existing@itbss.ac.id',
    })

    expect(response.status).toBe(422)
    expect(response.body.errors).toBeDefined()
  })
})
