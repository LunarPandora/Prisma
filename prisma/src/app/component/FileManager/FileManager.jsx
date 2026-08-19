"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faFilePdf,
    faFileWord,
    faFileLines,
    faCloudArrowUp,
    faLock,
    faLockOpen,
    faDownload,
    faEye,
    faSpinner,
    faFolder,
    faFolderOpen,
    faChevronRight,
    faUpload,
} from "@fortawesome/free-solid-svg-icons"

import Alert from "@/app/component/Alert/Alert"
import Badge from "@/app/component/Display/Badge"

function FileRow({ doc, label, isLocked, onReplace, loading, meta }) {
    const [isDragOver, setIsDragOver] = useState(false)
    const [showReplaceModal, setShowReplaceModal] = useState(false)
    const [pendingFile, setPendingFile] = useState(null)
    const fileInputRef = useRef(null)

    const hasFile = !!doc?.file_url || !!doc?.drive_file_url

    const handleDragOver = (e) => {
        e.preventDefault()
        if (!isLocked) setIsDragOver(true)
    }

    const handleDragLeave = () => setIsDragOver(false)

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragOver(false)
        if (isLocked) return

        const file = e.dataTransfer.files[0]
        if (file && file.type === "application/pdf") {
            setPendingFile(file)
            setShowReplaceModal(true)
        }
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            setPendingFile(file)
            setShowReplaceModal(true)
        }
        e.target.value = ""
    }

    const confirmReplace = () => {
        if (pendingFile && onReplace) {
            onReplace(doc?.dokumen_id || null, pendingFile, meta)
        }
        setShowReplaceModal(false)
        setPendingFile(null)
    }

    const cancelReplace = () => {
        setShowReplaceModal(false)
        setPendingFile(null)
    }

    const getIcon = () => {
        if (!hasFile) return faCloudArrowUp
        if (doc?.nama_file?.endsWith(".docx")) return faFileWord
        if (doc?.nama_file?.endsWith(".pdf")) return faFilePdf
        return faFileLines
    }

    const getIconStyle = () => {
        if (!hasFile) return { icon: "text-gray-400", bg: "bg-gray-100" }
        if (doc?.nama_file?.endsWith(".pdf")) return { icon: "text-red-500", bg: "bg-red-50" }
        if (doc?.nama_file?.endsWith(".docx")) return { icon: "text-blue-600", bg: "bg-blue-50" }
        return { icon: "text-gray-600", bg: "bg-gray-100" }
    }

    const iconStyle = getIconStyle()

    return (
        <>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isLocked && fileInputRef.current?.click()}
                className={`
                    group relative flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-150
                    ${isDragOver
                        ? "bg-blue-50 ring-1 ring-blue-300"
                        : isLocked
                            ? hasFile
                                ? "bg-white hover:bg-gray-50 cursor-default border border-gray-200"
                                : "bg-gray-50 opacity-40 cursor-default"
                            : "bg-white hover:bg-gray-50 cursor-pointer border border-gray-200"
                    }
                `}
            >
                {/* Icon */}
                <div className={`
                    w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                    ${isLocked ? "bg-gray-100" : iconStyle.bg}
                `}>
                    <FontAwesomeIcon
                        icon={getIcon()}
                        className={`text-sm ${isLocked ? "text-gray-500" : iconStyle.icon}`}
                    />
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium truncate ${isLocked ? "text-gray-700" : "text-gray-800"}`}>
                            {label}
                        </span>
                        {isLocked && (
                            <FontAwesomeIcon icon={faLock} className="text-gray-400 text-[10px]" />
                        )}
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${isLocked ? "text-gray-500" : "text-gray-400"}`}>
                        <span className="truncate">{hasFile ? (doc?.nama_file || "File") : "Belum ada file"}</span>
                        {hasFile && doc?.version && (
                            <>
                                <span>·</span>
                                <span className={isLocked ? "text-gray-500" : "text-gray-500"}>v{doc.version}</span>
                            </>
                        )}
                        {hasFile && doc?.tgl_upload && (
                            <>
                                <span>·</span>
                                <span>{new Date(doc.tgl_upload).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Actions */}
                {hasFile && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                            title="Lihat"
                        >
                            <FontAwesomeIcon icon={faEye} className="text-gray-500 text-xs" />
                        </a>
                        <a
                            href={doc.file_url}
                            download
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                            title="Download"
                        >
                            <FontAwesomeIcon icon={faDownload} className="text-gray-500 text-xs" />
                        </a>
                        {!isLocked && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    fileInputRef.current?.click()
                                }}
                                className="p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                                title="Ganti"
                            >
                                <FontAwesomeIcon icon={faUpload} className="text-gray-500 text-xs" />
                            </button>
                        )}
                    </div>
                )}

                {!hasFile && !isLocked && (
                    <span className="text-[10px] text-gray-400 group-hover:text-gray-500 transition-colors">
                        Klik untuk upload
                    </span>
                )}

                {!isLocked && (
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                )}

                {loading && (
                    <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
                        <FontAwesomeIcon icon={faSpinner} className="text-black animate-spin text-sm" />
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showReplaceModal && (
                    <Alert
                        alertType="warning"
                        title="Ganti Dokumen"
                        msg={`Apakah anda yakin ingin mengganti dokumen "${doc?.nama_file || "ini"}" dengan file baru?`}
                        onCancel={cancelReplace}
                        onAccept={confirmReplace}
                        acceptText="Ganti"
                        isConfirmation={true}
                        withBackground={true}
                    />
                )}
            </AnimatePresence>
        </>
    )
}

