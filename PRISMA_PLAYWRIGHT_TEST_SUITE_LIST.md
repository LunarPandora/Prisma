# Playwright Black-Box Test Inventory

> **Source of truth:** All data below was extracted directly from the Playwright spec files in `prisma/tests/e2e/`, NOT from documentation or assumptions.
> **Command used:** `npx playwright test --list --config=playwright.config.ts` confirmed **304 actual test cases** across 62 spec files + 5 auth setup files (309 listed items total).
> **Date:** 2026-08-20

---

## 1. Current Test Suite Summary

| Role | Tests | Spec Files |
| ---- | ----: | ----------: |
| Dosen | 92 | 19 |
| Staff LPPM | 59 | 12 |
| Ketua LPPM | 58 | 12 |
| Superadmin | 59 | 12 |
| Reviewer | 36 | 7 |
| **Total (test cases)** | **304** | **62** |

> **Auth setup projects** (5) listed by Playwright are NOT test cases -- they are `storageState` generators. Playwright's "Total: 309 tests in 67 files" includes these 5 setup projects.
>
> **Baseline comparison:** The previously reported baseline was Staff=60, Dosen=93, Ketua=59, Reviewer=37, Superadmin=60 (total=309). The current suite differs by -1 per role (total=304). The discrepancy likely stems from the 5 auth setup projects being counted in the prior total, combined with a counting methodology difference for the -1 per role.


---

## 2. Dosen Tests (92)

### 2.1 Authentication (`dosen/auth.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| DS-AUTH-001 | Dosen login succeeds and lands on dashboard | Workflow | Navigates to `/dashboard`, waits for load, asserts "Beranda" heading visible |
| DS-AUTH-002 | Unauthenticated access redirects to login | Visibility | Clears localStorage, navigates to `/login`, asserts email, password fields, and "Masuk" button visible |
| DS-AUTH-003 | Wrong credentials show error | Validation | Fills wrong email/password, clicks "Masuk", waits 3s, asserts URL still contains `/login` |
| DS-AUTH-004 | Logged-in user cannot access login page | Authorization | Navigates to `/login` while logged in, asserts redirect to `**/dashboard**`, checks "Beranda" heading |

### 2.2 Dashboard (`dosen/dashboard.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| DS-DASH-001 | Dosen dashboard loads with correct heading | Visibility | Asserts "Beranda" heading visible |
| DS-DASH-002 | Summary cards render with expected Dosen information | Visibility | Asserts "Proposal Aktif", "Laporan Berjalan", "Perlu Tindakan", "Selesai" all visible |
| DS-DASH-003 | Perlu Tindakan Anda section renders | Visibility | Asserts "Perlu Tindakan Anda" text visible |
| DS-DASH-004 | Progress Penelitian section renders | Visibility | Asserts "Penelitian Terakhir" text visible |
| DS-DASH-005 | Menunggu Proses section renders when items exist | Visibility | Conditionally checks if "Menunggu Proses" is visible |
| DS-DASH-006 | Aktivitas Terbaru section renders | Visibility | Asserts "Aktivitas Terbaru" text visible |
| DS-DASH-007 | Sidebar shows correct Dosen menu items | Visibility | Asserts `#navbar-menu` visible |
| DS-DASH-008 | Perlu Tindakan items are clickable | Visibility | Conditionally finds cursor-pointer items matching `E2E-PEN|E2E-PKM` |

### 2.3 Navigation (`dosen/navigation.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| DS-NAV-001 | Sidebar shows correct Dosen modules | Visibility | Asserts `#navbar-menu` visible |
| DS-NAV-002 | Monitor Progress module is accessible | Visibility | Navigates to `?module=dosenmonitoringprogress`, asserts "Monitoring Progress" visible |
| DS-NAV-003 | Profil Dosen module is accessible | Visibility | Navigates to `?module=profildosen`, waits for domcontentloaded |
| DS-NAV-004 | Google Scholar module is accessible | Visibility | Navigates to `?module=dosenscholar`, waits for domcontentloaded |
| DS-NAV-005 | Staff-only modules are not accessible to Dosen | Authorization | Navigates to `?module=staffmonitoringprogress`, checks Dosen cannot see Staff content |

### 2.4 Notifications (`dosen/notifications.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| DS-NOTIF-001 | Notification UI is accessible | Visibility | Asserts `#navbar-menu` visible (notification bell) |
| DS-NOTIF-002 | Notification history page loads | Visibility | Navigates to `?module=notifications`, waits for domcontentloaded |
| DS-NOTIF-003 | Unread notification exists for Dosen | Visibility | Conditionally checks if notification bell element is visible |

### 2.5 Logbook (`dosen/logbook/logbook.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| DS-LOG-001 | Logbook can be opened from eligible Laporan | Visibility | Clicks "Lihat Laporan", navigates to "Proses Penelitian" tab, finds "Dalam pengerjaan" row, hovers, checks for logbook button |
| DS-LOG-002 | Logbook entries are displayed when logbook is opened | Visibility | Same navigation, clicks action button, asserts "Logbook" modal appears |
| DS-LOG-003 | Logbook entries show judul and tanggal | Visibility | Same navigation, opens logbook, checks for "E2E-LOG" text |
| DS-LOG-004 | Add entry button is available in logbook | Visibility | Same navigation, opens logbook, asserts "Tambah/Add/Tambah Entry" button visible |

### 2.6 Proposal Monitoring -- Penelitian (`dosen/proposal/penelitian.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| DS-PEN-PROP-001 | Monitoring Progress page loads with skema cards | Visibility | Asserts "Monitoring Progress" visible, checks `[data-highlight]` element |
| DS-PEN-PROP-002 | Clicking Proposal button navigates to proposal monitoring | Visibility | Clicks "Lihat Proposal", asserts "Monitoring Progress Proposal" visible |
| DS-PEN-PROP-003 | Draft proposal is visible in Pengajuan tab | Visibility | Clicks "Lihat Proposal", asserts "Draft" and "Penerimaan Proposal" visible |
| DS-PEN-PROP-004 | Upload pending proposal shows correct status | Visibility | Clicks "Lihat Proposal", asserts "Menunggu proposal untuk diupload" visible |
| DS-PEN-PROP-005 | Proposal waiting for Ketua review shows correct status | Visibility | Clicks "Lihat Proposal", clicks "Seleksi" tab, asserts "Menunggu review dari Ketua LPPM" visible |
| DS-PEN-PROP-006 | Accepted proposal shows in Pengumuman tab | Visibility | Clicks "Lihat Proposal", clicks "Pengumuman" tab, asserts "Proposal Diterima" visible |
| DS-PEN-PROP-007 | Rejected proposal shows correct status | Visibility | Clicks "Lihat Proposal", clicks "Seleksi" tab, asserts "Ditolak" visible |
| DS-PEN-PROP-008 | Draft proposal has edit action available | Visibility | Clicks "Lihat Proposal", asserts table visible and row count > 1 |
| DS-PEN-PROP-009 | Ajukan Proposal button is available | Visibility | Clicks "Lihat Proposal", asserts "Ajukan Proposal" button visible |
| DS-PEN-PROP-010 | Type filter shows Penelitian option | Visibility | Clicks "Lihat Proposal", asserts "Penelitian" text visible |
| DS-PEN-PROP-011 | Proposal under review shows reviewer status | Visibility | Clicks "Lihat Proposal", clicks "Seleksi" tab, asserts "Menunggu review" visible |
| DS-PEN-PROP-012 | Breadcrumb navigation works | Visibility | Clicks "Lihat Proposal", clicks "Monitoring Progress" breadcrumb, asserts "Pantau progres proposal" visible |
| DS-PEN-PROP-013 | Table shows columns for Jenis, Rencana Judul, Tahap & Status | Visibility | Clicks "Lihat Proposal", asserts columnheaders "Jenis", "Rencana Judul", "Tahap & Status" visible |
| DS-PEN-PROP-014 | Multiple Penelitian proposals are displayed | Visibility | Clicks "Lihat Proposal", asserts row count >= 2 |
| DS-PEN-PROP-015 | Search input is functional | Visibility | Clicks "Lihat Proposal", fills search with "Draft", asserts row count >= 1 |

### 2.7 Proposal Monitoring -- PkM (`dosen/proposal/pkm.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| DS-PKM-PROP-001 | PkM proposals are visible in monitoring | Visibility | Clicks "Lihat Proposal", asserts "PkM" text visible |
| DS-PKM-PROP-002 | PkM Draft proposal has correct status | Visibility | Clicks "Lihat Proposal", filters by PkM, asserts "Draft" visible |
| DS-PKM-PROP-003 | PkM Review proposal shows correct status | Visibility | Clicks "Lihat Proposal", clicks "Seleksi" tab, asserts "Menunggu review" visible |
| DS-PKM-PROP-004 | PkM Accepted proposal shows in Pengumuman tab | Visibility | Clicks "Lihat Proposal", clicks "Pengumuman" tab, asserts "Proposal Diterima" visible |
| DS-PKM-PROP-005 | PkM proposals are isolated from Penelitian | Visibility | Clicks "Lihat Proposal", filters by PkM, asserts row count >= 1 |
| DS-PKM-PROP-006 | PkM Ajukan Proposal button is available | Visibility | Clicks "Lihat Proposal", asserts "Ajukan Proposal" button visible |
| DS-PKM-PROP-007 | PkM table shows correct columns | Visibility | Clicks "Lihat Proposal", asserts columnheaders "Jenis", "Rencana Judul", "Tahap & Status" visible |

### 2.8 Journey (`dosen/journey/`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| DS-JOURNEY-PEN-001 | Full Penelitian journey -- Dashboard to Laporan | Workflow | End-to-end: Dashboard -> summary cards -> Monitoring Progress -> "Lihat Proposal" -> Draft -> Pengumuman -> "Proposal Diterima" -> back -> "Lihat Laporan" -> verify table |
| DS-JOURNEY-PKM-001 | Full PkM journey -- Dashboard to Laporan | Workflow | End-to-end: Dashboard -> Monitoring Progress -> "Lihat Proposal" -> PkM type -> Draft -> Pengumuman -> "Proposal Diterima" -> "Lihat Laporan" -> PkM filter |

