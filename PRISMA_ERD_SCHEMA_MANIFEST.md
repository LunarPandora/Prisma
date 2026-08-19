# PRISMA ERD Schema Manifest

**Purpose:** Authoritative schema source for final ERD generation in Bab IV tesis.
**Generated:** Agustus 2026
**Sources:** 86 migrations, 31 Eloquent models, live MariaDB `prisma_server2` schema inspection

---

## Consistency Summary

| Metric | Count |
|--------|-------|
| Migrations inspected | 86 |
| Database tables found (SHOW TABLES) | 42 |
| Application tables in ERD | 30 |
| Framework/infrastructure tables excluded | 12 |
| Database-enforced foreign keys | 39 physical (37 unique logical) |
| Eloquent-only relationships (no DB constraint) | 14 |
| Polymorphic relationships | 3 (Dokumen, PenugasanReviewer, AuthorizationRequest) |
| Migration/database discrepancies | 4 (see Section 15) |
| Unresolved schema questions | 3 (see Section 16) |

---

## 1. Complete Table Inventory

### 1.1 Core Application Tables (30)

| # | Table | Model | PK | Domain | In ERD |
|---|-------|-------|-----|--------|--------|
| 1 | `users` | `User` | `id` | User & Access | Yes |
| 2 | `prodi` | `Prodi` | `prodi_id` | Academic Master Data | Yes |
| 3 | `skema` | `Skema` | `skema_id` | Proposal Management | Yes |
| 4 | `kegiatan_pengajuan` | `KegiatanPengajuan` | `kegiatan_id` | Proposal Management | Yes |
| 5 | `proposal` | `Proposal` | `proposal_id` | Proposal Management | Yes |
| 6 | `proposal_member` | `ProposalMember` | `prop_member_id` | Proposal Membership | Yes |
| 7 | `laporan` | `Laporan` | `laporan_id` | Laporan Management | Yes |
| 8 | `laporan_member` | `LaporanMember` | `laporan_member_id` | Laporan Management | Yes |
| 9 | `dokumen` | `Dokumen` | `dokumen_id` | Document Management | Yes |
| 10 | `dokumen_version` | `DokumenVersion` | `version_id` | Document Management | Yes |
| 11 | `penugasan_reviewer` | `PenugasanReviewer` | `penugasan_id` | Review Management | Yes |
| 12 | `review` | `Review` | `review_id` | Review Management | Yes |
| 13 | `settings` | `Settings` | `id` | System Configuration | Yes |
| 14 | `mahasiswa` | `Mahasiswa` | `mhswa_id` | Academic Master Data | Yes |
| 15 | `kolaborator` | `Kolaborator` | `kolab_id` | Academic Master Data | Yes |
| 16 | `peneliti_details` | `PenelitiDetail` | `id` | Researcher Profile | Yes |
| 17 | `publications` | `Publication` | `id` | Research Output | Yes |
| 18 | `publication_categories` | `PublicationCategory` | `pub_category_id` | Research Output | Yes |
| 19 | `books` | `Book` | `id` | Research Output | Yes |
| 20 | `hkis` | `Hki` | `id` | Research Output | Yes |
| 21 | `research_histories` | `ResearchHistory` | `id` | Research Output | Yes |
| 22 | `logbook_pengerjaan` | `LogbookPengerjaan` | `logbook_id` | Activity Log | Yes |
| 23 | `realisasi_anggaran` | `RealisasiAnggaran` | `id` | Budget | Yes |
| 24 | `sitasi` | `Sitasi` | `sitasi_id` | Citation | Yes |
| 25 | `notifications` | `Notification` | `notification_id` | Notification | Yes |
| 26 | `scholar_profiles` | `ScholarProfile` | `scholar_profile_id` | Google Scholar | Yes |
| 27 | `scholar_publications` | `ScholarPublication` | `publication_id` | Google Scholar | Yes |
| 28 | `scholar_citations_by_year` | `ScholarCitationByYear` | `citation_id` | Google Scholar | Yes |
| 29 | `scholar_publication_citations_by_year` | `ScholarPublicationCitationByYear` | `publication_citation_id` | Google Scholar | Yes |
| 30 | `kegiatan_edit_requests` | `KegiatanEditRequest` | `id` | Workflow Authorization | Yes |

### 1.2 Framework/Infrastructure Tables (12, excluded from ERD)

| # | Table | Purpose |
|---|-------|---------|
| 1 | `cache` | Laravel cache |
| 2 | `cache_locks` | Laravel cache locks |
| 3 | `failed_jobs` | Laravel queue failed jobs |
| 4 | `job_batches` | Laravel queue batches |
| 5 | `jobs` | Laravel queue jobs |
| 6 | `migrations` | Laravel migration tracking |
| 7 | `password_reset_tokens` | Laravel auth |
| 8 | `personal_access_tokens` | Laravel Sanctum |
| 9 | `sessions` | Laravel session |
| 10 | `authorization_requests` | Workflow authorization (included in ERD as framework) |

---

## 2. Complete Column Inventory

### 2.1 `users`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint unsigned | NO | auto | PK |
| `nama` | varchar(255) | NO | — | |
| `email` | varchar(255) | NO | — | UNIQUE |
| `email_verified_at` | timestamp | YES | NULL | |
| `password` | varchar(255) | NO | — | Hidden |
| `role` | enum('Superadmin','Staff LPPM','Ketua LPPM','Dosen','Reviewer','Rektorat') | NO | — | |
| `gender` | enum('L','P') | NO | — | |
| `status` | enum('Aktif','Nonaktif') | NO | — | |
| `nidn` | varchar(255) | YES | NULL | |
| `nuptk` | varchar(255) | YES | NULL | |
| `no_hp` | varchar(255) | YES | NULL | |
| `prodi_id` | bigint unsigned | YES | NULL | FK → prodi.prodi_id |
| `avatar` | text | YES | NULL | |
| `remember_token` | varchar(100) | YES | NULL | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |
| `deleted_at` | timestamp | YES | NULL | SoftDeletes |

