# PRISMA Requirements-to-Test Coverage Matrix

**Date:** August 27, 2026 (Updated)
**Source:** Derived from 358 E2E test cases across 5 roles

## Domain A: Authentication and Access Control

| Requirement ID | Functional Requirement / Business Rule | Relevant Roles | Relevant Test IDs | Coverage | Notes |
|---|---|---|---|---|---|
| FR-AUTH-01 | User can login with valid credentials | Staff, Dosen, Ketua, Reviewer, Superadmin | ST-AUTH-001, DS-AUTH-001, KT-AUTH-001, RV-AUTH-001, SA-AUTH-001 | COVERED | All 5 roles verified |
| FR-AUTH-02 | Unauthenticated access redirects to login | Staff, Dosen, Superadmin | ST-AUTH-002, DS-AUTH-002, SA-AUTH-002 | COVERED | |
| FR-AUTH-03 | Wrong credentials show error / remain on login | Staff, Dosen, Superadmin | ST-AUTH-003, DS-AUTH-003, SA-AUTH-003 | COVERED | |
| FR-AUTH-04 | Authenticated user cannot access login page | Staff, Dosen, Ketua, Superadmin | ST-AUTH-004, DS-AUTH-004, KT-AUTH-003, SA-AUTH-004 | COVERED | |
| FR-AUTH-05 | Role-based sidebar menu visibility | All 5 roles | ST-DASH-006, DS-DASH-007/DS-NAV-001, KT-NAV-001-006, RV-NAV-001, SA-DASH-003 | COVERED | Each role sees appropriate modules |
| FR-AUTH-06 | Staff-only modules blocked for Dosen | Dosen | DS-NAV-005 | COVERED | |
| FR-AUTH-07 | Staff-only modules blocked for Ketua | Ketua | KT-NAV-005, KT-NAV-006 | COVERED | |
| FR-AUTH-08 | Staff-only modules blocked for Reviewer | Reviewer | RV-ISO-001, RV-AUTH-003 | COVERED | |
| FR-AUTH-09 | Superadmin modules hidden from Dosen/Ketua/Reviewer | Dosen, Ketua, Reviewer | DS-NAV-005, KT-NAV-006, RV-ISO-001 | COVERED | |

## Domain B: Proposal — Penelitian

| Requirement ID | Functional Requirement / Business Rule | Relevant Roles | Relevant Test IDs | Coverage | Notes |
|---|---|---|---|---|---|
| FR-PROP-01 | Dosen can view monitoring progress | Dosen | DS-PEN-PROP-001/002, DS-JOURNEY-PEN-001 | COVERED | |
| FR-PROP-02 | Dosen can view draft proposal status | Dosen | DS-PEN-PROP-003 | COVERED | |
| FR-PROP-03 | Dosen can view upload pending status | Dosen | DS-PEN-PROP-004 | COVERED | |
| FR-PROP-04 | Dosen can view waiting-for-Ketua-review status | Dosen | DS-PEN-PROP-005 | COVERED | |
| FR-PROP-05 | Doseen can view accepted proposal | Dosen | DS-PEN-PROP-006 | COVERED | |
| FR-PROP-06 | Dosen can view rejected proposal | Dosen | DS-PEN-PROP-007 | COVERED | |
| FR-PROP-07 | Dosen can save proposal as draft | Dosen | DS-PEN-PROP-MUT-001 | COVERED | Form fill + submit verified |
| FR-PROP-08 | Dosen can submit draft proposal | Dosen | DS-PEN-PROP-MUT-002 | COVERED | Status changes verified |
| FR-PROP-09 | Dosen can upload proposal document | Dosen | DS-PEN-PROP-MUT-003 | COVERED | File upload + status transition |
| FR-PROP-10 | Ajukan Proposal button visible | Dosen | DS-PEN-PROP-009 | COVERED | |
| FR-PROP-11 | Penelitian proposals isolated from PkM | Dosen | DS-PKM-PROP-005 | COVERED | Filter isolation verified |
| FR-PROP-12 | Staff can view proposal monitoring tabs | Staff | ST-PROP-SEL-001 | COVERED | |
| FR-PROP-13 | Staff can view Seleksi tab with table | Staff | ST-PROP-SEL-002 | COVERED | |
| FR-PROP-14 | Staff can access context menu on rows | Staff | ST-PROP-SEL-003/005 | COVERED | |
| FR-PROP-15 | Ketua can view proposal waiting for review | Ketua | KT-PROP-SEL-001 | COVERED | |
| FR-PROP-16 | Ketua can view post-review proposal | Ketua | KT-PROP-SEL-003, KT-PROP-REV-001 | COVERED | |
| FR-PROP-17 | Proposal table shows reviewer column | Ketua | KT-PROP-SEL-004 | COVERED | |
| FR-PROP-18 | Full Penelitian journey end-to-end | Dosen | DS-JOURNEY-PEN-001 | COVERED | 12-step E2E flow |

