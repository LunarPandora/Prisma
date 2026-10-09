<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Proposal;
use App\Models\Laporan;
use App\Models\PenugasanReviewer;
use App\Models\Review;
use App\Models\Dokumen;
use App\Models\DokumenVersion;
use App\Models\LogbookPengerjaan;
use App\Models\RealisasiAnggaran;
use App\Models\KegiatanPengajuan;
use App\Models\AuthorizationRequest;
use App\Models\Prodi;
use Illuminate\Support\Str;

class E2EDataSeeder extends Seeder
{
    private int $proposalCount = 0;
    private int $laporanCount = 0;
    private int $penugasanCount = 0;
    private int $reviewCount = 0;
    private int $dokumenCount = 0;
    private int $logbookCount = 0;
    private int $raCount = 0;

    private array $dosenUsers = [];
    private array $reviewerUsers = [];
    private array $allKegiatan = [];

    private array $juduls = [
        'Analisis Sentimen Ulasan Produk pada Marketplace Indonesia',
        'Sistem Rekomendasi Collaborative Filtering untuk E-Commerce',
        'Penerapan Computer Vision untuk Identifikasi Hama Padi',
        'Prediksi Cuaca Menggunakan LSTM Network',
        'Optimasi Algoritma Genetika untuk Penjadwalan Produksi',
        'Deteksi Deepfake pada Media Sosial Menggunakan CNN',
        'Pengembangan Sistem Parkir Cerdas Berbasis IoT',
        'Analisis Risk Management pada Perbankan Syariah',
        'Deteksi Penipuan Kartu Kredit Menggunakan Machine Learning',
        'Monitoring Kualitas Udara Real-Time Berbasis Sensor',
        'Aplikasi Telemedicine untuk Daerah Terpencil',
        'Blockchain untuk Sertifikasi Dokumen Akademik',
        'Sistem Presensi Wajah Menggunakan Face Recognition',
        'Analisis Kepuasan Mahasiswa Pembelajaran Daring',
        'Game Edukasi untuk Belajar Matematika',
        'Optimasi Rute Logistik Menggunakan Algoritma Ant Colony',
        'Deteksi Kebakaran Hutan Berbasis Drone dan AI',
        'Chatbot Layanan Akademik Menggunakan NLP',
        'Portofolio Investasi Menggunakan Reinforcement Learning',
        'Sensor Wearable untuk Monitoring Kesehatan Jantung',
        'Pengenalan Emosi dari Suara Menggunakan Deep Learning',
        'Smart Agriculture untuk Optimasi Irigasi',
        'Prediksi Demam Berdarah Menggunakan Big Data Analytics',
        'Microcontroller-Based Weather Station',
        'Rekomendasi Resep Masakan Indonesia Berbasis Nutrisi',
        'Virtual Reality untuk Simulasi Laboratorium Kimia',
        'Fraud Detection pada Asuransi Menggunakan ML',
        'Augmented Reality untuk Buku Teks Interaktif',
        'Monitoring Kesehatan Petani Berbasis Mobile',
        'Sistem Informasi Geografis untuk Wisata Kota',
    ];

    private array $topics = ['Kecerdasan Buatan','Internet of Things','Machine Learning','Data Mining','Cyber Security','Cloud Computing','Big Data','Blockchain','Computer Vision','NLP'];
    private array $bidang = ['Teknik Informatika','Sistem Informasi','Ilmu Komputer','Teknologi Informasi','Bisnis Digital','Rekayasa Perangkat Lunak'];
    private array $sdgs = ['SDG 1: No Poverty','SDG 2: Zero Hunger','SDG 3: Good Health','SDG 4: Quality Education','SDG 8: Decent Work','SDG 9: Industry Innovation','SDG 11: Sustainable Cities','SDG 12: Responsible Consumption','SDG 13: Climate Action','SDG 17: Partnerships'];