### 2.2 `prodi`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `prodi_id` | bigint unsigned | NO | auto | PK |
| `nama_prodi` | varchar(255) | NO | — | |
| `kaprodi_id` | bigint unsigned | YES | NULL | FK → users.id |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |
| `deleted_at` | timestamp | YES | NULL | SoftDeletes |

### 2.3 `skema`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `skema_id` | bigint unsigned | NO | auto | PK |
| `nama_skema` | varchar(255) | NO | — | |
| `tahun_ajaran` | varchar(255) | NO | — | |
| `status` | enum('Draft','Aktif','Selesai') | NO | 'Draft' | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |
| `deleted_at` | timestamp | YES | NULL | SoftDeletes |

### 2.4 `kegiatan_pengajuan`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `kegiatan_id` | bigint unsigned | NO | auto | PK |
| `skema_id` | bigint unsigned | NO | — | FK → skema.skema_id CASCADE |
| `jenis_penelitian` | enum('Penelitian','PkM') | NO | — | |
| `kode_kegiatan` | varchar(255) | NO | — | UNIQUE(skema_id, jenis_penelitian, kode_kegiatan) |
| `nama_kegiatan` | varchar(255) | NO | — | |
| `tgl_mulai` | date | YES | NULL | |
| `tgl_selesai` | date | YES | NULL | |
| `status` | enum('Belum dibuka','Terbuka','Selesai') | NO | 'Belum dibuka' | |
| `manual_status_override` | tinyint(1) | NO | 0 | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |
| `deleted_at` | timestamp | YES | NULL | SoftDeletes |

### 2.5 `proposal`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `proposal_id` | bigint unsigned | NO | auto | PK |
| `jenis_penelitian` | enum('Penelitian','PkM') | NO | — | |
| `jenis_penelitian_gan` | enum('Penelitian','PkM') | NO | — | |
| `jenis_penelitian_gen` | enum('Penelitian','PkM') | NO | — | |
| `judul` | varchar(255) | YES | NULL | |
| `tahap_penelitian` | enum('Proposal','Laporan') | NO | 'Proposal' | |
| `topik_penelitian` | varchar(255) | NO | — | |
| `bidang_ilmu` | varchar(255) | NO | — | |
| `fokus_sdg` | varchar(255) | NO | — | |
| `ra_biaya_penelitian_gan` | double | YES | NULL | |
| `ra_biaya_publikasi_gan` | double | YES | NULL | |
| `ra_insentif_gan` | double | YES | NULL | |
| `ra_biaya_penelitian_gen` | double | YES | NULL | |
| `ra_biaya_publikasi_gen` | double | YES | NULL | |
| `ra_insentif_gen` | double | YES | NULL | |
| `target_publikasi_gan` | varchar(255) | NO | — | |
| `target_publikasi_gen` | varchar(255) | NO | — | |
| `rencana_judul_publikasi_gan` | text | NO | — | |
| `rencana_judul_publikasi_gen` | text | NO | — | |
| `metopen_gan` | text | NO | — | |
| `metopen_gen` | text | NO | — | |
| `unit_analisis_gan` | text | NO | — | |
| `unit_analisis_gen` | text | NO | — | |
| `kontribusi_ilmu_makul` | text | NO | — | |
| `kontribusi_pkm` | text | NO | — | |
| `rencana_luaran` | text | NO | — | |
| `institusi_mitra` | varchar(255) | NO | '-' | |
| `user_id` | bigint unsigned | NO | — | FK → users.id |
| `kegiatan_id` | bigint unsigned | NO | — | FK → kegiatan_pengajuan.kegiatan_id CASCADE |
| `skema` | enum('Internal','Eksternal','Mandiri') | NO | — | |
| `sumber_skema` | varchar(255) | NO | — | |
| `status` | enum(12 values) | NO | 'Draft' | See Section 4 |
| `ketua_seleksi_approved` | tinyint(1) | NO | 0 | |
| `staff_seleksi_approved` | tinyint(1) | NO | 0 | |
| `tgl_pengajuan` | date | YES | NULL | |
| `catatan` | text | YES | NULL | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |
| `deleted_at` | timestamp | YES | NULL | SoftDeletes |

### 2.6 `proposal_member`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `prop_member_id` | bigint unsigned | NO | auto | PK |
| `proposal_id` | bigint unsigned | NO | — | FK → proposal.proposal_id |
| `member_id` | bigint unsigned | NO | — | Polymorphic: users.id / mahasiswa.mhswa_id / kolaborator.kolab_id |
| `role` | enum('Dosen','Mahasiswa','Kolaborator') | NO | — | |
| `semester` | enum('Ganjil','Genap') | NO | — | |
| `ttjp` | text | NO | — | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |

### 2.7 `laporan`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `laporan_id` | bigint unsigned | NO | auto | PK |
| `proposal_id` | bigint unsigned | NO | — | FK → proposal.proposal_id; UNIQUE(proposal_id, semester) |
| `kegiatan_id` | bigint unsigned | YES | NULL | FK → kegiatan_pengajuan.kegiatan_id CASCADE |
| `semester` | enum('Ganjil','Genap') | NO | — | |
| `jenis_penelitian` | enum('Penelitian','PkM') | NO | — | |
| `judul_penelitian` | varchar(255) | NO | — | |
| `metode_penelitian` | text | YES | NULL | |
| `unit_analisis` | text | YES | NULL | |
| `link_luaran_drive_id` | text | YES | NULL | |
| `link_luaran_drive_url` | text | YES | NULL | |
| `target_publikasi` | varchar(255) | YES | NULL | |
| `nama_jurnal` | varchar(255) | YES | NULL | |
| `link_jurnal` | varchar(255) | YES | NULL | |
| `link_publikasi` | text | YES | NULL | |
| `link_laporan_akhir` | text | YES | NULL | |
| `link_hki` | text | YES | NULL | |
| `link_buku` | text | YES | NULL | |
| `link_poster` | text | YES | NULL | |
| `link_video` | text | YES | NULL | |
| `dana_dikembalikan` | tinyint(1) | NO | 0 | |
| `dana_disetujui` | tinyint(1) | NO | 0 | |
| `dana_disetujui_by` | bigint unsigned | YES | NULL | No FK constraint (implied → users.id) |
| `dana_disetujui_at` | timestamp | YES | NULL | |
| `claim_dana_status` | varchar(255) | YES | NULL | |
| `institusi_mitra` | varchar(255) | YES | NULL | |
| `realisasi_biaya_penelitian` | double | NO | 0 | |
| `realisasi_biaya_publikasi` | double | NO | 0 | |
| `realisasi_insentif` | double | NO | 0 | |
| `status` | enum(14 values) | YES | 'Dalam pengerjaan' | See Section 4 |
| `ketua_diseminasi_approved` | tinyint(1) | NO | 0 | |
| `staff_diseminasi_approved` | tinyint(1) | NO | 0 | |
| `tgl_mulai` | date | YES | NULL | |
| `tgl_submit` | date | YES | NULL | |
| `tgl_selesai` | date | YES | NULL | |
| `completed_at` | timestamp | YES | NULL | |
| `current_logbook_id` | bigint unsigned | YES | NULL | FK → logbook_pengerjaan.logbook_id |
| `catatan` | text | YES | NULL | |
| `hasil_pelaksanaan` | text | YES | NULL | |
| `status_luaran` | text | YES | NULL | |
| `peran_mitra` | text | YES | NULL | |
| `kendala_pelaksanaan` | text | YES | NULL | |
| `rencana_tahapan_selanjutnya` | text | YES | NULL | |
| `daftar_pustaka` | text | YES | NULL | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |
| `deleted_at` | timestamp | YES | NULL | SoftDeletes |
| `claim_dana_approved_at` | timestamp | YES | NULL | |
| `claim_dana_confirmed_at` | timestamp | YES | NULL | |
| `pengembalian_dana_status` | varchar(255) | YES | NULL | |
| `pengembalian_dana_confirmed_at` | timestamp | YES | NULL | |
| `pengembalian_dana_skipped_reason` | varchar(255) | YES | NULL | |

### 2.8 `laporan_member`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `laporan_member_id` | bigint unsigned | NO | auto | PK |
| `laporan_id` | bigint unsigned | NO | — | FK → laporan.laporan_id CASCADE |
| `member_id` | bigint unsigned | NO | — | Polymorphic: users.id / mahasiswa.mhswa_id / kolaborator.kolab_id |
| `role` | enum('Dosen','Mahasiswa','Kolaborator') | NO | — | |
| `position` | int | NO | 0 | |
| `ttjp` | text | YES | NULL | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |

### 2.9 `dokumen`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `dokumen_id` | bigint unsigned | NO | auto | PK |
| `documentable_id` | bigint unsigned | NO | — | Polymorphic owner ID |
| `documentable_type` | varchar(255) | NO | — | Polymorphic type |
| `jenis_dokumen` | varchar(255) | NO | — | |
| `current_version_id` | bigint unsigned | YES | NULL | No FK constraint (implied → dokumen_version.version_id) |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |
| `deleted_at` | timestamp | YES | NULL | SoftDeletes |

### 2.10 `dokumen_version`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `version_id` | bigint unsigned | NO | auto | PK |
| `dokumen_id` | bigint unsigned | NO | — | FK → dokumen.dokumen_id |
| `uploaded_by` | bigint unsigned | NO | — | No FK constraint (implied → users.id) |
| `version` | int | NO | — | |
| `nama_file` | varchar(255) | NO | — | |
| `local_file_url` | text | NO | — | |
| `drive_file_id` | text | NO | — | |
| `drive_file_url` | text | NO | — | |
| `catatan_revisi` | text | YES | NULL | |
| `tgl_upload` | datetime | NO | — | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |
| `deleted_at` | timestamp | YES | NULL | SoftDeletes |

### 2.11 `penugasan_reviewer`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `penugasan_id` | bigint unsigned | NO | auto | PK |
| `reviewable_type` | varchar(255) | NO | 'App\Models\Proposal' | Polymorphic type |
| `reviewable_id` | bigint unsigned | YES | NULL | Polymorphic ID (Proposal or Laporan) |
| `proposal_id` | bigint unsigned | YES | NULL | FK → proposal.proposal_id nullOnDelete |
| `tgl_penugasan` | date | NO | — | |
| `user_id` | bigint unsigned | NO | — | FK → users.id |
| `status_review` | enum('Belum direview','Telah direview') | NO | 'Belum direview' | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |
| `deleted_at` | timestamp | YES | NULL | SoftDeletes |

### 2.12 `review`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `review_id` | bigint unsigned | NO | auto | PK |
| `penugasan_id` | bigint unsigned | NO | — | FK → penugasan_reviewer.penugasan_id |
| `keputusan` | enum('Diterima','Diterima dengan perbaikan','Ditolak') | NO | — | |
| `kriteria_kesesuaian_tema` | json | YES | NULL | |
| `kriteria_penilaian` | json | YES | NULL | |
| `catatan` | text | NO | — | |
| `tgl_review` | date | NO | — | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |
| `deleted_at` | timestamp | YES | NULL | SoftDeletes |

