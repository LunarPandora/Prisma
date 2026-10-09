<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ScholarProfile;
use App\Models\ScholarPublication;
use App\Models\ScholarCitationByYear;
use App\Models\PenelitiDetail;
use App\Models\Publication;
use App\Models\PublicationCategory;
use App\Models\Book;
use App\Models\Hki;
use App\Models\ResearchHistory;
use App\Models\ScholarPublicationCitationByYear;

class E2EScholarSeeder extends Seeder
{
    public function run(): void
    {
        $dosen = User::where('email', 'dosen.e2e@itbss.ac.id')->first();
        if (!$dosen) {
            $this->command?->warn('  dosen.e2e user not found, skipping scholar seeder.');
            return;
        }

        // Upsert PenelitiDetail
        $pd = PenelitiDetail::firstOrCreate(
            ['user_id' => $dosen->id],
            [
                'jabatan'          => 'Dosen Tetap',
                'pangkat_golongan' => 'III/a',
                'no_hp'            => '081234567890',
                'sinta_id'         => 'SINTA-20001',
                'scopus_id'        => 'SCOPUS-20001',
                'google_scholar_id'=> 'ABCDEFghijklmnop',
                'h_index'          => 12,
            ]
        );

        // Ensure publication categories exist
        $catScopus = PublicationCategory::firstOrCreate(['nama' => 'Scopus'], ['peringkat' => ['Q1','Q2','Q3','Q4'], 'urutan' => 1]);
        $catInt = PublicationCategory::firstOrCreate(['nama' => 'Internasional'], ['peringkat' => ['Q1','Q2','Q3','Q4'], 'urutan' => 2]);
        $catConf = PublicationCategory::firstOrCreate(['nama' => 'Konferensi'], ['peringkat' => [], 'urutan' => 3]);

        // Create Profil Peneliti publications
        $profilePubs = [
            ['jenis_jurnal' => 'Jurnal', 'pub_category_id' => $catScopus->pub_category_id, 'judul' => 'Machine Learning untuk Deteksi Penipuan di Sektor Keuangan', 'peran' => 'first_author', 'nama_jurnal' => 'IEEE Access', 'tahun' => 2024, 'peringkat' => 'Q1'],
            ['jenis_jurnal' => 'Jurnal', 'pub_category_id' => $catInt->pub_category_id, 'judul' => 'Deep Learning untuk Analisis Citra Medis', 'peran' => 'corresponding_author', 'nama_jurnal' => 'Computers in Biology and Medicine', 'tahun' => 2023, 'peringkat' => 'Q2'],
            ['jenis_jurnal' => 'Konferensi', 'pub_category_id' => $catConf->pub_category_id, 'judul' => 'NLP untuk Teks Bahasa Indonesia', 'peran' => 'first_author', 'nama_jurnal' => 'ACL Anthology', 'tahun' => 2022],
        ];
        foreach ($profilePubs as $pp) {
            Publication::firstOrCreate(
                ['peneliti_detail_id' => $pd->id, 'judul' => $pp['judul']],
                $pp
            );
        }

        // Create Profil Peneliti books
        Book::firstOrCreate(
            ['peneliti_detail_id' => $pd->id, 'judul' => 'Pengantar Kecerdasan Buatan'],
            ['tahun' => 2023, 'isbn' => '978-602-123-456-7', 'penerbit' => 'ITBSS Press']
        );

        // Create Profil Peneliti HKI
        Hki::firstOrCreate(
            ['peneliti_detail_id' => $pd->id, 'judul' => 'Sistem Deteksi Penipuan Berbasis AI'],
            ['tahun' => 2024, 'jenis' => 'Hak Cipta', 'nomor' => 'HKI-2024-001', 'status' => 'granted']
        );

        // Create Profil Peneliti research histories
        ResearchHistory::firstOrCreate(
            ['peneliti_detail_id' => $pd->id, 'judul' => 'Pengembangan Model NLP untuk Teks Bahasa Indonesia'],
            ['kategori' => 'kemdikbud', 'tahun' => 2024, 'dana_disetujui' => 50000000]
        );
        ResearchHistory::firstOrCreate(
            ['peneliti_detail_id' => $pd->id, 'judul' => 'Pelatihan Machine Learning untuk Dosen'],
            ['kategori' => 'internal', 'tahun' => 2023, 'dana_disetujui' => 25000000]
        );
        ResearchHistory::firstOrCreate(
            ['peneliti_detail_id' => $pd->id, 'judul' => 'Analisis Sentimen Media Sosial'],
            ['kategori' => 'kemdikbud', 'tahun' => 2022, 'dana_disetujui' => 35000000]
        );

        // Create Scholar Profile
        $profile = ScholarProfile::firstOrCreate(
            ['user_id' => $dosen->id],
            [
                'scholar_author_id' => 'ABCDEFghijklmnop',
                'profile_url'       => 'https://scholar.google.com/citations?user=ABCDEFghijklmnop',
                'display_name'      => 'Dr. Dosen E2E, S.Kom., M.T.',
                'affiliation'       => 'Institut Teknologi Batam Satu',
                'total_citations'   => 156,
                'h_index'           => 12,
                'i10_index'         => 8,
                'sync_status'       => 'success',
                'last_synced_at'    => now()->subHours(2),
            ]
        );

        // Create Scholar Publications
        $publications = [
            ['title' => 'Deep Learning Approaches for Medical Image Analysis', 'publication_name' => 'IEEE Transactions on Medical Imaging', 'publication_year' => 2024, 'citation_count' => 28, 'authors' => 'Dosen E2E, Author B, Author C'],
            ['title' => 'Transformer Models for Low-Resource Indonesian NLP', 'publication_name' => 'Computational Linguistics', 'publication_year' => 2023, 'citation_count' => 35, 'authors' => 'Dosen E2E, Author D'],
            ['title' => 'Federated Learning for Healthcare Privacy', 'publication_name' => 'Nature Digital Medicine', 'publication_year' => 2023, 'citation_count' => 42, 'authors' => 'Dosen E2E, Author E, Author F'],
            ['title' => 'Sentiment Analysis of Indonesian Social Media', 'publication_name' => 'ACL Anthology', 'publication_year' => 2022, 'citation_count' => 31, 'authors' => 'Dosen E2E'],
            ['title' => 'Explainable AI for Education Systems', 'publication_name' => 'Computers & Education', 'publication_year' => 2022, 'citation_count' => 18, 'authors' => 'Dosen E2E, Author G'],
            ['title' => 'GANs for Data Augmentation in Medical Research', 'publication_name' => 'Medical Image Analysis', 'publication_year' => 2021, 'citation_count' => 2, 'authors' => 'Dosen E2E, Author H'],
        ];

        $pubModels = [];
        foreach ($publications as $i => $pub) {
            $pubModels[] = ScholarPublication::firstOrCreate(
                ['scholar_profile_id' => $profile->scholar_profile_id, 'external_id' => "pub_{$i}"],
                [
                    'title'            => $pub['title'],
                    'authors'          => $pub['authors'],
                    'publication_name' => $pub['publication_name'],
                    'publication_year' => $pub['publication_year'],
                    'citation_count'   => $pub['citation_count'],
                    'publication_url'  => "https://scholar.google.com/citations?view_op=view_citation&citation_for=pub_{$i}",
                    'last_synced_at'   => now(),
                ]
            );
        }

        // Create Citation by Year (profile-level)
        $citationsByYear = [
            ['year' => 2019, 'citation_count' => 5],
            ['year' => 2020, 'citation_count' => 12],
            ['year' => 2021, 'citation_count' => 18],
            ['year' => 2022, 'citation_count' => 28],
            ['year' => 2023, 'citation_count' => 42],
            ['year' => 2024, 'citation_count' => 38],
            ['year' => 2025, 'citation_count' => 13],
        ];

        foreach ($citationsByYear as $cy) {
            ScholarCitationByYear::firstOrCreate(
                ['scholar_profile_id' => $profile->scholar_profile_id, 'year' => $cy['year']],
                ['citation_count' => $cy['citation_count']]
            );
        }

        // Create per-publication citation history
        foreach ($pubModels as $pub) {
            $base = (int)($pub->citation_count * 0.15);
            $years = range($pub->publication_year, 2025);
            foreach ($years as $y) {
                $base = $base + rand(0, 3);
                ScholarPublicationCitationByYear::firstOrCreate(
                    ['scholar_publication_id' => $pub->publication_id, 'year' => $y],
                    ['citation_count' => max(0, $base), 'last_synced_at' => now()]
                );
            }
        }

        $this->command?->info('  ScholarProfile, publications, and citation history seeded for dosen.e2e');
    }
}