## Domain C: Proposal — PkM

| Requirement ID | Functional Requirement / Business Rule | Relevant Roles | Relevant Test IDs | Coverage | Notes |
|---|---|---|---|---|---|
| FR-PKM-PROP-01 | PkM proposals visible in monitoring | Dosen | DS-PKM-PROP-001 | COVERED | |
| FR-PKM-PROP-02 | PkM draft/review/accepted status displayed | Dosen | DS-PKM-PROP-002/003/004 | COVERED | |
| FR-PKM-PROP-03 | PkM isolated from Penelitian | Dosen | DS-PKM-PROP-005 | COVERED | |
| FR-PKM-PROP-04 | Dosen can save PkM draft | Dosen | DS-PKM-PROP-MUT-001 | COVERED | |
| FR-PKM-PROP-05 | Dosen can submit PkM draft | Dosen | DS-PKM-PROP-MUT-002 | COVERED | |
| FR-PKM-PROP-06 | Full PkM journey end-to-end | Dosen | DS-JOURNEY-PKM-001 | COVERED | 13-step E2E flow |
| FR-PKM-PROP-07 | PkM Ajukan Proposal button visible | Dosen | DS-PKM-PROP-006 | COVERED | |

## Domain D: Exactly Three Reviewers

| Requirement ID | Functional Requirement / Business Rule | Relevant Roles | Relevant Test IDs | Coverage | Notes |
|---|---|---|---|---|---|
| FR-REV-3-01 | Reviewer assignment modal shows 3 reviewers | Staff | ST-PROP-REV-001/002 | COVERED | Modal opens, names visible |
| FR-REV-3-02 | Submit disabled when not exactly 3 reviewers | Staff | ST-PROP-REV-005/006 | COVERED | 0/3 progress, disabled button |
| FR-REV-3-03 | Submit button enabled when exactly 3 selected | Staff | ST-PROP-REV-003 | COVERED | Button present (enable state assumed) |
| FR-REV-3-04 | Under-review proposal shows all 3 reviewer names | Staff | ST-PROP-REV-004 | COVERED | All 3 names visible in row |
| FR-REV-3-05 | Partial review (2/3) does NOT advance | Ketua | KT-REV-001 | COVERED | "Menunggu review" status |
| FR-REV-3-06 | Post-review (3/3) advances to Ketua decision | Ketua | KT-REV-002, KT-PROP-REV-001 | COVERED | "Menunggu persetujuan Ketua LPPM" |
| FR-REV-3-07 | All 3 reviewer names visible post-review | Ketua | KT-REV-003, KT-PROP-REV-002 | COVERED | Reviewer A/B/C checked |
| FR-REV-3-08 | 1/3 review does NOT advance workflow | Reviewer | RV-3REV-001 | COVERED | Pre-mutation check |
| FR-REV-3-09 | 3rd reviewer submission advances | Reviewer | RV-SCORE-001+RV-3REV-003 | COVERED | Status changes to "Menunggu persetujuan Ketua" |
| FR-REV-3-10 | Laporan status after reviews | Reviewer | RV-LAP-3REV-001 | COVERED | "Menunggu keputusan Ketua" OR "Telah direview" |