### 2.13 `settings`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint unsigned | NO | auto | PK |
| `kepala_lppm` | bigint unsigned | YES | NULL | FK → users.id |
| `rektor` | bigint unsigned | YES | NULL | FK → users.id |
| `rektor_nama` | varchar(255) | YES | NULL | |
| `rektor_nidn` | varchar(255) | YES | NULL | |
| `rektor_nuptk` | varchar(255) | YES | NULL | |
| `nama_kampus` | varchar(255) | NO | '-' | |
| `kriteria_penilaian` | json | YES | NULL | |
| `list_kesesuaian_tema` | json | YES | NULL | |
| `ignore_kegiatan_dates` | tinyint(1) | NO | 0 | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |

### 2.14 `mahasiswa`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `mhswa_id` | bigint unsigned | NO | auto | PK |
| `nim` | int unsigned | NO | — | |
| `nama` | varchar(255) | NO | — | |
| `email` | varchar(255) | YES | NULL | |
| `no_hp` | varchar(255) | YES | NULL | |
| `prodi_id` | bigint unsigned | NO | — | FK → prodi.prodi_id |
| `avatar` | text | YES | NULL | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |
| `deleted_at` | timestamp | YES | NULL | SoftDeletes |

### 2.15 `kolaborator`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `kolab_id` | bigint unsigned | NO | auto | PK |
| `nidn` | int unsigned | YES | NULL | |
| `nuptk` | int unsigned | YES | NULL | |
| `email` | varchar(255) | NO | — | |
| `no_hp` | varchar(255) | NO | — | |
| `nama` | varchar(255) | NO | — | |
| `prodi` | varchar(255) | NO | — | |
| `institusi` | varchar(255) | NO | — | |
| `avatar` | text | YES | NULL | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |
| `deleted_at` | timestamp | YES | NULL | SoftDeletes |

### 2.16 `peneliti_details`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint unsigned | NO | auto | PK |
| `user_id` | bigint unsigned | YES | NULL | FK → users.id CASCADE; UNIQUE |
| `kolab_id` | bigint unsigned | YES | NULL | FK → kolaborator.kolab_id CASCADE; UNIQUE |
| `jabatan` | varchar(255) | YES | NULL | |
| `pangkat_golongan` | varchar(255) | YES | NULL | |
| `no_hp` | varchar(255) | YES | NULL | |
| `sinta_id` | varchar(255) | YES | NULL | |
| `scopus_id` | varchar(255) | YES | NULL | |
| `google_scholar_id` | varchar(255) | YES | NULL | |
| `h_index` | decimal(5,2) | YES | NULL | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |

### 2.17 `publications`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint unsigned | NO | auto | PK |
| `peneliti_detail_id` | bigint unsigned | NO | — | FK → peneliti_details.id CASCADE |
| `jenis_jurnal` | varchar(255) | YES | NULL | |
| `judul` | varchar(255) | NO | — | |
| `peran` | enum('first_author','corresponding_author','co_author') | NO | — | |
| `nama_jurnal` | varchar(255) | NO | — | |
| `tahun` | year | NO | — | |
| `volume` | varchar(255) | YES | NULL | |
| `issn` | varchar(255) | YES | NULL | |
| `doi` | varchar(255) | YES | NULL | |
| `url` | text | YES | NULL | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |
| `pub_category_id` | bigint unsigned | YES | NULL | FK → publication_categories.pub_category_id nullOnDelete |
| `peringkat` | varchar(255) | YES | NULL | |

### 2.18 `publication_categories`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `pub_category_id` | bigint unsigned | NO | auto | PK |
| `nama` | varchar(255) | NO | — | |
| `peringkat` | json | YES | NULL | |
| `urutan` | int unsigned | NO | 0 | |
| `is_active` | tinyint(1) | NO | 1 | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |

### 2.19 `books`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint unsigned | NO | auto | PK |
| `peneliti_detail_id` | bigint unsigned | NO | — | FK → peneliti_details.id CASCADE |
| `judul` | varchar(255) | NO | — | |
| `tahun` | year | NO | — | |
| `isbn` | varchar(255) | YES | NULL | |
| `penerbit` | varchar(255) | YES | NULL | |
| `url` | text | YES | NULL | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |

### 2.20 `hkis`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint unsigned | NO | auto | PK |
| `peneliti_detail_id` | bigint unsigned | NO | — | FK → peneliti_details.id CASCADE |
| `judul` | varchar(255) | NO | — | |
| `tahun` | year | NO | — | |
| `jenis` | varchar(255) | YES | NULL | |
| `nomor` | varchar(255) | YES | NULL | |
| `status` | enum('terdaftar','granted') | NO | — | |
| `url` | text | YES | NULL | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |

### 2.21 `research_histories`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint unsigned | NO | auto | PK |
| `peneliti_detail_id` | bigint unsigned | NO | — | FK → peneliti_details.id CASCADE |
| `kategori` | enum('kemdikbud','internal') | NO | — | |
| `judul` | varchar(255) | NO | — | |
| `tahun` | year | NO | — | |
| `dana_disetujui` | decimal(18,2) | NO | — | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |

### 2.22 `logbook_pengerjaan`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `logbook_id` | bigint unsigned | NO | auto | PK |
| `laporan_id` | bigint unsigned | NO | — | FK → laporan.laporan_id |
| `user_id` | bigint unsigned | NO | — | FK → users.id |
| `judul` | varchar(255) | NO | — | |
| `deskripsi` | text | NO | — | |
| `tgl_kegiatan` | date | NO | — | |
| `lampiran_drive_id` | text | YES | NULL | |
| `lampiran_drive_url` | text | YES | NULL | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |

### 2.23 `realisasi_anggaran`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint unsigned | NO | auto | PK |
| `laporan_id` | bigint unsigned | NO | — | FK → laporan.laporan_id CASCADE |
| `item_kebutuhan` | varchar(255) | NO | — | |
| `satuan` | varchar(255) | NO | — | |
| `jumlah_item` | int | NO | — | |
| `harga_satuan` | decimal(15,2) | NO | — | |
| `total` | decimal(15,2) | NO | — | Auto-computed: jumlah_item * harga_satuan |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |

### 2.24 `sitasi`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `sitasi_id` | bigint unsigned | NO | auto | PK |
| `laporan_id` | bigint unsigned | NO | — | FK → laporan.laporan_id CASCADE |
| `judul_sitasi` | varchar(255) | NO | — | |
| `sumber` | varchar(255) | YES | NULL | |
| `tahun` | year | YES | NULL | |
| `url` | text | YES | NULL | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |
| `deleted_at` | timestamp | YES | NULL | SoftDeletes |

### 2.25 `notifications`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `notification_id` | bigint unsigned | NO | auto | PK |
| `user_id` | bigint unsigned | NO | — | FK → users.id CASCADE |
| `type` | varchar(100) | NO | — | |
| `title` | varchar(255) | NO | — | |
| `message` | text | NO | — | |
| `data` | json | YES | NULL | |
| `action_url` | varchar(500) | YES | NULL | |
| `key` | varchar(255) | YES | NULL | UNIQUE |
| `read_at` | timestamp | YES | NULL | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |

### 2.26 `scholar_profiles`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `scholar_profile_id` | bigint unsigned | NO | auto | PK |
| `user_id` | bigint unsigned | NO | — | FK → users.id CASCADE; UNIQUE |
| `scholar_author_id` | varchar(255) | NO | — | UNIQUE |
| `profile_url` | varchar(255) | NO | — | |
| `display_name` | varchar(255) | YES | NULL | |
| `affiliation` | varchar(255) | YES | NULL | |
| `total_citations` | int unsigned | NO | 0 | |
| `h_index` | int unsigned | NO | 0 | |
| `i10_index` | int unsigned | NO | 0 | |
| `sync_status` | enum('pending','syncing','success','failed') | NO | 'pending' | |
| `last_synced_at` | timestamp | YES | NULL | |
| `last_sync_error` | text | YES | NULL | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |

### 2.27 `scholar_publications`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `publication_id` | bigint unsigned | NO | auto | PK |
| `scholar_profile_id` | bigint unsigned | NO | — | FK → scholar_profiles.scholar_profile_id CASCADE |
| `external_id` | varchar(255) | YES | NULL | |
| `title` | varchar(255) | NO | — | |
| `authors` | text | YES | NULL | |
| `publication_name` | varchar(255) | YES | NULL | |
| `publication_year` | smallint unsigned | YES | NULL | |
| `citation_count` | int unsigned | NO | 0 | |
| `publication_url` | varchar(255) | YES | NULL | |
| `last_synced_at` | timestamp | YES | NULL | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |

### 2.28 `scholar_citations_by_year`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `citation_id` | bigint unsigned | NO | auto | PK |
| `scholar_profile_id` | bigint unsigned | NO | — | FK → scholar_profiles.scholar_profile_id CASCADE; UNIQUE(scholar_profile_id, year) |
| `year` | smallint unsigned | NO | — | |
| `citation_count` | int unsigned | NO | 0 | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |

### 2.29 `scholar_publication_citations_by_year`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `publication_citation_id` | bigint unsigned | NO | auto | PK |
| `scholar_publication_id` | bigint unsigned | NO | — | No FK constraint (implied → scholar_publications.publication_id) |
| `year` | smallint unsigned | NO | — | UNIQUE(scholar_publication_id, year) |
| `citation_count` | int unsigned | NO | 0 | |
| `last_synced_at` | timestamp | YES | NULL | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |

### 2.30 `kegiatan_edit_requests`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | bigint unsigned | NO | auto | PK |
| `kegiatan_id` | bigint unsigned | NO | — | FK → kegiatan_pengajuan.kegiatan_id CASCADE |
| `requested_by` | bigint unsigned | NO | — | FK → users.id CASCADE |
| `current_tgl_mulai` | date | NO | — | |
| `current_tgl_selesai` | date | NO | — | |
| `proposed_tgl_mulai` | date | NO | — | |
| `proposed_tgl_selesai` | date | NO | — | |
| `reason` | text | NO | — | |
| `status` | enum('Menunggu Otorisasi','Disetujui','Ditolak') | NO | 'Menunggu Otorisasi' | |
| `reviewed_by` | bigint unsigned | YES | NULL | FK → users.id nullOnDelete |
| `reviewed_at` | timestamp | YES | NULL | |
| `review_note` | text | YES | NULL | |
| `executed_by` | bigint unsigned | YES | NULL | FK → users.id nullOnDelete |
| `executed_at` | timestamp | YES | NULL | |
| `created_at` | timestamp | YES | NULL | |
| `updated_at` | timestamp | YES | NULL | |

---

## 3. Foreign Key Inventory

### 3.1 Database-Enforced Foreign Keys (33)