    public function run(): void
    {
        $this->loadUsers();
        $this->loadKegiatan();

        // Proposals — all 12 statuses (at least 10 each)
        $this->seedProposals('Draft', 10);
        $this->seedProposals('Menunggu proposal untuk diupload', 8);
        $this->seedProposals('Menunggu review dari Ketua LPPM', 6);
        $this->seedProposals('Menunggu review Staff LPPM', 5);
        $this->seedProposals('Menunggu penugasan reviewer', 4);
        $this->seedProposals('Menunggu review', 6, true);
        $this->seedProposals('Menunggu persetujuan Ketua LPPM', 5, true, true);
        $this->seedAcceptedProposals(15);
        $this->seedActiveProposals(35);  // 35 fresh active proposals for laporans
        $this->seedProposals('Ditolak', 5);
        $this->seedProposals('Revisi', 5, false, false, true);
        $this->seedProposals('Ditarik', 2);

        // Laporans — all 14 statuses (at least 3 each)
        $this->seedLaporansByStatus('Belum dimulai', 5);
        $this->seedActiveLaporans(10);
        $this->seedLaporansByStatus('Menunggu kelengkapan data', 4);
        $this->seedLaporansByStatus('Menunggu review Admin', 4, true);
        $this->seedLaporansByStatus('Menunggu review Staff LPPM', 4, false, false);
        $this->seedLaporansByStatus('Menunggu review dari Ketua LPPM', 3, false, false, true);
        $this->seedLaporansByStatus('Menuggu penugasan Reviewer', 3, false, true, true);
        $this->seedLaporansWithReviewers('Menunggu hasil dari Reviewers', 3, false);
        $this->seedLaporansWithReviewers('Menunggu keputusan Ketua', 3, true);
        $this->seedLaporansByStatus('Menunggu Persetujuan Ketua LPPM', 3, false, false, false, false, true);
        $this->seedLaporansByStatus('Menunggu konfirmasi pengiriman dana', 3, false, false, false, false, false, true);
        $this->seedLaporansByStatus('Menunggu konfirmasi penerimaan dana', 3, false, false, false, false, false, false, true);
        $this->seedLaporansByStatus('Revisi', 3);
        $this->seedSelesaiLaporans(5);
        $this->seedPkMLaporans(8);

        // Specific fixtures for mutation/visibility tests
        $this->seedTestFixtures();

        $total = $this->proposalCount + $this->laporanCount + $this->penugasanCount
            + $this->reviewCount + $this->dokumenCount + $this->logbookCount + $this->raCount;
        $this->command->info("E2EDataSeeder done — Proposals:{$this->proposalCount} Laporans:{$this->laporanCount} Penugasan:{$this->penugasanCount} Reviews:{$this->reviewCount} Dokumen:{$this->dokumenCount} Logbooks:{$this->logbookCount} RA:{$this->raCount} TOTAL:{$total}");
    }

    // ── loaders ──────────────────────────────────────────────────────

    private function loadUsers(): void
    {
        $this->dosenUsers = User::where('role','Dosen')->pluck('id')->toArray();
        $this->reviewerUsers = User::where('role','Reviewer')->pluck('id')->toArray();
    }

    private function loadKegiatan(): void
    {
        foreach (KegiatanPengajuan::all() as $k) {
            $this->allKegiatan[$k->kode_kegiatan][$k->kegiatan_id] = true;
        }
    }

    private function keg(string $code): int
    {
        $ids = array_keys($this->allKegiatan[$code] ?? [1 => true]);
        return $ids[array_rand($ids)];
    }

    private function dosen(): int { return $this->dosenUsers[array_rand($this->dosenUsers)]; }
    private function reviewer(): int { return $this->reviewerUsers[array_rand($this->reviewerUsers)]; }
    private function pick(array $a): string { return $a[array_rand($a)]; }
    private function chance(float $p): bool { return (mt_rand()/mt_getrandmax()) < $p; }

    private function hasLaporan(int $pid, string $sem): bool
    {
        return Laporan::where('proposal_id',$pid)->where('semester',$sem)->exists();
    }

    // ── proposal factories ───────────────────────────────────────────