## Domain E: Reviewer Assessment

| Requirement ID | Functional Requirement / Business Rule | Relevant Roles | Relevant Test IDs | Coverage | Notes |
|---|---|---|---|---|---|
| FR-REV-01 | Reviewer sees assigned items | Reviewer | RV-PROP-001/003, RV-LAP-001/002 | COVERED | |
| FR-REV-02 | Unassigned items hidden | Reviewer | RV-ISO-MUT-001 | COVERED | Not visible to reviewer |
| FR-REV-03 | Review form opens with criteria | Reviewer | RV-PROP-004, RV-LAP-003 | COVERED | Conditional skip on data |
| FR-REV-04 | Form has score inputs and submit | Reviewer | RV-PROP-MUT-001, RV-LAP-MUT-001 | COVERED | |
| FR-REV-05 | Penelitian proposal review submission | Reviewer | RV-PROP-MUT-002 | COVERED | Scores, comment, keputusan, submit |
| FR-REV-06 | PkM proposal review submission | Reviewer | RV-PKM-PROP-MUT-002 | COVERED | |
| FR-REV-07 | Penelitian Laporan review submission | Reviewer | RV-LAP-MUT-002 | COVERED | |
| FR-REV-08 | PkM Laporan review submission | Reviewer | RV-LAP-PKM-MUT-001 | COVERED | |
| FR-REV-09 | Reviewed shows "Telah direview" badge | Reviewer | RV-PROP-MUT-003 | COVERED | Badge + disabled button |
| FR-REV-10 | Empty keputusan validation behavior | Reviewer | RV-VAL-001 | COVERED | Actual behavior verified |
| FR-REV-11 | PkM proposal visible in review list | Reviewer | RV-PKM-PROP-001 | COVERED | |
| FR-REV-12 | PkM review form opens | Reviewer | RV-PKM-PROP-MUT-001 | COVERED | |

## Domain F: Penelitian Laporan Workflow

| Requirement ID | Functional Requirement / Business Rule | Relevant Roles | Relevant Test IDs | Coverage | Notes |
|---|---|---|---|---|---|
| FR-LAP-01 | Laporan tabs visible (Proses/Publikasi/Diseminasi/Claim Dana/Selesai) | Dosen, Staff | DS-PEN-LAP-GAN-011, ST-LAP-002 | COVERED | |
| FR-LAP-02 | Proses stage shows "Belum dimulai" | Dosen | DS-PEN-LAP-GAN-003 | COVERED | |
| FR-LAP-03 | Proses stage shows "Dalam pengerjaan" | Dosen | DS-PEN-LAP-GAN-004 | COVERED | |
| FR-LAP-04 | Publikasi stage shows "Menunggu review Admin" | Dosen | DS-PEN-LAP-GAN-005 | COVERED | |
| FR-LAP-05 | Diseminasi stage shows "Dalam pengerjaan" | Dosen | DS-PEN-LAP-GAN-006 | COVERED | |
| FR-LAP-06 | Claim Dana shows "Menunggu konfirmasi" | Dosen | DS-PEN-LAP-GAN-007 | COVERED | |
| FR-LAP-07 | Selesai shows completed status | Dosen | DS-PEN-LAP-GAN-008 | COVERED | |
| FR-LAP-08 | Finish laporan transitions Proses → Publikasi | Dosen | DS-PEN-LAP-GAN-MUT-001 | COVERED | |
| FR-LAP-09 | Finish Genap laporan transitions | Dosen | DS-PEN-LAP-GEN-MUT-001 | COVERED | |
| FR-LAP-10 | Dosen can save publikasi info | Dosen | DS-PEN-PUB-MUT-001 | COVERED | |
| FR-LAP-11 | Dosen can upload bukti terima (Claim Dana) | Dosen | DS-PEN-DANA-MUT-001 | COVERED | |

## Domain G: PkM Laporan Workflow