| # | Source Table | Source Column | Target Table | Target Column | On Delete | On Update |
|---|-------------|---------------|-------------|---------------|-----------|-----------|
| 1 | `kegiatan_pengajuan` | `skema_id` | `skema` | `skema_id` | CASCADE | — |
| 2 | `proposal` | `user_id` | `users` | `id` | RESTRICT | — |
| 3 | `proposal` | `kegiatan_id` | `kegiatan_pengajuan` | `kegiatan_id` | CASCADE | — |
| 4 | `proposal` | `kegiatan_id` | `kegiatan_pengajuan` | `kegiatan_id` | RESTRICT | — |
| 5 | `proposal_member` | `proposal_id` | `proposal` | `proposal_id` | RESTRICT | — |
| 6 | `laporan` | `proposal_id` | `proposal` | `proposal_id` | RESTRICT | — |
| 7 | `laporan` | `kegiatan_id` | `kegiatan_pengajuan` | `kegiatan_id` | CASCADE | — |
| 8 | `laporan` | `kegiatan_id` | `kegiatan_pengajuan` | `kegiatan_id` | SET NULL | — |
| 9 | `laporan` | `current_logbook_id` | `logbook_pengerjaan` | `logbook_id` | RESTRICT | — |
| 10 | `laporan_member` | `laporan_id` | `laporan` | `laporan_id` | CASCADE | — |
| 11 | `dokumen_version` | `dokumen_id` | `dokumen` | `dokumen_id` | RESTRICT | — |
| 12 | `penugasan_reviewer` | `proposal_id` | `proposal` | `proposal_id` | SET NULL | — |
| 13 | `penugasan_reviewer` | `user_id` | `users` | `id` | RESTRICT | — |
| 14 | `review` | `penugasan_id` | `penugasan_reviewer` | `penugasan_id` | RESTRICT | — |
| 15 | `settings` | `kepala_lppm` | `users` | `id` | RESTRICT | — |
| 16 | `settings` | `rektor` | `users` | `id` | RESTRICT | — |
| 17 | `mahasiswa` | `prodi_id` | `prodi` | `prodi_id` | RESTRICT | — |
| 18 | `peneliti_details` | `user_id` | `users` | `id` | CASCADE | — |
| 19 | `peneliti_details` | `kolab_id` | `kolaborator` | `kolab_id` | CASCADE | — |
| 20 | `publications` | `peneliti_detail_id` | `peneliti_details` | `id` | CASCADE | — |
| 21 | `publications` | `pub_category_id` | `publication_categories` | `pub_category_id` | SET NULL | — |
| 22 | `books` | `peneliti_detail_id` | `peneliti_details` | `id` | CASCADE | — |
| 23 | `hkis` | `peneliti_detail_id` | `peneliti_details` | `id` | CASCADE | — |
| 24 | `research_histories` | `peneliti_detail_id` | `peneliti_details` | `id` | CASCADE | — |
| 25 | `logbook_pengerjaan` | `laporan_id` | `laporan` | `laporan_id` | RESTRICT | — |
| 26 | `logbook_pengerjaan` | `user_id` | `users` | `id` | RESTRICT | — |
| 27 | `realisasi_anggaran` | `laporan_id` | `laporan` | `laporan_id` | CASCADE | — |
| 28 | `sitasi` | `laporan_id` | `laporan` | `laporan_id` | CASCADE | — |
| 29 | `notifications` | `user_id` | `users` | `id` | CASCADE | — |
| 30 | `scholar_profiles` | `user_id` | `users` | `id` | CASCADE | — |
| 31 | `scholar_citations_by_year` | `scholar_profile_id` | `scholar_profiles` | `scholar_profile_id` | CASCADE | — |
| 32 | `scholar_publications` | `scholar_profile_id` | `scholar_profiles` | `scholar_profile_id` | CASCADE | — |
| 33 | `scholar_publication_citations_by_year` | `scholar_publication_id` | `scholar_publications` | `publication_id` | CASCADE | — |
| 34 | `kegiatan_edit_requests` | `kegiatan_id` | `kegiatan_pengajuan` | `kegiatan_id` | CASCADE | — |
| 35 | `kegiatan_edit_requests` | `requested_by` | `users` | `id` | CASCADE | — |
| 36 | `kegiatan_edit_requests` | `reviewed_by` | `users` | `id` | SET NULL | — |
| 37 | `kegiatan_edit_requests` | `executed_by` | `users` | `id` | SET NULL | — |
| 38 | `authorization_requests` | `requested_by` | `users` | `id` | CASCADE | — |
| 39 | `authorization_requests` | `reviewed_by` | `users` | `id` | SET NULL | — |

### 3.2 Eloquent-Only Relationships (No DB Constraint, 14)

| # | Model | Method | Type | Local Column | Related Model | Related Column | Notes |
|---|-------|--------|------|-------------|---------------|----------------|-------|
| 1 | `Dokumen` | `currentVersion()` | belongsTo | `current_version_id` | `DokumenVersion` | `version_id` | No FK constraint |
| 2 | `DokumenVersion` | `uploader()` | belongsTo | `uploaded_by` | `User` | `id` | No FK constraint |
| 3 | `Laporan` | `dana_disetujui_by_user()` | belongsTo | `dana_disetujui_by` | `User` | `id` | No FK constraint |
| 4 | `Proposal` | `prodi()` | belongsTo | `prodi_id` | `Prodi` | `prodi_id` | Convention-based, no FK |
| 5 | `Notification` | `user()` | belongsTo | `user_id` | `User` | `id` | Convention-based, no FK |
| 6 | `Book` | `penelitiDetail()` | belongsTo | `peneliti_detail_id` | `PenelitiDetail` | `id` | Convention-based, no FK |
| 7 | `Hki` | `penelitiDetail()` | belongsTo | `peneliti_detail_id` | `PenelitiDetail` | `id` | Convention-based, no FK |
| 8 | `ResearchHistory` | `penelitiDetail()` | belongsTo | `peneliti_detail_id` | `PenelitiDetail` | `id` | Convention-based, no FK |
| 9 | `PenelitiDetail` | `publications()` | hasMany | `id` | `Publication` | `peneliti_detail_id` | Convention-based |
| 10 | `PenelitiDetail` | `books()` | hasMany | `id` | `Book` | `peneliti_detail_id` | Convention-based |
| 11 | `PenelitiDetail` | `hkis()` | hasMany | `id` | `Hki` | `peneliti_detail_id` | Convention-based |
| 12 | `PenelitiDetail` | `researchHistories()` | hasMany | `id` | `ResearchHistory` | `peneliti_detail_id` | Convention-based |
| 13 | `ScholarPublication` | `citationsByYear()` | hasMany | `publication_id` | `ScholarPublicationCitationByYear` | `scholar_publication_id` | No FK constraint in DB |
| 14 | `LaporanMember` | `user()` | belongsTo | `member_id` | `User` | `id` | Polymorphic-style via role |