    private function proposalAttrs(string $status, int $kegId): array
    {
        $j = $this->pick($this->juduls);
        $now = now();
        $ketuaOk = in_array($status, ['Menunggu penugasan reviewer','Menunggu review','Menunggu persetujuan Ketua LPPM','Proposal Diterima','Dalam pengerjaan']);
        $staffOk = in_array($status, ['Menunggu review dari Ketua LPPM','Menunggu penugasan reviewer','Menunggu review','Menunggu persetujuan Ketua LPPM','Proposal Diterima','Dalam pengerjaan']);

        return [
            'user_id' => $this->dosen(), 'kegiatan_id' => $kegId,
            'jenis_penelitian' => 'Penelitian', 'jenis_penelitian_gan' => 'Penelitian', 'jenis_penelitian_gen' => 'Penelitian',
            'judul' => $j, 'topik_penelitian' => $this->pick($this->topics), 'bidang_ilmu' => $this->pick($this->bidang), 'fokus_sdg' => $this->pick($this->sdgs),
            'ra_biaya_penelitian_gan' => rand(5e6,5e7), 'ra_biaya_publikasi_gan' => rand(2e6,15e6), 'ra_insentif_gan' => rand(1e6,5e6),
            'ra_biaya_penelitian_gen' => rand(5e6,5e7), 'ra_biaya_publikasi_gen' => rand(2e6,15e6), 'ra_insentif_gen' => rand(1e6,5e6),
            'target_publikasi_gan' => 'Scopus Q2', 'target_publikasi_gen' => 'Internasional',
            'rencana_judul_publikasi_gan' => "Publikasi {$j} (Ganjil)", 'rencana_judul_publikasi_gen' => "Publikasi {$j} (Genap)",
            'metopen_gan' => 'Mixed Methods', 'metopen_gen' => 'Mixed Methods',
            'unit_analisis_gan' => 'UMKM', 'unit_analisis_gen' => 'UMKM',
            'kontribusi_ilmu_makul' => 'Pengembangan model prediksi', 'kontribusi_pkm' => 'Peningkatan kapasitas masyarakat',
            'rencana_luaran' => 'Jurnal Internasional, HKI, Buku', 'institusi_mitra' => 'PT. Teknologi Nusantara',
            'skema' => 'Internal', 'sumber_skema' => 'Dikti', 'status' => $status,
            'tgl_pengajuan' => $now->subDays(rand(1,60))->toDateString(),
            'ketua_seleksi_approved' => $ketuaOk ? 1 : 0, 'staff_seleksi_approved' => $staffOk ? 1 : 0,
            'created_at' => $now->subDays(rand(1,60)), 'updated_at' => $now,
        ];
    }

    // ── proposal seeders ─────────────────────────────────────────────

    private function seedProposals(string $status, int $count, bool $attachReviewers = false, bool $allReviewed = false, bool $withDoc = false): void
    {
        $kegCode = in_array($status, ['Draft','Menunggu proposal untuk diupload','Ditarik']) ? 'PENERIMAAN_PROPOSAL' : 'SELEKSI_PROPOSAL';
        for ($i = 0; $i < $count; $i++) {
            $p = Proposal::create($this->proposalAttrs($status, $this->keg($kegCode)));
            $this->proposalCount++;
            if ($attachReviewers) $this->attachReviewersToProposal($p, $allReviewed);
            if ($withDoc) $this->createDokumen($p->proposal_id, Proposal::class, 'Dokumen Proposal');
        }
    }

    private function seedAcceptedProposals(int $count): void
    {
        $kegId = $this->keg('PENGUMUMAN_SURAT_TUGAS');
        for ($i = 0; $i < $count; $i++) {
            $p = Proposal::create($this->proposalAttrs('Proposal Diterima', $kegId));
            $p->update(['tahap_penelitian' => 'Laporan']);
            $this->proposalCount++;
            $this->createDokumen($p->proposal_id, Proposal::class, 'Dokumen Proposal');
            $this->createDokumen($p->proposal_id, Proposal::class, 'Pengumuman Surat Tugas');
            if (!$this->hasLaporan($p->proposal_id, 'Ganjil')) {
                Laporan::create($this->laporanAttrs('Belum dimulai', $p->proposal_id, $this->keg('PROSES_PENELITIAN_GANJIL'), 'Ganjil'));
                $this->laporanCount++;
            }
        }
    }

    private function seedActiveProposals(int $count): void
    {
        $kegId = $this->keg('PROSES_PENELITIAN_GANJIL');
        for ($i = 0; $i < $count; $i++) {
            $p = Proposal::create($this->proposalAttrs('Dalam pengerjaan', $kegId));
            $p->update(['tahap_penelitian' => 'Laporan']);
            $this->proposalCount++;
            $this->createDokumen($p->proposal_id, Proposal::class, 'Dokumen Proposal');
            $this->createDokumen($p->proposal_id, Proposal::class, 'Pengumuman Surat Tugas');
            // Laporans are created separately by seedActiveLaporans / seedLaporansByStatus
        }
    }

    // ── laporan factories ────────────────────────────────────────────

    private function laporanAttrs(string $status, int $proposalId, int $kegId, string $semester): array
    {
        $p = Proposal::find($proposalId);
        $now = now();
        return [
            'proposal_id' => $proposalId, 'kegiatan_id' => $kegId, 'semester' => $semester,
            'jenis_penelitian' => 'Penelitian', 'judul_penelitian' => $p?->judul ?? $this->pick($this->juduls),
            'metode_penelitian' => 'Mixed Methods', 'unit_analisis' => 'Sampel penelitian',
            'target_publikasi' => 'Scopus Q2', 'nama_jurnal' => 'IEEE Access', 'institusi_mitra' => 'PT. Teknologi Nusantara',
            'status' => $status, 'tgl_mulai' => $now->subDays(rand(1,120))->toDateString(),
            'tgl_submit' => $now->subDays(rand(1,30))->toDateString(),
            'created_at' => $now->subDays(rand(1,120)), 'updated_at' => $now,
        ];
    }