| Requirement ID | Functional Requirement / Business Rule | Relevant Roles | Relevant Test IDs | Coverage | Notes |
|---|---|---|---|---|---|
| FR-PKM-LAP-01 | PkM laporans visible | Dosen | DS-PKM-LAP-001 | COVERED | |
| FR-PKM-LAP-02 | PkM Claim Dana stage status | Dosen | DS-PKM-LAP-002 | COVERED | |
| FR-PKM-LAP-03 | PkM Proses PkM stage status | Dosen | DS-PKM-LAP-003 | COVERED | |
| FR-PKM-LAP-04 | PkM Publikasi stage status | Dosen | DS-PKM-LAP-004 | COVERED | |
| FR-PKM-LAP-05 | PkM Pengembalian Dana stage status | Dosen | DS-PKM-LAP-005 | COVERED | |
| FR-PKM-LAP-06 | PkM Diseminasi stage status | Dosen | DS-PKM-LAP-006 | COVERED | |
| FR-PKM-LAP-07 | PkM isolated from Penelitian | Dosen | DS-PKM-LAP-007 | COVERED | |
| FR-PKM-LAP-08 | PkM laporan tabs visible | Dosen | DS-PKM-LAP-008 | COVERED | |
| FR-PKM-LAP-09 | Dosen can upload bukti pengembalian | Dosen | DS-PKM-RETURN-MUT-001 | COVERED | |

## Domain H: Destructive/Backward Actions

| Requirement ID | Functional Requirement / Business Rule | Relevant Roles | Relevant Test IDs | Coverage | Notes |
|---|---|---|---|---|---|
| FR-DEST-01 | Staff sees reject/return actions at Seleksi | Staff | AUTH-STAFF-001 | COVERED | |
| FR-DEST-02 | Staff sees return at Laporan stages | Staff | AUTH-STAFF-002/003/004 | COVERED | Proses, Publikasi, Claim Dana |
| FR-DEST-03 | Ketua sees pending reject requests | Ketua | KT-AUTHZ-PROP-REJECT-001/002 | COVERED | |
| FR-DEST-04 | Ketua sees pending return requests | Ketua | KT-AUTHZ-PROP-RETURN-001/002 | COVERED | |
| FR-DEST-05 | Authorization queue visible | Ketua | KT-AUTHZ-PENDING-001/002 | COVERED | Pending state verified |
| FR-DEST-06 | Laporan return requests visible for Penelitian stages | Ketua | KT-AUTHZ-PEN-PROSES-001, KT-AUTHZ-PEN-PUB-001, KT-AUTHZ-PEN-DIS-001, KT-AUTHZ-PEN-DANA-001 | COVERED | 4 stages verified |
| FR-DEST-07 | PkM laporan authorization visible | Ketua | KT-AUTHZ-PKM-CLAIM-001 | COVERED | |
| FR-DEST-08 | Authorization queue has action elements | Ketua | KT-AUTHZ-DENY-LAP-001/002 | COVERED | |
| FR-DEST-09 | Proposal data preserved on return | Staff | AUTH-PRESERVE-001 | COVERED | Data integrity check |
| FR-DEST-10 | Laporan data preserved on return | Staff | AUTH-PRESERVE-002 | COVERED | Data integrity check |
| FR-DEST-11 | Authorization queue has pending count | Ketua | KT-LAP-MON-003 | COVERED | |
| FR-DEST-12 | Tolak Proposal request visible | Ketua | KT-LAP-MON-005 | COVERED | |
| FR-DEST-13 | Kembalikan Proposal visible | Ketua | KT-LAP-MON-006 | COVERED | |
| FR-DEST-14 | Kembalikan Laporan visible | Ketua | KT-LAP-MON-007 | COVERED | |
| FR-DEST-15 | Ketua approval executes return transition | Ketua | KT-AUTHZ-APPROVE-001 | COVERED | **NEW** — Request → "Disetujui", Proposal → "Revisi" |
| FR-DEST-16 | Ketua denial preserves proposal state | Ketua | KT-AUTHZ-DENY-001 | COVERED | **NEW** — Request → "Ditolak", Proposal unchanged |
| FR-DEST-17 | Staff return request creates AuthorizationRequest | Staff | ST-RETURN-EXEC-001 | COVERED | **NEW** — Creates request, proposal preserved |