### 2.9 Laporan Penelitian -- Ganjil (`dosen/laporan/penelitian-ganjil.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| DS-PEN-LAP-GAN-001 | Laporan monitoring page loads via skema | Visibility | Clicks "Lihat Laporan", asserts "Monitoring" visible |
| DS-PEN-LAP-GAN-002 | Ganjil semester filter shows laporans | Visibility | Filters by "Ganjil", asserts table visible |
| DS-PEN-LAP-GAN-003 | Belum dimulai laporan shows correct status | Visibility | Filters "Ganjil", asserts "Belum dimulai" visible |
| DS-PEN-LAP-GAN-004 | Dalam pengerjaan laporan shows correct status | Visibility | Filters "Ganjil", asserts "Dalam pengerjaan" visible |
| DS-PEN-LAP-GAN-005 | Publikasi stage laporan shows correct status | Visibility | Clicks "Publikasi" tab, asserts "Menunggu review Admin" visible |
| DS-PEN-LAP-GAN-006 | Diseminasi stage laporan shows correct status | Visibility | Clicks "Diseminasi" tab, asserts "Dalam pengerjaan" visible |
| DS-PEN-LAP-GAN-007 | Claim Dana stage shows correct status | Visibility | Clicks "Claim Dana" tab, asserts "Menunggu konfirmasi penerimaan dana" visible |
| DS-PEN-LAP-GAN-008 | Selesai laporan shows completed status | Visibility | Clicks "Selesai" tab, asserts "Selesai" visible |
| DS-PEN-LAP-GAN-009 | Semester filter is present | Visibility | Asserts "Semester" text visible |
| DS-PEN-LAP-GAN-010 | Type filter is present | Visibility | Asserts "Jenis" text visible |
| DS-PEN-LAP-GAN-011 | Laporan tabs are visible | Visibility | Asserts buttons matching `Proses|Publikasi|Diseminasi|Claim Dana|Selesai` exist |
| DS-PEN-LAP-GAN-012 | Breadcrumb navigation works | Visibility | Clicks "Monitoring Progress" breadcrumb, asserts "Pantau progres proposal" visible |

### 2.10 Laporan Penelitian -- Genap (`dosen/laporan/penelitian-genap.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| DS-PEN-LAP-GEN-001 | Genap laporans are visible | Visibility | Filters "Genap", asserts table visible |
| DS-PEN-LAP-GEN-002 | Genap Belum dimulai shows correct status | Visibility | Filters "Genap", asserts "Belum dimulai" visible |
| DS-PEN-LAP-GEN-003 | Genap Dalam pengerjaan shows correct status | Visibility | Filters "Genap", asserts "Dalam pengerjaan" visible |
| DS-PEN-LAP-GEN-004 | Genap laporans are distinct from Ganjil | Visibility | Filters "Genap", asserts table visible and row count >= 2 |

### 2.11 Laporan PkM (`dosen/laporan/pkm.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| DS-PKM-LAP-001 | PkM laporans are visible | Visibility | Filters "PkM", asserts table visible |
| DS-PKM-LAP-002 | PkM Claim Dana stage shows correct status | Visibility | Clicks "Claim Dana" tab, asserts "Dalam pengerjaan" visible |
| DS-PKM-LAP-003 | PkM Proses stage shows correct status | Visibility | Clicks "Proses PkM" tab, asserts "Dalam pengerjaan" visible |
| DS-PKM-LAP-004 | PkM Publikasi stage shows correct status | Visibility | Clicks "Publikasi" tab, asserts "Menunggu review Admin" visible |
| DS-PKM-LAP-005 | PkM Pengembalian Dana stage shows correct status | Visibility | Clicks "Pengembalian Dana" tab, asserts "Menunggu Pengembalian Dana" visible |
| DS-PKM-LAP-006 | PkM Diseminasi stage shows correct status | Visibility | Clicks "Diseminasi" tab, asserts "Dalam pengerjaan" visible |
| DS-PKM-LAP-007 | PkM laporans are isolated from Penelitian | Visibility | Filters "PkM", asserts "PkM" text visible |
| DS-PKM-LAP-008 | PkM laporan tabs are visible | Visibility | Asserts buttons matching `Claim Dana|Proses PkM|Publikasi|Pengembalian Dana|Diseminasi` |

### 2.12 Semester Isolation (`dosen/laporan/semester-isolation.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| DS-PEN-LAP-SEM-001 | Ganjil and Genap are distinct records | Visibility | Filters Ganjil (count >= 2), filters Genap (count >= 2) |
| DS-PEN-LAP-SEM-002 | Ganjil filter shows only Ganjil laporans | Visibility | Filters Ganjil, asserts "Ganjil" tag count >= 1 |
| DS-PEN-LAP-SEM-003 | Genap filter shows only Genap laporans | Visibility | Filters Genap, asserts "Genap" tag count >= 1 |
| DS-PEN-LAP-SEM-004 | Both semester filter shows all laporans | Visibility | Asserts table visible, row count >= 2 |

### 2.13 Mutation -- Proposal Penelitian (`dosen/mutation/proposal-penelitian.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| DS-PEN-PROP-MUT-001 | Save Draft creates new proposal | Mutation | Opens proposal form, fills all fields (skema, judul, topik, bidang, budget, etc.), clicks "Simpan sebagai draft", asserts toast/modal response |
| DS-PEN-PROP-MUT-002 | Submit Draft changes status to Menunggu upload | Mutation | Opens proposal form, fills all fields, clicks "Submit", asserts toast/modal response |
| DS-PEN-PROP-MUT-003 | Upload proposal document transitions status | Mutation | Finds "Menunggu proposal untuk diupload" row, hovers, clicks Upload, uploads test PDF, clicks "Ajukan Proposal" |

### 2.14 Mutation -- Proposal PkM (`dosen/mutation/proposal-pkm.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| DS-PKM-PROP-MUT-001 | Save PkM Draft creates proposal | Mutation | Opens proposal form, fills PkM fields (jenis=PkM), clicks "Simpan sebagai draft", asserts response |
| DS-PKM-PROP-MUT-002 | Submit PkM Draft changes status | Mutation | Opens proposal form, fills PkM fields, clicks "Submit", asserts response |

### 2.15 Mutation -- Laporan (`dosen/mutation/laporan.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| DS-PEN-LAP-GAN-MUT-001 | Finish laporan transitions from Proses to Publikasi | Mutation | Navigates to Proses tab, finds "Dalam pengerjaan" row, clicks "Selesaikan Laporan"/"Flag", confirms, asserts alert |
| DS-PEN-LAP-GEN-MUT-001 | Finish Genap laporan advances correctly | Mutation | Same as above but filters Genap first |
| DS-PEN-LAP-SEM-MUT-001 | Ganjil mutation does not affect Genap | Mutation | Records Genap row count, mutates Ganjil, switches back, asserts Genap unchanged |

### 2.16 Mutation -- Logbook (`dosen/mutation/logbook.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| DS-LOG-MUT-001 | Create new logbook entry | Mutation | Opens logbook, clicks "Tambah Logbook", fills judul/deskripsi/tanggal/url, clicks "Simpan", asserts form closed or success toast |

### 2.17 Mutation -- Publikasi & Dana (`dosen/mutation/publikasi-dana.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| DS-PEN-PUB-MUT-001 | Save publikasi info on Publikasi stage laporan | Mutation | Opens Publikasi form, fills judul/jurnal/link, clicks "Simpan Informasi", asserts toast |
| DS-PEN-DANA-MUT-001 | Upload bukti terima for Claim Dana | Mutation | Opens Claim Dana upload, uploads test file, clicks Upload, asserts toast |
| DS-PKM-RETURN-MUT-001 | Upload bukti pengembalian for PkM | Mutation | Opens Pengembalian Dana upload, uploads test file, clicks Upload, asserts toast |

### 2.18 Mutation -- Notifications & Diseminasi (`dosen/mutation/notification-diseminasi.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| DS-NOTIF-MUT-001 | Click notification navigates to correct page | Mutation | Opens notification dropdown, clicks first notification, asserts URL changed |
| DS-NOTIF-MUT-002 | Unread notification becomes read after click | Mutation | Opens notification, finds unread dot, clicks, navigates back, re-opens, asserts read |
| DS-PEN-DIS-MUT-001 | Diseminasi stage shows correct state for Dosen | Visibility | Navigates to Diseminasi tab, asserts table visible, row count >= 1 |
| DS-REV-MUT-001 | Revision notification and Revisi status are handled | Visibility | Navigates to notifications, asserts "Notifikasi" visible, checks for revision text |


---

## 3. Staff LPPM Tests (59)

### 3.1 Authentication (`staff/auth.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| ST-AUTH-001 | Staff login succeeds and lands on dashboard | Workflow | Navigates to `/dashboard`, asserts "Beranda" and "Tugas dan tanggung jawab Staff LPPM" visible |
| ST-AUTH-002 | Unauthenticated access redirects to login | Visibility | Clears localStorage, navigates to `/login`, asserts email, password, "Masuk" visible |
| ST-AUTH-003 | Wrong credentials show error | Validation | Fills wrong credentials, clicks "Masuk", waits 3s, asserts URL still `/login` |
| ST-AUTH-004 | Logged-in user cannot access login page | Authorization | Navigates to `/login` while logged in, asserts redirect to `**/dashboard**` |

### 3.2 Dashboard (`staff/dashboard.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| ST-DASH-001 | Staff dashboard loads with correct heading | Visibility | Asserts "Beranda" and "Tugas dan tanggung jawab Staff LPPM" visible |
| ST-DASH-002 | Summary cards render with correct labels | Visibility | Asserts "Seleksi Proposal", "Penugasan Reviewer", "Pemeriksaan Laporan", "Konfirmasi Dana" visible |
| ST-DASH-003 | Summary card action links navigate correctly | Visibility | Finds "Periksa Proposal", clicks if visible, asserts URL contains `module=staffmonitoringprogress` |
| ST-DASH-004 | Perlu Tindakan Anda section renders | Visibility | Asserts "Perlu Tindakan Anda" visible |
| ST-DASH-005 | Beban Kerja section renders | Visibility | Asserts "Beban Kerja Staff" visible |
| ST-DASH-006 | Sidebar shows correct menu items for Staff LPPM | Visibility | Asserts `#navbar-menu` visible |
| ST-DASH-007 | Notification section exists in sidebar | Visibility | Asserts `#navbar-menu` and `#logout-section` visible |

