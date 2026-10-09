<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SUSReviewSeeder extends Seeder
{
    public function run()
    {
        $reviewerIds = DB::table('users')
            ->where('role', 'Reviewer')
            ->pluck('id')
            ->toArray();

        if (empty($reviewerIds)) {
            $reviewerIds = range(25, 34);
        }

        $proposals = DB::table('proposal')
            ->whereIn('status', ['Menunggu review', 'Menunggu persetujuan Ketua LPPM'])
            ->whereNotIn('proposal_id', function ($q) {
                $q->select('reviewable_id')
                    ->from('penugasan_reviewer')
                    ->where('reviewable_type', 'App\\Models\\Proposal');
            })
            ->get();

        $temaOptions = ['Sangat Sesuai', 'Sesuai', 'Cukup Sesuai', 'Kurang Sesuai', 'Tidak Sesuai'];
        $catatanOptions = [
            'Proposal sangat baik dan layak didanai.',
            'Perlu perbaikan pada bagian timeline kegiatan.',
            'Metodologi penelitian perlu diperjelas.',
            'Rencana anggaran biaya perlu disesuaikan.',
            'Tinjauan pustaka sudah cukup lengkap.',
            'Tujuan dan sasaran kegiatan sudah jelas.',
            'Perlu penambahan literatur terkini.',
            'Inovasi yang ditawarkan cukup menarik.',
            'Dampak output kegiatan perlu diperjelas.',
            'Luaran yang direncanakan sudah spesifik.',
        ];

        $keputusanWeighted = [];
        for ($i = 0; $i < 4; $i++) $keputusanWeighted[] = 'Diterima';
        for ($i = 0; $i < 4; $i++) $keputusanWeighted[] = 'Diterima dengan perbaikan';
        for ($i = 0; $i < 2; $i++) $keputusanWeighted[] = 'Ditolak';

        $assignmentCount = 0;
        $reviewCount = 0;

        foreach ($proposals as $prop) {
            $assignedReviewerIds = [];
            $shuffledReviewers = $reviewerIds;
            shuffle($shuffledReviewers);
            $assignedReviewerIds = array_slice($shuffledReviewers, 0, 3);

            $numReviewsDone = 0;
            if ($prop->status === 'Menunggu review') {
                $roll = mt_rand(1, 100);
                if ($roll <= 33) {
                    $numReviewsDone = 0;
                } elseif ($roll <= 66) {
                    $numReviewsDone = 1;
                } else {
                    $numReviewsDone = 2;
                }
            } else {
                $numReviewsDone = 3;
            }

            $reviewOrder = [0, 1, 2];
            shuffle($reviewOrder);
            $reviewedIndices = array_slice($reviewOrder, 0, $numReviewsDone);

            $assignmentIds = [];
            for ($i = 0; $i < 3; $i++) {
                $penugasanId = DB::table('penugasan_reviewer')->insertGetId([
                    'reviewable_type' => 'App\\Models\\Proposal',
                    'reviewable_id'   => $prop->proposal_id,
                    'proposal_id'     => $prop->proposal_id,
                    'user_id'         => $assignedReviewerIds[$i],
                    'tgl_penugasan'   => '2026-08-15',
                    'status_review'   => in_array($i, $reviewedIndices) ? 'Telah direview' : 'Belum direview',
                    'created_at'      => now(),
                    'updated_at'      => now(),
                ]);
                $assignmentIds[] = $penugasanId;
                $assignmentCount++;
            }

            if ($prop->status === 'Menunggu persetujuan Ketua LPPM') {
                for ($i = 0; $i < 3; $i++) {
                    DB::table('penugasan_reviewer')
                        ->where('penugasan_id', $assignmentIds[$i])
                        ->update([
                            'status_review' => 'Telah direview',
                            'updated_at'    => now(),
                        ]);
                }
            }

            foreach ($reviewedIndices as $idx) {
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

                $temaCount = mt_rand(1, 3);
                $temaShuffled = $temaOptions;
                shuffle($temaShuffled);
                $selectedTemaNames = array_slice($temaShuffled, 0, $temaCount);
                $kriteriaKesesuaianTema = [];
                foreach ($temaOptions as $tema) {
                    $kriteriaKesesuaianTema[] = [
                        'question' => $tema,
                        'checked' => in_array($tema, $selectedTemaNames),
                    ];
                }

                DB::table('review')->insert([
                    'penugasan_id'             => $assignmentIds[$idx],
                    'keputusan'               => $keputusanWeighted[array_rand($keputusanWeighted)],
                    'kriteria_kesesuaian_tema' => json_encode($kriteriaKesesuaianTema),
                    'kriteria_penilaian'       => json_encode($kriteriaPenilaian),
                    'catatan'                 => $catatanOptions[array_rand($catatanOptions)],
                    'tgl_review'              => '2026-08-15',
                    'created_at'              => now(),
                    'updated_at'              => now(),
                ]);
                $reviewCount++;
            }
        }

        $assignmentCount = DB::table('penugasan_reviewer')
            ->where('reviewable_type', 'App\\Models\\Proposal')
            ->count();
        $reviewCount = DB::table('review')->count();

        $this->command->info("Created {$assignmentCount} proposal reviewer assignments.");
        $this->command->info("Created {$reviewCount} proposal reviews.");
    }
}
