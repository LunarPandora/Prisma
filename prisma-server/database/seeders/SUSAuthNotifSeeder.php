<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AuthorizationRequest;
use App\Models\Notification;
use App\Helpers\NotificationUrl;

class SUSAuthNotifSeeder extends Seeder
{
    public $proposals = [];
    public $laporan = [];
    public $dosen = [];
    public $staff = [];
    public $ketua = [];
    public $reviewers = [];

    public function init($proposals, $laporan, $dosen, $staff, $ketua, $reviewers)
    {
        $this->proposals = $proposals;
        $this->laporan = $laporan;
        $this->dosen = $dosen;
        $this->staff = $staff;
        $this->ketua = $ketua;
        $this->reviewers = $reviewers;
    }

    public function run()
    {
        $this->seedAuthorizationRequests();
        $this->seedNotifications();

        $authCount = AuthorizationRequest::count();
        $notifCount = Notification::count();
        $this->command->info("Authorization requests seeded: {$authCount}");
        $this->command->info("Notifications seeded: {$notifCount}");
    }

    protected function proposalUrl($proposal, $role, $tab = 'SELEKSI_PROPOSAL')
    {
        $skemaId = $proposal->kegiatan->skema->skema_id ?? null;
        return NotificationUrl::forRole($role, 'proposal', $skemaId, $proposal->proposal_id, $tab, $proposal->jenis_penelitian);
    }