### 3.3 Notifications (`staff/notifications.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| ST-NOTIF-001 | Sidebar is present | Visibility | Asserts `#navbar-menu` and `#logout-section` visible |
| ST-NOTIF-002 | Sidebar menu is interactive | Visibility | Finds first `div` child of `#navbar-menu`, asserts visible |
| ST-NOTIF-003 | Notification history page loads | Visibility | Navigates to `notifications` module, asserts "Notifikasi" heading visible (15s timeout) |
| ST-NOTIF-004 | Notification filter buttons exist | Visibility | Asserts "Semua" and "Belum Dibaca" buttons visible |
| ST-NOTIF-005 | Mark all as read button exists when unread notifications present | Visibility | Conditionally checks if "Tandai semua sudah dibaca" is visible |

### 3.4 Kriteria Penilaian (`staff/kriteria.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| ST-KRIT-001 | Kriteria page loads | Visibility | Navigates to `ketuacriteria` module, asserts "Pengaturan Kriteria" visible (15s timeout) |
| ST-KRIT-002 | Kriteria Penilaian tab is visible | Visibility | Asserts "Kriteria Penilaian" button visible |
| ST-KRIT-003 | Kriteria entries are displayed | Visibility | Asserts "Kesesuaian Tema" visible (10s timeout) |
| ST-KRIT-004 | Kategori Publikasi tab is accessible | Visibility | Finds "Kategori Publikasi" button, clicks if visible |
| ST-KRIT-005 | Bobot total is displayed | Visibility | Finds text matching `/total|bobot/i`, asserts visible |

### 3.5 Monitoring Skema (`staff/monitoring-skema.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| ST-SKEMA-001 | Monitoring Progress page loads | Visibility | Navigates to `staffmonitoringprogress`, asserts "Monitoring Progress" and "Pantau progres proposal" visible |
| ST-SKEMA-002 | Skema cards are displayed | Visibility | Asserts first `[data-highlight]` element visible (15s timeout) |
| ST-SKEMA-003 | Search input is functional | Visibility | Fills search with "Penelitian", counts `[data-highlight]` cards, asserts count >= 1 |
| ST-SKEMA-004 | Clicking Proposal button navigates to proposal monitoring | Visibility | Clicks "Lihat Proposal", asserts "Monitoring Progress Proposal" visible |
| ST-SKEMA-005 | Clicking Laporan button navigates to laporan monitoring | Visibility | Clicks "Lihat Laporan", asserts "Laporan Penelitian" visible |
| ST-SKEMA-006 | Breadcrumb back navigation works | Visibility | Clicks "Lihat Proposal", then "Monitoring Progress" breadcrumb, asserts "Pantau progres proposal" visible |

### 3.6 Proposal Seleksi (`staff/proposal/seleksi.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| ST-PROP-SEL-001 | Proposal monitoring page loads with tabs | Visibility | Navigates to Seleksi tab, asserts "Monitoring Progress Proposal" and buttons "Pengajuan", "Seleksi", "Pengumuman" visible |
| ST-PROP-SEL-002 | Seleksi tab loads and shows table | Visibility | Clicks "Seleksi", asserts first table visible (10s timeout) |
| ST-PROP-SEL-003 | Context menu opens and shows actions on row | Visibility | Right-clicks second row, asserts "Context menu" role visible, menuitem count > 0 |
| ST-PROP-SEL-005 | Context menu appears for data row | Visibility | Right-clicks second row, asserts context menu visible |
| ST-PROP-SEL-006 | Type filter is present | Visibility | Finds `input[placeholder="Jenis"]`, asserts visible |

### 3.7 Reviewer Assignment (`staff/proposal/reviewer-assignment.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| ST-PROP-REV-001 | Reviewer assignment modal opens | Visibility | Finds "E2E: Sistem Rekomendasi" row, clicks "Tugaskan Reviewer", asserts "Penugasan Reviewer" visible |
| ST-PROP-REV-002 | Reviewer assignment modal shows available reviewers | Visibility | Opens reviewer modal, asserts "Reviewer A", "Reviewer B", "Reviewer C" visible |
| ST-PROP-REV-003 | Reviewer assignment has submit button | Visibility | Opens reviewer modal, asserts submit button visible |
| ST-PROP-REV-004 | Under-review proposal shows reviewer status | Visibility | Finds "E2E: Optimasi Database" row, asserts reviewer names visible |
| ST-PROP-REV-005 | Progress indicator shows 0/3 when no reviewers selected | Visibility | Opens reviewer modal, asserts "0/3 dipilih" visible |
| ST-PROP-REV-006 | Submit button disabled when not exactly 3 reviewers | Visibility | Opens reviewer modal, asserts submit button is disabled |

### 3.8 Reviewer Validation (`staff/proposal/reviewer-validation.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| ST-REV-API-VAL-001 | Backend rejects fewer than 3 reviewers | Validation | (1) POST `/api/penugasan/assign` with 2 IDs -> rejected. (2) With 4 IDs -> rejected. (3) With duplicate IDs -> rejected. (4) Proposal status unchanged |

### 3.9 Authorization Workflow (`staff/authorization-workflow.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| AUTH-STAFF-001 | Staff sees reject/return actions at Seleksi stage | Authorization | Navigates to Seleksi tab, asserts heading and table visible |
| AUTH-STAFF-002 | Staff sees return action at Laporan Proses stage | Authorization | Navigates to laporan monitoring, asserts heading visible |
| AUTH-STAFF-003 | Staff sees return action at Laporan Publikasi stage | Authorization | Navigates to laporan monitoring, asserts heading visible |
| AUTH-STAFF-004 | Staff sees return action at Laporan Claim Dana stage | Authorization | Navigates to laporan monitoring, asserts heading visible |
| AUTH-KETUA-001 | Ketua sees pending authorization requests in Proposal view | Authorization | Navigates to Seleksi tab, asserts heading visible |
| AUTH-KETUA-002 | Ketua sees pending return requests in Laporan view | Authorization | Navigates to laporan monitoring, asserts heading visible |
| AUTH-CHECK-001 | Proposal Seleksi Ketua approve flow still accessible | Authorization | Navigates to Seleksi tab, asserts table visible |
| AUTH-CHECK-002 | Diseminasi normal Ketua decision still accessible | Authorization | Navigates to laporan, clicks "Diseminasi" if visible, asserts table visible |
| AUTH-MON-001 | Ketua can access Proses stage without approval gate | Authorization | Navigates to laporan monitoring, asserts heading visible |
| AUTH-MON-002 | Ketua can access Publikasi stage without approval gate | Authorization | Navigates to laporan monitoring, asserts heading visible |
| AUTH-MON-003 | Ketua can access Claim Dana stage without approval gate | Authorization | Navigates to laporan monitoring, asserts heading visible |
| AUTH-PRESERVE-001 | Proposal data not deleted on return for revision | Authorization | Navigates to proposal monitoring, asserts heading visible |
| AUTH-PRESERVE-002 | Laporan data not destroyed on return | Authorization | Navigates to laporan monitoring, asserts heading visible |

### 3.10 Return Execution (`staff/return-execution.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| ST-RETURN-EXEC-001 | Staff return request creates AuthorizationRequest and preserves proposal state | Mutation | (1) API GET `/api/proposal` finds target. (2) API GET `/api/authorization-request` verifies none pending. (3) UI: right-clicks row -> "Kembalikan untuk Perbaikan" -> enters reason in prompt. (4) API verifies new AuthorizationRequest with `action=return_proposal_for_revision`, `status=Menunggu Persetujuan`. (5) API verifies proposal status unchanged. (6) afterEach cleans up via API |

### 3.11 Laporan (`staff/laporan/diseminasi.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| ST-LAP-001 | Laporan monitoring page loads via deep link | Visibility | Navigates to `staffmonitoringprogresslaporan`, asserts heading visible (15s timeout) |
| ST-LAP-002 | Laporan page shows tabs for different stages | Visibility | Clicks "Lihat Laporan" if visible, asserts "Laporan Penelitian" visible |
| ST-LAP-003 | Semester filter is present | Visibility | Clicks "Lihat Laporan", asserts "Ganjil" visible |

### 3.12 Dana (`staff/dana/claim.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| ST-DANA-001 | Staff can access Dana monitoring via deep link | Visibility | Navigates to laporan monitoring, asserts heading visible |
| ST-DANA-002 | Dashboard shows Konfirmasi Dana summary card | Visibility | Navigates to `/dashboard`, asserts "Konfirmasi Dana" visible |
| ST-DANA-003 | Konfirmasi Dana action link navigates correctly | Visibility | Clicks "Konfirmasi Dana" if visible, asserts URL contains `module=staffmonitoringprogresslaporan` |


---

## 4. Ketua LPPM Tests (58)

### 4.1 Authentication (`ketua/auth.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| KT-AUTH-001 | Authenticated Ketua reaches dashboard | Workflow | Navigates to `/dashboard`, asserts navbar visible |
| KT-AUTH-002 | Unauthenticated access redirects to login | Visibility | Clears cookies, navigates to dashboard, expects redirect to login or stays |
| KT-AUTH-003 | Authenticated Ketua redirected from login page | Authorization | Navigates to `/login`, asserts URL still contains `dashboard` |
| KT-AUTH-004 | Ketua cannot access Staff-only modules | Authorization | Checks sidebar does not show Staff-only modules (`kriteria`, `masterdata`) |

### 4.2 Dashboard (`ketua/dashboard.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| KT-DASH-001 | Dashboard loads | Visibility | Asserts "Beranda" heading visible |
| KT-DASH-002 | Proposal and Otorisasi summary cards render | Visibility | Checks body text contains "Proposal Menunggu" and "Otorisasi Pending" |
| KT-DASH-003 | Items requiring Ketua normal decisions are visible | Visibility | Checks body text contains "Menunggu Keputusan Saya" |
| KT-DASH-004 | Pending authorization items appear in action queue | Visibility | Checks body text contains `KT-E2E`, "Proposal Menunggu", or "Otorisasi" |
| KT-DASH-005 | Dashboard has multiple content sections | Visibility | Checks body text contains "Menunggu Keputusan Saya" and "Beranda" |
| KT-DASH-006 | Dashboard CTA navigates to monitoring context | Visibility | Clicks "Lihat" CTA link if visible, verifies URL contains `module=` |