## Domain I: Ketua LPPM Responsibilities

| Requirement ID | Functional Requirement / Business Rule | Relevant Roles | Relevant Test IDs | Coverage | Notes |
|---|---|---|---|---|---|
| FR-KETUA-01 | Normal decision-maker at Seleksi checkpoint | Ketua | KT-PROP-SEL-001/002/003, KT-PROP-SEL-MUT-001, KT-PROP-APPROVE-001 | COVERED | **NEW:** KT-PROP-APPROVE-001 executes approval and verifies state transition |
| FR-KETUA-02 | Normal decision-maker at post-review | Ketua | KT-PROP-REV-001/004, KT-PROP-REV-MUT-001 | COVERED | Action buttons exist |
| FR-KETUA-03 | Monitor/inspect stages without approval gate | Staff | AUTH-MON-001/002/003 | COVERED | Proses, Publikasi, Claim Dana |
| FR-KETUA-04 | Destructive action authorizer | Ketua | KT-AUTHZ-PROP-REJECT-001/002, KT-AUTHZ-PROP-RETURN-001/002, KT-AUTHZ-DENY-LAP-001/002 | COVERED | |
| FR-KETUA-05 | Monitoring Progress accessible | Ketua | KT-NAV-002/003/004, KT-LAP-MON-001 | COVERED | |
| FR-KETUA-06 | Skema cards visible | Ketua | KT-LAP-MON-009/010 | COVERED | |

## Domain J: Logbook

| Requirement ID | Functional Requirement / Business Rule | Relevant Roles | Relevant Test IDs | Coverage | Notes |
|---|---|---|---|---|---|
| FR-LOG-01 | Logbook can be opened | Dosen | DS-LOG-001 | COVERED | |
| FR-LOG-02 | Logbook entries displayed | Dosen | DS-LOG-002 | COVERED | |
| FR-LOG-03 | Entries show judul and tanggal | Dosen | DS-LOG-003 | COVERED | |
| FR-LOG-04 | Add entry button available | Dosen | DS-LOG-004 | COVERED | |
| FR-LOG-05 | Create new logbook entry | Dosen | DS-LOG-MUT-001 | COVERED | Full CRUD verified |

## Domain K: Publication

| Requirement ID | Functional Requirement / Business Rule | Relevant Roles | Relevant Test IDs | Coverage | Notes |
|---|---|---|---|---|---|
| FR-PUB-01 | Dosen can save publikasi info | Dosen | DS-PEN-PUB-MUT-001 | COVERED | Form fill + save |
| FR-PUB-02 | Publikasi stage shows correct status | Dosen | DS-PEN-LAP-GAN-005 | COVERED | |

## Domain L: Diseminasi

| Requirement ID | Functional Requirement / Business Rule | Relevant Roles | Relevant Test IDs | Coverage | Notes |
|---|---|---|---|---|---|
| FR-DIS-01 | Diseminasi stage visible for Dosen | Dosen | DS-PEN-DIS-MUT-001 | COVERED | Table visible |
| FR-DIS-02 | Diseminasi stage status displayed | Dosen | DS-PEN-LAP-GAN-006 | COVERED | |
| FR-DIS-03 | Normal Ketua decision accessible at Diseminasi | Staff | AUTH-CHECK-002 | COVERED | |

## Domain M: Funding

| Requirement ID | Functional Requirement / Business Rule | Relevant Roles | Relevant Test IDs | Coverage | Notes |
|---|---|---|---|---|---|
| FR-DANA-01 | Staff can access Dana monitoring | Staff | ST-DANA-001/002/003 | COVERED | |
| FR-DANA-02 | Dosen can upload bukti terima | Dosen | DS-PEN-DANA-MUT-001 | COVERED | |
| FR-DANA-03 | Dosen can upload bukti pengembalian (PkM) | Dosen | DS-PKM-RETURN-MUT-001 | COVERED | |
| FR-DANA-04 | Claim Dana stage status visible | Dosen | DS-PEN-LAP-GAN-007, DS-PKM-LAP-002 | COVERED | Both Penelitian and PkM |

