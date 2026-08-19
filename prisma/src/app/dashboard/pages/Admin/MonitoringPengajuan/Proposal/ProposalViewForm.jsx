"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faX, faSpinner, faEye, faDownload, faFilePdf } from '@fortawesome/free-solid-svg-icons'
import { AnimatePresence, motion } from "framer-motion"

import LoadingBar from "@/app/component/AppLoader/LoadingBar"

import { generatePDFPreview, getPDFPageCount, getFileMeta, estimateReadingTime } from "@/app/component/Libraries/utils/pdfPreview"

import { useUserStore } from "@/app/stores/useUserStore";
import Button from "@/app/component/Inputs/Button"
import { Field, Section } from "@/app/component/Display/SectionField"
import Badge from "@/app/component/Display/Badge"

function formatRupiah(value) {
    if (!value && value !== 0) return "—"
    const num = Number(value)
    if (isNaN(num)) return "—"
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}

export default function FormProposalViewAdmin({ close, data, triggerPenugasan, triggerTolak, handleKetuaDecideSeleksi, handleStaffDecideSeleksi, handleViewSeleksiRejection, handleTerimaPengajuan }){
    const [preview, setPreview] = useState(null)
    const [fileMeta, setFileMeta] = useState(null)
    const [estimateTime, setEstimateTime] = useState(null)
    const [pageCount, setPageCount] = useState(0)
    const [loadingFile, setLoadingFile] = useState(false)
    const [existingFile, setExistingFile] = useState(null)
    const [localFileUrl, setLocalFileUrl] = useState("")

    const user = useUserStore(state => state.user)
    const MotionLoadingBar = motion.create(LoadingBar);

    const isKetua = user?.role === "Ketua LPPM"
    const isStaff = user?.role === "Staff LPPM"

    const ketuaAlreadyDecided = data.ketua_seleksi_approved === true || data.status === "Ditolak"
    const isFinished = data.status === "Proposal Diterima" || data.status === "Dalam pengerjaan"
    const staffAlreadyDecided = data.staff_seleksi_approved === true || data.has_pending_seleksi_rejection

    const ketuaCanDecide = isKetua && !ketuaAlreadyDecided && data.status === "Menunggu review dari Ketua LPPM"
    const staffCanDecide = isStaff && !staffAlreadyDecided && data.status === "Menunggu review Staff LPPM"

    const fetchFileFromUrl = async (url) => {
        const res = await fetch(url)
        const blob = await res.blob()
        const filename = url.split("/").pop()
        return new File([blob], filename, { type: blob.type })
    }

    const openDocument = () => {
        window.open(localFileUrl)
    }

    const loadExistingFile = async (url, name) => {
        setLoadingFile(true)
        const file = await fetchFileFromUrl(url)
        setExistingFile(file)
        const meta = getFileMeta(file)
        meta.name = name
        setFileMeta(meta)
        const preview = await generatePDFPreview(file)
        setPreview(preview)
        const pages = await getPDFPageCount(file)
        setPageCount(pages)
        const reading = estimateReadingTime(file, pages)
        setEstimateTime(reading)
        setLoadingFile(false)
    }

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    useEffect(() => {
        if (data?.dokumen) {
            let doc = data.dokumen.find((d) => d.jenis_dokumen == 'Dokumen Proposal')
            if (!doc) return
            loadExistingFile(doc.file_url, doc.current_version.nama_file)
            setLocalFileUrl(doc.file_url)
        }
    }, [data])

    const ganjilMembers = [
        ...(data.member_dosen_proposal || []).filter(m => m.semester === 'Ganjil').map(m => ({ ...m, role: 'Dosen' })),
        ...(data.member_mhswa_proposal || []).filter(m => m.semester === 'Ganjil').map(m => ({ ...m, role: 'Mahasiswa' })),
        ...(data.member_kolab_proposal || []).filter(m => m.semester === 'Ganjil').map(m => ({ ...m, role: 'Kolaborator' })),
    ]

    const genapMembers = [
        ...(data.member_dosen_proposal || []).filter(m => m.semester === 'Genap').map(m => ({ ...m, role: 'Dosen' })),
        ...(data.member_mhswa_proposal || []).filter(m => m.semester === 'Genap').map(m => ({ ...m, role: 'Mahasiswa' })),
        ...(data.member_kolab_proposal || []).filter(m => m.semester === 'Genap').map(m => ({ ...m, role: 'Kolaborator' })),
    ]

    const totalGanjil = Number(data.ra_biaya_penelitian_gan || 0) + Number(data.ra_biaya_publikasi_gan || 0) + Number(data.ra_insentif_gan || 0)
    const totalGenap = Number(data.ra_biaya_penelitian_gen || 0) + Number(data.ra_biaya_publikasi_gen || 0) + Number(data.ra_insentif_gen || 0)
    const totalOverall = totalGanjil + totalGenap

    return (
        <motion.div
            key="formModal"
            initial={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0)" }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(3px)" }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 will-change-auto"
        >
             <AnimatePresence mode="wait">
                <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-4xl bg-white rounded-xl max-h-[90vh] flex flex-col drop-shadow-lg will-change-auto"
                >
                    <div className="flex items-start justify-between p-6 pb-0">
                        <h3 className="text-xl font-medium">Cek Proposal</h3>
                        <button onClick={() => close('this')} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <FontAwesomeIcon icon={faX} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">

                        {/* Rejection Request Panel - Ketua */}
                        {data.has_pending_seleksi_rejection && isKetua && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <p className="font-medium text-red-800">Permintaan Penolakan dari Staff LPPM</p>
                                </div>
                                <div
                                    className="prose prose-sm max-w-none text-red-700 mb-3"
                                    dangerouslySetInnerHTML={{ __html: data.pending_seleksi_rejection_reason }}
                                />
                                <div className="flex gap-2">
                                    <Button 
                                        fontSize="text-sm" 
                                        onClick={() => handleKetuaDecideSeleksi({ proposal_id: data.proposal_id, decision: "accept" })}
                                        variant="success"
                                    >
                                        Setujui
                                    </Button>
                                    <Button 
                                        fontSize="text-sm" 
                                        onClick={() => handleKetuaDecideSeleksi({ proposal_id: data.proposal_id, decision: "reject" })}
                                        variant="danger"
                                    >
                                        Tolak
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Rejection by Ketua - Staff */}
                        {data.has_rejected_by_ketua_seleksi && isStaff && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <p className="font-medium text-red-800">Proposal Ditolak oleh Ketua LPPM</p>
                                </div>
                                <div
                                    className="prose prose-sm max-w-none text-red-700 mb-3"
                                    dangerouslySetInnerHTML={{ __html: data.rejected_by_ketua_seleksi_reason }}
                                />
                                <div className="flex gap-2">
                                    <Button 
                                        fontSize="text-sm" 
                                        onClick={() => handleStaffDecideSeleksi(data, 'accept')}
                                        variant="success"
                                    >
                                        Setuju Ketua
                                    </Button>
                                    <Button 
                                        fontSize="text-sm" 
                                        onClick={() => handleStaffDecideSeleksi(data, 'reject')}
                                        variant="danger"
                                    >
                                        Tolak Keputusan Ketua
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* A. Informasi Pengajuan */}
                        <Section title="Informasi Pengajuan">
                            <div className="grid grid-cols-2 gap-5">
                                <Field label="Judul" value={data.judul} />
                                <Field label="Jenis Penelitian (Ganjil)" value={data.jenis_penelitian_gan} />
                                <Field label="Jenis Penelitian (Genap)" value={data.jenis_penelitian_gen} />
                                <Field label="Topik Penelitian" value={data.topik_penelitian} />
                                <Field label="Bidang Ilmu" value={data.bidang_ilmu} />
                                <Field label="Fokus SDGs" value={data.fokus_sdgs} />
                                <Field label="Kegiatan" value={data.nama_kegiatan} />
                                <Field label="Skema Pendanaan" value={data.skema} />
                                <Field label="Sumber Skema" value={data.sumber_skema} />
                                <Field label="Tanggal Pengajuan" value={data.tgl_pengajuan} />
                                <Field label="Status" value={data.status} />
                            </div>
                        </Section>

                        {/* B. Ketua Peneliti */}
                        <Section title="Ketua Peneliti">
                            <div className="grid grid-cols-2 gap-5">
                                <Field label="Nama" value={data.dosen?.nama} />
                                <Field label="NIDN" value={data.dosen?.nidn} />
                                <Field label="Email" value={data.dosen?.email} />
                                <Field label="No. HP" value={data.dosen?.no_hp} />
                            </div>
                        </Section>

                        {/* C. Anggota Penelitian - Ganjil */}
                        <Section title="Anggota Penelitian — Ganjil">
                            {ganjilMembers.length === 0 ? (
                                <span className="text-sm text-gray-400 italic">Tidak ada data anggota.</span>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-200 text-left text-gray-500">
                                                <th className="pb-2 font-medium">No</th>
                                                <th className="pb-2 font-medium">Nama</th>
                                                <th className="pb-2 font-medium">NIDN / NUPTK</th>
                                                <th className="pb-2 font-medium">Peran</th>
                                                <th className="pb-2 font-medium">TTJP</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ganjilMembers.map((m, i) => (
                                                <tr key={i} className="border-b border-gray-100">
                                                    <td className="py-2.5 text-gray-600">{i + 1}</td>
                                                    <td className="py-2.5">{m.nama}</td>
                                                    <td className="py-2.5 text-gray-500">{m.unique_id || m.user_id || m.mhswa_id || m.kolab_id || "—"}</td>
                                                    <td className="py-2.5">
                                                        <Badge color={m.role === 'Dosen' ? 'blue' : m.role === 'Mahasiswa' ? 'green' : 'purple'} intensity="light">
                                                            {m.role}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-2.5 text-gray-500">{m.ttjp || "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Section>

                        {/* C2. Anggota Penelitian - Genap */}
                        <Section title="Anggota Penelitian — Genap">
                            {genapMembers.length === 0 ? (
                                <span className="text-sm text-gray-400 italic">Tidak ada data anggota.</span>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-200 text-left text-gray-500">
                                                <th className="pb-2 font-medium">No</th>
                                                <th className="pb-2 font-medium">Nama</th>
                                                <th className="pb-2 font-medium">NIDN / NUPTK</th>
                                                <th className="pb-2 font-medium">Peran</th>
                                                <th className="pb-2 font-medium">TTJP</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {genapMembers.map((m, i) => (
                                                <tr key={i} className="border-b border-gray-100">
                                                    <td className="py-2.5 text-gray-600">{i + 1}</td>
                                                    <td className="py-2.5">{m.nama}</td>
                                                    <td className="py-2.5 text-gray-500">{m.unique_id || m.user_id || m.mhswa_id || m.kolab_id || "—"}</td>
                                                    <td className="py-2.5">
                                                        <Badge color={m.role === 'Dosen' ? 'blue' : m.role === 'Mahasiswa' ? 'green' : 'purple'} intensity="light">
                                                            {m.role}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-2.5 text-gray-500">{m.ttjp || "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Section>

                        {/* D. Rencana Penelitian — Ganjil */}
                        <Section title="Rencana Penelitian — Ganjil">
                            <div className="grid grid-cols-2 gap-5">
                                <Field label="Rencana Judul Publikasi" value={data.rencana_judul_publikasi_gan} />
                                <Field label="Target Publikasi" value={data.target_publikasi_gan} />
                                <div className="col-span-2">
                                    <Field label="Metode Penelitian" value={data.metopen_gan} />
                                </div>
                                <Field label="Unit Analisis" value={data.unit_analisis_gan} />
                            </div>
                        </Section>

                        {/* E. Rencana Penelitian — Genap */}
                        <Section title="Rencana Penelitian — Genap">
                            <div className="grid grid-cols-2 gap-5">
                                <Field label="Rencana Judul Publikasi" value={data.rencana_judul_publikasi_gen} />
                                <Field label="Target Publikasi" value={data.target_publikasi_gen} />
                                <div className="col-span-2">
                                    <Field label="Metode Penelitian" value={data.metopen_gen} />
                                </div>
                                <Field label="Unit Analisis" value={data.unit_analisis_gen} />
                            </div>
                        </Section>

                        {/* F. Rencana Anggaran */}
                        <Section title="Rencana Anggaran">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="flex flex-col gap-3 border border-gray-200 rounded-md p-4 bg-gray-50">
                                    <span className="text-xs font-medium text-gray-500 uppercase">Semester Ganjil</span>
                                    <Field label="Biaya Penelitian" value={formatRupiah(data.ra_biaya_penelitian_gan)} />
                                    <Field label="Biaya Publikasi" value={formatRupiah(data.ra_biaya_publikasi_gan)} />
                                    <Field label="Insentif" value={formatRupiah(data.ra_insentif_gan)} />
                                    <div className="border-t border-gray-200 pt-3 mt-1">
                                        <Field label="Subtotal" value={formatRupiah(totalGanjil)} />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 border border-gray-200 rounded-md p-4 bg-gray-50">
                                    <span className="text-xs font-medium text-gray-500 uppercase">Semester Genap</span>
                                    <Field label="Biaya Penelitian" value={formatRupiah(data.ra_biaya_penelitian_gen)} />
                                    <Field label="Biaya Publikasi" value={formatRupiah(data.ra_biaya_publikasi_gen)} />
                                    <Field label="Insentif" value={formatRupiah(data.ra_insentif_gen)} />
                                    <div className="border-t border-gray-200 pt-3 mt-1">
                                        <Field label="Subtotal" value={formatRupiah(totalGenap)} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end border-t border-gray-200 pt-4 mt-3">
                                <div className="text-right">
                                    <span className="text-xs text-gray-500 block">Total Rencana Anggaran</span>
                                    <span className="text-lg font-semibold text-gray-800">{formatRupiah(totalOverall)}</span>
                                </div>
                            </div>
                        </Section>

                        {/* G. Institusi Mitra */}
                        <Section title="Institusi Mitra">
                            <Field label="Institusi Mitra" value={data.institusi_mitra || "Tidak ada institusi mitra."} />
                        </Section>

                        {/* H. Kontribusi Ilmu */}
                        <Section title="Kontribusi Ilmu / Mata Kuliah">
                            <div className="flex flex-col gap-4">
                                <div>
                                    <span className="text-xs text-gray-500 block mb-1">Kontribusi Ilmu / Mata Kuliah</span>
                                    {data.kontribusi_ilmu_makul ? (
                                        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: data.kontribusi_ilmu_makul }} />
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">—</span>
                                    )}
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 block mb-1">Kontribusi PKM</span>
                                    {data.kontribusi_pkm ? (
                                        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: data.kontribusi_pkm }} />
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">—</span>
                                    )}
                                </div>
                            </div>
                        </Section>

                        {/* I. Rencana Luaran */}
                        <Section title="Rencana Luaran">
                            {data.rencana_luaran ? (
                                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: data.rencana_luaran }} />
                            ) : (
                                <span className="text-sm text-gray-400 italic">Tidak ada data rencana luaran.</span>
                            )}
                        </Section>

                        {/* J. Dokumen Proposal */}
                        <Section title="Dokumen Proposal">
                            <div className="flex flex-col gap-4">
                                {loadingFile ? (
                                    <div className="flex items-center justify-center gap-3 py-8">
                                        <FontAwesomeIcon icon={faSpinner} className="text-2xl text-gray-400 animate-spin" />
                                        <span className="text-sm text-gray-500">Memuat dokumen...</span>
                                    </div>
                                ) : existingFile ? (
                                    <div className="flex items-start gap-5">
                                        <div 
                                            className="relative w-40 h-52 flex-shrink-0 border border-gray-200 rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => openDocument()}
                                        >
                                            <Image
                                                src={preview}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center transition-colors">
                                                <FontAwesomeIcon icon={faEye} className="text-white opacity-0 hover:opacity-100 text-xl drop-shadow" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <p className="font-medium text-sm">{fileMeta?.name}</p>
                                            <p className="text-xs text-gray-500">Ukuran: {fileMeta?.formattedSize}</p>
                                            <p className="text-xs text-gray-500">Halaman: {pageCount}</p>
                                            <p className="text-xs text-gray-500">Estimasi baca: {estimateTime?.label || "—"}</p>
                                            <a 
                                                href={localFileUrl} 
                                                download 
                                                className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                                            >
                                                <FontAwesomeIcon icon={faDownload} className="text-xs" />
                                                Download
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-sm text-gray-400 italic">Tidak ada dokumen proposal.</span>
                                )}
                            </div>
                        </Section>
                    </div>

                    {/* Action Buttons */}
                    <div className="border-t border-gray-200 p-4 bg-white sticky bottom-0">
                        <div className="flex gap-2 justify-end">
                            {isKetua && !ketuaAlreadyDecided && !isFinished && (
                                <Button 
                                    fontSize="text-sm" 
                                    onClick={() => triggerTolak(data)} 
                                    variant="danger"
                                >
                                    Tolak Pengajuan
                                </Button>
                            )}

                            <a 
                                href={localFileUrl} 
                                download 
                                className="bg-white hover:bg-foreground text-foreground/90 hover:text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors duration-300 ease-in-out cursor-pointer border-2 border-foreground/80 flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faDownload} />
                                Download
                            </a> 
                            
                            {isKetua && !ketuaAlreadyDecided && !isFinished && (
                                <Button 
                                    fontSize="text-sm" 
                                    onClick={() => handleTerimaPengajuan(data)}
                                >
                                    Terima Pengajuan
                                </Button>
                            )}

                            {!isKetua && !isFinished && (
                                <Button 
                                    fontSize="text-sm" 
                                    onClick={() => triggerPenugasan(data)}
                                >
                                    Tugaskan Reviewer
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </motion.div>
    )
}