    private function activePids(): array
    {
        // Return all "Dalam pengerjaan" proposals — laporans will be created for the ones that need them
        return Proposal::where('status','Dalam pengerjaan')
            ->where('tahap_penelitian','Laporan')
            ->where('jenis_penelitian','Penelitian')
            ->pluck('proposal_id')->toArray();
    }

    private function freshPid(array &$pids): ?int
    {
        // Pop one proposal at a time, skip if it already has a Ganjil laporan
        while (!empty($pids)) {
            $pid = array_pop($pids);
            if (!$this->hasLaporan($pid, 'Ganjil')) return $pid;
        }
        return null;
    }

    private function seedLaporansByStatus(string $status, int $count, bool $withLink = false, bool $ketuaApproved = false, bool $staffApproved = false, bool $ketuaNotApproved = false, bool $pengirimanDana = false, bool $penerimaanDana = false): void
    {
        $kegCode = $pengirimanDana || $penerimaanDana ? 'CLAIM_DANA_GANJIL' : 'DISEMINASI_GANJIL';
        $pids = $this->activePids();
        if (empty($pids)) return;

        $created = 0;
        $attempts = 0;
        while ($created < $count && $attempts < $count * 5) {
            $attempts++;
            $pid = $this->freshPid($pids);
            if (!$pid) break;
            $extra = [];
            if ($withLink) $extra['link_laporan_akhir'] = 'https://drive.google.com/file/d/sample-laporan';
            if ($ketuaApproved) $extra['ketua_diseminasi_approved'] = 1;
            if ($staffApproved) $extra['staff_diseminasi_approved'] = 1;
            if ($ketuaNotApproved) $extra['ketua_diseminasi_approved'] = 0;
            if ($pengirimanDana) $extra = array_merge($extra, ['claim_dana_status' => 'Menunggu bukti terima', 'dana_disetujui' => 1]);
            if ($penerimaanDana) $extra = array_merge($extra, ['claim_dana_status' => 'Menunggu konfirmasi admin', 'dana_disetujui' => 1]);
            if ($status === 'Revisi') $extra['catatan'] = 'Perlu perbaikan metodologi';
            Laporan::create(array_merge($this->laporanAttrs($status, $pid, $this->keg($kegCode), 'Ganjil'), $extra));
            $this->laporanCount++;
            $created++;
        }
    }

    private function seedActiveLaporans(int $count): void
    {
        $kegId = $this->keg('PROSES_PENELITIAN_GANJIL');
        $pids = $this->activePids();
        if (empty($pids)) return;

        $created = 0;
        $attempts = 0;
        while ($created < $count && $attempts < $count * 5) {
            $attempts++;
            $pid = $this->freshPid($pids);
            if (!$pid) break;
            $l = Laporan::create($this->laporanAttrs('Dalam pengerjaan', $pid, $kegId, 'Ganjil'));
            $this->laporanCount++;
            $userId = Proposal::find($pid)->user_id;
            for ($j = 0; $j < rand(2,5); $j++) {
                LogbookPengerjaan::create([
                    'laporan_id' => $l->laporan_id, 'user_id' => $userId,
                    'judul' => "Logbook ke-" . ($j+1), 'deskripsi' => "Aktivitas penelitian minggu ke-" . ($j+1),
                    'tgl_kegiatan' => now()->subDays(rand(1,30))->toDateString(),
                    'created_at' => now()->subDays(rand(1,30)), 'updated_at' => now(),
                ]);
                $this->logbookCount++;
            }
            $created++;
        }
    }

    private function seedLaporansWithReviewers(string $status, int $count, bool $allReviewed): void
    {
        $pids = $this->activePids();
        if (empty($pids)) return;

        $created = 0;
        $attempts = 0;
        while ($created < $count && $attempts < $count * 5) {
            $attempts++;
            $pid = $this->freshPid($pids);
            if (!$pid) break;
            $l = Laporan::create(array_merge(
                $this->laporanAttrs($status, $pid, $this->keg('DISEMINASI_GANJIL'), 'Ganjil'),
                ['ketua_diseminasi_approved' => 1, 'staff_diseminasi_approved' => 1]
            ));
            $this->laporanCount++;
            $this->attachReviewersToLaporan($l, $allReviewed);
            $created++;
        }
    }