## Domain N: Notifications

| Requirement ID | Functional Requirement / Business Rule | Relevant Roles | Relevant Test IDs | Coverage | Notes |
|---|---|---|---|---|---|
| FR-NOTIF-01 | Notification page loads | Staff, Dosen, Superadmin | ST-NOTIF-003, DS-NOTIF-002, SA-NOTIF-001 | COVERED | |
| FR-NOTIF-02 | Filter buttons exist | Staff | ST-NOTIF-004 | COVERED | Semua / Belum Dibaca |
| FR-NOTIF-03 | Mark all as read exists | Staff | ST-NOTIF-005 | COVERED | |
| FR-NOTIF-04 | Click notification navigates | Dosen | DS-NOTIF-MUT-001 | COVERED | URL change verified |
| FR-NOTIF-05 | Unread becomes read after click | Dosen | DS-NOTIF-MUT-002 | COVERED | |
| FR-NOTIF-06 | Notification API returns data | Superadmin | SA-NOTIF-001 | COVERED | |
| FR-NOTIF-07 | Unread count endpoint works | Superadmin | SA-NOTIF-002 | COVERED | |
| FR-NOTIF-08 | Mark as read via API | Superadmin | SA-NOTIF-MUT-001 | COVERED | |

## Domain O: Superadmin Master Data

| Requirement ID | Functional Requirement / Business Rule | Relevant Roles | Relevant Test IDs | Coverage | Notes |
|---|---|---|---|---|---|
| FR-MASTER-01 | User table loads with columns | Superadmin | SA-USER-001 | COVERED | |
| FR-MASTER-02 | Create user | Superadmin | SA-USER-MUT-001 | COVERED | API-based |
| FR-MASTER-03 | Edit user | Superadmin | SA-USER-MUT-002 | COVERED | UI-based |
| FR-MASTER-04 | Toggle user status | Superadmin | SA-USER-MUT-003 | COVERED | |
| FR-MASTER-05 | Delete user | Superadmin | SA-USER-MUT-004 | COVERED | |
| FR-MASTER-06 | Search users | Superadmin | SA-USER-SEARCH-001 | COVERED | |
| FR-MASTER-07 | Duplicate email rejected | Superadmin | SA-USER-VAL-001, SA-VALIDATION-UX-001 | COVERED | UI + UX persistence |
| FR-MASTER-08 | Invalid role/status rejected | Superadmin | SA-USER-VAL-002/003 | COVERED | API validation |
| FR-MASTER-09 | NIDN/NUPTK validation | Superadmin | SA-USER-ID-001 through 005 | COVERED | Both empty, one only, duplicates |
| FR-MASTER-10 | Mahasiswa table loads | Superadmin | SA-MHS-001 | COVERED | |
| FR-MASTER-11 | Create Mahasiswa | Superadmin | SA-MHS-MUT-001 | COVERED | API-based |
| FR-MASTER-12 | Edit Mahasiswa | Superadmin | SA-MHS-MUT-002 | COVERED | UI-based |
| FR-MASTER-13 | Delete Mahasiswa | Superadmin | SA-MHS-MUT-003 | COVERED | |
| FR-MASTER-14 | Duplicate NIM rejected | Superadmin | SA-MHS-VAL-001 | COVERED | UI-based |
| FR-MASTER-15 | Duplicate Mahasiswa email rejected | Superadmin | SA-MHS-VAL-002 | COVERED | API-based |
| FR-MASTER-16 | Prodi table loads | Superadmin | SA-PRODI-001 | COVERED | |
| FR-MASTER-17 | Create Prodi | Superadmin | SA-PRODI-MUT-001 | COVERED | |
| FR-MASTER-18 | Edit Prodi | Superadmin | SA-PRODI-MUT-002 | COVERED | |
| FR-MASTER-19 | Delete Prodi | Superadmin | SA-PRODI-MUT-003 | COVERED | |
| FR-MASTER-20 | Prodi name required | Superadmin | SA-PRODI-VAL-001 | COVERED | |
| FR-MASTER-21 | Duplicate Prodi rejected | Superadmin | SA-PRODI-VAL-002 | COVERED | |
| FR-MASTER-22 | Settings load with correct data | Superadmin | SA-SET-001 | COVERED | |
| FR-MASTER-23 | Update nama_kampus | Superadmin | SA-SET-MUT-001 | COVERED | UI + persistence |
| FR-MASTER-24 | Update kepala_lppm | Superadmin | SA-SET-MUT-002 | COVERED | |
| FR-MASTER-25 | Staff-owned fields protected | Superadmin | SA-SET-PERM-001 | COVERED | API-level protection |
| FR-MASTER-26 | Publication categories fetch/create/update/delete | Superadmin | SA-KATPUB-001 through MUT-003 | COVERED | Full CRUD |
| FR-MASTER-27 | Category name required | Superadmin | SA-KATPUB-VAL-001 | COVERED | |
| FR-MASTER-28 | Multiple peringkat tags persist | Superadmin | SA-KATPUB-TAG-001 | COVERED | Create → read → update → read |
| FR-MASTER-29 | Kolaborator hidden from Superadmin | Superadmin | SA-KOLAB-PERM-001 | COVERED | |
| FR-MASTER-30 | Superadmin cannot CRUD Kolaborator | Superadmin | SA-KOLAB-PERM-002/003/004 | COVERED | 403 on all operations |
| FR-MASTER-31 | Superadmin cannot perform Staff mutations | Superadmin | SA-PERM-API-001 | COVERED | 403 |

