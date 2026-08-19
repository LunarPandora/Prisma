<?php

namespace App\Helpers;

class NotificationUrl
{
    private const ROLE_MODULE = [
        'Staff LPPM' => [
            'proposal' => 'staffmonitoringprogress',
            'laporan'  => 'staffmonitoringprogresslaporan',
        ],
        'Ketua LPPM' => [
            'proposal' => 'staffmonitoringprogress',
            'laporan'  => 'staffmonitoringprogresslaporan',
        ],
        'Dosen' => [
            'proposal' => 'dosenmonitoringprogress',
            'laporan'  => 'dosenmonitoringprogresslaporan',
        ],
        'Reviewer' => [
            'proposal' => 'reviewproposal',
        ],
    ];

    public static function forRole(
        string $role,
        string $type,
        ?int $skemaId = null,
        ?int $itemId = null,
        ?string $tab = null,
        ?string $jenisPenelitian = null
    ): string {
        $moduleKey = self::ROLE_MODULE[$role][$type] ?? null;
        if (!$moduleKey) return '/dashboard';

        $url = "/dashboard?module={$moduleKey}";
        if ($skemaId) {
            $url .= "&skema_id={$skemaId}&view={$type}";
        }
        if ($itemId) {
            $param = $type === 'proposal' ? 'proposal_id' : 'laporan_id';
            $url .= "&{$param}={$itemId}";
        }
        if ($tab) {
            $url .= "&tab={$tab}";
        }
        if ($jenisPenelitian) {
            $url .= "&jenis=" . urlencode($jenisPenelitian);
        }
        return $url;
    }

    /**
     * Derive the tab key from a laporan's kode_kegiatan.
     * e.g., "PUBLIKASI_GANJIL" → "PUBLIKASI", "PROSES_PENELITIAN_GENAP" → "PROSES_PENELITIAN"
     */
    public static function laporanTab(?string $kodeKegiatan): ?string
    {
        if (!$kodeKegiatan) return null;
        return preg_replace('/_(GANJIL|GENAP)$/', '', $kodeKegiatan);
    }
}
