import { faEye, faTrashCan, faFile, faUpload, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons"
import { group, item } from "@/app/component/Libraries/utils/contextMenuBuilder"

export const createProposalAdminMenus = ({
    user,
    access,
    handleShow,
    handlePenugasan,
    handleTolak,
    handleCheckReview,
    handleUploadSK,
    handleTerimaProposal,
    handleKetuaDecideSeleksi,
    handleStaffDecideSeleksi,
    handleStaffRejectProposal,
    handleStaffReturnProposal,
    handleViewSeleksiRejection
}) => ({
    main: [],

    row: [
        // ── Dosen upload: Menunggu review Staff LPPM (Staff screens first) ──
        group(
            [
                item("Cek pengajuan", handleShow, {
                    icon: faEye,
                    enabled: (r) => access.read && r.status === "Menunggu review Staff LPPM"
                }),
                item("Setujui Proposal", handleStaffDecideSeleksi, {
                    icon: faCheck,
                    enabled: (r) => access.update && r.status === "Menunggu review Staff LPPM" && user?.role === "Staff LPPM"
                }),
                item("Kembalikan untuk Perbaikan", handleStaffReturnProposal, {
                    icon: faTimes,
                    enabled: (r) => access.update && r.status === "Menunggu review Staff LPPM" && user?.role === "Staff LPPM",
                    danger: true
                }),
                item("Tolak Proposal", handleStaffRejectProposal, {
                    icon: faTrashCan,
                    enabled: (r) => access.update && r.status === "Menunggu review Staff LPPM" && user?.role === "Staff LPPM",
                    danger: true
                })
            ],
            {
                hidden: (r) => r.status !== "Menunggu review Staff LPPM"
            }
        ),

        // ── Staff approved: Menunggu review dari Ketua LPPM (Ketua reviews second) ──
        group(
            [
                item("Cek pengajuan", handleShow, {
                    icon: faEye,
                    enabled: (r) => access.read && r.status === "Menunggu review dari Ketua LPPM"
                }),
                item("Setujui Proposal", handleKetuaDecideSeleksi, {
                    icon: faCheck,
                    enabled: (r) => access.update && r.status === "Menunggu review dari Ketua LPPM" && user?.role === "Ketua LPPM"
                }),
                item("Tolak Proposal", handleTolak, {
                    icon: faTrashCan,
                    enabled: (r) => access.delete && r.status === "Menunggu review dari Ketua LPPM" && user?.role === "Ketua LPPM",
                    danger: true
                })
            ],
            {
                hidden: (r) => r.status !== "Menunggu review dari Ketua LPPM"
            }
        ),

        // ── Menunggu penugasan reviewer ──
        group(
            [
                item("Cek pengajuan", handleShow, {
                    icon: faEye,
                    enabled: (r) => access.read && r.status === "Menunggu penugasan reviewer"
                }),
                item("Tugaskan Reviewer", handlePenugasan, {
                    icon: faUpload,
                    enabled: (r) => access.update && r.status === "Menunggu penugasan reviewer" && user?.role === "Staff LPPM"
                }),
            ],
            {
                hidden: (r) => r.status !== "Menunggu penugasan reviewer"
            }
        ),

        // ── Menunggu review (reviewer assigned, review in progress) ──
        group(
            [
                item("Cek progress review", handleCheckReview, {
                    icon: faFile,
                    enabled: (r) => access.update && r.status === "Menunggu review"
                }),
            ],
            {
                hidden: (r) => r.status !== "Menunggu review"
            }
        ),

        // ── Menunggu persetujuan Ketua LPPM (all reviewers done) ──
        group(
            [
                item("Cek pengajuan", handleCheckReview, {
                    icon: faEye,
                    enabled: (r) => access.read && r.status === "Menunggu persetujuan Ketua LPPM"
                }),
                item("Terima Proposal", handleTerimaProposal, {
                    icon: faUpload,
                    enabled: (r) => access.update && r.status === "Menunggu persetujuan Ketua LPPM" && user?.role === "Ketua LPPM"
                }),
                item("Tolak pengajuan", handleTolak, {
                    icon: faTrashCan,
                    enabled: (r) => access.delete && r.status === "Menunggu persetujuan Ketua LPPM" && user?.role === "Ketua LPPM",
                    danger: true
                })
            ],
            {
                hidden: (r) => r.status !== "Menunggu persetujuan Ketua LPPM"
            }
        ),

        // ── Proposal Diterima ──
        group(
            [
                item("Cek pengajuan", handleShow, {
                    icon: faEye,
                    enabled: (r) => access.read && r.status === "Proposal Diterima"
                }),
            ],
            {
                hidden: (r) => r.status !== "Proposal Diterima"
            }
        ),

        // ── Dalam pengerjaan ──
        group(
            [
                item("Cek pengajuan", handleShow, {
                    icon: faEye,
                    enabled: (r) => access.read && r.status === "Dalam pengerjaan"
                }),
            ],
            {
                hidden: (r) => r.status !== "Dalam pengerjaan"
            }
        ),
    ]
})