### 3.3 Polymorphic Relationships (3)

| Morph Name | Owner Models | Owned Model | FK Columns |
|------------|-------------|-------------|------------|
| `documentable` | `Proposal`, `KegiatanPengajuan`, `Laporan` | `Dokumen` | `documentable_id` + `documentable_type` |
| `reviewable` | `Proposal`, `Laporan` | `PenugasanReviewer` | `reviewable_id` + `reviewable_type` |
| `requestable` | `Proposal`, `Laporan` | `AuthorizationRequest` | `requestable_id` + `requestable_type` |

---

## 4. Status & Workflow Enums

### 4.1 `proposal.status` (12 values)

```
Draft → Ditolak | Ditarik | Menunggu proposal untuk diupload | Menunggu review dari Ketua LPPM |
Menunggu review Staff LPPM | Menunggu penugasan reviewer | Menunggu review |
Menunggu persetujuan Ketua LPPM | Proposal Diterima | Dalam pengerjaan | Revisi
```

### 4.2 `laporan.status` (14 values)

```
Belum dimulai | Dalam pengerjaan | Menunggu kelengkapan data | Menunggu review Admin |
Menunggu review Staff LPPM | Menunggu review | Menunggu hasil dari Reviewers |
Menuggu penugasan Reviewer | Menunggu keputusan Ketua | Menunggu Persetujuan Ketua LPPM |
Menunggu konfirmasi pengiriman dana | Menunggu konfirmasi penerimaan dana | Revisi | Selesai
```

### 4.3 `skema.status` (3 values)

```
Draft → Aktif → Selesai
```

### 4.4 `kegiatan_pengajuan.status` (3 values)

```
Belum dibuka → Terbuka → Selesai
```

### 4.5 `users.role` (6 values)

```
Superadmin | Staff LPPM | Ketua LPPM | Dosen | Reviewer | Rektorat
```

### 4.6 `penugasan_reviewer.status_review` (2 values)

```
Belum direview → Telah direview
```

### 4.7 `review.keputusan` (3 values)

```
Diterima | Diterima dengan perbaikan | Ditolak
```

### 4.8 `scholar_profiles.sync_status` (4 values)

```
pending → syncing → success | failed
```

---

## 5. Index Inventory

### 5.1 Unique Indexes

| Table | Columns | Index Name |
|-------|---------|------------|
| `users` | `email` | `users_email_unique` |
| `kegiatan_pengajuan` | `skema_id, jenis_penelitian, kode_kegiatan` | `periode_pengajuan_skema_id_jenis_penelitian_kode_periode_unique` |
| `laporan` | `proposal_id, semester` | `laporan_proposal_id_semester_unique` |
| `notifications` | `key` | `notifications_key_unique` |
| `peneliti_details` | `user_id` | `peneliti_details_user_id_unique` |
| `peneliti_details` | `kolab_id` | `peneliti_details_kolab_id_unique` |
| `scholar_profiles` | `user_id` | `scholar_profiles_user_id_unique` |
| `scholar_profiles` | `scholar_author_id` | `scholar_profiles_scholar_author_id_unique` |
| `scholar_citations_by_year` | `scholar_profile_id, year` | `scholar_citations_by_year_scholar_profile_id_year_unique` |
| `scholar_publication_citations_by_year` | `scholar_publication_id, year` | `spub_cit_pub_year_ux` |
| `personal_access_tokens` | `token` | `personal_access_tokens_token_unique` |
| `failed_jobs` | `uuid` | `failed_jobs_uuid_unique` |

### 5.2 Non-Unique Indexes (43 total)

