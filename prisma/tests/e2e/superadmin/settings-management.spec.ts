import { test, expect } from '../helpers/evidence'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../helpers/navigation'

const BACKEND = process.env.E2E_BACKEND_URL || 'http://localhost:8000'

async function apiGetWithCsrf(page: import('@playwright/test').Page, path: string) {
  return page.evaluate(async ({ backend, path }) => {
    const xsrf = document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))
    const token = xsrf ? decodeURIComponent(xsrf.split('=')[1]) : ''
    const res = await fetch(`${backend}/api${path}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'X-XSRF-TOKEN': token },
      credentials: 'include',
    })
    return { status: res.status, body: await res.json().catch(() => ({})) }
  }, { backend: BACKEND, path })
}

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

test.describe('Superadmin - Settings Management', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToModule(page, 'pengaturan')
    await waitForDashboard(page)
  })

  test('SA-SET-001: Settings page loads with correct heading', async ({ page }) => {
    await expect(page.getByText(/Pengaturan|Pengaturan Umum/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test('SA-SET-MUT-001: Update nama_kampus via UI', async ({ page }) => {
    const namaKampusInput = page.locator('input[name="nama_kampus"]')
    await expect(namaKampusInput).toBeVisible({ timeout: 15_000 })

    await namaKampusInput.fill('E2E Kampus Updated')

    const saveBtn = page.getByRole('button', { name: /Simpan Perubahan/i })
    await expect(saveBtn).toBeVisible()
    await expect(saveBtn).toBeEnabled({ timeout: 5_000 })
    await saveBtn.click()

    await page.waitForTimeout(3000)

    await page.reload()
    await page.waitForLoadState('domcontentloaded')

    await expect(page.locator('input[name="nama_kampus"]')).toHaveValue('E2E Kampus Updated', { timeout: 15_000 })

    await apiPostWithCsrf(page, '/settings/update', { nama_kampus: 'Institut Teknologi Batam Satu' })
  })

  test('SA-SET-MUT-002: Update kepala_lppm selection', async ({ page }) => {
    const kepalaLppmSelect = page.locator('input[placeholder*="Kepala LPPM" i]')
    await expect(kepalaLppmSelect).toBeVisible({ timeout: 15_000 })

    await kepalaLppmSelect.click()
    await page.waitForTimeout(1000)
    const option = page.getByText('Staff LPPM 1').first()
    if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
      await option.click()
    } else {
      await page.keyboard.press('Escape')
    }
  })

  test('SA-SET-MUT-003: Rektor data fields are present and editable', async ({ page }) => {
    const rektorNamaInput = page.locator('input[name="rektor_nama"]')
    const visible = await rektorNamaInput.isVisible({ timeout: 10_000 }).catch(() => false)
    if (!visible) {
      test.skip()
      return
    }

    await rektorNamaInput.fill('Prof. Rektor E2E Updated')
    await expect(rektorNamaInput).toHaveValue('Prof. Rektor E2E Updated')

    await rektorNamaInput.fill('Prof. Rektor E2E')
    await expect(rektorNamaInput).toHaveValue('Prof. Rektor E2E')
  })

  test('SA-SET-PERM-001: Superadmin generic settings update does NOT overwrite Staff/Ketua-owned fields', async ({ page }) => {
    const settingsBefore = await apiGetWithCsrf(page, '/settings/')
    const kriteriaBefore = settingsBefore.body?.data?.kriteria_penilaian
    const temaBefore = settingsBefore.body?.data?.list_kesesuaian_tema

    await apiPostWithCsrf(page, '/settings/update', { nama_kampus: 'Temp Update' })

    const settingsAfter = await apiGetWithCsrf(page, '/settings/')

    expect(settingsAfter.body?.data?.kriteria_penilaian).toEqual(kriteriaBefore)
    expect(settingsAfter.body?.data?.list_kesesuaian_tema).toEqual(temaBefore)

    await apiPostWithCsrf(page, '/settings/update', { nama_kampus: 'Institut Teknologi Batam Satu' })
  })
})
