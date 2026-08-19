<?php

namespace App\Services;

use Exception;
use PhpOffice\PhpWord\TemplateProcessor;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class LaporanAkhirDocxService
{
    public function generate(
        $laporan,
        $proposal,
        $laporanMembers,
        $ketuaDetail,
        $prodi,
        $realisasiAnggaran,
        $settings
    ) {
        try {

            $templatePath = storage_path('app/templates/laporan-akhir-template.docx');

            if (!file_exists($templatePath)) {
                throw new Exception("Template DOCX not found at: {$templatePath}");
            }

            ini_set('pcre.backtrack_limit', '100000000');

            $template = new TemplateProcessor($templatePath);

            /*
            |--------------------------------------------------------------------------
            | Normalize Template Row Variables
            |--------------------------------------------------------------------------
            */

            $this->normalizeRowVariables($template, [
                'anggota_peneliti',
                'ttjp_anggota_peneliti',
                'institusi_anggota_peneliti',
                'rf_no',
                'rf_item_kebutuhan',
                'rf_satuan',
                'rf_jumlah_item',
                'rf_harga_satuan',
                'rf_total',
            ]);

            $tanggalRilis = Carbon::now()
                ->locale('id')
                ->translatedFormat('d F Y');

            /*
            |--------------------------------------------------------------------------
            | Determine Semester-specific Publication Title
            |--------------------------------------------------------------------------
            */

            $judulPublikasi = $laporan->nama_jurnal;
            if (empty($judulPublikasi)) {
                $judulPublikasi = $laporan->isGanjil()
                    ? $proposal->rencana_judul_publikasi_gan
                    : $proposal->rencana_judul_publikasi_gen;
            }

            /*
            |--------------------------------------------------------------------------
            | Header / Identity
            |--------------------------------------------------------------------------
            */

            $template->setValue(
                'semester',
                strtoupper($laporan->semester ?? '-')
            );

            $template->setValue(
                'tahun_akademik',
                $proposal->kegiatan?->skema?->tahun_ajaran ?? '-'
            );

            $template->setValue(
                'judul_penelitian',
                $laporan->judul_penelitian ?? '-'
            );

            /*
            |--------------------------------------------------------------------------
            | Ketua Peneliti
            |--------------------------------------------------------------------------
            */

            $template->setValue(
                'nama_ketua_peneliti',
                $proposal->user?->nama ?? '-'
            );

            $template->setValue(
                'nidn_ketua_peneliti',
                $proposal->user?->nidn ?? '-'
            );

            $template->setValue(
                'bidang_ilmu',
                $proposal->bidang_ilmu ?? '-'
            );

            $template->setValue(
                'jabatan_ketua',
                $proposal->user?->role ?? '-'
            );

            $template->setValue(
                'prodi_nama',
                $prodi?->nama_prodi ?? '-'
            );

            $template->setValue(
                'no_hp_ketua',
                $ketuaDetail?->no_hp ?? '-'
            );

            $template->setValue(
                'email_ketua',
                $proposal->user?->email ?? '-'
            );

            $template->setValue(
                'pangkat_golongan',
                $ketuaDetail?->pangkat_golongan ?? '-'
            );

            /*
            |--------------------------------------------------------------------------
            | Approval Signatures
            |--------------------------------------------------------------------------
            */

            $template->setValue(
                'kepala_lppm_nama',
                $settings->kepalaLppmUser->nama ?? '-'
            );

            $template->setValue(
                'kepala_lppm_nidn',
                $settings->kepalaLppmUser->nidn ?? '-'
            );

            $template->setValue(
                'kaprodi_nama',
                $prodi?->kaprodi?->nama ?? '-'
            );

            $template->setValue(
                'kaprodi_nidn',
                $prodi?->kaprodi?->nidn ?? '-'
            );

            $template->setValue(
                'rektor_nama',
                $settings->rektorUser->nama ?? '-'
            );

            $template->setValue(
                'rektor_nidn',
                $settings->rektorUser->nidn ?? '-'
            );

            /*
            |--------------------------------------------------------------------------
            | Publication Section
            |--------------------------------------------------------------------------
            */

            $template->setValue(
                'judul_publikasi',
                $judulPublikasi ?? '-'
            );

            /*
            |--------------------------------------------------------------------------
            | Anggota Peneliti (cloneRow)
            |--------------------------------------------------------------------------
            | #1 = Ketua Peneliti, #2..#N = additional members from laporan_member.
            | Ketua is always first and locked.
            |--------------------------------------------------------------------------
            */

            $allMembers = collect();

            // Ketua as #1
            $allMembers->push([
                'nama'       => $proposal->user?->nama ?? '-',
                'ttjp'       => $ketuaDetail?->jabatan ?? '-',
                'institusi'  => $settings->nama_kampus ?? '-',
            ]);

            // Additional members
            foreach ($laporanMembers as $member) {
                if ($member->role === 'Dosen') {
                    $nama = $member->user?->nama ?? '-';
                    $institusi = $settings->nama_kampus ?? '-';
                } elseif ($member->role === 'Mahasiswa') {
                    $nama = $member->mahasiswa?->nama ?? '-';
                    $institusi = $settings->nama_kampus ?? '-';
                } else {
                    $nama = $member->kolaborator?->nama ?? '-';
                    $institusi = $member->kolaborator?->institusi ?? '-';
                }

                $allMembers->push([
                    'nama'       => $nama,
                    'ttjp'       => $member->ttjp ?? '-',
                    'institusi'  => $institusi,
                ]);
            }

            $template->setValue(
                'jlh_peneliti',
                $allMembers->count()
            );

            if ($allMembers->count() > 0) {

                $template->cloneRow(
                    'anggota_peneliti',
                    $allMembers->count()
                );

                foreach ($allMembers as $index => $member) {

                    $number = $index + 1;

                    $template->setValue(
                        "anggota_peneliti#{$number}",
                        $member['nama']
                    );

                    $template->setValue(
                        "ttjp_anggota_peneliti#{$number}",
                        $member['ttjp']
                    );

                    $template->setValue(
                        "institusi_anggota_peneliti#{$number}",
                        $member['institusi']
                    );
                }

            } else {

                $template->setValue('anggota_peneliti', '-');
                $template->setValue('ttjp_anggota_peneliti', '-');
                $template->setValue('institusi_anggota_peneliti', '-');
            }

            /*
            |--------------------------------------------------------------------------
            | Masa Pelaksanaan
            |--------------------------------------------------------------------------
            */

            $template->setValue(
                'masa_pelaksanaan_mulai',
                $laporan->tgl_mulai
                    ? Carbon::parse($laporan->tgl_mulai)
                        ->locale('id')
                        ->translatedFormat('F Y')
                    : '-'
            );

            $template->setValue(
                'masa_pelaksanaan_selesai',
                $laporan->tgl_selesai
                    ? Carbon::parse($laporan->tgl_selesai)
                        ->locale('id')
                        ->translatedFormat('F Y')
                    : '-'
            );

            /*
            |--------------------------------------------------------------------------
            | Other Info
            |--------------------------------------------------------------------------
            */

            $template->setValue(
                'institusi_mitra',
                $laporan->institusi_mitra ?? '-'
            );

            $template->setValue(
                'kontribusi_ilmu_makul',
                $proposal->kontribusi_ilmu_makul ?? '-'
            );

            $template->setValue(
                'rencana_luaran',
                $proposal->rencana_luaran ?? '-'
            );

            /*
            |--------------------------------------------------------------------------
            | Realisasi Anggaran Summary
            |--------------------------------------------------------------------------
            */

            $totalRealisasi =
                ($laporan->realisasi_biaya_penelitian ?? 0)
                + ($laporan->realisasi_biaya_publikasi ?? 0)
                + ($laporan->realisasi_insentif ?? 0);

            $template->setValue(
                'total_realisasi_biaya',
                number_format($totalRealisasi, 0, ',', '.')
            );

            /*
            |--------------------------------------------------------------------------
            | Point F — Realisasi Anggaran Detail (cloneRow)
            |--------------------------------------------------------------------------
            */

            if ($realisasiAnggaran->count() > 0) {

                $template->cloneRow(
                    'rf_no',
                    $realisasiAnggaran->count()
                );

                foreach ($realisasiAnggaran as $index => $item) {

                    $number = $index + 1;

                    $template->setValue(
                        "rf_no#{$number}",
                        $number
                    );

                    $template->setValue(
                        "rf_item_kebutuhan#{$number}",
                        $item->item_kebutuhan ?? '-'
                    );

                    $template->setValue(
                        "rf_satuan#{$number}",
                        $item->satuan ?? '-'
                    );

                    $template->setValue(
                        "rf_jumlah_item#{$number}",
                        $item->jumlah_item
                    );

                    $template->setValue(
                        "rf_harga_satuan#{$number}",
                        number_format($item->harga_satuan, 0, ',', '.')
                    );

                    $template->setValue(
                        "rf_total#{$number}",
                        number_format($item->total, 0, ',', '.')
                    );
                }

                $template->setValue(
                    'rf_total_semua',
                    number_format($realisasiAnggaran->sum('total'), 0, ',', '.')
                );

            } else {

                // When no items, just clear the placeholder values
                $template->setValue('rf_no#1', '');
                $template->setValue('rf_item_kebutuhan#1', '');
                $template->setValue('rf_satuan#1', '');
                $template->setValue('rf_jumlah_item#1', '');
                $template->setValue('rf_harga_satuan#1', '');
                $template->setValue('rf_total#1', '');

                $template->setValue('rf_total_semua', '0');
            }

            /*
            |--------------------------------------------------------------------------
            | Others
            |--------------------------------------------------------------------------
            */

            $template->setValue(
                'tanggal_rilis',
                $tanggalRilis
            );

            /*
            |--------------------------------------------------------------------------
            | Save File
            |--------------------------------------------------------------------------
            */

            $directory = storage_path('app/public/generated');

            if (!file_exists($directory)) {
                mkdir($directory, 0777, true);
            }

            $filename =
                'laporan-akhir-'
                . $laporan->laporan_id
                . '-'
                . now()->format('YmdHis')
                . '.docx';

            $relativePath = 'generated/' . $filename;

            $savePath = storage_path(
                'app/public/' . $relativePath
            );

            $template->saveAs($savePath);

            Log::info('Laporan Akhir generated successfully', [
                'path' => $savePath
            ]);

            return $relativePath;

        } catch (\Throwable $e) {

            Log::error('LaporanAkhirDocxService Error', [
                'message' => $e->getMessage(),
                'line'    => $e->getLine(),
                'file'    => $e->getFile(),
                'trace'   => $e->getTraceAsString()
            ]);

            throw new Exception(
                'Laporan Akhir generation failed: '
                . $e->getMessage()
                . ' at line '
                . $e->getLine()
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Template Variable Normalizer
    |--------------------------------------------------------------------------
    | Converts ${var#1} back to ${var} inside the template XML so that
    | PHPWord's cloneRow() can locate the base variable.
    |--------------------------------------------------------------------------
    */

    private function normalizeRowVariables(TemplateProcessor $template, array $vars)
    {
        $ref = new \ReflectionClass($template);
        $prop = $ref->getProperty('tempDocumentMainPart');

        if (PHP_VERSION_ID < 80100) {
            $prop->setAccessible(true);
        }

        $xml = $prop->getValue($template);

        foreach ($vars as $var) {
            $xml = str_replace('${' . $var . '#1}', '${' . $var . '}', $xml);
        }

        $prop->setValue($template, $xml);
    }
}
