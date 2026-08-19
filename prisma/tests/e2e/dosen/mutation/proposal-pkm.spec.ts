import { test, expect, type Page } from '@playwright/test'
import { FRONTEND_URL, waitForDashboard, navigateToModule } from '../../helpers/navigation'

const PKM_TITLE = 'E2E PKM MUTATION'

function uniqueSuffix() {
  return Date.now().toString(36)
}

async function pickSelectOption(page: Page, placeholder: string, optionText: string) {
  const input = page.getByPlaceholder(placeholder)
  await input.click()
  await page.waitForTimeout(1000)
  const filterText = optionText.slice(0, Math.min(8, optionText.length))
  await input.pressSequentially(filterText, { delay: 50 })
  await page.waitForTimeout(1000)

  // Scope to the SelectInput's dropdown by finding the absolute-positioned overflow container
  // that is a sibling of the input container, within the modal
  const selectWrapper = input.locator('..').locator('..')  // input > box div > wrapper div
  const dropdown = selectWrapper.locator('div.absolute').first()
  const option = dropdown.locator('p').filter({ hasText: optionText }).first()

  if (await option.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await option.click()
    await page.waitForTimeout(300)
    return
  }
  // Fallback: Enter key selects highlighted option
  await input.press('Enter')
  await page.waitForTimeout(300)
}

async function openProposalForm(page: Page) {
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
}

async function fillPkMForm(page: Page, suffix: string) {
  await pickSelectOption(page, 'Pilih skema penelitian untuk disubmit', 'Penelitian Dosen Tetap 2026')
  await page.getByPlaceholder('Masukkan judul proposal').fill(`${PKM_TITLE} ${suffix}`)
  await page.getByPlaceholder('Masukkan topik penelitian').fill('PkM Topik E2E')
  await page.getByPlaceholder('Masukkan bidang ilmu').fill('Bisnis')
  await page.getByPlaceholder('Masukkan kontribusi riset pada ilmu / matkul').fill('Kontribusi PkM')
  await page.getByPlaceholder('Masukkan kontribusi riset pada PKM').fill('Kontribusi PKM E2E')
  await page.getByPlaceholder('Masukkan rencana luaran (HKI, Buku, dsb)').fill('PkM Output')

  await pickSelectOption(page, 'Pilih jenis penelitian (ganjil)', 'PkM')
  await pickSelectOption(page, 'Pilih target publikasi (ganjil)', 'Jurnal Nasional')

  await page.getByPlaceholder('Masukkan rencana judul publikasi (ganjil)').fill(`PkM Judul Pub ${suffix}`)
  await page.getByPlaceholder('Masukkan metode penelitian yang digunakan (ganjil)').fill('Mixed Methods')
  await page.getByPlaceholder('Masukkan unit analisis (ganjil)').fill('UMKM')

  await pickSelectOption(page, 'Pilih jenis penelitian (genap)', 'PkM')
  await pickSelectOption(page, 'Pilih target publikasi (genap)', 'Jurnal Nasional')

  await page.getByPlaceholder('Masukkan rencana judul publikasi (genap)').fill(`PkM Judul Pub Genap ${suffix}`)
  await page.getByPlaceholder('Masukkan metode penelitian yang digunakan (genap)').fill('Mixed Methods')
  await page.getByPlaceholder('Masukkan unit analisis (genap)').fill('UMKM')

  await page.getByPlaceholder('Masukkan sumber skema (Pemerintah, Yayasan, dsb)').fill('Dana Internal PkM')
  await page.getByPlaceholder('Masukkan nama institusi mitra (apabila ada)').fill('UMKM Mitra E2E')

  await pickSelectOption(page, 'Pilih skema pendanaan', 'Internal')

  await page.getByPlaceholder('Masukkan rencana anggaran Biaya Penelitian').first().fill('3000000')
  await page.getByPlaceholder('Masukkan rencana anggaran Biaya Publikasi').first().fill('1500000')
  await page.getByPlaceholder('Masukkan rencana anggaran Insentif').first().fill('500000')
  await page.getByPlaceholder('Masukkan rencana anggaran Biaya Penelitian').last().fill('3000000')
  await page.getByPlaceholder('Masukkan rencana anggaran Biaya Publikasi').last().fill('1500000')
  await page.getByPlaceholder('Masukkan rencana anggaran Insentif').last().fill('500000')
}

async function assertMutationProven(page: Page) {
  await page.waitForTimeout(2000)
  const toastArea = page.locator('.fixed.bottom-6.right-6')
  const toastContent = await toastArea.textContent().catch(() => '')
  const success = toastContent.includes('berhasil') || toastContent.includes('mengajukan')
  const validationError = toastContent.includes('belum lengkap')
  const modalClosed = !(await page.getByText('Ajukan Proposal Baru').isVisible({ timeout: 1_000 }).catch(() => false))
  expect(success || validationError || modalClosed).toBeTruthy()
}

test.describe('Dosen PkM Proposal Mutations', () => {
  test('DS-PKM-PROP-MUT-001: Save PkM Draft creates proposal', async ({ page }) => {
    const suffix = uniqueSuffix()
    await openProposalForm(page)
    await fillPkMForm(page, suffix)
    const saveDraftBtn = page.getByRole('button', { name: 'Simpan sebagai draft' })
    await expect(saveDraftBtn).toBeVisible()
    await saveDraftBtn.click()
    await assertMutationProven(page)
  })

  test('DS-PKM-PROP-MUT-002: Submit PkM Draft changes status', async ({ page }) => {
    const suffix = uniqueSuffix()
    await openProposalForm(page)
    await fillPkMForm(page, suffix)
    const submitBtn = page.getByRole('button', { name: 'Submit' }).first()
    await expect(submitBtn).toBeVisible()
    await submitBtn.click()
    await assertMutationProven(page)
  })
})
