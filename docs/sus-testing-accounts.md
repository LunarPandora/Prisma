# SUS / Exploratory Testing Accounts

**Sistem Manajemen Penelitian dan PkM — PRISMA**

Dedicated accounts and dataset for System Usability Scale (SUS) evaluation and manual exploratory testing. This is separate from the E2E regression fixtures and thesis screenshot fixtures.

---

## Quick Start

```bash
# 1. Reset database with SUS fixtures
cd prisma-server
php artisan migrate:fresh --env=testing --force --seeder="SUSDemoSeeder"

# 2. Start servers
cd prisma && npm run dev
cd prisma-server && APP_ENV=testing php artisan serve --port=8000

# 3. Login with any account below
```

---

## Primary SUS Accounts

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| **Superadmin** | `sustest.superadmin@itbss.ac.id` | `password` | Primary SUS test account for Superadmin role |
| **Ketua LPPM** | `sustest.ketua@itbss.ac.id` | `password` | Primary SUS test account for Ketua LPPM role |
| **Staff LPPM** | `sustest.staff@itbss.ac.id` | `password` | Primary SUS test account for Staff LPPM role |
| **Dosen** | `sustest.dosen@itbss.ac.id` | `password` | Primary SUS test account for Dosen role |
| **Reviewer** | `sustest.reviewer@itbss.ac.id` | `password` | Primary SUS test account for Reviewer role |

---

## All User Accounts

### Superadmin (1)

| Nama | Email | Role |
|------|-------|------|
| Superadmin Utama | sustest.superadmin@itbss.ac.id | Superadmin |

### Ketua LPPM (3)

| Nama | Email | Role |
|------|-------|------|
| Dr. Siti Nurhaliza, M.Kom. | sustest.ketua@itbss.ac.id | Ketua LPPM |
| Prof. Bambang Sugiharto, M.T. | ketua.lppm2@itbss.ac.id | Ketua LPPM |
| Dr. Rina Wulandari, S.Pd., M.Pd. | ketua.lppm3@itbss.ac.id | Ketua LPPM |

### Staff LPPM (4)

| Nama | Email | Role |
|------|-------|------|
| Ahmad Fauzi, S.Kom. | sustest.staff@itbss.ac.id | Staff LPPM |
| Dewi Kartika, S.E. | staff.lppm2@itbss.ac.id | Staff LPPM |
| Hendra Wijaya, S.T. | staff.lppm3@itbss.ac.id | Staff LPPM |
| Maya Putri, S.Pd. | staff.lppm4@itbss.ac.id | Staff LPPM |

### Dosen (15)

| Nama | Email | NIDN | Prodi |
|------|-------|------|-------|
| Dr. Andi Pratama, M.Kom. | sustest.dosen@itbss.ac.id | 20001 | Sistem Teknologi dan Informasi |
| Siti Rahmawati, S.T., M.T. | dosen.02@itbss.ac.id | 20002 | Bisnis Digital |
| Budi Santoso, S.Kom., M.Kom. | dosen.03@itbss.ac.id | 20003 | Kewirausahaan |
| Ratna Dewi, S.Pd., M.Pd. | dosen.04@itbss.ac.id | 20004 | Informatika |
| Eko Prasetyo, S.E., M.E. | dosen.05@itbss.ac.id | 20005 | Manajemen |
| Lestari Wulandari, S.Ak., M.Ak. | dosen.06@itbss.ac.id | 20006 | Akuntansi |
| Agus Setiawan, S.T., M.T. | dosen.07@itbss.ac.id | 20007 | Teknik Elektro |
| Dian Kusuma, S.Ds., M.Ds. | dosen.08@itbss.ac.id | 20008 | Desain Komunikasi Visual |
| Hari Kurniawan, S.Kom., M.Kom. | dosen.09@itbss.ac.id | 20009 | Sistem Teknologi dan Informasi |
| Nina Susanti, S.E., M.M. | dosen.10@itbss.ac.id | 20010 | Bisnis Digital |
| Rudi Hermawan, S.T., M.T. | dosen.11@itbss.ac.id | 20011 | Kewirausahaan |
| Wati Susilawati, S.Pd., M.Pd. | dosen.12@itbss.ac.id | 20012 | Informatika |
| Joko Prayitno, S.Kom., M.Kom. | dosen.13@itbss.ac.id | 20013 | Manajemen |
| Sri Mulyani, S.Ak., M.Ak. | dosen.14@itbss.ac.id | 20014 | Akuntansi |
| Dodi Gunawan, S.T., M.T. | dosen.15@itbss.ac.id | 20015 | Teknik Elektro |

### Reviewers (10)