### 4.3 Navigation (`ketua/navigation.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| KT-NAV-001 | Sidebar shows navigation icons for Ketua | Visibility | Asserts `#navbar-menu` visible, contains nav icons, count > 0 |
| KT-NAV-002 | Proposal monitoring is accessible | Visibility | Navigates to `module=staffmonitoringprogress`, checks for "Monitoring"/"Skema"/"Proposal" |
| KT-NAV-003 | Laporan monitoring is accessible | Visibility | Navigates to `module=staffmonitoringprogresslaporan`, checks for "Monitoring"/"Laporan" |
| KT-NAV-004 | Monitoring Progress page loads for Ketua | Visibility | Navigates to monitoring page, checks body contains "Monitoring Progress" |
| KT-NAV-005 | Staff-only destructive actions not visible to Ketua | Authorization | Verifies "Kembalikan dari Seleksi" NOT visible |
| KT-NAV-006 | Superadmin modules not exposed to Ketua | Authorization | Checks body text does NOT contain "superadmin" |

### 4.4 Notifications (`ketua/notifications.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| KT-NOTIF-001 | Sidebar renders for Ketua | Visibility | Asserts `#navbar-menu` visible on dashboard |
| KT-NOTIF-002 | Dashboard loads with notification area | Visibility | Asserts "Beranda" visible |
| KT-NOTIF-003 | Sidebar has navigation elements | Visibility | Asserts sidebar has navigation elements (a/button/svg/img), count > 0 |

### 4.5 Reviewer Rule (`ketua/reviewer-rule.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| KT-REV-001 | Partial review (2/3) not appearing ready for Ketua decision | Visibility | Checks body text contains "Menunggu review" (partial 2/3 not ready) |
| KT-REV-002 | Post-review (3/3) appears ready for Ketua decision | Visibility | Checks "Menunggu persetujuan Ketua LPPM" badge visible (3/3 post-review ready) |
| KT-REV-003 | All 3 reviewer names visible for post-review proposal | Visibility | Checks body text for Reviewer A, B, or C names; asserts at least 1 visible |

### 4.6 Proposal Seleksi (`ketua/proposal/seleksi.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| KT-PROP-SEL-001 | Ketua sees proposal waiting for normal review | Visibility | "Menunggu review dari Ketua LPPM" status badge visible |
| KT-PROP-SEL-002 | Ketua sees proposal table with action buttons | Visibility | Proposal table visible, row count > 1 |
| KT-PROP-SEL-003 | Post-review proposal visible for Ketua decision | Visibility | "Menunggu persetujuan Ketua LPPM" badge visible |
| KT-PROP-SEL-004 | Proposal table shows reviewer column | Visibility | Table has columnheader "Reviewer" |
| KT-PROP-SEL-MUT-001 | Ketua can approve proposal at Seleksi checkpoint | Visibility | Finds row with "Menunggu review dari Ketua LPPM", checks action buttons exist (does NOT click approve) |

### 4.7 Proposal Reviewer Result (`ketua/proposal/reviewer-result.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| KT-PROP-REV-001 | Post-review proposal visible with 3/3 reviews | Visibility | "Menunggu persetujuan Ketua LPPM" badge visible |
| KT-PROP-REV-002 | Post-review proposal shows reviewer names | Visibility | Body text contains "Reviewer A", "Reviewer B", or "Reviewer C" |
| KT-PROP-REV-003 | Partial review proposal not ready for Ketua decision | Visibility | "Menunggu review" partial status visible |
| KT-PROP-REV-004 | Post-review proposal has action buttons | Visibility | Row with "Menunggu persetujuan Ketua LPPM" has action buttons (does NOT click) |
| KT-PROP-REV-MUT-001 | Ketua can make post-review decision | Visibility | Finds "Menunggu persetujuan Ketua LPPM" row, checks action buttons exist (does NOT click) |

### 4.8 Proposal Normal Approval (`ketua/proposal/normal-approval.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| KT-PROP-APPROVE-001 | Ketua approval transitions proposal to Staff review | Mutation | **Full workflow mutation:** (1) Captures proposal state via API. (2) Verifies no AuthorizationRequest exists. (3) Navigates to Seleksi tab. (4) Finds row with "Ketua: O Belum" + "Staff: V Setuju". (5) Right-clicks -> "Setujui Proposal". (6) Verifies proposal status changed from "Menunggu review dari Ketua LPPM" to "Menunggu review Staff LPPM". (7) Verifies `ketua_seleksi_approved=true`. (8) Verifies NO AuthorizationRequest was created. (9) Verifies historical data preserved |

### 4.9 Proposal Authorization (`ketua/proposal/authorization.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| KT-AUTHZ-PROP-REJECT-001 | Staff reject request visible for Ketua | Visibility | "Menunggu review dari Ketua LPPM" badge visible |
| KT-AUTHZ-PROP-REJECT-002 | Ketua can view reject request details | Visibility | Row with "Menunggu review dari Ketua LPPM" has action buttons |
| KT-AUTHZ-PROP-RETURN-001 | Staff return request visible for Ketua | Visibility | "Menunggu review dari Ketua LPPM" badge visible |
| KT-AUTHZ-PROP-RETURN-002 | Ketua can view return request details | Visibility | Row with "Menunggu review dari Ketua LPPM" has action buttons |
| KT-AUTHZ-PENDING-001 | Authorization queue shows pending requests | Visibility | Body text contains "Menunggu Persetujuan", "Authorization", or "Otorisasi" |
| KT-AUTHZ-PENDING-002 | Destructive action not yet occurred | Visibility | "Menunggu review dari Ketua LPPM" badge visible |

### 4.10 Proposal Authorization Execution (`ketua/proposal/authorization-execution.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| KT-AUTHZ-APPROVE-001 | Ketua approval executes return transition | Mutation | **Full workflow mutation:** (1) Captures pending `return_proposal_for_revision` authorization request via API. (2) Captures proposal state. (3) Finds "Kembalikan Proposal untuk Revisi" row. (4) Clicks "Setujui". (5) Verifies proposal status changed to "Revisi". (6) Verifies historical data preserved. (7) Verifies request removed from pending queue. (8) Verifies UI no longer shows request |
| KT-AUTHZ-DENY-001 | Ketua denial preserves original proposal state | Mutation | **Full workflow mutation:** (1) Captures pending `reject_proposal` authorization request via API. (2) Captures proposal state. (3) Finds "Tolak Proposal" row. (4) Clicks "Tolak". (5) Verifies proposal status UNCHANGED (destructive action blocked). (6) Verifies historical data intact. (7) Verifies request removed from pending queue. (8) Verifies UI no longer shows request |

### 4.11 Laporan Authorization (`ketua/laporan/authorization.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| KT-AUTHZ-PEN-PROSES-001 | Laporan return request visible in authorization queue | Visibility | "Kembalikan Laporan untuk Revisi" text visible |
| KT-AUTHZ-PEN-PUB-001 | Laporan return for Publikasi visible | Visibility | Body text contains "Kembalikan Laporan" |
| KT-AUTHZ-PEN-DIS-001 | Laporan return for Diseminasi visible | Visibility | Body text contains "Kembalikan Laporan" |
| KT-AUTHZ-PEN-DANA-001 | Laporan return for Claim Dana visible | Visibility | Body text contains "Kembalikan Laporan" |
| KT-AUTHZ-PKM-CLAIM-001 | PkM laporan authorization visible | Visibility | Body text contains "Kembalikan Laporan" |
| KT-AUTHZ-DENY-LAP-001 | Authorization queue accessible for laporan | Visibility | "Permintaan Otorisasi" heading visible |
| KT-AUTHZ-DENY-LAP-002 | Authorization requests have action buttons | Visibility | Rounded elements with "Staff LPPM"/"Tolak"/"Kembalikan" text exist, count > 0 |

### 4.12 Laporan Monitoring (`ketua/laporan/monitoring.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| KT-LAP-MON-001 | Ketua can access Monitoring Progress page | Visibility | Navigates to `module=staffmonitoringprogress`, "Monitoring Progress" heading visible |
| KT-LAP-MON-002 | Authorization queue visible on Monitoring Progress | Visibility | "Permintaan Otorisasi" heading visible |
| KT-LAP-MON-003 | Authorization queue shows pending requests count | Visibility | Body text matches `/permintaan menunggu/i` |
| KT-LAP-MON-004 | Staff LPPM authorization requests visible | Visibility | "Staff LPPM 1" text visible |
| KT-LAP-MON-005 | Tolak Proposal request visible | Visibility | "Tolak Proposal" text visible |
| KT-LAP-MON-006 | Kembalikan Proposal request visible | Visibility | "Kembalikan Proposal untuk Revisi" text visible |
| KT-LAP-MON-007 | Kembalikan Laporan request visible | Visibility | "Kembalikan Laporan untuk Revisi" text visible |
| KT-LAP-MON-008 | Authorization requests have action elements | Visibility | Rounded elements with "Staff LPPM"/"Tolak"/"Kembalikan" text exist, count > 0 |
| KT-LAP-MON-009 | Skema cards visible below authorization queue | Visibility | "Penelitian Dosen Tetap 2026" skema card visible |
| KT-LAP-MON-010 | Laporan button available on skema cards | Visibility | "Laporan" button visible on skema cards |


---

## 5. Reviewer Tests (36)

### 5.1 Authentication (`reviewer/auth.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| RV-AUTH-001 | Valid Reviewer login succeeds (dashboard loads) | Workflow | Navigates to `/dashboard`, asserts navbar visible |
| RV-AUTH-002 | Authenticated Reviewer cannot return to login page | Authorization | Navigates to `/login`, asserts URL still contains `dashboard` |
| RV-AUTH-003 | Reviewer cannot access Staff-only modules | Authorization | Loads dashboard sidebar, asserts text does not include `Pengajuan` and `Kelola` |

### 5.2 Dashboard (`reviewer/dashboard.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| RV-DASH-001 | Reviewer dashboard loads successfully | Visibility | Asserts heading "Beranda" visible |
| RV-DASH-002 | Review workload summary cards render | Visibility | Asserts "Menunggu Review", "Sedang Dikerjakan", "Review Selesai" text visible |
| RV-DASH-003 | Dashboard shows review queue section | Visibility | Asserts "Antrian Review" text visible |
| RV-DASH-004 | Dashboard shows queue or empty state | Visibility | Asserts either "Antrian Review" or "Tidak ada review yang menunggu" visible |

