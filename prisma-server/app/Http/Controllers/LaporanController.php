<?php

namespace App\Http\Controllers;

use App\Models\Laporan;
use App\Models\LaporanMember;
use App\Models\PenelitiDetail;
use App\Models\ProposalMember;
use App\Models\Settings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\Dosen\LaporanDosenResource;

use App\Services\LaporanAkhirDocxService;
use App\Services\DocumentService;
use App\Helpers\ApiResponse;
use App\Helpers\KegiatanStage;
use App\Helpers\NotificationUrl;

class LaporanController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Laporan::query()
            ->with([
                'proposal' => fn($q) => $q->withTrashed(),
                'proposal.user' => fn($q) => $q->withTrashed(),
                'proposal.user.prodi',
                'proposal.memberDosenProposal.user',
                'proposal.memberMhswaProposal.mahasiswa',
                'proposal.memberKolabProposal.kolaborator',
                'kegiatan' => fn($q) => $q->withTrashed(),
                'kegiatan.skema',
                'dokumen.currentVersion',
                'penugasan' => fn($q) => $q->with([
                    'reviewer' => fn($q2) => $q2->select('id', 'nama', 'avatar'),
                    'review',
                ]),
                'laporanMember' => fn($q) => $q->with([
                    'user' => fn($q2) => $q2->withTrashed(),
                    'mahasiswa',
                    'kolaborator',
                ])->orderBy('position'),
                'realisasiAnggaran',
            ]);

        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->boolean('completed')) {
            $query->whereNotNull('completed_at');
        } elseif ($request->boolean('active')) {
            $query->whereNull('completed_at');
        }

        if ($request->filled('kode_kegiatan')) {
            $kodes = is_array($request->kode_kegiatan)
                ? $request->kode_kegiatan
                : explode(',', $request->kode_kegiatan);
            $query->whereHas('kegiatan', function ($q) use ($kodes) {
                $q->whereIn('kode_kegiatan', $kodes);
            });
        }

        if ($request->filled('skema_id')) {
            $query->whereHas('proposal.kegiatan', function ($q) use ($request) {
                $q->where('skema_id', $request->skema_id);
            });
        }

        if ($request->filled('jenis_penelitian')) {
            $query->where('jenis_penelitian', $request->jenis_penelitian);
        }

        /*
        |--------------------------------------------------------------------------
        | Role-scoped filtering
        |--------------------------------------------------------------------------
        | Dosen: only their own laporan (via proposal.user_id).
        | Reviewer: only laporan they've been assigned to review.
        | Admin: all rows (no additional filter).
        |--------------------------------------------------------------------------
        */

        if ($user->role === 'Dosen') {
            $query->whereHas('proposal', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($user->role === 'Reviewer') {
            $query->whereExists(function ($q) use ($user) {
                $q->select(DB::raw(1))
                    ->from('penugasan_reviewer')
                    ->whereColumn('penugasan_reviewer.reviewable_id', 'laporan.laporan_id')
                    ->where('penugasan_reviewer.reviewable_type', 'App\\Models\\Laporan')
                    ->where('penugasan_reviewer.user_id', $user->id);
            });
        }

        if ($user->role === 'Reviewer') {
            $query->with(['penugasan.reviewer']);
        }

        return LaporanDosenResource::collection(
            $query
                ->orderByDesc('tgl_mulai')
                ->paginate($request->get('per_page', 10))
        );
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();

        $laporan = Laporan::with([
            'proposal',
            'proposal.members.user',
            'proposal.members.mahasiswa',
            'proposal.members.kolaborator',
        ])->findOrFail($id);

        if ($user->role === 'Dosen' && $laporan->proposal?->user_id !== $user->id) {
            return ApiResponse::failed('Laporan tidak ditemukan atau bukan milik Anda.');
        }

        return new LaporanDosenResource($laporan);
    }

    /*
    |--------------------------------------------------------------------------
    | DOCUMENTS
    |--------------------------------------------------------------------------
    | Fetch all documents for a given laporan (by laporan_id directly).
    |--------------------------------------------------------------------------
    */
    public function documents(Request $request, $id)
    {
        try {
            $user = $request->user();

            $laporan = Laporan::with([
                'proposal' => fn($q) => $q->withTrashed(),
            ])->withTrashed()
              ->findOrFail($id);

            if ($user->role === 'Dosen' && $laporan->proposal?->user_id !== $user->id) {
                return ApiResponse::failed('Laporan tidak ditemukan atau bukan milik Anda.');
            }

            $proposal = \App\Models\Proposal::with([
                'dokumen' => fn($q) => $q->withTrashed(),
                'kegiatan' => fn($q) => $q->withTrashed(),
            ])->withTrashed()
              ->find($laporan->proposal_id);

            $isProposalLocked = $proposal
                && in_array($proposal->status, ['Proposal Diterima', 'Menunggu persetujuan Ketua LPPM']);

            $ganjil = $proposal->laporan()
                ->withTrashed()
                ->where('semester', 'Ganjil')
                ->first();
            $genap = $proposal->laporan()
                ->withTrashed()
                ->where('semester', 'Genap')
                ->first();

            $ganjilKode = $ganjil?->kodeKegiatan();
            $genapKode = $genap?->kodeKegiatan();

            $isGanjilLocked = !KegiatanStage::isOpen($ganjil, $ganjilKode);
            $isGenapLocked = !KegiatanStage::isOpen($genap, $genapKode);

            $result = [
                'proposal' => null,
                'laporan_ganjil' => null,
                'laporan_genap' => null,
            ];

            if ($proposal) {
                $result['proposal'] = [
                    'dokumen_proposal' => $this->formatDokumen(
                        $proposal->dokumen->firstWhere('jenis_dokumen', 'Dokumen Proposal')
                    ),
                    'generated_template' => $this->formatDokumen(
                        $proposal->dokumen->firstWhere('jenis_dokumen', 'Halaman Pengesahan')
                    ),
                    'pengumuman_surat_tugas' => $this->formatDokumen(
                        $proposal->dokumen->firstWhere('jenis_dokumen', 'Pengumuman Surat Tugas')
                    ),
                    'is_locked' => $isProposalLocked,
                ];

                if ($ganjil) {
                    $result['laporan_ganjil'] = [
                        'laporan_id' => $ganjil->laporan_id,
                        'dokumen_laporan' => $this->formatDokumen(
                            $ganjil->dokumen->firstWhere('jenis_dokumen', 'Dokumen Laporan')
                        ),
                        'generated_laporan_akhir' => $this->formatDokumen(
                            $ganjil->dokumen->firstWhere('jenis_dokumen', 'Laporan Akhir')
                        ),
                        'is_locked' => $isGanjilLocked,
                        'semester' => 'Ganjil',
                    ];
                }

                if ($genap) {
                    $result['laporan_genap'] = [
                        'laporan_id' => $genap->laporan_id,
                        'dokumen_laporan' => $this->formatDokumen(
                            $genap->dokumen->firstWhere('jenis_dokumen', 'Dokumen Laporan')
                        ),
                        'generated_laporan_akhir' => $this->formatDokumen(
                            $genap->dokumen->firstWhere('jenis_dokumen', 'Laporan Akhir')
                        ),
                        'is_locked' => $isGenapLocked,
                        'semester' => 'Genap',
                    ];
                }
            }

            return ApiResponse::success($result);

        } catch (\Throwable $e) {
            return ApiResponse::failed(
                'Failed to retrieve documents',
                $e->getMessage()
            );
        }
    }

    private function formatDokumen($dokumen)
    {
        if (!$dokumen) {
            return null;
        }

        return [
            'dokumen_id' => $dokumen->dokumen_id,
            'jenis_dokumen' => $dokumen->jenis_dokumen,
            'file_url' => $dokumen->file_url,
            'nama_file' => $dokumen->nama_file,
            'tgl_upload' => $dokumen->tgl_upload,
            'drive_file_url' => $dokumen->drive_file_url,
            'version' => $dokumen->currentVersion?->version ?? 0,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Update Research Info
    |--------------------------------------------------------------------------
    | Researchers may update research information (title may change, data
    | may change) during the Laporan or Publikasi stage.
    |--------------------------------------------------------------------------
    */

    public function update(Request $request)
    {
        try {

            $validated = $request->validate([
                'laporan_id' => ['required', 'exists:laporan,laporan_id'],

                'judul_penelitian' => ['nullable', 'string', 'max:255'],
                'target_publikasi' => ['nullable', 'string', 'max:255'],
                'nama_jurnal' => ['nullable', 'string', 'max:255'],
                'link_jurnal' => ['nullable', 'string', 'max:500'],
                'institusi_mitra' => ['nullable', 'string', 'max:255'],

                'realisasi_biaya_penelitian' => ['nullable', 'numeric', 'min:0'],
                'realisasi_biaya_publikasi' => ['nullable', 'numeric', 'min:0'],
                'realisasi_insentif' => ['nullable', 'numeric', 'min:0'],

                'tgl_mulai' => ['nullable', 'date'],
                'tgl_selesai' => ['nullable', 'date', 'after_or_equal:tgl_mulai'],

                'link_laporan_akhir' => ['nullable', 'string'],
                'link_luaran_drive_url' => ['nullable', 'string'],
                'link_hki' => ['nullable', 'string'],
                'link_buku' => ['nullable', 'string'],
                'link_poster' => ['nullable', 'string'],
                'link_video' => ['nullable', 'string'],
            ]);

            $laporan = $this->findOwnedLaporan($validated['laporan_id']);

            if (!$laporan) {
                return ApiResponse::failed('Laporan tidak ditemukan.');
            }

            if (!$this->stageIsOpen($laporan)) {
                return ApiResponse::failed(
                    'Tahap Publikasi belum dibuka. Silakan tunggu hingga tahap ini dibuka oleh admin.'
                );
            }

            unset($validated['laporan_id']);

            $laporan->update($validated);

            $current = $laporan->kodeKegiatan();

            if (in_array($current, ['PUBLIKASI_GANJIL', 'PUBLIKASI_GENAP'], true)
                && isset($validated['link_laporan_akhir'])) {
                $laporan->update(['status' => 'Menunggu review Admin']);
                KegiatanStage::advance($laporan);
            }

            return ApiResponse::success(
                new LaporanDosenResource($laporan->fresh([
                    'proposal',
                    'kegiatan',
                    'dokumen.currentVersion',
                ]))
            );

        } catch (\Exception $e) {

            \Log::error('Update laporan failed: ' . $e->getMessage());

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Upload Revised Laporan Document (Google Drive link)
    |--------------------------------------------------------------------------
    */

    public function uploadDokumen(Request $request, DocumentService $documentService)
    {
        DB::beginTransaction();

        try {

            $validated = $request->validate([
                'laporan_id'     => ['required', 'exists:laporan,laporan_id'],
                'uploaded_file'  => ['required', 'file', 'max:10240'],
            ]);

            $laporan = $this->findOwnedLaporan($validated['laporan_id']);

            if (!$laporan) {
                return ApiResponse::failed('Laporan tidak ditemukan.');
            }

            if (!$this->stageIsOpen($laporan)) {
                return ApiResponse::failed(
                    'Kegiatan untuk tahap ini belum dibuka.'
                );
            }

            $file = $request->file('uploaded_file');
            $relativePath = $documentService->upload($file, 'documents/laporan');

            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            $timestamp = now()->format('Ymd_His');
            $namaFile = $originalName . '_' . $timestamp . '.' . $extension;

            $dokumen = $laporan->dokumen()
                ->firstOrCreate([
                    'jenis_dokumen' => 'Dokumen Laporan'
                ]);

            $nextVersion = (
                $dokumen->versions()->max('version') ?? 0
            ) + 1;

            $version = $dokumen->versions()->create([
                'version'          => $nextVersion,

                'nama_file'        => $namaFile,

                'drive_file_id'    => '-',
                'drive_file_url'   => '-',

                'local_file_url'   => $relativePath,

                'uploaded_by'      => auth()->id(),

                'catatan_revisi'   => $nextVersion === 1
                    ? 'Upload dokumen laporan awal'
                    : 'Revisi dokumen laporan',

                'tgl_upload'       => now(),
            ]);

            $dokumen->update([
                'current_version_id' => $version->version_id
            ]);

            DB::commit();

            return ApiResponse::success(
                $dokumen->fresh()->load('currentVersion')
            );

        } catch (\Exception $e) {

            DB::rollBack();

            \Log::error('Upload dokumen laporan failed: ' . $e->getMessage());

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Finish Report
    |--------------------------------------------------------------------------
    | When a researcher clicks Finish Report, the laporan automatically
    | enters the Publikasi stage.
    |--------------------------------------------------------------------------
    */

    public function finish(Request $request)
    {
        try {

            $validated = $request->validate([
                'laporan_id' => ['required', 'exists:laporan,laporan_id'],
            ]);

            $laporan = $this->findOwnedLaporan($validated['laporan_id']);

            if (!$laporan) {
                return ApiResponse::failed('Laporan tidak ditemukan.');
            }

            /*
            |--------------------------------------------------------------------------
            | Gate: current kode must be a PROSES_* stage (open)
            |--------------------------------------------------------------------------
            */

            $current = $laporan->kodeKegiatan();

            $prosesKodes = [
                'PROSES_PENELITIAN_GANJIL',
                'PROSES_PENELITIAN_GENAP',
                'PROSES_PKM_GANJIL',
                'PROSES_PKM_GENAP',
            ];

            if (!in_array($current, $prosesKodes, true)) {
                return ApiResponse::failed(
                    'Laporan sedang bukan pada tahap Proses.'
                );
            }

            if (!KegiatanStage::isOpen($laporan, $current)) {
                return ApiResponse::failed(
                    'Kegiatan proses penelitian belum dibuka.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Advance to next kode (Publikasi for Penelitian; also Publikasi
            | for PkM since PROSES_PKM_* → PUBLIKASI_* in the PkM sequence).
            |--------------------------------------------------------------------------
            */

            KegiatanStage::advance($laporan);

            \App\Services\NotificationService::createForRole(
                role: 'Staff LPPM',
                type: 'laporan.research.finished',
                title: 'Penelitian selesai',
                message: "Penelitian laporan \"{$laporan->judul_penelitian}\" telah selesai.",
                data: ['laporan_id' => $laporan->laporan_id],
                actionUrl: \App\Helpers\NotificationUrl::forRole('Staff LPPM', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan), $laporan->jenis_penelitian),
                key: "laporan.research.finished.{$laporan->laporan_id}",
            );

            \App\Services\NotificationService::createForRole(
                role: 'Ketua LPPM',
                type: 'laporan.research.finished',
                title: 'Penelitian selesai',
                message: "Penelitian laporan \"{$laporan->judul_penelitian}\" telah selesai.",
                data: ['laporan_id' => $laporan->laporan_id],
                actionUrl: \App\Helpers\NotificationUrl::forRole('Ketua LPPM', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan), $laporan->jenis_penelitian),
                key: "laporan.research.finished.ketua.{$laporan->laporan_id}",
            );

            $laporan->update([
                'status'     => 'Menunggu kelengkapan data',
                'tgl_submit' => now(),
                'catatan'    => null,
            ]);

            return ApiResponse::success(
                new LaporanDosenResource($laporan->fresh(['proposal', 'kegiatan']))
            );

        } catch (\Exception $e) {

            \Log::error('Finish laporan failed: ' . $e->getMessage());

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Laporan Akhir Document
    |--------------------------------------------------------------------------
    */

    public function generateLaporanAkhir(
        Request $request,
        LaporanAkhirDocxService $laporanAkhirDocxService
    ) {
        DB::beginTransaction();

        try {

            $validated = $request->validate([
                'laporan_id' => ['required', 'exists:laporan,laporan_id'],
            ]);

            $laporan = $this->findOwnedLaporan($validated['laporan_id']);

            if (!$laporan) {
                return ApiResponse::failed('Laporan tidak ditemukan.');
            }

            $current = $laporan->kodeKegiatan();

            if (!in_array($current, ['PUBLIKASI_GANJIL', 'PUBLIKASI_GENAP'], true)) {
                return ApiResponse::failed(
                    'Laporan akhir hanya dapat digenerate pada tahap Publikasi.'
                );
            }

            if (!KegiatanStage::isOpen($laporan, $current)) {
                return ApiResponse::failed(
                    'Kegiatan publikasi belum dibuka.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Collect Data
            |--------------------------------------------------------------------------
            */

            $proposal = $laporan->proposal()->with([
                'user' => fn($q) => $q->withTrashed(),
                'user.prodi',
                'kegiatan' => fn($q) => $q->withTrashed(),
                'kegiatan.skema',
            ])->first();

            // Load Laporan-specific members (independent from Proposal)
            $laporanMembers = $laporan->laporanMember()
                ->with([
                    'user' => fn($q) => $q->withTrashed(),
                    'user.prodi',
                    'mahasiswa',
                    'kolaborator'
                ])
                ->orderBy('position')
                ->get();

            // Load Ketua's PenelitiDetail for no_hp, pangkat_golongan
            $ketuaDetail = PenelitiDetail::where('user_id', $proposal->user_id)->first();

            // Load Prodi for kaprodi_nama/nidn
            $prodi = $proposal->user?->prodi;

            // Load Realisasi Anggaran (Point F items)
            $realisasiAnggaran = $laporan->realisasiAnggaran()->get();

            // Load Settings
            $settings = Settings::first();

            /*
            |--------------------------------------------------------------------------
            | Generate Document
            |--------------------------------------------------------------------------
            */

            $docxPath = $laporanAkhirDocxService->generate(
                $laporan,
                $proposal,
                $laporanMembers,
                $ketuaDetail,
                $prodi,
                $realisasiAnggaran,
                $settings
            );

            /*
            |--------------------------------------------------------------------------
            | Store as Dokumen Version
            |--------------------------------------------------------------------------
            */

            $dokumen = $laporan->dokumen()
                ->firstOrCreate([
                    'jenis_dokumen' => 'Laporan Akhir'
                ]);

            $nextVersion = (
                $dokumen->versions()->max('version') ?? 0
            ) + 1;

            $version = $dokumen->versions()->create([
                'version'          => $nextVersion,

                'nama_file'        => basename($docxPath),

                'drive_file_id'    => '-',
                'drive_file_url'   => '-',

                'local_file_url'   => $docxPath,

                'uploaded_by'      => auth()->id(),

                'catatan_revisi'   => $nextVersion === 1
                    ? 'Generate laporan akhir awal'
                    : 'Regenerate laporan akhir',

                'tgl_upload'       => now(),
            ]);

            $dokumen->update([
                'current_version_id' => $version->version_id
            ]);

            DB::commit();

            return ApiResponse::success(
                $dokumen->fresh()->load('currentVersion')
            );

        } catch (\Exception $e) {

            DB::rollBack();

            \Log::error('Generate laporan akhir failed: ' . $e->getMessage());

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Submit Publikasi
    |--------------------------------------------------------------------------
    | Mandatory: link laporan akhir. For Penelitian the publication link is
    | mandatory, for PkM it is optional. All uploads are Google Drive links.
    |--------------------------------------------------------------------------
    */

    public function submitPublikasi(
        Request $request,
        DocumentService $documentService
    ) {
        try {

            $validated = $request->validate([
                'laporan_id' => ['required', 'exists:laporan,laporan_id'],

                'uploaded_file' => [
                    'required',
                    'file',
                    'max:10240',
                    'mimes:pdf',
                    'mimetypes:application/pdf',
                ],

                'dana_dikembalikan' => ['nullable', 'boolean'],
            ]);

            $laporan = $this->findOwnedLaporan($validated['laporan_id']);

            if (!$laporan) {
                return ApiResponse::failed('Laporan tidak ditemukan.');
            }

            $current = $laporan->kodeKegiatan();

            if (!in_array($current, ['PUBLIKASI_GANJIL', 'PUBLIKASI_GENAP'], true)) {
                return ApiResponse::failed(
                    'Laporan belum memasuki tahap Publikasi.'
                );
            }

            if (!KegiatanStage::isOpen($laporan, $current)) {
                return ApiResponse::failed(
                    'Kegiatan publikasi belum dibuka.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Upload file to storage
            |--------------------------------------------------------------------------
            */

            $file = $request->file('uploaded_file');
            $relativePath = $documentService->upload($file, 'documents/laporan');

            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            $timestamp = now()->format('Ymd_His');
            $namaFile = $originalName . '_' . $timestamp . '.' . $extension;

            /*
            |--------------------------------------------------------------------------
            | Store as Dokumen version
            |--------------------------------------------------------------------------
            */

            $dokumen = $laporan->dokumen()
                ->firstOrCreate([
                    'jenis_dokumen' => 'Dokumen Laporan Final'
                ]);

            $nextVersion = ($dokumen->versions()->max('version') ?? 0) + 1;

            $version = $dokumen->versions()->create([
                'version'        => $nextVersion,
                'nama_file'      => $namaFile,
                'drive_file_id'  => '-',
                'drive_file_url' => '-',
                'local_file_url' => $relativePath,
                'uploaded_by'    => auth()->id(),
                'catatan_revisi' => 'Laporan final publikasi',
                'tgl_upload'     => now(),
            ]);

            $dokumen->update([
                'current_version_id' => $version->version_id,
            ]);

            $laporan->update([
                'link_laporan_akhir' => $dokumen->fresh()->file_url,
                'dana_dikembalikan' =>
                    filter_var(
                        $request->input('dana_dikembalikan', false),
                        FILTER_VALIDATE_BOOLEAN
                    ),
                'status' => 'Menunggu review Admin',
                'ketua_diseminasi_approved' => false,
                'staff_diseminasi_approved' => false,
            ]);

            KegiatanStage::advance($laporan);

            \App\Services\NotificationService::createForRole(
                role: 'Staff LPPM',
                type: 'laporan.diseminasi.submitted',
                title: 'Laporan masuk tahap Diseminasi',
                message: "Laporan \"{$laporan->judul_penelitian}\" telah memasuki tahap Diseminasi.",
                data: ['laporan_id' => $laporan->laporan_id],
                actionUrl: \App\Helpers\NotificationUrl::forRole('Staff LPPM', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan), $laporan->jenis_penelitian),
                key: "laporan.diseminasi.submitted.{$laporan->laporan_id}",
            );

            \App\Services\NotificationService::createForRole(
                role: 'Ketua LPPM',
                type: 'laporan.diseminasi.submitted',
                title: 'Laporan masuk tahap Diseminasi',
                message: "Laporan \"{$laporan->judul_penelitian}\" telah memasuki tahap Diseminasi.",
                data: ['laporan_id' => $laporan->laporan_id],
                actionUrl: \App\Helpers\NotificationUrl::forRole('Ketua LPPM', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan), $laporan->jenis_penelitian),
                key: "laporan.diseminasi.submitted.ketua.{$laporan->laporan_id}",
            );

            // Auto-initialize or auto-skip Pengembalian Dana (PkM only)
            $laporan->refresh();
            $nextKode = $laporan->kodeKegiatan();

            if ($laporan->jenis_penelitian === 'PkM'
                && str_starts_with($nextKode, 'PENGEMBALIAN_DANA_')
            ) {
                if (!$laporan->dana_dikembalikan) {
                    // Branch A: no remaining funds → skip and advance past
                    $laporan->update([
                        'pengembalian_dana_status'         => 'Dilewati',
                        'pengembalian_dana_skipped_reason' => 'Tidak ada sisa dana yang harus dikembalikan',
                        'pengembalian_dana_confirmed_at'   => now(),
                    ]);
                    KegiatanStage::advance($laporan);
                } else {
                    // Branch B: remaining funds → initialize return workflow
                    $laporan->update([
                        'pengembalian_dana_status' => 'Menunggu Pengembalian Dana',
                    ]);

                    $tab = \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan);

                    \App\Services\NotificationService::create(
                        userId: $laporan->proposal->user_id,
                        type: 'dana.pengembalian.requested',
                        title: 'Pengembalian dana diminta',
                        message: "Anda diminta untuk mengembalikan dana laporan \"{$laporan->judul_penelitian}\".",
                        data: ['laporan_id' => $laporan->laporan_id],
                        actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, $tab, $laporan->jenis_penelitian),
                        key: "dana.pengembalian.requested.{$laporan->laporan_id}",
                    );

                    \App\Services\NotificationService::createForRole(
                        role: 'Ketua LPPM',
                        type: 'dana.pengembalian.requested',
                        title: 'Pengembalian dana diminta',
                        message: "Pengembalian dana untuk laporan \"{$laporan->judul_penelitian}\" telah diminta.",
                        data: ['laporan_id' => $laporan->laporan_id],
                        actionUrl: \App\Helpers\NotificationUrl::forRole('Ketua LPPM', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, $tab, $laporan->jenis_penelitian),
                        key: "dana.pengembalian.requested.ketua.{$laporan->laporan_id}",
                    );
                    // Do NOT advance — Laporan stays at PENGEMBALIAN_DANA
                }
            }

            return ApiResponse::success(
                new LaporanDosenResource($laporan->fresh(['proposal', 'kegiatan']))
            );

        } catch (\Exception $e) {

            \Log::error('Submit publikasi failed: ' . $e->getMessage());

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    private function findOwnedLaporan($laporanId)
    {
        return Laporan::with([
            'proposal' => fn($q) => $q->withTrashed(),
        ])
        ->where('laporan_id', $laporanId)
        ->whereHas('proposal', function ($q) {
            $q->where('user_id', auth()->id());
        })
        ->first();
    }

    private function stageIsOpen(Laporan $laporan)
    {
        $kode = $laporan->kodeKegiatan();

        if (!$kode) {
            return false;
        }

        return KegiatanStage::isOpen($laporan, $kode);
    }

    /*
    |--------------------------------------------------------------------------
    | Admin — Ketua Diseminasi first-step decision
    |--------------------------------------------------------------------------
    | Ketua LPPM first-step approval/rejection on the Diseminasi stage.
    | Accept sets ketua_diseminasi_approved and advances to the next stage
    | for Staff LPPM review. Reject sends it back to Publikasi for Dosen
    | revision (no AuthorizationRequest needed for Ketua).
    |--------------------------------------------------------------------------
    */

    public function adminDecide(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || !in_array($user->role, ['Superadmin', 'Ketua LPPM'])) {
                return ApiResponse::failed(
                    'Hanya Ketua LPPM yang dapat melakukan keputusan diseminasi.'
                );
            }

            $validated = $request->validate([
                'laporan_id' => ['required', 'exists:laporan,laporan_id'],
                'decision'   => ['required', 'in:accept,reject'],
                'catatan'    => ['nullable', 'string'],
            ]);

            $laporan = Laporan::with([
                'proposal' => fn($q) => $q->withTrashed(),
                'kegiatan'  => fn($q) => $q->withTrashed(),
            ])->find($validated['laporan_id']);

            if (!$laporan) {
                return ApiResponse::failed('Laporan tidak ditemukan.');
            }

            $current = $laporan->kodeKegiatan();

            if (!in_array($current, ['DISEMINASI_GANJIL', 'DISEMINASI_GENAP'], true)) {
                return ApiResponse::failed(
                    'Laporan bukan pada tahap Diseminasi.'
                );
            }

            if (!KegiatanStage::isOpen($laporan, $current)) {
                return ApiResponse::failed(
                    'Kegiatan diseminasi belum dibuka.'
                );
            }

            if ($validated['decision'] === 'accept') {

                $laporan->update([
                    'ketua_diseminasi_approved' => true,
                    'status' => 'Menunggu review Staff LPPM',
                    'catatan' => $validated['catatan'] ?? $laporan->catatan,
                ]);

                \App\Services\NotificationService::createForRole(
                    role: 'Staff LPPM',
                    type: 'laporan.diseminasi.ketua_approved',
                    title: 'Diseminasi disetujui oleh Ketua',
                    message: "Diseminasi laporan \"{$laporan->judul_penelitian}\" telah disetujui oleh Ketua LPPM.",
                    data: ['laporan_id' => $laporan->laporan_id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Staff LPPM', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan), $laporan->jenis_penelitian),
                    key: "laporan.diseminasi.ketua_approved.{$laporan->laporan_id}",
                );

                \App\Services\NotificationService::create(
                    userId: $laporan->proposal->user_id,
                    type: 'laporan.diseminasi.ketua_approved',
                    title: 'Diseminasi disetujui oleh Ketua LPPM',
                    message: "Diseminasi laporan \"{$laporan->judul_penelitian}\" telah disetujui oleh Ketua LPPM.",
                    data: ['laporan_id' => $laporan->laporan_id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan), $laporan->jenis_penelitian),
                    key: "laporan.diseminasi.ketua_approved.dosen.{$laporan->laporan_id}",
                );

            } else {

                $previousKode = KegiatanStage::previousKode($current, $laporan);

                if (!$previousKode) {
                    return ApiResponse::failed(
                        'Tidak ada tahap sebelumnya yang dapat dikembalikan.'
                    );
                }

                if (!KegiatanStage::isOpen($laporan, $previousKode)) {
                    return ApiResponse::failed(
                        'Tahap sebelumnya sudah ditutup. Laporan tidak dapat dikembalikan.'
                    );
                }

                KegiatanStage::move($laporan, $previousKode);

                $laporan->update([
                    'status' => 'Revisi',
                    'catatan' => $validated['catatan'] ?? '-',
                    'ketua_diseminasi_approved' => false,
                    'staff_diseminasi_approved' => false,
                ]);

                \App\Services\NotificationService::create(
                    userId: $laporan->proposal->user_id,
                    type: 'laporan.diseminasi.ketua_rejected',
                    title: 'Diseminasi ditolak oleh Ketua LPPM',
                    message: "Diseminasi laporan \"{$laporan->judul_penelitian}\" telah ditolak oleh Ketua LPPM.",
                    data: ['laporan_id' => $laporan->laporan_id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan), $laporan->jenis_penelitian),
                    key: "laporan.diseminasi.ketua_rejected.{$laporan->laporan_id}",
                );

                \App\Services\NotificationService::createForRole(
                    role: 'Staff LPPM',
                    type: 'laporan.diseminasi.ketua_rejected',
                    title: 'Diseminasi ditolak oleh Ketua LPPM',
                    message: "Diseminasi laporan \"{$laporan->judul_penelitian}\" telah ditolak oleh Ketua LPPM.",
                    data: ['laporan_id' => $laporan->laporan_id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Staff LPPM', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan), $laporan->jenis_penelitian),
                    key: "laporan.diseminasi.ketua_rejected.staff.{$laporan->laporan_id}",
                );
            }

            return ApiResponse::success();

        } catch (\Exception $e) {
            \Log::error('Admin decide diseminasi failed: ' . $e->getMessage());
            return ApiResponse::failed();
        }
    }
}
