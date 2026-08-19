<?php

namespace App\Services;

use Exception;
use App\Models\PenelitiDetail;
use PhpOffice\PhpWord\TemplateProcessor;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class ProposalDocxService
{
    public function generate($proposal, $proposalMembers, $prodi, $settings)
    {
        try {

            $templatePath = storage_path('app/templates/proposal-template.docx');

            /*
            |--------------------------------------------------------------------------
            | Check Template Exists
            |--------------------------------------------------------------------------
            */

            if (!file_exists($templatePath)) {
                throw new Exception("Template DOCX not found at: {$templatePath}");
            }

            /*
            |--------------------------------------------------------------------------
            | PHPWord cloneBlock uses a heavy regex that exhausts the default
            | PCRE backtrack limit (1M) on this template size, making blocks
            | silently fail to clone. Raise the limit for this process.
            |--------------------------------------------------------------------------
            */

            ini_set('pcre.backtrack_limit', '100000000');

            $template = new TemplateProcessor($templatePath);

            /*
            |--------------------------------------------------------------------------
            | Normalize Template Row Variables
            |--------------------------------------------------------------------------
            | Word may save cloneable row placeholders as ${var#1} instead of ${var}.
            | PHPWord's cloneRow() requires the base variable (without #N) — it adds
            | the index suffix automatically during cloning. Fix any #1 occurrences
            | so cloneRow can locate the row.
            |--------------------------------------------------------------------------
            */

            $this->normalizeRowVariables($template, [
                'anggota_gan',
                'ttjp_anggota_gan',
                'institusi_anggota_gan',
                'anggota_gen',
                'ttjp_anggota_gen',
                'institusi_anggota_gen',
            ]);

            $tanggalRilis = Carbon::now()
                ->locale('id')
                ->translatedFormat('d F Y');

            $ketuaDetail = $this->loadPenelitiDetail(
                'user_id',
                $proposal->user_id
            );

            /*
            |--------------------------------------------------------------------------
            | Proposal Identity
            |--------------------------------------------------------------------------
            */

            $template->setValue(
                'judul_proposal',
                $proposal->judul ?? '-'
            );

            $template->setValue(
                'bidang_ilmu',
                $proposal->bidang_ilmu ?? '-'
            );

            $template->setValue(
                'topik_penelitian_tahunan',
                $proposal->topik_penelitian ?? '-'
            );

            $template->setValue(
                'tanggal_rilis',
                $tanggalRilis
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
                ($proposal->user?->nidn ?? '-')
                . ' / '
                . ($proposal->user?->nuptk ?? '-')
            );

            $template->setValue(
                'jabatan_ketua',
                $proposal->user?->role ?? '-'
            );

            $template->setValue(
                'jurusan_ketua',
                $proposal->user?->prodi?->nama_prodi ?? '-'
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
            | Semester Data
            |--------------------------------------------------------------------------
            */

            $template->setValue(
                'rencana_judul_publikasi_gan',
                $proposal->rencana_judul_publikasi_gan ?? '-'
            );

            $template->setValue(
                'rencana_judul_publikasi_gen',
                $proposal->rencana_judul_publikasi_gen ?? '-'
            );

            $template->setValue(
                'target_publikasi_gan',
                $proposal->target_publikasi_gan ?? '-'
            );

            $template->setValue(
                'target_publikasi_gen',
                $proposal->target_publikasi_gen ?? '-'
            );

            /*
            |--------------------------------------------------------------------------
            | Semester Members
            |--------------------------------------------------------------------------
            | #1 = Ketua Peneliti, #2..#N = additional researchers.
            | Ganjil and Genap are handled independently.
            |--------------------------------------------------------------------------
            */

            $ganjilMembers = $proposalMembers
                ->where('semester', 'Ganjil')
                ->values();

            $genapMembers = $proposalMembers
                ->where('semester', 'Genap')
                ->values();

            $template->setValue(
                'jlh_peneliti_gan',
                $ganjilMembers->count()
            );

            $template->setValue(
                'jlh_peneliti_gen',
                $genapMembers->count()
            );

            /*
            |--------------------------------------------------------------------------
            | Helper Formatter
            |--------------------------------------------------------------------------
            */

            $formatMember = function ($member) use ($settings) {

                if ($member?->role === 'Dosen') {

                    return [
                        'nama' => $member?->user?->nama ?? '-',
                        'ttjp' => $member?->ttjp ?? '-',
                        'institusi' => $settings->nama_kampus ?? '-',
                    ];
                }

                if ($member?->role === 'Mahasiswa') {

                    return [
                        'nama' => $member?->mahasiswa?->nama ?? '-',
                        'ttjp' => $member?->ttjp ?? '-',
                        'institusi' => $settings->nama_kampus ?? '-',
                    ];
                }

                if ($member?->role === 'Kolaborator') {

                    return [
                        'nama' => $member?->kolaborator?->nama ?? '-',
                        'ttjp' => $member?->ttjp ?? '-',
                        'institusi' => $member?->kolaborator?->institusi ?? '-',
                    ];
                }

                return [
                    'nama' => '-',
                    'ttjp' => '-',
                    'institusi' => '-',
                ];
            };

            /*
            |--------------------------------------------------------------------------
            | Clone Row - Semester Ganjil
            |--------------------------------------------------------------------------
            */

            if ($ganjilMembers->count() > 0) {

                $template->cloneRow(
                    'anggota_gan',
                    $ganjilMembers->count()
                );

                foreach ($ganjilMembers as $index => $member) {

                    $number = $index + 1;

                    $formatted = $formatMember($member);

                    $template->setValue(
                        "anggota_gan#{$number}",
                        $formatted['nama']
                    );

                    $template->setValue(
                        "ttjp_anggota_gan#{$number}",
                        $formatted['ttjp']
                    );

                    $template->setValue(
                        "institusi_anggota_gan#{$number}",
                        $formatted['institusi']
                    );
                }

            } else {

                $template->setValue('anggota_gan', '-');
                $template->setValue('ttjp_anggota_gan', '-');
                $template->setValue('institusi_anggota_gan', '-');
            }

            /*
            |--------------------------------------------------------------------------
            | Clone Row - Semester Genap
            |--------------------------------------------------------------------------
            */

            if ($genapMembers->count() > 0) {

                $template->cloneRow(
                    'anggota_gen',
                    $genapMembers->count()
                );

                foreach ($genapMembers as $index => $member) {

                    $number = $index + 1;

                    $formatted = $formatMember($member);

                    $template->setValue(
                        "anggota_gen#{$number}",
                        $formatted['nama']
                    );

                    $template->setValue(
                        "ttjp_anggota_gen#{$number}",
                        $formatted['ttjp']
                    );

                    $template->setValue(
                        "institusi_anggota_gen#{$number}",
                        $formatted['institusi']
                    );
                }

            } else {

                $template->setValue('anggota_gen', '-');
                $template->setValue('ttjp_anggota_gen', '-');
                $template->setValue('institusi_anggota_gen', '-');
            }

            /*
            |--------------------------------------------------------------------------
            | Masa Pelaksanaan
            |--------------------------------------------------------------------------
            */

            $template->setValue(
                'masa_pelaksanaan_mulai',
                $proposal->kegiatan?->tanggal_mulai
                    ? Carbon::parse($proposal->kegiatan->tanggal_mulai)
                        ->translatedFormat('F Y')
                    : '-'
            );

            $template->setValue(
                'masa_pelaksanaan_selesai',
                $proposal->kegiatan?->tanggal_selesai
                    ? Carbon::parse($proposal->kegiatan->tanggal_selesai)
                        ->translatedFormat('F Y')
                    : '-'
            );

            /*
            |--------------------------------------------------------------------------
            | Rencana Anggaran
            |--------------------------------------------------------------------------
            */

            $totalBiaya =
                ($proposal->ra_biaya_penelitian_gan ?? 0) +
                ($proposal->ra_biaya_publikasi_gan ?? 0) +
                ($proposal->ra_insentif_gan ?? 0) +
                ($proposal->ra_biaya_penelitian_gen ?? 0) +
                ($proposal->ra_biaya_publikasi_gen ?? 0) +
                ($proposal->ra_insentif_gen ?? 0);

            $template->setValue(
                'ra_biaya_penelitian_gan',
                number_format(
                    $proposal->ra_biaya_penelitian_gan ?? 0,
                    0,
                    ',',
                    '.'
                )
            );

            $template->setValue(
                'ra_biaya_publikasi_gan',
                number_format(
                    $proposal->ra_biaya_publikasi_gan ?? 0,
                    0,
                    ',',
                    '.'
                )
            );

            $template->setValue(
                'ra_insentif_gan',
                number_format(
                    $proposal->ra_insentif_gan ?? 0,
                    0,
                    ',',
                    '.'
                )
            );

            $template->setValue(
                'ra_biaya_penelitian_gen',
                number_format(
                    $proposal->ra_biaya_penelitian_gen ?? 0,
                    0,
                    ',',
                    '.'
                )
            );

            $template->setValue(
                'ra_biaya_publikasi_gen',
                number_format(
                    $proposal->ra_biaya_publikasi_gen ?? 0,
                    0,
                    ',',
                    '.'
                )
            );

            $template->setValue(
                'ra_insentif_gen',
                number_format(
                    $proposal->ra_insentif_gen ?? 0,
                    0,
                    ',',
                    '.'
                )
            );

            $template->setValue(
                'total_biaya_ra',
                number_format(
                    $totalBiaya,
                    0,
                    ',',
                    '.'
                )
            );

            /*
            |--------------------------------------------------------------------------
            | Others
            |--------------------------------------------------------------------------
            */

            $template->setValue(
                'institusi_mitra',
                $proposal->institusi_mitra ?? '-'
            );

            $template->setValue(
                'kontribusi_ilmu_makul',
                $proposal->kontribusi_ilmu_makul ?? '-'
            );

            $template->setValue(
                'rencana_luaran',
                $proposal->rencana_luaran ?? '-'
            );

            $template->setValue(
                'nama_skema',
                $proposal->kegiatan?->skema?->nama_skema ?? '-'
            );

            $template->setValue(
                'tahun_akademik',
                $proposal->kegiatan?->skema?->tahun_ajaran ?? '-'
            );

            /*
            |--------------------------------------------------------------------------
            | Prodi
            |--------------------------------------------------------------------------
            */

            $template->setValue(
                'prodi_nama',
                $prodi->nama_prodi ?? '-'
            );

            $template->setValue(
                'kaprodi_nama',
                $prodi->kaprodi->nama ?? '-'
            );

            $template->setValue(
                'kaprodi_nidn',
                $prodi->kaprodi->nidn ?? '-'
            );

            /*
            |--------------------------------------------------------------------------
            | LPPM & Rektor
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
                'rektor_nama',
                $settings->rektorUser->nama ?? '-'
            );

            $template->setValue(
                'rektor_nidn',
                $settings->rektorUser->nidn ?? '-'
            );

            /*
            |--------------------------------------------------------------------------
            | Biodata Pengusul (Publikasi, Buku, HKI, Riwayat Penelitian)
            |--------------------------------------------------------------------------
            */

            $this->fillBiodata(
                $template,
                $proposal,
                $proposalMembers,
                $settings
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
                'proposal-'
                . $proposal->proposal_id
                . '-'
                . now()->format('YmdHis')
                . '.docx';

            $relativePath = 'generated/' . $filename;

            $savePath = storage_path(
                'app/public/' . $relativePath
            );

            $template->saveAs($savePath);

            Log::info('DOCX generated successfully', [
                'path' => $savePath
            ]);

            return $relativePath;

        } catch (\Throwable $e) {

            Log::error('ProposalDocxService Error', [
                'message' => $e->getMessage(),
                'line'    => $e->getLine(),
                'file'    => $e->getFile(),
                'trace'   => $e->getTraceAsString()
            ]);

            throw new Exception(
                'DOCX generation failed: '
                . $e->getMessage()
                . ' at line '
                . $e->getLine()
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Biodata Pengusul
    |--------------------------------------------------------------------------
    | Fills the biodata identity table plus the Publikasi, Buku/Book Chapter,
    | HKI, and Riwayat Penelitian tables for the Ketua ("k_" placeholders).
    |--------------------------------------------------------------------------
    */

    private function fillBiodata($template, $proposal, $proposalMembers, $settings)
    {
        /*
        |--------------------------------------------------------------------------
        | Ketua
        |--------------------------------------------------------------------------
        */

        $ketuaDetail = $this->loadPenelitiDetail(
            'user_id',
            $proposal->user_id
        );

        $this->setBiodataIdentity($template, 'k', '', [
            'nama' => $proposal->user?->nama,
            'nidn' => $proposal->user?->nidn,
            'jabatan' => $ketuaDetail?->jabatan,
            'email' => $proposal->user?->email,
            'no_hp' => $ketuaDetail?->no_hp ?? $proposal->user?->no_hp,
            'sinta' => $ketuaDetail?->sinta_id,
            'h_index' => $ketuaDetail?->h_index,
        ]);

        $this->fillBiodataTables($template, 'k', '', $ketuaDetail);
    }

    private function loadPenelitiDetail($column, $id)
    {
        if (!$id) {
            return null;
        }

        return PenelitiDetail::with([
            'publications.category',
            'books',
            'hkis',
            'researchHistories',
        ])->where($column, $id)->first();
    }

    private function setBiodataIdentity($template, $prefix, $suffix, $values)
    {
        foreach ($values as $field => $value) {

            $template->setValue(
                "{$prefix}_bio_{$field}{$suffix}",
                $this->displayValue($value)
            );
        }
    }

    private function fillBiodataTables($template, $prefix, $suffix, $detail)
    {
        /*
        |--------------------------------------------------------------------------
        | Publikasi (routed by jenis_jurnal)
        |--------------------------------------------------------------------------
        */

        $publications = $detail?->publications ?? collect();

        $jenisTables = [
            'jurnal_internal' => 'pub_internal',
            'jurnal_internasional' => 'pub_inter',
            'jurnal_nasional_terakreditasi' => 'pub_nas',
            'jurnal_nasional_tidak_terakreditasi' => 'pub_nastidak',
            'prosiding' => 'pub_prosiding',
        ];

        foreach ($jenisTables as $jenis => $slug) {

            $rows = $publications
                ->where('jenis_jurnal', $jenis)
                ->values();

            $this->fillBiodataRows(
                $template,
                "{$prefix}_{$slug}",
                $suffix,
                $rows,
                ['no', 'judul', 'peran', 'jurnal', 'url'],
                function ($pub, $number) {

                    return [
                        'no' => $number,
                        'judul' => $this->formatJudulPublikasi($pub),
                        'peran' => $this->formatPeran($pub->peran),
                        'jurnal' => $this->formatJurnal($pub),
                        'url' => $pub->url,
                    ];
                }
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Buku / Book Chapter
        |--------------------------------------------------------------------------
        */

        $this->fillBiodataRows(
            $template,
            "{$prefix}_buku",
            $suffix,
            $detail?->books ?? collect(),
            ['no', 'judul', 'tahun', 'isbn', 'penerbit', 'url'],
            function ($book, $number) {

                return [
                    'no' => $number,
                    'judul' => $book->judul,
                    'tahun' => $book->tahun,
                    'isbn' => $book->isbn,
                    'penerbit' => $book->penerbit,
                    'url' => $book->url,
                ];
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Perolehan HKI
        |--------------------------------------------------------------------------
        */

        $this->fillBiodataRows(
            $template,
            "{$prefix}_hki",
            $suffix,
            $detail?->hkis ?? collect(),
            ['no', 'judul', 'tahun', 'jenis', 'nomor', 'status', 'url'],
            function ($hki, $number) {

                return [
                    'no' => $number,
                    'judul' => $hki->judul,
                    'tahun' => $hki->tahun,
                    'jenis' => $hki->jenis,
                    'nomor' => $hki->nomor,
                    'status' => $hki->status,
                    'url' => $hki->url,
                ];
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Riwayat Penelitian (routed by kategori)
        |--------------------------------------------------------------------------
        */

        $histories = $detail?->researchHistories ?? collect();

        $kategoriTables = [
            'kemdikbud' => 'rh_kem',
            'internal' => 'rh_int',
        ];

        foreach ($kategoriTables as $kategori => $slug) {

            $rows = $histories
                ->where('kategori', $kategori)
                ->values();

            $this->fillBiodataRows(
                $template,
                "{$prefix}_{$slug}",
                $suffix,
                $rows,
                ['no', 'judul', 'tahun', 'dana'],
                function ($history, $number) {

                    return [
                        'no' => $number,
                        'judul' => $history->judul,
                        'tahun' => $history->tahun,
                        'dana' => is_numeric($history->dana_disetujui)
                            ? 'Rp ' . number_format(
                                $history->dana_disetujui,
                                0,
                                ',',
                                '.'
                            )
                            : $history->dana_disetujui,
                    ];
                }
            );
        }
    }

    private function fillBiodataRows(
        $template,
        $base,
        $suffix,
        $rows,
        $columns,
        $formatRow
    ) {
        $anchor = "{$base}_{$columns[0]}{$suffix}";

        // skip silently when the template does not contain this table
        if (!in_array($anchor, $template->getVariables())) {

            Log::warning(
                "Biodata placeholder not found in template: {$anchor}"
            );

            return;
        }

        if (count($rows) < 1) {

            $template->deleteRow($anchor);

            return;
        }

        $template->cloneRow($anchor, count($rows));

        foreach ($rows as $index => $row) {

            $number = $index + 1;

            $values = $formatRow($row, $number);

            foreach ($columns as $column) {

                $template->setValue(
                    "{$base}_{$column}{$suffix}#{$number}",
                    $this->displayValue($values[$column] ?? null)
                );
            }
        }
    }

    private function formatJudulPublikasi($pub)
    {
        $judul = $pub->judul ?? '-';

        $label = trim(implode(' ', array_filter([
            $pub->category?->nama,
            $pub->peringkat,
        ])));

        if ($label !== '') {
            $judul .= " ({$label})";
        }

        return $judul;
    }

    private function formatPeran($peran)
    {
        $map = [
            'first_author' => 'First Author',
            'corresponding_author' => 'Corresponding Author',
            'co_author' => 'Co Author',
        ];

        return $map[$peran] ?? $peran;
    }

    private function formatJurnal($pub)
    {
        return implode(', ', array_filter([
            $pub->nama_jurnal,
            $pub->tahun,
            $pub->volume ? 'Vol. ' . $pub->volume : null,
            $pub->issn,
        ]));
    }

    private function displayValue($value)
    {
        if ($value === null || $value === '') {
            return '-';
        }

        return (string) $value;
    }

    /*
    |--------------------------------------------------------------------------
    | Template Variable Normalizer
    |--------------------------------------------------------------------------
    | Converts ${var#1} back to ${var} inside the template XML so that
    | PHPWord's cloneRow() can locate the base variable. Word sometimes
    | saves row placeholders with a trailing #1 which breaks cloneRow.
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