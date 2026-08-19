<?php

namespace App\Services;

use Exception;
use PhpOffice\PhpWord\TemplateProcessor;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class PengumumanSuratTugasService
{
    public function generate($kegiatan, $proposals, $settings)
    {
        try {

            $templatePath = storage_path('app/templates/pengumuman-surat-tugas-template.docx');

            /*
            |--------------------------------------------------------------------------
            | Check Template Exists
            |--------------------------------------------------------------------------
            */

            if (!file_exists($templatePath)) {
                throw new Exception("Template DOCX not found at: {$templatePath}");
            }

            ini_set('pcre.backtrack_limit', '100000000');

            $template = new TemplateProcessor($templatePath);

            $tanggalRilis = Carbon::now()
                ->locale('id')
                ->translatedFormat('d F Y');

            /*
            |--------------------------------------------------------------------------
            | Header
            |--------------------------------------------------------------------------
            */

            $template->setValue(
                'jenis_penelitian',
                strtoupper($kegiatan->jenis_penelitian ?? '-')
            );

            $template->setValue(
                'skema_nama',
                $kegiatan->skema?->nama_skema ?? '-'
            );

            $template->setValue(
                'nama_kampus',
                $settings->nama_kampus ?? '-'
            );

            $template->setValue(
                'tanggal_rilis',
                $tanggalRilis
            );

            /*
            |--------------------------------------------------------------------------
            | Proposal Rows
            |--------------------------------------------------------------------------
            */

            if ($proposals->count() > 0) {

                $template->cloneRow(
                    'sk_no',
                    $proposals->count()
                );

                foreach ($proposals as $index => $proposal) {

                    $number = $index + 1;

                    $totalDana =
                        ($proposal->ra_biaya_penelitian_gan ?? 0) +
                        ($proposal->ra_biaya_publikasi_gan ?? 0) +
                        ($proposal->ra_insentif_gan ?? 0) +
                        ($proposal->ra_biaya_penelitian_gen ?? 0) +
                        ($proposal->ra_biaya_publikasi_gen ?? 0) +
                        ($proposal->ra_insentif_gen ?? 0);

                    $template->setValue(
                        "sk_no#{$number}",
                        $number
                    );

                    $template->setValue(
                        "sk_ketua#{$number}",
                        $proposal->user?->nama ?? '-'
                    );

                    $template->setValue(
                        "sk_nidn#{$number}",
                        $proposal->user?->nidn ?? '-'
                    );

                    $template->setValue(
                        "sk_prodi#{$number}",
                        $proposal->user?->prodi?->nama_prodi ?? '-'
                    );

                    $template->setValue(
                        "sk_judul#{$number}",
                        $proposal->topik_penelitian ?? '-'
                    );

                    $template->setValue(
                        "sk_dana#{$number}",
                        'Rp ' . number_format(
                            $totalDana,
                            0,
                            ',',
                            '.'
                        )
                    );
                }

            } else {

                $template->deleteRow('sk_no');
            }

            /*
            |--------------------------------------------------------------------------
            | LPPM
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
                'pengumuman-surat-tugas-'
                . $kegiatan->kegiatan_id
                . '-'
                . now()->format('YmdHis')
                . '.docx';

            $relativePath = 'generated/' . $filename;

            $savePath = storage_path(
                'app/public/' . $relativePath
            );

            $template->saveAs($savePath);

            Log::info('Pengumuman Surat Tugas generated successfully', [
                'path' => $savePath
            ]);

            return $relativePath;

        } catch (\Throwable $e) {

            Log::error('PengumumanSuratTugasService Error', [
                'message' => $e->getMessage(),
                'line'    => $e->getLine(),
                'file'    => $e->getFile(),
                'trace'   => $e->getTraceAsString()
            ]);

            throw new Exception(
                'Pengumuman Surat Tugas generation failed: '
                . $e->getMessage()
                . ' at line '
                . $e->getLine()
            );
        }
    }
}
