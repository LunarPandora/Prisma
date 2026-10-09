"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCloudArrowUp, faSpinner, faX } from "@fortawesome/free-solid-svg-icons"

import { useUserStore } from "@/app/stores/useUserStore"
import { getModuleAccess } from "@/app/component/Libraries/utils/menu"

import CustomTable from "@/app/component/Table/CustomTable"
import ContextMenu from "@/app/component/Context/ContextMenu"
import Alert from "@/app/component/Alert/Alert"
import Button from "@/app/component/Inputs/Button"
import TextTag from "@/app/component/Tags/TextTag"
import Badge from "@/app/component/Display/Badge"
import { DANA_STATUS_COLORS } from "@/app/component/Libraries/config/statusColors"

import { useContextMenu } from "@/app/component/Libraries/hooks/useContextMenu"
import { useQueryBuilder } from "@/app/component/Libraries/hooks/useQueryBuilder"

import {
    getDana,
    uploadBuktiTransfer,
    requestPengembalianDana,
} from "@/app/component/Libraries/api/dana"

import { createDanaAdminMenus } from "@/app/component/Libraries/config/Dana/DanaAdminMenu"

/*
 * mode: "claim" | "pengembalian"
 */
export default function MonitoringDanaAdmin({ mode = "claim", skema, onBack }) {

    const qb = useQueryBuilder()
    const { contextMenu, openMenu, closeMenu } = useContextMenu()

    const [refreshKey, setRefreshKey] = useState(0)
    const [tempRow, setTempRow] = useState(null)

    const [showConfirmAlert, setShowConfirmAlert] = useState(false)
    const [confirmConfig, setConfirmConfig] = useState({
        title: "",
        msg: "",
        onAccept: null,
    })

    const [showBuktiTransferModal, setShowBuktiTransferModal] = useState(false)
    const [buktiTransferFile, setBuktiTransferFile] = useState(null)
    const [loadingBuktiTransfer, setLoadingBuktiTransfer] = useState(false)
    const [showConfirmUpload, setShowConfirmUpload] = useState(false)

    const user = useUserStore(state => state.user)
    const access = getModuleAccess("staffmonitoringprogresslaporan", user?.role)

    useEffect(() => {
        qb.addFilter("mode", mode)
        if (skema?.skema_id) qb.addFilter("skema_id", skema.skema_id)
    }, [mode, skema])

    const menus = createDanaAdminMenus({
        mode,
        access,
        handleUploadBuktiTransfer,
        handleRequestPengembalian,
    })

    function refreshTable() {
        setRefreshKey(prev => prev + 1)
    }

    function showConfirm(title, msg, onAccept) {
        setConfirmConfig({ title, msg, onAccept })
        setShowConfirmAlert(true)
    }

    function showResult(res, successMsg, failMsg) {
        refreshTable()
    }

    async function runAction(api, row, successMsg, failMsg) {
        try {
            const formData = new FormData()
            formData.append("laporan_id", row.laporan_id)
            const res = await api(formData)
            showResult(res, successMsg, failMsg)
        } catch (err) {
            console.error(err)
        } finally {
            setShowConfirmAlert(false)
        }
    }

    function handleUploadBuktiTransfer(r) {
        setTempRow(r)
        setBuktiTransferFile(null)
        setShowBuktiTransferModal(true)
    }

    async function runUploadBuktiTransfer() {
        if (!buktiTransferFile || !tempRow) return

        try {
            setLoadingBuktiTransfer(true)

            const formData = new FormData()
            formData.append("laporan_id", tempRow.laporan_id)
            formData.append("uploaded_file", buktiTransferFile)

            await uploadBuktiTransfer(formData)
        } catch (err) {
            console.error(err)
        } finally {
            setShowBuktiTransferModal(false)
            setLoadingBuktiTransfer(false)
            refreshTable()
        }
    }

    function handleRequestPengembalian(r) {
        setTempRow(r)
        showConfirm(
            "Minta Pengembalian Dana",
            "Peneliti akan diminta mengunggah bukti pengembalian. Lanjutkan?",
            () => runAction(
                requestPengembalianDana, r,
                "Permintaan pengembalian berhasil dikirim.",
                "Gagal meminta pengembalian dana."
            )
        )
    }

    const isPengembalian = mode === "pengembalian"

    return (
        <div
            className="flex flex-col gap-5 min-h-screen"
            onContextMenu={(e) => openMenu(e)}
        >
            <div className="flex flex-col justify-between items-start gap-5">

                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <button onClick={onBack} className="hover:text-black">
                        Monitoring Progress
                    </button>
                    <span>›</span>
                    <span>{skema?.nama_skema}</span>
                    <span>›</span>
                    <span className="font-medium text-black">
                        {isPengembalian ? "Pengembalian Dana" : "Claim Dana"}
                    </span>
                </div>

                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-medium">
                        {isPengembalian ? "Pengembalian Dana" : "Claim Dana"}
                    </h1>
                    <p className="text-lg text-gray-500 font-light">
                        {isPengembalian
                            ? "Kelola pengembalian dana dari peneliti PkM."
                            : "Kelola claim pembiayaan penelitian dari peneliti."
                        }
                    </p>
                </div>

                <CustomTable
                    fetchMethod={getDana}
                    searchQuery={qb.toQueryString()}
                    refreshKey={refreshKey}
                    className="w-full"
                    onContextRequest={(e, type, data, source) =>
                        openMenu(e, type, data, source)
                    }
                    onRefresh={refreshTable}
                    rowActions={
                        (menus.row ?? []).flatMap(group =>
                            (group.items ?? []).map(a => ({
                                ...a,
                                hidden: a.hidden || group.hidden,
                            }))
                        )
                    }
                    columns={[
                        {
                            header: "Judul",
                            key: "judul_penelitian",
                            width: "25%",
                            render: (value, row) => (
                                <div className="flex items-center gap-2">
                                    <TextTag
                                        color={row.semester === "Ganjil" ? "#C4161C" : "#0197CA"}
                                        size="text-xs"
                                    >
                                        {row.semester}
                                    </TextTag>
                                    <p className="text-sm line-clamp-2">{value}</p>
                                </div>
                            )
                        },
                        {
                            header: "Ketua",
                            key: "ketua",
                            render: (value, row) => (
                                <div className="flex items-center gap-2 text-xs">
                                    {row.proposal?.user?.avatar_url &&
                                        <Image
                                            src={row.proposal.user.avatar_url}
                                            alt={row.proposal.user.nama}
                                            width={25}
                                            height={25}
                                            className="rounded-full"
                                            unoptimized
                                        />
                                    }
                                    <span>{row.proposal?.user?.nama}</span>
                                </div>
                            )
                        },
                        {
                            header: "Tahap",
                            key: "kegiatan",
                            render: (value) => value?.nama_kegiatan || "-"
                        },
                        {
                            header: "Status",
                            key: isPengembalian
                                ? "pengembalian_dana_status"
                                : "claim_dana_status",
                            render: (value) => {

                                if (!value) {
                                    return (
                                        <span className="text-sm italic text-gray-500">
                                            Belum diproses
                                        </span>
                                    )
                                }

                                return (
                                    <Badge color={DANA_STATUS_COLORS[value]?.color || 'gray'} size="md" className="w-fit">
                                        {value}
                                    </Badge>
                                )
                            }
                        },
                        {
                            header: "Bukti Transfer",
                            key: "dokumen",
                            render: (value) => {

                                const jenis = isPengembalian
                                    ? "Bukti Transfer Pengembalian"
                                    : "Bukti Transfer Claim"

                                const doc = (value || []).find(
                                    d => d.jenis_dokumen === jenis
                                )

                                const fileUrl = doc?.currentVersion?.local_file_url
                                    || doc?.currentVersion?.drive_file_url

                                if (!fileUrl) {
                                    return (
                                        <span className="text-sm italic text-gray-500">
                                            Belum diupload
                                        </span>
                                    )
                                }

                                return (
                                    <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        Lihat bukti
                                    </a>
                                )
                            }
                        },
                    ]}
                />

            </div>

            <AnimatePresence>
                {showBuktiTransferModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 will-change-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-xl p-6 w-full max-w-md flex flex-col gap-4"
                            initial={{ scale: 1.05 }}
                            animate={{ scale: 1 }}
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">Upload Bukti Transfer</h3>
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowBuktiTransferModal(false)}
                                    icon={faX}
                                />
                            </div>

                            <p className="text-sm text-gray-500">
                                Upload bukti bahwa transfer dana telah berhasil dikirim ke peneliti.
                                Format: PDF, JPG, atau PNG. Ukuran maksimal 5MB.
                            </p>

                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault()
                                    const f = e.dataTransfer.files[0]
                                    if (f) setBuktiTransferFile(f)
                                }}
                                onClick={() => document.getElementById("bukti-transfer-input")?.click()}
                                className={`
                                    flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed
                                    transition-all duration-200 cursor-pointer
                                    ${buktiTransferFile
                                        ? "border-green-400 bg-green-50"
                                        : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
                                    }
                                `}
                            >
                                {buktiTransferFile ? (
                                    <>
                                        <FontAwesomeIcon icon={faCloudArrowUp} className="text-green-500 text-2xl" />
                                        <span className="text-sm font-medium text-green-700">{buktiTransferFile.name}</span>
                                        <span className="text-xs text-green-600">Klik untuk mengganti file</span>
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faCloudArrowUp} className="text-gray-400 text-2xl" />
                                        <span className="text-sm text-gray-500">Klik atau seret file ke sini</span>
                                    </>
                                )}
                            </div>

                            <input
                                id="bukti-transfer-input"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={(e) => setBuktiTransferFile(e.target.files[0] || null)}
                            />

                            <div className="flex justify-end gap-2 mt-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowBuktiTransferModal(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={() => setShowConfirmUpload(true)}
                                    disabled={!buktiTransferFile || loadingBuktiTransfer}
                                >
                                    {loadingBuktiTransfer ? "Mengupload..." : "Upload"}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showConfirmAlert && (
                    <Alert
                        alertType="warning"
                        title={confirmConfig.title}
                        msg={confirmConfig.msg}
                        onCancel={() => setShowConfirmAlert(false)}
                        onAccept={confirmConfig.onAccept}
                        acceptText="Konfirmasi"
                        isConfirmation={true}
                        withBackground={true}
                    />
                )}
            </AnimatePresence>

            {showConfirmUpload && (
                <Alert
                    alertType="warning"
                    title="Upload Bukti Transfer"
                    msg="Apakah Anda yakin ingin mengupload bukti transfer ini?"
                    onCancel={() => setShowConfirmUpload(false)}
                    onAccept={() => {
                        setShowConfirmUpload(false)
                        runUploadBuktiTransfer()
                    }}
                    acceptText="Upload"
                    isConfirmation={true}
                    withBackground={true}
                />
            )}

            <ContextMenu
                contextMenu={contextMenu}
                closeMenu={closeMenu}
                menus={menus}
            />
        </div>
    )
}
