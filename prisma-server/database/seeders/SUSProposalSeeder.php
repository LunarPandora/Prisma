<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use App\Models\Proposal;
use App\Models\ProposalMember;
use App\Models\Dokumen;
use App\Models\DokumenVersion;

class SUSProposalSeeder extends Seeder
{
    public $proposals = [];
    public $prodi;
    public $dosen;
    public $staff;
    public $ketua;
    public $skema;
    public $kegiatan;

    public function init($prodi, $dosen, $staff, $ketua, $skema, $kegiatan)
    {
        $this->prodi = $prodi;
        $this->dosen = $dosen;
        $this->staff = $staff;
        $this->ketua = $ketua;
        $this->skema = $skema;
        $this->kegiatan = $kegiatan;
    }

    public function run()
    {
        $this->seedProposals();
        $this->command->info("Seeded " . count($this->proposals) . " proposals");
    }

    protected function createDummyPdf($folder, $name)
    {
        $slug = Str::slug($name);
        $date = Carbon::now()->format('Ymd');
        $random = Str::random(8);
        $filename = "{$slug}_{$date}_{$random}.pdf";
        $path = "documents/{$folder}/{$filename}";

        $pdf = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF";

        Storage::disk('public')->put($path, $pdf);

        return $path;
    }

    protected function seedProposals()
    {
        $titles = [
            'Implementasi Deep Learning untuk Deteksi Penyakit Tanaman Padi Berbasis Citra',
            'Sistem IoT Monitoring Kualitas Air Sungai dengan Machine Learning',
            'Optimasi Smart Traffic Light Berbasis Edge Computing di Kawasan Perkotaan',
            'Pengembangan Aplikasi E-Learning Adaptif menggunakan Natural Language Processing',
            'Analisis Sentimen Ulasan Pengguna Produk Kesehatan Herbal di Media Sosial',
            'Sistem Presensi Wajah Berbasis Facial Recognition dengan Liveness Detection',
            'Pemanfaatan Blockchain untuk Rantai Pasok Produk Pertanian Organik',
            'Model Prediksi Banjir Kota Menggunakan Ensemble Learning dan Data Spasial',
            'Pengembangan Robot Pemilah Sampah Otomatis dengan Computer Vision',
            'Platform Telemedicine Berbasis Mobile untuk Pelayanan Kesehatan Rural',
            'Optimasi Rute Pengiriman Logistik menggunakan Algoritma Genetika',
            'Sistem Rekomendasi Pemilihan Program Studi Berdasarkan Profil Mahasiswa',
            'Deteksi Deepfake Video Menggunakan Convolutional Neural Network',
            'Pengembangan Smart Agriculture System Berbasis Drone dan IoT',
            'Analisis Big Data untuk Prediksi Tingkat Kejahatan Urban',
            'Sistem Penunjang Keputusan Klinis Berbasis Knowledge Graph',
            'Penerapan Augmented Reality untuk Pembelajaran Anatomi Manusia',
            'Protokol Keamanan Jaringan IoT untuk Smart Building',
            'Pengembangan Chatbot Edukasi Kesehatan Mental Berbasis Transformer',
            'Model Penilaian Risiko Kredit UMKM menggunakan Machine Learning',
            'Sistem Monitoring Kualitas Udara Real-Time Berbasis LoRaWAN',
            'Pengembangan Game Edukasi Programming untuk Anak Usia Dini',
            'Optimasi Energi Panel Surya menggunakan Reinforcement Learning',
            'Sistem Pendukung Keputusan Pemilihan Varietas Tanaman Pangan',
            'Implementasi Federated Learning untuk Privasi Data Pasien',
            'Pengembangan Smart Parking System Berbasis Sensor Ultrasonik',
            'Analisis Jaringan Sosial untuk Identifikasi Penyebaran Hoaks Kesehatan',
            'Sistem Automatic Speech Recognition Bahasa Daerah untuk Dokumentasi',
            'Pengembangan Greenhouse Monitoring dan Control System IoT',
            'Prediksi Masa Panen Sawit Menggunakan Time Series Analysis',
            'Sistem Deteksi Penyakit Kulit Berbasis Transfer Learning',
            'Pengembangan Sistem Informasi Geografis Bencana Alam Real-Time',
            'Optimasi Supply Chain Manufaktur dengan Digital Twin',
            'Pengembangan Wearable Device untuk Monitoring Penderita Diabetes',
            'Sistem Keamanan Cerdas Berbasis Face Recognition dan Sensor Gerak',
            'Pengembangan Virtual Laboratory untuk Praktikum Kimia Daring',
            'Pemanfaatan Data Mining untuk Segmentasi Pelanggan Toko Online',
            'Sistem Prediksi Gagal Jantung Menggunakan Gradient Boosting',
            'Pengembangan Smart Waste Management Berbasis Komunitas',
            'Implementasi Zero Trust Architecture untuk Infrastruktur Cloud',
            'Pengembangan Sistem Penilaian Otomatis Esai Mahasiswa menggunakan NLP',
            'Optimasi Irigasi Pintar Berbasis Sensor Tanah dan Cuaca',
            'Pengembangan Aplikasi Penerjemah Isyarat Tangan Real-Time',
            'Sistem Deteksi Anomali Jaringan Komputer menggunakan Autoencoder',
            'Pengembangan Platform Crowdfunding UMKM Berbasis Blockchain',
            'Pengembangan Sistem Smart Classroom untuk Pembelajaran Personalisasi',
            'Implementasi Edge Computing untuk Reduksi Latency IoT',
            'Pengembangan Aplikasi E-Commerce Berbasis Microservices',
            'Analisis Performance Tuning Database untuk High Traffic',
            'Sistem Manajemen Repositori Terdistribusi menggunakan Git',
            'Pengembangan CMS Headless untuk Multi-Platform Publishing',
            'Implementasi CI/CD Pipeline untuk DevOps Berkelanjutan',
            'Pengembangan Authentication System Multi-Factor',
            'Optimasi Query Database untuk Business Intelligence',
            'Sistem Monitoring Server Real-Time Dashboard',
            'Pengembangan RESTful API Gateway untuk Microservices',
            'Analisis Load Testing untuk Sistem Informasi Akademik',
            'Pengembangan Sistem Keuangan Terintegrasi Real-Time',
            'Implementasi Data Warehouse untuk Analitik Prediktif',
            'Pengembangan Sistem HRM Berbasis Web dan Mobile',
            'Analisis User Experience pada Portal Akademik',
            'Pengembangan Content Management System Perguruan Tinggi',
            'Implementasi Cloud Computing untuk Infrastruktur Pendidikan',
            'Pengembangan Sistem Pendukung Keputusan Akademik',
            'Analisis Dampak Transformasi Digital pada Proses Bisnis',
            'Pengembangan Platform Online Learning dengan AI Tutor',
            'Implementasi Smart Campus IoT untuk Efisiensi Energi',
            'Pengembangan Sistem Informasi Geospasial Kampus',
            'Analisis Big Data untuk Optimasi Rekrutmen Dosen',
            'Pengembangan Mobile App untuk Aktivitas Kemahasiswaan',
            'Implementasi Chatbot untuk Layanan Administrasi Kampus',
            'Pengembangan Sistem Manajemen Penelitian Terintegrasi',
            'Analisis Sentimen terhadap Kualitas Pengajaran Online',
            'Pengembangan Platform e-Skripsi untuk Manajemen Tugas Akhir',
            'Implementasi Blockchain untuk Verifikasi Dokumen Akademik',
            'Pengembangan Sistem Presensi Geolocation untuk Dosen',
            'Analisis Predictive Analytics untuk Retensi Mahasiswa',
            'Pengembangan Web Portal Integrasi Data Kampus',
            'Implementasi Machine Learning untuk Deteksi Plagiarisme',
            'Pengembangan Sistem Informasi Perpustakaan Digital',
            'Analisis Kinerja Algoritma Sorting untuk Big Data',
            'Pengembangan Game Simulasi Manajemen Bisnis UMKM',
            'Implementasi Deep Learning untuk Prediksi Jumlah Mahasiswa',
            'Pengembangan Sistem Konsultasi Akademik Online',
            'Analisis Framework untuk Pengembangan Aplikasi Cross-Platform',
            'Pengembangan Platform E-Learning dengan Gamifikasi',
            'Implementasi Computer Vision untuk Klasifikasi Citra Medis',
            'Pengembangan Sistem Informasi Fasilitas Kampus',
            'Analisis Kualitas Layanan Digital Berdasarkan Metrik Uptime',
            'Pengembangan Mobile Payment System untuk Kantin Kampus',
            'Implementasi Natural Language Processing untuk Resume Matching',
            'Pengembangan Sistem Manajemen Kurikulum Berbasis Web',
            'Analisis Teknik Feature Engineering untuk Data Mining',
            'Pengembangan Virtual Assistant untuk Helpdesk IT',
            'Implementasi IoT untuk Monitoring Suhu Gudang Farmasi',
            'Pengembangan Sistem Booking Ruangan Kampus Real-Time',
            'Analisis Comparative Study Framework PHP untuk E-Commerce',
            'Pengembangan Platform Crowdfunding Penelitian Berbasis Web',
            'Implementasi Image Recognition untuk Identifikasi Tanaman Obat',
            'Pengembangan Sistem Evaluasi Dosen Online',
            'Analisis Optimalisasi Algoritma Genetic untuk Scheduling',
            'Pengembangan Chatbot Customer Service untuk BPR Digital',
            'Implementasi Sentiment Analysis untuk Monitoring Brand',
            'Pengembangan Sistem Manajemen Aset Digital Institusi',
            'Analisis Keamanan Aplikasi Mobile Banking Berbasis OWASP',
            'Pengembangan Platform E-Learning Adaptif Berbasis AI',
            'Implementasi Federated Learning untuk Klasifikasi Privat',
            'Pengembangan Sistem Otomasi Laporan Keuangan UMKM',
            'Analisis Deep Learning untuk Proses Citra Satelit',
            'Pengembangan Smart Warehouse Management System',
            'Implementasi Recommendation System untuk Mahasiswa Baru',
            'Pengembangan Sistem Informasi Logistik Distribusi',
            'Analisis Ensemble Methods untuk Prediksi Cuaca',
            'Pengembangan Platform Digital Marketing Analytics',
            'Implementasi Speech Recognition untuk Transkripsi Meeting',
            'Pengembangan Sistem Manajemen Proyek Agile Berbasis Web',
            'Analisis Transfer Learning untuk Deteksi Anomali Manufaktur',
            'Pengembangan Aplikasi Telehealth untuk Konsultasi Dokter',
            'Implementasi IoT untuk Monitoring Kualitas Tanah Pertanian',
            'Pengembangan Sistem Pencatatan Keuangan UMKM Real-Time',
            'Analisis Teknik Oversampling untuk Imbalanced Data',
            'Pengembangan Platform Pemesanan Makanan Online',
            'Implementasi Computer Vision untuk Inspeksi Kualitas Produksi',
            'Pengembangan Sistem Manajemen Inventaris Gudang',
            'Analisis Gradient Boosting untuk Prediksi Harga Komoditas',
            'Pengembangan E-Office untuk Digitalisasi Kantor',
            'Implementasi Object Detection untuk Sistem Keamanan',
            'Pengembangan Sistem Informasi Manajemen Rumah Sakit',
            'Analisis Time Series Forecasting untuk Permintaan Energi',
            'Pengembangan Platform Konsultasi Hukum Online',
            'Implementasi NLP untuk Analisis Ulasan Produk E-Commerce',
            'Pengembangan Sistem Manajemen Event Kampus',
            'Analisis Classification untuk Deteksi Email Spam Bisnis',
            'Pengembangan Mobile Banking Application untuk Koperasi',
            'Implementasi Image Segmentation untuk Diagnosis Medis',
            'Pengembangan Sistem Pendukung Keputusan Investasi',
            'Analisis Clustering untuk Segmentasi Pelanggan Retail',
            'Pengembangan Platform E-Health untuk Rekam Medis',
            'Implementasi Reinforcement Learning untuk Traffic Control',
            'Pengembangan Smart Attendance System dengan Geofencing',
            'Analisis Anomaly Detection untuk Keamanan Jaringan',
            'Pengembangan Platform Marketplace UMKM Digital',
            'Implementasi Lip Sync untuk Animasi Karakter Virtual',
            'Pengembangan Sistem Manajemen Klaim Asuransi Digital',
            'Analisis Collaborative Filtering untuk Sistem Rekomendasi',
            'Pengembangan Digital Twin untuk Simulasi Pabrik Cerdas',
            'Implementasi Knowledge Graph untuk Mesin Pencari Kampus',
            'Pengembangan Sistem Real-Time Bidding untuk Iklan Digital',
            'Analisis Dropout Prediction untuk Mahasiswa Menggunakan Data Mining',
            'Pengembangan Platform Donation Management untuk Filantropi',
            'Implementasi Multimodal AI untuk Sistem Penunjang Keputusan Klinis',
            'Pengembangan Sistem Smart Inventory untuk Apotek',
            'Analisis A/B Testing Framework untuk Optimasi Website',
            'Pengembangan Mobile Fitness Tracker dengan Sensor Wearable',
            'Implementasi Document Understanding AI untuk Invoice Processing',
            'Pengembangan Sistem Konseling Online untuk Mahasiswa',
            'Analisis Model Compression untuk Edge AI Deployment',
            'Pengembangan Platform Complaint Management untuk Layanan Publik',
            'Implementasi Zero-Knowledge Proof untuk Privasi Data Kesehatan',
            'Pengembangan Sistem Ticketing Helpdesk IT Berbasis AI',
            'Analisis Concept Drift Detection untuk Model Machine Learning',
            'Pengembangan Smart Traffic Management untuk Kota Cerdas',
            'Implementasi Few-Shot Learning untuk Klasifikasi Produk Langka',
            'Pengembangan Sistem Informasi Manajemen Mutu Berbasis Web',
            'Analisis Explainable AI untuk Transparansi Model Prediktif',
            'Pengembangan Platform Crowdsourcing Data Lingkungan',
            'Implementasi Anomaly-Based IDS untuk Keamanan Jaringan Kampus',
            'Pengembangan Sistem Otomasi Pemrosesan Dokumen Akademik',
            'Analisis Multi-Objective Optimization untuk Penjadwalan Kuliah',
            'Pengembangan Platform Digital Twin untuk Gedung Kampus',
            'Implementasi Real-Time Object Tracking untuk Robotika',
            'Pengembangan Sistem Manajemen Risiko Berbasis Data Analytics',
            'Analisis Impact Analysis untuk Transformasi Digital UMKM',
            'Pengembangan Smart Library System dengan IoT Sensors',
            'Implementasi Neural Architecture Search untuk Optimasi Model',
            'Pengembangan Sistem Informasi Tata Ruang Kampus',
            'Analisis Performance Benchmarking untuk Database Cloud Native',
        ];

        $statuses = [
            ['status' => 'Draft', 'count' => 15, 'kegiatan_code' => 'PENERIMAAN_PROPOSAL', 'ketua_approved' => false, 'staff_approved' => false, 'tahap' => 'Proposal', 'jenis' => 'Penelitian'],
            ['status' => 'Menunggu proposal untuk diupload', 'count' => 12, 'kegiatan_code' => 'PENERIMAAN_PROPOSAL', 'ketua_approved' => false, 'staff_approved' => false, 'tahap' => 'Proposal', 'jenis' => null],
            ['status' => 'Menunggu review dari Ketua LPPM', 'count' => 9, 'kegiatan_code' => 'SELEKSI_PROPOSAL', 'ketua_approved' => false, 'staff_approved' => true, 'tahap' => 'Proposal', 'jenis' => null],
            ['status' => 'Menunggu review Staff LPPM', 'count' => 9, 'kegiatan_code' => 'SELEKSI_PROPOSAL', 'ketua_approved' => false, 'staff_approved' => false, 'tahap' => 'Proposal', 'jenis' => null],
            ['status' => 'Menunggu penugasan reviewer', 'count' => 9, 'kegiatan_code' => 'SELEKSI_PROPOSAL', 'ketua_approved' => true, 'staff_approved' => true, 'tahap' => 'Proposal', 'jenis' => null],
            ['status' => 'Menunggu review', 'count' => 12, 'kegiatan_code' => 'SELEKSI_PROPOSAL', 'ketua_approved' => true, 'staff_approved' => true, 'tahap' => 'Proposal', 'jenis' => null],
            ['status' => 'Menunggu persetujuan Ketua LPPM', 'count' => 9, 'kegiatan_code' => 'SELEKSI_PROPOSAL', 'ketua_approved' => true, 'staff_approved' => true, 'tahap' => 'Proposal', 'jenis' => null],
            ['status' => 'Proposal Diterima', 'count' => 42, 'kegiatan_code' => 'PENGUMUMAN_SURAT_TUGAS', 'ketua_approved' => true, 'staff_approved' => true, 'tahap' => 'Laporan', 'jenis' => null],
            ['status' => 'Ditolak', 'count' => 9, 'kegiatan_code' => 'SELEKSI_PROPOSAL', 'ketua_approved' => true, 'staff_approved' => true, 'tahap' => 'Proposal', 'jenis' => null],
            ['status' => 'Revisi', 'count' => 9, 'kegiatan_code' => 'SELEKSI_PROPOSAL', 'ketua_approved' => true, 'staff_approved' => true, 'tahap' => 'Proposal', 'jenis' => null],
        ];

        $acceptedJenisList = array_merge(array_fill(0, 24, 'Penelitian'), array_fill(0, 18, 'PkM'));

        $dosenIndex = 0;
        $titleIndex = 0;

        foreach ($statuses as $statusConfig) {
            for ($i = 0; $i < $statusConfig['count']; $i++) {
                $judul = $titles[$titleIndex] ?? 'Judul Proposal Penelitian Ke-' . ($titleIndex + 1);

                $jenis = $statusConfig['jenis'];
                if ($jenis === null) {
                    if ($statusConfig['status'] === 'Proposal Diterima') {
                        $jenis = $acceptedJenisList[$i] ?? 'Penelitian';
                    } else {
                        $jenis = $i % 2 === 0 ? 'Penelitian' : 'PkM';
                    }
                }

                $tahap = $statusConfig['tahap'];
                $kegiatanId = $this->kegiatan[$statusConfig['kegiatan_code']]->kegiatan_id ?? null;

                $topikOptions = ['Teknologi Informasi', 'Kesehatan Masyarakat', 'Lingkungan Hidup', 'Pertanian', 'Pendidikan', 'Ekonomi', 'Keamanan Siber'];
                $bidangOptions = ['Ilmu Komputer', 'Kedokteran', 'Biologi', 'Teknik', 'Ekonomi', 'Pertanian', 'Kesehatan'];
                $fokusOptions = ['SDG 1', 'SDG 2', 'SDG 3', 'SDG 4', 'SDG 5', 'SDG 6', 'SDG 7', 'SDG 8', 'SDG 9', 'SDG 11', 'SDG 12', 'SDG 13'];

                $proposal = Proposal::create([
                    'jenis_penelitian' => $jenis,
                    'jenis_penelitian_gan' => $jenis,
                    'jenis_penelitian_gen' => $jenis,
                    'judul' => $judul,
                    'tahap_penelitian' => $tahap,
                    'topik_penelitian' => $topikOptions[array_rand($topikOptions)],
                    'bidang_ilmu' => $bidangOptions[array_rand($bidangOptions)],
                    'fokus_sdg' => $fokusOptions[array_rand($fokusOptions)],
                    'skema' => 'Internal',
                    'sumber_skema' => 'Dana Internal',
                    'user_id' => $this->dosen[$dosenIndex % count($this->dosen)]->id ?? 1,
                    'kegiatan_id' => $kegiatanId,
                    'status' => $statusConfig['status'],
                    'ketua_seleksi_approved' => $statusConfig['ketua_approved'],
                    'staff_seleksi_approved' => $statusConfig['staff_approved'],
                    'tgl_pengajuan' => '2026-08-15',
                    'ra_biaya_penelitian_gan' => 5000000,
                    'ra_biaya_publikasi_gan' => 2000000,
                    'ra_insentif_gan' => 1000000,
                    'ra_biaya_penelitian_gen' => 5000000,
                    'ra_biaya_publikasi_gen' => 2000000,
                    'ra_insentif_gen' => 1000000,
                    'target_publikasi_gan' => 'Jurnal Nasional',
                    'target_publikasi_gen' => 'Jurnal Nasional',
                    'rencana_judul_publikasi_gan' => $judul . ' - Volume Ganjil',
                    'rencana_judul_publikasi_gen' => $judul . ' - Volume Genap',
                    'metopen_gan' => 'Mixed Methods',
                    'metopen_gen' => 'Mixed Methods',
                    'unit_analisis_gan' => 'Sample Penelitian',
                    'unit_analisis_gen' => 'Sample Penelitian',
                    'kontribusi_ilmu_makul' => 'Kontribusi Ilmu',
                    'kontribusi_pkm' => 'Kontribusi PkM',
                    'rencana_luaran' => 'Jurnal Nasional',
                    'institusi_mitra' => 'Institusi Mitra',
                ]);

                $this->proposals[] = $proposal;

                // Create proposal members (anggota peneliti)
                $memberRoles = [
                    'Ketua Tim Peneliti',
                    'Anggota Peneliti',
                    'Anggota Peneliti',
                    'Asisten Peneliti',
                ];

                // Member 1: Owner as Ketua
                ProposalMember::create([
                    'proposal_id' => $proposal->proposal_id,
                    'member_id' => $proposal->user_id,
                    'role' => 'Dosen',
                    'semester' => 'Ganjil',
                    'ttjp' => $memberRoles[0],
                ]);

                // Members 2-3: Additional Dosen
                $dosenCount = rand(1, 2);
                for ($m = 0; $m < $dosenCount; $m++) {
                    $memberDosenIdx = ($dosenIndex + $m + 1) % count($this->dosen);
                    if ($this->dosen[$memberDosenIdx]->id !== $proposal->user_id) {
                        ProposalMember::create([
                            'proposal_id' => $proposal->proposal_id,
                            'member_id' => $this->dosen[$memberDosenIdx]->id,
                            'role' => 'Dosen',
                            'semester' => $m % 2 === 0 ? 'Ganjil' : 'Genap',
                            'ttjp' => $memberRoles[($m + 1) % count($memberRoles)],
                        ]);
                    }
                }

                // Member 4: Mahasiswa (every 3rd proposal)
                if ($titleIndex % 3 === 0 && isset($this->dosen[0])) {
                    ProposalMember::create([
                        'proposal_id' => $proposal->proposal_id,
                        'member_id' => ($titleIndex % 15) + 1,
                        'role' => 'Mahasiswa',
                        'semester' => 'Ganjil',
                        'ttjp' => 'Asisten Riset',
                    ]);
                }

                if ($statusConfig['status'] === 'Proposal Diterima') {
                    $pdfPath = $this->createDummyPdf('proposal', $judul);

                    $dokumen = Dokumen::create([
                        'documentable_id' => $proposal->proposal_id,
                        'documentable_type' => Proposal::class,
                        'jenis_dokumen' => 'Dokumen Proposal',
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
                        'catatan_revisi' => '',
                        'tgl_upload' => '2026-08-15',
                    ]);

                    $dokumen->current_version_id = $version->version_id;
                    $dokumen->save();
                }

                $dosenIndex++;
                $titleIndex++;
            }
        }
    }
}