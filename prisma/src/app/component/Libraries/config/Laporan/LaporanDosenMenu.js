import { faEdit, faFlagCheckered, faBullhorn, faMoneyBillWave, faBookOpen, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons"
import { group, item } from "@/app/component/Libraries/utils/contextMenuBuilder"

export const createLaporanDosenMenus = ({
    user,
    access,
    semesterFilter,
    isSemesterActive,
    handleViewLogbook,
    handleFinish,
    handlePublikasi,
    handleUploadClaimProof,
    handleUploadPengembalianProof,
    handleSitasi,
    handleViewRevisiReason,
}) => {
    const isSemesterMatch = (r) => {
        if (semesterFilter === "both") return true
        if (semesterFilter === "ganjil") return r.semester === "Ganjil"
        if (semesterFilter === "genap") return r.semester === "Genap"
        return false
    }
    const canAct = (r) => {
        if (!access.update) return false
        const semKey = r.semester === "Ganjil" ? "GANJIL" : "GENAP"
        return isSemesterActive(semKey) && isSemesterMatch(r)
    }

    return {
        main: [],

        row: [
            group(
                [
                    item("Cek Logbook", handleViewLogbook, {
                        icon: faEdit,
                        enabled: (r) =>
                            canAct(r) &&
                            ["PROSES_PENELITIAN_GANJIL", "PROSES_PENELITIAN_GENAP",
                             "PROSES_PKM_GANJIL", "PROSES_PKM_GENAP"].includes(r.kode_kegiatan)
                    }),
                    item("Selesaikan Laporan", handleFinish, {
                        icon: faFlagCheckered,
                        enabled: (r) =>
                            canAct(r) &&
                            ["PROSES_PENELITIAN_GANJIL", "PROSES_PENELITIAN_GENAP",
                             "PROSES_PKM_GANJIL", "PROSES_PKM_GENAP"].includes(r.kode_kegiatan)
                    }),
                    item("Publikasi", handlePublikasi, {
                        icon: faBullhorn,
                        enabled: (r) =>
                            canAct(r) &&
                            ["PUBLIKASI_GANJIL", "PUBLIKASI_GENAP"].includes(r.kode_kegiatan)
                    }),
                    item("Upload Bukti Terima Claim Dana", handleUploadClaimProof, {
                        icon: faMoneyBillWave,
                        enabled: (r) =>
                            canAct(r) &&
                            ["CLAIM_DANA_GANJIL", "CLAIM_DANA_GENAP"].includes(r.kode_kegiatan) &&
                            r.detail?.claim_dana_status === "Menunggu bukti terima"
                    }),
                    item("Upload Bukti Pengembalian Dana", handleUploadPengembalianProof, {
                        icon: faMoneyBillWave,
                        enabled: (r) =>
                            canAct(r) &&
                            ["PENGEMBALIAN_DANA_GANJIL", "PENGEMBALIAN_DANA_GENAP"].includes(r.kode_kegiatan) &&
                            r.detail?.pengembalian_dana_status === "Menunggu Pengembalian Dana"
                    }),
                    item("Kelola Sitasi", handleSitasi, {
                        icon: faBookOpen,
                        enabled: (r) =>
                            canAct(r) &&
                            ["LUARAN_PENELITIAN", "LUARAN_PKM"].includes(r.kode_kegiatan)
                    }),
                ]
            ),
            group(
                [
                    item("Lihat Alasan Revisi", handleViewRevisiReason, {
                        icon: faExclamationTriangle,
                    }),
                ],
                {
                    hidden: (r) => r.status !== "Revisi"
                }
            )
        ]
    }
}
