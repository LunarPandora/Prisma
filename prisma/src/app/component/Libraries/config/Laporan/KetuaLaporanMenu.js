import { faBookOpen, faCheck, faTimes, faEye, faClipboardList, faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons"
import { group, item } from "@/app/component/Libraries/utils/contextMenuBuilder"

export const createKetuaLaporanMenus = ({
    access,
    phase,
    handleLogbook,
    handleViewDetail,
    handleReject,
    handleKetuaApprove,
    handleKetuaReject,
    handleKetuaFinalAccept,
    handleKetuaFinalReject,
}) => {

    const prosesActions = group([
        item("Lihat Logbook", handleLogbook, {
            icon: faBookOpen,
            enabled: access?.read,
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
        item("Kembalikan ke Peneliti", handleReject, {
            icon: faTimes,
            enabled: access?.update,
            danger: true,
        }),
    ])

    // Diseminasi: before reviewers assigned → Review, Setujui, Tolak
    const diseminasiPreReview = group([
        item("Review Diseminasi", handleViewDetail, {
            icon: faEye,
            enabled: access?.read,
        }),
        item("Setujui Diseminasi", handleKetuaApprove, {
            icon: faCheck,
            enabled: (r) =>
                access?.update &&
                !r.detail?.ketua_diseminasi_approved,
        }),
        item("Tolak Diseminasi", handleKetuaReject, {
            icon: faTimes,
            enabled: (r) =>
                access?.update &&
                !r.detail?.ketua_diseminasi_approved,
            danger: true,
        }),
    ], {
        hidden: (r) => !!(r.penugasan && r.penugasan.length > 0),
    })

    // Diseminasi: after reviewers assigned → Lihat hasil Review, Terima, Tolak
    const diseminasiPostReview = group([
        item("Lihat hasil Review", handleViewDetail, {
            icon: faClipboardList,
            enabled: access?.read,
        }),
        item("Terima Laporan", handleKetuaFinalAccept, {
            icon: faCircleCheck,
            enabled: (r) =>
                access?.update &&
                r.detail?.all_reviewers_completed,
        }),
        item("Tolak Laporan", handleKetuaFinalReject, {
            icon: faCircleXmark,
            enabled: (r) =>
                access?.update &&
                r.detail?.all_reviewers_completed,
            danger: true,
        }),
    ], {
        hidden: (r) => !(r.penugasan && r.penugasan.length > 0),
    })

    const claimActions = group([
        item("Lihat Logbook", handleLogbook, {
            icon: faBookOpen,
            enabled: access?.read,
            hidden: (r) => r.jenis_penelitian === "PkM",
        }),
        item("Lihat Publikasi", handleViewDetail, {
            icon: faEye,
            enabled: access?.read,
            hidden: (r) => r.jenis_penelitian === "PkM",
        }),
    ], {
        hidden: (r) => r.jenis_penelitian === "PkM",
    })

    const pengembalianActions = group([
        item("Lihat Logbook", handleLogbook, {
            icon: faBookOpen,
            enabled: access?.read,
        }),
        item("Lihat Detail", handleViewDetail, {
            icon: faEye,
            enabled: access?.read,
        }),
    ])

    return {
        main: [],
        row: phase === "publikasi" ? [publikasiActions]
            : phase === "diseminasi" ? [diseminasiPreReview, diseminasiPostReview]
            : phase === "claim" ? [claimActions]
            : phase === "pengembalian" ? [pengembalianActions]
            : [prosesActions],
    }
}