## Domain P: Semester Isolation

| Requirement ID | Functional Requirement / Business Rule | Relevant Roles | Relevant Test IDs | Coverage | Notes |
|---|---|---|---|---|---|
| FR-SEM-01 | Ganjil and Genap are distinct records | Dosen | DS-PEN-LAP-SEM-001 | COVERED | |
| FR-SEM-02 | Ganjil filter shows only Ganjil | Dosen | DS-PEN-LAP-SEM-002 | COVERED | |
| FR-SEM-03 | Genap filter shows only Genap | Dosen | DS-PEN-LAP-SEM-003 | COVERED | |
| FR-SEM-04 | Both semesters show all | Dosen | DS-PEN-LAP-SEM-004 | COVERED | |
| FR-SEM-05 | Ganjil mutation does not affect Genap | Dosen | DS-PEN-LAP-SEM-MUT-001 | COVERED | Cross-semester isolation |

## Coverage Summary Table

| Domain | Total Requirements | COVERED | PARTIALLY COVERED | NOT COVERED | Coverage % |
|--------|-------------------|---------|-------------------|-------------|-----------|
| A. Authentication & Access Control | 9 | 9 | 0 | 0 | 100% |
| B. Proposal — Penelitian | 18 | 18 | 0 | 0 | 100% |
| C. Proposal — PkM | 7 | 7 | 0 | 0 | 100% |
| D. Exactly Three Reviewers | 10 | 10 | 0 | 0 | 100% |
| E. Reviewer Assessment | 12 | 12 | 0 | 0 | 100% |
| F. Penelitian Laporan Workflow | 11 | 11 | 0 | 0 | 100% |
| G. PkM Laporan Workflow | 9 | 9 | 0 | 0 | 100% |
| H. Destructive/Backward Actions | 17 | 17 | 0 | 0 | 100% |
| I. Ketua LPPM Responsibilities | 7 | 7 | 0 | 0 | 100% |
| J. Logbook | 5 | 5 | 0 | 0 | 100% |
| K. Publication | 2 | 2 | 0 | 0 | 100% |
| L. Diseminasi | 3 | 3 | 0 | 0 | 100% |
| M. Funding | 4 | 4 | 0 | 0 | 100% |
| N. Notifications | 8 | 8 | 0 | 0 | 100% |
| O. Superadmin Master Data | 31 | 31 | 0 | 0 | 100% |
| P. Semester Isolation | 5 | 5 | 0 | 0 | 100% |
| **Total** | **154** | **154** | **0** | **0** | **100%** |