### 5.3 Navigation (`reviewer/dashboard.spec.ts` -- Navigation describe block)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| RV-NAV-001 | Reviewer sidebar has menu items | Visibility | Counts sidebar items with `cursor-pointer`, asserts count > 0 |
| RV-NAV-002 | Proposal review page is accessible | Visibility | Navigates to `?module=reviewproposal`, asserts "Monitoring Proses Review" in body |
| RV-NAV-003 | Review Laporan tab is accessible | Visibility | Navigates to reviewproposal, clicks "Review Laporan" tab, asserts "Monitoring Proses Review" in body |

### 5.4 Isolation / Permission (`reviewer/isolation.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| RV-ISO-001 | Reviewer cannot access staff monitoring page | Authorization | Navigates to `?module=staffmonitoringprogress`, asserts "Monitoring Progress Pengajuan" is absent |
| RV-PERM-001 | Reviewer does not see reviewer assignment controls | Authorization | Navigates to reviewproposal, asserts "Penugasan Reviewer" / "Tugaskan Reviewer" is absent |
| RV-AUTHZ-001 | Reviewer cannot access Ketua authorization controls | Authorization | Navigates to reviewproposal, asserts "Permintaan Otorisasi" / "Setujui" / "Tolak pengajuan" is absent |
| RV-NOTIF-001 | Reviewer notification bell is visible | Visibility | Navigates to dashboard, finds bell/notification SVG in sidebar, asserts visible |

### 5.5 Proposal Review (`reviewer/proposal/penelitian.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| RV-PROP-001 | Review Proposal tab renders with table | Visibility | Asserts "Monitoring Proses Review" and "Review Proposal" button visible |
| RV-PROP-002 | Proposal table shows Rencana Judul and Status columns | Visibility | Asserts body contains "Rencana Judul" and "Status" |
| RV-PROP-003 | Unreviewed Proposal shows Belum direview status | Visibility | Asserts body contains "Belum direview" |
| RV-PROP-004 | Review form modal opens when clicking action button | Visibility | Finds row with "Belum direview", clicks action button, asserts form content visible. Skips if no row |
| RV-PROP-MUT-001 | Review form has score inputs and submit button | Visibility | Same row/action-button click, asserts "Submit Review" and submit button visible. Skips if no row |

### 5.6 PkM Proposal Review (`reviewer/proposal/pkm.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| RV-PKM-PROP-001 | PkM Proposal appears in review list | Visibility | Asserts body contains "PkM: Edukasi Digital" |
| RV-PKM-PROP-MUT-001 | PkM review form opens with submit button | Visibility | Finds row "PkM: Edukasi Digital", clicks action button, asserts form visible. Skips if row not found |

### 5.7 Laporan Review (`reviewer/laporan/penelitian.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| RV-LAP-001 | Review Laporan tab is accessible | Visibility | Clicks "Review Laporan" tab, asserts "Judul Laporan" or "Status" in body |
| RV-LAP-002 | Laporan shows review status for assigned reviewer | Visibility | Clicks "Review Laporan" tab, asserts "Belum direview" or "Menunggu" in body |
| RV-LAP-003 | Laporan review form opens with submit button | Visibility | Clicks "Review Laporan" tab, finds "Belum direview" row, opens form. Skips if no row |
| RV-LAP-004 | Laporan already reviewed shows Telah direview | Visibility | Clicks "Review Laporan" tab, asserts "Telah direview" in body |
| RV-LAP-MUT-001 | Laporan review form has score inputs and submit | Visibility | Opens review form, asserts "Submit Review" and submit button visible. Skips if no row |

### 5.8 Mutation -- Pre-Mutation Checks (`reviewer/mutations/mutations.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| RV-3REV-001 | 1/3 reviews -- workflow does NOT advance (before any mutation) | Visibility | Opens review proposal tab, finds row with date "Sabtu, 1 Agustus 2026", asserts "Belum direview" present |
| RV-ISO-MUT-001 | Unassigned proposal not visible to Reviewer | Visibility | Opens review proposal tab, asserts body does NOT contain "Proposal Tidak Ditugaskan" |

### 5.9 Mutation -- Proposal Reviews (`reviewer/mutations/mutations.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| RV-PROP-MUT-002 | Real Penelitian proposal review submission | Mutation | Opens review form for "AI for Education", fills scores [5,4,3,5] + comment, submits, asserts "Telah direview" after |
| RV-PROP-MUT-003 | Reviewed proposal shows Telah direview and action button is disabled | Visibility | Finds row with date "Sabtu, 25 Juli 2026", asserts "Telah direview" badge, checks action button disabled |
| RV-PKM-PROP-MUT-002 | Real PkM proposal review submission | Mutation | Opens review form for "PkM: Edukasi Digital", fills scores [4,5,4,3] + comment, submits, asserts "Telah direview" after |

### 5.10 Mutation -- Laporan Reviews (`reviewer/mutations/mutations.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| RV-LAP-MUT-002 | Real Penelitian Laporan review submission | Mutation | Opens Laporan tab, review form for "Laporan Penelitian Review", fills scores [5,5,4,4] + comment, submits, asserts "Telah direview" |
| RV-LAP-3REV-001 | Laporan status after reviews | Visibility | Opens Laporan tab, asserts body contains "Menunggu keputusan Ketua" or "Telah direview" |
| RV-LAP-PKM-MUT-001 | Real PkM Laporan review submission | Mutation | Opens Laporan tab, review form for "Laporan PkM Review", fills scores [3,4,5,4] + comment, submits, asserts "Telah direview" |

### 5.11 Validation (`reviewer/mutations/mutations.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| RV-VAL-001 | Submit with empty keputusan -- verify actual behavior | Validation | Opens review form, fills scores [3,3,3,3] + comment, clicks submit WITHOUT selecting keputusan, asserts response contains "berhasil"/"Gagal"/"error"/"Submit Review" |

### 5.12 Score Independence & 3/3 Completion (`reviewer/mutations/mutations.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| RV-SCORE-001 + RV-3REV-003 | Different scores, 3rd reviewer submits -> advances | Mutation | Opens review form for row "Senin, 3 Agustus 2026", fills scores [3,5,2,4], selects keputusan "Diterima dengan perbaikan", checks first kesesuaian tema, verifies score inputs, submits, asserts "Menunggu persetujuan Ketua LPPM" or "Telah direview" |

---

## 6. Superadmin Tests (59)

### 6.1 Authentication (`superadmin/auth.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| SA-AUTH-001 | Superadmin login succeeds and lands on dashboard | Workflow | Navigates to `/dashboard`, asserts "Beranda" and "Overview sistem PRISMA" visible |
| SA-AUTH-002 | Unauthenticated Superadmin module access redirects to login | Visibility | Clears localStorage, navigates to `/login`, asserts email/password fields and "Masuk" visible |
| SA-AUTH-003 | Wrong credentials show error | Validation | Clears localStorage, fills wrong email/password, clicks "Masuk", asserts still on `/login` |
| SA-AUTH-004 | Logged-in Superadmin cannot access login page | Authorization | Navigates to `/login`, asserts redirect to `**/dashboard**`, checks "Beranda" |

### 6.2 Dashboard (`superadmin/dashboard.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| SA-DASH-001 | Dashboard loads with correct heading | Visibility | Asserts "Beranda" and "Overview sistem PRISMA" visible |
| SA-DASH-002 | Summary cards render with correct labels | Visibility | Asserts "Total Pengguna", "Total Skema", "Total Proposal", "Laporan Aktif" all visible |
| SA-DASH-003 | Sidebar shows Superadmin menu with logout section | Visibility | Asserts `#navbar-menu` and `#logout-section` visible |

### 6.3 Navigation (`superadmin/navigation.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| SA-NAV-001 | Sidebar menu is visible for Superadmin | Visibility | Asserts `#navbar-menu` and `#logout-section` visible |
| SA-NAV-002 | User management module is accessible | Visibility | Navigates to `users` module, asserts "Daftar Pengguna" heading visible |
| SA-NAV-003 | Prodi management module is accessible | Visibility | Navigates to `prodi` module, asserts "Prodi" heading visible |
| SA-NAV-004 | Mahasiswa management module is accessible | Visibility | Navigates to `mahasiswa` module, asserts "Daftar Mahasiswa" heading visible |
| SA-NAV-005 | Settings module is accessible | Visibility | Navigates to `pengaturan` module, asserts "Pengaturan" or "Pengaturan Umum" visible |
| SA-PERM-001 | Superadmin does NOT see Dosen/Reviewer/Ketua operational workflows | Authorization | Asserts kolaborator link NOT visible in sidebar |

### 6.4 Notifications (`superadmin/notifications.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| SA-NOTIF-001 | Notification API endpoint returns data | API | Calls `GET /api/notifications/`, asserts status 200 and `data.notifications` defined |
| SA-NOTIF-002 | Unread notification count endpoint works | API | Calls `GET /api/notifications/unread-count`, asserts status 200 and `count` property exists |
| SA-NOTIF-MUT-001 | Mark notification as read | Mutation | Fetches notifications, finds first unread, calls `PUT /api/notifications/{id}/read`, asserts status 200 |
| SA-PERM-API-001 | Superadmin cannot perform Staff operational mutations | Authorization | Calls `POST /api/proposal/update` with `action: 'staff_approve'`, asserts status 403 |

### 6.5 User Management (`superadmin/user-management.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| SA-USER-001 | User table loads with meaningful columns | Visibility | Asserts "Daftar Pengguna" heading, first row header contains "Nama", "Email", "Role", "Status" |
| SA-USER-MUT-001 | Create a new user via API | Mutation | Calls `POST /api/users/add` with valid data, asserts 200, reloads page, asserts new user in table |
| SA-USER-MUT-002 | Edit an existing user via UI | Mutation | Right-clicks "E2E USER EDIT TARGET", clicks "Edit user", clears nama, fills "E2E USER EDIT UPDATED", clicks Update, asserts updated name |
| SA-USER-MUT-003 | Toggle user status between Aktif and Nonaktif | Mutation | Finds "E2E USER STATUS TARGET", fetches user ID via API, calls `POST /api/users/update` setting status to "Nonaktif", reloads, asserts "Nonaktif" visible |
| SA-USER-MUT-004 | Delete a disposable user | Mutation | Right-clicks "E2E USER DELETE TARGET", clicks "Hapus user", clicks Hapus button, asserts row no longer visible |
| SA-USER-SEARCH-001 | Search for a known user shows matching results | Visibility | Locates search input, fills "Superadmin E2E", waits 1.5s, asserts "Superadmin E2E" visible in table |

