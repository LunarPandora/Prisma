<?php

namespace App\Helpers;

use App\Models\KegiatanPengajuan;
use App\Models\Proposal;
use App\Models\Laporan;
use App\Models\Settings;

/*
|--------------------------------------------------------------------------
| KegiatanStage
|--------------------------------------------------------------------------
| Central authority for what stage a Proposal / Laporan is in. The stage
| is determined entirely by the row's kegiatan_id → kode_kegiatan; there is
| no parallel state to keep in sync.
|
| Access-control rule: an action attached to stage X is only permitted
| when the record's periode row has kode_kegiatan = X and today's date
| falls within its [tgl_mulai, tgl_selesai] window, and the parent
| skema is 'Aktif'. Advancing to the next stage means repointing the
| record's kegiatan_id to the sibling row (same skema_id +
| jenis_penelitian) that carries the target kode.
|
| Sequences are split by (jenis_penelitian, semester) for Laporan so that
| Ganjil and Genap instances of the same proposal advance independently
| through their own stage list, meeting only at the terminal LUARAN_*.
|--------------------------------------------------------------------------
*/

class KegiatanStage
{
    /*
    |--------------------------------------------------------------------------
    | Proposal sequence
    |--------------------------------------------------------------------------
    | The crossover from PENGUMUMAN_SURAT_TUGAS into the first laporan stage is
    | handled explicitly by PengumumanSuratTugasController — proposal advance()
    | does not walk into laporan territory.
    |--------------------------------------------------------------------------
    */

    public const PROPOSAL_SEQUENCE = [
        'PENERIMAAN_PROPOSAL',
        'SELEKSI_PROPOSAL',
        'PENGUMUMAN_SURAT_TUGAS',
    ];

    /*
    |--------------------------------------------------------------------------
    | Laporan sequences (semester-specific)
    |--------------------------------------------------------------------------
    */

