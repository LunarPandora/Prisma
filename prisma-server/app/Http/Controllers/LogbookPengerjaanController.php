<?php

namespace App\Http\Controllers;

use App\Models\LogbookPengerjaan;
use App\Models\Laporan;
use App\Models\Proposal;
use App\Models\Dokumen;
use App\Models\DokumenVersion;
use App\Helpers\KegiatanStage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\ApiResponse;
use App\Http\Resources\LogbookPengerjaanResource;
use App\Services\DocumentService;

class LogbookPengerjaanController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | INDEX
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        try {
            $query = LogbookPengerjaan::query()
                ->with(['user', 'laporan']);

            $user = auth()->user();
            $adminRoles = ['Staff LPPM', 'Ketua LPPM', 'Superadmin'];

            if (!in_array($user->role, $adminRoles)) {
                $query->where('user_id', $user->id);
            }

            if ($request->filled('laporan_id')) {
                $query->where('laporan_id', $request->laporan_id);
            }

            $data = $query
                ->orderBy('created_at')
                ->paginate($request->get('per_page', 10));

            return LogbookPengerjaanResource::collection($data);

        } catch (\Throwable $e) {
            return ApiResponse::failed(
                'Failed to retrieve logbooks',
                $e->getMessage()
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | SHOW
    |--------------------------------------------------------------------------
    */
    public function show($id)
    {
        try {
            $user = auth()->user();
            $adminRoles = ['Staff LPPM', 'Ketua LPPM', 'Superadmin'];

            $query = LogbookPengerjaan::with(['user', 'laporan']);

            if (!in_array($user->role, $adminRoles)) {
                $query->where('user_id', $user->id);
            }

            $data = $query->find($id);

            if (!$data) {
                return ApiResponse::failed(
                    'Logbook tidak ditemukan atau bukan milik Anda.',
                    null,
                    404
                );
            }

            return ApiResponse::success($data, 'Logbook detail retrieved successfully');

        } catch (\Throwable $e) {
            return ApiResponse::failed(
                'Logbook not found',
                $e->getMessage(),
                404
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | STORE
    |--------------------------------------------------------------------------
    */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'laporan_id'          => 'required|exists:laporan,laporan_id',
                'user_id'             => 'required|exists:users,id',
                'judul'               => 'required|string|max:255',
                'deskripsi'           => 'required|string',
                'tgl_kegiatan'        => 'required|date',
                'tgl_kegiatan_end'    => 'nullable|date|after_or_equal:tgl_kegiatan',
                'lampiran_drive_id'   => 'nullable|string',
                'lampiran_drive_url'  => 'nullable|string',
            ]);

            /*
            |--------------------------------------------------------------------------
            | Ownership Check — Dosen can only create logbook for themselves
            |--------------------------------------------------------------------------
            */

            if ($validated['user_id'] != auth()->id()) {
                return ApiResponse::failed(
                    'Anda hanya dapat membuat logbook untuk diri sendiri.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Kegiatan Gate
            |--------------------------------------------------------------------------
            | Logbook can only be filled while the laporan's own kegiatan
            | (PROSES_PENELITIAN_* / PROSES_PKM_*) is open.
            |--------------------------------------------------------------------------
            */

            $laporan = Laporan::with([
                'proposal' => fn($q) => $q->withTrashed(),
                'kegiatan'  => fn($q) => $q->withTrashed(),
            ])->findOrFail($validated['laporan_id']);

            $current = $laporan->kodeKegiatan();

            $prosesKodes = [
                'PROSES_PENELITIAN_GANJIL',
                'PROSES_PENELITIAN_GENAP',
                'PROSES_PKM_GANJIL',
                'PROSES_PKM_GENAP',
            ];

            if (!in_array($current, $prosesKodes, true)
                || !KegiatanStage::isOpen($laporan, $current)
            ) {
                return ApiResponse::failed(
                    'Kegiatan proses penelitian belum dibuka.'
                );
            }

            $logbook = LogbookPengerjaan::create($validated);

            if ($laporan->status === 'Belum dimulai') {
                $laporan->update(['status' => 'Dalam pengerjaan']);
            }

            return ApiResponse::success(
                $logbook->load(['user', 'laporan']),
                'Logbook created successfully',
                201
            );

        } catch (\Throwable $e) {
            return ApiResponse::failed(
                'Failed to create logbook',
                $e->getMessage()
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */
    public function update(Request $request, $id)
    {
        try {
            $logbook = LogbookPengerjaan::findOrFail($id);

            /*
            |--------------------------------------------------------------------------
            | Ownership Check — only the logbook owner may update
            |--------------------------------------------------------------------------
            */

            if ($logbook->user_id != auth()->id()) {
                return ApiResponse::failed(
                    'Anda tidak memiliki akses untuk mengubah logbook ini.'
                );
            }

            $validated = $request->validate([
                'judul'               => 'sometimes|string|max:255',
                'deskripsi'           => 'sometimes|string',
                'tgl_kegiatan'        => 'sometimes|date',
                'tgl_kegiatan_end'    => 'nullable|date|after_or_equal:tgl_kegiatan',
                'lampiran_drive_id'   => 'nullable|string',
                'lampiran_drive_url'  => 'nullable|string',
            ]);

            $logbook->update($validated);

            return ApiResponse::success(
                $logbook->load(['user', 'laporan']),
                'Logbook updated successfully'
            );

        } catch (\Throwable $e) {
            return ApiResponse::failed(
                'Failed to update logbook',
                $e->getMessage()
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */
    public function destroy($id)
    {
        try {
            $logbook = LogbookPengerjaan::findOrFail($id);

            /*
            |--------------------------------------------------------------------------
            | Ownership Check — only the logbook owner may delete
            |--------------------------------------------------------------------------
            */

            if ($logbook->user_id != auth()->id()) {
                return ApiResponse::failed(
                    'Anda tidak memiliki akses untuk menghapus logbook ini.'
                );
            }

            $logbook->delete();

            return ApiResponse::success(
                null,
                'Logbook deleted successfully'
            );

        } catch (\Throwable $e) {
            return ApiResponse::failed(
                'Failed to delete logbook',
                $e->getMessage()
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | DOCUMENTS
    |--------------------------------------------------------------------------
    | Fetch all documents related to this logbook's laporan and proposal.
    |--------------------------------------------------------------------------
    */
    public function documents($id)
    {
        try {
            $user = auth()->user();
            $adminRoles = ['Staff LPPM', 'Ketua LPPM', 'Superadmin'];

            $query = LogbookPengerjaan::with([
                'laporan' => fn($q) => $q->withTrashed(),
            ]);

            if (!in_array($user->role, $adminRoles)) {
                $query->where('user_id', $user->id);
            }

            $logbook = $query->find($id);

            if (!$logbook) {
                return ApiResponse::failed('Logbook tidak ditemukan atau bukan milik Anda.', null, 404);
            }

            $laporan = $logbook->laporan;

            if (!$laporan) {
                return ApiResponse::failed('Laporan not found', 404);
            }

            $proposal = Proposal::with([
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
    | REPLACE DOCUMENT
    |--------------------------------------------------------------------------
    | Replace a document by uploading a new version, or create a new one.
    |--------------------------------------------------------------------------
    */
    public function replaceDocument(
        Request $request,
        DocumentService $documentService
    ) {
        DB::beginTransaction();

        try {
            $validated = $request->validate([
                'dokumen_id'          => 'nullable|exists:dokumen,dokumen_id',
                'documentable_type'   => 'required_without:dokumen_id|string',
                'documentable_id'     => 'required_without:dokumen_id|numeric',
                'jenis_dokumen'       => 'required_without:dokumen_id|string',
                'uploaded_file'       => [
                    'required',
                    'file',
                    'max:10240',
                    'mimes:pdf',
                    'mimetypes:application/pdf',
                ],
            ]);

            $file = $request->file('uploaded_file');
            $relativePath = $documentService->upload($file, 'documents/logbook');

            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $extension = $file->getClientOriginalExtension();
            $timestamp = now()->format('Ymd_His');
            $namaFile = $originalName . '_' . $timestamp . '.' . $extension;

            if (!empty($validated['dokumen_id'])) {
                $dokumen = Dokumen::with([
                    'documentable' => fn($q) => $q->withTrashed(),
                ])->findOrFail($validated['dokumen_id']);

                $parent = $dokumen->documentable;

                if ($parent instanceof Proposal) {
                    if ($parent->user_id !== auth()->id()) {
                        DB::rollBack();
                        return ApiResponse::failed('Anda tidak memiliki akses untuk mengubah dokumen ini.');
                    }
                    if (in_array($parent->status, ['Proposal Diterima', 'Menunggu persetujuan Ketua LPPM'])) {
                        DB::rollBack();
                        return ApiResponse::failed('Proposal sudah diterima dan tidak dapat diubah.');
                    }
                } elseif ($parent instanceof Laporan) {
                    if ($parent->proposal?->user_id !== auth()->id()) {
                        DB::rollBack();
                        return ApiResponse::failed('Anda tidak memiliki akses untuk mengubah dokumen ini.');
                    }
                    $currentKode = $parent->kodeKegiatan();
                    if (!KegiatanStage::isOpen($parent, $currentKode)) {
                        DB::rollBack();
                        return ApiResponse::failed('Kegiatan laporan ini belum dibuka atau sudah ditutup.');
                    }
                }

                $nextVersion = ($dokumen->versions()->max('version') ?? 0) + 1;

                $version = $dokumen->versions()->create([
                    'version'        => $nextVersion,
                    'nama_file'      => $namaFile,
                    'drive_file_id'  => '-',
                    'drive_file_url' => '-',
                    'local_file_url' => $relativePath,
                    'uploaded_by'    => auth()->id(),
                    'catatan_revisi' => 'Revisi dokumen oleh peneliti',
                    'tgl_upload'     => now(),
                ]);

                $dokumen->update([
                    'current_version_id' => $version->version_id,
                ]);

                DB::commit();

                return ApiResponse::success(
                    $this->formatDokumen($dokumen->fresh()),
                    'Document replaced successfully'
                );
            } else {
                $documentableType = $validated['documentable_type'];
                $documentableId = (int) $validated['documentable_id'];
                $jenisDokumen = $validated['jenis_dokumen'];

                $modelClass = str_contains($documentableType, '\\')
                    ? $documentableType
                    : 'App\\Models\\' . $documentableType;
                $documentable = $modelClass::withTrashed()->find($documentableId);

                if (!$documentable) {
                    DB::rollBack();
                    return ApiResponse::failed('Resource tidak ditemukan.');
                }

                if ($documentable instanceof Proposal && $documentable->user_id !== auth()->id()) {
                    DB::rollBack();
                    return ApiResponse::failed('Anda tidak memiliki akses untuk menambah dokumen ke proposal ini.');
                }

                if ($documentable instanceof Laporan && $documentable->proposal?->user_id !== auth()->id()) {
                    DB::rollBack();
                    return ApiResponse::failed('Anda tidak memiliki akses untuk menambah dokumen ke laporan ini.');
                }

                $dokumen = Dokumen::firstOrCreate([
                    'documentable_type' => $documentableType,
                    'documentable_id'   => $documentableId,
                    'jenis_dokumen'     => $jenisDokumen,
                ]);

                $nextVersion = ($dokumen->versions()->max('version') ?? 0) + 1;

                $version = $dokumen->versions()->create([
                    'version'        => $nextVersion,
                    'nama_file'      => $namaFile,
                    'drive_file_id'  => '-',
                    'drive_file_url' => '-',
                    'local_file_url' => $relativePath,
                    'uploaded_by'    => auth()->id(),
                    'catatan_revisi' => 'Upload dokumen oleh peneliti',
                    'tgl_upload'     => now(),
                ]);

                $dokumen->update([
                    'current_version_id' => $version->version_id,
                ]);

                DB::commit();

                return ApiResponse::success(
                    $this->formatDokumen($dokumen->fresh()),
                    'Document uploaded successfully',
                    201
                );
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return ApiResponse::failed(
                $e->getMessage(),
                422
            );
        } catch (\Throwable $e) {
            DB::rollBack();
            \Log::error('Replace document failed: ' . $e->getMessage());
            return ApiResponse::failed(
                'Failed to replace document'
            );
        }
    }
}