| Table | Columns | Index Name |
|-------|---------|------------|
| `dokumen` | `documentable_id, documentable_type` | `dokumen_documentable_index` |
| `penugasan_reviewer` | `user_id` | `penugasan_reviewer_user_id_foreign` |
| `penugasan_reviewer` | `reviewable_type, reviewable_id` | `penugasan_reviewer_reviewable_type_reviewable_id_index` |
| `penugasan_reviewer` | `proposal_id` | `penugasan_reviewer_proposal_id_foreign` |
| `proposal` | `user_id` | `proposal_user_id_foreign` |
| `proposal` | `kegiatan_id` | `proposal_kegiatan_id_foreign` |
| `proposal_member` | `proposal_id` | `proposal_member_proposal_id_foreign` |
| `laporan` | `current_logbook_id` | `laporan_current_logbook_id_foreign` |
| `laporan` | `kegiatan_id` | `laporan_kegiatan_id_foreign` |
| `laporan_member` | `laporan_id, role` | `laporan_member_laporan_id_role_index` |
| `logbook_pengerjaan` | `laporan_id` | `logbook_pengerjaan_laporan_id_foreign` |
| `logbook_pengerjaan` | `user_id` | `logbook_pengerjaan_user_id_foreign` |
| `mahasiswa` | `prodi_id` | `mahasiswa_prodi_id_foreign` |
| `notifications` | `user_id, read_at` | `notifications_user_id_read_at_index` |
| `notifications` | `created_at` | `notifications_created_at_index` |
| `peneliti_details` | `user_id` | peneliti_details_user_id_unique (index) |
| `peneliti_details` | `kolab_id` | peneliti_details_kolab_id_unique (index) |
| `publications` | `peneliti_detail_id` | `publications_peneliti_detail_id_foreign` |
| `publications` | `pub_category_id` | `publications_pub_category_id_foreign` |
| `books` | `peneliti_detail_id` | `books_peneliti_detail_id_foreign` |
| `hkis` | `peneliti_detail_id` | `hkis_peneliti_detail_id_foreign` |
| `research_histories` | `peneliti_detail_id` | `research_histories_peneliti_detail_id_foreign` |
| `review` | `penugasan_id` | `review_penugasan_id_foreign` |
| `settings` | `kepala_lppm` | `settings_kepala_lppm_foreign` |
| `settings` | `rektor` | `settings_rektor_foreign` |
| `sitasi` | `laporan_id` | `sitasi_laporan_id_foreign` |
| `realisasi_anggaran` | `laporan_id` | `realisasi_anggaran_laporan_id_index` |
| `scholar_profiles` | `user_id` | scholarship_profiles_user_id_index |
| `scholar_publications` | `scholar_profile_id` | `scholar_publications_scholar_profile_id_index` |
| `scholar_publications` | `external_id` | `scholar_publications_external_id_index` |
| `scholar_publication_citations_by_year` | `scholar_publication_id` | `spub_cit_pub_ix` |
| `sessions` | `user_id` | `sessions_user_id_index` |
| `sessions` | `last_activity` | `sessions_last_activity_index` |
| `jobs` | `queue` | `jobs_queue_index` |
| `cache` | `expiration` | `cache_expiration_index` |
| `cache_locks` | `expiration` | `cache_locks_expiration_index` |
| `personal_access_tokens` | `tokenable_type, tokenable_id` | `personal_access_tokens_tokenable_type_tokenable_id_index` |
| `personal_access_tokens` | `expires_at` | `personal_access_tokens_expires_at_index` |
| `kegiatan_edit_requests` | `kegiatan_id` | `kegiatan_edit_requests_kegiatan_id_foreign` |
| `kegiatan_edit_requests` | `requested_by` | `kegiatan_edit_requests_requested_by_foreign` |
| `kegiatan_edit_requests` | `reviewed_by` | `kegiatan_edit_requests_reviewed_by_foreign` |
| `kegiatan_edit_requests` | `executed_by` | `kegiatan_edit_requests_executed_by_foreign` |
| `authorization_requests` | `requested_by` | `authorization_requests_requested_by_foreign` |
| `authorization_requests` | `reviewed_by` | `authorization_requests_reviewed_by_foreign` |
| `authorization_requests` | `requestable_type, requestable_id` | `authorization_requests_requestable_type_requestable_id_index` |

---

## 6. SoftDeletes Usage

| Table | Model |
|-------|-------|
| `users` | `User` |
| `prodi` | `Prodi` |
| `skema` | `Skema` |
| `kegiatan_pengajuan` | `KegiatanPengajuan` |
| `proposal` | `Proposal` |
| `laporan` | `Laporan` |
| `dokumen` | `Dokumen` |
| `dokumen_version` | `DokumenVersion` |
| `penugasan_reviewer` | `PenugasanReviewer` |
| `review` | `Review` |
| `kolaborator` | `Kolaborator` |
| `mahasiswa` | `Mahasiswa` |
| `sitasi` | `Sitasi` |

---

## 7. Migration/Database Discrepancies

| # | Issue | Tables Involved | Description |
|---|-------|----------------|-------------|
| 1 | **Duplicate FK on `laporan.kegiatan_id`** | `laporan` | Two FK constraints exist: one CASCADE (from `add_kegiatan_foreign_keys`), one SET NULL (from `add_periode_id_to_laporan_table`). MariaDB retains both. |
| 2 | **Duplicate FK on `proposal.kegiatan_id`** | `proposal` | Two FK constraints exist: one CASCADE (from `add_kegiatan_foreign_keys`), one RESTRICT (from original `create_proposal_table`). MariaDB retains both. |
| 3 | **Missing FK on `dokumen.current_version_id`** | `dokumen` | Eloquent `currentVersion()` belongsTo implies FK to `dokumen_version.version_id`, but migration `alter_columns_from_dokumen.php` uses `foreignId()->nullable()` without `->constrained()`. No DB-level FK enforced. |
| 4 | **Missing FK on `dokumen_version.uploaded_by`** | `dokumen_version` | Implies reference to `users.id` but migration uses `foreignId()` without `->constrained()`. No DB-level FK enforced. |

---

## 8. Unresolved Schema Questions

| # | Question | Context |
|---|----------|---------|
| 1 | **Why does `laporan` have `pengembalian_dana_skipped_reason`?** | This field was added for PkM Pengembalian Dana workflow (Phase 5) to store the skip reason when no dana was received. Needs documentation in thesis. |
| 2 | **Why is `proposal.periode_id` FK still present alongside `proposal.kegiatan_id`?** | The rename migration `rename_periode_to_kegiatan.php` drops all FKs referencing `periode_pengajuan` then recreates with `kegiatan_id`, but the original `create_proposal_table.php` created a FK named `proposal_periode_id_foreign`. The rename migration may not have dropped this specific FK name. |
| 3 | **Why does `laporan` have TWO FK constraints on `kegiatan_id`?** | One from `add_kegiatan_foreign_keys.php` (CASCADE) and one from `add_periode_id_to_laporan_table.php` (SET NULL). The second was added before the rename but survived the rename. Both are active in the live DB. |
