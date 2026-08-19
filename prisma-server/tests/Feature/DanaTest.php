<?php

use App\Models\User;
use App\Models\Laporan;
use App\Models\DokumenVersion;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

/*
|--------------------------------------------------------------------------
| Dana Workflow Tests
|--------------------------------------------------------------------------
*/

beforeEach(function () {
    Storage::fake('public');

    $this->staff = User::where('role', 'Staff LPPM')->first();
    $this->dosen = User::where('role', 'Dosen')->first();
    $this->ketua = User::where('role', 'Ketua LPPM')->first();

    if (!$this->staff || !$this->dosen || !$this->ketua) {
        $this->markTestSkipped('E2E seed data not available. Run e2e-reset.sh first.');
    }
});

afterEach(function () {
    DB::table('dokumen_version')
        ->whereIn('dokumen_id', function ($q) {
            $q->select('dokumen_id')->from('dokumen')
              ->where('documentable_type', 'App\\Models\\Laporan');
        })->delete();
    DB::table('dokumen')
        ->where('documentable_type', 'App\\Models\\Laporan')
        ->delete();
    DB::table('laporan')->where('judul_penelitian', 'Test Dana Laporan')->delete();
    DB::table('proposal')->where('judul', 'Test Dana Proposal')->delete();
});

afterEach(function () {
    DB::rollBack();
});

function createTestLaporan(int $kegiatanId, User $dosen, array $overrides = []): Laporan
{
    DB::table('dokumen_version')
        ->whereIn('dokumen_id', function ($q) use ($kegiatanId) {
            $q->select('dokumen_id')->from('dokumen')
              ->where('documentable_type', 'App\\Models\\Laporan')
              ->whereIn('documentable_id', function ($q2) use ($kegiatanId) {
                  $q2->select('laporan_id')->from('laporan')
                     ->where('kegiatan_id', $kegiatanId);
              });
        })->delete();

    DB::table('dokumen')
        ->where('documentable_type', 'App\\Models\\Laporan')
        ->whereIn('documentable_id', function ($q) use ($kegiatanId) {
            $q->select('laporan_id')->from('laporan')
              ->where('kegiatan_id', $kegiatanId);
        })->delete();

    DB::table('laporan')->where('kegiatan_id', $kegiatanId)->delete();

    $proposalId = DB::table('proposal')
        ->where('user_id', $dosen->id)
        ->where('kegiatan_id', $kegiatanId)
        ->value('proposal_id');

    if (!$proposalId) {
        $proposalId = DB::table('proposal')->insertGetId([
            'user_id' => $dosen->id,
            'kegiatan_id' => $kegiatanId,
            'judul' => 'Test Dana Proposal',
            'jenis_penelitian' => 'Penelitian',
            'topik_penelitian' => 'Test',
            'bidang_ilmu' => 'Test',
            'fokus_sdg' => 'Test',
            'target_publikasi_gan' => '-',
            'target_publikasi_gen' => '-',
            'rencana_judul_publikasi_gan' => '-',
            'rencana_judul_publikasi_gen' => '-',
            'metopen_gan' => '-',
            'metopen_gen' => '-',
            'unit_analisis_gan' => '-',
            'unit_analisis_gen' => '-',
            'kontribusi_ilmu_makul' => '-',
            'kontribusi_pkm' => '-',
            'rencana_luaran' => '-',
            'skema' => 'Internal',
            'sumber_skema' => 'Test',
            'status' => 'Proposal Diterima',
            'tgl_pengajuan' => now()->toDateString(),
        ]);
    }

    $kegiatan = DB::table('kegiatan_pengajuan')->where('kegiatan_id', $kegiatanId)->first();
    $semester = str_contains($kegiatan->kode_kegiatan, 'GANJIL') ? 'Ganjil' : 'Genap';

    $laporanId = DB::table('laporan')->insertGetId(array_merge([
        'proposal_id' => $proposalId,
        'kegiatan_id' => $kegiatanId,
        'semester' => $semester,
        'jenis_penelitian' => $kegiatan->jenis_penelitian,
        'judul_penelitian' => 'Test Dana Laporan',
        'status' => 'Dalam pengerjaan',
        'tgl_mulai' => now()->toDateString(),
        'tgl_submit' => now()->toDateString(),
    ], $overrides));

    return Laporan::findOrFail($laporanId);
}

