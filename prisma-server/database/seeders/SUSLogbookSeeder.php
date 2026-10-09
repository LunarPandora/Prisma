<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class SUSLogbookSeeder extends Seeder
{
    public function run(): void
    {
        $laporans = DB::table('laporan')
            ->join('proposal', 'laporan.proposal_id', '=', 'proposal.proposal_id')
            ->select('laporan.laporan_id', 'laporan.status', 'proposal.user_id')
            ->get();

        if ($laporans->isEmpty()) {
            $this->command->warn('No laporans found — skipping logbook seeding.');
            return;
        }

        $logbookTitles = [
            ['judul' => 'Penyusunan proposal awal',          'deskripsi' => 'Menyusun draf proposal penelitian, merumuskan masalah dan tujuan penelitian.'],
            ['judul' => 'Studi literatur',                   'deskripsi' => 'Membaca dan menganalisis referensi terkait topik penelitian yang dipilih.'],
            ['judul' => 'Pengumpulan data awal',             'deskripsi' => 'Melakukan survei awal dan mengumpulkan data primer dari lapangan.'],
            ['judul' => 'Analisis data',                     'deskripsi' => 'Menganalisis data yang telah terkumpul menggunakan metode statistik.'],
            ['judul' => 'Penyusunan laporan kemajuan',       'deskripsi' => 'Menyusun laporan kemajuan penelitian untuk dievaluasi oleh reviewer.'],
            ['judul' => 'Presentasi kemajuan penelitian',    'deskripsi' => 'Mempresentasikan hasil kemajuan penelitian di hadapan tim LPPM.'],
            ['judul' => 'Verifikasi data lapangan',          'deskripsi' => 'Memverifikasi keakuratan data lapangan dengan data kuesioner.'],
            ['judul' => 'Pengembangan prototipe',            'deskripsi' => 'Membangun prototipe sistem untuk pengujian lebih lanjut.'],
            ['judul' => 'Pengujian sistem',                  'deskripsi' => 'Melakukan pengujian fungsional pada prototipe sistem yang telah dibuat.'],
            ['judul' => 'Penyusunan laporan akhir',          'deskripsi' => 'Menyusun laporan akhir penelitian sesuai template yang ditentukan.'],
            ['judul' => 'Revisi berdasarkan masukan reviewer', 'deskripsi' => 'Melakukan revisi laporan berdasarkan catatan dan masukan dari reviewer.'],
            ['judul' => 'Unggah laporan final',              'deskripsi' => 'Mengunggah laporan akhir yang sudah direvisi ke sistem.'],
        ];

        $count = 0;

        foreach ($laporans as $laporan) {
            $numEntries = rand(1, 6);
            $shuffled = collect($logbookTitles)->shuffle()->take($numEntries)->values();
            $startDate = Carbon::now()->subDays(rand(30, 90));
            $lastLogbookId = null;

            foreach ($shuffled as $i => $entry) {
                $date = $startDate->copy()->addDays($i * rand(3, 8));

                $logbookId = DB::table('logbook_pengerjaan')->insertGetId([
                    'laporan_id'        => $laporan->laporan_id,
                    'user_id'           => $laporan->user_id,
                    'judul'             => $entry['judul'],
                    'deskripsi'         => $entry['deskripsi'],
                    'tgl_kegiatan'      => $date->toDateString(),
                    'lampiran_drive_id' => null,
                    'lampiran_drive_url'=> null,
                    'created_at'        => $date,
                    'updated_at'        => $date,
                ]);

                $lastLogbookId = $logbookId;
                $count++;
            }

            if ($lastLogbookId) {
                DB::table('laporan')
                    ->where('laporan_id', $laporan->laporan_id)
                    ->update(['current_logbook_id' => $lastLogbookId]);
            }
        }

        $this->command->info("Seeded {$count} logbook entries across " . $laporans->count() . " laporans.");
    }
}
