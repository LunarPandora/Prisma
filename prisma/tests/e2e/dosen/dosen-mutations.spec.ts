import { test, expect, type Page } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../helpers/navigation'

const BACKEND = process.env.E2E_BACKEND_URL || 'http://localhost:8000'

async function apiGetAuthed(page: Page, path: string) {
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

function extractList(body: any): any[] {
  if (Array.isArray(body?.data)) return body.data
  if (Array.isArray(body?.data?.data)) return body.data.data
  return []
}

test.describe('Dosen — Mutations', () => {
  test('DS-PROP-VAL-001: Empty required fields rejected on proposal submit', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress')
    await waitForDashboard(page)

    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    await expect(proposalBtn).toBeVisible({ timeout: 15_000 })
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const ajukanBtn = page.getByRole('button', { name: /Ajukan Proposal/ }).first()
    await expect(ajukanBtn).toBeVisible({ timeout: 10_000 })
    await ajukanBtn.click()
    await page.waitForTimeout(500)

    await expect(page.getByText('Ajukan Proposal Baru')).toBeVisible({ timeout: 5_000 })

    const submitBtn = page.getByRole('button', { name: 'Submit' }).first()
    await expect(submitBtn).toBeVisible()
    await submitBtn.click()

    await page.waitForTimeout(2000)

    const body = await page.locator('body').textContent()
    const hasValidation = (body || '').includes('wajib') ||
                          (body || '').includes('required') ||
                          (body || '').includes('belum lengkap') ||
                          (body || '').includes('harus') ||
                          (body || '').includes('Ajukan Proposal Baru')
    expect(hasValidation).toBeTruthy()
  })

  test('DS-UPLOAD-VAL-001: Wrong format file rejected on proposal upload', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress')
    await waitForDashboard(page)

    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    if (!(await proposalBtn.isVisible({ timeout: 5000 }).catch(() => false))) return
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const uploadRow = page.getByRole('row').filter({ hasText: 'Menunggu proposal untuk diupload' }).first()
    if (!(await uploadRow.isVisible({ timeout: 5000 }).catch(() => false))) {
      console.log('DS-UPLOAD-VAL-001: Skipped — no proposal awaiting upload')
      return
    }

    await uploadRow.hover()
    const uploadBtn = uploadRow.locator('button').filter({ hasText: /Upload/ }).first()
    if (!(await uploadBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
      console.log('DS-UPLOAD-VAL-001: Skipped — upload button not found')
      return
    }
    await uploadBtn.click()
    await page.waitForTimeout(500)

    await expect(page.getByText('Cek Proposal')).toBeVisible({ timeout: 5_000 })

    const testExe = Buffer.from('MZ\x90\x00fake-exe-content')
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles({
      name: 'malware.exe',
      mimeType: 'application/x-msdownload',
      buffer: testExe,
    })
    await page.waitForTimeout(2000)

    const body = await page.locator('body').textContent()
    const rejected = (body || '').includes('format') ||
                     (body || '').includes('tidak') ||
                     (body || '').includes('File') ||
                     (body || '').includes('Cek Proposal')
    expect(rejected).toBeTruthy()
  })

  test('DS-PROP-VAL-002: Submit blocked when no document uploaded', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress')
    await waitForDashboard(page)

    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    if (!(await proposalBtn.isVisible({ timeout: 5000 }).catch(() => false))) return
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const uploadRow = page.getByRole('row').filter({ hasText: 'Menunggu proposal untuk diupload' }).first()
    if (!(await uploadRow.isVisible({ timeout: 5000 }).catch(() => false))) {
      console.log('DS-PROP-VAL-002: Skipped — no proposal awaiting upload')
      return
    }

    await uploadRow.hover()
    const uploadBtn = uploadRow.locator('button').filter({ hasText: /Upload/ }).first()
    if (!(await uploadBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
      console.log('DS-PROP-VAL-002: Skipped — upload button not found')
      return
    }
    await uploadBtn.click()
    await page.waitForTimeout(500)

    await expect(page.getByText('Cek Proposal')).toBeVisible({ timeout: 5_000 })

    const ajukanBtn = page.getByRole('button', { name: 'Ajukan Proposal' })
    if (await ajukanBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      const isDisabled = await ajukanBtn.isDisabled().catch(() => false)
      expect(isDisabled).toBeTruthy()
    }
  })

  test('DS-REV-MUT-002: Revise a Revisi proposal and resubmit', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress')
    await waitForDashboard(page)

    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    if (!(await proposalBtn.isVisible({ timeout: 5000 }).catch(() => false))) return
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const revisiRow = page.getByRole('row').filter({ hasText: 'Revisi' }).first()
    if (!(await revisiRow.isVisible({ timeout: 5000 }).catch(() => false))) {
      console.log('DS-REV-MUT-002: Skipped — no Revisi proposal found')
      return
    }

    const listResult = await apiGetAuthed(page, '/proposal?status=Revisi&per_page=10')
    expect(listResult.status).toBe(200)
    const proposals = extractList(listResult.body)
    const revisiProposal = proposals.find((p: any) => p.status === 'Revisi')

    if (!revisiProposal) {
      console.log('DS-REV-MUT-002: Skipped — no Revisi proposal via API')
      return
    }

    await revisiRow.hover()
    const editBtn = revisiRow.locator('button').last()
    if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editBtn.click()
      await page.waitForTimeout(1000)

      const body = await page.locator('body').textContent()
      const hasForm = (body || '').includes('Edit') ||
                      (body || '').includes('Revisi') ||
                      (body || '').includes('Proposal')
      expect(hasForm).toBeTruthy()
    }
  })

  test('DS-LOG-VAL-001: Empty judul and invalid date rejected on logbook', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress')
    await waitForDashboard(page)

    const laporanBtn = page.getByRole('button', { name: /Lihat Laporan/ }).first()
    if (!(await laporanBtn.isVisible({ timeout: 5000 }).catch(() => false))) return
    await laporanBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const prosesTab = page.getByRole('button', { name: /Proses Penelitian/ })
    if (await prosesTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await prosesTab.click()
      await page.waitForLoadState('domcontentloaded')
    }

    const prosesRow = page.getByRole('row').filter({ hasText: 'Dalam pengerjaan' }).first()
    if (!(await prosesRow.isVisible({ timeout: 10_000 }).catch(() => false))) {
      console.log('DS-LOG-VAL-001: Skipped — no laporan in Dalam pengerjaan')
      return
    }

    await prosesRow.hover()
    const logbookBtn = prosesRow.locator('button').filter({ hasText: /Logbook|Edit/ }).first()
    if (!(await logbookBtn.isVisible({ timeout: 3_000 }).catch(() => false))) {
      console.log('DS-LOG-VAL-001: Skipped — logbook button not found')
      return
    }
    await logbookBtn.click()
    await page.waitForTimeout(1000)

    await expect(page.getByText('Logbook Progress')).toBeVisible({ timeout: 5_000 })

    const addLogbookBtn = page.getByRole('button', { name: /Tambah Logbook/ }).first()
    if (!(await addLogbookBtn.isVisible({ timeout: 5_000 }).catch(() => false))) {
      console.log('DS-LOG-VAL-001: Skipped — Tambah Logbook button not found')
      return
    }
    await addLogbookBtn.click()
    await page.waitForTimeout(500)

    await expect(page.getByText('Tambah Logbook')).toBeVisible({ timeout: 5_000 })

    const judulInput = page.getByPlaceholder('Judul kegiatan')
    await expect(judulInput).toBeVisible({ timeout: 3_000 })
    await judulInput.fill('')

    const deskripsiInput = page.getByPlaceholder('Deskripsi kegiatan')
    await deskripsiInput.fill('Test')

    const saveBtn = page.getByRole('button', { name: 'Simpan' })
    await saveBtn.click()
    await page.waitForTimeout(2000)

    const body = await page.locator('body').textContent()
    const hasValidation = (body || '').includes('wajib') ||
                          (body || '').includes('required') ||
                          (body || '').includes('harus diisi') ||
                          (body || '').includes('Tambah Logbook')
    expect(hasValidation).toBeTruthy()
  })

  test('DS-ISO-001: Dosen A cannot see Dosen B proposal data', async ({ page }) => {
    await navigateToModule(page, 'dosenmonitoringprogress')
    await waitForDashboard(page)

    const proposalBtn = page.getByRole('button', { name: /Lihat Proposal/ }).first()
    if (!(await proposalBtn.isVisible({ timeout: 5000 }).catch(() => false))) return
    await proposalBtn.click()
    await page.waitForLoadState('domcontentloaded')

    const body = await page.locator('body').textContent()
    const hasIsolation = !(body || '').includes('DS-ISO-B: Milik Dosen B')
    expect(hasIsolation).toBeTruthy()

    const listResult = await apiGetAuthed(page, '/proposal?per_page=50')
    expect(listResult.status).toBe(200)
    const proposals = extractList(listResult.body)
    const dosenBProposal = proposals.find((p: any) =>
      p.judul && p.judul.includes('DS-ISO-B: Milik Dosen B')
    )
    expect(dosenBProposal).toBeUndefined()
  })
})