function createDokumenVersion(Laporan $laporan, string $jenisDokumen, string $localPath = '', string $driveUrl = '-'): DokumenVersion
{
    $dokumen = $laporan->dokumen()->firstOrCreate(
        ['jenis_dokumen' => $jenisDokumen]
    );

    $version = $dokumen->versions()->create([
        'version' => 1,
        'nama_file' => "$jenisDokumen v1",
        'drive_file_id' => '-',
        'drive_file_url' => $driveUrl,
        'local_file_url' => $localPath ?: null,
        'uploaded_by' => auth()->id() ?? 1,
        'catatan_revisi' => 'Test upload',
        'tgl_upload' => now(),
    ]);

    $dokumen->update(['current_version_id' => $version->version_id]);

    return $version;
}

const PENGEMBALIAN_ID = 6;
const CLAIM_ID = 5;

test('dosen cannot upload return proof before status is initialized', function () {
    $laporan = createTestLaporan(PENGEMBALIAN_ID, $this->dosen);

    $this->actingAs($this->dosen);

    $file = UploadedFile::fake()->create('bukti.pdf', 100, 'application/pdf');
    $response = $this->post('/api/dana/pengembalian/upload-proof', [
        'laporan_id' => $laporan->laporan_id,
        'uploaded_file' => $file,
    ]);

    $response->assertStatus(500);
    expect($laporan->fresh()->pengembalian_dana_status)->toBeNull();
});

test('dosen can upload return proof when status is initialized', function () {
    $laporan = createTestLaporan(PENGEMBALIAN_ID, $this->dosen, [
        'pengembalian_dana_status' => 'Menunggu Pengembalian Dana',
    ]);

    $this->actingAs($this->dosen);

    $file = UploadedFile::fake()->create('bukti.pdf', 100, 'application/pdf');
    $response = $this->post('/api/dana/pengembalian/upload-proof', [
        'laporan_id' => $laporan->laporan_id,
        'uploaded_file' => $file,
    ]);

    $response->assertOk();

    $laporan->refresh();
    expect($laporan->pengembalian_dana_status)->toBe('Menunggu konfirmasi admin');

    $proof = $laporan->dokumen()->where('jenis_dokumen', 'Bukti Transfer Pengembalian')->first();
    expect($proof)->not->toBeNull();
    expect($proof->currentVersion->local_file_url)->not->toBeNull();
});

test('dosen upload alone does not advance stage', function () {
    $laporan = createTestLaporan(PENGEMBALIAN_ID, $this->dosen, [
        'pengembalian_dana_status' => 'Menunggu Pengembalian Dana',
    ]);

    $this->actingAs($this->dosen);

    $file = UploadedFile::fake()->create('bukti.pdf', 100, 'application/pdf');
    $this->post('/api/dana/pengembalian/upload-proof', [
        'laporan_id' => $laporan->laporan_id,
        'uploaded_file' => $file,
    ])->assertOk();

    $laporan->refresh();
    expect($laporan->kodeKegiatan())->toBe('PENGEMBALIAN_DANA_GANJIL');
    expect($laporan->pengembalian_dana_status)->toBe('Menunggu konfirmasi admin');
});

test('confirmPengembalian rejects without file', function () {
    $laporan = createTestLaporan(PENGEMBALIAN_ID, $this->dosen, [
        'pengembalian_dana_status' => 'Menunggu konfirmasi admin',
    ]);

    $this->actingAs($this->staff);

    $response = $this->post('/api/dana/pengembalian/confirm', [
        'laporan_id' => $laporan->laporan_id,
    ]);

    $response->assertStatus(500);
});

test('confirmPengembalian stores actual file with non-empty path', function () {
    $laporan = createTestLaporan(PENGEMBALIAN_ID, $this->dosen, [
        'pengembalian_dana_status' => 'Menunggu konfirmasi admin',
    ]);

    createDokumenVersion($laporan, 'Bukti Transfer Pengembalian', '/storage/documents/pengembalian-dana/proof.pdf');

    $this->actingAs($this->staff);

    $file = UploadedFile::fake()->create('bukti.pdf', 100, 'application/pdf');

    $response = $this->post('/api/dana/pengembalian/confirm', [
        'laporan_id' => $laporan->laporan_id,
        'uploaded_file' => $file,
    ]);

    $response->assertOk();

    $receipt = $laporan->dokumen()->where('jenis_dokumen', 'Bukti Penerimaan Pengembalian')->first();
    expect($receipt)->not->toBeNull();

    $version = $receipt->currentVersion;
    expect($version->local_file_url)->not->toBe('');
    expect($version->local_file_url)->not->toBeNull();
});

