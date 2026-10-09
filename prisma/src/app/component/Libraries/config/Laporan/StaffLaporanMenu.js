import { faBookOpen, faUserPlus, faCheck, faTimes, faEye, faCloudArrowUp } from "@fortawesome/free-solid-svg-icons"
import { group, item } from "@/app/component/Libraries/utils/contextMenuBuilder"

export const createStaffLaporanMenus = ({
    access,
    phase,
    handleLogbook,
    handleViewDetail,
    handleAssign,
    handleStaffApprove,
    handleStaffReject,
    handleStaffReturnLaporan,
    handleUploadBuktiTransfer,
    handleUploadBuktiPenerimaan,
}) => {

    const prosesActions = group([
        item("Lihat Logbook", handleLogbook, {
            icon: faBookOpen,
            enabled: access?.read,
        }),
        item("Kembalikan untuk Perbaikan", handleStaffReturnLaporan, {
            icon: faTimes,
            enabled: (r) => access?.update && !r.detail?.has_pending_return_laporan,
            danger: true,
        }),
    ])

    const publikasiActions = group([
        item("Lihat Logbook", handleLogbook, {
            icon: faBookOpen,
            enabled: access?.read,
        }),
        item("Lihat Detail", handleViewDetail, {
            icon: faEye,
            enabled: access?.read,
        }),
        item("Kembalikan untuk Perbaikan", handleStaffReturnLaporan, {
            icon: faTimes,
            enabled: (r) => access?.update && !r.detail?.has_pending_return_laporan,
            danger: true,
        }),
    ])

    const diseminasiActions = group([
        item("Review Diseminasi", handleViewDetail, {
            icon: faEye,
            enabled: access?.read,
        }),
        item("Setujui Diseminasi", handleStaffApprove, {
            icon: faCheck,
            enabled: (r) =>
                access?.update &&
                !r.detail?.staff_diseminasi_approved &&
                !r.detail?.has_pending_diseminasi_rejection,
        }),
        item("Tolak Diseminasi", handleStaffReject, {
            icon: faTimes,
            enabled: (r) =>
                access?.update &&
                !r.detail?.staff_diseminasi_approved &&
                !r.detail?.has_pending_diseminasi_rejection,
            danger: true,
        }),
        item("Tugaskan Reviewer", handleAssign, {
            icon: faUserPlus,
            enabled: (r) =>
                access?.update &&
                r.detail?.staff_diseminasi_approved &&
                r.detail?.ketua_diseminasi_approved &&
                r.status !== "Menunggu keputusan Ketua" &&
                (!r.penugasan || r.penugasan.length === 0 ||
                    r.penugasan.every(p => p.status_review === "Belum direview")),
        }),
        item("Lihat Logbook", handleLogbook, {
            icon: faBookOpen,
            enabled: access?.read,
        }),
    ])

    const claimActions = group([
        item("Lihat Logbook", handleLogbook, {
            icon: faBookOpen,
            enabled: access?.read,
            hidden: (r) => r.jenis_penelitian === "PkM",
        }),
        item("Lihat Detail", handleViewDetail, {
            icon: faEye,
            enabled: access?.read,
            hidden: (r) => r.jenis_penelitian === "PkM",
        }),
        item("Upload Bukti Transfer", handleUploadBuktiTransfer, {
            icon: faCheck,
            enabled: (r) =>
                access?.update &&
                !r.detail?.claim_dana_status,
        }),
        item("Kembalikan untuk Perbaikan", handleStaffReturnLaporan, {
            icon: faTimes,
            enabled: (r) => access?.update && !r.detail?.has_pending_return_laporan,
            danger: true,
        }),
    ])

    const pengembalianActions = group([
        item("Lihat Logbook", handleLogbook, {
            icon: faBookOpen,
            enabled: access?.read,
        }),
        item("Lihat Detail", handleViewDetail, {
            icon: faEye,
            enabled: access?.read,
        }),
        item("Upload Bukti Penerimaan Pengembalian", handleUploadBuktiPenerimaan, {
            icon: faCloudArrowUp,
            enabled: (r) =>
                access?.update &&
                r.detail?.pengembalian_dana_status === "Menunggu konfirmasi admin",
        }),
        item("Kembalikan untuk Perbaikan", handleStaffReturnLaporan, {
            icon: faTimes,
            enabled: (r) => access?.update && !r.detail?.has_pending_return_laporan,
            danger: true,
        }),
    ])

    return {
        main: [],
        row: [
            phase === "publikasi" ? publikasiActions
                : phase === "diseminasi" ? diseminasiActions
                : phase === "pengembalian" ? pengembalianActions
                : phase === "claim" ? claimActions
                : prosesActions,
        ]
    }
}