    public static function laporanSequence(string $jenisPenelitian, string $semester): array
    {
        $sem = strtoupper($semester);

        if ($jenisPenelitian === 'PkM') {
            return [
                "CLAIM_DANA_{$sem}",
                "PROSES_PKM_{$sem}",
                "PUBLIKASI_{$sem}",
                "PENGEMBALIAN_DANA_{$sem}",
                "DISEMINASI_{$sem}",
                'LUARAN_PKM',
            ];
        }

        return [
            "PROSES_PENELITIAN_{$sem}",
            "PUBLIKASI_{$sem}",
            "DISEMINASI_{$sem}",
            "CLAIM_DANA_{$sem}",
            'LUARAN_PENELITIAN',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Dispatch to the right sequence for any record type
    |--------------------------------------------------------------------------
    */

    public static function sequenceFor($record): array
    {
        if ($record instanceof Proposal) {
            return self::PROPOSAL_SEQUENCE;
        }

        if ($record instanceof Laporan) {

            $jenis = $record->proposal?->jenis_penelitian ?? 'Penelitian';

            return self::laporanSequence($jenis, $record->semester ?? 'Ganjil');
        }

        return [];
    }

    /*
    |--------------------------------------------------------------------------
    | First laporan stage for a given (jenis, semester)
    |--------------------------------------------------------------------------
    | Used by PengumumanSuratTugasController when it needs to point a fresh Laporan
    | at its starting kode without needing an instance to inspect.
    |--------------------------------------------------------------------------
    */

    public static function firstLaporanStage(string $jenisPenelitian, string $semester): string
    {
        return self::laporanSequence($jenisPenelitian, $semester)[0];
    }

    /*
    |--------------------------------------------------------------------------
    | Current kode of a record (via its periode row)
    |--------------------------------------------------------------------------
    */

    public static function currentKode($record): ?string
    {
        if (!$record) {
            return null;
        }

        return $record->kegiatan()
            ->withTrashed()
            ->first()
            ?->kode_kegiatan;
    }

    public static function currentSkemaId($record): ?int
    {
        return $record?->kegiatan()
            ?->withTrashed()
            ?->first()
            ?->skema_id;
    }

    /*
    |--------------------------------------------------------------------------
    | Compute the next kode after $current in the record's sequence.
    |--------------------------------------------------------------------------
    | Returns null if $current is the last stage or is not in the sequence.
    |--------------------------------------------------------------------------
    */

    public static function nextKode(string $current, $record): ?string
    {
        $sequence = self::sequenceFor($record);

        $index = array_search($current, $sequence, true);

        if ($index === false) {
            return null;
        }

        return $sequence[$index + 1] ?? null;
    }

    /*
    |--------------------------------------------------------------------------
    | The last non-Luaran stage in the sequence (terminal workflow stage).
    |--------------------------------------------------------------------------
    | For Penelitian: CLAIM_DANA_{SEM}
    | For PkM: DISEMINASI_{SEM}
    |--------------------------------------------------------------------------
    */

    public static function lastNonLuaranStage(string $jenisPenelitian, string $semester): ?string
    {
        $sequence = self::laporanSequence($jenisPenelitian, $semester);
        $filtered = array_filter($sequence, fn($k) => !str_starts_with($k, 'LUARAN_'));
        return end($filtered) ?: null;
    }

    /*
    |--------------------------------------------------------------------------
    | Returns the previous kode in the sequence for $record, or null.
    |--------------------------------------------------------------------------
    */

    public static function previousKode(string $current, $record): ?string
    {
        $sequence = self::sequenceFor($record);

        $index = array_search($current, $sequence, true);

        if ($index === false || $index === 0) {
            return null;
        }

        return $sequence[$index - 1] ?? null;
    }

    /*
    |--------------------------------------------------------------------------
    | Is the stage keyed by $kode currently open for $record?
    |--------------------------------------------------------------------------
    | A stage is open when:
    |
    |  1. A periode row exists for this skema + jenis + kode.
    |  2. The parent Skema is 'Aktif' (admin can pause a whole skema).
    |
    | Access rules (in order):
    |  - If ignore_kegiatan_dates is enabled in Settings → always open.
    |  - Otherwise, use the periode's effective_status:
    |      * 'Terbuka' → open (manual override or date-range match).
    |      * Anything else → closed.
    |--------------------------------------------------------------------------
    */

    public static function isOpen($record, string $kode): bool
    {
        $skemaId = self::currentSkemaId($record);

        if (!$skemaId) {
            return false;
        }

        $settings = Settings::first();

        if ($settings && $settings->ignore_kegiatan_dates) {
            return true;
        }

        $kegiatan = KegiatanPengajuan::query()
            ->select('kegiatan_pengajuan.*')
            ->join('skema', 'skema.skema_id', '=', 'kegiatan_pengajuan.skema_id')
            ->where('kegiatan_pengajuan.skema_id', $skemaId)
            ->where('kegiatan_pengajuan.jenis_penelitian', self::jenisOf($record))
            ->where('kegiatan_pengajuan.kode_kegiatan', $kode)
            ->where('skema.status', 'Aktif')
            ->first();

        if (!$kegiatan) {
            return false;
        }

        return $kegiatan->effective_status === 'Terbuka';
    }

    /*
    |--------------------------------------------------------------------------
    | Locate the sibling periode row that carries a target kode.
    |--------------------------------------------------------------------------
    */

    public static function findKegiatan($record, string $kode): ?KegiatanPengajuan
    {
        $skemaId = self::currentSkemaId($record);

        if (!$skemaId) {
            return null;
        }

        return KegiatanPengajuan::where('skema_id', $skemaId)
            ->where('jenis_penelitian', self::jenisOf($record))
            ->where('kode_kegiatan', $kode)
            ->first();
    }

    /*
    |--------------------------------------------------------------------------
    | Advance $record's kegiatan_id to the row carrying $targetKode.
    |--------------------------------------------------------------------------
    | Returns the KegiatanPengajuan the record now points at, or null if the
    | target row does not exist for this skema/jenis (nothing changed).
    |--------------------------------------------------------------------------
    */

    public static function move($record, string $targetKode): ?KegiatanPengajuan
    {
        $target = self::findKegiatan($record, $targetKode);

        if (!$target) {
            return null;
        }

        $record->update([
            'kegiatan_id' => $target->kegiatan_id,
        ]);

        return $target;
    }

    /*
    |--------------------------------------------------------------------------
    | Advance $record to whatever the next stage in its sequence is.
    |--------------------------------------------------------------------------
    */

    public static function advance($record): ?KegiatanPengajuan
    {
        $current = self::currentKode($record);

        if (!$current) {
            return null;
        }

        $next = self::nextKode($current, $record);

        if (!$next) {
            return null;
        }

        return self::move($record, $next);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    private static function jenisOf($record): ?string
    {
        if ($record instanceof Proposal) {
            return $record->jenis_penelitian_gan;
        }

        if ($record instanceof Laporan) {
            return $record->jenis_penelitian ?? $record->proposal?->jenis_penelitian;
        }

        return $record->jenis_penelitian ?? null;
    }
}