test('confirmPengembalian rejects without dosen return proof', function () {
    $laporan = createTestLaporan(PENGEMBALIAN_ID, $this->dosen, [
        'pengembalian_dana_status' => 'Menunggu konfirmasi admin',
    ]);

    $this->actingAs($this->staff);

    $file = UploadedFile::fake()->create('bukti.pdf', 100, 'application/pdf');

    $response = $this->post('/api/dana/pengembalian/confirm', [
        'laporan_id' => $laporan->laporan_id,
        'uploaded_file' => $file,
    ]);

    $response->assertStatus(500);
});

test('non-staff cannot confirm pengembalian', function () {
    $laporan = createTestLaporan(PENGEMBALIAN_ID, $this->dosen, [
        'pengembalian_dana_status' => 'Menunggu konfirmasi admin',
    ]);

    createDokumenVersion($laporan, 'Bukti Transfer Pengembalian', '/storage/documents/pengembalian-dana/proof.pdf');

    $this->actingAs($this->dosen);

    $file = UploadedFile::fake()->create('bukti.pdf', 100, 'application/pdf');

    $response = $this->post('/api/dana/pengembalian/confirm', [
        'laporan_id' => $laporan->laporan_id,
        'uploaded_file' => $file,
    ]);

    $response->assertStatus(403);
});

test('both proofs cause automatic completion and advancement', function () {
    $laporan = createTestLaporan(PENGEMBALIAN_ID, $this->dosen, [
        'pengembalian_dana_status' => 'Menunggu konfirmasi admin',
    ]);

    createDokumenVersion($laporan, 'Bukti Transfer Pengembalian', '/storage/documents/pengembalian-dana/proof.pdf');

    $this->actingAs($this->staff);

    $file = UploadedFile::fake()->create('bukti_penerimaan.pdf', 100, 'application/pdf');

    $this->post('/api/dana/pengembalian/confirm', [
        'laporan_id' => $laporan->laporan_id,
        'uploaded_file' => $file,
    ])->assertOk();

    $laporan->refresh();

    expect($laporan->pengembalian_dana_status)->toBe('Selesai');
    expect($laporan->pengembalian_dana_confirmed_at)->not->toBeNull();
    expect($laporan->dana_dikembalikan)->toBeTrue();
});

test('duplicate upload does not advance twice', function () {
    $laporan = createTestLaporan(PENGEMBALIAN_ID, $this->dosen, [
        'pengembalian_dana_status' => 'Menunggu konfirmasi admin',
    ]);

    createDokumenVersion($laporan, 'Bukti Transfer Pengembalian', '/storage/documents/pengembalian-dana/proof.pdf');

    $this->actingAs($this->staff);

    $file1 = UploadedFile::fake()->create('bukti1.pdf', 100, 'application/pdf');
    $this->post('/api/dana/pengembalian/confirm', [
        'laporan_id' => $laporan->laporan_id,
        'uploaded_file' => $file1,
    ])->assertOk();

    $laporan->refresh();
    expect($laporan->pengembalian_dana_status)->toBe('Selesai');

    $file2 = UploadedFile::fake()->create('bukti2.pdf', 100, 'application/pdf');
    $this->post('/api/dana/pengembalian/confirm', [
        'laporan_id' => $laporan->laporan_id,
        'uploaded_file' => $file2,
    ])->assertStatus(500);
});

test('empty placeholder document is never created for skipped return', function () {
    $laporan = createTestLaporan(PENGEMBALIAN_ID, $this->dosen, [
        'pengembalian_dana_status' => 'Menunggu Pengembalian Dana',
        'dana_dikembalikan' => false,
    ]);

    $this->actingAs($this->staff);

    $this->postJson('/api/dana/pengembalian/skip', [
        'laporan_id' => $laporan->laporan_id,
        'reason' => 'Tidak ada sisa dana',
    ])->assertOk();

    $laporan->refresh();

    expect($laporan->dokumen()->where('jenis_dokumen', 'Bukti Penerimaan Pengembalian')->count())->toBe(0);
    expect($laporan->dokumen()->where('jenis_dokumen', 'Bukti Transfer Pengembalian')->count())->toBe(0);
});