    private function seedSelesaiLaporans(int $count): void
    {
        $kegId = $this->keg('CLAIM_DANA_GANJIL');
        $pids = $this->activePids();
        if (empty($pids)) return;

        $created = 0;
        $attempts = 0;
        while ($created < $count && $attempts < $count * 5) {
            $attempts++;
            $pid = $this->freshPid($pids);
            if (!$pid) break;
            $l = Laporan::create(array_merge(
                $this->laporanAttrs('Selesai', $pid, $kegId, 'Ganjil'),
                ['completed_at' => now()->subDays(rand(1,10)), 'claim_dana_status' => 'Selesai',
                 'pengembalian_dana_status' => 'Selesai', 'dana_disetujui' => 1,
                 'link_laporan_akhir' => 'https://drive.google.com/file/d/sample-selesai',
                 'realisasi_biaya_penelitian' => rand(5e6,5e7), 'realisasi_biaya_publikasi' => rand(2e6,15e6), 'realisasi_insentif' => rand(1e6,5e6)]
            ));
            $this->laporanCount++;
            RealisasiAnggaran::create([
                'laporan_id' => $l->laporan_id, 'item_kebutuhan' => 'Buku Referensi',
                'satuan' => ' pcs', 'jumlah_item' => 5, 'harga_satuan' => 250000,
                'created_at' => now(), 'updated_at' => now(),
            ]);
            $this->raCount++;
            $created++;
        }
    }

    private function seedPkMLaporans(int $count): void
    {
        $statuses = ['Dalam pengerjaan','Dalam pengerjaan','Dalam pengerjaan','Menunggu kelengkapan data','Menunggu review Admin','Selesai','Revisi','Belum dimulai'];
        $pids = $this->activePids();
        if (empty($pids)) return;

        for ($i = 0; $i < $count; $i++) {
            $pid = $pids[array_rand($pids)];
            if ($this->hasLaporan($pid, 'Ganjil')) continue;
            $status = $statuses[$i % count($statuses)];
            $kegCode = match(true) {
                str_contains($status,'Dalam pengerjaan') || str_contains($status,'Belum') => 'PROSES_PENELITIAN_GANJIL',
                str_contains($status,'kelengkapan') || str_contains($status,'review Admin') => 'PUBLIKASI_GANJIL',
                default => 'DISEMINASI_GANJIL',
            };
            $extra = str_contains($status, 'Selesai') ? ['completed_at' => now()->subDays(5), 'claim_dana_status' => 'Selesai', 'pengembalian_dana_status' => 'Selesai', 'dana_disetujui' => 1] : [];
            $l = Laporan::create(array_merge($this->laporanAttrs($status, $pid, $this->keg($kegCode), 'Ganjil'), $extra));
            $this->laporanCount++;

            if (str_contains($status, 'Dalam pengerjaan')) {
                $userId = Proposal::find($pid)->user_id;
                for ($j = 0; $j < rand(1,3); $j++) {
                    LogbookPengerjaan::create([
                        'laporan_id' => $l->laporan_id, 'user_id' => $userId,
                        'judul' => "Logbook PkM ke-" . ($j+1), 'deskripsi' => 'Pelaksanaan pengabdian masyarakat',
                        'tgl_kegiatan' => now()->subDays(rand(1,20))->toDateString(),
                        'created_at' => now()->subDays(rand(1,20)), 'updated_at' => now(),
                    ]);
                    $this->logbookCount++;
                }
            }
        }
    }

    // ── reviewer helpers ─────────────────────────────────────────────

    private function attachReviewersToProposal(Proposal $p, bool $allReviewed): void
    {
        $rids = $this->pickReviewers(3);
        foreach ($rids as $rid) {
            $reviewed = $allReviewed || $this->chance(0.5);
            PenugasanReviewer::create([
                'reviewable_type' => Proposal::class, 'reviewable_id' => $p->proposal_id,
                'proposal_id' => $p->proposal_id, 'tgl_penugasan' => now()->subDays(rand(1,10))->toDateString(),
                'user_id' => $rid, 'status_review' => $reviewed ? 'Telah direview' : 'Belum direview',
                'created_at' => now()->subDays(rand(1,10)), 'updated_at' => now(),
            ]);
            $this->penugasanCount++;
            if ($reviewed) $this->createReviewFor($rid, $p->proposal_id, Proposal::class);
        }
    }