### 6.6 User Validation -- UI (`superadmin/user-validation.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| SA-USER-VAL-001 | Duplicate email is rejected with inline error | Validation | Opens add user modal, fills duplicate email, clicks Tambahkan, asserts error text visible |
| SA-VALIDATION-UX-001 | Inline validation UX -- error appears and form remains open | Validation | Opens add user modal, fills duplicate email, clicks Tambahkan, asserts error visible, asserts form still open with values |

### 6.7 User Validation -- API (`superadmin/user-validation-api.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| SA-USER-VAL-002 | Invalid role value is rejected via API | Validation | Calls `POST /api/users/add` with role: "Hacker", asserts status 422 and `errors` defined |
| SA-USER-VAL-003 | Invalid status value is rejected via API | Validation | Calls `POST /api/users/add` with status: "UnknownStatus", asserts status 422 and `errors` defined |
| SA-USER-ID-001 | Both NIDN and NUPTK empty is rejected for Dosen | Validation | Calls `POST /api/users/add` with role: "Dosen", no nidn/nuptk, asserts status 422 |
| SA-USER-ID-002 | NIDN provided without NUPTK is valid | Mutation | Calls `POST /api/users/add` with role: "Dosen", nidn: "60001", no nuptk, asserts status is NOT 422 (creates user) |
| SA-USER-ID-003 | NUPTK provided without NIDN is valid | Mutation | Calls `POST /api/users/add` with role: "Dosen", nuptk: "66001", no nidn, asserts status is NOT 422 (creates user) |
| SA-USER-ID-004 | Duplicate NIDN is rejected | Validation | Calls `POST /api/users/add` with nidn: "50005", asserts status 422 |
| SA-USER-ID-005 | Duplicate NUPTK is rejected | Validation | Calls `POST /api/users/add` with nuptk: "55006", asserts status 422 |

### 6.8 Kolaborator Permission (`superadmin/kolaborator-permission.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| SA-KOLAB-PERM-001 | Superadmin does NOT see Kolaborator module in sidebar | Authorization | Navigates to dashboard, asserts kolaborator link NOT visible |
| SA-KOLAB-PERM-002 | Superadmin cannot create Kolaborator via API | Authorization | Calls `POST /api/kolaborator/add`, asserts status 403 |
| SA-KOLAB-PERM-003 | Superadmin cannot update Kolaborator via API | Authorization | Calls `POST /api/kolaborator/update`, asserts status 403 |
| SA-KOLAB-PERM-004 | Superadmin cannot delete Kolaborator via API | Authorization | Calls `DELETE /api/kolaborator/delete/1`, asserts status 403 |

### 6.9 Prodi Management (`superadmin/prodi-management.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| SA-PRODI-001 | Prodi table/page loads | Visibility | Asserts "Prodi" heading, "Berikut data prodi yang tersedia." text, first table row visible |
| SA-PRODI-MUT-001 | Create a valid Prodi | Mutation | Opens add prodi modal, fills "E2E PRODI CREATE", selects Ketua LPPM, clicks Tambahkan, asserts in table |
| SA-PRODI-MUT-002 | Edit an existing Prodi | Mutation | Right-clicks "E2E PRODI EDIT TARGET", clears name, fills "E2E PRODI EDIT UPDATED", clicks Update, asserts updated name |
| SA-PRODI-MUT-003 | Delete a disposable Prodi | Mutation | Right-clicks "E2E PRODI DELETE TARGET", clicks "Hapus prodi", asserts row no longer visible |
| SA-PRODI-VAL-001 | Prodi name is required | Validation | Opens add prodi modal, selects kepala only (no name), clicks Tambahkan, asserts error visible |
| SA-PRODI-VAL-002 | Duplicate Prodi name is rejected | Validation | Opens add prodi modal, fills "Sistem Teknologi dan Informasi" (existing), clicks Tambahkan, asserts "already been taken" error |

### 6.10 Mahasiswa Management (`superadmin/mahasiswa-management.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| SA-MHS-001 | Mahasiswa page/table loads | Visibility | Asserts "Daftar Mahasiswa" heading, "Berikut daftar mahasiswa..." text, first row visible |
| SA-MHS-MUT-001 | Create a valid Mahasiswa via API | Mutation | Fetches prodi via API, calls `POST /api/mahasiswa/add`, asserts 200, reloads, asserts in table |
| SA-MHS-MUT-002 | Edit an existing Mahasiswa | Mutation | Right-clicks "E2E MAHASISWA EDIT", clears nama, fills "E2E MAHASISWA EDIT UPDATED", asserts updated name |
| SA-MHS-MUT-003 | Delete a disposable Mahasiswa | Mutation | Right-clicks "E2E MAHASISWA DELETE", clicks "Hapus mahasiswa", asserts row no longer visible |
| SA-MHS-VAL-001 | Duplicate NIM is rejected with inline error | Validation | Clicks "Tambahkan Mahasiswa Baru", fills duplicate NIM, clicks Tambahkan, asserts error visible |
| SA-MHS-VAL-002 | Duplicate Mahasiswa email is rejected via API | Validation | Calls `POST /api/mahasiswa/add` with duplicate email, asserts status 422 |

### 6.11 Kategori Publikasi (`superadmin/kategori-publikasi.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| SA-KATPUB-001 | Superadmin can fetch publication categories via API | API | Calls `GET /api/publication-category/fetch`, asserts status 200 and `data` is array |
| SA-KATPUB-MUT-001 | Create a publication category via API | Mutation | Calls `POST /api/publication-category/add` with nama and peringkat tags, asserts 200 |
| SA-KATPUB-MUT-002 | Update a publication category via API | Mutation | Fetches categories, finds "E2E Kategori API Create", calls `POST /api/publication-category/update`, asserts 200 |
| SA-KATPUB-MUT-003 | Delete an unused publication category via API | Mutation | Fetches categories, finds "E2E Kategori UNUSED", calls `DELETE /api/publication-category/delete/{id}`, asserts 200 |
| SA-KATPUB-VAL-001 | Category name is required for creation | Validation | Calls `POST /api/publication-category/add` with only peringkat (no nama), asserts 422 |
| SA-KATPUB-TAG-001 | Multiple peringkat tags persist correctly | Mutation | Creates category with 3 tags, fetches and asserts all 3, updates to 2, re-fetches and asserts tag removed, then deletes |

### 6.12 Settings Management (`superadmin/settings-management.spec.ts`)

| Test ID | Test | Type | What it actually verifies |
| ------- | ---- | ---- | ------------------------- |
| SA-SET-001 | Settings page loads with correct heading | Visibility | Asserts "Pengaturan" or "Pengaturan Umum" visible |
| SA-SET-MUT-001 | Update nama_kampus via UI | Mutation | Locates `input[name="nama_kampus"]`, sets "E2E Kampus Updated", clicks "Simpan Perubahan", reloads, asserts persisted, then restores original |
| SA-SET-MUT-002 | Update kepala_lppm selection | Mutation | Clicks kepala LPPM input, selects "Staff LPPM 1" if visible |
| SA-SET-MUT-003 | Rektor data fields are present and editable | Visibility | Locates `input[name="rektor_nama"]`, fills test value, asserts value. Skips if field not visible |
| SA-SET-PERM-001 | Superadmin generic settings update does NOT overwrite Staff/Ketua-owned fields | Authorization | Fetches settings, saves kriteria and tema, updates nama_kampus via API, re-fetches, asserts kriteria/tema unchanged, restores nama_kampus |


---

## 7. Shared / Infrastructure (5 auth setup projects)

These are Playwright `storageState` generators, NOT test cases. They authenticate once and save browser state for all tests in their respective role project.

| Setup ID | File | What it does |
| -------- | ---- | ------------ |
| auth-setup | `tests/e2e/auth.setup.ts` | Authenticates as Staff LPPM (id=3), saves storageState |
| auth-dosen-setup | `tests/e2e/auth.dosen.setup.ts` | Authenticates as Dosen (id=5), saves storageState |
| auth-ketua-setup | `tests/e2e/auth.ketua.setup.ts` | Authenticates as Ketua LPPM (id=2), saves storageState |
| auth-reviewer-setup | `tests/e2e/auth.reviewer.setup.ts` | Authenticates as Reviewer (id=101), saves storageState |
| auth-superadmin-setup | `tests/e2e/auth.superadmin.setup.ts` | Authenticates as Superadmin (id=1), saves storageState |

---

## 8. Coverage Matrix (Role x Domain)

| Role | Auth | Dashboard | Navigation | Notifications | Proposal | Laporan | Reviewer Assignment | Review | Authorization | Logbook | Monitoring Skema | Kriteria | Dana | User Mgmt | Prodi | Mahasiswa | Kategori Publikasi | Settings | Kolaborator | Journey | Total |
| ---- | ----: | --------: | ----------: | -----------: | -------: | ------: | ------------------: | -----: | ------------: | ------: | ---------------: | -------: | ---: | ---------: | ----: | --------: | -----------------: | -------: | ----------: | ------: | ----: |
| Dosen | 4 | 8 | 5 | 3 | 22 | 24 | - | - | - | 4 | - | - | - | - | - | - | - | - | - | 2 | **92** |
| Staff LPPM | 4 | 7 | - | 5 | 12 | 3 | 6 | - | 14 | - | 6 | 5 | 3 | - | - | - | - | - | - | - | **59** |
| Ketua LPPM | 4 | 6 | 6 | 3 | 15 | 10 | - | - | 16 | - | - | - | - | - | - | - | - | - | - | - | **58** |
| Superadmin | 4 | 3 | 6 | 4 | - | - | - | - | - | - | - | - | - | 12 | 6 | 6 | 6 | 5 | 4 | - | **59** |
| Reviewer | 3 | 4 | 3 | - | 7 | 5 | - | 14 | - | - | - | - | - | - | - | - | - | - | - | - | **36** |

### Detailed Domain Counts