function SidebarItem({ icon, label, isActive, isLocked, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`
                w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left
                transition-colors duration-150
                ${isActive
                    ? "bg-black/5 text-black font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-black"
                }
            `}
        >
            <FontAwesomeIcon icon={icon} className={`text-xs w-4 ${isActive ? "text-black" : "text-gray-400"}`} />
            <span className="flex-1 truncate">{label}</span>
            {isLocked && (
                <FontAwesomeIcon icon={faLock} className="text-gray-400 text-[10px]" />
            )}
        </button>
    )
}

export default function FileManager({ documents, onReplace, loadingDocId }) {
    const [activeSection, setActiveSection] = useState("proposal")

    if (!documents) return null

    const { proposal, laporan_ganjil, laporan_genap } = documents

    const sections = [
        {
            key: "proposal",
            label: "Proposal",
            icon: faFileLines,
            isLocked: proposal?.is_locked,
            data: proposal,
        },
        ...(laporan_ganjil ? [{
            key: "laporan_ganjil",
            label: "Laporan Ganjil",
            icon: faFilePdf,
            isLocked: laporan_ganjil.is_locked,
            data: laporan_ganjil,
            laporanId: laporan_ganjil.laporan_id,
        }] : []),
        ...(laporan_genap ? [{
            key: "laporan_genap",
            label: "Laporan Genap",
            icon: faFilePdf,
            isLocked: laporan_genap.is_locked,
            data: laporan_genap,
            laporanId: laporan_genap.laporan_id,
        }] : []),
    ]

    const currentSection = sections.find(s => s.key === activeSection)

    const renderProposalDocs = (data) => (
        <div className="flex flex-col gap-1">
            <FileRow
                doc={data.dokumen_proposal}
                label="Proposal PDF"
                isLocked={data.is_locked}
                onReplace={onReplace}
                loading={loadingDocId === data.dokumen_proposal?.dokumen_id}
            />
            <FileRow
                doc={data.generated_template}
                label="Template DOCX"
                isLocked={true}
                onReplace={null}
                loading={false}
            />
            <FileRow
                doc={data.pengumuman_surat_tugas}
                label="Pengumuman Surat Tugas"
                isLocked={true}
                onReplace={null}
                loading={false}
            />
        </div>
    )

    const renderLaporanDocs = (data, laporanId) => (
        <div className="flex flex-col gap-1">
            <FileRow
                doc={data.dokumen_laporan}
                label="Dokumen Laporan"
                isLocked={data.is_locked}
                onReplace={onReplace}
                loading={loadingDocId === data.dokumen_laporan?.dokumen_id}
                meta={{
                    documentable_type: "App\\Models\\Laporan",
                    documentable_id: laporanId,
                    jenis_dokumen: "Dokumen Laporan",
                }}
            />
            <FileRow
                doc={data.generated_laporan_akhir}
                label="Laporan Akhir"
                isLocked={data.is_locked}
                onReplace={onReplace}
                loading={loadingDocId === data.generated_laporan_akhir?.dokumen_id}
                meta={{
                    documentable_type: "App\\Models\\Laporan",
                    documentable_id: laporanId,
                    jenis_dokumen: "Laporan Akhir",
                }}
            />
        </div>
    )

    return (
        <div className="flex rounded-xl border overflow-hidden bg-white" style={{ minHeight: 320 }}>
            {/* Sidebar */}
            <div className="w-48 border-r bg-gray-50/50 flex flex-col py-2 px-2 gap-0.5">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">
                    Dokumen
                </span>
                {sections.map(section => (
                    <SidebarItem
                        key={section.key}
                        icon={section.icon}
                        label={section.label}
                        isLocked={section.isLocked}
                        isActive={activeSection === section.key}
                        onClick={() => setActiveSection(section.key)}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-3">
                {currentSection && (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon
                                    icon={currentSection.icon}
                                    className="text-sm text-gray-500"
                                />
                                <span className={`text-sm font-medium ${currentSection.isLocked ? "text-gray-600" : "text-gray-700"}`}>
                                    {currentSection.label}
                                </span>
                                {currentSection.isLocked && (
                                    <FontAwesomeIcon icon={faLock} className="text-gray-400 text-[10px]" />
                                )}
                            </div>
                            {currentSection.isLocked && currentSection.key !== "proposal" && (
                                <Badge color="amber" size="xs" variant="pill" intensity="light" className="flex items-center gap-1">
                                    Ditutup
                                </Badge>
                            )}
                        </div>

                        {currentSection.key === "proposal"
                            ? renderProposalDocs(currentSection.data)
                            : renderLaporanDocs(currentSection.data, currentSection.laporanId)
                        }
                    </div>
                )}
            </div>
        </div>
    )
}