    private function attachReviewersToLaporan(Laporan $l, bool $allReviewed): void
    {
        $rids = $this->pickReviewers(3);
        foreach ($rids as $rid) {
            $reviewed = $allReviewed || $this->chance(0.4);
            PenugasanReviewer::create([
                'reviewable_type' => Laporan::class, 'reviewable_id' => $l->laporan_id,
                'tgl_penugasan' => now()->subDays(rand(1,10))->toDateString(),
                'user_id' => $rid, 'status_review' => $reviewed ? 'Telah direview' : 'Belum direview',
                'created_at' => now()->subDays(rand(1,10)), 'updated_at' => now(),
            ]);
            $this->penugasanCount++;
            if ($reviewed) $this->createReviewFor($rid, $l->laporan_id, Laporan::class);
        }
    }

    private function pickReviewers(int $n): array
    {
        $p = $this->reviewerUsers;
        shuffle($p);
        return array_slice($p, 0, min($n, count($p)));
    }

    private function createReviewFor(int $reviewerId, int $modelId, string $modelClass): void
    {
        $penugasan = PenugasanReviewer::where('user_id', $reviewerId)
            ->where('reviewable_id', $modelId)->where('reviewable_type', $modelClass)
            ->where('status_review', 'Telah direview')->first();
        if (!$penugasan) return;

        $kriteria = [];
        foreach ([['Kesesuaian Tema',30],['Metodologi',30],['Timeline',20],['Anggaran',20]] as [$k,$b]) {
            $skor = rand(1,5);
            $kriteria[] = ['kriteria'=>$k,'bobot'=>$b,'skor'=>$skor,'nilai'=>$b*$skor];
        }
        $kTema = [];
        foreach (['SDGs','Teknologi','Kesehatan','Pendidikan'] as $t) {
            $kTema[] = ['question'=>$t,'checked'=>$this->chance(0.7)];
        }

        $catatan = [
            'Proposal sangat baik dan sesuai tema. Metodologi tepat guna.',
            'Perlu perbaikan timeline. Anggaran sudah sesuai.',
            'Tema relevan dengan kebutuhan industri.',
            'Kualitas cukup baik. Catatan minor perlu diperhatikan.',
            'Potensi kontribusi nyata sangat besar.',
            'Metodologi perlu penguatan analisis statistik.',
            'RAB realistis. Timeline perlu disesuaikan.',
            'Tema relevan SDGs. Luaran sudah jelas.',
        ];

        Review::create([
            'penugasan_id' => $penugasan->penugasan_id,
            'keputusan' => $this->chance(0.7) ? 'Diterima' : 'Ditolak',
            'catatan' => $catatan[array_rand($catatan)],
            'tgl_review' => now()->subDays(rand(1,5))->toDateString(),
            'kriteria_penilaian' => $kriteria, 'kriteria_kesesuaian_tema' => $kTema,
            'created_at' => now()->subDays(rand(1,5)), 'updated_at' => now(),
        ]);
        $this->reviewCount++;
    }

    // ── document helper ──────────────────────────────────────────────

    private function createDokumen(int $id, string $type, string $jenis): void
    {
        $d = Dokumen::create([
            'documentable_id' => $id, 'documentable_type' => $type,
            'jenis_dokumen' => $jenis, 'current_version_id' => 0,
        ]);
        $v = DokumenVersion::create([
            'dokumen_id' => $d->dokumen_id, 'uploaded_by' => $this->dosen(),
            'version' => 1, 'nama_file' => Str::slug($jenis) . '.pdf',
            'local_file_url' => 'uploads/' . Str::uuid() . '.pdf',
            'drive_file_url' => 'https://drive.google.com/file/d/sample-' . Str::slug($jenis),
            'drive_file_id' => 'sample-' . Str::random(10),
            'tgl_upload' => now()->subDays(rand(1,15))->toDateTimeString(),
            'created_at' => now()->subDays(rand(1,15)), 'updated_at' => now(),
        ]);
        $d->update(['current_version_id' => $v->version_id]);
        $this->dokumenCount++;
    }

    // ── specific test fixtures ──────────────────────────────────────

    private function seedTestFixtures(): void
    {
        $this->seedAuthorizationRequests();
        $this->seedSpecificProposalsForTests();
        $this->seedSpecificLaporansForTests();
        $this->seedTestProdi();
        $this->seedTestUsersForSuperadmin();
    }