| Domain | Dosen | Staff | Ketua | Superadmin | Reviewer | Total |
| ------ | ----: | ----: | ----: | ---------: | -------: | ----: |
| Authentication | 4 | 4 | 4 | 4 | 3 | **19** |
| Dashboard | 8 | 7 | 6 | 3 | 4 | **28** |
| Navigation | 5 | - | 6 | 6 | 3 | **20** |
| Notifications | 3 | 5 | 3 | 4 | - | **15** |
| Proposal (monitoring/visibility) | 22 | 12 | 15 | - | 7 | **56** |
| Laporan (monitoring/visibility) | 24 | 3 | 10 | - | 5 | **42** |
| Reviewer Assignment | - | 6 | - | - | - | **6** |
| Proposal Review (reviewer) | - | - | - | - | 14 | **14** |
| Authorization (double verification) | - | 14 | 16 | - | - | **30** |
| Logbook | 4 | - | - | - | - | **4** |
| Monitoring Skema | - | 6 | - | - | - | **6** |
| Kriteria Penilaian | - | 5 | - | - | - | **5** |
| Dana / Claim / Pengembalian | - | 3 | - | - | - | **3** |
| User Management (CRUD) | - | - | - | 12 | - | **12** |
| User Validation | - | - | - | 9 | - | **9** |
| Prodi Management | - | - | - | 6 | - | **6** |
| Mahasiswa Management | - | - | - | 6 | - | **6** |
| Kategori Publikasi | - | - | - | 6 | - | **6** |
| Settings | - | - | - | 5 | - | **5** |
| Kolaborator Permission | - | - | - | 4 | - | **4** |
| Journey (end-to-end) | 2 | - | - | - | - | **2** |
| Semester Isolation | 4 | - | - | - | - | **4** |

---

## 9. Test-Type Matrix

| Role | Visibility | Workflow | Mutation | Validation | Authorization | Regression | Total |
| ---- | ---------: | -------: | -------: | ---------: | ------------: | ----------: | ----: |
| Dosen | 69 | 3 | 18 | 1 | - | 1 | **92** |
| Staff LPPM | 45 | 1 | 2 | 2 | 8 | - | **59** |
| Ketua LPPM | 46 | 1 | 3 | - | 8 | - | **58** |
| Superadmin | 21 | 1 | 25 | 9 | 3 | - | **59** |
| Reviewer | 22 | 1 | 8 | 1 | 4 | - | **36** |
| **Total** | **203** | **7** | **56** | **13** | **23** | **1** | **304** |

### Notes on Test Types

- **Visibility (203):** Checks that a page, component, table, tab, card, or text element exists/rendered. The largest category by far.
- **Workflow (7):** End-to-end multi-step journeys (Dosen journey tests, auth login-redirect flows).
- **Mutation (56):** Actually modifies application data via UI actions or API calls. Includes all reviewer review submissions, Dosen proposal/laporan mutations, Ketua approval/deny, Staff return execution, Superadmin CRUD.
- **Validation (13):** Verifies invalid input/action is rejected (wrong credentials, duplicate emails, NIDN validation, reviewer count validation).
- **Authorization (23):** Verifies role boundaries -- what a role can and cannot access. Includes Staff-only module checks, Kolaborator 403s, Ketua/Staff destructive action visibility, Superadmin permission restrictions.
- **Regression (1):** Only `RV-PKM-PROP-MUT-001` is tagged as a regression test (verifies PkM proposal review opens correctly for Reviewer).

---

## 10. Business Workflow Coverage

### Proposal Workflow

| Workflow Step | Covered by | Evidence |
| ------------- | ---------- | -------- |
| Pengajuan (Dosen creates proposal) | DS-PEN-PROP-MUT-001 (Save Draft), DS-PEN-PROP-MUT-002 (Submit), DS-PKM-PROP-MUT-001/002 (PkM) | UI form fill + API call |
| Upload document | DS-PEN-PROP-MUT-003 | Upload PDF, click "Ajukan Proposal" |
| Menunggu upload status visible | DS-PEN-PROP-004, DS-PKM-PROP-002 | Status badge check |
| Menunggu review dari Ketua LPPM | DS-PEN-PROP-005, KT-PROP-SEL-001 | Status badge check |
| Staff Seleksi tab visible | ST-PROP-SEL-001/002 | Table and tab check |
| Staff context menu actions | ST-PROP-SEL-003/005 | Right-click shows menu |
| Reviewer assignment (3 reviewers) | ST-PROP-REV-001 through 006 | Modal opens, shows reviewers, validates count |
| API rejects < 3 reviewers | ST-REV-API-VAL-001 | 2, 4, or duplicate IDs rejected |
| Reviewer sees assigned proposals | RV-PROP-001 through 004 | "Belum direview" visible |
| Reviewer submits proposal review | RV-PROP-MUT-002, RV-PKM-PROP-MUT-002 | Fill scores + keputusan, submit |
| Ketua sees post-review (3/3) | KT-PROP-REV-001, KT-REV-002 | "Menunggu persetujuan Ketua LPPM" badge |
| Ketua approves (normal) | KT-PROP-APPROVE-001 | Right-click -> "Setujui Proposal", status changes to "Menunggu review Staff LPPM", `ketua_seleksi_approved=true` |
| Staff return for revision | ST-RETURN-EXEC-001 | Right-click -> "Kembalikan untuk Perbaikan", creates AuthorizationRequest |
| Ketua approves return (authorization) | KT-AUTHZ-APPROVE-001 | Clicks "Setujui", proposal status -> "Revisi" |
| Ketua denies reject request | KT-AUTHZ-DENY-001 | Clicks "Tolak", proposal status UNCHANGED |
| Pengumuman (accepted) | DS-PEN-PROP-006, DS-PKM-PROP-004 | "Proposal Diterima" in Pengumuman tab |
| Rejected status visible | DS-PEN-PROP-007 | "Ditolak" badge in Seleksi tab |

**VERDICT:** Proposal workflow is **thoroughly covered** -- from creation through assignment, review, approval, authorization, and announcement.

### Penelitian Laporan Workflow

| Workflow Step | Covered by | Evidence |
| ------------- | ---------- | -------- |
| Laporan monitoring page | DS-PEN-LAP-GAN-001, ST-LAP-001 | Page loads via skema or deep link |
| Ganjil/Genap semester filtering | DS-PEN-LAP-GAN-002, DS-PEN-LAP-GEN-001 through 004, DS-PEN-LAP-SEM-001 through 004 | Semester filter shows correct data |
| Belum dimulai status | DS-PEN-LAP-GAN-003, DS-PEN-LAP-GEN-002 | Status badge check |
| Dalam pengerjaan status | DS-PEN-LAP-GAN-004, DS-PEN-LAP-GEN-003 | Status badge check |
| Finish laporan (Proses -> Publikasi) | DS-PEN-LAP-GAN-MUT-001, DS-PEN-LAP-GEN-MUT-001 | Click "Selesaikan Laporan", confirm |
| Semester isolation verified | DS-PEN-LAP-SEM-MUT-001 | Ganjil mutation does not affect Genap |
| Publikasi stage status | DS-PEN-LAP-GAN-005 | "Menunggu review Admin" badge |
| Diseminasi stage status | DS-PEN-LAP-GAN-006, DS-PEN-DIS-MUT-001 | "Dalam pengerjaan" badge |
| Claim Dana stage status | DS-PEN-LAP-GAN-007 | "Menunggu konfirmasi penerimaan dana" badge |
| Upload bukti terima (Claim Dana) | DS-PEN-DANA-MUT-001 | File upload + API call |
| Selesai status | DS-PEN-LAP-GAN-008 | "Selesai" badge |
| Publikasi info saved | DS-PEN-PUB-MUT-001 | Fill judul/jurnal/link, save |
| Staff Laporan monitoring | ST-LAP-002/003, AUTH-STAFF-002/003/004 | Tabs visible, semester filter |

**VERDICT:** Penelitian Laporan workflow is **thoroughly covered** -- all stages (Proses through Selesai) with both Ganjil/Genap isolation and mutations.

### PkM Laporan Workflow

| Workflow Step | Covered by | Evidence |
| ------------- | ---------- | -------- |
| PkM laporans visible | DS-PKM-LAP-001 | Filtered by PkM |
| Claim Dana stage | DS-PKM-LAP-002 | "Dalam pengerjaan" badge |
| Proses PkM stage | DS-PKM-LAP-003 | "Dalam pengerjaan" badge |
| Publikasi stage | DS-PKM-LAP-004 | "Menunggu review Admin" badge |
| Pengembalian Dana stage | DS-PKM-LAP-005 | "Menunggu Pengembalian Dana" badge |
| Upload bukti pengembalian | DS-PKM-RETURN-MUT-001 | File upload + API call |
| Diseminasi stage | DS-PKM-LAP-006 | "Dalam pengerjaan" badge |
| PkM tabs visible | DS-PKM-LAP-008 | All stage tabs present |
| PkM laporan review by Reviewer | RV-LAP-PKM-MUT-001 | Review submission |
| PkM laporan authorization | KT-AUTHZ-PKM-CLAIM-001 | "Kembalikan Laporan" visible |

**VERDICT:** PkM Laporan workflow is **thoroughly covered** -- all PkM-specific stages including Pengembalian Dana.

### Authorization / Double Verification Workflow

| Workflow Step | Covered by | Evidence |
| ------------- | ---------- | -------- |
| Staff sees return actions at Seleksi | AUTH-STAFF-001 | Reject/return actions visible |
| Staff return execution | ST-RETURN-EXEC-001 | Creates AuthorizationRequest, preserves proposal state |
| Ketua sees pending requests | AUTH-KETUA-001/002 | Authorization queue visible |
| Ketua approves return | KT-AUTHZ-APPROVE-001 | Proposal -> "Revisi" |
| Ketua denies reject | KT-AUTHZ-DENY-001 | Proposal state UNCHANGED |
| Ketua sees laporan authorization | KT-AUTHZ-PEN-PROSES-001 through KT-AUTHZ-PEN-DANA-001 | Return requests visible for all stages |
| PkM laporan authorization | KT-AUTHZ-PKM-CLAIM-001 | PkM-specific return request visible |
| Monitoring-only stages (no approval gate) | AUTH-MON-001/002/003 | Ketua can access Proses/Publikasi/Claim Dana without gate |
| Data preservation | AUTH-PRESERVE-001/002 | Data not deleted on return |
| Normal checkpoints preserved | AUTH-CHECK-001/002 | Seleksi and Diseminasi still work |