    protected function laporanUrl($laporan, $role)
    {
        $skemaId = $laporan->proposal->kegiatan->skema->skema_id ?? null;
        $tab = NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan) ?: 'PROSES_PENELITIAN';
        return NotificationUrl::forRole($role, 'laporan', $skemaId, $laporan->laporan_id, $tab, $laporan->jenis_penelitian);
    }

    protected function seedAuthorizationRequests()
    {
        // return_proposal_for_revision (8): 5 pending, 2 approved, 1 rejected
        AuthorizationRequest::create([
            'requestable_type' => 'App\Models\Proposal',
            'requestable_id' => $this->proposals[0]->proposal_id,
            'requested_by' => $this->staff[0]->id,
            'action' => 'return_proposal_for_revision',
            'status' => 'Menunggu Persetujuan',
            'source_stage' => 'SELEKSI_PROPOSAL',
            'reason' => 'Proposal memerlukan revisi pada bagian metodologi.',
            'current_data' => json_encode(['status' => 'Menunggu review Staff LPPM']),
            'proposed_data' => json_encode(['status' => 'Revisi']),
        ]);

        AuthorizationRequest::create([
            'requestable_type' => 'App\Models\Proposal',
            'requestable_id' => $this->proposals[1]->proposal_id,
            'requested_by' => $this->staff[0]->id,
            'action' => 'return_proposal_for_revision',
            'status' => 'Menunggu Persetujuan',
            'source_stage' => 'SELEKSI_PROPOSAL',
            'reason' => 'Perlu perbaikan pada bagian referensi.',
            'current_data' => json_encode(['status' => 'Menunggu review Staff LPPM']),
            'proposed_data' => json_encode(['status' => 'Revisi']),
        ]);

        AuthorizationRequest::create([
            'requestable_type' => 'App\Models\Proposal',
            'requestable_id' => $this->proposals[2]->proposal_id,
            'requested_by' => $this->staff[0]->id,
            'action' => 'return_proposal_for_revision',
            'status' => 'Menunggu Persetujuan',
            'source_stage' => 'SELEKSI_PROPOSAL',
            'reason' => 'Anggaran perlu direvisi.',
            'current_data' => json_encode(['status' => 'Menunggu review Staff LPPM']),
            'proposed_data' => json_encode(['status' => 'Revisi']),
        ]);

        AuthorizationRequest::create([
            'requestable_type' => 'App\Models\Proposal',
            'requestable_id' => $this->proposals[3]->proposal_id,
            'requested_by' => $this->staff[0]->id,
            'action' => 'return_proposal_for_revision',
            'status' => 'Menunggu Persetujuan',
            'source_stage' => 'SELEKSI_PROPOSAL',
            'reason' => 'Jadwal pelaksanaan perlu disesuaikan.',
            'current_data' => json_encode(['status' => 'Menunggu review Staff LPPM']),
            'proposed_data' => json_encode(['status' => 'Revisi']),
        ]);

        AuthorizationRequest::create([
            'requestable_type' => 'App\Models\Proposal',
            'requestable_id' => $this->proposals[4]->proposal_id,
            'requested_by' => $this->staff[0]->id,
            'action' => 'return_proposal_for_revision',
            'status' => 'Menunggu Persetujuan',
            'source_stage' => 'SELEKSI_PROPOSAL',
            'reason' => 'Lampiran belum lengkap.',
            'current_data' => json_encode(['status' => 'Menunggu review Staff LPPM']),
            'proposed_data' => json_encode(['status' => 'Revisi']),
        ]);

        // 2 approved
        AuthorizationRequest::create([
            'requestable_type' => 'App\Models\Proposal',
            'requestable_id' => $this->proposals[5]->proposal_id,
            'requested_by' => $this->staff[0]->id,
            'action' => 'return_proposal_for_revision',
            'status' => 'Disetujui',
            'source_stage' => 'SELEKSI_PROPOSAL',
            'reason' => 'Revisi ringan pada abstrak.',
            'current_data' => json_encode(['status' => 'Menunggu review Staff LPPM']),
            'proposed_data' => json_encode(['status' => 'Revisi']),
            'reviewed_by' => $this->ketua[0]->id,
            'reviewed_at' => now(),
            'review_note' => 'Disetujui untuk direvisi.',
        ]);

        AuthorizationRequest::create([
            'requestable_type' => 'App\Models\Proposal',
            'requestable_id' => $this->proposals[6]->proposal_id,
            'requested_by' => $this->staff[0]->id,
            'action' => 'return_proposal_for_revision',
            'status' => 'Disetujui',
            'source_stage' => 'SELEKSI_PROPOSAL',
            'reason' => 'Revisi judul dan topik.',
            'current_data' => json_encode(['status' => 'Menunggu review Staff LPPM']),
            'proposed_data' => json_encode(['status' => 'Revisi']),
            'reviewed_by' => $this->ketua[0]->id,
            'reviewed_at' => now(),
            'review_note' => 'Judul perlu disesuaikan.',
        ]);

        // 1 rejected
        AuthorizationRequest::create([
            'requestable_type' => 'App\Models\Proposal',
            'requestable_id' => $this->proposals[7]->proposal_id,
            'requested_by' => $this->staff[0]->id,
            'action' => 'return_proposal_for_revision',
            'status' => 'Ditolak',
            'source_stage' => 'SELEKSI_PROPOSAL',
            'reason' => 'Proposal sudah sesuai, tidak perlu revisi.',
            'current_data' => json_encode(['status' => 'Menunggu review Staff LPPM']),
            'proposed_data' => json_encode(['status' => 'Revisi']),
            'reviewed_by' => $this->ketua[0]->id,
            'reviewed_at' => now(),
            'review_note' => 'Proposal sudah memadai.',
        ]);

        // diseminasi (2): 1 pending, 1 rejected
        AuthorizationRequest::create([
            'requestable_type' => 'App\Models\Laporan',
            'requestable_id' => $this->laporan[0]->laporan_id,
            'requested_by' => $this->staff[0]->id,
            'action' => 'reject_diseminasi',
            'status' => 'Menunggu Persetujuan',
            'source_stage' => 'DISEMINASI',
            'reason' => 'Diseminasi perlu perbaikan.',
            'current_data' => json_encode(['status' => 'Diseminasi']),
            'proposed_data' => json_encode(['status' => 'Diseminasi Ditolak']),
        ]);

        AuthorizationRequest::create([
            'requestable_type' => 'App\Models\Laporan',
            'requestable_id' => $this->laporan[1]->laporan_id,
            'requested_by' => $this->staff[0]->id,
            'action' => 'reject_diseminasi',
            'status' => 'Ditolak',
            'source_stage' => 'DISEMINASI',
            'reason' => 'Diseminasi sudah sesuai dengan standar.',
            'current_data' => json_encode(['status' => 'Diseminasi']),
            'proposed_data' => json_encode(['status' => 'Diseminasi Ditolak']),
            'reviewed_by' => $this->ketua[0]->id,
            'reviewed_at' => now(),
            'review_note' => 'Diseminasi layak untuk dilanjutkan.',
        ]);
    }

    protected function seedNotifications()
    {
        $d = $this->dosen[0]->id;
        $k = $this->ketua[0]->id;
        $s = $this->staff[0]->id;
        $r = $this->reviewers[0]->id;
        $d2 = $this->dosen[1]->id;

        $notifications = [
            // dosen[0]: 12 notifications
            ['user_id' => $d, 'type' => 'proposal_update', 'title' => 'Proposal Diperbarui', 'message' => 'Proposal Anda telah diperbarui.', 'action_url' => $this->proposalUrl($this->proposals[0], 'Dosen'), 'read_at' => null, 'key' => "proposal_update_{$d}_{$this->proposals[0]->proposal_id}"],
            ['user_id' => $d, 'type' => 'reviewer_assigned', 'title' => 'Reviewer Ditugaskan', 'message' => 'Reviewer telah ditugaskan ke proposal Anda.', 'action_url' => $this->proposalUrl($this->proposals[0], 'Dosen'), 'read_at' => null, 'key' => "reviewer_assigned_{$d}_{$this->proposals[0]->proposal_id}"],
            ['user_id' => $d, 'type' => 'review_complete', 'title' => 'Review Selesai', 'message' => 'Review proposal Anda telah selesai.', 'action_url' => $this->proposalUrl($this->proposals[0], 'Dosen'), 'read_at' => null, 'key' => "review_complete_{$d}_{$this->proposals[0]->proposal_id}"],
            ['user_id' => $d, 'type' => 'proposal_returned', 'title' => 'Proposal Dikembalikan', 'message' => 'Proposal Anda dikembalikan untuk revisi.', 'action_url' => $this->proposalUrl($this->proposals[0], 'Dosen'), 'read_at' => null, 'key' => "proposal_returned_{$d}_{$this->proposals[0]->proposal_id}"],
            ['user_id' => $d, 'type' => 'laporan_update', 'title' => 'Laporan Diperbarui', 'message' => 'Laporan Anda telah diperbarui.', 'action_url' => $this->laporanUrl($this->laporan[0], 'Dosen'), 'read_at' => null, 'key' => "laporan_update_{$d}_{$this->laporan[0]->laporan_id}"],
            ['user_id' => $d, 'type' => 'notification_read', 'title' => 'Notifikasi Dibaca', 'message' => 'Notifikasi Anda telah ditandai sebagai dibaca.', 'action_url' => '/dashboard', 'read_at' => now(), 'key' => "notification_read_{$d}"],
            ['user_id' => $d, 'type' => 'proposal_accepted', 'title' => 'Proposal Diterima', 'message' => 'Proposal Anda telah diterima.', 'action_url' => $this->proposalUrl($this->proposals[1], 'Dosen'), 'read_at' => null, 'key' => "proposal_accepted_{$d}_{$this->proposals[1]->proposal_id}"],
            ['user_id' => $d, 'type' => 'reviewer_result', 'title' => 'Hasil Review', 'message' => 'Hasil review proposal Anda telah tersedia.', 'action_url' => $this->proposalUrl($this->proposals[2], 'Dosen'), 'read_at' => null, 'key' => "reviewer_result_{$d}_{$this->proposals[2]->proposal_id}"],
            ['user_id' => $d, 'type' => 'logbook_update', 'title' => 'Logbook Diperbarui', 'message' => 'Logbook Anda telah diperbarui.', 'action_url' => '/dashboard', 'read_at' => null, 'key' => "logbook_update_{$d}"],
            ['user_id' => $d, 'type' => 'dana_update', 'title' => 'Dana Diperbarui', 'message' => 'Informasi dana penelitian Anda telah diperbarui.', 'action_url' => '/dashboard', 'read_at' => null, 'key' => "dana_update_{$d}"],
            ['user_id' => $d, 'type' => 'system_announcement', 'title' => 'Pengumuman Sistem', 'message' => 'Ada pengumuman penting dari sistem LPPM.', 'action_url' => '/dashboard', 'read_at' => null, 'key' => "system_announcement_{$d}"],
            ['user_id' => $d, 'type' => 'review_reminder', 'title' => 'Pengingat Review', 'message' => 'Anda memiliki review yang perlu diselesaikan.', 'action_url' => $this->proposalUrl($this->proposals[3], 'Dosen'), 'read_at' => now(), 'key' => "review_reminder_{$d}_{$this->proposals[3]->proposal_id}"],

            // ketua[0]: 6 notifications
            ['user_id' => $k, 'type' => 'authorization_request', 'title' => 'Permintaan Otorisasi Baru', 'message' => 'Ada permintaan otorisasi baru yang perlu ditinjau.', 'action_url' => '/dashboard', 'read_at' => null, 'key' => "authorization_request_{$k}"],
            ['user_id' => $k, 'type' => 'proposal_submitted', 'title' => 'Proposal Diajukan', 'message' => 'Ada proposal baru yang diajukan.', 'action_url' => $this->proposalUrl($this->proposals[4], 'Ketua LPPM'), 'read_at' => null, 'key' => "proposal_submitted_{$k}_{$this->proposals[4]->proposal_id}"],
            ['user_id' => $k, 'type' => 'reviewer_assigned', 'title' => 'Reviewer Ditugaskan', 'message' => 'Reviewer telah ditugaskan ke proposal.', 'action_url' => $this->proposalUrl($this->proposals[5], 'Ketua LPPM'), 'read_at' => null, 'key' => "reviewer_assigned_ketua_{$k}_{$this->proposals[5]->proposal_id}"],
            ['user_id' => $k, 'type' => 'review_complete', 'title' => 'Review Selesai', 'message' => 'Review proposal telah selesai.', 'action_url' => $this->proposalUrl($this->proposals[6], 'Ketua LPPM'), 'read_at' => now(), 'key' => "review_complete_ketua_{$k}_{$this->proposals[6]->proposal_id}"],
            ['user_id' => $k, 'type' => 'proposal_accepted', 'title' => 'Proposal Diterima', 'message' => 'Proposal telah diterima oleh sistem.', 'action_url' => $this->proposalUrl($this->proposals[7], 'Ketua LPPM'), 'read_at' => null, 'key' => "proposal_accepted_ketua_{$k}_{$this->proposals[7]->proposal_id}"],
            ['user_id' => $k, 'type' => 'system_announcement', 'title' => 'Pengumuman Sistem', 'message' => 'Ada pengumuman penting dari sistem LPPM.', 'action_url' => '/dashboard', 'read_at' => null, 'key' => "system_announcement_ketua_{$k}"],

            // staff[0]: 8 notifications
            ['user_id' => $s, 'type' => 'reviewer_assigned', 'title' => 'Reviewer Ditugaskan', 'message' => 'Reviewer telah ditugaskan ke proposal.', 'action_url' => $this->proposalUrl($this->proposals[8], 'Staff LPPM'), 'read_at' => null, 'key' => "reviewer_assigned_staff_{$s}_{$this->proposals[8]->proposal_id}"],
            ['user_id' => $s, 'type' => 'review_complete', 'title' => 'Review Selesai', 'message' => 'Review proposal telah selesai.', 'action_url' => $this->proposalUrl($this->proposals[9], 'Staff LPPM'), 'read_at' => null, 'key' => "review_complete_staff_{$s}_{$this->proposals[9]->proposal_id}"],
            ['user_id' => $s, 'type' => 'authorization_resolved', 'title' => 'Otorisasi Diselesaikan', 'message' => 'Permintaan otorisasi telah diselesaikan.', 'action_url' => '/dashboard', 'read_at' => now(), 'key' => "authorization_resolved_{$s}"],
            ['user_id' => $s, 'type' => 'laporan_reviewed', 'title' => 'Laporan Direview', 'message' => 'Laporan Anda telah direview oleh reviewer.', 'action_url' => $this->laporanUrl($this->laporan[0], 'Staff LPPM'), 'read_at' => null, 'key' => "laporan_reviewed_{$s}_{$this->laporan[0]->laporan_id}"],
            ['user_id' => $s, 'type' => 'proposal_update', 'title' => 'Proposal Diperbarui', 'message' => 'Status proposal telah diperbarui.', 'action_url' => $this->proposalUrl($this->proposals[10], 'Staff LPPM'), 'read_at' => null, 'key' => "proposal_update_staff_{$s}_{$this->proposals[10]->proposal_id}"],
            ['user_id' => $s, 'type' => 'system_announcement', 'title' => 'Pengumuman Sistem', 'message' => 'Ada pengumuman penting dari sistem LPPM.', 'action_url' => '/dashboard', 'read_at' => null, 'key' => "system_announcement_staff_{$s}"],
            ['user_id' => $s, 'type' => 'notification_reminder', 'title' => 'Pengingat Notifikasi', 'message' => 'Anda memiliki notifikasi yang belum ditindaklanjuti.', 'action_url' => '/dashboard', 'read_at' => null, 'key' => "notification_reminder_{$s}"],
            ['user_id' => $s, 'type' => 'dana_processed', 'title' => 'Dana Diproses', 'message' => 'Pengajuan dana penelitian Anda sedang diproses.', 'action_url' => '/dashboard', 'read_at' => now(), 'key' => "dana_processed_{$s}"],

            // reviewers[0]: 6 notifications
            ['user_id' => $r, 'type' => 'reviewer_assigned', 'title' => 'Reviewer Ditugaskan', 'message' => 'Anda telah ditugaskan sebagai reviewer.', 'action_url' => $this->proposalUrl($this->proposals[11], 'Reviewer'), 'read_at' => null, 'key' => "reviewer_assigned_rev_{$r}_{$this->proposals[11]->proposal_id}"],
            ['user_id' => $r, 'type' => 'review_complete', 'title' => 'Review Selesai', 'message' => 'Review Anda telah selesai diproses.', 'action_url' => $this->proposalUrl($this->proposals[12], 'Reviewer'), 'read_at' => null, 'key' => "review_complete_rev_{$r}_{$this->proposals[12]->proposal_id}"],
            ['user_id' => $r, 'type' => 'review_reminder', 'title' => 'Pengingat Review', 'message' => 'Anda memiliki review yang perlu diselesaikan.', 'action_url' => $this->proposalUrl($this->proposals[13], 'Reviewer'), 'read_at' => now(), 'key' => "review_reminder_rev_{$r}_{$this->proposals[13]->proposal_id}"],
            ['user_id' => $r, 'type' => 'proposal_update', 'title' => 'Proposal Diperbarui', 'message' => 'Status proposal yang Anda review telah diperbarui.', 'action_url' => $this->proposalUrl($this->proposals[14], 'Reviewer'), 'read_at' => null, 'key' => "proposal_update_rev_{$r}_{$this->proposals[14]->proposal_id}"],
            ['user_id' => $r, 'type' => 'system_announcement', 'title' => 'Pengumuman Sistem', 'message' => 'Ada pengumuman penting dari sistem LPPM.', 'action_url' => '/dashboard', 'read_at' => null, 'key' => "system_announcement_rev_{$r}"],
            ['user_id' => $r, 'type' => 'assignment_change', 'title' => 'Perubahan Penugasan', 'message' => 'Penugasan review Anda telah berubah.', 'action_url' => $this->proposalUrl($this->proposals[15], 'Reviewer'), 'read_at' => null, 'key' => "assignment_change_{$r}_{$this->proposals[15]->proposal_id}"],

            // dosen[1]: 4 notifications
            ['user_id' => $d2, 'type' => 'proposal_update', 'title' => 'Proposal Diperbarui', 'message' => 'Proposal Anda telah diperbarui.', 'action_url' => $this->proposalUrl($this->proposals[16], 'Dosen'), 'read_at' => null, 'key' => "proposal_update_{$d2}_{$this->proposals[16]->proposal_id}"],
            ['user_id' => $d2, 'type' => 'reviewer_assigned', 'title' => 'Reviewer Ditugaskan', 'message' => 'Reviewer telah ditugaskan ke proposal Anda.', 'action_url' => $this->proposalUrl($this->proposals[17], 'Dosen'), 'read_at' => now(), 'key' => "reviewer_assigned_{$d2}_{$this->proposals[17]->proposal_id}"],
            ['user_id' => $d2, 'type' => 'laporan_update', 'title' => 'Laporan Diperbarui', 'message' => 'Laporan Anda telah diperbarui.', 'action_url' => $this->laporanUrl($this->laporan[1], 'Dosen'), 'read_at' => null, 'key' => "laporan_update_{$d2}_{$this->laporan[1]->laporan_id}"],
            ['user_id' => $d2, 'type' => 'review_complete', 'title' => 'Review Selesai', 'message' => 'Review proposal Anda telah selesai.', 'action_url' => $this->proposalUrl($this->proposals[18], 'Dosen'), 'read_at' => null, 'key' => "review_complete_{$d2}_{$this->proposals[18]->proposal_id}"],
        ];

        foreach ($notifications as $data) {
            $data['data'] = json_encode(['notification_key' => $data['type']]);
            $data['created_at'] = now();
            $data['updated_at'] = now();
            Notification::create($data);
        }
    }
}