    private function seedAuthorizationRequests(): void
    {
        $staffId = User::where('email', 'staff.lppm1@itbss.ac.id')->value('id');
        $ketuaId = User::where('email', 'ketua.lppm@itbss.ac.id')->value('id');
        if (!$staffId || !$ketuaId) return;

        // Skip if E2EKetuaSeeder (or another seeder) already created proposal auth requests
        $hasReturn = AuthorizationRequest::where('requestable_type', Proposal::class)
            ->where('action', 'return_proposal_for_revision')->exists();
        $hasReject = AuthorizationRequest::where('requestable_type', Proposal::class)
            ->where('action', 'reject_proposal')->exists();

        // Find a proposal at "Menunggu review Staff LPPM" for return request
        if (!$hasReturn) {
            $returnProposal = Proposal::where('status', 'Menunggu review Staff LPPM')->first();
            if ($returnProposal) {
                AuthorizationRequest::firstOrCreate(
                    [
                        'requestable_type' => Proposal::class,
                        'requestable_id' => $returnProposal->proposal_id,
                        'action' => 'return_proposal_for_revision',
                    ],
                    [
                        'requested_by' => $staffId,
                        'source_stage' => 'SELEKSI_PROPOSAL',
                        'target_stage' => 'REVISI',
                        'reason' => 'Perlu perbaikan metodologi penelitian',
                        'status' => 'Menunggu Persetujuan',
                        'current_data' => ['status' => $returnProposal->status],
                        'proposed_data' => ['status' => 'Revisi'],
                    ]
                );
            }
        }

        // Find a proposal at "Menunggu review Staff LPPM" for reject request
        if (!$hasReject) {
            $rejectProposal = Proposal::where('status', 'Menunggu review Staff LPPM')->first();
            if ($rejectProposal) {
                AuthorizationRequest::firstOrCreate(
                    [
                        'requestable_type' => Proposal::class,
                        'requestable_id' => $rejectProposal->proposal_id,
                        'action' => 'reject_proposal',
                    ],
                    [
                        'requested_by' => $staffId,
                        'source_stage' => 'SELEKSI_PROPOSAL',
                        'target_stage' => 'DITOLAK',
                        'reason' => 'Tidak memenuhi kriteria penelitian',
                        'status' => 'Menunggu Persetujuan',
                        'current_data' => ['status' => $rejectProposal->status],
                        'proposed_data' => ['status' => 'Ditolak'],
                    ]
                );
            }
        }
    }

    private function seedSpecificProposalsForTests(): void
    {
        $kegId = $this->keg('SELEKSI_PROPOSAL');
        $reviewerUsers = $this->reviewerUsers;
        if (count($reviewerUsers) < 3) return;

        // ST-PROP-SEL-MUT-001: Proposal at "Menunggu review Staff LPPM" with staff_seleksi_approved=0
        Proposal::create(array_merge(
            $this->proposalAttrs('Menunggu review Staff LPPM', $kegId),
            ['staff_seleksi_approved' => 0, 'ketua_seleksi_approved' => 0]
        ));
        $this->proposalCount++;

        // KT-PROP-REV-001/002/003/004, KT-REV-002, KT-PROP-SEL-003: "Menunggu persetujuan Ketua LPPM" with 3/3 reviews
        $reviewerA = User::where('email', 'reviewer.e2e@itbss.ac.id')->first();
        $extraReviewers = User::where('role', 'Reviewer')
            ->where('id', '!=', $reviewerA?->id ?? 0)
            ->limit(2)->get();
        $reviewers = collect([$reviewerA])->concat($extraReviewers)->filter()->take(3);

        // Proposal with "AI for Education" for RV-PROP-MUT-002
        $pAi = Proposal::create(array_merge(
            $this->proposalAttrs('Menunggu penugasan reviewer', $kegId),
            ['judul' => 'AI for Education: Sistem Pembelajaran Adaptif']
        ));
        $this->proposalCount++;
        $this->attachReviewersToProposal($pAi, false);

        // PkM proposal "PkM: Edukasi Digital" for RV-PKM-PROP-001/002
        $pPkm = Proposal::create(array_merge(
            $this->proposalAttrs('Menunggu penugasan reviewer', $kegId),
            ['judul' => 'PkM: Edukasi Digital untuk Sekolah Dasar', 'jenis_penelitian' => 'PkM']
        ));
        $this->proposalCount++;
        $this->attachReviewersToProposal($pPkm, false);

        // Proposal at "Menunggu persetujuan Ketua LPPM" with 3 completed reviews
        $pKetua = Proposal::create(array_merge(
            $this->proposalAttrs('Menunggu persetujuan Ketua LPPM', $kegId),
            ['judul' => 'E2E: Penelitian Siap Keputusan Ketua']
        ));
        $this->proposalCount++;
        $this->createDokumen($pKetua->proposal_id, Proposal::class, 'Dokumen Proposal');
        foreach ($reviewers as $rev) {
            $pr = PenugasanReviewer::create([
                'reviewable_type' => Proposal::class, 'reviewable_id' => $pKetua->proposal_id,
                'proposal_id' => $pKetua->proposal_id,
                'tgl_penugasan' => now()->subDays(5)->toDateString(),
                'user_id' => $rev->id, 'status_review' => 'Telah direview',
                'created_at' => now()->subDays(5), 'updated_at' => now(),
            ]);
            $this->penugasanCount++;
            Review::create([
                'penugasan_id' => $pr->penugasan_id,
                'keputusan' => 'Diterima',
                'catatan' => 'Proposal sangat baik dan sesuai tema.',
                'tgl_review' => now()->subDays(2)->toDateString(),
                'kriteria_penilaian' => [
                    ['kriteria' => 'Kesesuaian Tema', 'bobot' => 30, 'skor' => 4, 'nilai' => 120],
                    ['kriteria' => 'Metodologi', 'bobot' => 30, 'skor' => 4, 'nilai' => 120],
                    ['kriteria' => 'Timeline', 'bobot' => 20, 'skor' => 5, 'nilai' => 100],
                    ['kriteria' => 'Anggaran', 'bobot' => 20, 'skor' => 4, 'nilai' => 80],
                ],
                'kriteria_kesesuaian_tema' => [
                    ['question' => 'SDGs', 'checked' => true],
                    ['question' => 'Teknologi', 'checked' => true],
                ],
                'created_at' => now()->subDays(2), 'updated_at' => now(),
            ]);
            $this->reviewCount++;
        }

        // Additional proposal at "Menunggu review dari Ketua LPPM" with staff approved
        Proposal::create(array_merge(
            $this->proposalAttrs('Menunggu review dari Ketua LPPM', $kegId),
            ['staff_seleksi_approved' => 1, 'ketua_seleksi_approved' => 0]
        ));
        $this->proposalCount++;
    }

