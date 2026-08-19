"use client"

import Image from "next/image"

import { faFilePdf } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import CustomTable from "@/app/component/Table/CustomTable"
import { formatIndonesianDate } from "@/app/component/Libraries/utils/date"
import { getProposal } from "@/app/component/Libraries/api/proposal"

export default function PengumumanSuratTugasPanel({
    skema,
    refreshKey,

    alertMsg,
    alertStatus,
    alertTrigger,
}) {
    function findSuratTugasPengumuman(dokumen) {
        return dokumen?.find((d) => d.jenis_dokumen === "Pengumuman Surat Tugas")
    }

    function fetchAcceptedProposals(query = '') {
        return getProposal(
            `skema_id=${skema.skema_id}&status=Proposal+Diterima&${query}`
        )
    }

    return (
        <div className="flex flex-col gap-y-3 w-full border border-gray-300 rounded-md p-5 bg-white">

            <div className="flex flex-col gap-1">
                <span className="text-gray-600 text-lg font-medium">
                    Pengumuman Surat Tugas
                </span>

                <span className="text-sm text-gray-500 font-light">
                    Daftar proposal yang telah diterima beserta Surat Tugas pengumuman.
                </span>
            </div>

            <CustomTable
                fetchMethod={fetchAcceptedProposals}
                refreshKey={refreshKey}
                hideActions
                columns={[
                    {
                        header: "Ketua Peneliti",
                        key: "dosen",
                        width: "15%",
                        render: (value, row) => {
                            return (
                                <span className="flex items-center gap-2">
                                    <Image
                                        src={row.dosen?.avatar_url || "/img/user_placeholder.webp"}
                                        alt={row.dosen?.nama || ""}
                                        width={25}
                                        height={25}
                                        className="rounded-full"
                                        unoptimized
                                    />
                                    <span className="truncate">{row.dosen?.nama || "-"}</span>
                                </span>
                            )
                        }
                    },
                    {
                        header: "Rencana Judul (Ganjil)",
                        key: "rencana_judul_publikasi_gan",
                        width: "20%",
                        render: (value) => {
                            return (
                                <span className="line-clamp-2" title={value}>
                                    {value || "-"}
                                </span>
                            )
                        }
                    },
                    {
                        header: "Rencana Judul (Genap)",
                        key: "rencana_judul_publikasi_gen",
                        width: "20%",
                        render: (value) => {
                            return (
                                <span className="line-clamp-2" title={value}>
                                    {value || "-"}
                                </span>
                            )
                        }
                    },
                    {
                        header: "Tgl Pengajuan",
                        key: "tgl_pengajuan",
                        width: "12%",
                        render: (value) => {
                            return formatIndonesianDate(value)
                        }
                    },
                    {
                        header: "Surat Tugas Pengumuman",
                        key: "dokumen",
                        width: "15%",
                        render: (value, row) => {
                            const stDoc = findSuratTugasPengumuman(row.dokumen)

                            if (stDoc?.file_url) {
                                return (
                                    <a
                                        href={stDoc.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-blue-600 hover:underline text-sm"
                                    >
                                        <FontAwesomeIcon icon={faFilePdf} />
                                        Lihat Surat Tugas
                                    </a>
                                )
                            }

                            return (
                                <span className="text-gray-400 italic text-xs">
                                    Belum diupload
                                </span>
                            )
                        }
                    },
                ]}
            />

        </div>
    )
}