| Nama | Email | NIDN | Prodi |
|------|-------|------|-------|
| Prof. Dr. Ahmad Dahlan, M.T. | sustest.reviewer@itbss.ac.id | 30001 | Sistem Teknologi dan Informasi |
| Dr. Fatimah Azzahra, M.Kom. | reviewer.02@itbss.ac.id | 30002 | Bisnis Digital |
| Dr. Hendro Wibowo, M.T. | reviewer.03@itbss.ac.id | 30003 | Kewirausahaan |
| Dr. Kartini Sari, M.Pd. | reviewer.04@itbss.ac.id | 30004 | Informatika |
| Dr. Lukman Hakim, S.E., M.E. | reviewer.05@itbss.ac.id | 30005 | Manajemen |
| Dr. Maya Sari, S.Ak., M.Ak. | reviewer.06@itbss.ac.id | 30006 | Akuntansi |
| Dr. Nugroho Adi, S.T., M.T. | reviewer.07@itbss.ac.id | 30007 | Teknik Elektro |
| Dr. Ophelia Chen, M.Ds. | reviewer.08@itbss.ac.id | 30008 | Desain Komunikasi Visual |
| Dr. Prabowo Subianto, S.Kom., M.Kom. | reviewer.09@itbss.ac.id | 30009 | Sistem Teknologi dan Informasi |
| Dr. Ratna Sari, M.T. | reviewer.10@itbss.ac.id | 30010 | Bisnis Digital |

---

## Dataset Summary

| Entity | Count |
|--------|------:|
| Prodi | 8 |
| Dosen | 15 |
| Staff LPPM | 4 |
| Ketua LPPM | 3 |
| Reviewers | 10 |
| Superadmin | 1 |
| Proposals | 38 |
| Penelitian Laporan | 16 |
| PkM Laporan | 12 |
| Reviewer Assignments | ~21 (3 per review-state proposal) |
| Reviews | ~6 (for 3/3 complete proposals) |
| Notifications | 12 |
| Authorization Requests | 3 (1 pending, 1 pending reject, 1 approved) |
| Logbook Entries | ~30 (2-4 per Dalam pengerjaan laporan) |
| Proposal Members | 38 |
| Laporan Members | 28 |
| Mahasiswa | 5 |

---

## Workflow Coverage

### Proposal States Covered

| Status | Count | Notes |
|--------|------:|-------|
| Draft | 3 | Ready for editing |
| Menunggu proposal untuk diupload | 2 | Awaiting document upload |
| Menunggu review dari Ketua LPPM | 3 | Ketua can approve/deny |
| Menunggu review Staff LPPM | 3 | Staff review stage |
| Menunggu penugasan reviewer | 3 | Awaiting 3 reviewer assignments |
| Menunggu review | 3 | 0/3 and 2/3 reviews |
| Menunggu persetujuan Ketua LPPM | 2 | 3/3 reviews complete |
| Proposal Diterima | 14 | 8 Penelitian + 6 PkM |
| Ditolak | 2 | Rejected proposals |
| Ditarik | 1 | Withdrawn proposal |
| Revisi | 2 | Returned for revision |

### Laporan Penelitian States Covered

| Status | Semester | Notes |
|--------|----------|-------|
| Dalam pengerjaan | Ganjil/Genap | Active work |
| Menunggu review Admin | Ganjil/Genap | Awaiting admin review |
| Menunggu review Staff LPPM | Ganjil/Genap | Staff review |
| Menunggu review | Ganjil/Genap | Under review |
| Menunggu hasil dari Reviewers | Ganjil/Genap | Awaiting reviewer results |
| Menunggu keputusan Ketua | Ganjil/Genap | Ketua decision pending |
| Selesai | Ganjil/Genap | Completed |

### Laporan PkM States Covered

| Status | Notes |
|--------|-------|
| Dalam pengerjaan | Active work |
| Menunggu konfirmasi penerimaan dana | Funding confirmation |
| Menunggu konfirmasi pengiriman dana | Shipping confirmation |
| Selesai | Completed |

### Review Progressions

| Proposal | Assigned | Reviewed | Status |
|----------|----------|----------|--------|
| 2 proposals | 3 | 0/3 | Menunggu review |
| 1 proposal | 3 | 2/3 | Menunggu review |
| 2 proposals | 3 | 3/3 | Menunggu persetujuan Ketua |

---

## Dashboards Populated

### Dosen Dashboard
- 15 proposals across all stages
- Multiple laporans in different states
- Logbook entries for active laporans
- Notifications (read and unread)

### Staff LPPM Dashboard
- Proposals awaiting action
- Reviewer assignment workflow
- Laporan monitoring across stages
- Authorization request queue
- Notifications

### Ketua LPPM Dashboard
- Proposals awaiting normal decisions
- Authorization request queue (pending return and reject)
- Laporan monitoring
- Notifications

### Reviewer Dashboard
- Assigned proposal reviews (0/3, 2/3, 3/3)
- Assigned laporan reviews
- Review history

### Superadmin Dashboard
- 38 users across all roles
- 8 prodi
- 5 mahasiswa
- Publication categories
- System settings

---

## Files

| File | Purpose |
|------|---------|
| `prisma-server/database/seeders/SUSDemoSeeder.php` | SUS/Exploratory testing seeder |
| `docs/sus-testing-accounts.md` | This file |

---

## Notes

- All passwords are `password`
- All accounts have `email_verified_at` set
- All accounts have `status: Aktif`
- Seeder uses `ignore_kegiatan_dates => true` to bypass date restrictions
- Seeder is idempotent — safe to run on `migrate:fresh`
- Does NOT modify E2E test fixtures or thesis screenshot fixtures
- Uses separate account emails (`sustest.*` prefix for primary accounts)
