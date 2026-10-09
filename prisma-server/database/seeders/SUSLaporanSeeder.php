<?php

namespace Database\Seeders;

use App\Models\Laporan;
use App\Models\LaporanMember;
use App\Models\LogbookPengerjaan;
use App\Models\Dokumen;
use App\Models\DokumenVersion;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SUSLaporanSeeder extends Seeder
{
    public $proposals = [];
    public $dosen = [];
    public $kegiatan = [];
    public $laporan = [];

    public function init($proposals, $dosen, $kegiatan)
    {
        $this->proposals = $proposals;
        $this->dosen = $dosen;
        $this->kegiatan = $kegiatan;
    }

    public function createDummyPdf($folder, $name)
    {
        $slug = Str::slug($name);
        $date = now()->format('Ymd');
        $random = Str::random(8);
        $filename = "{$slug}_{$date}_{$random}.pdf";
        $path = "{$folder}/{$filename}";

        $pdf = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF";

        Storage::disk('public')->put($path, $pdf);

        return "documents/{$path}";
    }

    public function run()
    {
        $this->seedLaporans();
        $this->command->info('Seeded ' . count($this->laporan) . ' laporans.');
    }

    public function seedLaporans()
    {
        $penelitianProposals = array_slice(array_values(array_filter($this->proposals, function ($p) {
            return $p->status === 'Proposal Diterima' && $p->jenis_penelitian === 'Penelitian';
        })), 0, 33);

        $pkmProposals = array_values(array_filter($this->proposals, function ($p) {
            return $p->status === 'Proposal Diterima' && $p->jenis_penelitian === 'PkM';
        }));

        $penelitianStatuses = [
            ['status' => 'Belum dimulai', 'kegiatan_key' => 'PROSES_PENELITIAN'],
            ['status' => 'Dalam pengerjaan', 'kegiatan_key' => 'PROSES_PENELITIAN', 'with_logbooks' => true],
            ['status' => 'Menunggu kelengkapan data', 'kegiatan_key' => 'PUBLIKASI'],
            ['status' => 'Menunggu review Admin', 'kegiatan_key' => 'DISEMINASI', 'with_dokumen' => true],
            ['status' => 'Menunggu review Staff LPPM', 'kegiatan_key' => 'DISEMINASI'],
            ['status' => 'Menunggu review', 'kegiatan_key' => 'DISEMINASI', 'ketua_diseminasi_approved' => true, 'staff_diseminasi_approved' => true, 'with_reviewers_pending' => true],
            ['status' => 'Menunggu hasil dari Reviewers', 'kegiatan_key' => 'DISEMINASI', 'ketua_diseminasi_approved' => true, 'staff_diseminasi_approved' => true, 'with_reviewers_partial' => true],
            ['status' => 'Menuggu penugasan Reviewer', 'kegiatan_key' => 'DISEMINASI', 'ketua_diseminasi_approved' => true, 'staff_diseminasi_approved' => true],
            ['status' => 'Menunggu keputusan Ketua', 'kegiatan_key' => 'DISEMINASI', 'ketua_diseminasi_approved' => true, 'staff_diseminasi_approved' => true, 'with_reviewers_complete' => true],
            ['status' => 'Menunggu Persetujuan Ketua LPPM', 'kegiatan_key' => 'DISEMINASI', 'ketua_diseminasi_approved' => true],
            ['status' => 'Menunggu konfirmasi pengiriman dana', 'kegiatan_key' => 'CLAIM_DANA', 'claim_dana_status' => 'Menunggu konfirmasi admin', 'dana_disetujui' => 1],
            ['status' => 'Menunggu konfirmasi penerimaan dana', 'kegiatan_key' => 'CLAIM_DANA', 'claim_dana_status' => 'Menunggu bukti terima', 'dana_disetujui' => 1],
            ['status' => 'Revisi', 'kegiatan_key' => 'PROSES_PENELITIAN', 'catatan' => 'Perlu perbaikan metodologi'],
            ['status' => 'Selesai', 'kegiatan_key' => 'CLAIM_DANA', 'claim_dana_status' => 'Selesai', 'completed_at' => true, 'dana_disetujui' => 1],
        ];

        $pkmStatuses = [
            ['status' => 'Belum dimulai', 'kegiatan_key' => 'CLAIM_DANA_PKM'],
            ['status' => 'Dalam pengerjaan', 'kegiatan_key' => 'CLAIM_DANA_PKM', 'with_logbooks' => true],
            ['status' => 'Menunggu kelengkapan data', 'kegiatan_key' => 'PROSES_PKM'],
            ['status' => 'Menunggu review Admin', 'kegiatan_key' => 'PUBLIKASI_PKM', 'with_dokumen' => true],
            ['status' => 'Menunggu review Staff LPPM', 'kegiatan_key' => 'PUBLIKASI_PKM'],
            ['status' => 'Menunggu review', 'kegiatan_key' => 'PUBLIKASI_PKM', 'ketua_diseminasi_approved' => true, 'staff_diseminasi_approved' => true, 'with_reviewers_pending' => true],
            ['status' => 'Menunggu hasil dari Reviewers', 'kegiatan_key' => 'PUBLIKASI_PKM', 'ketua_diseminasi_approved' => true, 'staff_diseminasi_approved' => true, 'with_reviewers_partial' => true],
            ['status' => 'Menuggu penugasan Reviewer', 'kegiatan_key' => 'PUBLIKASI_PKM', 'ketua_diseminasi_approved' => true, 'staff_diseminasi_approved' => true],
            ['status' => 'Menunggu keputusan Ketua', 'kegiatan_key' => 'PUBLIKASI_PKM', 'ketua_diseminasi_approved' => true, 'staff_diseminasi_approved' => true, 'with_reviewers_complete' => true],
            ['status' => 'Menunggu Persetujuan Ketua LPPM', 'kegiatan_key' => 'PENGEMBALIAN_DANA', 'ketua_diseminasi_approved' => true, 'pengembalian_dana_status' => 'Menunggu Pengembalian Dana', 'dana_dikembalikan' => true],
            ['status' => 'Menunggu konfirmasi pengiriman dana', 'kegiatan_key' => 'PROSES_PKM', 'claim_dana_status' => 'Menunggu konfirmasi admin', 'dana_disetujui' => 1],
            ['status' => 'Menunggu konfirmasi penerimaan dana', 'kegiatan_key' => 'PROSES_PKM', 'claim_dana_status' => 'Menunggu bukti terima', 'dana_disetujui' => 1],
            ['status' => 'Revisi', 'kegiatan_key' => 'CLAIM_DANA_PKM', 'catatan' => 'Perlu perbaikan laporan PkM'],
            ['status' => 'Selesai', 'kegiatan_key' => 'DISEMINASI_PKM', 'completed_at' => true, 'dana_disetujui' => 1],
        ];

        $statusIndex = 0;

        foreach ($penelitianProposals as $proposal) {
            foreach (['Ganjil', 'Genap'] as $semester) {
                $statusConfig = $penelitianStatuses[$statusIndex % count($penelitianStatuses)];
                $statusIndex++;

                $kegiatanCode = $statusConfig['kegiatan_key'] . '_' . strtoupper($semester);
                $kegiatan = $this->kegiatan[$kegiatanCode] ?? null;

                $data = [
                    'proposal_id' => $proposal->proposal_id,
                    'kegiatan_id' => $kegiatan ? $kegiatan->kegiatan_id : null,
                    'semester' => $semester,
                    'jenis_penelitian' => 'Penelitian',
                    'judul_penelitian' => $proposal->judul,
                    'status' => $statusConfig['status'],
                    'tgl_mulai' => $semester === 'Ganjil' ? '2026-08-01' : '2026-02-01',
                    'institusi_mitra' => $proposal->institusi_mitra,
                    'metode_penelitian' => 'Mixed Methods',
                    'unit_analisis' => 'Sample Penelitian',
                    'target_publikasi' => 'Jurnal Nasional',
                    'realisasi_biaya_penelitian' => 4500000,
                    'realisasi_biaya_publikasi' => 1800000,
                    'realisasi_insentif' => 900000,
                ];

                if (isset($statusConfig['ketua_diseminasi_approved'])) {
                    $data['ketua_diseminasi_approved'] = $statusConfig['ketua_diseminasi_approved'];
                }

                if (isset($statusConfig['staff_diseminasi_approved'])) {
                    $data['staff_diseminasi_approved'] = $statusConfig['staff_diseminasi_approved'];
                }

                if (isset($statusConfig['pengembalian_dana_status'])) {
                    $data['pengembalian_dana_status'] = $statusConfig['pengembalian_dana_status'];
                }

                if (isset($statusConfig['dana_dikembalikan'])) {
                    $data['dana_dikembalikan'] = $statusConfig['dana_dikembalikan'];
                }

                if (isset($statusConfig['claim_dana_status'])) {
                    $data['claim_dana_status'] = $statusConfig['claim_dana_status'];
                }

                if (isset($statusConfig['completed_at'])) {
                    $data['completed_at'] = now();
                }

                $laporan = Laporan::create($data);
                $this->laporan[] = $laporan;

                // Ketua Tim
                LaporanMember::create([
                    'laporan_id' => $laporan->laporan_id,
                    'member_id' => $proposal->user_id,
                    'role' => 'Dosen',
                    'position' => 1,
                    'ttjp' => 'Ketua Tim Peneliti',
                ]);

                // Anggota Dosen (1-2 additional)
                $anggotaCount = rand(1, 2);
                for ($a = 0; $a < $anggotaCount; $a++) {
                    $anggotaIdx = ($statusIndex + $a + 5) % count($this->dosen);
                    if ($this->dosen[$anggotaIdx]->id !== $proposal->user_id) {
                        LaporanMember::create([
                            'laporan_id' => $laporan->laporan_id,
                            'member_id' => $this->dosen[$anggotaIdx]->id,
                            'role' => 'Dosen',
                            'position' => $a + 2,
                            'ttjp' => $a === 0 ? 'Anggota Peneliti' : 'Asisten Riset',
                        ]);
                    }
                }

                // Mahasiswa (every other laporan)
                if ($statusIndex % 2 === 0) {
                    LaporanMember::create([
                        'laporan_id' => $laporan->laporan_id,
                        'member_id' => ($statusIndex % 15) + 1,
                        'role' => 'Mahasiswa',
                        'position' => $anggotaCount + 2,
                        'ttjp' => 'Asisten Riset',
                    ]);
                }

                if (!empty($statusConfig['with_logbooks'])) {
                    $dates = ['2026-08-10', '2026-08-17', '2026-08-24'];
                    $logCount = rand(2, 3);
                    for ($i = 1; $i <= $logCount; $i++) {
                        LogbookPengerjaan::create([
                            'laporan_id' => $laporan->laporan_id,
                            'user_id' => $this->dosen[0]->id ?? 1,
                            'judul' => 'Logbook ke-' . $i,
                            'deskripsi' => 'Deskripsi logbook ke-' . $i . ' untuk laporan penelitian',
                            'tgl_kegiatan' => $dates[$i - 1] ?? $dates[0],
                        ]);
                    }
                }

                if (!empty($statusConfig['with_dokumen'])) {
                    $pdfPath = $this->createDummyPdf('laporan', $proposal->judul);
                    $dokumen = Dokumen::create([
                        'documentable_id' => $laporan->laporan_id,
                        'documentable_type' => Laporan::class,
                        'jenis_dokumen' => 'Dokumen Laporan Final',
                        'current_version_id' => null,
                    ]);
                    $version = DokumenVersion::create([
                        'dokumen_id' => $dokumen->dokumen_id,
                        'version' => 1,
                        'nama_file' => basename($pdfPath),
                        'drive_file_id' => '',
                        'drive_file_url' => '',
                        'local_file_url' => $pdfPath,
                        'uploaded_by' => $proposal->user_id,
                        'tgl_upload' => now()->format('Y-m-d'),
                    ]);
                    $dokumen->current_version_id = $version->version_id;
                    $dokumen->save();
                }

                if (!empty($statusConfig['with_reviewers_pending'])) {
                    $this->createReviewerAssignments($laporan->laporan_id, 'App\\Models\\Laporan', 'pending');
                }
                if (!empty($statusConfig['with_reviewers_partial'])) {
                    $this->createReviewerAssignments($laporan->laporan_id, 'App\\Models\\Laporan', 'partial');
                }
                if (!empty($statusConfig['with_reviewers_complete'])) {
                    $this->createReviewerAssignments($laporan->laporan_id, 'App\\Models\\Laporan', 'complete');
                }
            }
        }

        $statusIndex = 0;

        foreach ($pkmProposals as $proposal) {
            $semester = 'Ganjil';
            $statusConfig = $pkmStatuses[$statusIndex % count($pkmStatuses)];
            $statusIndex++;

            $kegiatanCode = $statusConfig['kegiatan_key'] . '_' . strtoupper($semester);
            $kegiatan = $this->kegiatan[$kegiatanCode] ?? null;

            $data = [
                'proposal_id' => $proposal->proposal_id,
                'kegiatan_id' => $kegiatan ? $kegiatan->kegiatan_id : null,
                'semester' => $semester,
                'jenis_penelitian' => 'PkM',
                'judul_penelitian' => $proposal->judul,
                'status' => $statusConfig['status'],
                'tgl_mulai' => '2026-08-01',
                'institusi_mitra' => $proposal->institusi_mitra,
                'metode_penelitian' => 'Mixed Methods',
                'unit_analisis' => 'Sample Penelitian',
                'target_publikasi' => 'Jurnal Nasional',
                'realisasi_biaya_penelitian' => 4500000,
                'realisasi_biaya_publikasi' => 1800000,
                'realisasi_insentif' => 900000,
            ];

            if (isset($statusConfig['claim_dana_status'])) {
                $data['claim_dana_status'] = $statusConfig['claim_dana_status'];
            }

            if (isset($statusConfig['pengembalian_dana_status'])) {
                $data['pengembalian_dana_status'] = $statusConfig['pengembalian_dana_status'];
            }

            if (isset($statusConfig['dana_dikembalikan'])) {
                $data['dana_dikembalikan'] = $statusConfig['dana_dikembalikan'];
            }

            if (isset($statusConfig['completed_at'])) {
                $data['completed_at'] = now();
            }

            $laporan = Laporan::create($data);
            $this->laporan[] = $laporan;

            // Ketua Tim
            LaporanMember::create([
                'laporan_id' => $laporan->laporan_id,
                'member_id' => $proposal->user_id,
                'role' => 'Dosen',
                'position' => 1,
                'ttjp' => 'Ketua Tim PkM',
            ]);

            // Anggota Dosen (1-2 additional)
            $pkmAnggotaCount = rand(1, 2);
            for ($a = 0; $a < $pkmAnggotaCount; $a++) {
                $pkmAnggotaIdx = ($statusIndex + $a + 10) % count($this->dosen);
                if ($this->dosen[$pkmAnggotaIdx]->id !== $proposal->user_id) {
                    LaporanMember::create([
                        'laporan_id' => $laporan->laporan_id,
                        'member_id' => $this->dosen[$pkmAnggotaIdx]->id,
                        'role' => 'Dosen',
                        'position' => $a + 2,
                        'ttjp' => $a === 0 ? 'Anggota PkM' : 'Asisten PkM',
                    ]);
                }
            }

            if (!empty($statusConfig['with_logbooks'])) {
                $dates = ['2026-08-10', '2026-08-17', '2026-08-24'];
                $logCount = rand(2, 3);
                for ($i = 1; $i <= $logCount; $i++) {
                    LogbookPengerjaan::create([
                        'laporan_id' => $laporan->laporan_id,
                        'user_id' => $this->dosen[0]->id ?? 1,
                        'judul' => 'Logbook ke-' . $i,
                        'deskripsi' => 'Deskripsi logbook ke-' . $i . ' untuk laporan PkM',
                        'tgl_kegiatan' => $dates[$i - 1] ?? $dates[0],
                    ]);
                }
            }

            if (!empty($statusConfig['with_dokumen'])) {
                $pdfPath = $this->createDummyPdf('laporan', $proposal->judul);
                $dokumen = Dokumen::create([
                    'documentable_id' => $laporan->laporan_id,
                    'documentable_type' => Laporan::class,
                    'jenis_dokumen' => 'Dokumen Laporan Final',
                    'current_version_id' => null,
                ]);
                $version = DokumenVersion::create([
                    'dokumen_id' => $dokumen->dokumen_id,
                    'version' => 1,
                    'nama_file' => basename($pdfPath),
                    'drive_file_id' => '',
                    'drive_file_url' => '',
                    'local_file_url' => $pdfPath,
                    'uploaded_by' => $proposal->user_id,
                    'tgl_upload' => now()->format('Y-m-d'),
                ]);
                $dokumen->current_version_id = $version->version_id;
                $dokumen->save();
            }

            if (!empty($statusConfig['with_reviewers_pending'])) {
                $this->createReviewerAssignments($laporan->laporan_id, 'App\\Models\\Laporan', 'pending');
            }
            if (!empty($statusConfig['with_reviewers_partial'])) {
                $this->createReviewerAssignments($laporan->laporan_id, 'App\\Models\\Laporan', 'partial');
            }
            if (!empty($statusConfig['with_reviewers_complete'])) {
                $this->createReviewerAssignments($laporan->laporan_id, 'App\\Models\\Laporan', 'complete');
            }
        }
    }

    private function createReviewerAssignments($id, $type, $mode): void
    {
        $reviewerIds = DB::table('users')->where('role', 'Reviewer')->pluck('id')->toArray();
        if (empty($reviewerIds)) {
            $reviewerIds = [25, 26, 27, 28, 29, 30, 31, 32, 33, 34];
        }

        $reviewDoneCount = 0;
        if ($mode === 'complete') {
            $reviewDoneCount = 3;
        } elseif ($mode === 'partial') {
            $reviewDoneCount = rand(1, 2);
        } elseif ($mode === 'pending') {
            $roll = rand(1, 10);
            if ($roll <= 3) {
                $reviewDoneCount = 0;
            } elseif ($roll <= 6) {
                $reviewDoneCount = 1;
            } else {
                $reviewDoneCount = 2;
            }
        }

        $reviewDoneIndices = [];
        if ($reviewDoneCount > 0) {
            $allIndices = [0, 1, 2];
            shuffle($allIndices);
            $reviewDoneIndices = array_slice($allIndices, 0, $reviewDoneCount);
        }

        $keputusanPool = [
            'Diterima', 'Diterima', 'Diterima',
            'Diterima dengan perbaikan', 'Diterima dengan perbaikan', 'Diterima dengan perbaikan',
            'Ditolak',
        ];
        $temaOptions = ['Sangat Sesuai', 'Sesuai', 'Cukup Sesuai'];
        $catatanOptions = [
            'Laporan sudah sesuai dengan standar.',
            'Perlu perbaikan pada analisis data.',
            'Metodologi perlu diperjelas.',
            'Hasil dan pembahasan perlu diperkuat.',
            'Daftar pustaka perlu diperbarui.',
            'Kesimpulan perlu disesuaikan dengan temuan.',
        ];

        for ($i = 0; $i < 3; $i++) {
            $isDone = in_array($i, $reviewDoneIndices);
            $statusReview = $isDone ? 'Telah direview' : 'Belum direview';

            $penugasanId = DB::table('penugasan_reviewer')->insertGetId([
                'reviewable_type' => $type,
                'reviewable_id' => $id,
                'proposal_id' => null,
                'user_id' => $reviewerIds[$i % count($reviewerIds)],
                'tgl_penugasan' => '2026-08-15',
                'status_review' => $statusReview,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if ($isDone) {
                $bobotValues = [30, 30, 20, 20];
                $kriteriaNames = ['Kesesuaian Tema', 'Metodologi', 'Timeline', 'Anggaran'];
                $indikatorOptions = [
                    ['Tema sesuai bidang keahlian', 'Topik relevan dengan isu terkini', 'Kontribusi ilmu jelas'],
                    ['Metode tepat guna', 'Desain penelitian kuat', 'Analisis data valid'],
                    ['Timeline realistis', 'Tahapan logis', 'Milestone terukur'],
                    ['Anggaran efisien', 'Rincian lengkap', 'Justifikasi jelas'],
                ];
                $kriteriaPenilaian = [];
                for ($k = 0; $k < 4; $k++) {
                    $skor = rand(60, 95);
                    $nilai = round($bobotValues[$k] * $skor / 100, 2);
                    $kriteriaPenilaian[] = [
                        'kriteria' => $kriteriaNames[$k],
                        'indikator_penilaian' => $indikatorOptions[$k][array_rand($indikatorOptions[$k])],
                        'bobot' => $bobotValues[$k],
                        'skor' => $skor,
                        'nilai' => $nilai,
                    ];
                }

                $themeCount = rand(1, 3);
                $chosenThemeNames = array_slice($temaOptions, 0, $themeCount);
                shuffle($chosenThemeNames);
                $kriteriaKesesuaianTema = [];
                foreach ($temaOptions as $tema) {
                    $kriteriaKesesuaianTema[] = [
                        'question' => $tema,
                        'checked' => in_array($tema, $chosenThemeNames),
                    ];
                }

                DB::table('review')->insert([
                    'penugasan_id' => $penugasanId,
                    'keputusan' => $keputusanPool[array_rand($keputusanPool)],
                    'kriteria_kesesuaian_tema' => json_encode($kriteriaKesesuaianTema),
                    'kriteria_penilaian' => json_encode($kriteriaPenilaian),
                    'catatan' => $catatanOptions[array_rand($catatanOptions)],
                    'tgl_review' => '2026-08-15',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