    private function seedSpecificLaporansForTests(): void
    {
        $pids = $this->activePids();
        if (empty($pids)) return;

        // RV-LAP-MUT-002: Laporan with title "Laporan Penelitian Review"
        // Find a proposal that doesn't already have a Ganjil laporan
        foreach ($pids as $pid) {
            if (!$this->hasLaporan($pid, 'Ganjil')) {
                Laporan::create(array_merge(
                    $this->laporanAttrs('Menunggu review', $pid, $this->keg('DISEMINASI_GANJIL'), 'Ganjil'),
                    ['judul_penelitian' => 'Laporan Penelitian Review']
                ));
                $this->laporanCount++;
                $l = Laporan::where('proposal_id', $pid)->where('judul_penelitian', 'Laporan Penelitian Review')->first();
                if ($l) $this->attachReviewersToLaporan($l, false);
                break;
            }
        }
    }

    private function seedTestProdi(): void
    {
        $ketuaId = User::where('email', 'ketua.lppm@itbss.ac.id')->value('id');
        if (!$ketuaId) return;

        // Edit target prodi
        Prodi::firstOrCreate(
            ['nama_prodi' => 'E2E PRODI EDIT TARGET'],
            ['kaprodi_id' => $ketuaId]
        );
        // Delete target prodi
        Prodi::firstOrCreate(
            ['nama_prodi' => 'E2E PRODI DELETE TARGET'],
            ['kaprodi_id' => $ketuaId]
        );
    }

    private function seedTestUsersForSuperadmin(): void
    {
        // Edit target user
        User::firstOrCreate(
            ['email' => 'e2e.user.edit@itbss.ac.id'],
            [
                'nama' => 'E2E USER EDIT TARGET', 'password' => bcrypt('password'),
                'role' => 'Dosen', 'status' => 'Aktif', 'gender' => 'L',
            ]
        );
        // Status toggle target
        User::firstOrCreate(
            ['email' => 'e2e.user.status@itbss.ac.id'],
            [
                'nama' => 'E2E USER STATUS TARGET', 'password' => bcrypt('password'),
                'role' => 'Dosen', 'status' => 'Aktif', 'gender' => 'P',
            ]
        );
        // Delete target user
        User::firstOrCreate(
            ['email' => 'e2e.user.delete@itbss.ac.id'],
            [
                'nama' => 'E2E USER DELETE TARGET', 'password' => bcrypt('password'),
                'role' => 'Dosen', 'status' => 'Aktif', 'gender' => 'L',
            ]
        );
    }
}