test('claim dana auto-completes normally', function () {
    $laporan = createTestLaporan(CLAIM_ID, $this->dosen);

    $this->actingAs($this->staff);

    $file1 = UploadedFile::fake()->create('transfer.pdf', 100, 'application/pdf');
    $this->post('/api/dana/claim/upload-bukti-transfer', [
        'laporan_id' => $laporan->laporan_id,
        'uploaded_file' => $file1,
    ])->assertOk();

    $laporan->refresh();
    expect($laporan->claim_dana_status)->toBe('Menunggu bukti terima');

    $this->actingAs($this->dosen);

    $file2 = UploadedFile::fake()->create('terima.pdf', 100, 'application/pdf');
    $this->post('/api/dana/claim/upload-bukti-terima', [
        'laporan_id' => $laporan->laporan_id,
        'uploaded_file' => $file2,
    ])->assertOk();

    $laporan->refresh();
    expect($laporan->claim_dana_status)->toBe('Selesai');
});

test('ketua can view dana status but cannot mutate', function () {
    $laporan = createTestLaporan(PENGEMBALIAN_ID, $this->dosen, [
        'pengembalian_dana_status' => 'Menunggu Pengembalian Dana',
    ]);

    $this->actingAs($this->ketua);

    $response = $this->getJson('/api/dana?mode=pengembalian');
    $response->assertOk();

    // Ketua cannot upload return proof (role check fails → 403)
    $file = UploadedFile::fake()->create('proof.pdf', 100, 'application/pdf');
    $response = $this->post('/api/dana/pengembalian/upload-proof', [
        'laporan_id' => $laporan->laporan_id,
        'uploaded_file' => $file,
    ]);
    $response->assertStatus(403);

    // Ketua cannot confirm pengembalian (role check fails → 403)
    $file = UploadedFile::fake()->create('proof.pdf', 100, 'application/pdf');
    $response = $this->post('/api/dana/pengembalian/confirm', [
        'laporan_id' => $laporan->laporan_id,
        'uploaded_file' => $file,
    ]);
    $response->assertStatus(403);

    // Ketua cannot skip (role check fails → 403)
    $response = $this->postJson('/api/dana/pengembalian/skip', [
        'laporan_id' => $laporan->laporan_id,
        'reason' => 'Test skip',
    ]);
    $response->assertStatus(403);
});

test('dana_disetujui=false does not block progression', function () {
    $laporan = createTestLaporan(PENGEMBALIAN_ID, $this->dosen, [
        'pengembalian_dana_status' => 'Menunggu konfirmasi admin',
        'dana_disetujui' => false,
    ]);

    createDokumenVersion($laporan, 'Bukti Transfer Pengembalian', '/storage/documents/pengembalian-dana/proof.pdf');

    $this->actingAs($this->staff);

    $file = UploadedFile::fake()->create('bukti.pdf', 100, 'application/pdf');

    $this->post('/api/dana/pengembalian/confirm', [
        'laporan_id' => $laporan->laporan_id,
        'uploaded_file' => $file,
    ])->assertOk();

    $laporan->refresh();
    expect($laporan->pengembalian_dana_status)->toBe('Selesai');
});

test('skipPengembalian still works for manual zero-fund override', function () {
    $laporan = createTestLaporan(PENGEMBALIAN_ID, $this->dosen, [
        'pengembalian_dana_status' => 'Menunggu Pengembalian Dana',
        'dana_dikembalikan' => false,
    ]);

    $this->actingAs($this->staff);

    $response = $this->postJson('/api/dana/pengembalian/skip', [
        'laporan_id' => $laporan->laporan_id,
        'reason' => 'Tidak terdapat sisa dana',
    ]);

    $response->assertOk();

    $laporan->refresh();
    expect($laporan->pengembalian_dana_status)->toBe('Dilewati');
    expect($laporan->pengembalian_dana_skipped_reason)->toBe('Tidak terdapat sisa dana');
    expect($laporan->dana_dikembalikan)->toBeFalse();
});

test('skipPengembalian rejects when dana_dikembalikan=true', function () {
    $laporan = createTestLaporan(PENGEMBALIAN_ID, $this->dosen, [
        'pengembalian_dana_status' => 'Menunggu Pengembalian Dana',
        'dana_dikembalikan' => true,
    ]);

    $this->actingAs($this->staff);

    $response = $this->postJson('/api/dana/pengembalian/skip', [
        'laporan_id' => $laporan->laporan_id,
        'reason' => 'Should fail',
    ]);

    $response->assertStatus(500);
});

test('requestPengembalian still works for backward compatibility', function () {
    $laporan = createTestLaporan(PENGEMBALIAN_ID, $this->dosen);

    $this->actingAs($this->staff);

    $response = $this->postJson('/api/dana/pengembalian/request', [
        'laporan_id' => $laporan->laporan_id,
    ]);

    $response->assertOk();

    $laporan->refresh();
    expect($laporan->pengembalian_dana_status)->toBe('Menunggu Pengembalian Dana');
});