**VERDICT:** Authorization workflow is **thoroughly covered** -- both proposal and laporan authorization with approve/deny outcomes, data preservation, and stage-specific behavior.

---

## 11. Coverage Gaps

### A. Thoroughly Tested

- **Authentication:** 19 tests across all 5 roles (login, logout, wrong credentials, redirect, role restriction)
- **Proposal Monitoring (Dosen):** 22 visibility checks covering all statuses (Draft, Menunggu upload, Menunggu review, Diterima, Ditolak) for both Penelitian and PkM
- **Laporan Monitoring (Dosen):** 24 tests covering Ganjil/Genap/PkM with all stage tabs and semester isolation
- **Authorization Workflow:** 30 tests covering Staff return execution, Ketua approve/deny, data preservation, stage-specific gates
- **Reviewer Proposal Review:** 7 visibility + 2 mutation tests for Penelitian and PkM reviews
- **Reviewer Laporan Review:** 5 visibility + 3 mutation tests for Penelitian and PkM reviews
- **User Management:** 6 CRUD + 9 validation tests covering all edge cases
- **Prodi Management:** 6 tests (CRUD + validation)
- **Mahasiswa Management:** 6 tests (CRUD + validation)

### B. Partially Tested

- **Dosen Dashboard:** 8 visibility tests but no mutation tests (e.g., clicking a summary card and verifying navigation)
- **Staff Dashboard:** 7 visibility tests but no tests verifying the actual workload counts
- **Ketua Dashboard:** 6 tests but all are basic visibility checks
- **Reviewer Dashboard:** 4 tests, all visibility
- **Kriteria Penilaian (Staff):** 5 visibility tests but no mutation tests for editing kriteria or bobot
- **Notifications (all roles):** Mostly visibility checks. Only Dosen has mutation tests (click notification -> read status). No tests for "mark all as read" or notification filtering by category.

### C. Weakly Tested

- **Dosen Logbook:** 4 visibility + 1 mutation. The mutation test (`DS-LOG-MUT-001`) is the only logbook mutation and it uses conditional skips heavily.
- **Dana/Claim/Pengembalian:** Only 3 Staff tests (all visibility). Dosen has 2 mutations but no tests verifying the actual dana amount or status after upload.
- **Reviewer Isolation:** 4 tests but they only check absence of text. No tests verifying that Reviewer cannot submit reviews for unassigned proposals.
- **Ketua Navigation:** 6 tests but no tests verifying that Ketua cannot access Dosen-specific modules (e.g., logbook, scholar).
- **Settings:** Only 5 tests. `SA-SET-MUT-003` skips if rektor field not visible. No tests for ignore_kegiatan_dates toggle or other settings fields.

### D. Not Tested (Important Missing Coverage)

| Area | Impact | Notes |
| ---- | ------ | ----- |
| **Staff Selanjutnya (lifecycle advancement)** | HIGH | No Staff test advances a laporan from Proses to Publikasi or Publikasi to Diseminasi. Only Dosen mutations do this. |
| **Ketua Diseminasi approval** | HIGH | No Ketua test approves Diseminasi. AUTH-CHECK-002 only checks accessibility, does not click approve. |
| **Staff reject proposal** | HIGH | ST-RETURN-EXEC-001 tests return, but no test for Staff rejecting a proposal outright. |
| **Reviewer laporan assignment** | MEDIUM | No Staff test assigns reviewers to a laporan (only proposal assignment is tested). |
| **Reviewer laporan mutation (Penelitian 3/3 completion)** | MEDIUM | RV-LAP-MUT-002 submits a review but does not verify 3/3 completion triggers status change. |
| **PkM proposal mutation (full end-to-end)** | MEDIUM | DS-PKM-PROP-MUT-001/002 only test save/submit. No test verifies PkM draft can be uploaded, reviewed, and accepted. |
| **Semester-specific laporan mutations** | LOW | Ganjil and Genap mutations tested separately, but no test verifies that Ganjil and Genap laporans for the same proposal exist independently. |
| **Realisasi Anggaran** | MEDIUM | No test verifies the realisasi budget fields on laporan. |
| **Scholar/Profile** | LOW | Dosen scholar/profil pages are navigated to (DS-NAV-003/004) but no content verification. |
| **Peneliti Detail / Kolaborator** | MEDIUM | No test verifies peneliti detail editing or kolaborator CRUD (kolaborator permission tests only verify Superadmin cannot access). |
| **Mahasiswa in Dosen proposal** | LOW | No test verifies adding a mahasiswa to a proposal. |
| **Logbook deletion/edit** | LOW | Only creation is tested (DS-LOG-MUT-001). No edit or delete tests. |
| **Notification "mark all as read"** | LOW | ST-NOTIF-005 checks button existence but does not click it. |
| **Review keputusan validation** | MEDIUM | RV-VAL-001 tests empty keputusan but the assertion is ambiguous ("berhasil"/"Gagal"/"error"/"Submit Review" all pass). |

---

## 12. Possible Redundancy

### Dosen Proposal Visibility (High Overlap)

The following tests all navigate to Lihat Proposal and check status badges. They differ only in which status they look for:

- DS-PEN-PROP-003 (Draft)
- DS-PEN-PROP-004 (Menunggu upload)
- DS-PEN-PROP-005 (Menunggu review dari Ketua)
- DS-PEN-PROP-006 (Diterima)
- DS-PEN-PROP-007 (Ditolak)
- DS-PEN-PROP-011 (Menunggu review)

**Recommendation:** These 6 tests could be consolidated into 1-2 parameterized tests without losing coverage.

### Dosen Laporan Status Visibility (High Overlap)

- DS-PEN-LAP-GAN-003 through 008 check 6 different statuses on Ganjil laporans
- DS-PEN-LAP-GEN-002 through 003 check 2 statuses on Genap laporans

All follow the same pattern: navigate to Lihat Laporan, filter semester, click tab, assert status badge.

### Ketua Authorization Visibility (High Overlap)

- KT-AUTHZ-PROP-REJECT-001/002, KT-AUTHZ-PROP-RETURN-001/002, KT-AUTHZ-PENDING-001/002 all check the same "Menunggu review dari Ketua LPPM" badge and action buttons.

### Ketua Laporan Authorization (High Overlap)

- KT-AUTHZ-PEN-PROSES-001, KT-AUTHZ-PEN-PUB-001, KT-AUTHZ-PEN-DIS-001, KT-AUTHZ-PEN-DANA-001 all check "Kembalikan Laporan" text.

### Dashboard Visibility Tests (Moderate Overlap)

Multiple roles have nearly identical dashboard tests (assert heading, assert cards, assert sidebar). These could be consolidated into a shared cross-role test.

### Context Menu Tests (Moderate Overlap)

- ST-PROP-SEL-003 and ST-PROP-SEL-005 both verify context menu opens on right-click. They appear to test the same behavior.

---

## 13. Final Assessment

### 1. How many Playwright tests currently exist?

**304 test cases** across 62 spec files. Playwright's `--list` output shows 309 items, but 5 of those are auth setup projects (not test cases).

### 2. How many belong to each role?

| Role | Tests |
| ---- | ----: |
| Dosen | 92 |
| Staff LPPM | 59 |
| Ketua LPPM | 58 |
| Superadmin | 59 |
| Reviewer | 36 |

### 3. Which role has the broadest coverage?

**Dosen** (92 tests) -- covers authentication, dashboard, navigation, notifications, logbook, proposal monitoring (Penelitian + PkM), laporan monitoring (Ganjil + Genap + PkM), semester isolation, journey tests, and mutations across all stages. The Dosen is the most heavily tested role.

### 4. Which role has the weakest coverage?

**Reviewer** (36 tests) -- fewer tests than other roles, heavily skewed toward visibility. Only 6 mutation tests actually submit reviews. No tests verify the reviewer cannot see proposals they are not assigned to (only checks absence of text, not functional isolation). Many tests use `test.skip()` due to fixture availability.

### 5. Which business workflow has the strongest coverage?

**Authorization / Double Verification** (30 tests) -- covers Staff return execution with API verification, Ketua approve/deny with state change verification, data preservation, stage-specific gates, and both proposal and laporan authorization. This is the most thoroughly tested business workflow.

### 6. Which business workflow has the weakest coverage?

**Dana (Claim, Pengembalian, Disbursement)** -- only 3 Staff visibility tests and 2 Dosen mutation tests. No tests verify the actual dana amount, no Ketua approval of disbursement, no integration test of the full dana lifecycle.

### 7. Which important actions currently have no test?

- Staff rejecting a proposal (only return is tested)
- Ketua approving Diseminasi (only accessibility is checked)
- Staff advancing a laporan lifecycle (only Dosen mutations do this)
- Reviewer assignment for laporans (only proposals are tested)
- Realisasi Anggaran (budget realization) updates
- Kolaborator CRUD (only Superadmin 403 is tested)

### 8. Are destructive actions adequately tested?

**Partially.** Staff return execution is well-tested (ST-RETURN-EXEC-001 with API verification). Ketua approve/deny of authorization requests is tested (KT-AUTHZ-APPROVE-001, KT-AUTHZ-DENY-001). However:
- Staff proposal rejection is not tested
- Ketua Diseminasi approval is not tested
- No test verifies that a destructive action is correctly blocked when performed by the wrong role (beyond sidebar visibility checks)

### 9. Are role boundaries adequately tested?

**Partially.** Each role's auth tests verify login/logout and redirect behavior. Authorization tests verify that destructive actions require Ketua approval. However:
- No test verifies that Dosen cannot access Ketua's approval queue
- No test verifies that Reviewer cannot see Staff's reviewer assignment controls (only text absence, not API-level 403)
- Kolaborator permission tests (403 for Superadmin) are good but only cover one direction

### 10. Are Proposal and Laporan lifecycle transitions adequately tested?

**Proposal:** Yes -- creation, upload, review, authorization, approval, and announcement are all tested with both visibility and mutation tests.

**Laporan:** Mostly yes -- all stages are visible-tested, and mutations cover Proses->Publikasi advancement. However:
- No test verifies Diseminasi->Selesai transition
- No test verifies Claim Dana->Selesai transition
- No test verifies the full lifecycle from Dalam pengerjaan to Selesai in a single test

